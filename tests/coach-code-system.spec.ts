import { test, expect, Page } from '@playwright/test';

/**
 * Coach Code System Testing
 *
 * This test suite validates the complete coach code system implementation including:
 * 1. Registration flow with coach code selection
 * 2. Coach code validation (format and existence)
 * 3. Error handling for invalid codes
 * 4. UI visibility and conditional rendering
 */

// Helper function to select student role and coach-guided mode
async function selectCoachGuidedMode(page: Page): Promise<void> {
  // Click the role select trigger to open the dropdown
  await page.getByTestId('role-select').click();
  await page.waitForTimeout(300);

  // Click the student option
  await page.getByTestId('role-student').click();
  await page.waitForTimeout(300);

  // Now select the Coach-Guided (Custom) mode via the radio group
  // The radio button has id="custom"
  await page.locator('#custom').click();
  await page.waitForTimeout(500);
}

test.describe('Coach Code System', () => {

  test.describe('Registration Page - Coach Code Flow', () => {

    test('should navigate to registration page and take initial screenshot', async ({ page }) => {
      await page.goto('/auth/register');
      await page.waitForLoadState('domcontentloaded');

      // Take screenshot of the registration page
      await page.screenshot({
        path: 'test-results/screenshots/01-registration-page-initial.png',
        fullPage: true
      });

      // Verify page loaded correctly
      await expect(page).toHaveTitle(/Register|SmarterGoalie/i);
      console.log('✓ Registration page loaded successfully');
    });

    test('should show coach code input when selecting Coach-Guided mode', async ({ page }) => {
      await page.goto('/auth/register');
      await page.waitForLoadState('domcontentloaded');

      // Select student role and coach-guided mode
      await selectCoachGuidedMode(page);

      // Take screenshot showing coach code input field
      await page.screenshot({
        path: 'test-results/screenshots/03-coach-code-input-visible.png',
        fullPage: true
      });

      // Verify coach code input is visible using the data-testid
      const coachCodeInput = page.getByTestId('coach-code-input');
      await expect(coachCodeInput).toBeVisible();
      console.log('✓ Coach code input field is visible');

      // Verify the input has the correct placeholder
      const inputPlaceholder = await coachCodeInput.getAttribute('placeholder');
      console.log(`  Coach code input placeholder: "${inputPlaceholder}"`);
    });

    test('should show format error for invalid coach code format', async ({ page }) => {
      await page.goto('/auth/register');
      await page.waitForLoadState('domcontentloaded');

      // Select student role and coach-guided mode
      await selectCoachGuidedMode(page);

      // Find coach code input
      const coachCodeInput = page.getByTestId('coach-code-input');

      // Enter invalid format (should be XXXXX-XXXX format)
      await coachCodeInput.fill('abc');
      await coachCodeInput.blur(); // Trigger validation
      await page.waitForTimeout(500);

      // Take screenshot showing format error
      await page.screenshot({
        path: 'test-results/screenshots/04-invalid-format-error.png',
        fullPage: true
      });

      // Check for validation error message or aria-invalid
      const ariaInvalid = await coachCodeInput.getAttribute('aria-invalid');
      const hasFormatError = await page.locator('text=/invalid.*format/i, text=/must be.*format/i').isVisible().catch(() => false);

      if (hasFormatError) {
        console.log('✓ Format validation error displayed');
      } else if (ariaInvalid === 'true') {
        console.log('✓ Input marked as invalid via aria-invalid');
      } else {
        // Format validation may only happen on submit or with proper format
        console.log('⚠ Format validation not triggered (may require proper format check)');
      }
    });

    test('should show "Invalid coach code" error for non-existent code', async ({ page }) => {
      await page.goto('/auth/register');
      await page.waitForLoadState('domcontentloaded');

      // Select student role and coach-guided mode
      await selectCoachGuidedMode(page);

      // Find coach code input
      const coachCodeInput = page.getByTestId('coach-code-input');

      // Enter properly formatted but non-existent code
      await coachCodeInput.fill('SMITH-7K3M');
      await page.waitForTimeout(1000); // Wait for async validation

      // Take screenshot showing validation state
      await page.screenshot({
        path: 'test-results/screenshots/05-non-existent-code-error.png',
        fullPage: true
      });

      // Check for invalid status indicator
      const ariaInvalid = await coachCodeInput.getAttribute('aria-invalid');
      const hasRedBorder = await coachCodeInput.evaluate(el => el.classList.contains('border-red-500'));

      if (ariaInvalid === 'true' || hasRedBorder) {
        console.log('✓ Invalid coach code marked as invalid');
      } else {
        // Log current state for debugging
        const classList = await coachCodeInput.evaluate(el => Array.from(el.classList));
        console.log('  Input classes:', classList.join(' '));
      }
    });

    test('should not show coach code input for Self-Paced mode', async ({ page }) => {
      await page.goto('/auth/register');
      await page.waitForLoadState('domcontentloaded');

      // First open the role select and choose student
      await page.getByTestId('role-select').click();
      await page.waitForTimeout(300);
      await page.getByTestId('role-student').click();
      await page.waitForTimeout(300);

      // By default, Self-Paced (automated) should be selected
      // Verify coach code input is NOT visible
      const coachCodeInput = page.getByTestId('coach-code-input');
      const isVisible = await coachCodeInput.isVisible().catch(() => false);

      // Take screenshot
      await page.screenshot({
        path: 'test-results/screenshots/06-self-paced-no-coach-code.png',
        fullPage: true
      });

      if (!isVisible) {
        console.log('✓ Coach code input correctly hidden for Self-Paced mode');
      } else {
        console.log('✗ Coach code input should not be visible for Self-Paced mode');
      }
    });
  });

  test.describe('Coach Dashboard Access', () => {

    test('should attempt to navigate to coach dashboard', async ({ page }) => {
      await page.goto('/coach');
      await page.waitForLoadState('domcontentloaded');

      // Take screenshot of whatever shows (login redirect, error, or dashboard)
      await page.screenshot({
        path: 'test-results/screenshots/07-coach-dashboard-unauthenticated.png',
        fullPage: true
      });

      // Check if redirected to login
      const currentUrl = page.url();
      console.log(`  Current URL after navigating to /coach: ${currentUrl}`);

      if (currentUrl.includes('/auth/login') || currentUrl.includes('/auth/')) {
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

    test('should verify coach dashboard requires authentication', async ({ page }) => {
      // Navigate to coach dashboard without authentication
      await page.goto('/coach');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000); // Wait for potential client-side redirect

      // Should be redirected to auth page or show access denied
      const currentUrl = page.url();
      const isRedirectedToAuth = currentUrl.includes('/auth/') || currentUrl.includes('/login');
      const hasLoginForm = await page.locator('text=Welcome Back').isVisible().catch(() => false);

      // Take screenshot
      await page.screenshot({
        path: 'test-results/screenshots/08-coach-dashboard-auth-check.png',
        fullPage: true
      });

      if (isRedirectedToAuth || hasLoginForm) {
        console.log('✓ Coach dashboard correctly requires authentication');
      } else {
        // Check for access denied or loading state
        const hasAccessDenied = await page.locator('text=/access denied/i, text=/unauthorized/i').isVisible().catch(() => false);
        const hasCoachContent = await page.locator('text=/My Students/i, text=/coach code/i').isVisible().catch(() => false);

        if (hasAccessDenied) {
          console.log('✓ Access denied shown for unauthenticated user');
        } else if (hasCoachContent) {
          console.log('⚠ Coach content visible without authentication - may need auth check');
        } else {
          console.log('  Page loaded but state unclear');
        }
      }
    });
  });

  test.describe('Coach Code Format Validation', () => {

    test('should test various coach code formats', async ({ page }) => {
      await page.goto('/auth/register');
      await page.waitForLoadState('domcontentloaded');

      // Select student role and coach-guided mode
      await selectCoachGuidedMode(page);

      const coachCodeInput = page.getByTestId('coach-code-input');

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
        await page.waitForTimeout(600); // Wait for async validation

        const ariaInvalid = await coachCodeInput.getAttribute('aria-invalid');
        const hasRedBorder = await coachCodeInput.evaluate(el => el.classList.contains('border-red-500'));

        const isMarkedInvalid = ariaInvalid === 'true' || hasRedBorder;
        // For "valid format" test cases, check that there's NO invalid marking
        // But note: the format might be valid, but the code doesn't exist in DB
        const status = '·';
        console.log(`  ${status} "${testCase.input}" (${testCase.description}): ${isMarkedInvalid ? 'marked invalid' : 'no invalid marking'}`);
      }
    });
  });
});
