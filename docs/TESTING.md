# Testing Strategy - SportsCoach V3

## 🎯 Testing Philosophy

Our testing approach follows the **Testing Pyramid** with emphasis on **quality over quantity**. Every feature must be thoroughly tested before stage completion.

## 📊 Testing Levels

### 1. Unit Testing (Foundation)
**Focus**: Individual functions and components in isolation
**Tools**: Jest + React Testing Library
**Coverage Target**: 80% for critical business logic

#### What to Test
- Utility functions (data transformation, validation)
- Custom hooks (authentication, data fetching)
- Component logic (state management, event handlers)
- Form validation and error handling

#### Example Test Structure
```typescript
// Example: Quiz scoring function test
describe('calculateQuizScore', () => {
  it('should calculate correct percentage for all correct answers', () => {
    const answers = [
      { questionId: '1', answer: 'A', isCorrect: true },
      { questionId: '2', answer: 'B', isCorrect: true }
    ];
    const score = calculateQuizScore(answers);
    expect(score).toBe(100);
  });

  it('should handle edge case of zero questions', () => {
    const score = calculateQuizScore([]);
    expect(score).toBe(0);
  });
});
```

### 2. Integration Testing (Connections)
**Focus**: Component interactions and API integrations
**Tools**: React Testing Library + MSW (Mock Service Worker)
**Coverage**: All major user flows

#### What to Test
- Authentication flows (login, logout, session persistence)
- Data fetching and state updates
- Form submissions and API interactions
- Navigation and route protection

#### Example Test Structure
```typescript
// Example: Login flow integration test
describe('Login Flow', () => {
  it('should authenticate user and redirect to dashboard', async () => {
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});
```

### 3. Browser Testing (User Experience)
**Focus**: Real browser interactions and visual testing
**Tools**: Playwright (via MCP server)
**Coverage**: All critical user journeys

#### What to Test
- Complete user workflows (registration → quiz → results)
- Cross-browser compatibility (Chrome, Firefox, Safari)
- Mobile responsiveness (375px, 768px, 1024px+)
- Visual regression testing
- Performance and loading times

#### Example Browser Test
```typescript
// Example: Complete quiz workflow
test('User can complete quiz end-to-end', async ({ page }) => {
  // Navigate to quiz
  await page.goto('/quiz/basketball-shooting');
  await expect(page.locator('h1')).toContainText('Basketball Shooting Quiz');

  // Start quiz
  await page.click('[data-testid="start-quiz-button"]');

  // Answer questions
  await page.click('[data-testid="answer-option-A"]');
  await page.click('[data-testid="next-question"]');

  await page.click('[data-testid="answer-option-B"]');
  await page.click('[data-testid="submit-quiz"]');

  // Verify results
  await expect(page.locator('[data-testid="quiz-score"]')).toBeVisible();
  await expect(page.locator('[data-testid="quiz-score"]')).toContainText('%');
});
```

## 🧪 Testing Procedures by Stage

### Stage 1: Foundation Testing
**Focus**: Build process and development tools

#### Checklist
- [ ] `npm run dev` starts without errors
- [ ] `npm run build` completes successfully
- [ ] `npm run lint` passes with zero warnings
- [ ] `npm run type-check` shows zero errors
- [ ] Pre-commit hooks execute correctly
- [ ] Hot reload works during development
- [ ] Environment variables load properly

#### Browser Testing
```typescript
test('Basic application loads correctly', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
  await expect(page).toHaveTitle(/SportsCoach/);
});

test('Navigation components render', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('nav')).toBeVisible();
  await expect(page.locator('[data-testid="logo"]')).toBeVisible();
});
```

### Stage 2: Authentication Testing
**Focus**: Security and user access flows

#### Unit Tests
- Password validation functions
- Email format validation
- Token handling utilities
- Role permission checks

#### Integration Tests
- Firebase authentication flows
- Protected route middleware
- Session persistence
- Role-based access control

