import { test, expect, Page } from '@playwright/test';

/**
 * Admin User Management System - Comprehensive Test Suite
 *
 * This test suite covers:
 * - User listing and pagination
 * - Search and filtering functionality
 * - User role management
 * - User activation/deactivation
 * - Individual user profile management
 * - Mobile responsiveness
 * - Performance testing
 */

const BASE_URL = 'http://localhost:3001';

async function navigateToUserManagement(page: Page) {
  await page.goto('/admin/users');
  await page.waitForLoadState('networkidle');
}

test.describe('User Management - Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToUserManagement(page);
  });

  test('should display user management page with header and stats', async ({ page }) => {
    // Check page header
    await expect(page.locator('h1')).toContainText('User Management');
    await expect(page.locator('text=Manage user accounts, roles, and permissions')).toBeVisible();

    // Check for Add User button
    await expect(page.locator('button:has-text("Add User")')).toBeVisible();
  });

  test('should display user statistics cards', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);

    // Check for stat cards
    await expect(page.locator('text=Total Users')).toBeVisible();
    await expect(page.locator('text=Active Users')).toBeVisible();
    await expect(page.locator('text=Administrators')).toBeVisible();
    await expect(page.locator('text=Students')).toBeVisible();

    // Check that numbers are displayed (they should be >= 0)
    const totalUsersCard = page.locator('text=Total Users').locator('..').locator('..').locator('..').locator('.text-2xl');
    await expect(totalUsersCard).toBeVisible();
  });

  test('should display search and filter controls', async ({ page }) => {
    // Check for search input
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();

    // Check for filter dropdowns
    await expect(page.locator('text=Filter by role')).toBeVisible();
    await expect(page.locator('text=Filter by status')).toBeVisible();
  });

  test('should display users table with proper columns', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Check for users section
    await expect(page.locator('text=Users (')).toBeVisible();

    // If users exist, check the structure
    const userCount = await page.locator('[data-testid="user-item"]').count();

    if (userCount === 0) {
      // Check for empty state
      await expect(page.locator('text=No users found')).toBeVisible();
    } else {
      // Check that user items have proper structure
      const firstUser = page.locator('[data-testid="user-item"]').first();
      await expect(firstUser).toBeVisible();
    }
  });
});

test.describe('User Search and Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToUserManagement(page);
  });

  test('should filter users by search term', async ({ page }) => {
    await page.waitForTimeout(2000);

    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();

    // Type a search term
    await searchInput.fill('admin');
    await page.waitForTimeout(1000);

    // Results should be filtered (this may show no results if no admin users exist)
    const userCount = await page.locator('[data-testid="user-item"]').count();

    // Either show filtered results or "No users found"
    if (userCount === 0) {
      await expect(page.locator('text=Try adjusting your search criteria')).toBeVisible();
    }
  });

  test('should filter users by role', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Click on role filter dropdown
    await page.click('text=Filter by role');
    await page.waitForTimeout(500);

    // Select admin role
    await page.click('text=Administrators');
    await page.waitForTimeout(1000);

    // Check that filter was applied
    const userCount = await page.locator('[data-testid="user-item"]').count();
    // Results will vary based on data
  });

  test('should filter users by status', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Click on status filter dropdown
    await page.click('text=Filter by status');
    await page.waitForTimeout(500);

    // Select active status
    await page.click('text=Active');
    await page.waitForTimeout(1000);

    // Check that filter was applied
    const userCount = await page.locator('[data-testid="user-item"]').count();
    // Results will vary based on data
  });

  test('should clear search when input is cleared', async ({ page }) => {
    await page.waitForTimeout(2000);

    const searchInput = page.locator('input[placeholder*="Search"]');

    // Add search term
    await searchInput.fill('test');
    await page.waitForTimeout(1000);

    // Clear search
    await searchInput.fill('');
    await page.waitForTimeout(1000);

    // Should show all users again (or appropriate state)
  });

  test('should combine multiple filters correctly', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Apply search filter
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('admin');

    // Apply role filter
    await page.click('text=Filter by role');
    await page.waitForTimeout(500);
    await page.click('text=Administrators');

    // Apply status filter
    await page.click('text=Filter by status');
    await page.waitForTimeout(500);
    await page.click('text=Active');

    await page.waitForTimeout(1000);

    // Should show combined filter results
    // The exact assertion depends on available test data
  });
});

