'use client';

import { t } from '@lingui/core/macro';
import Link from 'next/link';
import type { ReactNode } from 'react';

import type {
  ApplicationsControllerListActivePublicCallsQueryResult,
  GetMyStudentProfileResponseDto,
  ProgramBBacklogControllerListPublishedQueryResult,
  ProgramBProjectsControllerListMyQueryResult,
  TeamDetailDto,
  useApplicationsControllerCreateDraft,
  StudentApplicationSummaryDto,
} from 'lib/api';
import { Button } from 'components/shadcn';
import {
  StudentKeyValueList,
  StudentPageShell,
  StudentSectionCard,
} from 'components/student-dashboard/page-shell-primitives';
import { ROUTES } from 'lib/constants';
import type { DraftRegistryEntry } from 'lib/student-dashboard/draft-registry';
import { ProgramAStatusBadge } from 'features/admin-program-a/components/program-a-status-badge';
import { formatUnknownDate, normalizeUnknownText } from 'lib/student-dashboard/normalizers';

export function FoundationSection({
  profile,
  teamAccessLabel,
  teamLockLabel,
}: {
  profile: GetMyStudentProfileResponseDto | undefined;
  teamAccessLabel: string;
  teamLockLabel: string | null;
}) {
  return (
    <StudentSectionCard
      title={t`Foundation`}
      description={t`Everything that affects access across the rest of the student area.`}
    >
      <div className="space-y-5">
        <StudentKeyValueList
          items={[
            {
              label: t`Profile status`,
              value: profile?.completion.profileCompleted ? t`Complete` : t`Incomplete`,
            },
            {
              label: t`Academic section`,
              value: profile?.completion.academicInformationCompleted
                ? t`Complete`
                : t`Needs attention`,
            },
            {
              label: t`Skills section`,
              value: profile?.completion.professionalSkillsCompleted
                ? t`Complete`
                : t`Needs attention`,
            },
            { label: t`Team access`, value: teamAccessLabel },
            ...(teamLockLabel ? [{ label: t`Team lock`, value: teamLockLabel }] : []),
          ]}
        />
        <div className="flex flex-wrap gap-3">
          <Button asChild size="sm" variant="outline">
            <Link href={ROUTES.STUDENT.PROFILE}>{t`Open profile`}</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={ROUTES.STUDENT.TEAM}>{t`Open team`}</Link>
          </Button>
        </div>
      </div>
    </StudentSectionCard>
  );
}

export function NextStepsSection() {
  return (
    <StudentSectionCard
      title={t`Next steps`}
      description={t`The fastest actions to keep the workflow moving.`}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="border-border bg-muted rounded-2xl border p-5">
          <p className="text-foreground text-sm font-semibold">{t`Complete foundation setup`}</p>
          <p className="text-muted-foreground mt-2 text-sm leading-7">
            {t`Finish profile details and keep team membership current so application actions stay available.`}
          </p>
          <div className="mt-4">
            <Button asChild size="sm">
              <Link href={ROUTES.STUDENT.PROFILE}>{t`Review setup`}</Link>
            </Button>
          </div>
        </div>
        <div className="border-border bg-muted rounded-2xl border p-5">
          <p className="text-foreground text-sm font-semibold">{t`Move into program work`}</p>
          <p className="text-muted-foreground mt-2 text-sm leading-7">
            {t`Program A is for draft and submission flow. Program B is for opportunity pairing and project delivery.`}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={ROUTES.STUDENT.PROGRAM_B_BACKLOG}>{t`Program B backlog`}</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={ROUTES.STUDENT.TEAM}>{t`Team readiness`}</Link>
            </Button>
          </div>
        </div>
      </div>
    </StudentSectionCard>
  );
}