#### Browser Tests
```typescript
test('User registration and login flow', async ({ page }) => {
  // Registration
  await page.goto('/register');
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.fill('[data-testid="password-input"]', 'SecurePass123!');
  await page.fill('[data-testid="confirm-password"]', 'SecurePass123!');
  await page.click('[data-testid="register-button"]');

  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

  // Login
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.fill('[data-testid="password-input"]', 'SecurePass123!');
  await page.click('[data-testid="login-button"]');

  await expect(page).toHaveURL('/dashboard');
});

test('Protected routes redirect unauthenticated users', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL('/login');
});
```

### Stage 3: Database Testing
**Focus**: Data integrity and performance

#### Unit Tests
- CRUD operation functions
- Data validation schemas
- Query optimization functions
- Error handling utilities

#### Integration Tests
- Firestore service classes
- Real-time data synchronization
- Security rule enforcement
- Data migration procedures

#### Browser Tests
```typescript
test('Data persistence across sessions', async ({ page }) => {
  // Login and create data
  await authenticateUser(page, 'test@example.com', 'password');
  await page.goto('/profile');
  await page.fill('[data-testid="bio-input"]', 'Test bio content');
  await page.click('[data-testid="save-profile"]');

  // Logout and login again
  await page.click('[data-testid="logout-button"]');
  await authenticateUser(page, 'test@example.com', 'password');
  await page.goto('/profile');

  await expect(page.locator('[data-testid="bio-input"]')).toHaveValue('Test bio content');
});
```

### Stage 4-8: Feature-Specific Testing
Each stage includes specific testing scenarios relevant to the features being implemented.

## 🔍 Visual Regression Testing

### Screenshot Comparison Strategy
```typescript
test('Visual regression for dashboard', async ({ page }) => {
  await authenticateUser(page, 'test@example.com', 'password');
  await page.goto('/dashboard');

  // Wait for content to load
  await page.waitForSelector('[data-testid="progress-chart"]');

  // Take screenshots for comparison
  await expect(page).toHaveScreenshot('dashboard-main.png');

  // Test mobile view
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page).toHaveScreenshot('dashboard-mobile.png');
});
```

### Mobile Responsiveness Testing
```typescript
const devices = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1280, height: 720 },
  { name: 'Large Desktop', width: 1920, height: 1080 }
];

devices.forEach(device => {
  test(`Responsive design on ${device.name}`, async ({ page }) => {
    await page.setViewportSize({ width: device.width, height: device.height });
    await page.goto('/dashboard');

    // Check layout doesn't break
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();

    // Check no horizontal scroll
    const bodyWidth = await page.locator('body').boundingBox();
    expect(bodyWidth?.width).toBeLessThanOrEqual(device.width);
  });
});
```

## ⚡ Performance Testing

### Core Web Vitals Monitoring
```typescript
test('Performance metrics within acceptable ranges', async ({ page }) => {
  await page.goto('/dashboard');

  // Measure performance
  const performanceEntry = await page.evaluate(() => {
    return JSON.parse(JSON.stringify(performance.getEntriesByType('navigation')[0]));
  });

  // Assert performance thresholds
  expect(performanceEntry.loadEventEnd - performanceEntry.loadEventStart).toBeLessThan(2000);
  expect(performanceEntry.domContentLoadedEventEnd - performanceEntry.domContentLoadedEventStart).toBeLessThan(1500);
});
```

### Bundle Size Testing
```bash
# Monitor bundle size after each build
npm run build
npx bundlesize

# Expected thresholds:
# - Main bundle: < 250KB
# - Individual routes: < 50KB
# - Third-party vendors: < 150KB
```

## 🔒 Security Testing

