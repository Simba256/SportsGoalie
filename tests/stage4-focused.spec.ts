import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3004';

test.describe('Stage 4 Focused Testing - Core Functionality Analysis', () => {

  test('Pillars Catalog - Core Functionality Test', async ({ page }) => {
    console.log('🔍 Testing Pillars Catalog Page...');

    await page.goto(`${BASE_URL}/pillars`);
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    // Take screenshot for analysis
    await page.screenshot({ path: 'test-results/pillars-catalog.png', fullPage: true });

    // Test 1: Page loads and displays header
    try {
      await expect(page.locator('h1')).toContainText('Pillars Catalog', { timeout: 10000 });
      console.log('✅ Pillars Catalog header loaded successfully');
    } catch (error) {
      console.log('❌ Pillars Catalog header not found:', error instanceof Error ? error.message : String(error));
    }

    // Test 2: Search functionality is present
    try {
      await expect(page.locator('input[placeholder*="Search"]')).toBeVisible({ timeout: 5000 });
      console.log('✅ Search input is visible');
    } catch (error) {
      console.log('❌ Search input not found:', error instanceof Error ? error.message : String(error));
    }

    // Test 3: Pillar cards are displayed
    try {
      const pillarCards = page.locator('a[href*="/pillars/"], .card');
      await expect(pillarCards.first()).toBeVisible({ timeout: 10000 });
      const cardCount = await pillarCards.count();
      console.log(`✅ Found ${cardCount} pillar cards`);
    } catch (error) {
      console.log('❌ Pillar cards not found:', error instanceof Error ? error.message : String(error));
    }

    // Test 4: Filters button exists
    try {
      await expect(page.locator('button:has-text("Filters")')).toBeVisible({ timeout: 5000 });
      console.log('✅ Filters button is visible');
    } catch (error) {
      console.log('❌ Filters button not found:', error instanceof Error ? error.message : String(error));
    }

    // Log page content for analysis
    console.log('📄 Page title:', await page.title());
    console.log('🔗 Current URL:', page.url());
  });

  test('Pillar Detail Page - Navigation Test', async ({ page }) => {
    console.log('🔍 Testing Pillar Detail Page Navigation...');

    await page.goto(`${BASE_URL}/pillars`);
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    // Find and click first pillar link
    try {
      const firstPillarLink = page.locator('a[href*="/pillars/"]').first();
      if (await firstPillarLink.isVisible()) {
        const href = await firstPillarLink.getAttribute('href');
        console.log('🔗 Clicking pillar link:', href);

        await firstPillarLink.click();
        await page.waitForLoadState('networkidle', { timeout: 10000 });

        // Take screenshot
        await page.screenshot({ path: 'test-results/pillar-detail.png', fullPage: true });

        console.log('🔗 Navigated to:', page.url());

        // Check if we're on a detail page
        if (page.url().includes('/pillars/') && page.url() !== `${BASE_URL}/pillars`) {
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

    await page.goto(`${BASE_URL}/admin/pillars`);
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    // Take screenshot
    await page.screenshot({ path: 'test-results/admin-pillars.png', fullPage: true });

    console.log('🔗 Admin page URL:', page.url());

    // Check if we're redirected to auth or if admin interface loads
    if (page.url().includes('/auth/') || page.url().includes('/login')) {
      console.log('✅ Admin page requires authentication (redirected to auth)');
    } else {
      console.log('📋 Admin page accessible, checking interface...');

      // Look for admin interface elements
      try {
        await expect(page.locator('h1')).toBeVisible({ timeout: 5000 });
        const title = await page.locator('h1').textContent();
        console.log('✅ Admin page title:', title);

        // Pillars are predefined, so no Add button expected
        console.log('ℹ️ Pillars are predefined - no Add Pillar button expected');

      } catch (error) {
        console.log('❌ Admin interface elements not found:', error instanceof Error ? error.message : String(error));
      }
    }
  });

  test('Error Handling - Non-existent Pages', async ({ page }) => {
    console.log('🔍 Testing Error Handling...');

    // Test non-existent pillar
    await page.goto(`${BASE_URL}/pillars/non-existent-pillar-123`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

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

    await page.goto(`${BASE_URL}/pillars`);
    await page.waitForLoadState('networkidle', { timeout: 15000 });

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
    await page.goto(`${BASE_URL}/pillars`);
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    await page.screenshot({ path: 'test-results/mobile-view.png', fullPage: true });

    // Check if main elements are still visible
    try {
      await expect(page.locator('h1')).toBeVisible({ timeout: 5000 });
      console.log('✅ Header visible on mobile');
    } catch {
      console.log('❌ Header not visible on mobile');
    }

    try {
      await expect(page.locator('input[placeholder*="Search"]')).toBeVisible({ timeout: 5000 });
      console.log('✅ Search input visible on mobile');
    } catch {
      console.log('❌ Search input not visible on mobile');
    }

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: 'test-results/tablet-view.png', fullPage: true });
    console.log('✅ Tablet view screenshot captured');

    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: 'test-results/desktop-view.png', fullPage: true });
    console.log('✅ Desktop view screenshot captured');
  });
});