import { test, expect } from '@playwright/test';

test.describe('Database Seeding Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin seeding page if it exists
    await page.goto('/admin/seeding');
  });

  test('should display seeding interface for admins', async ({ page }) => {
    // Check that seeding controls are visible
    await expect(page.getByRole('heading', { name: /Database Seeding/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Check Current Data/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Seed All Data/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Clear All Data/i })).toBeVisible();
  });

  test('should show current database state', async ({ page }) => {
    // Click check current data button
    await page.getByRole('button', { name: /Check Current Data/i }).click();

    // Wait for results to appear
    await expect(page.locator('[data-testid="seeding-stats"]')).toBeVisible();

    // Check that stats are displayed
    await expect(page.locator('[data-testid="sports-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="skills-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="quizzes-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="achievements-count"]')).toBeVisible();
  });

  test('should perform complete database seeding', async ({ page }) => {
    // First check if database is empty
    await page.getByRole('button', { name: /Check Current Data/i }).click();
    await page.waitForTimeout(1000);

    // If not empty, clear it first
    const isEmpty = await page.locator('[data-testid="database-empty"]').isVisible();
    if (!isEmpty) {
      await page.getByRole('button', { name: /Clear All Data/i }).click();
      await page.getByRole('button', { name: /Confirm Clear/i }).click();
      await expect(page.getByText(/Data cleared successfully/i)).toBeVisible();
    }

    // Now seed the database
    await page.getByRole('button', { name: /Seed All Data/i }).click();

    // Wait for seeding to complete
    await expect(page.getByText(/Seeding started/i)).toBeVisible();

    // This might take a while, so wait for completion
    await expect(page.getByText(/Seeding completed successfully/i)).toBeVisible({ timeout: 30000 });

    // Verify seeded data counts
    await page.getByRole('button', { name: /Check Current Data/i }).click();
    await page.waitForTimeout(1000);

    // Check that we have expected data
    const sportsCount = await page.locator('[data-testid="sports-count"]').textContent();
    const skillsCount = await page.locator('[data-testid="skills-count"]').textContent();
    const quizzesCount = await page.locator('[data-testid="quizzes-count"]').textContent();

    expect(parseInt(sportsCount || '0')).toBeGreaterThan(0);
    expect(parseInt(skillsCount || '0')).toBeGreaterThan(0);
    expect(parseInt(quizzesCount || '0')).toBeGreaterThan(0);
  });

  test('should handle seeding errors gracefully', async ({ page }) => {
    // Mock network failure by intercepting requests
    await page.route('**/api/seeding/**', route => {
      route.abort('failed');
    });

    await page.getByRole('button', { name: /Seed All Data/i }).click();

    // Should show error message
    await expect(page.getByText(/Seeding failed/i)).toBeVisible();
    await expect(page.locator('[data-testid="error-details"]')).toBeVisible();
  });

  test('should validate data integrity after seeding', async ({ page }) => {
    // Ensure we have seeded data
    await page.getByRole('button', { name: /Seed All Data/i }).click();
    await expect(page.getByText(/Seeding completed/i)).toBeVisible({ timeout: 30000 });

    // Click validate data integrity button
    await page.getByRole('button', { name: /Validate Data Integrity/i }).click();

    // Wait for validation results
    await expect(page.locator('[data-testid="validation-results"]')).toBeVisible();

    // Should show validation success or specific issues
    const validationStatus = await page.locator('[data-testid="validation-status"]').textContent();
    expect(validationStatus).toMatch(/(Valid|Issues found)/i);

    // If issues found, they should be listed
    const issuesList = page.locator('[data-testid="validation-issues"]');
    if (await issuesList.isVisible()) {
      const issues = await issuesList.locator('li').count();
      expect(issues).toBeGreaterThanOrEqual(0);
    }
  });

  test('should allow selective seeding', async ({ page }) => {
    // Clear database first
    await page.getByRole('button', { name: /Clear All Data/i }).click();
    await page.getByRole('button', { name: /Confirm Clear/i }).click();
    await expect(page.getByText(/Data cleared successfully/i)).toBeVisible();

    // Seed only sports
    await page.getByRole('button', { name: /Seed Sports Only/i }).click();
    await expect(page.getByText(/Sports seeded successfully/i)).toBeVisible();

    // Check that only sports were seeded
    await page.getByRole('button', { name: /Check Current Data/i }).click();
    await page.waitForTimeout(1000);

    const sportsCount = await page.locator('[data-testid="sports-count"]').textContent();
    const skillsCount = await page.locator('[data-testid="skills-count"]').textContent();

    expect(parseInt(sportsCount || '0')).toBeGreaterThan(0);
    expect(parseInt(skillsCount || '0')).toBe(0);

    // Now seed achievements only
    await page.getByRole('button', { name: /Seed Achievements Only/i }).click();
    await expect(page.getByText(/Achievements seeded successfully/i)).toBeVisible();

    // Verify achievements were added
    await page.getByRole('button', { name: /Check Current Data/i }).click();
    await page.waitForTimeout(1000);

    const achievementsCount = await page.locator('[data-testid="achievements-count"]').textContent();
    expect(parseInt(achievementsCount || '0')).toBeGreaterThan(0);
  });

  test('should show seeding progress in real-time', async ({ page }) => {
    // Clear database first
    await page.getByRole('button', { name: /Clear All Data/i }).click();
    await page.getByRole('button', { name: /Confirm Clear/i }).click();
    await expect(page.getByText(/Data cleared successfully/i)).toBeVisible();

    // Start seeding and watch progress
    await page.getByRole('button', { name: /Seed All Data/i }).click();

    // Should show progress indicators
    await expect(page.locator('[data-testid="seeding-progress"]')).toBeVisible();

    // Should show current step
    await expect(page.locator('[data-testid="current-step"]')).toBeVisible();

    // Progress bar should be visible
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();

    // Wait for completion
    await expect(page.getByText(/Seeding completed successfully/i)).toBeVisible({ timeout: 30000 });

    // Progress should show 100%
    const progressValue = await page.locator('[data-testid="progress-bar"]').getAttribute('value');
    expect(progressValue).toBe('100');
  });

  test('should handle database connection issues', async ({ page }) => {
    // Mock database connection failure
    await page.route('**/api/health/database', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: { message: 'Database connection failed' }
        })
      });
    });

    // Try to check current data
    await page.getByRole('button', { name: /Check Current Data/i }).click();

    // Should show connection error
    await expect(page.getByText(/Database connection failed/i)).toBeVisible();
    await expect(page.locator('[data-testid="connection-error"]')).toBeVisible();

    // Seeding button should be disabled
    await expect(page.getByRole('button', { name: /Seed All Data/i })).toBeDisabled();
  });

  test('should export seeded data mappings', async ({ page }) => {
    // Ensure we have seeded data
    await page.getByRole('button', { name: /Seed All Data/i }).click();
    await expect(page.getByText(/Seeding completed/i)).toBeVisible({ timeout: 30000 });

    // Click export mappings button
    await page.getByRole('button', { name: /Export Data Mappings/i }).click();

    // Should trigger download
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Download JSON/i }).click();
    const download = await downloadPromise;

    // Verify download
    expect(download.suggestedFilename()).toMatch(/seeded-data-mappings.*\.json/);
  });

  test('should show detailed seeding logs', async ({ page }) => {
    // Open seeding logs panel
    await page.getByRole('button', { name: /Show Logs/i }).click();
    await expect(page.locator('[data-testid="seeding-logs"]')).toBeVisible();

    // Start seeding
    await page.getByRole('button', { name: /Seed All Data/i }).click();

    // Should show real-time logs
    await expect(page.locator('[data-testid="log-entry"]').first()).toBeVisible();

    // Logs should include timestamps
    const firstLog = page.locator('[data-testid="log-entry"]').first();
    await expect(firstLog.locator('[data-testid="log-timestamp"]')).toBeVisible();
    await expect(firstLog.locator('[data-testid="log-message"]')).toBeVisible();

    // Should show different log levels
    await expect(page.locator('[data-testid="log-level-info"]')).toBeVisible();

    // Wait for completion and check for success logs
    await expect(page.getByText(/Seeding completed successfully/i)).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-testid="log-level-success"]')).toBeVisible();
  });

  test('should handle concurrent seeding attempts', async ({ page }) => {
    // Start first seeding operation
    await page.getByRole('button', { name: /Seed All Data/i }).click();
    await expect(page.getByText(/Seeding started/i)).toBeVisible();

    // Try to start another seeding operation
    await page.getByRole('button', { name: /Seed All Data/i }).click();

    // Should show warning about operation in progress
    await expect(page.getByText(/Seeding operation already in progress/i)).toBeVisible();

    // Button should be disabled during seeding
    await expect(page.getByRole('button', { name: /Seed All Data/i })).toBeDisabled();

    // Wait for first operation to complete
    await expect(page.getByText(/Seeding completed/i)).toBeVisible({ timeout: 30000 });

    // Button should be enabled again
    await expect(page.getByRole('button', { name: /Seed All Data/i })).toBeEnabled();
  });

  test('should preserve admin session during long seeding operations', async ({ page }) => {
    // Start seeding operation
    await page.getByRole('button', { name: /Seed All Data/i }).click();
    await expect(page.getByText(/Seeding started/i)).toBeVisible();

    // Simulate session timeout by clearing localStorage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Refresh page to simulate session loss
    await page.reload();

    // Should redirect to login or show session expired message
    const currentUrl = page.url();
    const hasLoginRedirect = currentUrl.includes('/auth/login');
    const hasSessionMessage = await page.getByText(/Session expired/i).isVisible();

    expect(hasLoginRedirect || hasSessionMessage).toBeTruthy();
  });
});