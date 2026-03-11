# Smarter Goalie 🏆

A modern, production-ready sports learning platform designed to help athletes and sports enthusiasts learn skills, track progress, and assess their knowledge through interactive content.

## 🎯 Project Overview

Smarter Goalie is a comprehensive digital sports coaching platform that combines structured learning, progress tracking, interactive assessments, and content management in a clean, responsive, mobile-first design.

### Key Features

- **🔐 Authentication System**: Secure user registration and login with role-based access
- **📚 Sports & Skills Management**: Organized content with rich media support
- **🧠 Interactive Quiz System**: Multiple question types with immediate feedback
- **📈 Progress Tracking**: Visual progress monitoring with achievement system
- **👨‍💼 Admin Dashboard**: Comprehensive content and user management tools
- **📱 Mobile-First Design**: Responsive design optimized for all devices
- **⚡ High Performance**: Optimized for speed and Core Web Vitals

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Components**: shadcn/ui component library
- **Backend**: Firebase (Firestore, Auth, Storage)
- **Deployment**: Vercel with CI/CD pipeline
- **Testing**: Playwright for browser testing, Jest for unit tests
- **Development**: ESLint, Prettier, Husky for code quality

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Firebase account (for backend services)
- Git for version control

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd smarter-goalie
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your Firebase configuration:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   # ... other Firebase config
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📋 Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
npm run format       # Format code with Prettier
npm run type-check   # Check TypeScript types

# Testing
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run end-to-end tests
npm run test:coverage # Run tests with coverage report
```

## 🏗️ Project Structure

```
smarter-goalie/
├── docs/                    # Project documentation
│   ├── PLAN.md             # Detailed development plan
│   ├── TESTING.md          # Testing strategy
│   └── DEPLOYMENT.md       # Deployment guide
├── src/
│   ├── app/                # Next.js App Router pages
│   ├── components/         # Reusable React components
│   ├── lib/               # Utilities and configurations
│   ├── types/             # TypeScript type definitions
│   └── hooks/             # Custom React hooks
├── public/                # Static assets
├── tests/                 # Test files
├── .env.example          # Environment variables template
├── package.json          # Dependencies and scripts
├── CLAUDE.md             # AI assistant guidance
└── README.md             # This file
```

## 📖 Documentation

### Core Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Comprehensive guidance for AI-assisted development
- **[Development Plan](./docs/PLAN.md)** - Detailed 8-stage development roadmap
- **[Testing Strategy](./docs/TESTING.md)** - Comprehensive testing procedures
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Production deployment strategy

### Development Stages

The project follows an 8-stage development approach:

1. **Foundation & Setup** - Project initialization and tooling
2. **Authentication System** - User registration and login
3. **Database Architecture** - Data models and Firebase setup
4. **Content Management** - Sports and skills management
5. **Quiz System** - Interactive assessments
6. **Progress Tracking** - Analytics and visualization
7. **Admin Dashboard** - Management tools
8. **Production Optimization** - Performance and deployment

Each stage includes:

- ✅ Clear objectives and deliverables
- ✅ Comprehensive testing checklist
- ✅ Quality gates and success criteria
- ✅ Git commit and deployment procedures

## 🧪 Testing

### Testing Philosophy

Our testing follows the Testing Pyramid approach:

- **Unit Tests**: Critical business logic and utilities
- **Integration Tests**: Component interactions and API flows
- **Browser Tests**: Complete user workflows with Playwright

### Running Tests

```bash
# Unit tests
npm run test

# Browser tests (requires development server running)
npm run test:e2e

# All tests with coverage
npm run test:coverage
```

### Testing Checklist

- [ ] All new features have unit tests
- [ ] Integration tests cover API interactions
- [ ] Browser tests verify user workflows
- [ ] Mobile responsiveness tested
- [ ] Performance benchmarks met

## 🚀 Deployment

### Environment Setup

- **Development**: Local with Firebase emulators
- **Staging**: Vercel preview deployments
- **Production**: Vercel with custom domain

### Deployment Process

1. Complete stage development
2. Run full test suite
3. Create pull request
4. Review and merge to main
5. Automatic deployment to staging
6. Manual promotion to production

### Production Checklist

- [ ] Environment variables configured
- [ ] Firebase project set up
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Monitoring and error tracking enabled

## 🔧 Configuration

### Firebase Setup

1. Create Firebase project
2. Enable Authentication, Firestore, and Storage
3. Configure authentication methods (email/password)
4. Set up Firestore security rules
5. Add your domain to authorized domains

### Vercel Deployment

1. Connect GitHub repository
2. Configure environment variables
3. Set up custom domain (optional)
4. Enable analytics and monitoring

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes following coding standards
4. Run tests and ensure they pass
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Create Pull Request

### Code Standards

- TypeScript strict mode enabled
- ESLint and Prettier configured
- Husky pre-commit hooks for quality
- Comprehensive test coverage required
- Mobile-first responsive design

### Pull Request Requirements

- [ ] All tests passing
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Mobile responsiveness verified
- [ ] Performance impact assessed

## 📊 Performance

### Target Metrics

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.0s
- **Cumulative Layout Shift**: < 0.1
- **Mobile PageSpeed**: > 90

### Optimization Features

- Next.js automatic code splitting
- Image optimization with next/image
- Lazy loading for non-critical components
- Efficient bundle management

## 🔒 Security

### Security Features

- Firebase Authentication with security rules
- Input validation and sanitization
- CSRF protection
- Secure headers configuration
- Environment variable encryption

### Best Practices

- Regular dependency updates
- Security audit with npm audit
- Firebase security rules testing
- Error handling without data exposure

## 📞 Support

### Getting Help

- Check existing documentation in `/docs`
- Review GitHub issues and discussions
- Contact development team for urgent issues

### Reporting Issues

1. Check if issue already exists
2. Provide detailed reproduction steps
3. Include browser/device information
4. Add screenshots for UI issues

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Backend powered by [Firebase](https://firebase.google.com/)
- Deployed on [Vercel](https://vercel.com/)

---

**Smarter Goalie** - Empowering athletes through digital learning and progress tracking.

<!-- Testing pre-commit hooks -->

For detailed development guidance, see [CLAUDE.md](./CLAUDE.md) and the documentation in `/docs`.
