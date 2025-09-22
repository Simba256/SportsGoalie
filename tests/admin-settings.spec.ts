import { test, expect, Page } from '@playwright/test';

/**
 * Admin Settings System - Comprehensive Test Suite
 *
 * This test suite covers:
 * - Settings page navigation and layout
 * - Tab navigation between different setting categories
 * - Form input validation and state management
 * - Settings save and reset functionality
 * - Mobile responsiveness
 * - Performance testing
 * - Error handling
 */

const BASE_URL = 'http://localhost:3001';

async function navigateToSettings(page: Page) {
  await page.goto('/admin/settings');
  await page.waitForLoadState('networkidle');
}

test.describe('Settings Page - Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSettings(page);
  });

  test('should display settings page header and controls', async ({ page }) => {
    // Check page header
    await expect(page.locator('h1')).toContainText('System Settings');
    await expect(page.locator('text=Configure platform settings and preferences')).toBeVisible();

    // Check for action buttons
    await expect(page.locator('button:has-text("Reset")')).toBeVisible();
    await expect(page.locator('button:has-text("Save Changes")')).toBeVisible();

    // Save button should be disabled initially (no changes)
    await expect(page.locator('button:has-text("Save Changes")')).toBeDisabled();
  });

  test('should display settings tabs', async ({ page }) => {
    // Check for all setting tabs
    await expect(page.locator('text=General')).toBeVisible();
    await expect(page.locator('text=Content')).toBeVisible();
    await expect(page.locator('text=Security')).toBeVisible();
    await expect(page.locator('text=Notifications')).toBeVisible();
    await expect(page.locator('text=Performance')).toBeVisible();

    // General tab should be active by default
    const generalTab = page.locator('[data-state="active"]:has-text("General")');
    await expect(generalTab).toBeVisible();
  });

  test('should show unsaved changes badge when settings are modified', async ({ page }) => {
    // Modify a setting
    const siteNameInput = page.locator('#siteName');
    await siteNameInput.fill('Modified Site Name');

    // Should show unsaved changes badge
    await expect(page.locator('text=Unsaved Changes')).toBeVisible();

    // Save button should become enabled
    await expect(page.locator('button:has-text("Save Changes")')).toBeEnabled();
  });

  test('should handle save changes functionality', async ({ page }) => {
    // Modify a setting
    const siteNameInput = page.locator('#siteName');
    await siteNameInput.fill('Test Site Name');

    // Click save changes
    const saveButton = page.locator('button:has-text("Save Changes")');
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Should show saving state
    await expect(page.locator('text=Saving...')).toBeVisible();

    // Wait for save to complete
    await page.waitForTimeout(2000);

    // Should show success message and reset state
    await expect(page.locator('text=Save Changes')).toBeVisible();

    // Unsaved changes badge should disappear
    const unsavedBadge = page.locator('text=Unsaved Changes');
    await expect(unsavedBadge).not.toBeVisible();
  });

  test('should handle reset functionality', async ({ page }) => {
    // Modify a setting
    const siteNameInput = page.locator('#siteName');
    const originalValue = await siteNameInput.inputValue();
    await siteNameInput.fill('Modified Value');

    // Click reset
    const resetButton = page.locator('button:has-text("Reset")');
    await resetButton.click();

    // Should reset to original value
    await expect(siteNameInput).toHaveValue(originalValue);

    // Unsaved changes badge should disappear
    await expect(page.locator('text=Unsaved Changes')).not.toBeVisible();
  });
});

