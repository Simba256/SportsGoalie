/**
 * Coach Code Generator
 *
 * Generates unique coach codes in format: LASTNAME-XXXX
 * - Uppercase last name prefix
 * - 4-character alphanumeric suffix
 * - Uses crypto-random values for security
 * - Excludes confusing characters: 0, O, 1, I, l
 */

const ALLOWED_CHARS = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const SUFFIX_LENGTH = 4;

/**
 * Extract last name from a full name string
 * @param displayName - Full name (e.g., "John Smith")
 * @returns Uppercase last name, or "COACH" if no last name found
 */
export function extractLastName(displayName: string): string {
  if (!displayName || typeof displayName !== 'string') {
    return 'COACH';
  }

  const parts = displayName.trim().split(/\s+/);

  if (parts.length < 2) {
    // Single name or empty - use the first name or default
    const name = parts[0]?.toUpperCase() || 'COACH';
    // Only allow alphanumeric characters
    return name.replace(/[^A-Z]/g, '') || 'COACH';
  }

  // Get the last part of the name
  const lastName = parts[parts.length - 1].toUpperCase();
  // Only allow alphanumeric characters
  return lastName.replace(/[^A-Z]/g, '') || 'COACH';
}

/**
 * Get a cryptographically secure random integer between min (inclusive) and max (exclusive)
 */
function getSecureRandomInt(min: number, max: number): number {
  const range = max - min;
  const randomBuffer = new Uint32Array(1);

  if (typeof window !== 'undefined' && window.crypto) {
    // Browser environment
    window.crypto.getRandomValues(randomBuffer);
  } else if (typeof global !== 'undefined' && global.crypto) {
    // Node.js environment (Next.js server-side)
    global.crypto.getRandomValues(randomBuffer);
  } else {
    // Fallback (should not happen in modern environments)
    throw new Error('Crypto API not available');
  }

  return min + (randomBuffer[0] % range);
}

/**
 * Generate a random 4-character suffix
 */
function generateSuffix(): string {
  let suffix = '';

  for (let i = 0; i < SUFFIX_LENGTH; i++) {
    const randomIndex = getSecureRandomInt(0, ALLOWED_CHARS.length);
    suffix += ALLOWED_CHARS[randomIndex];
  }

  return suffix;
}

/**
 * Generate a coach code from a last name
 * @param lastName - Coach's last name (or full display name)
 * @returns Coach code in format LASTNAME-XXXX
 *
 * @example
 * ```typescript
 * generateCoachCode('Smith'); // "SMITH-7K3M"
 * generateCoachCode('John Smith'); // "SMITH-P2X4"
 * generateCoachCode(''); // "COACH-K9M2"
 * ```
 */
export function generateCoachCode(lastName: string): string {
  const prefix = extractLastName(lastName);
  const suffix = generateSuffix();

  return `${prefix}-${suffix}`;
}

/**
 * Validate coach code format
 * @param code - Coach code to validate
 * @returns true if valid format (UPPERCASE-XXXX), false otherwise
 *
 * @example
 * ```typescript
 * isValidCoachCodeFormat('SMITH-7K3M'); // true
 * isValidCoachCodeFormat('SMITH-abc');  // false (lowercase)
 * isValidCoachCodeFormat('smith-7K3M'); // false (lowercase prefix)
 * isValidCoachCodeFormat('7K3M');       // false (missing prefix)
 * ```
 */
export function isValidCoachCodeFormat(code: string): boolean {
  if (!code || typeof code !== 'string') {
    return false;
  }

  // Pattern: One or more uppercase letters, followed by hyphen, followed by exactly 4 allowed characters
  const pattern = new RegExp(`^[A-Z]+-[${ALLOWED_CHARS}]{${SUFFIX_LENGTH}}$`);
  return pattern.test(code);
}

/**
 * Normalize a coach code for comparison
 * Converts to uppercase and trims whitespace
 *
 * @param code - Coach code to normalize
 * @returns Normalized coach code
 */
export function normalizeCoachCode(code: string): string {
  if (!code || typeof code !== 'string') {
    return '';
  }

  return code.trim().toUpperCase();
}