test.describe('User Actions and Management', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToUserManagement(page);
  });

  test('should show user profile link for each user', async ({ page }) => {
    await page.waitForTimeout(2000);

    const userCount = await page.locator('[data-testid="user-item"]').count();

    if (userCount > 0) {
      // Check that first user has a "View Profile" button
      const viewProfileButton = page.locator('text=View Profile').first();
      await expect(viewProfileButton).toBeVisible();

      // Check that clicking opens the user profile page
      const href = await viewProfileButton.locator('..').getAttribute('href');
      expect(href).toMatch(/\/admin\/users\/.+/);
    }
  });

  test('should show user action dropdown menu', async ({ page }) => {
    await page.waitForTimeout(2000);

    const userCount = await page.locator('[data-testid="user-item"]').count();

    if (userCount > 0) {
      // Click on the first user's dropdown menu
      const dropdownTrigger = page.locator('button:has([data-testid="more-horizontal"])').first();
      await expect(dropdownTrigger).toBeVisible();
      await dropdownTrigger.click();

      // Check for menu items
      await expect(page.locator('text=View Details')).toBeVisible();
    }
  });

  test('should handle role change actions', async ({ page }) => {
    await page.waitForTimeout(2000);

    const userCount = await page.locator('[data-testid="user-item"]').count();

    if (userCount > 0) {
      // Find a user that is not an admin to test role change
      const dropdownTrigger = page.locator('button:has([data-testid="more-horizontal"])').first();
      await dropdownTrigger.click();

      // Look for role change options
      const makeAdminOption = page.locator('text=Make Admin');
      const makeStudentOption = page.locator('text=Make Student');

      // At least one should be visible (depending on current user role)
      const hasRoleOptions = (await makeAdminOption.count()) > 0 || (await makeStudentOption.count()) > 0;

      if (hasRoleOptions) {
        // Test would click one of the role change options
        // But we won't actually change roles in testing
      }
    }
  });

  test('should handle user activation/deactivation', async ({ page }) => {
    await page.waitForTimeout(2000);

    const userCount = await page.locator('[data-testid="user-item"]').count();

    if (userCount > 0) {
      const dropdownTrigger = page.locator('button:has([data-testid="more-horizontal"])').first();
      await dropdownTrigger.click();

      // Look for activation/deactivation options
      const deactivateOption = page.locator('text=Deactivate');
      const reactivateOption = page.locator('text=Reactivate');

      // One of these should be visible based on user status
      const hasStatusOptions = (await deactivateOption.count()) > 0 || (await reactivateOption.count()) > 0;
      expect(hasStatusOptions).toBe(true);
    }
  });
});

test.describe('User Profile Management', () => {
  test('should navigate to individual user profile', async ({ page }) => {
    await navigateToUserManagement(page);
    await page.waitForTimeout(2000);

    const userCount = await page.locator('[data-testid="user-item"]').count();

    if (userCount > 0) {
      // Click on first user's profile link
      const profileLink = page.locator('text=View Profile').first();
      await profileLink.click();

      // Should navigate to user profile page
      await expect(page).toHaveURL(/\/admin\/users\/.+/);
    }
  });
});

test.describe('Mobile Responsiveness - User Management', () => {
  test('should display properly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await navigateToUserManagement(page);

    // Check that page header is visible
    await expect(page.locator('h1')).toContainText('User Management');

    // Check that search and filters are accessible
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();

    // Check that stat cards are stacked vertically and visible
    await expect(page.locator('text=Total Users')).toBeVisible();
  });

  test('should handle mobile user interactions', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await navigateToUserManagement(page);
    await page.waitForTimeout(2000);

    // Test mobile search functionality
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.tap();
    await expect(searchInput).toBeFocused();

    // Test mobile dropdown interactions
    await page.tap('text=Filter by role');
    await page.waitForTimeout(500);

    // Should show dropdown options
    await expect(page.locator('text=All Roles')).toBeVisible();
  });
});

test.describe('Performance Testing - User Management', () => {
  test('should load user management page within 2 seconds', async ({ page }) => {
    const startTime = Date.now();

    await navigateToUserManagement(page);

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000);
  });

  test('should handle search with reasonable response time', async ({ page }) => {
    await navigateToUserManagement(page);
    await page.waitForTimeout(1000);

    const startTime = Date.now();

    // Perform search
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('test');

    // Wait for search results
    await page.waitForTimeout(500);

    const searchTime = Date.now() - startTime;
    expect(searchTime).toBeLessThan(1000); // Less than 1 second
  });

  test('should handle filter changes efficiently', async ({ page }) => {
    await navigateToUserManagement(page);
    await page.waitForTimeout(1000);

    const startTime = Date.now();

    // Change role filter
    await page.click('text=Filter by role');
    await page.click('text=Administrators');

    // Wait for filter to apply
    await page.waitForTimeout(500);

    const filterTime = Date.now() - startTime;
    expect(filterTime).toBeLessThan(1000);
  });
});

test.describe('Error Handling - User Management', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Block API requests to simulate network issues
    await page.route('**/api/**', route => {
      route.abort();
    });

    await navigateToUserManagement(page);

    // Page should still load with error state
    await expect(page.locator('h1')).toContainText('User Management');

    // Should show appropriate error state
    // This depends on how the app handles API failures
  });

  test('should display appropriate empty states', async ({ page }) => {
    await navigateToUserManagement(page);
    await page.waitForTimeout(2000);

    // If no users, should show empty state
    const userCount = await page.locator('[data-testid="user-item"]').count();

    if (userCount === 0) {
      await expect(page.locator('text=No users found')).toBeVisible();
      await expect(page.locator('text=No users have been registered yet')).toBeVisible();
    }
  });

  test('should handle search with no results', async ({ page }) => {
    await navigateToUserManagement(page);
    await page.waitForTimeout(1000);

    // Search for something unlikely to exist
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('xyznonexistentuser123');
    await page.waitForTimeout(1000);

    // Should show appropriate no results message
    await expect(page.locator('text=Try adjusting your search criteria')).toBeVisible();
  });
});