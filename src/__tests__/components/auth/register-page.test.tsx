import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import RegisterPage from '@/app/auth/register/page';
import { renderWithProviders } from '../../utils/test-utils';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('RegisterPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render registration form with all elements', () => {
    renderWithProviders(<RegisterPage />);

    expect(screen.getByRole('heading', { name: 'Create an Account' })).toBeInTheDocument();
    expect(screen.getByTestId('register-form')).toBeInTheDocument();
    expect(screen.getByTestId('display-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-password-input')).toBeInTheDocument();
    expect(screen.getByTestId('role-student')).toBeInTheDocument();
    expect(screen.getByTestId('role-admin')).toBeInTheDocument();
    expect(screen.getByTestId('agree-terms-checkbox')).toBeInTheDocument();
    expect(screen.getByTestId('register-submit')).toBeInTheDocument();
    expect(screen.getByTestId('login-link')).toBeInTheDocument();
  });

  it('should have student role selected by default', () => {
    renderWithProviders(<RegisterPage />);

    const studentRole = screen.getByTestId('role-student');
    const adminRole = screen.getByTestId('role-admin');

    expect(studentRole).toBeChecked();
    expect(adminRole).not.toBeChecked();
  });

  it('should have agree to terms unchecked by default', () => {
    renderWithProviders(<RegisterPage />);

    const agreeTermsCheckbox = screen.getByTestId('agree-terms-checkbox');
    expect(agreeTermsCheckbox).not.toBeChecked();
  });

  it('should toggle password visibility for password field', async () => {
    const { user } = renderWithProviders(<RegisterPage />);

    const passwordInput = screen.getByTestId('password-input');
    const toggleButton = screen.getByTestId('toggle-password');

    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle button
    await user.click(toggleButton);

    // Password should now be visible
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Click toggle button again
    await user.click(toggleButton);

    // Password should be hidden again
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should toggle password visibility for confirm password field', async () => {
    const { user } = renderWithProviders(<RegisterPage />);

    const confirmPasswordInput = screen.getByTestId('confirm-password-input');
    const toggleButton = screen.getByTestId('toggle-confirm-password');

    // Initially password should be hidden
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    // Click toggle button
    await user.click(toggleButton);

    // Password should now be visible
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');

    // Click toggle button again
    await user.click(toggleButton);

    // Password should be hidden again
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });

  it('should validate all required fields on submission', async () => {
    const { user } = renderWithProviders(<RegisterPage />);

    const submitButton = screen.getByTestId('register-submit');

    // Submit form without filling fields
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('display-name-error')).toBeInTheDocument();
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
      expect(screen.getByTestId('password-error')).toBeInTheDocument();
      expect(screen.getByTestId('confirm-password-error')).toBeInTheDocument();
      expect(screen.getByTestId('agree-terms-error')).toBeInTheDocument();
    });

    expect(screen.getByTestId('display-name-error')).toHaveTextContent('Name is required');
    expect(screen.getByTestId('email-error')).toHaveTextContent('Email is required');
    expect(screen.getByTestId('password-error')).toHaveTextContent('Password is required');
    expect(screen.getByTestId('confirm-password-error')).toHaveTextContent('Please confirm your password');
    expect(screen.getByTestId('agree-terms-error')).toHaveTextContent('You must agree to the terms and conditions');
  });

  it('should validate display name length', async () => {
    const { user } = renderWithProviders(<RegisterPage />);

    const displayNameInput = screen.getByTestId('display-name-input');
    const submitButton = screen.getByTestId('register-submit');

    // Test minimum length
    await user.type(displayNameInput, 'J');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('display-name-error')).toBeInTheDocument();
    });

    expect(screen.getByTestId('display-name-error')).toHaveTextContent('Name must be at least 2 characters');

    // Clear and test maximum length
    await user.clear(displayNameInput);
    await user.type(displayNameInput, 'A'.repeat(51));
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('display-name-error')).toHaveTextContent('Name cannot exceed 50 characters');
    });
  });

  it('should validate email format', async () => {
    const { user } = renderWithProviders(<RegisterPage />);

    const emailInput = screen.getByTestId('email-input');
    const submitButton = screen.getByTestId('register-submit');

    // Enter invalid email
    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
    });

    expect(screen.getByTestId('email-error')).toHaveTextContent('Please enter a valid email address');
  });

  it('should validate password requirements', async () => {
    const { user } = renderWithProviders(<RegisterPage />);

    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('register-submit');

    // Test weak password without uppercase
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('password-error')).toBeInTheDocument();
    });

    const errorText = screen.getByTestId('password-error').textContent;
    expect(errorText).toMatch(/uppercase.*lowercase.*number/);
  });

  it('should validate password confirmation', async () => {
    const { user } = renderWithProviders(<RegisterPage />);

    const passwordInput = screen.getByTestId('password-input');
    const confirmPasswordInput = screen.getByTestId('confirm-password-input');
    const submitButton = screen.getByTestId('register-submit');

    // Enter mismatched passwords
    await user.type(passwordInput, 'TestPassword123!');
    await user.type(confirmPasswordInput, 'DifferentPassword123!');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('confirm-password-error')).toBeInTheDocument();
    });

    expect(screen.getByTestId('confirm-password-error')).toHaveTextContent('Passwords do not match');
  });

  it('should allow role selection', async () => {
    const { user } = renderWithProviders(<RegisterPage />);

    const studentRole = screen.getByTestId('role-student');
    const adminRole = screen.getByTestId('role-admin');

    // Initially student should be selected
    expect(studentRole).toBeChecked();
    expect(adminRole).not.toBeChecked();

    // Select admin role
    await user.click(adminRole);

    expect(adminRole).toBeChecked();
    expect(studentRole).not.toBeChecked();

    // Select student role again
    await user.click(studentRole);

    expect(studentRole).toBeChecked();
    expect(adminRole).not.toBeChecked();
  });

  it('should handle terms agreement checkbox', async () => {
    const { user } = renderWithProviders(<RegisterPage />);

    const agreeTermsCheckbox = screen.getByTestId('agree-terms-checkbox');

    // Initially unchecked
    expect(agreeTermsCheckbox).not.toBeChecked();

    // Click to check
    await user.click(agreeTermsCheckbox);
    expect(agreeTermsCheckbox).toBeChecked();

    // Click to uncheck
    await user.click(agreeTermsCheckbox);
    expect(agreeTermsCheckbox).not.toBeChecked();
  });

  it('should show loading state during form submission', async () => {
    const { user } = renderWithProviders(<RegisterPage />);

    const displayNameInput = screen.getByTestId('display-name-input');
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const confirmPasswordInput = screen.getByTestId('confirm-password-input');
    const agreeTermsCheckbox = screen.getByTestId('agree-terms-checkbox');
    const submitButton = screen.getByTestId('register-submit');

    // Fill form with valid data
    await user.type(displayNameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'TestPassword123!');
    await user.type(confirmPasswordInput, 'TestPassword123!');
    await user.click(agreeTermsCheckbox);

    // Submit form
    await user.click(submitButton);

    // Button should be disabled during loading
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('Creating Account...')).toBeInTheDocument();
  });

  it('should display error message on registration failure', async () => {
    const { user } = renderWithProviders(<RegisterPage />);

    const displayNameInput = screen.getByTestId('display-name-input');
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const confirmPasswordInput = screen.getByTestId('confirm-password-input');
    const agreeTermsCheckbox = screen.getByTestId('agree-terms-checkbox');
    const submitButton = screen.getByTestId('register-submit');

    // Fill form with valid data
    await user.type(displayNameInput, 'John Doe');
    await user.type(emailInput, 'existing@example.com'); // Assuming this will fail
    await user.type(passwordInput, 'TestPassword123!');
    await user.type(confirmPasswordInput, 'TestPassword123!');
    await user.click(agreeTermsCheckbox);

    // Submit form
    await user.click(submitButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByTestId('register-error')).toBeInTheDocument();
    });
  });

  it('should clear errors when user starts typing', async () => {
    const { user } = renderWithProviders(<RegisterPage />);

    const displayNameInput = screen.getByTestId('display-name-input');
    const emailInput = screen.getByTestId('email-input');
    const submitButton = screen.getByTestId('register-submit');

    // Submit empty form to trigger errors
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('display-name-error')).toBeInTheDocument();
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
    });

    // Start typing in display name field
    await user.type(displayNameInput, 'John Doe');
    await user.click(submitButton);

    // Display name error should be cleared, email error should remain
    await waitFor(() => {
      expect(screen.queryByTestId('display-name-error')).not.toBeInTheDocument();
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
    });

    // Start typing in email field
    await user.type(emailInput, 'john@example.com');
    await user.click(submitButton);

    // Email error should be cleared
    await waitFor(() => {
      expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();
    });
  });

  it('should navigate to login page when login link is clicked', async () => {
    const { user } = renderWithProviders(<RegisterPage />);

    const loginLink = screen.getByTestId('login-link');

    // Click login link
    await user.click(loginLink);

    // Should navigate to login page (in actual implementation)
    expect(loginLink).toHaveAttribute('href', '/auth/login');
  });

  it('should have proper accessibility attributes', () => {
    renderWithProviders(<RegisterPage />);

    const displayNameInput = screen.getByTestId('display-name-input');
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const confirmPasswordInput = screen.getByTestId('confirm-password-input');

    // Check input types and autocomplete
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    // Check labels
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Account Type')).toBeInTheDocument();
  });

  it('should handle complete valid form submission flow', async () => {
    const { user } = renderWithProviders(<RegisterPage />);

    const displayNameInput = screen.getByTestId('display-name-input');
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const confirmPasswordInput = screen.getByTestId('confirm-password-input');
    const adminRole = screen.getByTestId('role-admin');
    const agreeTermsCheckbox = screen.getByTestId('agree-terms-checkbox');
    const submitButton = screen.getByTestId('register-submit');

    // Fill complete form
    await user.type(displayNameInput, 'John Doe');
    await user.type(emailInput, 'john.doe@example.com');
    await user.type(passwordInput, 'TestPassword123!');
    await user.type(confirmPasswordInput, 'TestPassword123!');
    await user.click(adminRole);
    await user.click(agreeTermsCheckbox);

    // Verify all values are set correctly
    expect(displayNameInput).toHaveValue('John Doe');
    expect(emailInput).toHaveValue('john.doe@example.com');
    expect(passwordInput).toHaveValue('TestPassword123!');
    expect(confirmPasswordInput).toHaveValue('TestPassword123!');
    expect(adminRole).toBeChecked();
    expect(agreeTermsCheckbox).toBeChecked();

    // Submit form
    await user.click(submitButton);

    // Should show loading state
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('Creating Account...')).toBeInTheDocument();
  });
});