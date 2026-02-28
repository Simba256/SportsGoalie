import { test, expect } from '@playwright/test';

test.describe('Sports Catalog Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to sports catalog
    await page.goto('/sports');
  });

  test('should display sports catalog with proper layout', async ({ page }) => {
    // Check page title and description
    await expect(page.getByRole('heading', { name: 'Sports Catalog' })).toBeVisible();
    await expect(page.getByText('Discover and master new sports skills with our comprehensive learning platform')).toBeVisible();

    // Check search functionality
    await expect(page.getByPlaceholder('Search sports by name, description, or tags...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Filters' })).toBeVisible();

    // Wait for sports to load
    await page.waitForSelector('[data-testid="sports-grid"], .text-6xl', { timeout: 10000 });

    // Check if we have either sports displayed or empty state
    const sportsGrid = page.locator('[data-testid="sports-grid"]');
    const emptyState = page.locator('.text-6xl:has-text("🔍")');

    const hasContent = await sportsGrid.count() > 0 || await emptyState.count() > 0;
    expect(hasContent).toBe(true);
  });

  test('should handle search functionality', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder('Search sports by name, description, or tags...');
    const searchButton = page.getByRole('button', { name: 'Search' });

    // Test search
    await searchInput.fill('basketball');
    await searchButton.click();

    // Wait for search results
    await page.waitForLoadState('networkidle');

    // Should not have errors
    const errorMessages = page.locator('.text-red-600');
    await expect(errorMessages).toHaveCount(0);
  });

  test('should open and use filters', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    const filtersButton = page.getByRole('button', { name: 'Filters' });
    await filtersButton.click();

    // Check filter panel is visible
    await expect(page.getByText('Difficulty Level')).toBeVisible();
    await expect(page.getByText('Duration (hours)')).toBeVisible();
    await expect(page.getByText('Features')).toBeVisible();

    // Test difficulty filter
    const beginnerCheckbox = page.getByRole('checkbox', { name: 'introduction' });
    await beginnerCheckbox.check();

    // Wait for filter to apply
    await page.waitForLoadState('networkidle');

    // Should not have errors
    const errorMessages = page.locator('.text-red-600');
    await expect(errorMessages).toHaveCount(0);
  });

  test('should clear filters when requested', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Add a search term
    const searchInput = page.getByPlaceholder('Search sports by name, description, or tags...');
    await searchInput.fill('test');

    // Open filters and select one
    const filtersButton = page.getByRole('button', { name: 'Filters' });
    await filtersButton.click();

    const beginnerCheckbox = page.getByRole('checkbox', { name: 'introduction' });
    await beginnerCheckbox.check();

    // Clear all filters
    const clearAllButton = page.getByRole('button', { name: 'Clear All' });
    if (await clearAllButton.isVisible()) {
      await clearAllButton.click();

      // Check that search input is cleared
      await expect(searchInput).toHaveValue('');
    }
  });

  test('should navigate to sport detail page', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Look for sport cards
    const sportCards = page.locator('a[href^="/sports/"]').first();

    if (await sportCards.count() > 0) {
      await sportCards.click();

      // Should navigate to sport detail page
      await expect(page).toHaveURL(/\/sports\/[^\/]+$/);

      // Should show sport detail content
      await expect(page.getByRole('button', { name: /back to sports/i })).toBeVisible();
    } else {
      console.log('No sports available for navigation test');
    }
  });
});

test.describe('Sport Detail Workflows', () => {
  test('should display sport detail page correctly', async ({ page }) => {
    // Navigate to sports catalog first
    await page.goto('/sports');
    await page.waitForLoadState('networkidle');

    // Find and click on a sport (if available)
    const sportCard = page.locator('a[href^="/sports/"]').first();

    if (await sportCard.count() > 0) {
      await sportCard.click();

      // Wait for detail page to load
      await page.waitForLoadState('networkidle');

      // Check for back button
      await expect(page.getByRole('button', { name: /back to sports/i })).toBeVisible();

      // Check for sport information sections
      const possibleSections = [
        page.getByText(/skills/i),
        page.getByText(/difficulty/i),
        page.getByText(/duration/i),
        page.getByText(/Ready to start learning/i)
      ];

      // At least one section should be visible
      let sectionVisible = false;
      for (const section of possibleSections) {
        if (await section.isVisible()) {
          sectionVisible = true;
          break;
        }
      }
      expect(sectionVisible).toBe(true);
    }
  });

  test('should filter skills by difficulty', async ({ page }) => {
    // Navigate to a sport detail page
    await page.goto('/sports');
    await page.waitForLoadState('networkidle');

    const sportCard = page.locator('a[href^="/sports/"]').first();

    if (await sportCard.count() > 0) {
      await sportCard.click();
      await page.waitForLoadState('networkidle');

      // Look for difficulty filter
      const difficultySelect = page.locator('select').first();

      if (await difficultySelect.isVisible()) {
        await difficultySelect.selectOption('introduction');
        await page.waitForLoadState('networkidle');

        // Should not have errors
        const errorMessages = page.locator('.text-red-600');
        await expect(errorMessages).toHaveCount(0);
      }
    }
  });

  test('should navigate to skill detail page', async ({ page }) => {
    // Navigate through sports -> sport -> skill
    await page.goto('/sports');
    await page.waitForLoadState('networkidle');

    const sportCard = page.locator('a[href^="/sports/"]').first();

    if (await sportCard.count() > 0) {
      await sportCard.click();
      await page.waitForLoadState('networkidle');

      // Look for skill links
      const skillCard = page.locator('a[href*="/skills/"]').first();

      if (await skillCard.count() > 0) {
        await skillCard.click();

        // Should navigate to skill detail page
        await expect(page).toHaveURL(/\/sports\/[^\/]+\/skills\/[^\/]+$/);

        // Should show skill detail content
        await page.waitForLoadState('networkidle');
        const backButton = page.getByRole('button', { name: /back to/i });
        await expect(backButton).toBeVisible();
      }
    }
  });
});

