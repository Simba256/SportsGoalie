# Project Assistant - AI Chatbot

**Status:** ✅ Complete (MVP)
**Route:** `/admin/project-assistant`
**API Endpoint:** `/api/admin/chat`
**Implemented:** February 24, 2026

## Overview

The Project Assistant is an AI-powered chatbot with comprehensive knowledge of the SportsGoalie project. It provides instant answers about features, routes, progress, technical details, and architectural decisions by accessing all client documentation.

## Key Features

### 1. Comprehensive Documentation Access
- **Project Overview:** Status, progress, tech stack
- **Features:** Detailed feature documentation
- **Routes:** All application routes and navigation
- **Progress:** Development history and phase summaries
- **Technical Details:** Database schema, services, security
- **Decisions:** Architectural decision records

### 2. Smart Context Loading
- **Intelligent Search:** Keyword-based document relevance scoring
- **Adaptive Context:** Loads 5-10 most relevant documents per question
- **Full Context Mode:** Option to load all documentation
- **Topic-Based:** Filter by category (features, routes, progress, etc.)

### 3. AI-Powered Responses
- **Model:** Claude Sonnet 4 for optimal cost/performance
- **Context Window:** Up to 200K tokens supported
- **Markdown Formatting:** Rich text responses with code highlighting
- **Code Examples:** Syntax-highlighted code blocks
- **File References:** Specific file paths and route mentions

### 4. Admin-Only Access
- **Security:** Firebase Auth token validation
- **Role Check:** Admin role required
- **Private:** Conversations not stored
- **Protected:** API endpoint with authentication middleware

## Documentation Structure

### Client Documentation Folder
Location: `/docs/client/`

```
docs/client/
├── overview/
│   ├── project-summary.md       # High-level overview
│   ├── current-status.md        # Real-time status
│   └── tech-stack.md            # Technologies used
├── features/
│   ├── authentication.md        # Auth system
│   ├── coach-curriculum.md      # Curriculum builder
│   └── project-assistant.md     # This document
├── pages/
│   └── all-routes.md            # All app routes
├── progress/
│   └── phase-summaries.md       # Development phases
├── technical/
│   └── (future docs)
└── decisions/
    └── key-decisions.md         # Architectural decisions
```

### Document Categories
1. **Overview** - Project summaries and general information
2. **Features** - Detailed feature documentation
3. **Pages** - Route descriptions and navigation
4. **Progress** - Development history and milestones
5. **Technical** - Architecture, database, services
6. **Decisions** - Architectural decision records

## Technical Implementation

### Backend Service
**File:** `src/lib/services/project-assistant.service.ts`

**Key Methods:**
- `loadAllDocuments()` - Load all client docs
- `loadDocumentsByCategory(category)` - Load by category
- `loadRelevantDocuments(question)` - Smart context loading
- `formatContextForAI(documents)` - Format for Claude
- `getFullProjectContext()` - Get all docs
- `getSmartContext(question)` - Get relevant docs
- `getTopicContext(topic)` - Get category-specific docs
- `getStats()` - Get document statistics

**Features:**
- Keyword-based relevance scoring
- Priority-based document ranking
- Category-specific keywords
- Document metadata tracking
- Caching support (5-minute TTL)

### API Route
**Endpoint:** `POST /api/admin/chat`

**Authentication:**
1. Bearer token in Authorization header
2. Firebase Admin SDK token verification
3. Firestore role check (admin only)

**Request Body:**
```typescript
{
  messages: Array<{ role: 'user' | 'assistant', content: string }>,
  useFullContext?: boolean,
  topic?: string
}
```

**Response:**
```typescript
{
  success: true,
  response: string,  // AI response text
  usage: {
    inputTokens: number,
    outputTokens: number
  },
  contextStats: {
    documentsLoaded: number,
    contextSize: number
  }
}
```

**GET Endpoint:** `/api/admin/chat`
Returns document statistics (total docs, by category, total size)

### Chat Interface Component
**File:** `src/components/admin/chat-interface.tsx`

**Features:**
- Message history display
- Real-time chat interface
- Markdown rendering with ReactMarkdown
- Code syntax highlighting with Prism
- Suggested questions for quick start
- Auto-scroll to latest message
- Loading states and error handling
- Token usage display
- Context statistics

**Dependencies:**
- `react-markdown` - Markdown rendering
- `react-syntax-highlighter` - Code highlighting
- shadcn/ui components (Card, Button, Input, ScrollArea, Badge)
- Sonner toast notifications
- Lucide React icons

### Admin Page
**Route:** `/app/admin/project-assistant/page.tsx`

