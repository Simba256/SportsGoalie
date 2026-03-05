import { test, expect, Page } from '@playwright/test';

/**
 * Admin Analytics Dashboard - Comprehensive Test Suite
 *
 * This test suite covers:
 * - Analytics dashboard loading and data display
 * - Chart rendering and interactivity
 * - Time range filtering
 * - Tab navigation between different analytics views
 * - System health monitoring
 * - Performance metrics display
 * - Mobile responsiveness
 * - Error handling
 */

async function navigateToAnalytics(page: Page): Promise<boolean> {
  await page.goto('/admin/analytics');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  // Check if redirected to auth - return false if not authenticated
  const url = page.url();
  if (url.includes('/auth/') || url.includes('/login')) {
    return false;
  }
  // Also check if we're showing the login page content
  const hasLoginForm = await page.locator('text=Welcome Back').isVisible().catch(() => false);
  if (hasLoginForm) {
    return false;
  }
  return true;
}

test.describe('Analytics Dashboard - Core Functionality', () => {
  test('should display analytics page header and controls', async ({ page }) => {
    const isAuthenticated = await navigateToAnalytics(page);
    test.skip(!isAuthenticated, 'Skipping: Admin authentication required');

    // Check page header
    await expect(page.locator('h1')).toContainText('Platform Analytics');
    await expect(page.locator('text=Monitor platform performance, user engagement, and system health')).toBeVisible();

    // Check for time range selector
    await expect(page.locator('text=30 days')).toBeVisible();

    // Check for refresh and export buttons
    await expect(page.locator('button:has-text("Refresh")')).toBeVisible();
    await expect(page.locator('button:has-text("Export")')).toBeVisible();
  });

  test('should display key metrics cards', async ({ page }) => {
    const isAuthenticated = await navigateToAnalytics(page);
    test.skip(!isAuthenticated, 'Skipping: Admin authentication required');

    await page.waitForTimeout(3000); // Wait for data to load

    // Check for metric cards
    await expect(page.locator('text=Total Users')).toBeVisible();
    await expect(page.locator('text=Active Users')).toBeVisible();
    await expect(page.locator('text=Quiz Attempts')).toBeVisible();
    await expect(page.locator('text=Content Items')).toBeVisible();
  });

  test('should display analytics tabs', async ({ page }) => {
    const isAuthenticated = await navigateToAnalytics(page);
    test.skip(!isAuthenticated, 'Skipping: Admin authentication required');

    // Check for tab navigation
    await expect(page.locator('text=User Engagement')).toBeVisible();
    await expect(page.locator('text=Content Performance')).toBeVisible();
    await expect(page.locator('text=User Analytics')).toBeVisible();
    await expect(page.locator('text=System Health')).toBeVisible();
  });

  test('should refresh analytics data when refresh button is clicked', async ({ page }) => {
    const isAuthenticated = await navigateToAnalytics(page);
    test.skip(!isAuthenticated, 'Skipping: Admin authentication required');

    await page.waitForTimeout(2000);

    const refreshButton = page.locator('button:has-text("Refresh")');
    await expect(refreshButton).toBeVisible();

    // Click refresh button
    await refreshButton.click();

    // Check for loading state or completion
    await page.waitForTimeout(1000);

    // Should complete refresh without errors
    await expect(refreshButton).toBeVisible();
  });
});

test.describe('Analytics Time Range Filtering', () => {
  test('should change time range to 7 days', async ({ page }) => {
    const isAuthenticated = await navigateToAnalytics(page);
    test.skip(!isAuthenticated, 'Skipping: Admin authentication required');

    await page.waitForTimeout(2000);

    // Click time range dropdown
    await page.click('button:has-text("30 days")');
    await page.waitForTimeout(500);

    // Select 7 days
    await page.click('text=7 days');
    await page.waitForTimeout(1000);

    // Verify selection changed
    await expect(page.locator('button:has-text("7 days")')).toBeVisible();
  });

  test('should change time range to 90 days', async ({ page }) => {
    const isAuthenticated = await navigateToAnalytics(page);
    test.skip(!isAuthenticated, 'Skipping: Admin authentication required');

    await page.waitForTimeout(2000);

    // Click time range dropdown
    await page.click('button:has-text("30 days")');
    await page.waitForTimeout(500);

    // Select 90 days
    await page.click('text=90 days');
    await page.waitForTimeout(1000);

    // Verify selection changed
    await expect(page.locator('button:has-text("90 days")')).toBeVisible();
  });

  test('should update charts when time range changes', async ({ page }) => {
    const isAuthenticated = await navigateToAnalytics(page);
    test.skip(!isAuthenticated, 'Skipping: Admin authentication required');

    await page.waitForTimeout(2000);

    // Switch to User Engagement tab first
    await page.click('text=User Engagement');
    await page.waitForTimeout(1000);

    // Change time range and verify data updates
    await page.click('button:has-text("30 days")');
    await page.click('text=7 days');
    await page.waitForTimeout(2000);

    // Charts should re-render with new data
    await expect(page.locator('text=Daily Active Users')).toBeVisible();
  });
});