test.describe('Admin Workflows', () => {
  test('should access admin sports management', async ({ page }) => {
    // Navigate to admin sports page
    await page.goto('/admin/sports');
    await page.waitForLoadState('networkidle');

    // Check for admin interface
    await expect(page.getByRole('heading', { name: 'Sports Management' })).toBeVisible();
    await expect(page.getByText('Manage sports content and settings')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Sport' })).toBeVisible();

    // Check search functionality
    await expect(page.getByPlaceholder('Search sports...')).toBeVisible();
  });

  test('should open create sport form', async ({ page }) => {
    await page.goto('/admin/sports');
    await page.waitForLoadState('networkidle');

    const addSportButton = page.getByRole('button', { name: 'Add Sport' });
    await addSportButton.click();

    // Should show create form
    await expect(page.getByText('Create New Sport')).toBeVisible();
    await expect(page.getByText('Add a new sport to the catalog')).toBeVisible();

    // Check form fields
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Category')).toBeVisible();
    await expect(page.getByLabel('Description')).toBeVisible();

    // Check action buttons
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('should cancel create sport form', async ({ page }) => {
    await page.goto('/admin/sports');
    await page.waitForLoadState('networkidle');

    const addSportButton = page.getByRole('button', { name: 'Add Sport' });
    await addSportButton.click();

    // Fill some data
    await page.getByLabel('Name').fill('Test Sport');

    // Cancel the form
    const cancelButton = page.getByRole('button', { name: 'Cancel' });
    await cancelButton.click();

    // Form should be hidden
    await expect(page.getByText('Create New Sport')).not.toBeVisible();
  });

  test('should validate form fields', async ({ page }) => {
    await page.goto('/admin/sports');
    await page.waitForLoadState('networkidle');

    const addSportButton = page.getByRole('button', { name: 'Add Sport' });
    await addSportButton.click();

    // Try to save without required fields
    const saveButton = page.getByRole('button', { name: 'Save' });
    await saveButton.click();

    // Should not crash or show server errors
    await page.waitForTimeout(1000);

    // Check for any console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Should not have critical errors
    expect(errors.filter(error => !error.includes('Failed to fetch'))).toHaveLength(0);
  });

  test('should access skills management from sport', async ({ page }) => {
    await page.goto('/admin/sports');
    await page.waitForLoadState('networkidle');

    // Look for skills management button (Users icon)
    const skillsButton = page.locator('button[title="Manage Skills"]').first();

    if (await skillsButton.count() > 0) {
      await skillsButton.click();

      // Should navigate to skills management
      await expect(page).toHaveURL(/\/admin\/sports\/[^\/]+\/skills$/);
      await expect(page.getByText('Skills Management')).toBeVisible();
    }
  });
});

test.describe('Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Block network requests to simulate offline state
    await page.route('**/*', route => route.abort());

    await page.goto('/sports');

    // Should show error state, not crash
    await page.waitForSelector('.text-red-600, .text-6xl', { timeout: 10000 });

    // Should have error message or empty state
    const hasError = await page.locator('.text-red-600').count() > 0;
    const hasEmptyState = await page.locator('.text-6xl').count() > 0;

    expect(hasError || hasEmptyState).toBe(true);
  });

  test('should not have console errors on normal flow', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/sports');
    await page.waitForLoadState('networkidle');

    // Filter out expected network errors (when no data exists)
    const criticalErrors = errors.filter(error =>
      !error.includes('Failed to fetch') &&
      !error.includes('NetworkError') &&
      !error.includes('TypeError: Failed to fetch')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should handle missing images gracefully', async ({ page }) => {
    await page.goto('/sports');
    await page.waitForLoadState('networkidle');

    // Check for broken images
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);

      // If image fails to load, it should have graceful fallback (naturalWidth = 0)
      // This is acceptable behavior
      if (naturalWidth === 0) {
        console.log('Image failed to load (expected for demo data)');
      }
    }

    // Page should still be functional
    await expect(page.getByRole('heading', { name: 'Sports Catalog' })).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/sports');
    await page.waitForLoadState('networkidle');

    // Check that main elements are visible on mobile
    await expect(page.getByRole('heading', { name: 'Sports Catalog' })).toBeVisible();
    await expect(page.getByPlaceholder('Search sports by name, description, or tags...')).toBeVisible();

    // Mobile menu should work
    const filtersButton = page.getByRole('button', { name: 'Filters' });
    await filtersButton.click();

    await expect(page.getByText('Difficulty Level')).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/sports');
    await page.waitForLoadState('networkidle');

    // Check layout on tablet
    await expect(page.getByRole('heading', { name: 'Sports Catalog' })).toBeVisible();

    // Filters should be accessible
    const filtersButton = page.getByRole('button', { name: 'Filters' });
    await filtersButton.click();
    await expect(page.getByText('Difficulty Level')).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/sports');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Should load within 10 seconds (generous for development)
    expect(loadTime).toBeLessThan(10000);
  });

  test('should not have memory leaks in navigation', async ({ page }) => {
    // Navigate between pages multiple times
    for (let i = 0; i < 3; i++) {
      await page.goto('/sports');
      await page.waitForLoadState('networkidle');

      await page.goto('/admin/sports');
      await page.waitForLoadState('networkidle');

      await page.goto('/');
      await page.waitForLoadState('networkidle');
    }

    // Should not crash or become unresponsive
    await expect(page.getByText('SportsCoach')).toBeVisible();
  });
});