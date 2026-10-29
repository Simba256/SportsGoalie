import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';

import AcceptInvitePage from '../../../../app/auth/accept-invite/page';

/**
 * An invited goalie's first screen after sign-up plays Coach Mike's welcome by
 * itself, and an iPhone allows that only if playback was unlocked inside the
 * tap that created the account. This is the live way a goalie signs up, so the
 * call is held here: made for an invited goalie, made before the form is
 * checked, and never made for a coach, a parent or an admin.
 */

const { prime, validateInvitation, validateLegacyInvitation } = vi.hoisted(() => ({
  prime: vi.fn(),
  validateInvitation: vi.fn(),
  validateLegacyInvitation: vi.fn(),
}));

vi.mock('@/lib/audio/context', () => ({
  useCoachAudio: () => ({ prime }),
}));
vi.mock('@/lib/auth/context', () => ({
  useAuth: () => ({ register: vi.fn() }),
}));
vi.mock('@/lib/services/invitation.service', () => ({
  invitationService: { validateInvitation },
}));
vi.mock('@/lib/services/coach-invitation.service', () => ({
  coachInvitationService: { validateInvitation: validateLegacyInvitation },
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({ get: () => 'invite-token' }),
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const invitationFor = (role: string) => ({
  id: 'invitation-1',
  email: 'invitee@example.com',
  role,
  invitedByName: 'Coach Mike',
  metadata: { firstName: 'Sam', lastName: 'Keeper' },
});

/** Opens the invitation link, and lets the invitation check finish. */
async function open() {
  await act(async () => {
    render(<AcceptInvitePage />);
  });
}

/** Opens the link, then taps the form's button with the passwords still empty. */
async function openAndSubmit() {
  await open();
  const form = await vi.waitFor(() => {
    const found = document.querySelector('form');
    if (!found) throw new Error('the invitation form has not appeared yet');
    return found;
  });
  await act(async () => {
    fireEvent.submit(form);
  });
}

beforeEach(() => {
  prime.mockClear();
  validateInvitation.mockReset();
  validateLegacyInvitation.mockReset();
});

afterEach(() => cleanup());

describe('accept-invite page — unlocking the voice on submit', () => {
  it('primes playback when an invited goalie submits, before the form is checked', async () => {
    validateInvitation.mockResolvedValue({ valid: true, invitation: invitationFor('student') });
    await openAndSubmit();

    expect(prime).toHaveBeenCalledTimes(1);
  });

  it('does not prime just from opening the link', async () => {
    validateInvitation.mockResolvedValue({ valid: true, invitation: invitationFor('student') });
    await open();
    expect(document.querySelector('form')).not.toBeNull();

    expect(prime).not.toHaveBeenCalled();
  });

  it.each(['coach', 'goalie_coach', 'parent', 'admin'])('does not prime for an invited %s', async role => {
    validateInvitation.mockResolvedValue({ valid: true, invitation: invitationFor(role) });
    await openAndSubmit();

    expect(prime).not.toHaveBeenCalled();
  });

  it('does not prime for a legacy coach invitation', async () => {
    validateInvitation.mockResolvedValue({ valid: false, error: 'Invalid invitation link.', reason: 'not_found' });
    validateLegacyInvitation.mockResolvedValue({
      valid: true,
      invitation: { id: 'legacy-1', email: 'coach@example.com', invitedByName: 'Coach Mike', metadata: {} },
    });
    await openAndSubmit();

    expect(prime).not.toHaveBeenCalled();
  });

  it('shows no form, and primes nothing, for a link that is not valid', async () => {
    validateInvitation.mockResolvedValue({ valid: false, error: 'Invalid invitation link.', reason: 'not_found' });
    validateLegacyInvitation.mockResolvedValue({ valid: false, error: 'Invalid invitation link.', reason: 'not_found' });
    await open();

    expect(document.querySelector('form')).toBeNull();
    expect(screen.queryByText("You're Invited!")).toBeNull();
    expect(prime).not.toHaveBeenCalled();
  });
});
