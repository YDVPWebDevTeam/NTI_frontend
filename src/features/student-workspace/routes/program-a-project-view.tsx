'use client';

import { t } from '@lingui/core/macro';
import type { ReactNode } from 'react';

import type {
  ApplicationDetailDto,
  ApplicationSectionDto,
  ProgramAMentorshipNoteDto,
} from 'lib/api';
import { extractApiErrorMessage, isApiRequestError } from 'lib/api-client/openapi-runtime/client';

import { Button } from 'components/shadcn';

import {
  StudentKeyValueList,
  StudentPageShell,
  StudentSectionCard,
} from 'components/student-dashboard/page-shell-primitives';

import { ProgramAStatusBadge } from 'features/admin-program-a/components/program-a-status-badge';
import { ProjectConversations } from 'features/conversations/project-conversations';

import {
  formatEnumLikeName,
  formatPersonName,
  formatUnknownDate,
} from 'lib/student-dashboard/normalizers';
import { useAuthenticatedUser } from 'lib/student-dashboard/use-authenticated-user';

import {
  getApplicationMentorName,
  getApplicationSectionEntries,
} from 'features/student-workspace/lib/program-a-project';

type QueryLike<TData> = {
  data?: TData;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  refetch: () => Promise<unknown>;
};

type ProgramAProjectViewProps = {
  application: ApplicationDetailDto;
  mentorshipNotesQuery: QueryLike<ProgramAMentorshipNoteDto[]>;
  sectionsQuery: QueryLike<ApplicationSectionDto[]>;
  getErrorMessage: (error: unknown, fallbackMessage: string) => string;
};

function isMentorshipNotesUnavailableError(error: unknown) {
  if (!isApiRequestError(error)) {
    return false;
  }

  const message = extractApiErrorMessage(error).toLowerCase();

  return (
    message.includes('no assigned mentor') ||
    message.includes('only the assigned mentor or an administrator can access mentorship notes')
  );
}

function ProgramAProjectStatusSection({ application }: { application: ApplicationDetailDto }) {
  return (
    <StudentSectionCard
      title={t`Project status`}
      description={t`Current lifecycle state and mentor assignment.`}
    >
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <ProgramAStatusBadge status={application.status} />

        <span className="text-muted-foreground text-sm font-medium">
          {formatEnumLikeName(application.status)}
        </span>
      </div>

      <StudentKeyValueList
        items={[
          {
            label: t`Assigned mentor`,
            value: getApplicationMentorName(application),
          },
          {
            label: t`Application submitted`,
            value: application.submittedAt
              ? formatUnknownDate(application.submittedAt)
              : t`Not submitted`,
          },
          {
            label: t`Last updated`,
            value: formatUnknownDate(application.updatedAt),
          },
        ]}
      />
    </StudentSectionCard>
  );
}

function ProgramAMentorshipNotesSection({
  notesQuery,
  getErrorMessage,
}: {
  notesQuery: QueryLike<ProgramAMentorshipNoteDto[]>;
  getErrorMessage: (error: unknown, fallbackMessage: string) => string;
}) {
  const notes = [...(notesQuery.data ?? [])].sort(
    (firstNote, secondNote) =>
      new Date(firstNote.createdAt).getTime() - new Date(secondNote.createdAt).getTime(),
  );
  let content: ReactNode;

  if (notesQuery.isLoading) {
    content = (
      <p className="text-muted-foreground text-sm leading-7">{t`Loading mentorship notes...`}</p>
    );
  } else if (isMentorshipNotesUnavailableError(notesQuery.error)) {
    content = (
      <p className="text-muted-foreground text-sm leading-7">
        {t`Mentorship notes are not available yet.`}
      </p>
    );
  } else if (notesQuery.isError) {
    content = (
      <div className="space-y-3">
        <p className="text-destructive text-sm">
          {getErrorMessage(notesQuery.error, t`Mentorship notes could not be loaded.`)}
        </p>

        <Button size="sm" variant="outline" onClick={() => void notesQuery.refetch()}>
          {t`Retry`}
        </Button>
      </div>
    );
  } else if (notes.length) {
    content = (
      <div className="space-y-3">
        {notes.map((note) => {
          const authorName = formatPersonName(note.author) || note.author.email || t`Mentor`;

          return (
            <article key={note.id} className="border-border bg-muted rounded-2xl border p-4">
              <p className="text-foreground text-sm leading-7 whitespace-pre-wrap">
                {note.content}
              </p>

              <p className="text-muted-foreground mt-3 text-xs">
                {authorName} · {formatUnknownDate(note.createdAt)}
              </p>
            </article>
          );
        })}
      </div>
    );
  } else {
    content = (
      <p className="text-muted-foreground text-sm leading-7">
        {t`No mentorship notes have been added yet.`}
      </p>
    );
  }

  return (
    <StudentSectionCard
      title={t`Mentorship notes`}
      description={t`Read-only notes shared by your mentor.`}
    >
      {content}
    </StudentSectionCard>
  );
}

