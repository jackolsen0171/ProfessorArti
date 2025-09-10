# Professor Arti - Product Requirements Document

## Executive Summary

Professor Arti is an interactive course visualization and AI chat platform designed specifically for McGill University students. Users log in with their McGill credentials to view a personalized graph of their professors, then click on any professor node to chat with an AI assistant about that professor's specific courses and syllabi.

## Project Vision

Create an intuitive platform where McGill students can visually explore their academic relationships with professors and engage in AI-powered conversations about specific courses, syllabi, and academic content.

## Target Users

### Primary Users
- **McGill Students**: Need to understand course content, syllabi, and professor expectations
- **Graduate Students**: Want to explore connections between professors and research areas
- **Academic Advisors**: Looking to help students navigate course relationships

### Secondary Users
- **McGill Faculty**: May want to see how their courses connect to others
- **Academic Administrators**: Understanding course and professor networks

## Core Features

### 1. Interactive Professor Graph Visualization
- **D3.js force-directed graph** showing the user's professors as nodes
- **Dynamic node sizing** based on number of courses or student enrollment
- **Smooth zoom and pan** interactions for graph exploration
- **Color-coded categories** for different departments/faculties
- **Clickable professor nodes** that navigate to course-specific chat interface

### 2. Course-Specific AI Chat Interface  
- **AI assistant** trained on specific professor's course materials and syllabi
- **Context-aware conversations** about the selected professor's courses
- **Multi-turn dialogue** with conversation history
- **Syllabus upload capability** for document ingestion and analysis
- **Real-time responses** with typing indicators and smooth UX

### 3. McGill Authentication & Navigation
- **McGill SSO login** as the entry point
- **Personalized graph view** (`/`) showing user's professors after authentication
- **Professor chat interface** (`/chatbot/:professorId`) for course-specific conversations
- **Batch syllabus upload** accessible from top navigation bar
- **Seamless transitions** between graph exploration and course chat

### 4. Syllabus Processing & Data Integration
- **ChromaDB integration** for vector storage and semantic search of syllabi
- **Batch syllabus processing pipeline** for multiple document uploads
- **McGill course catalog integration** for professor-course relationships
- **Dynamic graph data updates** based on uploaded syllabi and course data

## Technical Architecture

### Current Tech Stack
- **Frontend**: React 19, React Router DOM 6.22.3
- **Authentication**: McGill SSO/SAML integration (to be implemented)
- **Visualization**: D3.js 7.9.0
- **Vector Database**: ChromaDB 3.0.14
- **HTTP Client**: Axios 1.7.9
- **Build System**: Create React App (CRA) 5.0.1

### Key Components
- `App.js`: Main routing, authentication, and application structure
- `ProfessorGraph.js`: D3.js visualization component showing user's professors
- `Chat.js`: Course-specific conversational interface for selected professors
- `FileUpload.js`: Individual syllabus upload functionality
- `BatchUpload.js`: Bulk syllabus processing component (top navigation)
- `Home.js`: Authenticated landing page and professor graph container
- `Login.js`: McGill SSO authentication component

## User Journey

### Primary Flow
1. **McGill SSO login** - User authenticates with McGill credentials
2. **View professor graph** - User sees personalized visualization of their professors
3. **Explore professor connections** - Click and drag nodes, zoom to explore relationships  
4. **Select professor** - Click on specific professor node to access their courses
5. **Chat about courses** - Navigate to AI chat interface for that professor's courses
6. **Upload syllabi** - Use batch upload to add course materials (accessible from top bar)
7. **Return to exploration** - Navigate back to graph with enriched course data

### Secondary Flows
- **Direct professor chat access** - Users can bookmark specific professor chat URLs
- **Syllabus-first interaction** - Batch upload syllabi first, then explore updated professor graph
- **Course-driven discovery** - Find specific course content through conversational queries
- **Cross-professor exploration** - Discover connections between different professors' courses

## Success Metrics

### Engagement Metrics
- **Session duration** on graph visualization
- **Node interaction rate** (clicks, drags, zooms per session)
- **Chat conversation depth** (messages per conversation thread)
- **Return user rate** for continued exploration

### Educational Effectiveness  
- **Knowledge retention** through pre/post interaction assessments
- **User satisfaction** with explanation quality and graph usefulness
- **Task completion rate** for research/learning objectives

## Non-Functional Requirements

### Performance
- **Professor graph rendering** must handle 100+ professor nodes smoothly at 60fps
- **Course chat responses** should appear within 2 seconds of user input
- **Batch syllabus upload** should provide progress feedback and handle 50+ PDFs simultaneously
- **McGill SSO authentication** should complete within 3 seconds

### Accessibility
- **Keyboard navigation** for graph elements and chat interface
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
- **Mobile responsiveness** - Touch-optimized professor graph interactions
- **Advanced analytics** - Track learning paths and course relationships

### Integration Opportunities
- **McGill Minerva integration** - Direct connection to course registration system
- **Canvas/MyCourses compatibility** - Sync with existing McGill LMS
- **McGill Library integration** - Access to course readings and reserves
- **Export functionality** - Save course conversations and professor connections
- **Faculty API endpoints** - Allow professors to update their course information

## Risk Assessment

### Technical Risks
- **McGill SSO integration** complexity and institutional approval requirements
- **D3.js performance** with professor graphs and complex course relationships
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