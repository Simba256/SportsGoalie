import { describe, it, expect } from 'vitest';

import {
  applicantFirstName,
  buildApplicationApproved,
  buildApplicationDeclined,
  buildApplicationReceived,
  buildApplicationWaitlisted,
  MissingBookingLinkError,
  type ApplicationEmail,
} from '@/lib/emails/application-emails';
import {
  EMAIL_APPROVED,
  EMAIL_DECLINED,
  EMAIL_RECEIVED,
  EMAIL_SIGNATURE,
  EMAIL_WAITLISTED,
} from '@/data/applicant-flow-copy';

/**
 * The four applicant emails (copy pack 3.3–3.6). What matters here is that
 * Michael's words arrive intact and in order, that nothing is added around
 * them, and that the approval email cannot exist without its booking link.
 */

const LINK = 'https://cal.com/michael/intro-call';

const paragraphs = (email: ApplicationEmail) => email.text.split('\n\n');
const signature = `${EMAIL_SIGNATURE.name}\n${EMAIL_SIGNATURE.line}`;

describe('applicantFirstName', () => {
  it('takes the first word of the name they gave', () => {
    expect(applicantFirstName('Jordan Binnington')).toBe('Jordan');
    expect(applicantFirstName('  Carey   Price ')).toBe('Carey');
  });

  it('gives nothing for a missing, empty or non-string name', () => {
    expect(applicantFirstName(undefined)).toBeUndefined();
    expect(applicantFirstName(null)).toBeUndefined();
    expect(applicantFirstName('')).toBeUndefined();
    expect(applicantFirstName('   ')).toBeUndefined();
    expect(applicantFirstName(42)).toBeUndefined();
  });

  it('never greets anyone by their email address', () => {
    expect(applicantFirstName('jo@example.com')).toBeUndefined();
  });
});

describe('3.3 application received', () => {
  it('is the greeting, his paragraphs and his signature, in that order and nothing else', () => {
    const email = buildApplicationReceived('Jordan');
    expect(email.subject).toBe(EMAIL_RECEIVED.subject);
    expect(email.text).toBe(['Jordan —', ...EMAIL_RECEIVED.body, signature].join('\n\n'));
  });

  it('leaves the greeting out rather than inventing one when there is no first name', () => {
    const email = buildApplicationReceived(undefined);
    expect(paragraphs(email)[0]).toBe(EMAIL_RECEIVED.body[0]);
    expect(email.text).not.toContain(' —\n');
  });
});

describe('3.4 approved', () => {
  it('carries the booking link on its own line, between his two halves', () => {
    const email = buildApplicationApproved('Jordan', LINK);
    expect(email.subject).toBe(EMAIL_APPROVED.subject);
    expect(email.text).toBe(
      [
        'Jordan —',
        ...EMAIL_APPROVED.beforeLink,
        `${EMAIL_APPROVED.linkLead} ${LINK}`,
        ...EMAIL_APPROVED.afterLink,
        signature,
      ].join('\n\n')
    );
    expect(email.html).toContain(`href="${LINK}"`);
  });

  it('refuses to build without a usable link (H-26)', () => {
    expect(() => buildApplicationApproved('Jordan', '')).toThrow(MissingBookingLinkError);
    expect(() => buildApplicationApproved('Jordan', '   ')).toThrow(MissingBookingLinkError);
    expect(() => buildApplicationApproved('Jordan', 'not a link')).toThrow(MissingBookingLinkError);
    expect(() => buildApplicationApproved('Jordan', 'javascript:alert(1)')).toThrow(MissingBookingLinkError);
  });

  it('describes a phone call and never a video one', () => {
    const email = buildApplicationApproved('Jordan', LINK);
    expect(email.text).toMatch(/on the phone/);
    expect(email.text.toLowerCase()).not.toMatch(/video|zoom|meet\.google|teams/);
  });

  it('escapes the link in the HTML', () => {
    const email = buildApplicationApproved('Jordan', 'https://example.com/book?a=1&b="2"');
    expect(email.html).toContain('href="https://example.com/book?a=1&amp;b=&quot;2&quot;"');
  });
});

describe('3.5 waiting list', () => {
  it('goes without the coach line while Michael has not set one', () => {
    const email = buildApplicationWaitlisted('Jordan');
    expect(email.subject).toBe(EMAIL_WAITLISTED.subject);
    expect(email.text).toBe(
      ['Jordan —', ...EMAIL_WAITLISTED.beforeCoachLine, ...EMAIL_WAITLISTED.afterCoachLine, signature].join('\n\n')
    );
    expect(email.text).not.toContain('COACH TO SET');
  });

  it('puts his line between the two parts', () => {
    const email = buildApplicationWaitlisted('Jordan', 'You get the weekly chart review in the meantime.');
    expect(paragraphs(email)).toEqual([
      'Jordan —',
      ...EMAIL_WAITLISTED.beforeCoachLine,
      'You get the weekly chart review in the meantime.',
      ...EMAIL_WAITLISTED.afterCoachLine,
      EMAIL_SIGNATURE.name + '\n' + EMAIL_SIGNATURE.line,
    ]);
  });

  it('keeps his paragraph breaks, and escapes what he typed in the HTML', () => {
    const email = buildApplicationWaitlisted(undefined, 'First part.\r\n\r\nSecond <part>\nsame paragraph.');
    expect(email.text).toContain('First part.\n\nSecond <part>\nsame paragraph.');
    expect(email.html).toContain('Second &lt;part&gt;<br>same paragraph.');
    expect(email.html).not.toContain('<part>');
  });

  it('treats a line of only whitespace as unset', () => {
    expect(buildApplicationWaitlisted('Jordan', '   \n  ').text).toBe(buildApplicationWaitlisted('Jordan').text);
  });
});

describe('3.6 not this time', () => {
  it('is his words and his signature', () => {
    const email = buildApplicationDeclined('Jordan');
    expect(email.subject).toBe(EMAIL_DECLINED.subject);
    expect(email.text).toBe(['Jordan —', ...EMAIL_DECLINED.body, signature].join('\n\n'));
  });
});

describe('every applicant email', () => {
  const all = [
    buildApplicationReceived('Jordan'),
    buildApplicationApproved('Jordan', LINK),
    buildApplicationWaitlisted('Jordan', 'A line.'),
    buildApplicationDeclined('Jordan'),
  ];

  it('never says "platform" to a goalie', () => {
    for (const email of all) {
      expect(`${email.subject}\n${email.text}`.toLowerCase()).not.toContain('platform');
    }
  });

  it('ends with his signature', () => {
    for (const email of all) {
      expect(email.text.endsWith(signature)).toBe(true);
      expect(email.html).toContain(EMAIL_SIGNATURE.line);
    }
  });

  it('escapes the greeting name in the HTML', () => {
    const email = buildApplicationReceived('<b>Jo</b>');
    expect(email.html).toContain('&lt;b&gt;Jo&lt;/b&gt; —');
    expect(email.html).not.toContain('<b>Jo</b>');
  });
});
