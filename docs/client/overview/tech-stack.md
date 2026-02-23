# Technology Stack

## Frontend Technologies

### Core Framework
- **Next.js 16.1.4**
  - App Router architecture
  - Server-side rendering (SSR)
  - Static site generation (SSG)
  - API routes
  - Image optimization
  - Code splitting

- **React 19.1.0**
  - Modern hooks API
  - Server components
  - Client components
  - Context API for state management

- **TypeScript 5**
  - Strict mode enabled
  - 100% type coverage
  - No `any` types in critical paths
  - Comprehensive interfaces

### Styling & UI

- **Tailwind CSS 4**
  - Utility-first CSS framework
  - Custom design tokens
  - Responsive design utilities
  - Dark mode support

- **shadcn/ui**
  - 30+ pre-built components
  - Radix UI primitives
  - Fully customizable
  - Accessible by default

- **Radix UI**
  - Unstyled, accessible components
  - Dialog, dropdown, select, etc.
  - ARIA-compliant
  - Keyboard navigation

- **Lucide React**
  - Modern icon library
  - 1000+ icons
  - Tree-shakeable
  - Consistent design

### Data Visualization

- **Recharts**
  - Line charts, bar charts, area charts
  - Responsive charts
  - Customizable styling
  - Used in analytics dashboards

### Form Management

- **React Hook Form**
  - Performant form handling
  - Built-in validation
  - Type-safe forms
  - Minimal re-renders

- **Zod**
  - Schema validation
  - TypeScript-first
  - Runtime type checking
  - Form validation schemas

### Animation

- **Framer Motion**
  - Smooth animations
  - Gesture recognition
  - Layout animations
  - Page transitions

### Video & Media

- **React Player**
  - YouTube video integration
  - Video progress tracking
  - Custom controls
  - Multiple provider support

## Backend Technologies

### Database & Storage

- **Firebase Firestore**
  - NoSQL document database
  - Real-time updates
  - Offline support
  - Scalable architecture
  - 16 collections for different data types

- **Firebase Authentication**
  - Email/password authentication
  - User session management
  - Role-based access control
  - Custom claims support

- **Firebase Storage**
  - File upload/download
  - Media storage
  - Access control rules
  - CDN integration

- **Firebase Admin SDK 13.5.0**
  - Server-side operations
  - User management
  - Custom token creation
  - Security rule testing

### AI Integration

- **Anthropic SDK**
  - Claude Opus 4.5 integration
  - Claude Sonnet 4 for chat
  - Large context windows (200K tokens)
  - Streaming support

### API Layer

- **Next.js API Routes**
  - RESTful endpoints
  - Middleware support
  - Edge runtime capable
  - Authentication integration

## Development Tools

### Code Quality

- **ESLint 9**
  - Code linting
  - Best practice enforcement
  - Custom rules
  - Next.js plugin

- **Prettier 3.6.2**
  - Code formatting
  - Consistent style
  - Auto-formatting on save
  - Integration with editors

- **Husky**
  - Git hooks
  - Pre-commit checks
  - Pre-push validation
  - Commit message linting

### Testing

- **Playwright**
  - End-to-end testing
  - Browser automation
  - Visual testing
  - Cross-browser support

- **Vitest**
  - Unit testing framework
  - Jest-compatible API
  - Fast execution
  - TypeScript support

### Build & Deployment

- **Vercel**
  - Automatic deployments
  - Edge network CDN
  - Preview deployments
  - Analytics integration
  - Environment variables

- **Docker**
  - Development containers
  - Production builds
  - Consistent environments
  - Multi-stage builds

## Architecture Patterns

### Service Layer
- **Base Service Pattern**
  - Abstract base class for all services
  - Common CRUD operations
  - Caching layer
  - Error handling
  - Retry logic

- **Specialized Services**
  - 16 domain-specific services
  - Single responsibility
  - Type-safe operations
  - Comprehensive logging

### Component Architecture
- **Atomic Design**
  - Atoms: Basic UI elements
  - Molecules: Component combinations
  - Organisms: Complex components
  - Templates: Page layouts
  - Pages: Full routes

