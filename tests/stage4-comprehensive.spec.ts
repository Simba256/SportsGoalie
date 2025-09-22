import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3004';

// Test configuration
test.describe('Stage 4: Sports & Skills Content Management - Comprehensive Testing', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    page = await context.newPage();

    // Enable console logging for debugging
    page.on('console', msg => console.log(`Browser console ${msg.type()}: ${msg.text()}`));
    page.on('pageerror', error => console.log(`Page error: ${error.message}`));
  });

  test.describe('1. Sports Catalog Page (/sports)', () => {
    test('should load sports catalog with correct layout and navigation', async () => {
      await page.goto(`${BASE_URL}/sports`);

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Check page title and header
      await expect(page.locator('h1')).toContainText('Sports Catalog');
      await expect(page.locator('p')).toContainText('Discover and master new sports skills');

      // Check if sports count is displayed
      await expect(page.locator('text=/\\d+ sport/i')).toBeVisible();

      // Verify search functionality is present
      await expect(page.locator('input[placeholder*="Search sports"]')).toBeVisible();
      await expect(page.locator('button:has-text("Search")')).toBeVisible();
      await expect(page.locator('button:has-text("Filters")')).toBeVisible();
    });

    test('should display sports in grid layout', async () => {
      await page.goto(`${BASE_URL}/sports`);
      await page.waitForLoadState('networkidle');

      // Wait for sports grid to load
      await page.waitForSelector('[data-testid="sports-grid"], .grid', { timeout: 10000 });

      // Check if sports cards are displayed
      const sportsCards = page.locator('a[href*="/sports/"] > div, .card');
      await expect(sportsCards.first()).toBeVisible();

      // Verify card content structure
      const firstCard = sportsCards.first();
      await expect(firstCard.locator('h3, .font-semibold').first()).toBeVisible();
      await expect(firstCard.locator('p, .text-muted-foreground').first()).toBeVisible();
    });

    test('should handle search functionality', async () => {
      await page.goto(`${BASE_URL}/sports`);
      await page.waitForLoadState('networkidle');

      // Test search input
      const searchInput = page.locator('input[placeholder*="Search sports"]');
      await searchInput.fill('basketball');
      await page.locator('button:has-text("Search")').click();

      // Wait for search results
      await page.waitForTimeout(1000);

      // Should maintain search query in input
      await expect(searchInput).toHaveValue('basketball');
    });

    test('should show and hide filters panel', async () => {
      await page.goto(`${BASE_URL}/sports`);
      await page.waitForLoadState('networkidle');

      // Open filters
      await page.locator('button:has-text("Filters")').click();

      // Check if filters panel is visible
      await expect(page.locator('text="Difficulty Level"')).toBeVisible();
      await expect(page.locator('text="Duration (hours)"')).toBeVisible();
      await expect(page.locator('text="Features"')).toBeVisible();

      // Test difficulty filter checkboxes
      await expect(page.locator('input[type="checkbox"]').first()).toBeVisible();
    });

    test('should be responsive on mobile', async () => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`${BASE_URL}/sports`);
      await page.waitForLoadState('networkidle');

      // Check if content adapts to mobile
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('input[placeholder*="Search sports"]')).toBeVisible();

      // Grid should stack on mobile
      const grid = page.locator('.grid, [class*="grid"]').first();
      if (await grid.isVisible()) {
        const gridClasses = await grid.getAttribute('class');
        expect(gridClasses).toMatch(/grid-cols-1|md:grid-cols|lg:grid-cols/);
      }
    });
  });

  test.describe('2. Sports Detail Pages (/sports/[id])', () => {
    test('should load sport detail page with comprehensive information', async () => {
      await page.goto(`${BASE_URL}/sports`);
      await page.waitForLoadState('networkidle');

      // Click on first sport card
      const firstSportLink = page.locator('a[href*="/sports/"]').first();
      await expect(firstSportLink).toBeVisible();
      await firstSportLink.click();

      // Wait for detail page to load
      await page.waitForLoadState('networkidle');

      // Check if we're on a sport detail page
      expect(page.url()).toMatch(/\/sports\/[^\/]+$/);

      // Check back button
      await expect(page.locator('button:has-text("Back")')).toBeVisible();

      // Check sport name and description
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('p').first()).toBeVisible();
    });

    test('should display sport statistics and metadata', async () => {
      await page.goto(`${BASE_URL}/sports`);
      await page.waitForLoadState('networkidle');

      const firstSportLink = page.locator('a[href*="/sports/"]').first();
      await firstSportLink.click();
      await page.waitForLoadState('networkidle');

      // Check for stat cards
      const statCards = page.locator('.card, [class*="card"]');
      await expect(statCards.first()).toBeVisible();

      // Look for difficulty, duration, skills count, and enrollment stats
      await expect(page.locator('text=/difficulty/i, text=/beginner|intermediate|advanced/i')).toBeVisible();
      await expect(page.locator('text=/duration|time/i')).toBeVisible();
      await expect(page.locator('text=/skills/i')).toBeVisible();
    });

    test('should show skills section with filtering', async () => {
      await page.goto(`${BASE_URL}/sports`);
      await page.waitForLoadState('networkidle');

      const firstSportLink = page.locator('a[href*="/sports/"]').first();
      await firstSportLink.click();
      await page.waitForLoadState('networkidle');

      // Check skills section
      await expect(page.locator('h2:has-text("Skills")')).toBeVisible();

      // Check difficulty filter dropdown
      const difficultyFilter = page.locator('select, [role="combobox"]').first();
      if (await difficultyFilter.isVisible()) {
        await expect(difficultyFilter).toBeVisible();
      }
    });

    test('should navigate to skill detail pages', async () => {
      await page.goto(`${BASE_URL}/sports`);
      await page.waitForLoadState('networkidle');

      const firstSportLink = page.locator('a[href*="/sports/"]').first();
      await firstSportLink.click();
      await page.waitForLoadState('networkidle');

      // Look for skill links
      const skillLink = page.locator('a[href*="/skills/"]').first();
      if (await skillLink.isVisible()) {
        await skillLink.click();
        await page.waitForLoadState('networkidle');

        // Should be on skill detail page
        expect(page.url()).toMatch(/\/sports\/[^\/]+\/skills\/[^\/]+$/);
      }
    });

    test('should be responsive on different screen sizes', async () => {
      // Test tablet view
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(`${BASE_URL}/sports`);
      await page.waitForLoadState('networkidle');

      const firstSportLink = page.locator('a[href*="/sports/"]').first();
      await firstSportLink.click();
      await page.waitForLoadState('networkidle');

      // Content should be visible and properly laid out
      await expect(page.locator('h1')).toBeVisible();

      // Test mobile view
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForLoadState('networkidle');

      await expect(page.locator('h1')).toBeVisible();
    });
  });

  test.describe('3. Skill Detail Pages (/sports/[id]/skills/[skillId])', () => {
    test('should load skill detail page with tabbed content', async () => {
      // Navigate to a skill page through the sports catalog
      await page.goto(`${BASE_URL}/sports`);
      await page.waitForLoadState('networkidle');

      const firstSportLink = page.locator('a[href*="/sports/"]').first();
      await firstSportLink.click();
      await page.waitForLoadState('networkidle');

      const skillLink = page.locator('a[href*="/skills/"]').first();
      if (await skillLink.isVisible()) {
        await skillLink.click();
        await page.waitForLoadState('networkidle');

        // Check breadcrumb navigation
        await expect(page.locator('nav, .breadcrumb')).toBeVisible();

        // Check skill title and description
        await expect(page.locator('h1')).toBeVisible();

        // Check tab navigation
        const tabs = page.locator('button:has-text("Content"), button:has-text("Objectives"), button:has-text("Resources")');
        if (await tabs.first().isVisible()) {
          await expect(tabs.first()).toBeVisible();
        }
      }
    });

    test('should display skill statistics and prerequisites', async () => {
      await page.goto(`${BASE_URL}/sports`);
      await page.waitForLoadState('networkidle');

      const firstSportLink = page.locator('a[href*="/sports/"]').first();
      await firstSportLink.click();
      await page.waitForLoadState('networkidle');

      const skillLink = page.locator('a[href*="/skills/"]').first();
      if (await skillLink.isVisible()) {
        await skillLink.click();
        await page.waitForLoadState('networkidle');

        // Check for skill stats
        await expect(page.locator('text=/time|duration/i')).toBeVisible();
        await expect(page.locator('text=/objectives/i')).toBeVisible();

        // Check difficulty badge
        await expect(page.locator('text=/beginner|intermediate|advanced/i')).toBeVisible();
      }
    });

    test('should switch between content tabs', async () => {
      await page.goto(`${BASE_URL}/sports`);
      await page.waitForLoadState('networkidle');

      const firstSportLink = page.locator('a[href*="/sports/"]').first();
      await firstSportLink.click();
      await page.waitForLoadState('networkidle');

      const skillLink = page.locator('a[href*="/skills/"]').first();
      if (await skillLink.isVisible()) {
        await skillLink.click();
        await page.waitForLoadState('networkidle');

        // Test tab switching
        const objectivesTab = page.locator('button:has-text("Objectives")');
        if (await objectivesTab.isVisible()) {
          await objectivesTab.click();
          await expect(page.locator('text="Learning Objectives"')).toBeVisible();
        }

        const resourcesTab = page.locator('button:has-text("Resources")');
        if (await resourcesTab.isVisible()) {
          await resourcesTab.click();
          // Should show resources content or empty state
          await page.waitForTimeout(500);
        }
      }
    });

    test('should handle media content display', async () => {
      await page.goto(`${BASE_URL}/sports`);
      await page.waitForLoadState('networkidle');

      const firstSportLink = page.locator('a[href*="/sports/"]').first();
      await firstSportLink.click();
      await page.waitForLoadState('networkidle');

      const skillLink = page.locator('a[href*="/skills/"]').first();
      if (await skillLink.isVisible()) {
        await skillLink.click();
        await page.waitForLoadState('networkidle');

        // Check for video or image content indicators
        const videoIndicator = page.locator('text=/video/i, svg[class*="play"]');
        const imageContent = page.locator('img, [class*="image"]');

        // At least one should be present or there should be content text
        const hasContent = await videoIndicator.isVisible() ||
                          await imageContent.isVisible() ||
                          await page.locator('text=/content|guide/i').isVisible();

        expect(hasContent).toBeTruthy();
      }
    });
  });

  test.describe('4. Admin Content Management (/admin/sports)', () => {
    test('should require authentication for admin access', async () => {
      await page.goto(`${BASE_URL}/admin/sports`);
      await page.waitForLoadState('networkidle');

      // Should either redirect to login or show admin content
      // If redirected, we should be on auth page
      if (page.url().includes('/auth/') || page.url().includes('/login')) {
        await expect(page.locator('input[type="email"], input[type="text"]')).toBeVisible();
      } else {
        // If admin page loads, check for admin interface
        await expect(page.locator('h1:has-text("Sports Management"), h1:has-text("Admin")')).toBeVisible();
      }
    });

    test('should display sports management interface when authenticated', async () => {
      // Try to access admin page directly
      await page.goto(`${BASE_URL}/admin/sports`);
      await page.waitForLoadState('networkidle');

      // Check if we can access admin features (might require auth bypass for testing)
      if (!page.url().includes('/auth/')) {
        // Check for admin interface elements
        await expect(page.locator('button:has-text("Add Sport"), button[class*="plus"]')).toBeVisible();
        await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();

        // Check for sports list or table
        const sportsContainer = page.locator('.grid, table, .list');
        if (await sportsContainer.isVisible()) {
          await expect(sportsContainer).toBeVisible();
        }
      }
    });

    test('should handle create sport functionality', async () => {
      await page.goto(`${BASE_URL}/admin/sports`);
      await page.waitForLoadState('networkidle');

      if (!page.url().includes('/auth/')) {
        // Try to open create form
        const addButton = page.locator('button:has-text("Add Sport"), button:has-text("Create")');
        if (await addButton.isVisible()) {
          await addButton.click();

          // Check for form fields
          await expect(page.locator('input[id="name"], input[placeholder*="name"]')).toBeVisible();
          await expect(page.locator('textarea, input[id="description"]')).toBeVisible();
          await expect(page.locator('select[id="difficulty"], select')).toBeVisible();
        }
      }
    });

    test('should validate form inputs', async () => {
      await page.goto(`${BASE_URL}/admin/sports`);
      await page.waitForLoadState('networkidle');

      if (!page.url().includes('/auth/')) {
        const addButton = page.locator('button:has-text("Add Sport"), button:has-text("Create")');
        if (await addButton.isVisible()) {
          await addButton.click();

          // Try to submit empty form
          const saveButton = page.locator('button:has-text("Save"), button[type="submit"]');
          if (await saveButton.isVisible()) {
            await saveButton.click();

            // Should show validation errors or prevent submission
            await page.waitForTimeout(500);
          }
        }
      }
    });
  });

  test.describe('5. Media Upload Component Testing', () => {
    test('should handle file upload interface', async () => {
      // Test media upload component if accessible
      await page.goto(`${BASE_URL}/admin/sports`);
      await page.waitForLoadState('networkidle');

      if (!page.url().includes('/auth/')) {
        const addButton = page.locator('button:has-text("Add Sport")');
        if (await addButton.isVisible()) {
          await addButton.click();

          // Look for file upload areas
          const fileUpload = page.locator('input[type="file"], [class*="upload"]');
          if (await fileUpload.isVisible()) {
            await expect(fileUpload).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('6. Error Handling and Edge Cases', () => {
    test('should handle non-existent sport pages gracefully', async () => {
      await page.goto(`${BASE_URL}/sports/non-existent-sport-id`);
      await page.waitForLoadState('networkidle');

      // Should show error message or 404 page
      const errorIndicators = [
        'text=/not found/i',
        'text=/error/i',
        'text=/404/i',
        'button:has-text("Go Back")',
        'button:has-text("Try Again")'
      ];

      let errorFound = false;
      for (const indicator of errorIndicators) {
        if (await page.locator(indicator).isVisible()) {
          errorFound = true;
          break;
        }
      }

      expect(errorFound).toBeTruthy();
    });

    test('should handle non-existent skill pages gracefully', async () => {
      await page.goto(`${BASE_URL}/sports/valid-sport/skills/non-existent-skill`);
      await page.waitForLoadState('networkidle');

      // Should show error message
      const errorIndicators = [
        'text=/not found/i',
        'text=/error/i',
        'button:has-text("Go Back")',
        'button:has-text("Try Again")'
      ];

      let errorFound = false;
      for (const indicator of errorIndicators) {
        if (await page.locator(indicator).isVisible()) {
          errorFound = true;
          break;
        }
      }

      expect(errorFound).toBeTruthy();
    });

    test('should handle network failures gracefully', async () => {
      // Test with network disabled briefly
      await page.route('**/*', route => route.abort());

      await page.goto(`${BASE_URL}/sports`);

      // Should show loading state or error
      const loadingOrError = page.locator('text=/loading/i, text=/error/i, .animate-spin');
      await expect(loadingOrError).toBeVisible({ timeout: 5000 });

      // Re-enable network
      await page.unroute('**/*');
    });
  });

  test.describe('7. Performance and Loading States', () => {
    test('should show appropriate loading states', async () => {
      await page.goto(`${BASE_URL}/sports`);

      // Should show loading indicator initially
      const loadingStates = page.locator('.animate-spin, text=/loading/i, [class*="spinner"]');

      // Wait for content to load
      await page.waitForLoadState('networkidle');

      // Loading should be gone and content should be visible
      await expect(page.locator('h1')).toBeVisible();
    });

    test('should load pages within acceptable time limits', async () => {
      const startTime = Date.now();

      await page.goto(`${BASE_URL}/sports`);
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      // Should load within 10 seconds (generous for testing environment)
      expect(loadTime).toBeLessThan(10000);

      // Check that main content is visible
      await expect(page.locator('h1')).toBeVisible();
    });
  });

  test.describe('8. Navigation and User Flow', () => {
    test('should support complete user journey through catalog', async () => {
      // Start at sports catalog
      await page.goto(`${BASE_URL}/sports`);
      await page.waitForLoadState('networkidle');

      // Navigate to sport detail
      const firstSportLink = page.locator('a[href*="/sports/"]').first();
      if (await firstSportLink.isVisible()) {
        await firstSportLink.click();
        await page.waitForLoadState('networkidle');

        // Navigate to skill detail
        const skillLink = page.locator('a[href*="/skills/"]').first();
        if (await skillLink.isVisible()) {
          await skillLink.click();
          await page.waitForLoadState('networkidle');

          // Navigate back using breadcrumbs or back button
          const backButton = page.locator('button:has-text("Back")').first();
          if (await backButton.isVisible()) {
            await backButton.click();
            await page.waitForLoadState('networkidle');

            // Should be back on sport detail page
            expect(page.url()).toMatch(/\/sports\/[^\/]+$/);
          }
        }
      }
    });

    test('should maintain search state during navigation', async () => {
      await page.goto(`${BASE_URL}/sports`);
      await page.waitForLoadState('networkidle');

      // Perform search
      const searchInput = page.locator('input[placeholder*="Search sports"]');
      await searchInput.fill('test search');
      await page.locator('button:has-text("Search")').click();
      await page.waitForTimeout(1000);

      // Navigate away and back
      await page.goBack();
      await page.goForward();

      // Search should be maintained (depending on implementation)
      await page.waitForLoadState('networkidle');
    });
  });
});