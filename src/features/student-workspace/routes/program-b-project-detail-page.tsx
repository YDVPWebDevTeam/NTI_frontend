'use client';

import { t } from '@lingui/core/macro';
import { use } from 'react';

import {
  useProgramBProjectsControllerGetProject,
  useProgramBProjectsControllerListDocuments,
  useProgramBProjectsControllerListMentoringNotes,
  useProgramBProjectsControllerListMilestones,
  useProgramBProjectsControllerListPoReviews,
} from 'lib/api';
import {
  StudentPageShell,
  StudentSectionCard,
  StudentStatusCard,
} from 'components/student-dashboard/page-shell-primitives';
import { ProjectConversations } from 'features/conversations/project-conversations';
import {
  formatPersonName,
  formatUnknownDate,
  isApiNotFoundError,
  normalizeUnknownText,
} from 'lib/student-dashboard/normalizers';
import { useAuthenticatedUser } from 'lib/student-dashboard/use-authenticated-user';

export function StudentProgramBProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { me } = useAuthenticatedUser();
  const projectQuery = useProgramBProjectsControllerGetProject(id, {
    query: { enabled: true, retry: false },
  });
  const milestonesQuery = useProgramBProjectsControllerListMilestones(id, {
    query: { enabled: true },
  });
  const notesQuery = useProgramBProjectsControllerListMentoringNotes(id, {
    query: { enabled: true },
  });
  const reviewsQuery = useProgramBProjectsControllerListPoReviews(id, {
    query: { enabled: true },
  });
  const documentsQuery = useProgramBProjectsControllerListDocuments(id, {
    query: { enabled: true },
  });

  const project = projectQuery.data;
  const shellDescription = t`Overview, milestones, mentoring notes, reviews, and project documents from generated Program B project hooks.`;

  if (projectQuery.isLoading && !project) {
    return (
      <StudentPageShell title={t`Program B project`} description={shellDescription}>
        <StudentStatusCard
          title={t`Loading project`}
          description={t`Resolving this Program B project workspace.`}
        />
      </StudentPageShell>
    );
  }

  if (isApiNotFoundError(projectQuery.error) || (!projectQuery.isLoading && !project)) {
    return (
      <StudentPageShell title={t`Program B project`} description={shellDescription}>
        <StudentStatusCard
          title={t`Project not found`}
          description={t`This Program B project does not exist or is no longer available to you.`}
        />
      </StudentPageShell>
    );
  }

  if (projectQuery.isError || !project) {
    return (
      <StudentPageShell title={t`Program B project`} description={shellDescription}>
        <StudentStatusCard
          title={t`Unable to load project`}
          description={t`We could not load this Program B project right now. Please try again.`}
        />
      </StudentPageShell>
    );
  }

  return (
    <StudentPageShell
      title={normalizeUnknownText(project.backlogItem?.title) ?? t`Program B project`}
      description={shellDescription}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <StudentSectionCard title={t`Overview`}>
          <div className="text-muted-foreground space-y-3 text-sm">
            <p>
              {t`Status:`} <span className="text-foreground font-medium">{project.status}</span>
            </p>
            <p>
              {t`Team:`}{' '}
              <span className="text-foreground font-medium">
                {project.team?.name ?? t`Unknown team`}
              </span>
            </p>
            <p>
              {t`Product owner:`}{' '}
              <span className="text-foreground font-medium">
                {formatPersonName(project.productOwner) ?? t`Not assigned`}
              </span>
            </p>
            <p>
              {t`Reward per member:`}{' '}
              <span className="text-foreground font-medium">
                {typeof (project.rewardPerMember as unknown) === 'number'
                  ? `€${(project.rewardPerMember as unknown as number).toLocaleString()}`
                  : t`Not set`}
              </span>
            </p>
            <p>
              {t`Accepted by company:`}{' '}
              <span className="text-foreground font-medium">
                {project.acceptedByCompanyAt
                  ? formatUnknownDate(project.acceptedByCompanyAt)
                  : t`Pending`}
              </span>
            </p>
          </div>
        </StudentSectionCard>

        <StudentSectionCard title={t`Milestones`}>
          <div className="space-y-3">
            {(milestonesQuery.data ?? []).map((milestone) => (
              <div key={milestone.id} className="border-border bg-muted rounded-2xl border p-4">
                <p className="text-foreground font-semibold">{milestone.title}</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {normalizeUnknownText(milestone.description) ?? t`No description`}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {milestone.status} · {t`due`} {formatUnknownDate(milestone.dueAt)}
                </p>
              </div>
            ))}
          </div>
        </StudentSectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <StudentSectionCard title={t`Mentoring notes`}>
          <div className="space-y-3">
            {(notesQuery.data ?? []).map((note) => (
              <div key={note.id} className="border-border bg-muted rounded-2xl border p-4">
                <p className="text-muted-foreground text-sm">{note.note}</p>
                <p className="text-muted-foreground mt-2 text-xs">
                  {formatPersonName(note.author) ?? t`Mentor`} · {formatUnknownDate(note.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </StudentSectionCard>

        <StudentSectionCard title={t`Product owner reviews`}>
          <div className="space-y-3">
            {(reviewsQuery.data ?? []).map((review) => (
              <div key={review.id} className="border-border bg-muted rounded-2xl border p-4">
                <p className="text-foreground font-semibold">{review.decision}</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {normalizeUnknownText(review.comment) ?? t`No comment`}
                </p>
                <p className="text-muted-foreground mt-2 text-xs">
                  {formatPersonName(review.author) ?? t`Product owner`} ·{' '}
                  {formatUnknownDate(review.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </StudentSectionCard>
      </div>

      <StudentSectionCard title={t`Documents`}>
        <div className="space-y-3">
          {(documentsQuery.data ?? []).map((document) => (
            <div key={document.id} className="border-border bg-muted rounded-2xl border p-4">
              <p className="text-foreground font-semibold">{document.name}</p>
              <p className="text-muted-foreground text-sm">
                {document.category} · {document.status} · {document.visibility}
              </p>
            </div>
          ))}
        </div>
      </StudentSectionCard>

      <StudentSectionCard title={t`Messages`}>
        <ProjectConversations
          anchor={{ kind: 'program-b', projectId: id }}
          currentUserId={me?.id}
          role={me?.role}
          canWrite={project.status !== 'CLOSED'}
        />
      </StudentSectionCard>
    </StudentPageShell>
  );
}
