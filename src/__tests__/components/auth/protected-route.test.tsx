import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, mockUsers } from '../../utils/test-utils';
import { ProtectedRoute, AdminRoute, StudentRoute } from '@/components/auth/protected-route';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading spinner while authentication is loading', () => {
    const { getByText, getByRole } = renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
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

  it('should redirect to login when user is not authenticated', () => {
    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      {
        authState: {
          user: null,
          loading: false,
          isAuthenticated: false,
        },
      }
    );

    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });

  it('should render children when user is authenticated', () => {
    const { getByText } = renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      {
        authState: {
          user: mockUsers.verifiedStudent,
          loading: false,
          isAuthenticated: true,
        },
      }
    );

    expect(getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect when user role does not match required role', () => {
    renderWithProviders(
      <ProtectedRoute requiredRole="admin">
        <div>Admin Content</div>
      </ProtectedRoute>,
      {
        authState: {
          user: mockUsers.verifiedStudent, // Student trying to access admin content
          loading: false,
          isAuthenticated: true,
        },
      }
    );

    expect(mockPush).toHaveBeenCalledWith('/dashboard'); // Student redirected to dashboard
  });

  it('should render children when user role matches required role', () => {
    const { getByText } = renderWithProviders(
      <ProtectedRoute requiredRole="admin">
        <div>Admin Content</div>
      </ProtectedRoute>,
      {
        authState: {
          user: mockUsers.verifiedAdmin,
          loading: false,
          isAuthenticated: true,
        },
      }
    );

    expect(getByText('Admin Content')).toBeInTheDocument();
  });

  it('should use custom redirect path', () => {
    renderWithProviders(
      <ProtectedRoute redirectTo="/custom-login">
        <div>Protected Content</div>
      </ProtectedRoute>,
      {
        authState: {
          user: null,
          loading: false,
          isAuthenticated: false,
        },
      }
    );

    expect(mockPush).toHaveBeenCalledWith('/custom-login');
  });

  it('should render custom fallback during loading', () => {
    const { getByText } = renderWithProviders(
      <ProtectedRoute fallback={<div>Custom Loading...</div>}>
        <div>Protected Content</div>
      </ProtectedRoute>,
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
});

describe('AdminRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children for admin users', () => {
    const { getByText } = renderWithProviders(
      <AdminRoute>
        <div>Admin Panel</div>
      </AdminRoute>,
      {
        authState: {
          user: mockUsers.verifiedAdmin,
          loading: false,
          isAuthenticated: true,
        },
      }
    );

    expect(getByText('Admin Panel')).toBeInTheDocument();
  });

  it('should redirect student users to dashboard', () => {
    renderWithProviders(
      <AdminRoute>
        <div>Admin Panel</div>
      </AdminRoute>,
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

  it('should redirect unauthenticated users to dashboard', () => {
    renderWithProviders(
      <AdminRoute>
        <div>Admin Panel</div>
      </AdminRoute>,
      {
        authState: {
          user: null,
          loading: false,
          isAuthenticated: false,
        },
      }
    );

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });
});

describe('StudentRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children for student users', () => {
    const { getByText } = renderWithProviders(
      <StudentRoute>
        <div>Student Dashboard</div>
      </StudentRoute>,
      {
        authState: {
          user: mockUsers.verifiedStudent,
          loading: false,
          isAuthenticated: true,
        },
      }
    );

    expect(getByText('Student Dashboard')).toBeInTheDocument();
  });

  it('should redirect admin users to admin panel', () => {
    renderWithProviders(
      <StudentRoute>
        <div>Student Dashboard</div>
      </StudentRoute>,
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

  it('should redirect unauthenticated users to admin panel', () => {
    renderWithProviders(
      <StudentRoute>
        <div>Student Dashboard</div>
      </StudentRoute>,
      {
        authState: {
          user: null,
          loading: false,
          isAuthenticated: false,
        },
      }
    );

    expect(mockPush).toHaveBeenCalledWith('/admin');
  });
});