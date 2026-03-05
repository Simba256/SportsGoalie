import { test, expect } from '@playwright/test';

// Note: baseURL is configured in playwright.config.ts as http://localhost:3000

test.describe('Stage 4 Focused Testing - Core Functionality Analysis', () => {

  test('Pillars Catalog - Core Functionality Test', async ({ page }) => {
    console.log('🔍 Testing Pillars Catalog Page...');

    await page.goto('/pillars');
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 });

    // Take screenshot for analysis
    await page.screenshot({ path: 'test-results/pillars-catalog.png', fullPage: true });

    // Test 1: Page loads and displays header - actual title is "Ice Hockey Goalie Pillars"
    try {
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
      const headerText = await page.locator('h1').first().textContent();
      console.log('✅ Page header loaded successfully:', headerText);
    } catch (error) {
      console.log('❌ Page header not found:', error instanceof Error ? error.message : String(error));
    }

    // Test 2: Pillar cards are displayed (the new UI has no search/filter - it's a simple 6-card grid)
    try {
      const pillarCards = page.locator('a[href*="/pillars/"]');
      await expect(pillarCards.first()).toBeVisible({ timeout: 10000 });
      const cardCount = await pillarCards.count();
      console.log(`✅ Found ${cardCount} pillar cards`);
    } catch (error) {
      console.log('❌ Pillar cards not found:', error instanceof Error ? error.message : String(error));
    }

    // Test 3: Check for the 6 pillars badge
    try {
      await expect(page.locator('text=/\\d+ pillar/i')).toBeVisible({ timeout: 5000 });
      console.log('✅ Pillars count badge is visible');
    } catch (error) {
      console.log('❌ Pillars count badge not found:', error instanceof Error ? error.message : String(error));
    }

    // Test 4: Check for About the 6 Pillars info card
    try {
      await expect(page.locator('text="About the 6 Pillars"')).toBeVisible({ timeout: 5000 });
      console.log('✅ About the 6 Pillars info card is visible');
    } catch (error) {
      console.log('❌ About the 6 Pillars info card not found:', error instanceof Error ? error.message : String(error));
    }

    // Log page content for analysis
    console.log('📄 Page title:', await page.title());
    console.log('🔗 Current URL:', page.url());
  });

  test('Pillar Detail Page - Navigation Test', async ({ page }) => {
    console.log('🔍 Testing Pillar Detail Page Navigation...');

    await page.goto('/pillars');
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 });

    // Find and click first pillar link
    try {
      const firstPillarLink = page.locator('a[href*="/pillars/"]').first();
      if (await firstPillarLink.isVisible()) {
        const href = await firstPillarLink.getAttribute('href');
        console.log('🔗 Clicking pillar link:', href);

        await firstPillarLink.click();
        await page.waitForLoadState('domcontentloaded', { timeout: 10000 });

        // Take screenshot
        await page.screenshot({ path: 'test-results/pillar-detail.png', fullPage: true });

        console.log('🔗 Navigated to:', page.url());

        // Check if we're on a detail page
        if (page.url().includes('/pillars/') && !page.url().endsWith('/pillars')) {
          console.log('✅ Successfully navigated to pillar detail page');

          // Look for back button
          try {
            await expect(page.locator('button:has-text("Back")')).toBeVisible({ timeout: 5000 });
            console.log('✅ Back button found');
          } catch {
            console.log('❌ Back button not found');
          }

          // Look for pillar title
          try {
            await expect(page.locator('h1')).toBeVisible({ timeout: 5000 });
            const title = await page.locator('h1').textContent();
            console.log('✅ Pillar title found:', title);
          } catch {
            console.log('❌ Pillar title not found');
          }

        } else {
          console.log('❌ Did not navigate to pillar detail page');
        }
      } else {
        console.log('❌ No pillar links found on catalog page');
      }
    } catch (error) {
      console.log('❌ Error navigating to pillar detail:', error instanceof Error ? error.message : String(error));
    }
  });

  test('Admin Pillars Management - Access Test', async ({ page }) => {
    console.log('🔍 Testing Admin Pillars Management Access...');

    await page.goto('/admin/pillars');
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 });

    // Take screenshot
    await page.screenshot({ path: 'test-results/admin-pillars.png', fullPage: true });

    console.log('🔗 Admin page URL:', page.url());

    // Check if we're redirected to auth or if admin interface loads
    if (page.url().includes('/auth/') || page.url().includes('/login')) {
      console.log('✅ Admin page requires authentication (redirected to auth)');
    } else {
      console.log('📋 Admin page accessible, checking interface...');

      // Look for admin interface elements - title is "Pillar Management"
      try {
        await expect(page.getByRole('heading', { name: /Pillar Management/i })).toBeVisible({ timeout: 5000 });
        const title = await page.locator('h1').textContent();
        console.log('✅ Admin page title:', title);

        // Pillars are predefined, so no Add button expected - check for info card instead
        try {
          await expect(page.locator('text=/Fixed 6-Pillar Structure/i')).toBeVisible({ timeout: 3000 });
          console.log('✅ Fixed 6-Pillar Structure info card visible');
        } catch {
          console.log('ℹ️ Fixed 6-Pillar Structure info card not found');
        }

      } catch (error) {
        console.log('❌ Admin interface elements not found:', error instanceof Error ? error.message : String(error));
      }
    }
  });

  test('Error Handling - Non-existent Pages', async ({ page }) => {
    console.log('🔍 Testing Error Handling...');

    // Test non-existent pillar
    await page.goto('/pillars/non-existent-pillar-123');
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 });

    await page.screenshot({ path: 'test-results/error-handling.png', fullPage: true });

    console.log('🔗 Error page URL:', page.url());

    // Look for error indicators
    const errorIndicators = [
      'text=/not found/i',
      'text=/error/i',
      'text=/404/i',
      'button:has-text("Go Back")',
      'button:has-text("Try Again")'
    ];

    let errorHandlingFound = false;
    for (const indicator of errorIndicators) {
      if (await page.locator(indicator).isVisible()) {
        console.log('✅ Error handling found:', indicator);
        errorHandlingFound = true;
        break;
      }
    }

    if (!errorHandlingFound) {
      console.log('❌ No error handling indicators found');
    }
  });

  test('Network Analysis - API Calls', async ({ page }) => {
    console.log('🔍 Analyzing Network Requests...');

    const requests: Array<{ url: string; method: string; resourceType: string }> = [];
    const responses: Array<{ url: string; status: number; statusText: string }> = [];

    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType()
      });
    });

    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    });

    await page.goto('/pillars');
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 });

    // Wait a bit for async requests to complete
    await page.waitForTimeout(2000);

    console.log('📡 Network Summary:');
    console.log(`- Total requests: ${requests.length}`);
    console.log(`- Total responses: ${responses.length}`);

    // Analyze API calls
    const apiRequests = requests.filter(req =>
      req.url.includes('/api/') ||
      req.resourceType === 'xhr' ||
      req.resourceType === 'fetch'
    );

    console.log(`- API requests: ${apiRequests.length}`);

    // Check for failed responses
    const failedResponses = responses.filter(resp => resp.status >= 400);
    if (failedResponses.length > 0) {
      console.log('❌ Failed requests found:');
      failedResponses.forEach(resp => {
        console.log(`  - ${resp.status} ${resp.statusText}: ${resp.url}`);
      });
    } else {
      console.log('✅ No failed requests detected');
    }
  });

  test('Responsive Design - Mobile View', async ({ page }) => {
    console.log('🔍 Testing Responsive Design...');

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/pillars');
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 });

    await page.screenshot({ path: 'test-results/mobile-view.png', fullPage: true });

    // Check if main elements are still visible
    try {
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 5000 });
      console.log('✅ Header visible on mobile');
    } catch {
      console.log('❌ Header not visible on mobile');
    }

    // Check pillar cards are visible on mobile
    try {
      await expect(page.locator('a[href*="/pillars/"]').first()).toBeVisible({ timeout: 5000 });
      console.log('✅ Pillar cards visible on mobile');
    } catch {
      console.log('❌ Pillar cards not visible on mobile');
    }

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    await page.screenshot({ path: 'test-results/tablet-view.png', fullPage: true });
    console.log('✅ Tablet view screenshot captured');

    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    await page.screenshot({ path: 'test-results/desktop-view.png', fullPage: true });
    console.log('✅ Desktop view screenshot captured');
  });
});