test.describe('Analytics Tabs Navigation', () => {
  test('should navigate to User Engagement tab', async ({ page }) => {
    const isAuthenticated = await navigateToAnalytics(page);
    test.skip(!isAuthenticated, 'Skipping: Admin authentication required');

    await page.waitForTimeout(2000);

    await page.click('text=User Engagement');
    await page.waitForTimeout(1000);

    // Check for engagement-specific content
    await expect(page.locator('text=Daily Active Users')).toBeVisible();
    await expect(page.locator('text=Quiz Performance')).toBeVisible();
  });

  test('should navigate to Content Performance tab', async ({ page }) => {
    const isAuthenticated = await navigateToAnalytics(page);
    test.skip(!isAuthenticated, 'Skipping: Admin authentication required');

    await page.waitForTimeout(2000);

    await page.click('text=Content Performance');
    await page.waitForTimeout(1000);

    // Check for content-specific metrics
    await expect(page.locator('text=Popular Sports')).toBeVisible();
    await expect(page.locator('text=Content Ratings')).toBeVisible();
  });

  test('should navigate to User Analytics tab', async ({ page }) => {
    const isAuthenticated = await navigateToAnalytics(page);
    test.skip(!isAuthenticated, 'Skipping: Admin authentication required');

    await page.waitForTimeout(2000);

    await page.click('text=User Analytics');
    await page.waitForTimeout(1000);

    // Check for user analytics content
    await expect(page.locator('text=User Roles Distribution')).toBeVisible();
    await expect(page.locator('text=User Status')).toBeVisible();
  });

  test('should navigate to System Health tab', async ({ page }) => {
    const isAuthenticated = await navigateToAnalytics(page);
    test.skip(!isAuthenticated, 'Skipping: Admin authentication required');

    await page.waitForTimeout(2000);

    await page.click('text=System Health');
    await page.waitForTimeout(1000);

    // Check for system health content
    await expect(page.locator('text=System Status')).toBeVisible();
    await expect(page.locator('text=Performance Metrics')).toBeVisible();
  });
});

test.describe('Charts and Data Visualization', () => {
  test('should render charts in User Engagement tab', async ({ page }) => {
    const isAuthenticated = await navigateToAnalytics(page);
    test.skip(!isAuthenticated, 'Skipping: Admin authentication required');

    await page.waitForTimeout(2000);

    await page.click('text=User Engagement');
    await page.waitForTimeout(2000);

    // Check that chart containers are present
    const charts = page.locator('svg');
    const chartCount = await charts.count();
    expect(chartCount).toBeGreaterThan(0);
  });

  test('should render charts in Content Performance tab', async ({ page }) => {
    const isAuthenticated = await navigateToAnalytics(page);
    test.skip(!isAuthenticated, 'Skipping: Admin authentication required');

    await page.waitForTimeout(2000);

    await page.click('text=Content Performance');
    await page.waitForTimeout(2000);

    // Check for chart content
    await expect(page.locator('text=Popular Sports')).toBeVisible();

    // Check for chart SVG elements
    const charts = page.locator('svg');
    const chartCount = await charts.count();
    expect(chartCount).toBeGreaterThan(0);
  });

  test('should render charts in User Analytics tab', async ({ page }) => {
    const isAuthenticated = await navigateToAnalytics(page);
    test.skip(!isAuthenticated, 'Skipping: Admin authentication required');

    await page.waitForTimeout(2000);

    await page.click('text=User Analytics');
    await page.waitForTimeout(2000);

    // Check for chart containers
    const charts = page.locator('svg');
    const chartCount = await charts.count();
    expect(chartCount).toBeGreaterThan(0);

    // Check for chart labels
    await expect(page.locator('text=User Roles Distribution')).toBeVisible();
  });
});