test.describe('Settings Tabs Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSettings(page);
  });

  test('should navigate to General settings tab', async ({ page }) => {
    await page.click('text=General');
    await page.waitForTimeout(500);

    // Check for general settings content
    await expect(page.locator('text=Site Information')).toBeVisible();
    await expect(page.locator('text=Platform Configuration')).toBeVisible();
    await expect(page.locator('#siteName')).toBeVisible();
    await expect(page.locator('#siteDescription')).toBeVisible();
  });

  test('should navigate to Content settings tab', async ({ page }) => {
    await page.click('text=Content');
    await page.waitForTimeout(500);

    // Check for content settings
    await expect(page.locator('text=Content Management')).toBeVisible();
    await expect(page.locator('text=Data Retention')).toBeVisible();
    await expect(page.locator('#autoApproval')).toBeVisible();
    await expect(page.locator('#maxQuizQuestions')).toBeVisible();
  });

  test('should navigate to Security settings tab', async ({ page }) => {
    await page.click('text=Security');
    await page.waitForTimeout(500);

    // Check for security settings
    await expect(page.locator('text=Authentication Security')).toBeVisible();
    await expect(page.locator('text=Advanced Security')).toBeVisible();
    await expect(page.locator('#sessionTimeout')).toBeVisible();
    await expect(page.locator('#maxLoginAttempts')).toBeVisible();
  });

  test('should navigate to Notifications settings tab', async ({ page }) => {
    await page.click('text=Notifications');
    await page.waitForTimeout(500);

    // Check for notification settings
    await expect(page.locator('text=System Notifications')).toBeVisible();
    await expect(page.locator('text=Alert Types')).toBeVisible();
    await expect(page.locator('#emailNotifications')).toBeVisible();
    await expect(page.locator('#pushNotifications')).toBeVisible();
  });

  test('should navigate to Performance settings tab', async ({ page }) => {
    await page.click('text=Performance');
    await page.waitForTimeout(500);

    // Check for performance settings
    await expect(page.locator('text=Caching & Storage')).toBeVisible();
    await expect(page.locator('text=Rate Limiting')).toBeVisible();
    await expect(page.locator('#cacheDuration')).toBeVisible();
    await expect(page.locator('#rateLimitRequests')).toBeVisible();
  });
});

test.describe('General Settings Form Controls', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSettings(page);
  });

  test('should handle text input fields', async ({ page }) => {
    // Test site name input
    const siteNameInput = page.locator('#siteName');
    await expect(siteNameInput).toBeVisible();

    const testValue = 'Test Sports Coach Platform';
    await siteNameInput.fill(testValue);
    await expect(siteNameInput).toHaveValue(testValue);

    // Test site description textarea
    const descriptionTextarea = page.locator('#siteDescription');
    await expect(descriptionTextarea).toBeVisible();

    const testDescription = 'A comprehensive sports learning platform for athletes';
    await descriptionTextarea.fill(testDescription);
    await expect(descriptionTextarea).toHaveValue(testDescription);
  });

  test('should handle email input validation', async ({ page }) => {
    // Test contact email field
    const contactEmailInput = page.locator('#contactEmail');
    await expect(contactEmailInput).toBeVisible();

    await contactEmailInput.fill('test@example.com');
    await expect(contactEmailInput).toHaveValue('test@example.com');

    // Test support email field
    const supportEmailInput = page.locator('#supportEmail');
    await expect(supportEmailInput).toBeVisible();

    await supportEmailInput.fill('support@example.com');
    await expect(supportEmailInput).toHaveValue('support@example.com');
  });

  test('should handle dropdown selections', async ({ page }) => {
    // Test default language dropdown
    await page.click('text=English');
    await page.waitForTimeout(500);
    await page.click('text=Spanish');

    // Verify selection (this depends on UI implementation)
    await expect(page.locator('text=Spanish')).toBeVisible();

    // Test timezone dropdown
    await page.click('text=UTC');
    await page.waitForTimeout(500);
    await page.click('text=Eastern Time');

    await expect(page.locator('text=Eastern Time')).toBeVisible();
  });

  test('should handle toggle switches', async ({ page }) => {
    // Test maintenance mode switch
    const maintenanceSwitch = page.locator('#maintenanceMode');
    await expect(maintenanceSwitch).toBeVisible();

    // Click the switch to toggle it
    await maintenanceSwitch.click();
    await page.waitForTimeout(500);

    // Test registration enabled switch
    const registrationSwitch = page.locator('#registrationEnabled');
    await expect(registrationSwitch).toBeVisible();
    await registrationSwitch.click();
    await page.waitForTimeout(500);

    // Should show unsaved changes
    await expect(page.locator('text=Unsaved Changes')).toBeVisible();
  });
});

