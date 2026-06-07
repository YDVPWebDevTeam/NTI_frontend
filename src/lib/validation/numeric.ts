/**
 * Shared numeric-input helpers for forms that accept scores, budgets, rewards, etc.
 *
 * HTML `min`/`max` attributes are advisory only — they do not prevent a user from
 * typing out-of-range values or submitting them. Use these helpers to parse and
 * validate before sending values to the backend.
 */

/**
 * Parse a raw input string into a finite number.
 * Returns `null` for empty input or anything that is not a finite number
 * (e.g. `NaN`, `Infinity`).
 */
export function parseNumericInput(raw: string): number | null {
  const trimmed = raw.trim();

  if (trimmed === '') {
    return null;
  }

  const value = Number(trimmed);

  return Number.isFinite(value) ? value : null;
}

/** Clamp a value into the inclusive [min, max] range. */
export function clampNumber(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  }

  if (value > max) {
    return max;
  }

  return value;
}

/** True when `value` is a finite number within the inclusive [min, max] range. */
export function isWithinRange(value: number, min: number, max: number): boolean {
  return Number.isFinite(value) && value >= min && value <= max;
}