export function ProgramASection({
  activeCalls,
  createDraft,
  draftEntries,
  draftRegistryMap,
  handleCreateDraft,
  isLead,
  isLocked,
  team,
  projectApplications,
}: {
  activeCalls: ApplicationsControllerListActivePublicCallsQueryResult['data'];
  createDraft: ReturnType<typeof useApplicationsControllerCreateDraft>;
  draftEntries: DraftRegistryEntry[];
  draftRegistryMap: Map<string, DraftRegistryEntry>;
  handleCreateDraft: (callId: string) => Promise<void>;
  isLead: boolean;
  isLocked: boolean;
  team: TeamDetailDto | null;
  projectApplications: StudentApplicationSummaryDto[];
}) {
  return (
    <StudentSectionCard
      title={t`Program A flow`}
      description={t`Open calls, draft recovery, and application-start actions live here.`}
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-muted-foreground mb-3 text-sm font-semibold tracking-[0.16em] uppercase">
            {t`Active projects`}
          </h3>

          <div className="space-y-3">
            {projectApplications.map((application) => (
              <div key={application.id} className="border-border bg-muted rounded-2xl border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-foreground font-semibold">{application.call.title}</p>

                    <p className="text-muted-foreground mt-1 text-sm">
                      {t`Updated`} {formatUnknownDate(application.updatedAt)}
                    </p>
                  </div>

                  <ProgramAStatusBadge status={application.status} />
                </div>

                <div className="mt-3">
                  <Button asChild size="sm" variant="outline">
                    <Link href={ROUTES.STUDENT.studentApplication(application.id)}>
                      {t`Open project`}
                    </Link>
                  </Button>
                </div>
              </div>
            ))}

            {projectApplications.length ? null : (
              <p className="text-muted-foreground text-sm leading-7">
                {t`Approved Program A projects will appear here once onboarding starts.`}
              </p>
            )}
          </div>
        </div>
        <div>
          <h3 className="text-muted-foreground mb-1 text-sm font-semibold tracking-[0.16em] uppercase">
            {t`Open calls`}
          </h3>
          <p className="text-muted-foreground mb-3 text-sm leading-7">
            {t`Application rounds you can apply to. Start a draft to submit your team's own idea while a round is open — these are not projects you own yet.`}
          </p>
          <div className="space-y-4">
            {activeCalls.map((call) => {
              const draftEntry = team ? (draftRegistryMap.get(call.id) ?? null) : null;

              return (
                <div key={call.id} className="border-border bg-card rounded-2xl border p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-foreground font-semibold">{call.title}</p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {t`Opens`} {call.opensAt ? formatUnknownDate(call.opensAt) : t`immediately`}
                      </p>
                    </div>
                    <span className="bg-warning/10 text-warning rounded-full px-3 py-1 text-xs font-semibold">
                      {call.closesAt
                        ? `${t`Closes`} ${formatUnknownDate(call.closesAt)}`
                        : t`No closing date`}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {draftEntry ? (
                      <Button asChild size="sm">
                        <Link href={ROUTES.STUDENT.studentApplication(draftEntry.applicationId)}>
                          {t`Continue draft`}
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        disabled={!isLead || !team || isLocked || createDraft.isPending}
                        onClick={() => void handleCreateDraft(call.id)}
                      >
                        {t`Start draft`}
                      </Button>
                    )}
                    <Button asChild size="sm" variant="outline">
                      <Link href={ROUTES.STUDENT.TEAM}>
                        {isLead ? t`Check team readiness` : t`View team access`}
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
            {activeCalls.length ? null : (
              <div className="bg-muted rounded-2xl p-5">
                <p className="text-muted-foreground text-sm leading-7">
                  {t`No active Program A calls are available right now.`}
                </p>
              </div>
            )}
          </div>
        </div>
        {isLead ? (
          <div className="border-border bg-card rounded-2xl border border-dashed p-5">
            <p className="text-foreground text-sm font-semibold">{t`Recovered drafts`}</p>
            <div className="mt-3 space-y-3">
              {draftEntries.length ? (
                draftEntries.map((entry) => {
                  const callTitle =
                    activeCalls.find((call) => call.id === entry.callId)?.title ?? null;

                  return (
                    <div
                      key={entry.applicationId}
                      className="bg-muted flex items-center justify-between gap-3 rounded-xl p-3"
                    >
                      <div className="min-w-0">
                        <p className="text-foreground truncate text-sm font-semibold">
                          {callTitle ?? t`Program A draft`}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {t`Updated`} {formatUnknownDate(entry.updatedAt)}
                        </p>
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <Link href={ROUTES.STUDENT.studentApplication(entry.applicationId)}>
                          {t`Open`}
                        </Link>
                      </Button>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground text-sm leading-7">{t`No local Program A drafts yet.`}</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </StudentSectionCard>
  );
}

export function ProgramBSection({
  backlogPreview,
  projectPreview,
}: {
  backlogPreview: ProgramBBacklogControllerListPublishedQueryResult['data'];
  projectPreview: ProgramBProjectsControllerListMyQueryResult;
}) {
  return (
    <StudentSectionCard
      title={t`Program B flow`}
      description={t`Discover opportunities first, then track accepted work as project delivery.`}
    >
      <div className="space-y-5">
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-muted-foreground text-sm font-semibold tracking-[0.16em] uppercase">
              {t`Opportunities`}
            </h3>
            <Button asChild size="sm" variant="outline">
              <Link href={ROUTES.STUDENT.PROGRAM_B_BACKLOG}>{t`Open backlog`}</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {backlogPreview.map((item) => (
              <div key={item.id} className="border-border bg-muted rounded-2xl border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-foreground font-semibold">
                      {normalizeUnknownText(item.title) ?? t`Untitled backlog item`}
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm leading-7">
                      {normalizeUnknownText(item.description) ?? t`No description provided.`}
                    </p>
                  </div>
                  <span className="bg-accent text-primary rounded-full px-3 py-1 text-xs font-semibold">
                    {item.status}
                  </span>
                </div>
                <div className="mt-3">
                  <Button asChild size="sm" variant="outline">
                    <Link href={ROUTES.STUDENT.programBBacklogDetail(item.id)}>
                      {t`View details`}
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
            {backlogPreview.length ? null : (
              <p className="text-muted-foreground text-sm leading-7">
                {t`Published Program B opportunities will appear here once available.`}
              </p>
            )}
          </div>
        </div>
        <div>
          <h3 className="text-muted-foreground mb-3 text-sm font-semibold tracking-[0.16em] uppercase">
            {t`Active projects`}
          </h3>
          <div className="space-y-3">
            {projectPreview.map((project) => (
              <div key={project.id} className="border-border bg-muted rounded-2xl border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-foreground font-semibold">
                      {normalizeUnknownText(project.backlogItem.title) ?? t`Project`}
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {t`Team`} {project.team.name}
                    </p>
                  </div>
                  <span className="bg-success/10 text-success rounded-full px-3 py-1 text-xs font-semibold">
                    {project.status}
                  </span>
                </div>
                <div className="mt-3">
                  <Button asChild size="sm" variant="outline">
                    <Link href={ROUTES.STUDENT.programBProjectDetail(project.id)}>
                      {t`Open project`}
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
            {projectPreview.length ? null : (
              <p className="text-muted-foreground text-sm leading-7">{t`No active Program B projects yet.`}</p>
            )}
          </div>
        </div>
      </div>
    </StudentSectionCard>
  );
}

export function TeamLoadErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <StudentPageShell
      title={t`Dashboard`}
      description={t`A lighter student workspace with separate flows for foundation setup, Program A applications, and Program B opportunities.`}
    >
      <div className="space-y-4">
        <StudentSectionCard title={t`Unable to load team data`}>
          <p className="text-muted-foreground text-sm">
            {t`The current team could not be loaded right now. Retry the request instead of treating this as no team.`}
          </p>
        </StudentSectionCard>
        <div className="flex justify-center">
          <Button variant="outline" onClick={onRetry}>
            {t`Retry`}
          </Button>
        </div>
      </div>
    </StudentPageShell>
  );
}

export function StudentDashboardShell({ children }: { children: ReactNode }) {
  return (
    <StudentPageShell
      title={t`Dashboard`}
      description={t`A lighter student workspace with separate flows for foundation setup, Program A applications, and Program B opportunities.`}
    >
      {children}
    </StudentPageShell>
  );
}
