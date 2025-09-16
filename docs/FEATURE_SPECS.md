# Professor Arti - Feature Specifications

## Feature 1: Student Productivity Dashboard

### Overview
Dashboard-first experience that surfaces upcoming tasks, calendar events, and quick access to professor chats in a single McGill-branded layout.

### Technical Specifications

#### Component: `Dashboard.tsx`
- Composes shared header/footer with responsive grid layout
- Injects widget components from `src/Components/Dashboard/*`

#### Key Widgets
- `WelcomeSection.tsx`: Displays greeting, current date, and study streak
- `TaskList.tsx`: Manages local task state with add/complete interactions
- `CalendarEvents.tsx`: Hydrates weekly event list from backend calendar API
- `ProfessorList.tsx`: Shows static professor roster with unread/chat shortcuts
- `QuickActions.tsx`: Launches common modals (add task, schedule study, upload docs)

#### User Experience Flows
1. Dashboard loads with mock data, then enriches events via `GET /api/calendar/events`
2. Users can add tasks inline; completed tasks move to the bottom of the list
3. Professor cards link directly to chat routes
4. Upload quick action opens `FileUpload` modal for multi-document ingestion

#### Performance Requirements
- Render within 1 second on modern hardware
- Widgets remain responsive while network calls resolve
- Layout adapts to mobile (stacked) and desktop (three-column) breakpoints

---

## Feature 2: Contextual AI Chat Interface

### Overview
Conversational interface allowing students to interact with AI "professors" representing different knowledge domains.

### Technical Specifications

#### Component: `Chat.tsx`
- **Route**: `/chatbot/:professorId`
- **URL Parameters**:
  - `professorId`: Identifier for specific professor persona

#### Integration Points
- **Vector Database**: ChromaDB for semantic search and context retrieval
- **AI Service**: OpenRouter/OpenAI for conversation generation
- **File Processing**: Document upload and ingestion pipeline
- **Calendar**: Apple Calendar integration for date extraction

### User Experience Flows

#### Conversation Flow
1. User navigates from dashboard professor card or direct URL
2. Chat interface loads with professor-specific persona metadata
3. User types questions or uploads documents
4. AI responds with contextually relevant information, including source citations
5. Conversation history maintained for session duration

#### File Upload Flow
1. User selects file(s) via upload button
2. Files processed and added to ChromaDB via `/api/documents/(upload|batch-upload)`
3. System message confirms upload and offers calendar extraction action
4. AI responses gain access to newly stored syllabus content

### Data Flow Requirements
- **Context preservation**: Maintain conversation state across message sends
- **Real-time updates**: Immediate response to user inputs with loading indicator
- **Error handling**: Graceful failure messaging for AI or upload issues

---

## Feature 3: Document Processing & Knowledge Integration

### Overview
Pipeline for ingesting uploaded documents and integrating them into chat context and calendar automation.

### Technical Specifications

#### Component: `FileUpload.tsx`
- **Supported formats**: PDF, TXT, DOC/DOCX, MD
- **Upload constraints**: 50MB per file, MIME whitelist via `shared/mimeTypes.json`
- **Modes**: Single upload (`/api/documents/upload`) or batch upload (`/api/documents/batch-upload`)

#### ChromaDB Integration
- **Collections**: `professor_arti_documents` for document chunks
- **Metadata**: Stores filename, chunk index, upload timestamp, size
- **Retrieval**: `searchDocuments` used for calendar extraction prompts

### Processing Workflow
1. **File validation**: Reject unsupported MIME types / oversized files
2. **Text extraction**: pdf-parse for PDFs, direct read for text/markdown, placeholder for Word docs
3. **Chunking**: Paragraph-based segmentation (≈1000 characters per chunk)
4. **Vectorization**: Delegated to OpenRouter embeddings when a key is configured
5. **Storage**: Persist content + metadata in ChromaDB
6. **Confirmation**: Chat system message with chunk counts and follow-up actions

### Performance Requirements
- **Upload feedback**: Visual indicators during upload/processing state
- **Processing time**: Under 30 seconds for typical syllabi (<5MB)
- **Storage efficiency**: Deduplicate chunk IDs and prune failed inserts

---

## Feature 4: Navigation & Routing System

### Overview
React Router-based navigation system connecting dashboard, chat, and auxiliary views.

### Technical Specifications

#### Route Structure
```tsx
<Routes>
  <Route path="/" element={<Navigate to="/dashboard" replace />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/chatbot/:professorId" element={<Chat />} />
  <Route path="/calendar-test" element={<CalendarTest />} />
</Routes>
```

#### Navigation Patterns
- **Dashboard to Chat**: Click professor card → `navigate(/chatbot/${professorId})`
- **Chat to Calendar**: Toggle inline calendar sidebar for schedule review
- **Quick Actions**: Modal workflows for uploads/tasks without leaving dashboard
- **Direct Access**: Bookmarkable chat URLs per persona

### State Management
- **Dashboard widgets**: Local state per widget with potential backend hydration
- **Chat session**: Message list, upload state, conversation ID
- **Global config**: API base URL (`src/config.ts`)

### User Experience Requirements
- **Smooth transitions**: No full page reloads during route changes
- **State persistence**: Preserve chat history while navigating within chat route
- **Browser integration**: Proper back/forward button behavior and deep linking

---

## Feature 5: Data Architecture & Storage

### Overview
Hybrid storage system combining ChromaDB for vector operations with local UI state.

### Technical Specifications

#### ChromaDB Schema (documents)
```javascript
{
  id: string,
  document: string,
  metadata: {
    filename: string,
    chunkIndex: number,
    totalChunks: number,
    uploadedAt: string,
    fileSize: number,
    mimetype: string
  }
}
```

#### Calendar Data
- Events fetched via `GET /api/calendar/events`
- AppleScript-backed service translates to display-ready objects for dashboard widgets

#### Chat Context Retrieval
- `/api/chat` calls `searchSimilar` to fetch top K document chunks per prompt
- Sources returned with messages for user transparency

### Data Flow Patterns
- **Read operations**: Fast vector similarity search for chat context, REST fetch for calendar
- **Write operations**: Document ingestion pipelines, optional calendar event creation
- **Updates**: Dashboard re-renders on new data without full page refresh

---

*These specifications capture the current dashboard-first direction for Professor Arti. Future enhancements should continue to build on productivity and conversation workflows rather than graph exploration.*
