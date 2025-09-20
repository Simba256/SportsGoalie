import { test, expect, Page } from '@playwright/test';

// Test user credentials for different scenarios
const testUsers = {
  verified: {
    email: 'verified.user@test.com',
    password: 'TestPassword123!',
    displayName: 'Verified Test User',
  },
  unverified: {
    email: 'unverified.user@test.com',
    password: 'TestPassword123!',
    displayName: 'Unverified Test User',
  },
  newUser: {
    email: `new.user.${Date.now()}@test.com`,
    password: 'TestPassword123!',
    displayName: 'New Test User',
  },
};

// Helper functions using data-testid for reliability
async function fillLoginForm(page: Page, email: string, password: string) {
  await page.getByTestId('email-input').fill(email);
  await page.getByTestId('password-input').fill(password);
}

async function fillRegistrationForm(page: Page, user: typeof testUsers.newUser) {
  await page.getByTestId('display-name-input').fill(user.displayName);
  await page.getByTestId('email-input').fill(user.email);
  await page.getByTestId('password-input').fill(user.password);
  await page.getByTestId('confirm-password-input').fill(user.password);
  await page.getByTestId('agree-terms-checkbox').check();
}

test.describe('Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('/');
  });

  test.describe('Login Flow', () => {
    test('should display login page correctly', async ({ page }) => {
      await page.goto('/auth/login');

      // Check page elements using data-testid
      await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
      await expect(page.getByTestId('login-form')).toBeVisible();
      await expect(page.getByTestId('email-input')).toBeVisible();
      await expect(page.getByTestId('password-input')).toBeVisible();
      await expect(page.getByTestId('login-submit')).toBeVisible();
      await expect(page.getByTestId('forgot-password-link')).toBeVisible();
      await expect(page.getByTestId('register-link')).toBeVisible();
    });

    test('should show validation errors for empty form', async ({ page }) => {
      await page.goto('/auth/login');

      // Try to submit empty form
      await page.getByTestId('login-submit').click();

      // Check for validation errors
      await expect(page.getByTestId('email-error')).toBeVisible();
      await expect(page.getByTestId('password-error')).toBeVisible();
      await expect(page.getByTestId('email-error')).toHaveText('Email is required');
      await expect(page.getByTestId('password-error')).toHaveText('Password is required');
    });

    test('should show validation errors for invalid email', async ({ page }) => {
      await page.goto('/auth/login');

      await page.getByTestId('email-input').fill('invalid-email');
      await page.getByTestId('password-input').fill('password123');
      await page.getByTestId('login-submit').click();

      await expect(page.getByTestId('email-error')).toBeVisible();
      await expect(page.getByTestId('email-error')).toHaveText('Please enter a valid email address');
    });

    test('should show validation error for short password', async ({ page }) => {
      await page.goto('/auth/login');

      await page.getByTestId('email-input').fill(testUsers.verified.email);
      await page.getByTestId('password-input').fill('123');
      await page.getByTestId('login-submit').click();

      await expect(page.getByTestId('password-error')).toBeVisible();
      await expect(page.getByTestId('password-error')).toHaveText('Password must be at least 6 characters');
    });

    test('should show error for incorrect credentials', async ({ page }) => {
      await page.goto('/auth/login');

      await fillLoginForm(page, 'nonexistent@test.com', 'wrongpassword');
      await page.getByTestId('login-submit').click();

      // Should show error message (will fail due to no Firebase, but that's expected)
      await expect(page.getByTestId('login-error')).toBeVisible();
    });

    test('should toggle password visibility', async ({ page }) => {
      await page.goto('/auth/login');

      const passwordInput = page.getByTestId('password-input');
      const toggleButton = page.getByTestId('toggle-password');

      // Initially password should be hidden
      await expect(passwordInput).toHaveAttribute('type', 'password');

      // Fill password and toggle visibility
      await passwordInput.fill('testpassword');
      await toggleButton.click();

      // Password should now be visible
      await expect(passwordInput).toHaveAttribute('type', 'text');

      // Toggle back to hidden
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('should handle remember me checkbox', async ({ page }) => {
      await page.goto('/auth/login');

      const rememberMeCheckbox = page.getByTestId('remember-me-checkbox');

      // Should be unchecked by default
      await expect(rememberMeCheckbox).not.toBeChecked();

      // Should be able to check it
      await rememberMeCheckbox.check();
      await expect(rememberMeCheckbox).toBeChecked();

      // Should be able to uncheck it
      await rememberMeCheckbox.uncheck();
      await expect(rememberMeCheckbox).not.toBeChecked();
    });

    test('should navigate to register page', async ({ page }) => {
      await page.goto('/auth/login');

      // Click on create account link
      await page.getByTestId('register-link').click();

      // Should navigate to register page
      await expect(page.url()).toContain('/auth/register');
      await expect(page.getByRole('heading', { name: 'Create an Account' })).toBeVisible();
    });

    test('should navigate to forgot password page', async ({ page }) => {
      await page.goto('/auth/login');

      // Click on forgot password link
      await page.getByTestId('forgot-password-link').click();

      // Should navigate to reset password page
      await expect(page.url()).toContain('/auth/reset-password');
      await expect(page.getByRole('heading', { name: 'Reset Your Password' })).toBeVisible();
    });

    test('should show loading state during submission', async ({ page }) => {
      await page.goto('/auth/login');

      await fillLoginForm(page, testUsers.verified.email, testUsers.verified.password);

      // Click submit and immediately check for loading state
      await page.getByTestId('login-submit').click();

      // Should be disabled during loading
      await expect(page.getByTestId('login-submit')).toBeDisabled();
    });
  });

  test.describe('Registration Flow', () => {
    test('should display registration page correctly', async ({ page }) => {
      await page.goto('/auth/register');

      // Check page elements using data-testid
      await expect(page.getByRole('heading', { name: 'Create an Account' })).toBeVisible();
      await expect(page.getByTestId('register-form')).toBeVisible();
      await expect(page.getByTestId('display-name-input')).toBeVisible();
      await expect(page.getByTestId('email-input')).toBeVisible();
      await expect(page.getByTestId('password-input')).toBeVisible();
      await expect(page.getByTestId('confirm-password-input')).toBeVisible();
      await expect(page.getByTestId('role-student')).toBeVisible();
      await expect(page.getByTestId('role-admin')).toBeVisible();
      await expect(page.getByTestId('agree-terms-checkbox')).toBeVisible();
      await expect(page.getByTestId('register-submit')).toBeVisible();
    });

    test('should show validation errors for empty form', async ({ page }) => {
      await page.goto('/auth/register');

      await page.getByTestId('register-submit').click();

      // Check for validation errors
      await expect(page.getByTestId('display-name-error')).toBeVisible();
      await expect(page.getByTestId('email-error')).toBeVisible();
      await expect(page.getByTestId('password-error')).toBeVisible();
      await expect(page.getByTestId('confirm-password-error')).toBeVisible();
      await expect(page.getByTestId('agree-terms-error')).toBeVisible();

      // Check specific error messages
      await expect(page.getByTestId('display-name-error')).toHaveText('Name is required');
      await expect(page.getByTestId('email-error')).toHaveText('Email is required');
      await expect(page.getByTestId('password-error')).toHaveText('Password is required');
      await expect(page.getByTestId('confirm-password-error')).toHaveText('Please confirm your password');
      await expect(page.getByTestId('agree-terms-error')).toHaveText('You must agree to the terms and conditions');
    });

    test('should validate display name length', async ({ page }) => {
      await page.goto('/auth/register');

      // Test minimum length
      await page.getByTestId('display-name-input').fill('J');
      await page.getByTestId('register-submit').click();

      await expect(page.getByTestId('display-name-error')).toBeVisible();
      await expect(page.getByTestId('display-name-error')).toHaveText('Name must be at least 2 characters');

      // Clear and test maximum length
      await page.getByTestId('display-name-input').fill('A'.repeat(51));
      await page.getByTestId('register-submit').click();

      await expect(page.getByTestId('display-name-error')).toBeVisible();
      await expect(page.getByTestId('display-name-error')).toHaveText('Name cannot exceed 50 characters');
    });

    test('should show password requirements validation', async ({ page }) => {
      await page.goto('/auth/register');

      // Test weak password without uppercase
      await page.getByTestId('password-input').fill('password123');
      await page.getByTestId('register-submit').click();

      await expect(page.getByTestId('password-error')).toBeVisible();
      const errorText = await page.getByTestId('password-error').textContent();
      expect(errorText).toMatch(/uppercase.*lowercase.*number/);
    });

    test('should show password mismatch error', async ({ page }) => {
      await page.goto('/auth/register');

      await page.getByTestId('password-input').fill('TestPassword123!');
      await page.getByTestId('confirm-password-input').fill('DifferentPassword123!');
      await page.getByTestId('register-submit').click();

      await expect(page.getByTestId('confirm-password-error')).toBeVisible();
      await expect(page.getByTestId('confirm-password-error')).toHaveText('Passwords do not match');
    });

    test('should toggle password visibility for both fields', async ({ page }) => {
      await page.goto('/auth/register');

      const passwordInput = page.getByTestId('password-input');
      const confirmPasswordInput = page.getByTestId('confirm-password-input');
      const passwordToggle = page.getByTestId('toggle-password');
      const confirmPasswordToggle = page.getByTestId('toggle-confirm-password');

      // Fill passwords
      await passwordInput.fill('testpassword');
      await confirmPasswordInput.fill('testpassword');

      // Initially both should be hidden
      await expect(passwordInput).toHaveAttribute('type', 'password');
      await expect(confirmPasswordInput).toHaveAttribute('type', 'password');

      // Toggle password visibility
      await passwordToggle.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');

      // Toggle confirm password visibility
      await confirmPasswordToggle.click();
      await expect(confirmPasswordInput).toHaveAttribute('type', 'text');

      // Toggle back to hidden
      await passwordToggle.click();
      await confirmPasswordToggle.click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
      await expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });

    test('should validate role selection', async ({ page }) => {
      await page.goto('/auth/register');

      const studentRole = page.getByTestId('role-student');
      const adminRole = page.getByTestId('role-admin');

      // Student should be selected by default
      await expect(studentRole).toBeChecked();
      await expect(adminRole).not.toBeChecked();

      // Should be able to change role
      await adminRole.click();
      await expect(adminRole).toBeChecked();
      await expect(studentRole).not.toBeChecked();

      // Change back to student
      await studentRole.click();
      await expect(studentRole).toBeChecked();
      await expect(adminRole).not.toBeChecked();
    });

    test('should handle terms agreement checkbox', async ({ page }) => {
      await page.goto('/auth/register');

      const agreeTermsCheckbox = page.getByTestId('agree-terms-checkbox');

      // Should be unchecked by default
      await expect(agreeTermsCheckbox).not.toBeChecked();

      // Should be able to check it
      await agreeTermsCheckbox.check();
      await expect(agreeTermsCheckbox).toBeChecked();

      // Should be able to uncheck it
      await agreeTermsCheckbox.uncheck();
      await expect(agreeTermsCheckbox).not.toBeChecked();
    });

    test('should navigate to login page', async ({ page }) => {
      await page.goto('/auth/register');

      // Click on sign in link
      await page.getByTestId('login-link').click();

      // Should navigate to login page
      await expect(page.url()).toContain('/auth/login');
      await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    });

    test('should show loading state during submission', async ({ page }) => {
      await page.goto('/auth/register');

      await fillRegistrationForm(page, testUsers.newUser);

      // Click submit and check for loading state
      await page.getByTestId('register-submit').click();

      // Should be disabled during loading
      await expect(page.getByTestId('register-submit')).toBeDisabled();
    });
  });

  test.describe('Password Reset Flow', () => {
    test('should display password reset page correctly', async ({ page }) => {
      await page.goto('/auth/reset-password');

      await expect(page.getByRole('heading', { name: 'Reset Your Password' })).toBeVisible();
      await expect(page.getByTestId('reset-password-form')).toBeVisible();
      await expect(page.getByTestId('email-input')).toBeVisible();
      await expect(page.getByTestId('reset-password-submit')).toBeVisible();
      await expect(page.getByTestId('back-to-login-link')).toBeVisible();
    });

    test('should show validation error for empty email', async ({ page }) => {
      await page.goto('/auth/reset-password');

      await page.getByTestId('reset-password-submit').click();

      await expect(page.getByTestId('email-error')).toBeVisible();
      await expect(page.getByTestId('email-error')).toHaveText('Email is required');
    });

    test('should show validation error for invalid email', async ({ page }) => {
      await page.goto('/auth/reset-password');

      await page.getByTestId('email-input').fill('invalid-email');
      await page.getByTestId('reset-password-submit').click();

      await expect(page.getByTestId('email-error')).toBeVisible();
      await expect(page.getByTestId('email-error')).toHaveText('Please enter a valid email address');
    });

    test('should handle valid email submission', async ({ page }) => {
      await page.goto('/auth/reset-password');

      await page.getByTestId('email-input').fill(testUsers.verified.email);
      await page.getByTestId('reset-password-submit').click();

      // Should show error due to Firebase not being configured
      await expect(page.getByTestId('reset-password-error')).toBeVisible();
    });

    test('should navigate back to login', async ({ page }) => {
      await page.goto('/auth/reset-password');

      // Click back to login link
      await page.getByTestId('back-to-login-link').click();

      // Should navigate to login page
      await expect(page.url()).toContain('/auth/login');
      await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    });

    test('should navigate to login via sign in instead link', async ({ page }) => {
      await page.goto('/auth/reset-password');

      // Click sign in instead link
      await page.getByTestId('signin-instead-link').click();

      // Should navigate to login page
      await expect(page.url()).toContain('/auth/login');
      await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    });

    test('should show loading state during submission', async ({ page }) => {
      await page.goto('/auth/reset-password');

      await page.getByTestId('email-input').fill(testUsers.verified.email);

      // Click submit and check for loading state
      await page.getByTestId('reset-password-submit').click();

      // Should be disabled during loading
      await expect(page.getByTestId('reset-password-submit')).toBeDisabled();
    });
  });

  test.describe('Navigation and Links', () => {
    test('should navigate between auth pages correctly', async ({ page }) => {
      // Start at login
      await page.goto('/auth/login');

      // Navigate to register
      await page.getByTestId('register-link').click();
      await expect(page.url()).toContain('/auth/register');

      // Navigate back to login
      await page.getByTestId('login-link').click();
      await expect(page.url()).toContain('/auth/login');

      // Navigate to password reset
      await page.getByTestId('forgot-password-link').click();
      await expect(page.url()).toContain('/auth/reset-password');

      // Navigate back to login
      await page.getByTestId('back-to-login-link').click();
      await expect(page.url()).toContain('/auth/login');
    });

    test('should handle navigation from reset password page', async ({ page }) => {
      await page.goto('/auth/reset-password');

      // Test both back links
      await page.getByTestId('signin-instead-link').click();
      await expect(page.url()).toContain('/auth/login');

      await page.goto('/auth/reset-password');
      await page.getByTestId('back-to-login-link').click();
      await expect(page.url()).toContain('/auth/login');
    });
  });

  test.describe('Form State Management', () => {
    test('should preserve form data during same-page interactions', async ({ page }) => {
      await page.goto('/auth/login');

      // Fill form
      const email = 'test@example.com';
      const password = 'testpassword';

      await page.getByTestId('email-input').fill(email);
      await page.getByTestId('password-input').fill(password);

      // Toggle password visibility (should preserve values)
      await page.getByTestId('toggle-password').click();

      await expect(page.getByTestId('email-input')).toHaveValue(email);
      await expect(page.getByTestId('password-input')).toHaveValue(password);

      // Check remember me (should preserve values)
      await page.getByTestId('remember-me-checkbox').check();

      await expect(page.getByTestId('email-input')).toHaveValue(email);
      await expect(page.getByTestId('password-input')).toHaveValue(password);
      await expect(page.getByTestId('remember-me-checkbox')).toBeChecked();
    });

    test('should clear form data when navigating between pages', async ({ page }) => {
      await page.goto('/auth/login');

      // Fill form
      await page.getByTestId('email-input').fill('test@example.com');
      await page.getByTestId('password-input').fill('testpassword');

      // Navigate to register and back
      await page.getByTestId('register-link').click();
      await page.getByTestId('login-link').click();

      // Form should be cleared (security best practice)
      await expect(page.getByTestId('email-input')).toHaveValue('');
      await expect(page.getByTestId('password-input')).toHaveValue('');
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels and roles', async ({ page }) => {
      await page.goto('/auth/login');

      // Check form accessibility
      await expect(page.getByLabel('Email')).toBeVisible();
      await expect(page.getByLabel('Password')).toBeVisible();

      // Check inputs have proper aria-invalid attributes
      const emailInput = page.getByTestId('email-input');
      const passwordInput = page.getByTestId('password-input');

      await emailInput.fill('invalid');
      await page.getByTestId('login-submit').click();

      // Should have aria-invalid when there are errors
      await expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    });

    test('should handle keyboard navigation', async ({ page }) => {
      await page.goto('/auth/login');

      // Tab through form elements
      await page.keyboard.press('Tab'); // Email input
      await expect(page.getByTestId('email-input')).toBeFocused();

      await page.keyboard.press('Tab'); // Password input
      await expect(page.getByTestId('password-input')).toBeFocused();

      await page.keyboard.press('Tab'); // Toggle password button
      await expect(page.getByTestId('toggle-password')).toBeFocused();

      await page.keyboard.press('Tab'); // Remember me checkbox
      await expect(page.getByTestId('remember-me-checkbox')).toBeFocused();

      await page.keyboard.press('Tab'); // Submit button
      await expect(page.getByTestId('login-submit')).toBeFocused();
    });

    test('should support Enter key form submission', async ({ page }) => {
      await page.goto('/auth/login');

      // Fill email and press Enter
      await page.getByTestId('email-input').fill('test@example.com');
      await page.getByTestId('email-input').press('Enter');

      // Should trigger form validation
      await expect(page.getByTestId('password-error')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should clear previous errors when fixing validation issues', async ({ page }) => {
      await page.goto('/auth/login');

      // Trigger validation errors
      await page.getByTestId('login-submit').click();
      await expect(page.getByTestId('email-error')).toBeVisible();
      await expect(page.getByTestId('password-error')).toBeVisible();

      // Fix email error
      await page.getByTestId('email-input').fill('valid@example.com');
      await page.getByTestId('login-submit').click();

      // Email error should be gone, password error should remain
      await expect(page.getByTestId('email-error')).not.toBeVisible();
      await expect(page.getByTestId('password-error')).toBeVisible();

      // Fix password error
      await page.getByTestId('password-input').fill('validpassword123');
      await page.getByTestId('login-submit').click();

      // Both validation errors should be gone
      await expect(page.getByTestId('email-error')).not.toBeVisible();
      await expect(page.getByTestId('password-error')).not.toBeVisible();
    });

    test('should handle network/submission errors gracefully', async ({ page }) => {
      await page.goto('/auth/login');

      // Fill valid form data
      await fillLoginForm(page, testUsers.verified.email, testUsers.verified.password);

      // Submit form (will fail due to no Firebase connection)
      await page.getByTestId('login-submit').click();

      // Should show error message (not validation error)
      await expect(page.getByTestId('login-error')).toBeVisible();

      // Form should remain filled for retry
      await expect(page.getByTestId('email-input')).toHaveValue(testUsers.verified.email);
      await expect(page.getByTestId('password-input')).toHaveValue(testUsers.verified.password);
    });

    test('should handle multiple rapid form submissions', async ({ page }) => {
      await page.goto('/auth/login');

      // Fill form with invalid data
      await page.getByTestId('email-input').fill('test@example.com');
      await page.getByTestId('password-input').fill('123'); // Too short

      // Click submit multiple times rapidly
      const submitButton = page.getByTestId('login-submit');
      await submitButton.click();
      await submitButton.click();
      await submitButton.click();

      // Should only process one submission and show validation errors
      await expect(page.getByTestId('password-error')).toBeVisible();
      await expect(page.getByTestId('password-error')).toHaveText('Password must be at least 6 characters');
    });
  });

  test.describe('Page Titles and Meta', () => {
    test('should have proper page titles', async ({ page }) => {
      await page.goto('/auth/login');
      await expect(page).toHaveTitle(/Login|Sign In|SportsCoach/);

      await page.goto('/auth/register');
      await expect(page).toHaveTitle(/Register|Sign Up|Create Account|SportsCoach/);

      await page.goto('/auth/reset-password');
      await expect(page).toHaveTitle(/Reset Password|Forgot Password|SportsCoach/);
    });
  });
});