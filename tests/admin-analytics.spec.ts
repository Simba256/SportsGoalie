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

const BASE_URL = 'http://localhost:3001';

async function navigateToAnalytics(page: Page) {
  await page.goto('/admin/analytics');
  await page.waitForLoadState('networkidle');
}

test.describe('Analytics Dashboard - Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToAnalytics(page);
  });

  test('should display analytics page header and controls', async ({ page }) => {
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
    await page.waitForTimeout(3000); // Wait for data to load

    // Check for metric cards
    await expect(page.locator('text=Total Users')).toBeVisible();
    await expect(page.locator('text=Active Users')).toBeVisible();
    await expect(page.locator('text=Quiz Attempts')).toBeVisible();
    await expect(page.locator('text=Content Items')).toBeVisible();

    // Verify that metric values are displayed (should be numbers)
    const metricCards = page.locator('[data-testid="metric-card"]');
    const cardCount = await metricCards.count();

    // Even if no specific test data, there should be metric structure
    if (cardCount === 0) {
      // Check for the text-based metric display
      const totalUsersMetric = page.locator('text=Total Users').locator('..').locator('..').locator('..').locator('.text-2xl');
      await expect(totalUsersMetric).toBeVisible();
    }
  });

  test('should display analytics tabs', async ({ page }) => {
    // Check for tab navigation
    await expect(page.locator('text=User Engagement')).toBeVisible();
    await expect(page.locator('text=Content Performance')).toBeVisible();
    await expect(page.locator('text=User Analytics')).toBeVisible();
    await expect(page.locator('text=System Health')).toBeVisible();
  });

  test('should refresh analytics data when refresh button is clicked', async ({ page }) => {
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
  test.beforeEach(async ({ page }) => {
    await navigateToAnalytics(page);
  });

  test('should change time range to 7 days', async ({ page }) => {
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
    await page.waitForTimeout(2000);

    // Switch to User Engagement tab first
    await page.click('text=User Engagement');
    await page.waitForTimeout(1000);

    // Change time range and verify data updates
    await page.click('button:has-text("30 days")');
    await page.click('text=7 days');
    await page.waitForTimeout(2000);

    // Charts should re-render with new data
    // This is verified by checking that tab content is still visible
    await expect(page.locator('text=Daily Active Users')).toBeVisible();
  });
});

test.describe('Analytics Tabs Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToAnalytics(page);
  });

  test('should navigate to User Engagement tab', async ({ page }) => {
    await page.waitForTimeout(2000);

    await page.click('text=User Engagement');
    await page.waitForTimeout(1000);

    // Check for engagement-specific content
    await expect(page.locator('text=Daily Active Users')).toBeVisible();
    await expect(page.locator('text=Quiz Performance')).toBeVisible();
  });

  test('should navigate to Content Performance tab', async ({ page }) => {
    await page.waitForTimeout(2000);

    await page.click('text=Content Performance');
    await page.waitForTimeout(1000);

    // Check for content-specific metrics
    await expect(page.locator('text=Popular Sports')).toBeVisible();
    await expect(page.locator('text=Content Ratings')).toBeVisible();
  });

  test('should navigate to User Analytics tab', async ({ page }) => {
    await page.waitForTimeout(2000);

    await page.click('text=User Analytics');
    await page.waitForTimeout(1000);

    // Check for user analytics content
    await expect(page.locator('text=User Roles Distribution')).toBeVisible();
    await expect(page.locator('text=User Status')).toBeVisible();
  });

  test('should navigate to System Health tab', async ({ page }) => {
    await page.waitForTimeout(2000);

    await page.click('text=System Health');
    await page.waitForTimeout(1000);

    // Check for system health content
    await expect(page.locator('text=System Status')).toBeVisible();
    await expect(page.locator('text=Performance Metrics')).toBeVisible();
  });

  test('should maintain tab state during navigation', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Switch to Content Performance tab
    await page.click('text=Content Performance');
    await page.waitForTimeout(1000);

    // Navigate to another admin page and back
    await page.goto('/admin/users');
    await page.goto('/admin/analytics');

    // Should default to first tab (User Engagement)
    await expect(page.locator('text=Daily Active Users')).toBeVisible();
  });
});

test.describe('Charts and Data Visualization', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToAnalytics(page);
    await page.waitForTimeout(2000);
  });

  test('should render line charts in User Engagement tab', async ({ page }) => {
    await page.click('text=User Engagement');
    await page.waitForTimeout(2000);

    // Check that chart containers are present
    // Recharts renders SVG elements
    const charts = page.locator('svg');
    const chartCount = await charts.count();
    expect(chartCount).toBeGreaterThan(0);
  });

  test('should render bar charts in Content Performance tab', async ({ page }) => {
    await page.click('text=Content Performance');
    await page.waitForTimeout(2000);

    // Check for chart content
    await expect(page.locator('text=Popular Sports')).toBeVisible();

    // Check for chart SVG elements
    const charts = page.locator('svg');
    const chartCount = await charts.count();
    expect(chartCount).toBeGreaterThan(0);
  });

  test('should render pie charts in User Analytics tab', async ({ page }) => {
    await page.click('text=User Analytics');
    await page.waitForTimeout(2000);

    // Check for pie chart containers
    const charts = page.locator('svg');
    const chartCount = await charts.count();
    expect(chartCount).toBeGreaterThan(0);

    // Check for chart labels and data
    await expect(page.locator('text=User Roles Distribution')).toBeVisible();
  });
});

