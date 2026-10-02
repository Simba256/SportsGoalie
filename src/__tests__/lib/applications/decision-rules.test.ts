import { describe, it, expect } from 'vitest';

import { actionRefusal, availableActions } from '@/lib/applications/decision-rules';
import {
  APPLICATION_STATUSES,
  isWalledApplicant,
  type ApplicationAction,
  type ApplicationStatus,
} from '@/types/application';

/**
 * The status rules the admin buttons and the decision route share. If these
 * drift, the screen offers something the server refuses, or — worse — the
 * server accepts a second click and emails the applicant twice.
 */

const ACTIONS: ApplicationAction[] = ['approve', 'waitlist', 'decline', 'open'];

describe('availableActions', () => {
  it('offers nothing before the application is in', () => {
    expect(availableActions('applying')).toEqual([]);
  });

  it("offers copy pack 3.7's three buttons on a fresh application", () => {
    expect(availableActions('submitted')).toEqual(['approve', 'waitlist', 'decline']);
  });

  it('offers "open" only while they are waiting on the call', () => {
    for (const status of APPLICATION_STATUSES) {
      expect(availableActions(status).includes('open')).toBe(status === 'awaiting_call');
    }
  });

  it('never offers the action that would leave the status where it is', () => {
    const lands: Record<ApplicationAction, ApplicationStatus> = {
      approve: 'awaiting_call',
      waitlist: 'waitlisted',
      decline: 'declined',
      open: 'approved',
    };
    for (const status of APPLICATION_STATUSES) {
      for (const action of availableActions(status)) {
        expect(lands[action]).not.toBe(status);
      }
    }
  });

  it('does not offer approve again once they are approved or past it', () => {
    expect(availableActions('awaiting_call')).not.toContain('approve');
    expect(availableActions('approved')).not.toContain('approve');
  });
});

describe('actionRefusal', () => {
  it('is null for exactly the actions on offer', () => {
    for (const status of APPLICATION_STATUSES) {
      for (const action of ACTIONS) {
        const offered = availableActions(status).includes(action);
        expect(actionRefusal(status, action) === null).toBe(offered);
      }
    }
  });

  it('says why, in words', () => {
    expect(actionRefusal('applying', 'approve')).toMatch(/not sent their application/);
    expect(actionRefusal('approved', 'open')).toBe('Their account is already open.');
    expect(actionRefusal('approved', 'approve')).toBe('Their account is already open.');
    expect(actionRefusal('awaiting_call', 'approve')).toMatch(/already approved/);
    expect(actionRefusal('submitted', 'open')).toMatch(/Approve them first/);
    expect(actionRefusal('waitlisted', 'waitlist')).toMatch(/already on the waiting list/);
    expect(actionRefusal('declined', 'decline')).toMatch(/not this time/);
  });
});

describe('isWalledApplicant', () => {
  it('walls every status except an open account', () => {
    for (const status of APPLICATION_STATUSES) {
      expect(isWalledApplicant(status)).toBe(status !== 'approved');
    }
  });

  it('keeps an approved applicant walled until the call (H-24)', () => {
    expect(isWalledApplicant('awaiting_call')).toBe(true);
  });

  it('never walls an ordinary member, who has no status at all', () => {
    expect(isWalledApplicant(undefined)).toBe(false);
    expect(isWalledApplicant(null)).toBe(false);
  });
});
