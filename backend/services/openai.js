const OpenAI = require('openai');

class OpenRouterService {
  constructor() {
    this.client = null;
    this.initialized = false;
    this.apiKey = process.env.OPENROUTER_API_KEY;
    
    // Professor personas
    this.personas = {
      'ai-tutor': {
        name: 'AI Tutor',
        systemPrompt: `You are a helpful AI tutor named "AI Tutor". You excel at explaining complex concepts in simple terms, asking clarifying questions, and providing step-by-step guidance. You are patient, encouraging, and adapt your teaching style to the student's level of understanding.`
      },
      'science-prof': {
        name: 'Dr. Science',
        systemPrompt: `You are Dr. Science, an expert professor specializing in physics, chemistry, biology, and mathematics. You provide scientifically accurate information, use real-world examples, and encourage scientific thinking. You explain complex scientific concepts clearly and relate them to everyday phenomena.`
      },
      'history-prof': {
        name: 'Prof. History',
        systemPrompt: `You are Prof. History, a distinguished historian specializing in world history, cultures, and civilizations. You provide rich historical context, draw connections between past and present, and tell engaging stories that bring history to life. You encourage critical thinking about historical events and their impact.`
      }
    };
  }

  async initialize() {
    try {
      if (this.initialized) {
        return;
      }

      if (!this.apiKey) {
        console.warn('⚠️ OpenRouter API key not provided. AI features will be limited.');
        return;
      }

      this.client = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: this.apiKey,
        defaultHeaders: {
          'HTTP-Referer': 'https://professorarti.com',
          'X-Title': 'Professor Arti'
        }
      });

      // Test the connection
      await this.client.models.list();
      
      this.initialized = true;
      console.log('✅ OpenRouter service initialized successfully');

    } catch (error) {
      console.error('❌ OpenRouter initialization error:', error);
      throw new Error(`Failed to initialize OpenRouter: ${error.message}`);
    }
  }

  async generateResponse(message, professorId, context = [], conversationHistory = []) {
    try {
      await this.ensureInitialized();

      if (!this.client) {
        return this.getMockResponse(message, professorId);
      }

      const persona = this.personas[professorId] || this.personas['ai-tutor'];
      
      // Build messages array
      const messages = [
        {
          role: 'system',
          content: persona.systemPrompt
        }
      ];

      // Add conversation history (last 10 messages to manage token limits)
      const recentHistory = conversationHistory.slice(-10);
      messages.push(...recentHistory);

      // Add context from documents if available
      if (context.length > 0) {
        const contextText = context.map(doc => doc.content).join('\n\n');
        messages.push({
          role: 'system',
          content: `Relevant context from documents:\n${contextText}`
        });
      }

      // Add current user message
      messages.push({
        role: 'user',
        content: message
      });

      const completion = await this.client.chat.completions.create({
        model: 'openai/gpt-4o-mini',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        throw new Error('No response generated from OpenAI');
      }

      return {
        id: Date.now().toString(),
        message: response,
        professorId,
        persona: persona.name,
        timestamp: new Date().toISOString(),
        sources: context.map(doc => ({
          id: doc.id,
          title: doc.title || 'Document',
          relevance: doc.similarity || 0
        })),
        tokenUsage: {
          prompt: completion.usage?.prompt_tokens || 0,
          completion: completion.usage?.completion_tokens || 0,
          total: completion.usage?.total_tokens || 0
        }
      };

    } catch (error) {
      console.error('OpenAI response generation error:', error);
      
      // Fallback to mock response
      return this.getMockResponse(message, professorId, error.message);
    }
  }

  getMockResponse(message, professorId, errorContext = null) {
    const persona = this.personas[professorId] || this.personas['ai-tutor'];
    
    let response = `Hello! I'm ${persona.name}. `;
    
    if (errorContext) {
      response += `I'm currently experiencing technical difficulties (${errorContext}), but I can still help! `;
    }
    
    response += `You asked: "${message}". `;
    
    // Add persona-specific mock responses
    switch (professorId) {
      case 'science-prof':
        response += `This is a fascinating scientific question! While I work on getting my full capabilities back online, I'd suggest exploring the fundamental principles behind your question. Science is all about observation, hypothesis, and experimentation.`;
        break;
      case 'history-prof':
        response += `What an interesting historical inquiry! History often provides valuable context for understanding our present. I encourage you to consider the timeline of events and the various perspectives involved.`;
        break;
      default:
        response += `This is a great question for learning! I encourage you to break it down into smaller parts and think about what you already know about this topic.`;
    }

    return {
      id: Date.now().toString(),
      message: response,
      professorId,
      persona: persona.name,
      timestamp: new Date().toISOString(),
      sources: [],
      mock: true,
      errorContext
    };
  }

  async generateEmbeddings(text) {
    try {
      await this.ensureInitialized();

      if (!this.client) {
        throw new Error('OpenRouter client not available for embeddings');
      }

      const response = await this.client.embeddings.create({
        model: 'openai/text-embedding-ada-002',
        input: text
      });

      return response.data[0].embedding;

    } catch (error) {
      console.error('Embedding generation error:', error);
      throw new Error(`Failed to generate embeddings: ${error.message}`);
    }
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  async healthCheck() {
    try {
      await this.ensureInitialized();
      
      if (!this.client) {
        return {
          status: 'limited',
          message: 'API key not provided - using mock responses',
          timestamp: new Date().toISOString()
        };
      }

      // Test with a simple API call
      await this.client.models.list();
      
      return {
        status: 'healthy',
        client: 'connected',
        personas: Object.keys(this.personas),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create singleton instance
const openRouterService = new OpenRouterService();

module.exports = openRouterService;