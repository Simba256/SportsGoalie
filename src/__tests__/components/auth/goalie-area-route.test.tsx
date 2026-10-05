import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, mockUsers } from '../../utils/test-utils';
import { GoalieAreaRoute } from '@/components/auth/goalie-area-route';

// renderWithProviders only fills mockUseAuth; the component reads useAuth from
// the real module, so point that at the same mock.
vi.mock('@/lib/auth/context', async () => {
  const { mockUseAuth } = await import('../../utils/test-utils');
  return { useAuth: () => mockUseAuth() };
});

const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

type AuthState = NonNullable<Parameters<typeof renderWithProviders>[1]>['authState'];

function renderAs(authState: AuthState) {
  return renderWithProviders(
    <GoalieAreaRoute>
      <div>Pillar Content</div>
    </GoalieAreaRoute>,
    { authState }
  );
}

// The helper's AppUser type only knows student and admin, so the coach, parent
// and paused users are built from the student and cast.
type TestUser = NonNullable<AuthState>['user'];
const asUser = (fields: object) => ({ ...mockUsers.verifiedStudent, ...fields }) as unknown as TestUser;

const coach = asUser({ role: 'coach' });
const parent = asUser({ role: 'parent' });
const pausedGoalie = asUser({ isPaused: true });

describe('GoalieAreaRoute (the goalie portal pillar pages)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends a logged-out visitor to login and shows them nothing', () => {
    const { queryByText } = renderAs({ user: null, loading: false, isAuthenticated: false });

    expect(mockPush).toHaveBeenCalledWith('/auth/login');
    expect(queryByText('Pillar Content')).not.toBeInTheDocument();
  });

  it('shows nothing while the sign-in state is still loading', () => {
    const { queryByText } = renderAs({ user: null, loading: true, isAuthenticated: false });

    expect(queryByText('Pillar Content')).not.toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('lets a goalie in', () => {
    const { getByText } = renderAs({
      user: mockUsers.verifiedStudent,
      loading: false,
      isAuthenticated: true,
    });

    expect(getByText('Pillar Content')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('lets an admin in, so the portal can be previewed and tested', () => {
    const { getByText } = renderAs({
      user: mockUsers.verifiedAdmin,
      loading: false,
      isAuthenticated: true,
    });

    expect(getByText('Pillar Content')).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('sends a coach to the coach portal, not the goalie pillar page', () => {
    const { queryByText } = renderAs({ user: coach, loading: false, isAuthenticated: true });

    expect(mockReplace).toHaveBeenCalledWith('/coach');
    expect(queryByText('Pillar Content')).not.toBeInTheDocument();
  });

  it('sends a parent to the parent portal, not the goalie pillar page', () => {
    const { queryByText } = renderAs({ user: parent, loading: false, isAuthenticated: true });

    expect(mockReplace).toHaveBeenCalledWith('/parent');
    expect(queryByText('Pillar Content')).not.toBeInTheDocument();
  });

  it('still holds a paused goalie on the paused screen', () => {
    const { queryByText, getByRole } = renderAs({
      user: pausedGoalie,
      loading: false,
      isAuthenticated: true,
    });

    expect(getByRole('heading', { level: 1 })).toHaveTextContent('Your account is paused.');
    expect(queryByText('Pillar Content')).not.toBeInTheDocument();
  });
});
