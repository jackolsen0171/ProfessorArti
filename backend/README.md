# Professor Arti Backend

Express.js API server for Professor Arti knowledge visualization platform.

## 🚀 Quick Start

```bash
# Start backend server only
npm run backend

# Start both frontend and backend
npm run dev

# Development mode with auto-restart
npm run backend:dev
```

## 📋 API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Chat Interface
- `POST /api/chat` - Send message to AI professor
- `GET /api/chat/history/:conversationId` - Get conversation history
- `GET /api/chat/professors` - List available professors

### Document Management
- `POST /api/documents/upload` - Upload documents (50MB limit)
- `GET /api/documents` - List uploaded documents
- `DELETE /api/documents/:id` - Delete document
- `POST /api/documents/search` - Semantic search in documents

### Graph Data
- `GET /api/graph/data` - Get graph nodes and links
- `GET /api/graph/node/:id` - Get node details
- `POST /api/graph/update` - Update graph structure
- `GET /api/graph/search?q=query` - Search graph nodes

## 🏗️ Architecture

```
backend/
├── server.js              # Express app setup
├── routes/
│   ├── chat.js            # AI chat endpoints
│   ├── documents.js       # File upload/processing
│   └── graph.js           # Graph data operations
├── services/
│   ├── chromadb.js        # Vector database operations
│   └── openai.js          # AI service integration
└── uploads/               # File upload directory
```

## ⚙️ Configuration

### Environment Variables
- `PORT` - Server port (default: 5001)
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `CHROMA_URL` - ChromaDB server URL (default: http://localhost:8000)

### CORS Configuration
- Frontend origin: `http://localhost:3000`
- Credentials enabled for secure requests

## 🔧 Current Status

### ✅ Implemented
- Express server with CORS and middleware
- All API route handlers with mock responses
- ChromaDB service layer (ready for integration)
- OpenAI service layer (ready for integration)
- File upload with multer (PDF, DOC, TXT, MD support)
- Error handling and logging

### 🚧 TODO
- Connect ChromaDB for real vector operations
- Integrate OpenAI API for actual AI responses
- Implement conversation persistence
- Add authentication/authorization
- Set up proper database for metadata storage

## 🧪 Testing

```bash
# Test health endpoint
curl http://localhost:5001/api/health

# Test chat endpoint
curl -X POST -H "Content-Type: application/json" \
  -d '{"message":"Hello!","professorId":"ai-tutor"}' \
  http://localhost:5001/api/chat

# Test graph data
curl http://localhost:5001/api/graph/data
```

## 📦 Dependencies

### Core
- `express` - Web framework
- `cors` - Cross-origin resource sharing
- `multer` - File upload handling

### AI & Data
- `openai` - OpenAI API client
- `chromadb` - Vector database client

### Development
- `nodemon` - Auto-restart for development
- `concurrently` - Run multiple scripts

## 🔐 Security Notes

- File upload size limited to 50MB
- CORS restricted to localhost:3000
- Error messages sanitized for production
- Input validation on all endpoints

---

**Next Steps**: Integrate real AI and vector database functionality to replace mock responses.