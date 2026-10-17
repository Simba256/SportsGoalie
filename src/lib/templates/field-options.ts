/**
 * Turns the admin's comma-separated options text into the options list.
 *
 * The builder used to commit the list only when the box lost focus. Anything that
 * saved without a blur left `options` empty while the box still showed the words,
 * and the validator answered "Radio and checkbox fields require options" (reported
 * 11 Sept). The list is now derived on every keystroke, so what the admin can see
 * is what gets saved.
 */
export function parseOptions(raw: string): string[] {
  return raw
    .split(',')
    .map((option) => option.trim())
    .filter((option) => option.length > 0);
}
