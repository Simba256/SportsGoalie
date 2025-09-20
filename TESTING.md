# Testing Infrastructure

This document outlines the comprehensive testing setup for SportsCoach V3, including unit tests, integration tests, and end-to-end tests.

## 🧪 Testing Stack

### **Unit & Integration Testing**
- **Framework**: [Vitest](https://vitest.dev/) - Fast unit test framework
- **React Testing**: [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/)
- **DOM Testing**: [@testing-library/jest-dom](https://github.com/testing-library/jest-dom)
- **User Interactions**: [@testing-library/user-event](https://testing-library.com/docs/user-event/intro/)
- **Environment**: [jsdom](https://github.com/jsdom/jsdom) for DOM simulation

### **End-to-End Testing**
- **Framework**: [Playwright](https://playwright.dev/) - Cross-browser automation
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Features**: Screenshots, traces, parallel execution

## 📁 Test Structure

```
src/
├── __tests__/                 # Unit & integration tests
│   ├── setup.ts              # Test configuration
│   ├── utils/
│   │   └── test-utils.tsx     # Testing utilities & helpers
│   ├── lib/
│   │   ├── auth/              # Authentication business logic tests
│   │   └── errors/            # Error system tests
│   └── components/            # Component integration tests
│       └── auth/              # Auth component tests
tests/                         # E2E tests
├── auth.spec.ts              # Authentication flow tests
└── basic.spec.ts             # Basic functionality tests
```

## 🚀 Running Tests

### **Unit & Integration Tests**

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:ui

# Run tests once and exit
npm run test:run

# Run tests with coverage
npm run test:coverage
```

### **End-to-End Tests**

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI mode
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug
```

## 🧩 Test Categories

### **1. Unit Tests**

**Authentication Error System** (`src/__tests__/lib/errors/auth-errors.test.ts`)
- ✅ Error creation and properties
- ✅ Firebase error mapping
- ✅ Error type guards
- ✅ User-friendly message conversion
- ✅ Error context creation

**Authentication Context** (`src/__tests__/lib/auth/context.test.tsx`)
- ✅ Login flow with email verification
- ✅ Registration with immediate logout
- ✅ Password reset functionality
- ✅ Profile updates
- ✅ Error handling for all operations

### **2. Integration Tests**

**Protected Routes** (`src/__tests__/components/auth/protected-route.test.tsx`)
- ✅ Role-based access control
- ✅ Authentication state handling
- ✅ Redirect logic
- ✅ Loading states
- ✅ Custom fallbacks

### **3. End-to-End Tests**

**Authentication Flows** (`tests/auth.spec.ts`)
- ✅ Complete login/logout workflows
- ✅ Registration with email verification
- ✅ Password reset flow
- ✅ Form validation
- ✅ Error message display
- ✅ Navigation between auth pages
- ✅ Loading states
- ✅ Accessibility testing
- ✅ Network error handling

## 🛠️ Testing Utilities

### **Mock Data**

```typescript
import { mockUsers } from '@/__tests__/utils/test-utils';

// Available mock users
mockUsers.verifiedStudent    // Verified student account
mockUsers.verifiedAdmin      // Verified admin account
mockUsers.unverifiedUser     // Unverified account
```

### **Custom Render Function**

```typescript
import { renderWithProviders } from '@/__tests__/utils/test-utils';

// Render component with auth state
renderWithProviders(
  <Component />,
  {
    authState: {
      user: mockUsers.verifiedStudent,
      loading: false,
      isAuthenticated: true,
    },
  }
);
```

### **Firebase Mocking**

```typescript
import { mockFirebaseAuth, mockFirebaseFirestore } from '@/__tests__/utils/test-utils';

// Mock Firebase operations
mockFirebaseAuth.signInWithEmailAndPassword.mockResolvedValue(userCredential);
mockFirebaseFirestore.setDoc.mockResolvedValue(undefined);
```

## 📊 Test Coverage

### **Target Coverage**
- **Unit Tests**: >90% for business logic
- **Integration Tests**: >80% for component interactions
- **E2E Tests**: 100% of critical user journeys

### **Coverage Reports**
```bash
npm run test:coverage
```

Reports generated in:
- `coverage/index.html` - Interactive HTML report
- `coverage/lcov.info` - LCOV format for CI/CD
- `coverage/coverage-final.json` - JSON format

## 🎯 Testing Best Practices

### **Unit Testing**
1. **Test behavior, not implementation**
2. **Use descriptive test names**
3. **Arrange, Act, Assert pattern**
4. **Mock external dependencies**
5. **Test error conditions**

### **Integration Testing**
1. **Test component interactions**
2. **Use realistic user scenarios**
3. **Test with real providers when possible**
4. **Verify side effects**

### **E2E Testing**
1. **Test complete user journeys**
2. **Use data-testid attributes for reliability**
3. **Test on multiple browsers**
4. **Include accessibility checks**
5. **Test error scenarios**

## 🔧 Test Configuration

### **Vitest Configuration** (`vitest.config.ts`)
- TypeScript support
- Path aliases (@/)
- JSDOM environment
- Coverage configuration
- Setup files

### **Playwright Configuration** (`playwright.config.ts`)
- Multi-browser testing
- Mobile device simulation
- Screenshots on failure
- Trace collection
- Parallel execution

## 🚨 Mocking Strategy

### **Firebase Mocking**
- Authentication functions mocked in setup
- Firestore operations mocked
- Auth state changes simulated

### **Next.js Mocking**
- Router navigation mocked
- Search params mocked
- Pathname mocking

### **External APIs**
- Network requests intercepted
- Error scenarios simulated
- Timeout conditions tested

## 📈 Continuous Integration

### **Pre-commit Hooks**
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "npm run test:run --passWithNoTests",
      "npm run lint",
      "npm run type-check"
    ]
  }
}
```

### **CI Pipeline** (GitHub Actions recommended)
1. **Install dependencies**
2. **Run type checking**
3. **Run linting**
4. **Run unit tests with coverage**
5. **Run E2E tests**
6. **Upload coverage reports**

## 🐛 Debugging Tests

### **Unit Test Debugging**
```bash
# Run specific test file
npm run test auth-errors.test.ts

# Run with debugging
npm run test:ui
```

### **E2E Test Debugging**
```bash
# Run with UI mode
npm run test:e2e:ui

# Run with debugging
npm run test:e2e:debug

# Run specific test
npx playwright test auth.spec.ts
```

### **Common Issues**

1. **Timing Issues**: Use `waitFor` and `findBy` queries
2. **Async Operations**: Properly await async operations
3. **State Updates**: Use `act` for React state updates
4. **Mock Cleanup**: Clear mocks between tests

## 📋 Test Checklist

### **Before Writing Tests**
- [ ] Understand the component/function requirements
- [ ] Identify edge cases and error conditions
- [ ] Plan test data and scenarios
- [ ] Consider accessibility requirements

### **During Testing**
- [ ] Write descriptive test names
- [ ] Test happy path and error cases
- [ ] Mock external dependencies
- [ ] Verify side effects
- [ ] Check accessibility

### **After Writing Tests**
- [ ] Review test coverage
- [ ] Ensure tests are reliable
- [ ] Update documentation
- [ ] Add E2E tests for new features

## 🎯 Success Metrics

### **Quality Gates**
- All tests must pass before deployment
- Coverage thresholds must be met
- No critical accessibility violations
- Performance budgets respected

### **Test Metrics**
- Test execution time < 30 seconds (unit)
- Test execution time < 5 minutes (E2E)
- Flaky test rate < 1%
- Test maintenance overhead minimal

---

This testing infrastructure ensures **enterprise-grade quality** with comprehensive coverage of authentication flows, business logic, and user interactions. The combination of unit, integration, and E2E tests provides confidence in code changes and enables safe refactoring.