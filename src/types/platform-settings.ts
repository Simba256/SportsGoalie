/**
 * Platform settings — the values behind the admin System Settings screen.
 *
 * One document, `app_settings/platform`. The shape lives here rather than in the
 * page so the screen and the service that persists it can never drift apart, and
 * so the defaults below are the single answer to "what does a fresh install look
 * like" — the initial state, the Reset button, and the fallback for any field a
 * stored document happens to be missing all read from this one object.
 *
 * Separate from `AppSettings` in `./index`, which is the seeder's older shape and
 * is written with generated ids. Nothing reads both.
 */

export interface PlatformSettings {
  general: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    supportEmail: string;
    defaultLanguage: string;
    defaultTimezone: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    /**
     * Where an approved applicant books their call — a Cal.com (or equivalent)
     * page the coach owns. Required before anyone can be approved (H-26): with
     * it empty, the approval email refuses to build and the admin screen says
     * why, rather than sending an approval that leaves the goalie no way to
     * reach Michael.
     */
    bookingUrl: string;
    /**
     * Copy pack 3.5's [COACH TO SET] line — what someone on the waiting list
     * gets in the meantime. Michael's words, set by him here. Empty is valid:
     * the waiting-list email then goes without that paragraph rather than with
     * a placeholder.
     */
    waitlistLine: string;
  };
  content: {
    autoApproval: boolean;
    maxQuizQuestions: number;
    maxFileSize: number;
    allowedFileTypes: string[];
    contentRetentionDays: number;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    requireEmailVerification: boolean;
    enforceStrongPasswords: boolean;
    enableTwoFactor: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    adminAlerts: boolean;
    userRegistrationAlert: boolean;
    contentModerationAlert: boolean;
    systemHealthAlert: boolean;
  };
  performance: {
    cacheDuration: number;
    rateLimitRequests: number;
    rateLimitWindow: number;
    enableCompression: boolean;
    enableCDN: boolean;
  };
}

export type PlatformSettingsSection = keyof PlatformSettings;

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  general: {
    siteName: 'SmarterGoalie',
    siteDescription: 'A modern sports learning platform',
    contactEmail: 'contact@sportscoach.com',
    supportEmail: 'support@sportscoach.com',
    defaultLanguage: 'en',
    defaultTimezone: 'UTC',
    maintenanceMode: false,
    registrationEnabled: true,
    bookingUrl: '',
    waitlistLine: '',
  },
  content: {
    autoApproval: false,
    maxQuizQuestions: 50,
    maxFileSize: 10,
    allowedFileTypes: ['jpg', 'png', 'pdf', 'mp4'],
    contentRetentionDays: 365,
  },
  security: {
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    requireEmailVerification: true,
    enforceStrongPasswords: true,
    enableTwoFactor: false,
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: false,
    adminAlerts: true,
    userRegistrationAlert: true,
    contentModerationAlert: true,
    systemHealthAlert: true,
  },
  performance: {
    cacheDuration: 300,
    rateLimitRequests: 100,
    rateLimitWindow: 900,
    enableCompression: true,
    enableCDN: false,
  },
};

/**
 * Allowed ranges for the numeric fields, matching the min/max on the inputs.
 * Kept here so the clamp applied before writing and the clamp applied after
 * reading are the same numbers as the ones the form advertises.
 */
export const PLATFORM_SETTING_RANGES = {
  content: {
    maxQuizQuestions: { min: 1, max: 100 },
    maxFileSize: { min: 1, max: 100 },
    contentRetentionDays: { min: 30, max: 3650 },
  },
  security: {
    sessionTimeout: { min: 1, max: 168 },
    maxLoginAttempts: { min: 3, max: 10 },
  },
  performance: {
    cacheDuration: { min: 60, max: 3600 },
    rateLimitRequests: { min: 10, max: 1000 },
    rateLimitWindow: { min: 60, max: 3600 },
  },
} as const;

/** Longest booking link accepted. Over this is rejected, never truncated. */
export const MAX_BOOKING_URL_LENGTH = 500;

/**
 * The one definition of a usable booking link, shared by the settings form, the
 * service that stores it and the route that puts it in an email — so a link that
 * passes in one place cannot fail in another.
 *
 * Only http(s): this URL ends up as an anchor in an email, so `javascript:` and
 * `data:` must never survive. Empty is unusable for the email — approval is
 * refused without a link — but it is still a valid thing to save: it is the
 * honest "no booking page yet" state.
 */
export function isUsableBookingUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_BOOKING_URL_LENGTH) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Empty for anything that would not be safe to link. */
export function normalizeBookingUrl(value: unknown): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return isUsableBookingUrl(trimmed) ? trimmed : '';
}

/**
 * Longest waiting-list line accepted. The settings box stops typing at this
 * length, so the cut below only ever applies to a hand-edited document.
 */
export const MAX_WAITLIST_LINE_LENGTH = 1000;

/**
 * The waiting-list line as it is stored and emailed: trimmed, Windows line
 * endings made plain, and never longer than the box allows. Line breaks inside
 * it are kept — a blank line in the box is a paragraph break in the email.
 */
export function normalizeWaitlistLine(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.replace(/\r\n?/g, '\n').trim().slice(0, MAX_WAITLIST_LINE_LENGTH).trim();
}

/** The options the two dropdowns offer. A stored value outside these would render blank. */
export const PLATFORM_LANGUAGES = ['en', 'es', 'fr', 'de'] as const;
export const PLATFORM_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Europe/London',
] as const;
