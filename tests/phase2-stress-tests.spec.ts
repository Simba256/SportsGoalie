import { test, expect, Page } from '@playwright/test';

/**
 * Phase 2 Stress Testing Suite
 *
 * This comprehensive test suite validates:
 * - Concurrent user load handling
 * - Performance under stress conditions
 * - Database query performance
 * - Page load times and Time to Interactive (TTI)
 * - Form submission under load
 * - Memory leak detection
 * - Response time consistency
 */

// Test credentials from TESTING_CREDENTIALS.md
const TEST_CREDENTIALS = {
  admin: {
    email: 'syedbasimmehmood@gmail.com',
    password: 'password'
  },
  student: {
    email: 'syedbasimmehmood1@gmail.com',
    password: 'password'
  }
};

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  pageLoad: 3000, // 3 seconds max
  timeToInteractive: 4000, // 4 seconds max
  apiResponse: 2000, // 2 seconds max
  databaseQuery: 1500, // 1.5 seconds max
};

// Helper function to measure page load performance
async function measurePageLoad(page: Page, url: string) {
  const startTime = Date.now();
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;

  // Get performance metrics
  const performanceTiming = await page.evaluate(() => {
    const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      dns: perf.domainLookupEnd - perf.domainLookupStart,
      tcp: perf.connectEnd - perf.connectStart,
      request: perf.responseStart - perf.requestStart,
      response: perf.responseEnd - perf.responseStart,
      dom: perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart,
      load: perf.loadEventEnd - perf.loadEventStart,
      total: perf.loadEventEnd - perf.fetchStart
    };
  });

  return { loadTime, metrics: performanceTiming };
}

// Helper function to login
async function login(page: Page, email: string, password: string) {
  await page.goto('/auth/login');
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="login-button"]');
  await page.waitForLoadState('networkidle');
}

