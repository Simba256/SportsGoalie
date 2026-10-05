import { describe, it, expect } from 'vitest';

import { emailFingerprint } from '@/lib/applications/email-fingerprint';

/**
 * The fingerprint is how the decision route knows the email it is about to
 * send is the one the sender was shown (H-25). Any change to any part of it
 * has to change the fingerprint; nothing else may.
 */

const email = { subject: 'Straight answer', text: 'Keep working.', html: '<p>Keep working.</p>' };

describe('emailFingerprint', () => {
  it('is stable for the same email to the same person', () => {
    expect(emailFingerprint('jo@example.com', email)).toBe(emailFingerprint('jo@example.com', { ...email }));
  });

  it('is a 64-character hex string, which is what the route accepts', () => {
    expect(emailFingerprint('jo@example.com', email)).toMatch(/^[a-f0-9]{64}$/);
  });

  it('changes when the recipient, subject, text or HTML changes', () => {
    const base = emailFingerprint('jo@example.com', email);
    expect(emailFingerprint('al@example.com', email)).not.toBe(base);
    expect(emailFingerprint('jo@example.com', { ...email, subject: 'Other' })).not.toBe(base);
    expect(emailFingerprint('jo@example.com', { ...email, text: 'Keep working!' })).not.toBe(base);
    expect(emailFingerprint('jo@example.com', { ...email, html: '<p>Keep working!</p>' })).not.toBe(base);
  });

  it('cannot be fooled by moving text from one part to the next', () => {
    const a = emailFingerprint('jo@example.com', { subject: 'ab', text: 'c', html: '' });
    const b = emailFingerprint('jo@example.com', { subject: 'a', text: 'bc', html: '' });
    expect(a).not.toBe(b);
  });
});
