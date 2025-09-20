import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderWithProviders, mockUsers } from '../../utils/test-utils';
import { GuestRoute } from '@/components/auth/guest-route';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('GuestRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading spinner while authentication is loading', () => {
    const { getByText, getByRole } = renderWithProviders(
      <GuestRoute>
        <div>Guest Content</div>
      </GuestRoute>,
      {
        authState: {
          user: null,
          loading: true,
          isAuthenticated: false,
        },
      }
    );

    expect(getByText('Loading...')).toBeInTheDocument();
    expect(getByRole('status', { hidden: true })).toBeInTheDocument(); // Loading spinner
  });

  it('should render custom fallback while loading', () => {
    const customFallback = <div>Custom Loading...</div>;

    const { getByText } = renderWithProviders(
      <GuestRoute fallback={customFallback}>
        <div>Guest Content</div>
      </GuestRoute>,
      {
        authState: {
          user: null,
          loading: true,
          isAuthenticated: false,
        },
      }
    );

    expect(getByText('Custom Loading...')).toBeInTheDocument();
  });

  it('should redirect admin user to admin panel', () => {
    renderWithProviders(
      <GuestRoute>
        <div>Guest Content</div>
      </GuestRoute>,
      {
        authState: {
          user: mockUsers.verifiedAdmin,
          loading: false,
          isAuthenticated: true,
        },
      }
    );

    expect(mockPush).toHaveBeenCalledWith('/admin');
  });

  it('should redirect student user to dashboard', () => {
    renderWithProviders(
      <GuestRoute>
        <div>Guest Content</div>
      </GuestRoute>,
      {
        authState: {
          user: mockUsers.verifiedStudent,
          loading: false,
          isAuthenticated: true,
        },
      }
    );

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('should return null when authenticated user will be redirected', () => {
    const { container } = renderWithProviders(
      <GuestRoute>
        <div>Guest Content</div>
      </GuestRoute>,
      {
        authState: {
          user: mockUsers.verifiedStudent,
          loading: false,
          isAuthenticated: true,
        },
      }
    );

    // Should return null (empty) as user will be redirected
    expect(container.firstChild).toBeNull();
  });

  it('should render children when user is not authenticated', () => {
    const { getByText } = renderWithProviders(
      <GuestRoute>
        <div>Guest Content</div>
      </GuestRoute>,
      {
        authState: {
          user: null,
          loading: false,
          isAuthenticated: false,
        },
      }
    );

    expect(getByText('Guest Content')).toBeInTheDocument();
  });

  it('should handle role-based redirection correctly', () => {
    // Test admin user
    const { rerender } = renderWithProviders(
      <GuestRoute>
        <div>Guest Content</div>
      </GuestRoute>,
      {
        authState: {
          user: { ...mockUsers.verifiedAdmin },
          loading: false,
          isAuthenticated: true,
        },
      }
    );

    expect(mockPush).toHaveBeenCalledWith('/admin');

    vi.clearAllMocks();

    // Test student user
    rerender(
      <GuestRoute>
        <div>Guest Content</div>
      </GuestRoute>
    );

    renderWithProviders(
      <GuestRoute>
        <div>Guest Content</div>
      </GuestRoute>,
      {
        authState: {
          user: { ...mockUsers.verifiedStudent },
          loading: false,
          isAuthenticated: true,
        },
      }
    );

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('should handle transition from loading to authenticated', () => {
    const { rerender } = renderWithProviders(
      <GuestRoute>
        <div>Guest Content</div>
      </GuestRoute>,
      {
        authState: {
          user: null,
          loading: true,
          isAuthenticated: false,
        },
      }
    );

    // Initially loading
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();

    // Update to authenticated state
    rerender(
      <GuestRoute>
        <div>Guest Content</div>
      </GuestRoute>
    );

    renderWithProviders(
      <GuestRoute>
        <div>Guest Content</div>
      </GuestRoute>,
      {
        authState: {
          user: mockUsers.verifiedStudent,
          loading: false,
          isAuthenticated: true,
        },
      }
    );

    // Should redirect
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('should handle transition from loading to unauthenticated', () => {
    const { rerender, getByText } = renderWithProviders(
      <GuestRoute>
        <div>Guest Content</div>
      </GuestRoute>,
      {
        authState: {
          user: null,
          loading: true,
          isAuthenticated: false,
        },
      }
    );

    // Initially loading
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();

    // Update to unauthenticated state
    rerender(
      <GuestRoute>
        <div>Guest Content</div>
      </GuestRoute>
    );

    renderWithProviders(
      <GuestRoute>
        <div>Guest Content</div>
      </GuestRoute>,
      {
        authState: {
          user: null,
          loading: false,
          isAuthenticated: false,
        },
      }
    );

    // Should show guest content
    expect(getByText('Guest Content')).toBeInTheDocument();
  });

  it('should not redirect when user is null but authenticated is false', () => {
    renderWithProviders(
      <GuestRoute>
        <div>Guest Content</div>
      </GuestRoute>,
      {
        authState: {
          user: null,
          loading: false,
          isAuthenticated: false,
        },
      }
    );

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should handle edge case with authenticated true but no user', () => {
    renderWithProviders(
      <GuestRoute>
        <div>Guest Content</div>
      </GuestRoute>,
      {
        authState: {
          user: null,
          loading: false,
          isAuthenticated: true,
        },
      }
    );

    // Should still redirect to dashboard (default fallback)
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('should render complex children correctly', () => {
    const ComplexContent = () => (
      <div>
        <h1>Welcome Guest</h1>
        <p>Please sign in to continue</p>
        <button>Sign In</button>
      </div>
    );

    const { getByText, getByRole } = renderWithProviders(
      <GuestRoute>
        <ComplexContent />
      </GuestRoute>,
      {
        authState: {
          user: null,
          loading: false,
          isAuthenticated: false,
        },
      }
    );

    expect(getByText('Welcome Guest')).toBeInTheDocument();
    expect(getByText('Please sign in to continue')).toBeInTheDocument();
    expect(getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });
});