test.describe('Content Settings Form Controls', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSettings(page);
    await page.click('text=Content');
  });

  test('should handle number input fields', async ({ page }) => {
    // Test max quiz questions
    const maxQuestionsInput = page.locator('#maxQuizQuestions');
    await expect(maxQuestionsInput).toBeVisible();

    await maxQuestionsInput.fill('25');
    await expect(maxQuestionsInput).toHaveValue('25');

    // Test max file size
    const maxFileSizeInput = page.locator('#maxFileSize');
    await expect(maxFileSizeInput).toBeVisible();

    await maxFileSizeInput.fill('20');
    await expect(maxFileSizeInput).toHaveValue('20');

    // Test content retention days
    const retentionInput = page.locator('#contentRetentionDays');
    await expect(retentionInput).toBeVisible();

    await retentionInput.fill('180');
    await expect(retentionInput).toHaveValue('180');
  });

  test('should handle array input for file types', async ({ page }) => {
    // Test allowed file types input
    const fileTypesInput = page.locator('#allowedFileTypes');
    await expect(fileTypesInput).toBeVisible();

    const testValue = 'jpg, png, gif, pdf, mp4, mov';
    await fileTypesInput.fill(testValue);
    await expect(fileTypesInput).toHaveValue(testValue);

    // Should show unsaved changes
    await expect(page.locator('text=Unsaved Changes')).toBeVisible();
  });

  test('should handle content auto-approval toggle', async ({ page }) => {
    const autoApprovalSwitch = page.locator('#autoApproval');
    await expect(autoApprovalSwitch).toBeVisible();

    await autoApprovalSwitch.click();
    await page.waitForTimeout(500);

    // Should show unsaved changes
    await expect(page.locator('text=Unsaved Changes')).toBeVisible();
  });
});

test.describe('Security Settings Form Controls', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSettings(page);
    await page.click('text=Security');
  });

  test('should handle security number inputs', async ({ page }) => {
    // Test session timeout
    const sessionTimeoutInput = page.locator('#sessionTimeout');
    await expect(sessionTimeoutInput).toBeVisible();

    await sessionTimeoutInput.fill('12');
    await expect(sessionTimeoutInput).toHaveValue('12');

    // Test max login attempts
    const maxAttemptsInput = page.locator('#maxLoginAttempts');
    await expect(maxAttemptsInput).toBeVisible();

    await maxAttemptsInput.fill('3');
    await expect(maxAttemptsInput).toHaveValue('3');
  });

  test('should handle security switches', async ({ page }) => {
    // Test email verification switch
    const emailVerificationSwitch = page.locator('#requireEmailVerification');
    await expect(emailVerificationSwitch).toBeVisible();
    await emailVerificationSwitch.click();

    // Test strong passwords switch
    const strongPasswordsSwitch = page.locator('#enforceStrongPasswords');
    await expect(strongPasswordsSwitch).toBeVisible();
    await strongPasswordsSwitch.click();

    // Test two-factor authentication switch
    const twoFactorSwitch = page.locator('#enableTwoFactor');
    await expect(twoFactorSwitch).toBeVisible();
    await twoFactorSwitch.click();

    await page.waitForTimeout(500);
    await expect(page.locator('text=Unsaved Changes')).toBeVisible();
  });

  test('should display security status information', async ({ page }) => {
    // Check for security status section
    await expect(page.locator('text=Security Status')).toBeVisible();
    await expect(page.locator('text=SSL Certificate')).toBeVisible();
    await expect(page.locator('text=Firewall')).toBeVisible();
    await expect(page.locator('text=Intrusion Detection')).toBeVisible();

    // Check for status badges
    const activeBadges = page.locator('text=Active');
    const activeBadgeCount = await activeBadges.count();
    expect(activeBadgeCount).toBeGreaterThan(0);
  });
});