### Authentication Security
```typescript
test('Session security measures', async ({ page }) => {
  await authenticateUser(page, 'test@example.com', 'password');

  // Check secure headers
  const response = await page.goto('/dashboard');
  const headers = response?.headers();

  expect(headers?.['x-frame-options']).toBe('DENY');
  expect(headers?.['x-content-type-options']).toBe('nosniff');
});

test('CSRF protection', async ({ page }) => {
  // Attempt to submit form without proper token
  const response = await page.request.post('/api/quiz/submit', {
    data: { quizId: 'test', answers: [] }
  });

  expect(response.status()).toBe(403);
});
```

### Data Validation Testing
```typescript
test('Input sanitization and validation', async ({ page }) => {
  await authenticateUser(page, 'admin@example.com', 'password');
  await page.goto('/admin/sports/new');

  // Test XSS prevention
  await page.fill('[data-testid="sport-name"]', '<script>alert("xss")</script>');
  await page.click('[data-testid="save-sport"]');

  // Verify script is escaped, not executed
  await expect(page.locator('[data-testid="sport-name"]')).not.toContainText('<script>');
});
```

## 📱 Accessibility Testing

### WCAG 2.1 AA Compliance
```typescript
test('Accessibility standards compliance', async ({ page }) => {
  await page.goto('/dashboard');

  // Check for alt text on images
  const images = await page.locator('img').all();
  for (const img of images) {
    const alt = await img.getAttribute('alt');
    expect(alt).toBeTruthy();
  }

  // Check form labels
  const inputs = await page.locator('input').all();
  for (const input of inputs) {
    const labels = await page.locator(`label[for="${await input.getAttribute('id')}"]`).count();
    expect(labels).toBeGreaterThan(0);
  }

  // Check color contrast (using axe-playwright)
  await expect(page).toPassAccessibilityAudit();
});
```

### Keyboard Navigation Testing
```typescript
test('Full keyboard navigation support', async ({ page }) => {
  await page.goto('/dashboard');

  // Test tab navigation
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toBeVisible();

  // Test skip links
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});
```

## 🚨 Error Handling Testing

### Network Failure Scenarios
```typescript
test('Graceful handling of network failures', async ({ page }) => {
  // Simulate offline mode
  await page.context().setOffline(true);
  await page.goto('/dashboard');

  await expect(page.locator('[data-testid="offline-message"]')).toBeVisible();

  // Test retry mechanism
  await page.context().setOffline(false);
  await page.click('[data-testid="retry-button"]');

  await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
});
```

### Edge Case Testing
```typescript
test('Handles edge cases gracefully', async ({ page }) => {
  await authenticateUser(page, 'test@example.com', 'password');

  // Test empty state
  await page.goto('/quiz/empty-quiz');
  await expect(page.locator('[data-testid="no-questions-message"]')).toBeVisible();

  // Test with malformed data
  await page.goto('/quiz/malformed-data');
  await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
});
```

## 📋 Testing Checklist Template

### Pre-Stage Testing
- [ ] Previous stage tests still pass
- [ ] Environment setup complete
- [ ] Test data prepared
- [ ] Testing tools configured

### During Development
- [ ] Unit tests written for new functions
- [ ] Components tested in isolation
- [ ] Integration tests cover new flows
- [ ] Browser tests verify user experience

### Stage Completion Testing
- [ ] All new functionality tested
- [ ] Regression tests pass
- [ ] Performance within acceptable limits
- [ ] Mobile responsiveness verified
- [ ] Accessibility standards met
- [ ] Security vulnerabilities addressed

### Production Readiness
- [ ] Load testing completed
- [ ] Error monitoring active
- [ ] Backup and recovery tested
- [ ] Documentation updated
- [ ] Team trained on new features

## 🔧 Testing Tools Configuration

### Jest Configuration (jest.config.js)
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**/*',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Playwright Configuration (playwright.config.ts)
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

**This testing strategy ensures comprehensive coverage at every level, from individual functions to complete user workflows. Each stage must pass all relevant tests before proceeding to the next stage.**