### Data Flow
- **Server Components**
  - Data fetching on server
  - Reduced client bundle
  - SEO optimization
  - Better performance

- **Client Components**
  - Interactive features
  - State management
  - User interactions
  - Real-time updates

## Security

### Authentication & Authorization
- **Firebase Auth** with custom claims
- **Role-based access control (RBAC)**
- **JWT tokens** with secure storage
- **Session management** with auto-refresh

### Data Security
- **Firestore Security Rules**
  - Collection-level permissions
  - Document-level access control
  - Field-level validation
  - Query restrictions

- **API Security**
  - Authentication middleware
  - Rate limiting
  - Input validation
  - CSRF protection

### Environment Security
- **Environment Variables**
  - Secrets management
  - Vercel secret storage
  - Local .env files
  - Build-time injection

## Performance Optimizations

### Frontend
- **Code Splitting** - Automatic route-based splitting
- **Image Optimization** - Next.js Image component
- **Lazy Loading** - Dynamic imports for components
- **Caching** - Client-side service caching
- **Bundle Analysis** - Webpack bundle analyzer

### Backend
- **Database Indexing** - Firestore indexes for queries
- **Query Optimization** - Limit, pagination, filtering
- **Caching Layer** - Service-level caching with TTL
- **Connection Pooling** - Firebase connection management

## Development Workflow

### Version Control
- **Git** - Version control system
- **GitHub** - Repository hosting
- **Branch Strategy** - Feature branches, main branch
- **Commit Convention** - Conventional commits

### CI/CD
- **Vercel** - Automatic deployments on push
- **Preview Deployments** - Per-PR preview URLs
- **Production Deployments** - Manual promotion
- **Rollback Support** - Instant rollback capability

### Monitoring (Planned)
- **Error Tracking** - Sentry integration planned
- **Performance Monitoring** - Vercel analytics
- **Usage Analytics** - Custom event tracking
- **Logging** - Structured logging system

## Dependencies

### Production Dependencies
```json
{
  "next": "16.1.4",
  "react": "19.1.0",
  "typescript": "5.x",
  "firebase": "12.3.0",
  "firebase-admin": "13.5.0",
  "@anthropic-ai/sdk": "latest",
  "tailwindcss": "4.x",
  "@radix-ui/react-*": "latest",
  "react-hook-form": "latest",
  "zod": "latest",
  "recharts": "latest",
  "framer-motion": "latest"
}
```

### Development Dependencies
```json
{
  "eslint": "9.x",
  "prettier": "3.6.2",
  "husky": "latest",
  "playwright": "latest",
  "vitest": "latest"
}
```

## System Requirements

### Development Environment
- **Node.js:** 18+ required
- **npm:** 9+ or yarn 1.22+
- **Git:** 2.x
- **OS:** macOS, Linux, or Windows with WSL

### Browser Support
- **Chrome:** Latest 2 versions
- **Firefox:** Latest 2 versions
- **Safari:** Latest 2 versions
- **Edge:** Latest 2 versions
- **Mobile:** iOS Safari 14+, Chrome Android 90+

## Infrastructure

### Hosting
- **Vercel Edge Network**
  - Global CDN
  - Edge functions
  - Automatic SSL
  - DDoS protection

### Database
- **Firebase Firestore**
  - Multi-region replication
  - Automatic scaling
  - Real-time sync
  - 99.95% SLA

### Storage
- **Firebase Storage**
  - Google Cloud Storage backend
  - CDN distribution
  - Automatic backups
  - Access control

## Cost Considerations

### Firebase (Pay-as-you-go)
- **Firestore:** Reads/writes/storage based
- **Storage:** GB storage + bandwidth
- **Auth:** Free for standard features

### Vercel
- **Hobby/Pro:** Based on team size and features
- **Bandwidth:** Included in plan
- **Build Minutes:** Generous limits

### Anthropic API
- **Claude Opus 4.5:** $15/1M input, $75/1M output tokens
- **Claude Sonnet 4:** $3/1M input, $15/1M output tokens
- **Caching:** 90% cost reduction for repeated prompts
