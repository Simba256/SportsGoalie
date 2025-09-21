import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { mockUsers } from '../../utils/test-utils';
import { GuestRoute } from '@/components/auth/guest-route';

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

describe('GuestRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading spinner while authentication is loading', () => {
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

    const { getByText } = render(
      <GuestRoute>
        <div>Guest Content</div>
      </GuestRoute>
    );

    expect(getByText('Loading...')).toBeInTheDocument();
  });

  it('should render custom fallback while loading', () => {
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

    const customFallback = <div>Custom Loading...</div>;

    const { getByText } = render(
      <GuestRoute fallback={customFallback}>
        <div>Guest Content</div>
      </GuestRoute>
    );

    expect(getByText('Custom Loading...')).toBeInTheDocument();
  });

  it('should redirect admin user to admin panel', () => {
    mockUseAuth.mockReturnValue({
      user: mockUsers.verifiedAdmin,
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      resetPassword: vi.fn(),
      updateUserProfile: vi.fn(),
      resendEmailVerification: vi.fn(),
    });

    render(
      <GuestRoute>
        <div>Guest Content</div>
      </GuestRoute>
    );

    expect(mockPush).toHaveBeenCalledWith('/admin');
  });

  it('should redirect student user to dashboard', () => {
    mockUseAuth.mockReturnValue({
      user: mockUsers.verifiedStudent,
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      resetPassword: vi.fn(),
      updateUserProfile: vi.fn(),
      resendEmailVerification: vi.fn(),
    });

    render(
      <GuestRoute>
        <div>Guest Content</div>
      </GuestRoute>
    );

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('should return null when authenticated user will be redirected', () => {
    mockUseAuth.mockReturnValue({
      user: mockUsers.verifiedStudent,
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      resetPassword: vi.fn(),
      updateUserProfile: vi.fn(),
      resendEmailVerification: vi.fn(),
    });

    const { container } = render(
      <GuestRoute>
        <div>Guest Content</div>
      </GuestRoute>
    );

    // Should return null (empty) as user will be redirected
    expect(container.firstChild).toBeNull();
  });

  it('should render children when user is not authenticated', () => {
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

    const { getByText } = render(
      <GuestRoute>
        <div>Guest Content</div>
      </GuestRoute>
    );

    expect(getByText('Guest Content')).toBeInTheDocument();
  });

  it('should handle role-based redirection correctly', () => {
    // Test admin user
    mockUseAuth.mockReturnValue({
      user: { ...mockUsers.verifiedAdmin },
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      resetPassword: vi.fn(),
      updateUserProfile: vi.fn(),
      resendEmailVerification: vi.fn(),
    });

    const { rerender } = render(
      <GuestRoute>
        <div>Guest Content</div>
      </GuestRoute>
    );

    expect(mockPush).toHaveBeenCalledWith('/admin');

    vi.clearAllMocks();

    // Test student user
    mockUseAuth.mockReturnValue({
      user: { ...mockUsers.verifiedStudent },
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      resetPassword: vi.fn(),
      updateUserProfile: vi.fn(),
      resendEmailVerification: vi.fn(),
    });

    rerender(
      <GuestRoute>
        <div>Guest Content</div>
      </GuestRoute>
    );

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('should handle transition from loading to authenticated', () => {
    // Initially loading
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

    const { rerender } = render(
      <GuestRoute>
        <div>Guest Content</div>
      </GuestRoute>
    );

    // Initially loading - should show loading state
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();

    // Update to authenticated state
    mockUseAuth.mockReturnValue({
      user: mockUsers.verifiedStudent,
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      resetPassword: vi.fn(),
      updateUserProfile: vi.fn(),
      resendEmailVerification: vi.fn(),
    });

    rerender(
      <GuestRoute>
        <div>Guest Content</div>
      </GuestRoute>
    );

    // Should redirect
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('should handle transition from loading to unauthenticated', () => {
    // Initially loading
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

    const { rerender, getByText } = render(
      <GuestRoute>
        <div>Guest Content</div>
      </GuestRoute>
    );

    // Initially loading
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();

    // Update to unauthenticated state
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

    rerender(
      <GuestRoute>
        <div>Guest Content</div>
      </GuestRoute>
    );

    // Should show guest content
    expect(getByText('Guest Content')).toBeInTheDocument();
  });

  it('should not redirect when user is null but authenticated is false', () => {
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

    render(
      <GuestRoute>
        <div>Guest Content</div>
      </GuestRoute>
    );

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should handle edge case with authenticated true but no user', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      resetPassword: vi.fn(),
      updateUserProfile: vi.fn(),
      resendEmailVerification: vi.fn(),
    });

    render(
      <GuestRoute>
        <div>Guest Content</div>
      </GuestRoute>
    );

    // Should still redirect to dashboard (default fallback)
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('should render complex children correctly', () => {
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

    const ComplexContent = () => (
      <div>
        <h1>Welcome Guest</h1>
        <p>Please sign in to continue</p>
        <button>Sign In</button>
      </div>
    );

    const { getByText, getByRole } = render(
      <GuestRoute>
        <ComplexContent />
      </GuestRoute>
    );

    expect(getByText('Welcome Guest')).toBeInTheDocument();
    expect(getByText('Please sign in to continue')).toBeInTheDocument();
    expect(getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });
});