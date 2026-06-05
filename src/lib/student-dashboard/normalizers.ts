import { t } from '@lingui/core/macro';

import { formatDateTime } from 'lib/date';
import { isApiRequestError } from 'lib/api-client/openapi-runtime/client';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function normalizeUnknownText(value: unknown): string | null {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeUnknownText(item))
      .filter(Boolean)
      .join(', ');
  }

  if (isRecord(value)) {
    const directValue = value.value;

    if (typeof directValue === 'string' && directValue.trim().length > 0) {
      return directValue;
    }

    try {
      return JSON.stringify(value);
    } catch {
      return null;
    }
  }

  return null;
}

export function normalizeUnknownDate(value: unknown): string | null {
  if (typeof value === 'string') {
    return value;
  }

  if (isRecord(value)) {
    const candidates = [value.iso, value.date, value.value, value.timestamp];

    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim().length > 0) {
        return candidate;
      }
    }
  }

  return null;
}

export function formatUnknownDate(value: unknown, locale?: string): string {
  const normalizedDate = normalizeUnknownDate(value);

  if (!normalizedDate) {
    return t`Not available`;
  }

  try {
    return formatDateTime(normalizedDate, locale);
  } catch {
    return normalizedDate;
  }
}

const ENUM_LABEL_ACRONYMS = new Set(['AI', 'CV', 'ID', 'NTI', 'QA', 'UI', 'UX']);

const ENUM_LABEL_LOWERCASE_WORDS = new Set(['AND', 'BY', 'FOR', 'OF', 'OR', 'TO']);

export function formatEnumLikeName(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  return value
    .split('_')
    .filter(Boolean)
    .map((part, index) => {
      if (ENUM_LABEL_ACRONYMS.has(part)) {
        return part;
      }

      if (index > 0 && ENUM_LABEL_LOWERCASE_WORDS.has(part)) {
        return part.toLowerCase();
      }

      const normalizedPart = part.toLowerCase();

      return `${normalizedPart.charAt(0).toUpperCase()}${normalizedPart.slice(1)}`;
    })
    .join(' ');
}

export function isApiNotFoundError(error: unknown): boolean {
  return isApiRequestError(error) && error.status === 404;
}

export function formatPersonName(
  person: { firstName: string; lastName: string } | null | undefined,
): string | null {
  if (!person) {
    return null;
  }

  return `${person.firstName} ${person.lastName}`.trim();
}
