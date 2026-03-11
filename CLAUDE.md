# CLAUDE.md

This file provides comprehensive guidance to Claude Code when working with the Smarter Goalie project.

## 🎯 Project Mission

Smarter Goalie is a modern, production-ready sports learning platform designed to help athletes and sports enthusiasts learn skills, track progress, and assess their knowledge through interactive content.

## 📋 Project Overview

### Vision

Create a comprehensive digital sports coaching platform that combines:

- **Structured Learning**: Organized sports and skills content
- **Progress Tracking**: Visual progress monitoring with achievement system
- **Interactive Assessment**: Engaging quiz system with immediate feedback
- **Content Management**: Admin tools for managing sports, skills, and user data
- **Modern UX**: Clean, responsive, mobile-first design

### Core Principles

1. **Simplicity First**: Start with MVP, add complexity incrementally
2. **Quality Over Speed**: Each stage must be fully tested and documented
3. **User-Centric Design**: Focus on intuitive user experience
4. **Maintainable Code**: Clean, well-documented, type-safe code
5. **Performance**: Fast, responsive, optimized for all devices

## 🛠️ Technology Stack

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context + Custom Hooks
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

### Backend & Services

- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **File Storage**: Firebase Storage
- **Deployment**: Vercel
- **Version Control**: Git + GitHub

### Development Tools

- **Package Manager**: npm
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript compiler
- **Testing**: Playwright (browser testing)
- **Pre-commit**: Husky + lint-staged

## 📁 Project Structure

```
smarter-goalie/
├── docs/                    # Project documentation
│   ├── sessions/           # **MANDATORY** Individual session logs
│   │   ├── template.md    # Template for new sessions
│   │   └── YYYY-MM/       # Sessions organized by month
│   ├── PLAN.md             # Detailed project plan
│   ├── TESTING.md          # Testing strategy and procedures
│   └── DEPLOYMENT.md       # Deployment guide
├── src/
│   ├── app/                # Next.js App Router
│   ├── components/         # Reusable components
│   ├── lib/               # Utilities and configurations
│   ├── types/             # TypeScript definitions
│   └── hooks/             # Custom React hooks
├── public/                # Static assets
├── .env.example          # Environment variables template
├── .env.local           # Local environment variables (git-ignored)
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── next.config.js       # Next.js configuration
├── .gitignore          # Git ignore rules
├── README.md           # Project overview and setup
├── PROGRESS.md         # **MANDATORY** High-level progress dashboard
└── CLAUDE.md           # This file
```

## 🚀 Development Workflow

### Progress Tracking (MANDATORY)

**CRITICAL**: Every work session MUST create a session file and update `PROGRESS.md`:

**At Session Start:**
1. Read `PROGRESS.md` to understand current status
2. Review "Next Steps" from most recent session in `docs/sessions/`
3. Check current sprint goals
4. Note your start time

**At Session End:**
1. Create session file in `docs/sessions/YYYY-MM/` using `docs/sessions/template.md`
   - Use naming convention: `YYYY-MM-DD-short-descriptive-title.md`
   - Fill in all sections: goals, work completed, files modified, commits, blockers, next steps
   - Include time spent (rounded to nearest 15 minutes)
2. Update `PROGRESS.md`:
   - Add session summary to "Recent Sessions" section
   - Update time tracking summaries (by phase, by category, weekly)
   - Update milestone progress percentages
   - Update sprint goals if tasks completed
3. Commit BOTH `PROGRESS.md` AND session file together

### Stage-Based Development

1. Each stage is a complete, testable increment
2. Every stage ends with:
   - ✅ All tests passing
   - ✅ Code review checklist completed
   - ✅ **PROGRESS.md updated with session details**
   - ✅ Git commit with descriptive message
   - ✅ GitHub push with stage completion
3. No stage can begin until the previous stage is fully complete

### Quality Gates

Before any stage completion:

- [ ] TypeScript compiles with zero errors
- [ ] ESLint passes with zero warnings
- [ ] Prettier formatting applied
- [ ] Browser testing completed successfully
- [ ] All functionality manually tested
- [ ] Performance acceptable (< 2s load time)
- [ ] Mobile responsiveness verified
- [ ] **Session file created in `docs/sessions/` with detailed work log**
- [ ] **PROGRESS.md updated with session summary and time tracking**
- [ ] Git commit created with clear message

### Testing Requirements

- **Unit Testing**: Critical utility functions
- **Browser Testing**: All user interfaces with Playwright
- **Integration Testing**: API endpoints and data flow
- **Manual Testing**: Complete user journeys
- **Performance Testing**: Page load and interaction speed

## 📝 Code Standards

### TypeScript