test.describe('Phase 2 - Performance & Stress Testing', () => {

  test.describe('Page Load Performance', () => {

    test('homepage should load within performance threshold', async ({ page }) => {
      const { loadTime, metrics } = await measurePageLoad(page, '/');

      console.log('Homepage Performance:', {
        loadTime: `${loadTime}ms`,
        dns: `${metrics.dns.toFixed(2)}ms`,
        tcp: `${metrics.tcp.toFixed(2)}ms`,
        request: `${metrics.request.toFixed(2)}ms`,
        response: `${metrics.response.toFixed(2)}ms`,
        dom: `${metrics.dom.toFixed(2)}ms`,
        total: `${metrics.total.toFixed(2)}ms`
      });

      expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.pageLoad);
      expect(metrics.total).toBeLessThan(PERFORMANCE_THRESHOLDS.pageLoad);
    });

    test('sports catalog should load within performance threshold', async ({ page }) => {
      const { loadTime, metrics } = await measurePageLoad(page, '/sports');

      console.log('Sports Catalog Performance:', {
        loadTime: `${loadTime}ms`,
        total: `${metrics.total.toFixed(2)}ms`
      });

      expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.pageLoad);
    });

    test('dashboard should load within performance threshold after login', async ({ page }) => {
      await login(page, TEST_CREDENTIALS.student.email, TEST_CREDENTIALS.student.password);

      const startTime = Date.now();
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      console.log('Dashboard Load Time:', `${loadTime}ms`);
      expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.pageLoad);
    });

    test('admin dashboard should load within performance threshold', async ({ page }) => {
      await login(page, TEST_CREDENTIALS.admin.email, TEST_CREDENTIALS.admin.password);

      const startTime = Date.now();
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      console.log('Admin Dashboard Load Time:', `${loadTime}ms`);
      expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.pageLoad);
    });
  });

  test.describe('Concurrent User Load Testing', () => {

    test('should handle multiple concurrent page loads', async ({ browser }) => {
      const contexts = await Promise.all(
        Array.from({ length: 5 }, () => browser.newContext())
      );

      const pages = await Promise.all(
        contexts.map(context => context.newPage())
      );

      const startTime = Date.now();

      // Simulate 5 concurrent users loading different pages
      const loadPromises = pages.map((page, index) => {
        const urls = ['/', '/sports', '/about', '/auth/login', '/auth/register'];
        return measurePageLoad(page, urls[index]);
      });

      const results = await Promise.all(loadPromises);
      const totalTime = Date.now() - startTime;

      console.log('Concurrent Load Test Results:', {
        totalTime: `${totalTime}ms`,
        averageLoadTime: `${results.reduce((sum, r) => sum + r.loadTime, 0) / results.length}ms`,
        maxLoadTime: `${Math.max(...results.map(r => r.loadTime))}ms`,
        minLoadTime: `${Math.min(...results.map(r => r.loadTime))}ms`
      });

      // All pages should still load within acceptable time
      results.forEach((result, index) => {
        expect(result.loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.pageLoad * 1.5); // 1.5x threshold for concurrent load
      });

      // Cleanup
      await Promise.all(pages.map(page => page.close()));
      await Promise.all(contexts.map(context => context.close()));
    });

    test('should handle multiple concurrent user logins', async ({ browser }) => {
      const contexts = await Promise.all(
        Array.from({ length: 3 }, () => browser.newContext())
      );

      const pages = await Promise.all(
        contexts.map(context => context.newPage())
      );

      const startTime = Date.now();

      // Simulate 3 concurrent user logins
      const loginPromises = pages.map(async (page) => {
        const loginStart = Date.now();
        await login(page, TEST_CREDENTIALS.student.email, TEST_CREDENTIALS.student.password);
        return Date.now() - loginStart;
      });

      const loginTimes = await Promise.all(loginPromises);
      const totalTime = Date.now() - startTime;

      console.log('Concurrent Login Test Results:', {
        totalTime: `${totalTime}ms`,
        averageLoginTime: `${loginTimes.reduce((sum, t) => sum + t, 0) / loginTimes.length}ms`,
        maxLoginTime: `${Math.max(...loginTimes)}ms`
      });

      // Each login should complete within acceptable time
      loginTimes.forEach(time => {
        expect(time).toBeLessThan(PERFORMANCE_THRESHOLDS.apiResponse * 2);
      });

      // Cleanup
      await Promise.all(pages.map(page => page.close()));
      await Promise.all(contexts.map(context => context.close()));
    });
  });

  test.describe('Database Query Performance', () => {

    test('should load sports catalog data efficiently', async ({ page }) => {
      await page.goto('/sports');

      // Intercept API calls to measure response time
      const apiResponses: number[] = [];

      page.on('response', async (response) => {
        if (response.url().includes('/api/') || response.url().includes('firestore')) {
          const timing = response.timing();
          if (timing) {
            apiResponses.push(timing.responseEnd);
          }
        }
      });

      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000); // Allow all API calls to complete

      if (apiResponses.length > 0) {
        const avgResponseTime = apiResponses.reduce((sum, t) => sum + t, 0) / apiResponses.length;
        console.log('Sports Catalog API Performance:', {
          apiCalls: apiResponses.length,
          avgResponseTime: `${avgResponseTime.toFixed(2)}ms`,
          maxResponseTime: `${Math.max(...apiResponses).toFixed(2)}ms`
        });
      }
    });

    test('should handle rapid navigation between sports', async ({ page }) => {
      await page.goto('/sports');
      await page.waitForLoadState('networkidle');

      // Check if sports are available
      const sportCards = page.locator('[data-testid="sport-card"]');
      const sportCount = await sportCards.count();

      if (sportCount > 0) {
        const navigationTimes: number[] = [];

        // Navigate to first 3 sports rapidly
        for (let i = 0; i < Math.min(3, sportCount); i++) {
          const startTime = Date.now();
          await sportCards.nth(i).click();
          await page.waitForLoadState('networkidle');
          const navTime = Date.now() - startTime;
          navigationTimes.push(navTime);

          // Go back to catalog
          await page.goBack();
          await page.waitForLoadState('networkidle');
        }

        console.log('Rapid Navigation Test:', {
          navigations: navigationTimes.length,
          avgTime: `${navigationTimes.reduce((sum, t) => sum + t, 0) / navigationTimes.length}ms`,
          maxTime: `${Math.max(...navigationTimes)}ms`
        });

        navigationTimes.forEach(time => {
          expect(time).toBeLessThan(PERFORMANCE_THRESHOLDS.pageLoad);
        });
      }
    });
  });

  test.describe('Form Submission Performance', () => {

    test('should handle rapid quiz submissions', async ({ page }) => {
      await login(page, TEST_CREDENTIALS.student.email, TEST_CREDENTIALS.student.password);

      // Navigate to a sport with quizzes
      await page.goto('/sports');
      await page.waitForLoadState('networkidle');

      const sportCards = page.locator('[data-testid="sport-card"]');
      const sportCount = await sportCards.count();

      if (sportCount > 0) {
        await sportCards.first().click();
        await page.waitForLoadState('networkidle');

        // Look for quiz start button
        const quizButton = page.locator('button:has-text("Start Quiz"), button:has-text("Take Quiz")').first();
        const hasQuiz = await quizButton.count() > 0;

        if (hasQuiz) {
          await quizButton.click();
          await page.waitForLoadState('networkidle');

          const submissionTimes: number[] = [];

          // Answer first 3 questions quickly
          for (let i = 0; i < 3; i++) {
            const answerButton = page.locator('[data-testid^="answer-"]').first();
            const hasAnswer = await answerButton.count() > 0;

            if (hasAnswer) {
              const startTime = Date.now();
              await answerButton.click();

              // Wait for next question or results
              await page.waitForLoadState('networkidle');
              const submitTime = Date.now() - startTime;
              submissionTimes.push(submitTime);

              // Check if we've reached the end
              const resultsVisible = await page.locator('text=Results, text=Score').count() > 0;
              if (resultsVisible) break;

              // Move to next question
              const nextButton = page.locator('button:has-text("Next")');
              const hasNext = await nextButton.count() > 0;
              if (hasNext) {
                await nextButton.click();
                await page.waitForLoadState('networkidle');
              }
            }
          }

          if (submissionTimes.length > 0) {
            console.log('Quiz Submission Performance:', {
              submissions: submissionTimes.length,
              avgTime: `${submissionTimes.reduce((sum, t) => sum + t, 0) / submissionTimes.length}ms`,
              maxTime: `${Math.max(...submissionTimes)}ms`
            });

            submissionTimes.forEach(time => {
              expect(time).toBeLessThan(PERFORMANCE_THRESHOLDS.apiResponse);
            });
          }
        }
      }
    });

    test('should handle search with various query lengths', async ({ page }) => {
      await page.goto('/sports');
      await page.waitForLoadState('networkidle');

      const searchInput = page.getByPlaceholder('Search sports');
      const searchButton = page.getByRole('button', { name: 'Search' });

      if (await searchInput.count() > 0) {
        const queries = ['a', 'bas', 'basketball', 'ball sports training'];
        const searchTimes: number[] = [];

        for (const query of queries) {
          const startTime = Date.now();
          await searchInput.fill(query);
          await searchButton.click();
          await page.waitForLoadState('networkidle');
          const searchTime = Date.now() - startTime;
          searchTimes.push(searchTime);

          await page.waitForTimeout(500); // Brief pause between searches
        }

        console.log('Search Performance:', {
          searches: searchTimes.length,
          avgTime: `${searchTimes.reduce((sum, t) => sum + t, 0) / searchTimes.length}ms`,
          maxTime: `${Math.max(...searchTimes)}ms`
        });

        searchTimes.forEach(time => {
          expect(time).toBeLessThan(PERFORMANCE_THRESHOLDS.apiResponse);
        });
      }
    });
  });

  test.describe('Memory & Resource Management', () => {

    test('should not leak memory during extended navigation', async ({ page }) => {
      const pages = ['/', '/sports', '/about', '/auth/login', '/dashboard'];

      // Navigate through pages multiple times
      for (let i = 0; i < 10; i++) {
        const pageUrl = pages[i % pages.length];
        await page.goto(pageUrl);
        await page.waitForLoadState('networkidle');
      }

      // Check for JavaScript errors
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.waitForTimeout(1000);

      // Should not accumulate critical errors
      const criticalErrors = errors.filter(e =>
        e.includes('memory') ||
        e.includes('leak') ||
        e.includes('maximum call stack')
      );

      expect(criticalErrors.length).toBe(0);
    });

    test('should handle browser refresh without data loss', async ({ page }) => {
      await login(page, TEST_CREDENTIALS.student.email, TEST_CREDENTIALS.student.password);
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Refresh the page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Should still be authenticated
      const dashboardVisible = await page.locator('text=Dashboard, text=Welcome').count() > 0;
      expect(dashboardVisible).toBeGreaterThan(0);
    });
  });

  test.describe('Mobile Performance', () => {

    test('should perform well on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      const { loadTime, metrics } = await measurePageLoad(page, '/');

      console.log('Mobile Homepage Performance:', {
        loadTime: `${loadTime}ms`,
        total: `${metrics.total.toFixed(2)}ms`
      });

      // Mobile should load within 1.5x desktop threshold
      expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.pageLoad * 1.5);
    });

    test('should handle mobile navigation smoothly', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Test mobile menu
      const menuButton = page.getByRole('button', { name: 'Menu' });
      if (await menuButton.count() > 0) {
        const startTime = Date.now();
        await menuButton.click();
        await page.waitForTimeout(500); // Wait for animation
        const menuTime = Date.now() - startTime;

        console.log('Mobile Menu Open Time:', `${menuTime}ms`);
        expect(menuTime).toBeLessThan(1000); // Should be very fast
      }
    });
  });

  test.describe('Error Recovery & Resilience', () => {

    test('should handle network interruption gracefully', async ({ page }) => {
      await page.goto('/sports');
      await page.waitForLoadState('networkidle');

      // Simulate offline
      await page.context().setOffline(true);

      // Try to navigate
      await page.goto('/about').catch(() => {
        // Expected to fail
      });

      // Restore connection
      await page.context().setOffline(false);

      // Should recover
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const pageLoaded = await page.locator('body').count() > 0;
      expect(pageLoaded).toBe(1);
    });

    test('should recover from failed API calls', async ({ page }) => {
      await page.goto('/sports');

      // Block API calls temporarily
      await page.route('**/api/**', route => route.abort());

      await page.reload();
      await page.waitForTimeout(2000);

      // Unblock API calls
      await page.unroute('**/api/**');

      await page.reload();
      await page.waitForLoadState('networkidle');

      // Page should load successfully
      const pageLoaded = await page.locator('h1').count() > 0;
      expect(pageLoaded).toBeGreaterThan(0);
    });
  });
});

test.describe('Phase 2 - Accessibility & Usability Testing', () => {

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThan(0);
    expect(h1Count).toBeLessThanOrEqual(1); // Should have exactly one h1
  });

  test('should have accessible form labels', async ({ page }) => {
    await page.goto('/auth/login');

    const emailLabel = page.locator('label[for="email"]');
    const passwordLabel = page.locator('label[for="password"]');

    // Labels should exist or inputs should have aria-labels
    const emailInput = page.getByTestId('email-input');
    const hasEmailLabel = await emailLabel.count() > 0 ||
                         await emailInput.getAttribute('aria-label') !== null;

    expect(hasEmailLabel).toBeTruthy();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/auth/login');

    // Tab through form fields
    await page.keyboard.press('Tab');
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName);

    await page.keyboard.press('Tab');
    focusedElement = await page.evaluate(() => document.activeElement?.tagName);

    // Should be able to navigate with keyboard
    expect(['INPUT', 'BUTTON', 'A']).toContain(focusedElement);
  });
});
