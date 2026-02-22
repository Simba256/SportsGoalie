/**
 * Student ID Generator
 *
 * Generates random, unique student IDs in format: SG-XXXX-XXXX
 * - SG prefix (SportsGoalie)
 * - 8 characters total (excluding hyphens)
 * - Uses crypto-random values for security
 * - Excludes confusing characters: 0, O, 1, I, l
 */

const ALLOWED_CHARS = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const ID_PREFIX = 'SG';
const SEGMENT_LENGTH = 4;
const NUM_SEGMENTS = 2;

/**
 * Generate a random student ID
 * @returns Student ID in format SG-XXXX-XXXX
 *
 * @example
 * ```typescript
 * const id = generateStudentId(); // "SG-K7M9-P2X4"
 * ```
 */
export function generateStudentId(): string {
  const segments: string[] = [];

  for (let i = 0; i < NUM_SEGMENTS; i++) {
    let segment = '';

    for (let j = 0; j < SEGMENT_LENGTH; j++) {
      // Use crypto.getRandomValues for secure random generation
      const randomIndex = getSecureRandomInt(0, ALLOWED_CHARS.length);
      segment += ALLOWED_CHARS[randomIndex];
    }

    segments.push(segment);
  }

  return `${ID_PREFIX}-${segments.join('-')}`;
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
 * Validate student ID format
 * @param id - Student ID to validate
 * @returns true if valid format, false otherwise
 *
 * @example
 * ```typescript
 * isValidStudentId('SG-K7M9-P2X4'); // true
 * isValidStudentId('SG-123-456');   // false (contains invalid chars)
 * isValidStudentId('K7M9-P2X4');    // false (missing prefix)
 * ```
 */
export function isValidStudentId(id: string): boolean {
  const pattern = new RegExp(`^${ID_PREFIX}-[${ALLOWED_CHARS}]{${SEGMENT_LENGTH}}-[${ALLOWED_CHARS}]{${SEGMENT_LENGTH}}$`);
  return pattern.test(id);
}

/**
 * Format a student ID for display (adds spaces for readability)
 * @param id - Student ID
 * @returns Formatted ID
 *
 * @example
 * ```typescript
 * formatStudentId('SG-K7M9-P2X4'); // "SG - K7M9 - P2X4"
 * ```
 */
export function formatStudentIdForDisplay(id: string): string {
  if (!isValidStudentId(id)) {
    return id; // Return as-is if invalid
  }

  return id.replace(/-/g, ' - ');
}

/**
 * Generate multiple unique student IDs
 * Note: This doesn't check database uniqueness, only ensures generated IDs are unique within the batch
 *
 * @param count - Number of IDs to generate
 * @returns Array of unique student IDs
 */
export function generateBatchStudentIds(count: number): string[] {
  const ids = new Set<string>();

  while (ids.size < count) {
    ids.add(generateStudentId());
  }

  return Array.from(ids);
}
