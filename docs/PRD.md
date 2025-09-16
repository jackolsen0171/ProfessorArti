# Professor Arti - Product Requirements Document

## Executive Summary

Professor Arti is a productivity-focused academic assistant designed specifically for McGill University students. Users log in with their McGill credentials to access a personalized dashboard that surfaces upcoming tasks, calendar events, and quick access to an AI assistant that understands their professors' courses and syllabi.

## Project Vision

Create an intuitive platform where McGill students can stay on top of their course work, manage deadlines, and engage in AI-powered conversations about specific courses, syllabi, and academic content.

## Target Users

### Primary Users
- **McGill Students**: Need to understand course content, syllabi, and professor expectations
- **Graduate Students**: Want to explore connections between professors and research areas
- **Academic Advisors**: Looking to help students navigate course relationships

### Secondary Users
- **McGill Faculty**: May want to see how their courses connect to others
- **Academic Administrators**: Understanding course and professor networks

## Core Features

### 1. Student Productivity Dashboard
- **Task overview** surfacing upcoming assignments and deadlines
- **Calendar snapshot** highlighting events pulled from Apple Calendar integration
- **Professor quick access** with unread indicators and office hours status
- **Quick actions** for adding tasks, scheduling study blocks, and uploading documents

### 2. Course-Specific AI Chat Interface  
- **AI assistant** trained on specific professor's course materials and syllabi
- **Context-aware conversations** about the selected professor's courses
- **Multi-turn dialogue** with conversation history
- **Syllabus upload capability** for document ingestion and analysis
- **Real-time responses** with typing indicators and smooth UX

### 3. McGill Authentication & Navigation
- **McGill SSO login** as the entry point (pending implementation)
- **Dashboard default view** (`/dashboard`) showing personalized academic context
- **Professor chat interface** (`/chatbot/:professorId`) for course-specific conversations
- **Batch syllabus upload** accessible from top navigation bar
- **Seamless transitions** between dashboard widgets and AI chat

### 4. Syllabus Processing & Data Integration
- **ChromaDB integration** for vector storage and semantic search of syllabi
- **Batch syllabus processing pipeline** for multiple document uploads
- **McGill course catalog integration** for professor-course relationships
- **Dashboard data updates** based on uploaded syllabi and course data

## Technical Architecture

### Current Tech Stack
- **Frontend**: React 19, React Router DOM 6.22.3, TypeScript 5.9
- **Styling**: Tailwind CSS 3.4, custom CSS modules
- **Authentication**: McGill SSO/SAML integration (to be implemented)
- **Vector Database**: ChromaDB 3.0.14
- **HTTP Client**: Axios 1.7.9
- **Build System**: Vite 6.3

### Key Components
- `App.tsx`: Main routing, authentication, and application structure
- `Dashboard.tsx`: Productivity dashboard composition shell
- `Dashboard/*`: Widgets for tasks, calendar events, professor list, quick actions
- `Chat.tsx`: Course-specific conversational interface for selected professors
- `ChatBot.tsx`: AI chat experience with uploads and calendar extraction
- `FileUpload.tsx`: Individual and batch syllabus upload functionality
- `Calendar/*`: Calendar sidebar and test harness powered by react-big-calendar
- `Login.tsx`: McGill SSO authentication component (pending)

## User Journey

### Primary Flow
1. **McGill SSO login** - User authenticates with McGill credentials
2. **Land on dashboard** - User views personalized tasks, events, and professor list
3. **Review upcoming items** - User checks tasks and calendar events surfaced on dashboard
4. **Access AI support** - User launches course-specific chat from professor list or quick action
5. **Upload syllabi** - User adds course materials via upload modal to enrich AI context
6. **Manage schedule** - User extracts dates to Apple Calendar directly from chat responses

### Secondary Flows
- **Direct professor chat access** - Users can bookmark specific professor chat URLs
- **Syllabus-first interaction** - Batch upload syllabi first, then review updated dashboard context
- **Task-driven workflow** - Start from quick actions to add tasks or schedule study sessions
- **Calendar-first workflow** - Open calendar sidebar to review events and jump into related chats

## Success Metrics

### Engagement Metrics
- **Dashboard session duration** (time spent engaging with tasks and events)
- **Quick action usage rate** (actions triggered per session)
- **Chat conversation depth** (messages per conversation thread)
- **Return user rate** for continued planning support

### Educational Effectiveness  
- **Knowledge retention** through pre/post interaction assessments
- **User satisfaction** with explanation quality and dashboard usefulness
- **Task completion rate** for research/learning objectives

## Non-Functional Requirements

### Performance
- **Dashboard rendering** must handle multiple widgets without layout shift
- **Course chat responses** should appear within 2 seconds of user input
- **Batch syllabus upload** should provide progress feedback and handle 50+ PDFs simultaneously
- **McGill SSO authentication** should complete within 3 seconds

### Accessibility
- **Keyboard navigation** for dashboard widgets and chat interface
- **Screen reader compatibility** with semantic HTML and ARIA labels
- **Color contrast compliance** with WCAG 2.1 AA standards

### Scalability
- **Database optimization** for fast semantic search across thousands of syllabi
- **Component architecture** supporting McGill's full professor directory
- **Asset optimization** for fast initial load times
- **Multi-tenant support** for different McGill faculties and departments

## Future Enhancements

### Phase 2 Features
- **Course scheduling integration** - Connect with McGill's course registration system
- **Grade and assignment tracking** - Link syllabus content to actual coursework
- **Study group formation** - Connect students taking similar courses
- **Mobile responsiveness** - Touch-optimized dashboard and chat interactions
- **Advanced analytics** - Track learning paths and course relationships

### Integration Opportunities
- **McGill Minerva integration** - Direct connection to course registration system
- **Canvas/MyCourses compatibility** - Sync with existing McGill LMS
- **McGill Library integration** - Access to course readings and reserves
- **Export functionality** - Save course conversations and schedule snapshots
- **Faculty API endpoints** - Allow professors to update their course information

## Risk Assessment

### Technical Risks
- **McGill SSO integration** complexity and institutional approval requirements
- **Dashboard performance** when aggregating large task/calendar datasets
- **ChromaDB scaling** for thousands of syllabi and course documents
- **Data privacy** compliance with McGill's student information policies

### Product Risks  
- **McGill institutional approval** for student data access and SSO integration
- **Syllabus content accuracy** depends on professors providing up-to-date materials
- **User adoption** among McGill students requires clear academic value demonstration
- **Content quality** depends heavily on AI model understanding of academic content

## Dependencies

### External Services
- **McGill SSO/Authentication** for secure student login
- **AI/LLM API** for conversational capabilities (implementation pending)
- **PDF processing services** for syllabus parsing and analysis
- **Vector embedding services** for semantic search of course materials

### Internal Dependencies
- **McGill course data pipeline** for professor-course relationship mapping
- **Syllabus processing system** for contextual AI responses about specific courses
- **McGill authentication integration** for secure student sessions and personalized data

---

*This PRD serves as the foundational document for Professor Arti development. All feature development and technical decisions should align with the vision and requirements outlined above.*