- Strict mode enabled
- No `any` types allowed
- All props and function returns explicitly typed
- Use interfaces for object shapes
- Use type unions for controlled values

### React Components

```typescript
// Component file structure
import React from 'react';
import { ComponentProps } from '@/types';

interface Props {
  // Explicitly typed props
}

export const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  // Component logic
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

### Naming Conventions

- **Files**: kebab-case for pages, PascalCase for components
- **Components**: PascalCase (e.g., `UserDashboard`)
- **Functions**: camelCase (e.g., `getUserProgress`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_ATTEMPTS`)
- **Types**: PascalCase with descriptive names

### Git Commit Messages

```
type(scope): description

feat(auth): add user registration flow
fix(quiz): resolve score calculation bug
docs(readme): update installation instructions
test(dashboard): add progress bar tests
refactor(api): simplify user service logic
```

## 🔒 Security Guidelines

### Environment Variables

- Never commit sensitive data
- Use `.env.example` for documentation
- Validate all environment variables at startup

### Authentication

- Implement proper session management
- Use Firebase Auth security rules
- Validate user permissions on all protected routes

### Data Protection

- Sanitize all user inputs
- Use Firestore security rules
- Implement proper error handling without data exposure

## 📊 Performance Standards

### Metrics Targets

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.0s
- **Cumulative Layout Shift**: < 0.1
- **Mobile PageSpeed**: > 90

### Optimization Strategies

- Code splitting for route-based loading
- Image optimization with Next.js Image component
- Lazy loading for non-critical components
- Efficient bundle size management

## 🧪 Testing Strategy

### Browser Testing with Playwright

```typescript
// Example test structure
test('user can complete quiz successfully', async ({ page }) => {
  await page.goto('/quiz/basketball-shooting');
  await page.click('[data-testid="start-quiz"]');

  // Answer questions
  await page.click('[data-testid="answer-1"]');
  await page.click('[data-testid="next-question"]');

  // Verify results
  await expect(page.locator('[data-testid="quiz-score"]')).toBeVisible();
});
```

### Testing Checklist per Stage

- [ ] All new features tested in browser
- [ ] Existing functionality regression tested
- [ ] Mobile responsive design verified
- [ ] Error states and edge cases tested
- [ ] Performance impact assessed

## 🚀 Deployment Process

### Environment Setup

1. **Development**: Local with Firebase emulators
2. **Staging**: Vercel preview deployment
3. **Production**: Vercel production with monitoring

### Deployment Checklist

- [ ] All environment variables configured
- [ ] Build process succeeds
- [ ] Database migrations applied (if any)
- [ ] Security rules updated
- [ ] Monitoring and error tracking active
- [ ] Performance monitoring enabled

## 📞 Troubleshooting

### Common Issues

1. **Build Failures**: Check TypeScript errors and dependencies
2. **Firebase Issues**: Verify environment variables and project config
3. **Styling Issues**: Ensure Tailwind classes are properly applied
4. **Performance Issues**: Use Next.js built-in performance tools

### Debug Process

1. Check browser console for errors
2. Verify network requests in developer tools
3. Use React Developer Tools for component debugging
4. Check Firebase console for backend issues

## 📈 Success Metrics

### Technical Metrics

- Zero TypeScript compilation errors
- Zero ESLint warnings
- 100% of planned features working
- < 2s average page load time
- > 95% uptime

### User Experience Metrics

- Intuitive navigation flow
- Clear progress visualization
- Responsive design on all devices
- Accessible to users with disabilities
- Consistent design language

## 🎯 Development Rules

### Mandatory Practices

1. **Progress Tracking**: Create session file in `docs/sessions/` and update PROGRESS.md at the end of EVERY session
2. **Test Before Commit**: Every change must be tested
3. **Document Decisions**: Update docs for significant changes
4. **Type Everything**: No implicit any types
5. **Error Handling**: Graceful degradation for all error states
6. **Performance First**: Consider performance impact of all changes

### Code Review Checklist

- [ ] Code follows established patterns
- [ ] TypeScript types are properly defined
- [ ] Error handling is implemented
- [ ] Performance implications considered
- [ ] Tests cover new functionality
- [ ] Documentation updated if needed

## 🔄 Maintenance

### Regular Tasks

- Dependency updates (monthly)
- Security audit (monthly)
- Performance monitoring (weekly)
- Error tracking review (weekly)
- Backup verification (weekly)

### Long-term Goals

- Continuous performance optimization
- Feature enhancement based on user feedback
- Scalability improvements
- Security hardening
- Code quality improvements

---

**Remember**: This is a production-quality application. Every line of code should meet professional standards. When in doubt, prioritize quality over speed, and always test thoroughly before committing changes.
