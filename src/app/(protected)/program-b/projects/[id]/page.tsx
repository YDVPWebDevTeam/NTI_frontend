'use client';

import { use } from 'react';

import {
  UserRole,
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
} from 'components/student-dashboard/page-shell';
import { formatUnknownDate, normalizeUnknownText } from 'lib/student-dashboard/normalizers';
import { useAuthenticatedUser } from 'lib/student-dashboard/use-authenticated-user';

export default function ProgramBProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isLoading } = useAuthenticatedUser([UserRole.STUDENT]);
  const projectQuery = useProgramBProjectsControllerGetProject(id, {
    query: {
      enabled: !isLoading,
    },
  });
  const milestonesQuery = useProgramBProjectsControllerListMilestones(id, {
    query: {
      enabled: !isLoading,
    },
  });
  const notesQuery = useProgramBProjectsControllerListMentoringNotes(id, {
    query: {
      enabled: !isLoading,
    },
  });
  const reviewsQuery = useProgramBProjectsControllerListPoReviews(id, {
    query: {
      enabled: !isLoading,
    },
  });
  const documentsQuery = useProgramBProjectsControllerListDocuments(id, {
    query: {
      enabled: !isLoading,
    },
  });

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4">
        <StudentStatusCard
          title="Loading project"
          description="Resolving your student session and project detail."
        />
      </main>
    );
  }

  const project = projectQuery.data;

  return (
    <StudentPageShell
      title={normalizeUnknownText(project?.backlogItem.title) ?? 'Program B project'}
      description="Overview, milestones, mentoring notes, reviews, and project documents from generated Program B project hooks."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <StudentSectionCard title="Overview">
          <div className="space-y-3 text-sm text-neutral-700">
            <p>
              Status: <span className="font-medium text-neutral-950">{project?.status}</span>
            </p>
            <p>
              Team:{' '}
              <span className="font-medium text-neutral-950">
                {project?.team.name ?? 'Unknown team'}
              </span>
            </p>
            <p>
              Product owner:{' '}
              <span className="font-medium text-neutral-950">
                {project?.productOwner.firstName} {project?.productOwner.lastName}
              </span>
            </p>
            <p>
              Accepted by company:{' '}
              <span className="font-medium text-neutral-950">
                {project?.acceptedByCompanyAt
                  ? formatUnknownDate(project.acceptedByCompanyAt)
                  : 'Pending'}
              </span>
            </p>
          </div>
        </StudentSectionCard>

        <StudentSectionCard title="Milestones">
          <div className="space-y-3">
            {(milestonesQuery.data ?? []).map((milestone) => (
              <div
                key={milestone.id}
                className="rounded-2xl border border-black/10 bg-[#f7f8fa] p-4"
              >
                <p className="font-semibold text-neutral-950">{milestone.title}</p>
                <p className="mt-1 text-sm text-neutral-600">
                  {normalizeUnknownText(milestone.description) ?? 'No description'}
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                  {milestone.status} · due {formatUnknownDate(milestone.dueAt)}
                </p>
              </div>
            ))}
          </div>
        </StudentSectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <StudentSectionCard title="Mentoring notes">
          <div className="space-y-3">
            {(notesQuery.data ?? []).map((note) => (
              <div key={note.id} className="rounded-2xl border border-black/10 bg-[#f7f8fa] p-4">
                <p className="text-sm text-neutral-700">{note.note}</p>
                <p className="mt-2 text-xs text-neutral-500">
                  {note.author.firstName} {note.author.lastName} ·{' '}
                  {formatUnknownDate(note.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </StudentSectionCard>

        <StudentSectionCard title="Product owner reviews">
          <div className="space-y-3">
            {(reviewsQuery.data ?? []).map((review) => (
              <div key={review.id} className="rounded-2xl border border-black/10 bg-[#f7f8fa] p-4">
                <p className="font-semibold text-neutral-950">{review.decision}</p>
                <p className="mt-1 text-sm text-neutral-600">
                  {normalizeUnknownText(review.comment) ?? 'No comment'}
                </p>
                <p className="mt-2 text-xs text-neutral-500">
                  {review.author.firstName} {review.author.lastName} ·{' '}
                  {formatUnknownDate(review.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </StudentSectionCard>
      </div>

      <StudentSectionCard title="Documents">
        <div className="space-y-3">
          {(documentsQuery.data ?? []).map((document) => (
            <div key={document.id} className="rounded-2xl border border-black/10 bg-[#f7f8fa] p-4">
              <p className="font-semibold text-neutral-950">{document.name}</p>
              <p className="text-sm text-neutral-600">
                {document.category} · {document.status} · {document.visibility}
              </p>
            </div>
          ))}
        </div>
      </StudentSectionCard>
    </StudentPageShell>
  );
}