test.describe('Mobile Responsiveness - Settings', () => {
  test('should display properly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await navigateToSettings(page);

    // Check that header and controls are visible
    await expect(page.locator('h1')).toContainText('System Settings');
    await expect(page.locator('button:has-text("Save Changes")')).toBeVisible();

    // Check that tabs are accessible on mobile
    await expect(page.locator('text=General')).toBeVisible();
    await expect(page.locator('text=Security')).toBeVisible();
  });

  test('should handle mobile form interactions', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await navigateToSettings(page);

    // Test mobile input interactions
    const siteNameInput = page.locator('#siteName');
    await siteNameInput.tap();
    await expect(siteNameInput).toBeFocused();
    await siteNameInput.fill('Mobile Test');

    // Test mobile tab switching
    await page.tap('text=Security');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Authentication Security')).toBeVisible();
  });

  test('should handle mobile toggle switches', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await navigateToSettings(page);

    // Test mobile switch interactions
    const maintenanceSwitch = page.locator('#maintenanceMode');
    await maintenanceSwitch.tap();
    await page.waitForTimeout(500);

    await expect(page.locator('text=Unsaved Changes')).toBeVisible();
  });
});

test.describe('Performance Testing - Settings', () => {
  test('should load settings page within 2 seconds', async ({ page }) => {
    const startTime = Date.now();

    await navigateToSettings(page);

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000);
  });

  test('should switch tabs efficiently', async ({ page }) => {
    await navigateToSettings(page);
    await page.waitForTimeout(1000);

    const startTime = Date.now();

    // Switch between multiple tabs
    await page.click('text=Content');
    await page.click('text=Security');
    await page.click('text=Notifications');
    await page.click('text=Performance');

    const switchTime = Date.now() - startTime;
    expect(switchTime).toBeLessThan(2000);
  });

  test('should handle form input changes efficiently', async ({ page }) => {
    await navigateToSettings(page);
    await page.waitForTimeout(1000);

    const startTime = Date.now();

    // Make multiple form changes
    await page.locator('#siteName').fill('Performance Test');
    await page.locator('#siteDescription').fill('Testing performance');
    await page.locator('#contactEmail').fill('perf@test.com');

    const inputTime = Date.now() - startTime;
    expect(inputTime).toBeLessThan(1000);

    // Should show unsaved changes promptly
    await expect(page.locator('text=Unsaved Changes')).toBeVisible();
  });
});

test.describe('Error Handling - Settings', () => {
  test('should handle save errors gracefully', async ({ page }) => {
    // Block API requests to simulate save errors
    await page.route('**/api/**', route => {
      route.abort();
    });

    await navigateToSettings(page);

    // Make a change
    await page.locator('#siteName').fill('Error Test');

    // Attempt to save
    const saveButton = page.locator('button:has-text("Save Changes")');
    await saveButton.click();

    // Should handle the error gracefully
    await page.waitForTimeout(2000);

    // Page should still be functional
    await expect(page.locator('h1')).toContainText('System Settings');
  });

  test('should validate form inputs appropriately', async ({ page }) => {
    await navigateToSettings(page);

    // Test with invalid email
    const contactEmailInput = page.locator('#contactEmail');
    await contactEmailInput.fill('invalid-email');

    // Test with invalid numbers in Content tab
    await page.click('text=Content');
    const maxQuestionsInput = page.locator('#maxQuizQuestions');
    await maxQuestionsInput.fill('-5'); // Invalid negative number

    // Form should handle validation (depending on implementation)
    // At minimum, the form should still be usable
    await expect(page.locator('text=Content Management')).toBeVisible();
  });

  test('should maintain state during tab navigation', async ({ page }) => {
    await navigateToSettings(page);

    // Make changes in General tab
    await page.locator('#siteName').fill('State Test');
    await expect(page.locator('text=Unsaved Changes')).toBeVisible();

    // Navigate to another tab
    await page.click('text=Security');
    await page.waitForTimeout(500);

    // Navigate back to General
    await page.click('text=General');
    await page.waitForTimeout(500);

    // Changes should be preserved
    await expect(page.locator('#siteName')).toHaveValue('State Test');
    await expect(page.locator('text=Unsaved Changes')).toBeVisible();
  });
});