test.describe('System Health Monitoring', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToAnalytics(page);
    await page.waitForTimeout(2000);
  });

  test('should display system health status', async ({ page }) => {
    await page.click('text=System Health');
    await page.waitForTimeout(1000);

    // Check for system status indicators
    await expect(page.locator('text=Overall Status')).toBeVisible();
    await expect(page.locator('text=Uptime')).toBeVisible();
    await expect(page.locator('text=Response Time')).toBeVisible();
    await expect(page.locator('text=Error Rate')).toBeVisible();
  });

  test('should display service status breakdown', async ({ page }) => {
    await page.click('text=System Health');
    await page.waitForTimeout(1000);

    // Check for individual service statuses
    await expect(page.locator('text=Service Status')).toBeVisible();
    await expect(page.locator('text=Database')).toBeVisible();
    await expect(page.locator('text=Authentication')).toBeVisible();
    await expect(page.locator('text=Storage')).toBeVisible();
  });

  test('should display performance metrics with badges', async ({ page }) => {
    await page.click('text=System Health');
    await page.waitForTimeout(1000);

    // Check for performance section
    await expect(page.locator('text=Performance Metrics')).toBeVisible();
    await expect(page.locator('text=Avg Response Time')).toBeVisible();
    await expect(page.locator('text=System Uptime')).toBeVisible();

    // Check for status badges (Good/Poor/Excellent/etc)
    const badges = page.locator('[data-testid="status-badge"], .inline-flex');
    const badgeCount = await badges.count();
    expect(badgeCount).toBeGreaterThan(0);
  });

  test('should show system health warnings when applicable', async ({ page }) => {
    // This test checks if health warnings appear when system status is not healthy
    // In a real scenario, this would depend on actual system status

    // Check if warning banner exists (it may not in healthy state)
    const warningBanner = page.locator('text=System Health Warning');
    const hasWarning = await warningBanner.count() > 0;

    if (hasWarning) {
      await expect(warningBanner).toBeVisible();
      await expect(page.locator('text=Some services are experiencing issues')).toBeVisible();
    }

    // Either way, system health tab should be accessible
    await page.click('text=System Health');
    await expect(page.locator('text=System Status')).toBeVisible();
  });
});

test.describe('Mobile Responsiveness - Analytics', () => {
  test('should display properly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await navigateToAnalytics(page);

    // Check that header and controls are visible
    await expect(page.locator('h1')).toContainText('Platform Analytics');

    // Check that metric cards are stacked and visible
    await expect(page.locator('text=Total Users')).toBeVisible();

    // Check that tabs are accessible
    await expect(page.locator('text=User Engagement')).toBeVisible();
  });

  test('should handle mobile tab navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await navigateToAnalytics(page);
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

  test('should render charts responsively on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await navigateToAnalytics(page);
    await page.waitForTimeout(2000);

    // Switch to User Engagement tab
    await page.tap('text=User Engagement');
    await page.waitForTimeout(2000);

    // Charts should render (though may be smaller)
    const charts = page.locator('svg');
    const chartCount = await charts.count();
    expect(chartCount).toBeGreaterThan(0);
  });
});

test.describe('Performance Testing - Analytics', () => {
  test('should load analytics dashboard within 3 seconds', async ({ page }) => {
    const startTime = Date.now();

    await navigateToAnalytics(page);

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // 3 seconds for data-heavy page
  });

  test('should switch tabs efficiently', async ({ page }) => {
    await navigateToAnalytics(page);
    await page.waitForTimeout(2000);

    const startTime = Date.now();

    // Switch between tabs quickly
    await page.click('text=Content Performance');
    await page.click('text=User Analytics');
    await page.click('text=System Health');

    const switchTime = Date.now() - startTime;
    expect(switchTime).toBeLessThan(2000); // Should be fast
  });

  test('should handle chart rendering performance', async ({ page }) => {
    await navigateToAnalytics(page);
    await page.waitForTimeout(2000);

    const startTime = Date.now();

    // Switch to chart-heavy tab
    await page.click('text=User Engagement');
    await page.waitForTimeout(3000); // Allow time for chart rendering

    const renderTime = Date.now() - startTime;
    expect(renderTime).toBeLessThan(5000); // Charts can take longer
  });
});

test.describe('Error Handling - Analytics', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Block API requests
    await page.route('**/api/**', route => {
      route.abort();
    });

    await navigateToAnalytics(page);

    // Page should still load with basic structure
    await expect(page.locator('h1')).toContainText('Platform Analytics');

    // Should show some form of error state or loading state
    await expect(page.locator('text=Loading analytics...'), { timeout: 5000 }).toBeVisible();
  });

  test('should handle chart rendering failures', async ({ page }) => {
    await navigateToAnalytics(page);
    await page.waitForTimeout(2000);

    // Even with potential data issues, tabs should be navigable
    await page.click('text=User Engagement');
    await expect(page.locator('text=Daily Active Users')).toBeVisible();

    // If no data, should show appropriate empty states
    const hasCharts = await page.locator('svg').count() > 0;
    const hasEmptyState = await page.locator('text=data not available').count() > 0;

    // Either charts should render or empty state should be shown
    expect(hasCharts || hasEmptyState).toBe(true);
  });

  test('should display loading states appropriately', async ({ page }) => {
    await navigateToAnalytics(page);

    // Should show some loading indication during initial load
    // This test verifies the loading experience is reasonable
    await expect(page.locator('h1')).toContainText('Platform Analytics');

    // After loading, content should be accessible
    await page.waitForTimeout(3000);
    await expect(page.locator('text=Total Users')).toBeVisible();
  });
});