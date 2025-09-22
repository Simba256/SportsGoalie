import { test, expect, Page } from '@playwright/test';

/**
 * Stage 7 Admin Dashboard & User Management System - Comprehensive Test Suite
 *
 * This test suite covers:
 * - Admin authentication and authorization
 * - Dashboard navigation and real-time data display
 * - User management features
 * - Analytics dashboard functionality
 * - Mobile responsiveness
 * - Performance and security testing
 */

// Test data and configuration
const TEST_EMAIL = 'admin@sportscoach.test';
const TEST_PASSWORD = 'AdminTest123!';
const BASE_URL = 'http://localhost:3001';

// Helper functions
async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', TEST_EMAIL);
  await page.fill('[data-testid="password-input"]', TEST_PASSWORD);
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/dashboard');
}

async function navigateToAdmin(page: Page) {
  await page.goto('/admin');
  // Wait for authentication and redirect if needed
  await page.waitForLoadState('networkidle');
}

test.describe('Admin Authentication & Authorization', () => {
  test('should redirect to login when accessing admin routes without authentication', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to dashboard when non-admin user accesses admin routes', async ({ page }) => {
    // First login as regular user (if possible to create one)
    await page.goto('/login');
    // This would need a regular user account - we'll implement this after user creation
  });

  test('should allow admin access to admin routes', async ({ page }) => {
    await navigateToAdmin(page);

    // Should either be on admin page or login page
    const currentUrl = page.url();

    if (currentUrl.includes('/login')) {
      // Need to login first
      await loginAsAdmin(page);
      await page.goto('/admin');
    }

    await expect(page).toHaveURL('/admin');
  });
});

test.describe('Admin Dashboard Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToAdmin(page);
  });

  test('should display admin dashboard with header and navigation', async ({ page }) => {
    // Check for admin header
    await expect(page.locator('h1')).toContainText('Admin Dashboard');
    await expect(page.locator('text=Welcome')).toBeVisible();

    // Check for refresh button
    await expect(page.locator('button:has-text("Refresh Data")')).toBeVisible();
  });

  test('should display key statistics cards', async ({ page }) => {
    // Wait for data to load
    await page.waitForLoadState('networkidle');

    // Check for stat cards
    await expect(page.locator('text=Total Users')).toBeVisible();
    await expect(page.locator('text=Sports Available')).toBeVisible();
    await expect(page.locator('text=Quiz Attempts')).toBeVisible();
    await expect(page.locator('text=Platform Activity')).toBeVisible();
  });

  test('should refresh dashboard data when refresh button is clicked', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const refreshButton = page.locator('button:has-text("Refresh Data")');
    await expect(refreshButton).toBeVisible();

    // Click refresh and check for loading state
    await refreshButton.click();
    await expect(page.locator('text=Refreshing...')).toBeVisible();

    // Wait for refresh to complete
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Refresh Data')).toBeVisible();
  });

  test('should display admin action cards with correct links', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check for action cards and their links
    await expect(page.locator('text=Content Management')).toBeVisible();
    await expect(page.locator('text=User Management')).toBeVisible();
    await expect(page.locator('text=Analytics & Reports')).toBeVisible();
    await expect(page.locator('text=System Settings')).toBeVisible();

    // Check for management buttons
    await expect(page.locator('a[href="/admin/sports"] button')).toBeVisible();
    await expect(page.locator('a[href="/admin/quizzes"] button')).toBeVisible();
    await expect(page.locator('a[href="/admin/users"] button')).toBeVisible();
    await expect(page.locator('a[href="/admin/analytics"] button')).toBeVisible();
    await expect(page.locator('a[href="/admin/settings"] button')).toBeVisible();
  });
});

test.describe('Admin Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToAdmin(page);
  });

  test('should navigate to user management page', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.click('a[href="/admin/users"]');
    await expect(page).toHaveURL('/admin/users');
    await expect(page.locator('h1')).toContainText('User Management');
  });

  test('should navigate to analytics page', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.click('a[href="/admin/analytics"]');
    await expect(page).toHaveURL('/admin/analytics');
    await expect(page.locator('h1')).toContainText('Platform Analytics');
  });

  test('should navigate to settings page', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.click('a[href="/admin/settings"]');
    await expect(page).toHaveURL('/admin/settings');
  });

  test('should navigate to sports management page', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.click('a[href="/admin/sports"]');
    await expect(page).toHaveURL('/admin/sports');
  });

  test('should navigate to quiz management page', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.click('a[href="/admin/quizzes"]');
    await expect(page).toHaveURL('/admin/quizzes');
  });
});

test.describe('Performance Testing', () => {
  test('should load admin dashboard within 2 seconds', async ({ page }) => {
    const startTime = Date.now();

    await navigateToAdmin(page);
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000); // Less than 2 seconds
  });

  test('should handle multiple rapid navigation clicks', async ({ page }) => {
    await navigateToAdmin(page);
    await page.waitForLoadState('networkidle');

    // Rapidly click between different admin sections
    await page.click('a[href="/admin/users"]');
    await page.click('a[href="/admin/analytics"]');
    await page.click('a[href="/admin"]');

    // Should end up on admin dashboard
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/admin');
  });
});

test.describe('Error Handling', () => {
  test('should display error states gracefully', async ({ page }) => {
    // Test with network disabled to simulate errors
    await page.route('**/api/**', route => {
      route.abort();
    });

    await navigateToAdmin(page);
    await page.waitForLoadState('networkidle');

    // Should still display the page structure even with API errors
    await expect(page.locator('h1')).toContainText('Admin Dashboard');
  });
});

test.describe('Mobile Responsiveness - Dashboard', () => {
  test('should display properly on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await navigateToAdmin(page);
    await page.waitForLoadState('networkidle');

    // Check that content is visible and properly laid out
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Total Users')).toBeVisible();

    // Check that buttons are accessible
    await expect(page.locator('button:has-text("Refresh Data")')).toBeVisible();
  });

  test('should handle tablet viewport correctly', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    await navigateToAdmin(page);
    await page.waitForLoadState('networkidle');

    // Check that grid layout adapts properly
    await expect(page.locator('text=Total Users')).toBeVisible();
    await expect(page.locator('text=Content Management')).toBeVisible();
  });
});

test.describe('Accessibility Testing', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await navigateToAdmin(page);
    await page.waitForLoadState('networkidle');

    // Check for proper heading structure
    const h1 = await page.locator('h1').count();
    expect(h1).toBeGreaterThanOrEqual(1);

    // Check for aria labels and accessible elements
    const buttons = await page.locator('button').count();
    expect(buttons).toBeGreaterThan(0);
  });

  test('should be keyboard navigable', async ({ page }) => {
    await navigateToAdmin(page);
    await page.waitForLoadState('networkidle');

    // Test tab navigation
    await page.keyboard.press('Tab');
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});