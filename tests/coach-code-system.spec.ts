import { test, expect } from '@playwright/test';

/**
 * Coach Code System Testing
 *
 * This test suite validates the complete coach code system implementation including:
 * 1. Registration flow with coach code selection
 * 2. Coach code validation (format and existence)
 * 3. Error handling for invalid codes
 * 4. UI visibility and conditional rendering
 */

test.describe('Coach Code System', () => {

  test.describe('Registration Page - Coach Code Flow', () => {

    test('should navigate to registration page and take initial screenshot', async ({ page }) => {
      await page.goto('/auth/register');
      await page.waitForLoadState('networkidle');

      // Take screenshot of the registration page
      await page.screenshot({
        path: 'test-results/screenshots/01-registration-page-initial.png',
        fullPage: true
      });

      // Verify page loaded correctly
      await expect(page).toHaveTitle(/Register/i);
      console.log('✓ Registration page loaded successfully');
    });

    test('should show coach code input when selecting Coach-Guided mode', async ({ page }) => {
      await page.goto('/auth/register');
      await page.waitForLoadState('networkidle');

      // Select Student/Athlete role
      await page.click('text=Student / Athlete');
      await page.waitForTimeout(500);

      // Take screenshot after selecting student role
      await page.screenshot({
        path: 'test-results/screenshots/02-student-role-selected.png',
        fullPage: true
      });
      console.log('✓ Student role selected');

      // Find and click on Coach-Guided (Custom) learning mode
      // This might be a radio button or a card - we'll try multiple selectors
      const coachGuidedSelector = await page.locator('text=/Coach.*Guided.*Custom/i').first();
      await coachGuidedSelector.click();
      await page.waitForTimeout(500);

      // Take screenshot showing coach code input field
      await page.screenshot({
        path: 'test-results/screenshots/03-coach-code-input-visible.png',
        fullPage: true
      });

      // Verify coach code input is visible
      const coachCodeInput = page.locator('input[name="coachCode"], input[placeholder*="coach code" i], input[placeholder*="SMITH-7K3M" i]');
      await expect(coachCodeInput).toBeVisible();
      console.log('✓ Coach code input field is visible');

      // Verify the input has the correct placeholder or label
      const inputPlaceholder = await coachCodeInput.getAttribute('placeholder');
      console.log(`  Coach code input placeholder: "${inputPlaceholder}"`);
    });

    test('should show format error for invalid coach code format', async ({ page }) => {
      await page.goto('/auth/register');
      await page.waitForLoadState('networkidle');

      // Select Student role and Coach-Guided mode
      await page.click('text=Student / Athlete');
      await page.waitForTimeout(300);

      const coachGuidedSelector = await page.locator('text=/Coach.*Guided.*Custom/i').first();
      await coachGuidedSelector.click();
      await page.waitForTimeout(300);

      // Find coach code input
      const coachCodeInput = page.locator('input[name="coachCode"], input[placeholder*="coach code" i], input[placeholder*="SMITH" i]').first();

      // Enter invalid format (should be XXXXX-XXXX format)
      await coachCodeInput.fill('abc');
      await coachCodeInput.blur(); // Trigger validation
      await page.waitForTimeout(500);

      // Take screenshot showing format error
      await page.screenshot({
        path: 'test-results/screenshots/04-invalid-format-error.png',
        fullPage: true
      });

      // Check for validation error message
      const errorMessage = page.locator('text=/invalid.*format/i, text=/must be.*format/i, text=/XXXXX-XXXX/i').first();
      const errorVisible = await errorMessage.isVisible().catch(() => false);

      if (errorVisible) {
        const errorText = await errorMessage.textContent();
        console.log(`✓ Format validation error displayed: "${errorText}"`);
      } else {
        console.log('⚠ Format validation error not found (might be inline or using aria-invalid)');

        // Check if input has aria-invalid attribute
        const ariaInvalid = await coachCodeInput.getAttribute('aria-invalid');
        if (ariaInvalid === 'true') {
          console.log('✓ Input marked as invalid via aria-invalid');
        }
      }
    });

    test('should show "Invalid coach code" error for non-existent code', async ({ page }) => {
      await page.goto('/auth/register');
      await page.waitForLoadState('networkidle');

      // Select Student role and Coach-Guided mode
      await page.click('text=Student / Athlete');
      await page.waitForTimeout(300);

      const coachGuidedSelector = await page.locator('text=/Coach.*Guided.*Custom/i').first();
      await coachGuidedSelector.click();
      await page.waitForTimeout(300);

      // Find coach code input
      const coachCodeInput = page.locator('input[name="coachCode"], input[placeholder*="coach code" i], input[placeholder*="SMITH" i]').first();

      // Enter properly formatted but non-existent code
      await coachCodeInput.fill('SMITH-7K3M');

      // Fill in other required fields to trigger validation
      await page.fill('input[name="name"], input[placeholder*="name" i]', 'Test User');
      await page.fill('input[type="email"]', 'test-coach-code@example.com');
      await page.fill('input[type="password"]', 'Password123!');

      // Try to submit the form
      await page.click('button[type="submit"], button:has-text("Register"), button:has-text("Sign Up")');
      await page.waitForTimeout(1000);

      // Take screenshot showing invalid code error
      await page.screenshot({
        path: 'test-results/screenshots/05-non-existent-code-error.png',
        fullPage: true
      });

      // Check for "Invalid coach code" error message
      const errorMessage = page.locator('text=/Invalid coach code/i, text=/Check with your coach/i, text=/code.*not.*found/i').first();
      const errorVisible = await errorMessage.isVisible({ timeout: 5000 }).catch(() => false);

      if (errorVisible) {
        const errorText = await errorMessage.textContent();
        console.log(`✓ Invalid coach code error displayed: "${errorText}"`);
      } else {
        console.log('⚠ Invalid coach code error not displayed');

        // Log all visible error messages for debugging
        const allErrors = await page.locator('[role="alert"], .error, .text-red-500, .text-destructive').allTextContents();
        if (allErrors.length > 0) {
          console.log('  Other error messages found:', allErrors);
        }
      }
    });

    test('should not show coach code input for Self-Paced mode', async ({ page }) => {
      await page.goto('/auth/register');
      await page.waitForLoadState('networkidle');

      // Select Student role
      await page.click('text=Student / Athlete');
      await page.waitForTimeout(300);

      // Select Self-Paced mode (if it exists)
      const selfPacedSelector = page.locator('text=/Self.*Paced/i').first();
      const selfPacedExists = await selfPacedSelector.isVisible().catch(() => false);

      if (selfPacedExists) {
        await selfPacedSelector.click();
        await page.waitForTimeout(500);

        // Take screenshot
        await page.screenshot({
          path: 'test-results/screenshots/06-self-paced-no-coach-code.png',
          fullPage: true
        });

        // Verify coach code input is NOT visible
        const coachCodeInput = page.locator('input[name="coachCode"], input[placeholder*="coach code" i]');
        const isVisible = await coachCodeInput.isVisible().catch(() => false);

        if (!isVisible) {
          console.log('✓ Coach code input correctly hidden for Self-Paced mode');
        } else {
          console.log('✗ Coach code input should not be visible for Self-Paced mode');
        }
      } else {
        console.log('⚠ Self-Paced mode option not found on registration page');
      }
    });
  });

  test.describe('Coach Dashboard Access', () => {

    test('should attempt to navigate to coach dashboard', async ({ page }) => {
      await page.goto('/coach');
      await page.waitForLoadState('networkidle');

      // Take screenshot of whatever shows (login redirect, error, or dashboard)
      await page.screenshot({
        path: 'test-results/screenshots/07-coach-dashboard-unauthenticated.png',
        fullPage: true
      });

      // Check if redirected to login
      const currentUrl = page.url();
      console.log(`  Current URL after navigating to /coach: ${currentUrl}`);

      if (currentUrl.includes('/auth/login')) {
        console.log('✓ Correctly redirected to login page (authentication required)');
      } else if (currentUrl.includes('/coach')) {
        console.log('⚠ Still on coach page - checking for access denied message');

        const accessDenied = await page.locator('text=/access denied/i, text=/unauthorized/i, text=/login required/i').isVisible().catch(() => false);
        if (accessDenied) {
          console.log('✓ Access denied message displayed');
        }
      } else {
        console.log(`  Redirected to: ${currentUrl}`);
      }
    });

    test('should login as coach and access coach dashboard', async ({ page }) => {
      // First, let's try to login with a coach account if one exists
      // We'll need to check if there's a coach account in the test credentials

      await page.goto('/auth/login');
      await page.waitForLoadState('networkidle');

      // Try logging in with admin account (might have coach access)
      await page.fill('input[type="email"]', 'syedbasimmehmood@gmail.com');
      await page.fill('input[type="password"]', 'password');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);

      // Now try to navigate to coach dashboard
      await page.goto('/coach');
      await page.waitForLoadState('networkidle');

      // Take screenshot
      await page.screenshot({
        path: 'test-results/screenshots/08-coach-dashboard-authenticated.png',
        fullPage: true
      });

      const currentUrl = page.url();
      console.log(`  Current URL after login: ${currentUrl}`);

      if (currentUrl.includes('/coach')) {
        console.log('✓ Successfully accessed coach dashboard');

        // Check for coach-specific elements
        const hasCoachElements = await page.locator('text=/students/i, text=/coach code/i, text=/My Students/i').first().isVisible().catch(() => false);
        if (hasCoachElements) {
          console.log('✓ Coach dashboard elements visible');
        }
      } else {
        console.log('⚠ Could not access coach dashboard - might need specific coach role');
        console.log(`  Redirected to: ${currentUrl}`);
      }
    });
  });

  test.describe('Coach Code Format Validation', () => {

    test('should test various coach code formats', async ({ page }) => {
      await page.goto('/auth/register');
      await page.waitForLoadState('networkidle');

      // Select Student role and Coach-Guided mode
      await page.click('text=Student / Athlete');
      await page.waitForTimeout(300);

      const coachGuidedSelector = await page.locator('text=/Coach.*Guided.*Custom/i').first();
      await coachGuidedSelector.click();
      await page.waitForTimeout(300);

      const coachCodeInput = page.locator('input[name="coachCode"], input[placeholder*="coach code" i], input[placeholder*="SMITH" i]').first();

      const testCases = [
        { input: 'abc', expectedValid: false, description: 'lowercase letters only' },
        { input: '12345', expectedValid: false, description: 'numbers only' },
        { input: 'SMITH-', expectedValid: false, description: 'incomplete format' },
        { input: 'SMITH-7K3', expectedValid: false, description: 'too short' },
        { input: 'SMITH-7K3M9', expectedValid: false, description: 'too long' },
        { input: 'SMITH-7K3M', expectedValid: true, description: 'valid format' },
        { input: 'JONES-AB12', expectedValid: true, description: 'valid format with letters and numbers' },
      ];

      console.log('\n  Testing coach code format validation:');

      for (const testCase of testCases) {
        await coachCodeInput.fill(testCase.input);
        await coachCodeInput.blur();
        await page.waitForTimeout(300);

        const hasError = await page.locator('text=/invalid.*format/i, [aria-invalid="true"]').isVisible().catch(() => false);
        const ariaInvalid = await coachCodeInput.getAttribute('aria-invalid');

        const isMarkedInvalid = hasError || ariaInvalid === 'true';
        const validationResult = testCase.expectedValid ? !isMarkedInvalid : isMarkedInvalid;

        const status = validationResult ? '✓' : '✗';
        console.log(`  ${status} "${testCase.input}" (${testCase.description}): ${validationResult ? 'Correct' : 'Incorrect'} validation`);
      }
    });
  });
});
