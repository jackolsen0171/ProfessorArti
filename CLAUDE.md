# Professor Arti - Claude Code Instructions

## Project Overview
Professor Arti is a productivity-focused academic assistant that pairs a React/Vite dashboard with an AI chat experience. Students land on a McGill-branded dashboard showing tasks, calendar events, and professor shortcuts, then jump into persona-driven chats that understand uploaded syllabi.

## ⚠️ CRITICAL: KNOWLEDGE FIREWALL - MANDATORY EXECUTION ORDER

```
┌─────────────────────────────────────────────────────────────┐
│                    KNOWLEDGE FIREWALL                       │
│                                                             │
│ □ Step 1: READ ./docs/DEVELOPMENT_STATE.md                  │
│ □ Step 2: EXECUTE RAG QUERIES (MINIMUM 4):                  │
│   • python raggy.py search "current dashboard priorities"   │
│   • python raggy.py search "calendar integration status"     │
│   • python raggy.py search "chat interface requirements"     │
│   • python raggy.py search "file upload pipeline"            │
│ □ Step 3: EXECUTE Context7 queries for live docs            │
│ □ Step 4: CONFIRM: "I understand existing context"          │
│                                                             │
│ ⚠️ SKIP ANY STEP = GUARANTEED TASK FAILURE                  │
└─────────────────────────────────────────────────────────────┘
```

### Context7 MCP Usage Rules
- **ALWAYS** use Context7 MCP for up-to-date technical documentation
- **Query libraries**: react, react-router-dom, react-big-calendar, chromadb
- **Focus topics**: hooks state management, routing patterns, calendar APIs, file uploads
- **Token limits**: Use 2000-3000 tokens per query for comprehensive coverage

## Current Tech Stack

### Core Technologies
- **Frontend**: React 19 + TypeScript + Vite 6.3
- **Styling**: Tailwind CSS utilities, custom CSS
- **Routing**: React Router DOM 6.22.3
- **Calendar UI**: react-big-calendar + moment localizer
- **Vector DB**: ChromaDB 3.0.14 (server-side)
- **HTTP Client**: Axios 1.7.9
- **Backend**: Express.js 4 with AppleScript calendar service

### File Structure Snapshot
```
src/
├── App.tsx              # Main routing
├── Components/
│   ├── Dashboard/       # Dashboard widgets (tasks, calendar, professors, quick actions)
│   ├── Dashboard.tsx    # Dashboard composition shell
│   ├── Chat.tsx         # Chat route wrapper
│   ├── ChatBot.tsx      # Chat logic, uploads, calendar extraction
│   ├── Calendar/        # Sidebar + test harness for react-big-calendar
│   ├── FileUpload.tsx   # Upload modal component
│   ├── McGillHeader.tsx # Navigation/header
│   └── McGillFooter.tsx # Footer
└── config.ts            # API base configuration
```

## Architecture Decisions Made

### ✅ Keep Current
- React 19 + Vite toolchain
- React Router for dashboard/chat navigation
- Tailwind CSS utility-first styling
- Express backend for chat, documents, and calendar APIs

### ⚠️ Needs Ongoing Attention
- **ChromaDB integration**: Ensure document ingestion remains stable
- **OpenRouter API**: Provide keys for full AI responses, otherwise mock fallback
- **Calendar automation**: AppleScript requires macOS permissions/availability

### 🔄 Future Considerations
- Global state management if dashboard data becomes shared
- Streaming AI responses for improved UX
- Deployment pipeline and observability once features stabilize

## Development Workflow

### Before Any Code Changes
1. **Read `DEVELOPMENT_STATE.md`** for the latest status and priorities
2. **Execute Raggy queries** to pull relevant historical context
3. **Fetch library docs via Context7 MCP** for APIs you plan to touch
4. **Update `DEVELOPMENT_STATE.md`** when major work concludes

### RAG Query Examples
```bash
python raggy.py search "dashboard widget roadmap"
python raggy.py search "calendar service troubleshooting"
python raggy.py search "chat persona implementation"
python raggy.py search "document upload constraints"
```

### Context7 Query Examples
```javascript
// React component composition best practices
mcp__context7__get-library-docs: /reactjs/react.dev
topic: "hooks effect data fetching"

// Calendar UI references
mcp__context7__get-library-docs: /jquense/react-big-calendar
topic: "custom toolbar month view"

// Routing patterns
mcp__context7__get-library-docs: /remix-run/react-router
topic: "navigate hooks typed routes"
```

## Key Implementation Patterns

### Dashboard Widgets
- Keep widget state localized (`useState`) unless cross-widget orchestration is required
- Use Tailwind utility classes for layout (`grid`, `gap`, responsive breakpoints)
- Hydrate data lazily (e.g., fetch calendar events in `useEffect` with loading feedback)

### Chat Experience
- Manage messages with `useState` array append operations
- Guard against duplicate submissions while awaiting API responses
- Surface upload success as system messages with actionable follow-ups
- Use `API_BASE_URL` from `config.ts` for server communication

### Calendar Integration
- `CalendarSidebar` renders `SemesterCalendar` with react-big-calendar
- Backend AppleScript service exposes `GET /api/calendar/events` and `POST /api/calendar/extract-events`
- File upload confirmation exposes "Extract Dates to Calendar" action tied to backend endpoint

### Route Structure
- `/dashboard` - Default landing page (redirect from `/`)
- `/chatbot/:professorId` - Persona-driven chat interface
- `/calendar-test` - Standalone calendar testing surface

## Immediate Priorities

### Phase 1: Dashboard Enhancements
- Replace mock data with real feeds where available
- Expand quick actions (task scheduling integrations, etc.)

### Phase 2: AI & Data Quality
- Connect OpenRouter API key for production responses
- Add conversation persistence via ChromaDB conversations collection

### Phase 3: Platform Readiness
- Harden authentication (McGill SSO integration)
- Establish deployment pipeline and environment configuration strategy

## Quality Standards

### Code Requirements
- Favor functional React components with hooks
- Keep API calls centralized via `API_BASE_URL`
- Provide user feedback for all async operations (loading/error states)
- Maintain TypeScript strictness (no implicit `any`)

### Performance Targets
- Dashboard interactive within 1s on modern hardware
- Chat responses returned within 2s (depending on AI latency)
- Calendar extraction limited to first event while testing (expand when confident)

## Error Handling Strategy
- Log backend errors with timestamps for traceability
- Show inline error banners in chat/file upload components
- Allow retries for failed uploads or AI responses

---

**Reminder**: Knowledge graph functionality has been retired. Focus development on dashboard productivity flows and AI-assisted learning workflows.