**Layout:**
- Main chat interface (2/3 width)
- Sidebar with capabilities and tips (1/3 width)
- Info alert for usage guidance
- Example questions
- Security notice

## Usage

### Accessing the Assistant

1. **Login as Admin:** Navigate to `/admin`
2. **Find Project Assistant:** In Analytics & Reports section
3. **Click "Open Assistant":** Opens `/admin/project-assistant`

### Asking Questions

**Example Questions:**
- "What is the current project status?"
- "How does the coach curriculum builder work?"
- "What admin routes are available?"
- "Show me the authentication flow"
- "What's in the database schema?"
- "What features have been implemented?"
- "What technologies are used?"

**Tips for Best Results:**
- Be specific about features or routes
- Request file paths or code locations
- Ask about progress or development status
- Inquire about technical decisions
- Request explanations of how features work

### Suggested Questions
The interface includes 5 suggested questions for quick start:
1. What features have been implemented so far?
2. What is the current project status?
3. How does the coach curriculum builder work?
4. What routes are available for admin users?
5. What technologies are used in this project?

## Cost Considerations

### Anthropic API Pricing
- **Model:** Claude Sonnet 4
- **Input:** $3 per 1M tokens
- **Output:** $15 per 1M tokens

### Estimated Costs
- **Average Context Size:** 50-100KB per request
- **Input Tokens:** ~12,000-25,000 per request
- **Output Tokens:** ~500-1,500 per response
- **Cost Per Query:** $0.04-0.08
- **Monthly (100 queries):** ~$5-8

### Optimization Strategies
1. **Smart Context Loading:** Only loads relevant docs (default)
2. **Caching:** 5-minute cache for document loading
3. **Efficient Model:** Claude Sonnet 4 (better cost/performance than Opus)
4. **Admin-Only:** Limited to admin users only

## Capabilities

### What the Assistant Knows
- ✅ All implemented features and their details
- ✅ Complete route structure (public, student, coach, admin)
- ✅ Development progress and phase summaries
- ✅ Technology stack and dependencies
- ✅ Database schema and service architecture
- ✅ Architectural decisions and rationale
- ✅ Current status and next steps

### What It Can Answer
- Feature explanations and implementations
- Route locations and purposes
- Development timeline and progress
- Technical architecture details
- Decision rationale and alternatives
- Code locations and file paths
- Setup and configuration
- Next development steps

### Limitations
- Cannot modify code or files
- Cannot execute commands
- Cannot access dev session logs (only client docs)
- Cannot access real-time database data
- No memory between sessions (stateless)

## Future Enhancements

### Planned Features
1. **Session Memory:** Remember conversation history
2. **File Access:** Read actual code files on demand
3. **Database Queries:** Real-time data access
4. **Code Examples:** Generate code snippets
5. **Search Enhancement:** Vector-based semantic search

### Possible Improvements
1. **Voice Input:** Speech-to-text for questions
2. **Export Chat:** Download conversation history
3. **Favorites:** Save useful questions
4. **Multi-Language:** Support for other languages
5. **Proactive Suggestions:** Recommend relevant docs

## Maintenance

### Updating Documentation
1. Edit files in `/docs/client/`
2. Documentation auto-loads on next query
3. Cache clears every 5 minutes
4. No rebuild required

### Adding New Documents
1. Create `.md` file in appropriate category folder
2. Follow markdown formatting
3. Use clear headings and sections
4. Include code examples if relevant
5. Service auto-discovers new files

### Monitoring
- Check API logs for errors
- Monitor token usage in responses
- Review suggested questions effectiveness
- Track common question patterns

## Security

### Access Control
- ✅ Admin role required
- ✅ Firebase Auth token validation
- ✅ Server-side role verification
- ✅ Protected API endpoint

### Data Privacy
- No conversation history stored
- Stateless API (no session persistence)
- Client documentation only (no sensitive data)
- Admin-only access (no student/coach access)

### API Security
- Bearer token authentication
- Firebase Admin SDK verification
- Firestore role check
- Error handling without data exposure

## Performance

### Response Times
- **Document Loading:** 50-200ms
- **Context Formatting:** 10-50ms
- **AI Response:** 2-5 seconds
- **Total:** 2-6 seconds per query

### Optimization
- Document caching (5-minute TTL)
- Smart context loading (relevant docs only)
- Efficient model selection (Sonnet 4)
- Minimal API overhead

## Related Documentation
- [Authentication System](./authentication.md)
- [All Routes](../pages/all-routes.md)
- [Key Decisions](../decisions/key-decisions.md)
- [Project Summary](../overview/project-summary.md)
- [Current Status](../overview/current-status.md)
