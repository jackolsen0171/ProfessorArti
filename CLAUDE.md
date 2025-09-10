# Professor Arti - Claude Code Instructions

## Project Overview
Professor Arti is an interactive knowledge visualization and chat platform combining D3.js force-directed graphs with AI-powered conversational interfaces. Users explore interconnected knowledge networks visually, then engage with AI "professors" for detailed explanations.

## ⚠️ CRITICAL: KNOWLEDGE FIREWALL - MANDATORY EXECUTION ORDER

```
┌─────────────────────────────────────────────────────────────┐
│                    KNOWLEDGE FIREWALL                       │
│                                                             │
│ □ Step 1: READ ./docs/DEVELOPMENT_STATE.md                  │
│ □ Step 2: EXECUTE RAG QUERIES (MINIMUM 4):                  │
│   • python raggy.py search "[current task keywords]"        │
│   • python raggy.py search "architecture patterns"          │
│   • python raggy.py search "coding standards"               │
│   • python raggy.py search "[relevant tech stack]"          │
│ □ Step 3: EXECUTE Context7 queries for live docs            │
│ □ Step 4: CONFIRM: "I understand existing context"          │
│                                                             │
│ ⚠️ SKIP ANY STEP = GUARANTEED TASK FAILURE                  │
└─────────────────────────────────────────────────────────────┘
```

### Context7 MCP Usage Rules
- **ALWAYS** use Context7 MCP for technical documentation
- **Query libraries**: react, d3, react-router-dom, chromadb for live docs
- **Focus topics**: Provide specific topics like "hooks state", "force simulation", "routing navigation"
- **Token limits**: Use 2000-3000 tokens per query for comprehensive coverage

## Current Tech Stack

### Core Technologies
- **Frontend**: React 19 + Create React App
- **Visualization**: D3.js 7.9.0 (force-directed graphs)  
- **Routing**: React Router DOM 6.22.3
- **Vector DB**: ChromaDB 3.0.14 (needs backend migration)
- **HTTP Client**: Axios 1.7.9

### File Structure
```
src/
├── App.js              # Main routing (Router, Routes, Route)
├── Components/
│   ├── Home.js         # Landing page with graph
│   ├── ProfessorGraph.js  # D3.js force simulation
│   ├── Chat.js         # AI chat interface (/chatbot/:professorId)
│   ├── ChatBot.js      # Chat logic
│   └── FileUpload.js   # Document ingestion
└── ...
```

## Architecture Decisions Made

### ✅ Keep Current
- React 19 (excellent foundation)
- D3.js (essential for graph functionality) 
- React Router (room for expansion)

### ⚠️ Needs Migration  
- **ChromaDB to backend** (critical - currently client-side)
- **Add TypeScript** (type safety for growing codebase)
- **Add Tailwind CSS** (rapid UI development)

### 🔄 Future Considerations
- Migrate CRA to Vite (better dev experience)
- Add comprehensive testing
- Performance optimization for large datasets

## Development Workflow

### Before Any Code Changes
1. **Read DEVELOPMENT_STATE.md** for current progress
2. **Execute RAG queries** to understand project context and decisions
3. **Query Context7 MCP** for live library documentation
4. **Update DEVELOPMENT_STATE.md** after significant changes

### RAG Query Examples
```bash
# Before any task - understand current state
python raggy.py search "current priorities backend setup"
python raggy.py search "architecture decisions made"
python raggy.py search "react component patterns"
python raggy.py search "d3 force simulation implementation"

# For specific features
python raggy.py search "chat interface requirements" 
python raggy.py search "file upload processing"
python raggy.py search "chromadb migration"
```

### Context7 Query Examples (After RAG)
```javascript
// For latest API patterns
mcp__context7__get-library-docs: /reactjs/react.dev
topic: "hooks state management components"

// For performance optimization
mcp__context7__get-library-docs: /d3/d3
topic: "force simulation performance optimization"

// For navigation patterns
mcp__context7__get-library-docs: /remix-run/react-router  
topic: "navigation programmatic routing"
```

## Key Implementation Patterns

### D3 + React Integration
- Use useEffect for simulation lifecycle
- Manage node/link data in React state
- Clean up simulation on component unmount

### Current Force Simulation Config
```javascript
const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(300))
    .force("charge", d3.forceManyBody().strength(-300))
    .force("center", d3.forceCenter(width / 2, height / 2));
```

### Route Structure
- `/` - Home with ProfessorGraph component
- `/chatbot/:professorId` - Chat interface for specific professor

## Immediate Priorities

### Phase 1: Backend Migration (Critical)
- Create Express API server
- Move ChromaDB operations server-side  
- Implement file upload endpoints
- Add basic authentication

### Phase 2: Type Safety & UI
- Add TypeScript configuration
- Implement Tailwind CSS
- Create proper error boundaries

### Phase 3: AI Integration
- Integrate OpenAI/Claude API
- Implement streaming responses
- Add conversation persistence
- Create professor persona system

## Quality Standards

### Code Requirements  
- Follow existing patterns in codebase
- Use React 19 best practices (hooks, concurrent features)
- Maintain D3.js performance (60fps simulations)
- Follow component composition over inheritance

### Performance Targets
- Graph rendering: <3 seconds initial load
- Interactions: <100ms UI feedback  
- Chat responses: <2 seconds  
- Handle 500+ nodes smoothly

## Error Handling Strategy
- Graceful degradation for network failures
- Clear user feedback for processing states
- Fallback responses for AI service outages
- Robust file validation and error messages

## Testing Approach (Future)
- React Testing Library for components
- D3.js simulation testing in isolation  
- API integration tests
- E2E testing for critical user flows

## Session Handoff Protocol

### After Each Development Session
Add progress to RAG system for next developer:

```python
# Example handoff
raggy = Raggy()
raggy.add_handoff_note("""
## Session Summary - Backend Setup Phase
- Created Express API server structure  
- Migrated ChromaDB to server-side
- Implemented file upload endpoints with multer
- Added CORS configuration for frontend communication
- ChatGPT integration working with streaming responses

## Decisions Made
- Used Express.js over Fastify for familiarity
- JWT authentication chosen over sessions
- Multer for file handling with 50MB limit
- ChromaDB collection per user pattern

## Next Priority  
- Complete chat interface frontend integration
- Add error handling and loading states
- Implement conversation persistence

## Status: Ready for frontend integration phase
""")
```

### Starting New Session
Query RAG first: `python raggy.py search "where did we leave off last time"`

---

**Remember**: RAG contains all project context and decisions. Context7 MCP provides live, up-to-date library documentation. Always query both before making changes.