test.describe('System Health Monitoring', () => {
  test('should display system health status', async ({ page }) => {
    const isAuthenticated = await navigateToAnalytics(page);
    test.skip(!isAuthenticated, 'Skipping: Admin authentication required');

    await page.waitForTimeout(2000);

    await page.click('text=System Health');
    await page.waitForTimeout(1000);

    // Check for system status indicators
    await expect(page.locator('text=Overall Status')).toBeVisible();
    await expect(page.locator('text=Uptime')).toBeVisible();
    await expect(page.locator('text=Response Time')).toBeVisible();
    await expect(page.locator('text=Error Rate')).toBeVisible();
  });

  test('should display service status breakdown', async ({ page }) => {
    const isAuthenticated = await navigateToAnalytics(page);
    test.skip(!isAuthenticated, 'Skipping: Admin authentication required');

    await page.waitForTimeout(2000);

    await page.click('text=System Health');
    await page.waitForTimeout(1000);

    // Check for individual service statuses
    await expect(page.locator('text=Service Status')).toBeVisible();
    await expect(page.locator('text=Database')).toBeVisible();
    await expect(page.locator('text=Authentication')).toBeVisible();
    await expect(page.locator('text=Storage')).toBeVisible();
  });

  test('should display performance metrics with badges', async ({ page }) => {
    const isAuthenticated = await navigateToAnalytics(page);
    test.skip(!isAuthenticated, 'Skipping: Admin authentication required');

    await page.waitForTimeout(2000);

    await page.click('text=System Health');
    await page.waitForTimeout(1000);

    // Check for performance section
    await expect(page.locator('text=Performance Metrics')).toBeVisible();
    await expect(page.locator('text=Avg Response Time')).toBeVisible();
    await expect(page.locator('text=System Uptime')).toBeVisible();
  });
});

test.describe('Mobile Responsiveness - Analytics', () => {
  test('should display properly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const isAuthenticated = await navigateToAnalytics(page);
    test.skip(!isAuthenticated, 'Skipping: Admin authentication required');

    // Check that header and controls are visible
    await expect(page.locator('h1')).toContainText('Platform Analytics');

    // Check that metric cards are visible
    await expect(page.locator('text=Total Users')).toBeVisible();

    // Check that tabs are accessible
    await expect(page.locator('text=User Engagement')).toBeVisible();
  });

  test('should handle mobile tab navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const isAuthenticated = await navigateToAnalytics(page);
    test.skip(!isAuthenticated, 'Skipping: Admin authentication required');

    await page.waitForTimeout(2000);

    // Test mobile tab interactions
    await page.tap('text=Content Performance');
    await page.waitForTimeout(1000);

    await expect(page.locator('text=Popular Sports')).toBeVisible();

    // Test another tab
    await page.tap('text=System Health');
    await page.waitForTimeout(1000);

    await expect(page.locator('text=System Status')).toBeVisible();
  });
});

test.describe('Performance Testing - Analytics', () => {
  test('should load analytics dashboard within 3 seconds', async ({ page }) => {
    const startTime = Date.now();

    const isAuthenticated = await navigateToAnalytics(page);
    test.skip(!isAuthenticated, 'Skipping: Admin authentication required');

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });

  test('should switch tabs efficiently', async ({ page }) => {
    const isAuthenticated = await navigateToAnalytics(page);
    test.skip(!isAuthenticated, 'Skipping: Admin authentication required');

    await page.waitForTimeout(2000);

    const startTime = Date.now();

    // Switch between tabs quickly
    await page.click('text=Content Performance');
    await page.click('text=User Analytics');
    await page.click('text=System Health');

    const switchTime = Date.now() - startTime;
    expect(switchTime).toBeLessThan(2000);
  });
});

test.describe('Error Handling - Analytics', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Block API requests
    await page.route('**/api/**', route => {
      route.abort();
    });

    const isAuthenticated = await navigateToAnalytics(page);
    test.skip(!isAuthenticated, 'Skipping: Admin authentication required');

    // Page should still load with basic structure
    await expect(page.locator('h1')).toContainText('Platform Analytics');
  });
});