function ProgramAApplicationSectionsSummary({
  sectionsQuery,
  getErrorMessage,
}: {
  sectionsQuery: QueryLike<ApplicationSectionDto[]>;
  getErrorMessage: (error: unknown, fallbackMessage: string) => string;
}) {
  const sections = sectionsQuery.data ?? [];
  let content: ReactNode;

  if (sectionsQuery.isLoading) {
    content = (
      <p className="text-muted-foreground text-sm leading-7">{t`Loading application sections...`}</p>
    );
  } else if (sectionsQuery.isError) {
    content = (
      <div className="space-y-3">
        <p className="text-destructive text-sm">
          {getErrorMessage(sectionsQuery.error, t`Application sections could not be loaded.`)}
        </p>

        <Button size="sm" variant="outline" onClick={() => void sectionsQuery.refetch()}>
          {t`Retry`}
        </Button>
      </div>
    );
  } else if (sections.length) {
    content = (
      <div className="space-y-4">
        {sections.map((section) => {
          const entries = getApplicationSectionEntries(section);

          return (
            <article
              key={`${section.id}-${section.version}`}
              className="border-border bg-muted rounded-2xl border p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-foreground font-semibold">{formatEnumLikeName(section.key)}</h3>

                <span className="bg-card text-muted-foreground rounded-full px-3 py-1 text-xs font-semibold">
                  {t`Version`} {section.version}
                </span>
              </div>

              {entries.length ? (
                <dl className="mt-4 space-y-3">
                  {entries.map((entry) => (
                    <div key={entry.label}>
                      <dt className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
                        {entry.label}
                      </dt>

                      <dd className="text-foreground mt-1 text-sm leading-7 whitespace-pre-wrap">
                        {entry.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-muted-foreground mt-3 text-sm leading-7">
                  {t`No section content provided.`}
                </p>
              )}
            </article>
          );
        })}
      </div>
    );
  } else {
    content = (
      <p className="text-muted-foreground text-sm leading-7">{t`No application sections found.`}</p>
    );
  }

  return (
    <StudentSectionCard
      title={t`Application sections`}
      description={t`Submitted application content is shown read-only in project mode.`}
    >
      {content}
    </StudentSectionCard>
  );
}

export function ProgramAProjectView({
  application,
  mentorshipNotesQuery,
  sectionsQuery,
  getErrorMessage,
}: ProgramAProjectViewProps) {
  const { me } = useAuthenticatedUser();

  return (
    <StudentPageShell
      title={t`Program A project`}
      description={t`Track your approved application as a project with lifecycle status, mentor information, notes, and submitted sections.`}
    >
      <div className="space-y-6">
        <ProgramAProjectStatusSection application={application} />

        <div className="grid gap-6 lg:grid-cols-2">
          <ProgramAMentorshipNotesSection
            notesQuery={mentorshipNotesQuery}
            getErrorMessage={getErrorMessage}
          />

          <ProgramAApplicationSectionsSummary
            sectionsQuery={sectionsQuery}
            getErrorMessage={getErrorMessage}
          />
        </div>

        <StudentSectionCard title={t`Messages with your mentor`}>
          <ProjectConversations
            anchor={{ kind: 'program-a', applicationId: application.id }}
            currentUserId={me?.id}
            role={me?.role}
            canWrite={application.status !== 'ARCHIVED'}
          />
        </StudentSectionCard>
      </div>
    </StudentPageShell>
  );
}
