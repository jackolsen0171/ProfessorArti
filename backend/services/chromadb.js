const { ChromaClient } = require('chromadb');

class ChromaDBService {
  constructor() {
    this.client = null;
    this.collections = {
      documents: null,
      conversations: null
    };
    this.initialized = false;
  }

  async initialize() {
    try {
      if (this.initialized) {
        return;
      }

      // Initialize ChromaDB client
      this.client = new ChromaClient({
        path: process.env.CHROMA_URL || 'http://localhost:8002'
      });

      // Create or get collections
      this.collections.documents = await this.client.getOrCreateCollection({
        name: 'professor_arti_documents',
        metadata: { description: 'Document embeddings for Professor Arti' }
      });

      this.collections.conversations = await this.client.getOrCreateCollection({
        name: 'professor_arti_conversations',
        metadata: { description: 'Conversation history embeddings' }
      });

      this.initialized = true;
      console.log('✅ ChromaDB service initialized successfully');

    } catch (error) {
      console.error('❌ ChromaDB initialization error:', error);
      throw new Error(`Failed to initialize ChromaDB: ${error.message}`);
    }
  }

  async addDocument(documentId, content, metadata = {}) {
    try {
      await this.ensureInitialized();

      const result = await this.collections.documents.add({
        ids: [documentId],
        documents: [content],
        metadatas: [{
          ...metadata,
          timestamp: new Date().toISOString(),
          type: 'document'
        }]
      });

      console.log(`📄 Document added to ChromaDB: ${documentId}`);
      return result;

    } catch (error) {
      console.error('Document addition error:', error);
      throw new Error(`Failed to add document: ${error.message}`);
    }
  }

  async searchDocuments(query, limit = 10, filter = null) {
    try {
      await this.ensureInitialized();

      const queryParams = {
        queryTexts: [query],
        nResults: limit
      };

      // Only add where clause if filter is provided and not empty
      if (filter && Object.keys(filter).length > 0) {
        queryParams.where = filter;
      }

      const results = await this.collections.documents.query(queryParams);

      // Return documents in the format expected by calendar route
      const documents = results.documents[0] || [];
      const metadatas = results.metadatas[0] || [];
      const ids = results.ids[0] || [];
      
      return documents.map((content, index) => ({
        content: content,
        metadata: metadatas[index] || {},
        id: ids[index] || `doc_${index}`
      }));

    } catch (error) {
      console.error('Document search error:', error);
      throw new Error(`Failed to search documents: ${error.message}`);
    }
  }

  async searchSimilar(query, limit = 10, filter = {}) {
    try {
      await this.ensureInitialized();

      // Only include 'where' if filter has content
      const queryParams = {
        queryTexts: [query],
        nResults: limit
      };
      
      // Add where clause only if filter is not empty
      if (filter && Object.keys(filter).length > 0) {
        queryParams.where = filter;
      }

      const results = await this.collections.documents.query(queryParams);

      // Transform to format expected by chat route
      const documents = results.documents[0] || [];
      const metadatas = results.metadatas[0] || [];
      const distances = results.distances[0] || [];
      const ids = results.ids[0] || [];

      return documents.map((document, index) => ({
        id: ids[index],
        document: document,
        metadata: metadatas[index] || {},
        distance: distances[index] || 1.0
      }));

    } catch (error) {
      console.error('Similar search error:', error);
      throw new Error(`Failed to search similar documents: ${error.message}`);
    }
  }

  async addConversation(conversationId, message, metadata = {}) {
    try {
      await this.ensureInitialized();

      const messageId = `${conversationId}_${Date.now()}`;
      
      const result = await this.collections.conversations.add({
        ids: [messageId],
        documents: [message],
        metadatas: [{
          ...metadata,
          conversationId,
          timestamp: new Date().toISOString(),
          type: 'conversation'
        }]
      });

      return { messageId, ...result };

    } catch (error) {
      console.error('Conversation addition error:', error);
      throw new Error(`Failed to add conversation: ${error.message}`);
    }
  }

  async searchConversations(query, conversationId = null, limit = 5) {
    try {
      await this.ensureInitialized();

      const filter = conversationId ? { conversationId } : {};

      const results = await this.collections.conversations.query({
        queryTexts: [query],
        nResults: limit,
        where: filter
      });

      return {
        documents: results.documents[0] || [],
        metadatas: results.metadatas[0] || [],
        distances: results.distances[0] || [],
        ids: results.ids[0] || []
      };

    } catch (error) {
      console.error('Conversation search error:', error);
      throw new Error(`Failed to search conversations: ${error.message}`);
    }
  }

  async deleteDocument(documentId) {
    try {
      await this.ensureInitialized();

      await this.collections.documents.delete({
        ids: [documentId]
      });

      console.log(`🗑️ Document deleted from ChromaDB: ${documentId}`);
      return true;

    } catch (error) {
      console.error('Document deletion error:', error);
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

  async getCollectionStats() {
    try {
      await this.ensureInitialized();

      const documentsCount = await this.collections.documents.count();
      const conversationsCount = await this.collections.conversations.count();

      return {
        documents: documentsCount,
        conversations: conversationsCount,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Stats retrieval error:', error);
      throw new Error(`Failed to get collection stats: ${error.message}`);
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
      const stats = await this.getCollectionStats();
      
      return {
        status: 'healthy',
        client: 'connected',
        collections: {
          documents: 'ready',
          conversations: 'ready'
        },
        stats,
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
const chromaDBService = new ChromaDBService();

module.exports = chromaDBService;