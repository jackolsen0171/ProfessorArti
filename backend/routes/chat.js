const express = require('express');
const router = express.Router();
const openRouterService = require('../services/openai');
const chromaService = require('../services/chromadb');

// POST /api/chat - Send message and get AI response
router.post('/', async (req, res) => {
  try {
    const { message, professorId, conversationId } = req.body;
    
    if (!message || !professorId) {
      return res.status(400).json({
        error: 'Missing required fields: message and professorId'
      });
    }

    console.log(`🤖 Chat request: ${professorId} - "${message}"`);

    // Search for relevant documents in ChromaDB
    let context = [];
    try {
      // Semantic search for relevant context
      const searchResults = await chromaService.searchSimilar(message, 3);
      context = searchResults.map(result => ({
        id: result.id,
        content: result.document,
        title: result.metadata?.title || 'Document',
        similarity: result.distance
      }));
      
      if (context.length > 0) {
        console.log(`📚 Found ${context.length} relevant documents for context`);
      }
    } catch (contextError) {
      console.warn('⚠️ Failed to search documents for context:', contextError.message);
      // Continue without context - don't fail the chat
    }

    // Generate AI response with context
    const aiResponse = await openRouterService.generateResponse(
      message, 
      professorId,
      context,
      [] // TODO: Add conversation history
    );

    console.log(`✅ AI response generated for ${professorId}`);

    res.json({
      success: true,
      data: {
        ...aiResponse,
        conversationId: conversationId || Date.now().toString()
      }
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to process chat message',
      message: error.message
    });
  }
});

// GET /api/chat/history/:conversationId - Get conversation history
router.get('/history/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    // TODO: Implement conversation history retrieval from database
    const mockHistory = [
      {
        id: '1',
        message: 'Hello, Professor!',
        sender: 'user',
        timestamp: new Date(Date.now() - 60000).toISOString()
      },
      {
        id: '2', 
        message: 'Hello! How can I help you today?',
        sender: 'assistant',
        professorId: 'ai-tutor',
        timestamp: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      data: {
        conversationId,
        messages: mockHistory
      }
    });

  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({
      error: 'Failed to retrieve chat history',
      message: error.message
    });
  }
});

// GET /api/chat/professors - Get available professors/personas
router.get('/professors', async (req, res) => {
  try {
    // Get professor personas from the AI service
    const professorPersonas = Object.keys(openRouterService.personas).map(id => {
      const persona = openRouterService.personas[id];
      return {
        id,
        name: persona.name,
        specialty: getSpecialtyFromId(id),
        description: getDescriptionFromId(id),
        avatar: getAvatarFromId(id)
      };
    });

    res.json({
      success: true,
      data: professorPersonas
    });

  } catch (error) {
    console.error('Professors error:', error);
    res.status(500).json({
      error: 'Failed to retrieve professors',
      message: error.message
    });
  }
});

// Helper functions for professor data
function getSpecialtyFromId(id) {
  const specialties = {
    'ai-tutor': 'General Knowledge',
    'science-prof': 'Sciences',
    'history-prof': 'History & Culture'
  };
  return specialties[id] || 'General Knowledge';
}

function getDescriptionFromId(id) {
  const descriptions = {
    'ai-tutor': 'A helpful AI assistant ready to explain any topic',
    'science-prof': 'Expert in physics, chemistry, biology, and mathematics',
    'history-prof': 'Specialist in world history, cultures, and civilizations'
  };
  return descriptions[id] || 'AI assistant ready to help';
}

function getAvatarFromId(id) {
  const avatars = {
    'ai-tutor': '🤖',
    'science-prof': '🧪',
    'history-prof': '📚'
  };
  return avatars[id] || '🤖';
}

module.exports = router;