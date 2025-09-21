import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/auth/login/page';
import { mockUsers } from '../../utils/test-utils';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock auth context
const mockUseAuth = vi.fn();
vi.mock('@/lib/auth/context', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('LoginPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form with all elements', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      isAuthenticated: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      resetPassword: vi.fn(),
      updateUserProfile: vi.fn(),
      resendEmailVerification: vi.fn(),
    });

    render(<LoginPage />);

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('remember-me-checkbox')).toBeInTheDocument();
    expect(screen.getByTestId('login-submit')).toBeInTheDocument();
    expect(screen.getByTestId('forgot-password-link')).toBeInTheDocument();
    expect(screen.getByTestId('register-link')).toBeInTheDocument();
  });

  it('should show loading state when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      isAuthenticated: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      resetPassword: vi.fn(),
      updateUserProfile: vi.fn(),
      resendEmailVerification: vi.fn(),
    });

    render(<LoginPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should redirect authenticated admin user to admin page', async () => {
    renderWithProviders(<LoginPage />, {
      authState: {
        user: { ...mockUsers.verifiedAdmin },
        loading: false,
        isAuthenticated: true,
      },
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin');
    });
  });

  it('should redirect authenticated student user to dashboard', async () => {
    renderWithProviders(<LoginPage />, {
      authState: {
        user: { ...mockUsers.verifiedStudent },
        loading: false,
        isAuthenticated: true,
      },
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should display email verification message when URL contains verification parameter', () => {
    // Mock window.location.search
    Object.defineProperty(window, 'location', {
      value: {
        search: '?message=verify-email',
      },
      writable: true,
    });

    renderWithProviders(<LoginPage />);

    expect(screen.getByText('Registration Successful!')).toBeInTheDocument();
    expect(screen.getByText(/We've sent a verification email/)).toBeInTheDocument();
  });

  it('should toggle password visibility', async () => {
    const { user } = renderWithProviders(<LoginPage />);

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

  it('should validate form fields on submission', async () => {
    const { user } = renderWithProviders(<LoginPage />);

    const submitButton = screen.getByTestId('login-submit');

    // Submit form without filling fields
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
      expect(screen.getByTestId('password-error')).toBeInTheDocument();
    });

    expect(screen.getByTestId('email-error')).toHaveTextContent('Email is required');
    expect(screen.getByTestId('password-error')).toHaveTextContent('Password is required');
  });

  it('should validate email format', async () => {
    const { user } = renderWithProviders(<LoginPage />);

    const emailInput = screen.getByTestId('email-input');
    const submitButton = screen.getByTestId('login-submit');

    // Enter invalid email
    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
    });

    expect(screen.getByTestId('email-error')).toHaveTextContent('Please enter a valid email address');
  });

  it('should validate password length', async () => {
    const { user } = renderWithProviders(<LoginPage />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('login-submit');

    // Enter valid email but short password
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, '123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('password-error')).toBeInTheDocument();
    });

    expect(screen.getByTestId('password-error')).toHaveTextContent('Password must be at least 6 characters');
  });

  it('should handle remember me checkbox', async () => {
    const { user } = renderWithProviders(<LoginPage />);

    const rememberMeCheckbox = screen.getByTestId('remember-me-checkbox');

    // Initially unchecked
    expect(rememberMeCheckbox).not.toBeChecked();

    // Click to check
    await user.click(rememberMeCheckbox);
    expect(rememberMeCheckbox).toBeChecked();

    // Click to uncheck
    await user.click(rememberMeCheckbox);
    expect(rememberMeCheckbox).not.toBeChecked();
  });

  it('should show loading state during form submission', async () => {
    const { user } = renderWithProviders(<LoginPage />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('login-submit');

    // Fill form with valid data
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    // Submit form
    await user.click(submitButton);

    // Button should be disabled during loading
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('Signing In...')).toBeInTheDocument();
  });

  it('should display error message on login failure', async () => {
    const { user } = renderWithProviders(<LoginPage />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('login-submit');

    // Fill form with invalid credentials
    await user.type(emailInput, 'invalid@example.com');
    await user.type(passwordInput, 'wrongpassword');

    // Submit form
    await user.click(submitButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByTestId('login-error')).toBeInTheDocument();
    });
  });

  it('should handle form submission with Enter key', async () => {
    const { user } = renderWithProviders(<LoginPage />);

    const emailInput = screen.getByTestId('email-input');

    // Fill email and press Enter
    await user.type(emailInput, 'test@example.com');
    await user.keyboard('{Enter}');

    // Should trigger form validation
    await waitFor(() => {
      expect(screen.getByTestId('password-error')).toBeInTheDocument();
    });
  });

  it('should clear errors when user starts typing', async () => {
    const { user } = renderWithProviders(<LoginPage />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('login-submit');

    // Submit empty form to trigger errors
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
      expect(screen.getByTestId('password-error')).toBeInTheDocument();
    });

    // Start typing in email field
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    // Email error should be cleared, password error should remain
    await waitFor(() => {
      expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();
      expect(screen.getByTestId('password-error')).toBeInTheDocument();
    });

    // Start typing in password field
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Both errors should be cleared
    await waitFor(() => {
      expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();
      expect(screen.queryByTestId('password-error')).not.toBeInTheDocument();
    });
  });

  it('should have proper accessibility attributes', () => {
    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');

    // Check ARIA attributes
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('autoComplete', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');

    // Check labels
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });
});