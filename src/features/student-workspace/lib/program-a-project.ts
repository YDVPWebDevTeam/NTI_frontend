import { t } from '@lingui/core/macro';

import type { ApplicationDetailDto, ApplicationSectionDto } from 'lib/api';

import { formatEnumLikeName, normalizeUnknownText } from 'lib/student-dashboard/normalizers';

export const PROGRAM_A_PROJECT_STATUSES = new Set<string>([
  'ONBOARDING',
  'ACTIVE_PROJECT',
  'PAUSED',
  'COMPLETED',
  'ARCHIVED',
]);

export function isProgramAProjectStatus(status: string | null | undefined) {
  return Boolean(status && PROGRAM_A_PROJECT_STATUSES.has(status));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getPersonLabel(value: unknown): string | null {
  if (!isRecord(value)) {
    return null;
  }

  const firstName = normalizeUnknownText(value.firstName);
  const lastName = normalizeUnknownText(value.lastName);
  const fullName =
    normalizeUnknownText(value.fullName) ??
    normalizeUnknownText(value.name) ??
    [firstName, lastName].filter(Boolean).join(' ').trim();

  const email = normalizeUnknownText(value.email);

  if (fullName && email) {
    return `${fullName} (${email})`;
  }

  return fullName || email;
}

export function getApplicationMentorName(application: ApplicationDetailDto) {
  const record = application as unknown as Record<string, unknown>;

  const mentorCandidates = [
    record.mentor,
    record.assignedMentor,
    record.mentorUser,
    isRecord(record.mentorAssignment) ? record.mentorAssignment.mentor : null,
  ];

  for (const candidate of mentorCandidates) {
    const label = getPersonLabel(candidate);

    if (label) {
      return label;
    }
  }

  return (
    normalizeUnknownText(record.mentorName) ??
    normalizeUnknownText(record.mentorEmail) ??
    t`Not assigned yet`
  );
}

export function getApplicationSectionEntries(section: ApplicationSectionDto) {
  const valueJson = section.valueJson as unknown;

  const value = isRecord(valueJson) ? valueJson : { value: valueJson };

  return Object.entries(value)
    .map(([key, rawValue]) => {
      const text = normalizeUnknownText(rawValue);

      if (!text?.trim()) {
        return null;
      }

      return {
        label: formatEnumLikeName(key),
        value: text,
      };
    })
    .filter((entry): entry is { label: string; value: string } => Boolean(entry));
}
