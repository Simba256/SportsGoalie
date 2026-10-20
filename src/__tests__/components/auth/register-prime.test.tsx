import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';

import RegisterPage from '../../../../app/auth/register/page';

/**
 * Coach Mike's welcome plays by itself on the screen after sign-up, and an
 * iPhone allows that only if playback was unlocked inside the tap that
 * submitted the form. These tests hold that call in place: made for a goalie,
 * made before the form is validated, and never made for anyone else.
 */

const { prime, registerUser } = vi.hoisted(() => ({ prime: vi.fn(), registerUser: vi.fn() }));

vi.mock('@/lib/audio/context', () => ({
  useCoachAudio: () => ({ prime }),
}));
vi.mock('@/lib/auth/context', () => ({
  useAuth: () => ({ register: registerUser, user: null, loading: false }),
}));
// Goalies are invitation-only at the moment, so the Goalie option is not on the
// form. Switch it on, as it will be once self-registration opens.
vi.mock('@/lib/auth/signup-policy', async importActual => ({
  ...(await importActual<typeof import('@/lib/auth/signup-policy')>()),
  GOALIE_SELF_REGISTRATION_ENABLED: true,
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

async function submitAs(role: 'parent' | 'coach' | 'student') {
  render(<RegisterPage />);
  fireEvent.change(screen.getByTestId('role-select'), { target: { value: role } });
  // The form is left empty on purpose: the call has to come before validation.
  await act(async () => {
    fireEvent.submit(screen.getByTestId('register-form'));
  });
}

beforeEach(() => {
  prime.mockClear();
  registerUser.mockClear();
});

afterEach(() => cleanup());

describe('register page — unlocking the voice on submit', () => {
  it('primes playback when a goalie submits, even with the form still incomplete', async () => {
    await submitAs('student');
    expect(prime).toHaveBeenCalledTimes(1);
    expect(registerUser).not.toHaveBeenCalled();
  });

  it.each(['parent', 'coach'] as const)('does not prime for a %s', async role => {
    await submitAs(role);
    expect(prime).not.toHaveBeenCalled();
  });

  it('does not prime before anything is submitted', () => {
    render(<RegisterPage />);
    fireEvent.change(screen.getByTestId('role-select'), { target: { value: 'student' } });
    expect(prime).not.toHaveBeenCalled();
  });
});
