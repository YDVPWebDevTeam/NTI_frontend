'use client';

import { t } from '@lingui/core/macro';
import Link from 'next/link';

import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow,
  formatAdminDateTime,
} from 'components/admin';
import { Button } from 'components/shadcn';
import { useProgramBProjectsControllerListMy } from 'lib/api';
import { ROUTES } from 'lib/constants';
import { formatEnumLabel } from 'lib/utils';
import { normalizeUnknownText } from 'lib/student-dashboard/normalizers';

export default function AdminProgramBProjectsPage() {
  // BACKEND-BLOCKED: the generated client only exposes `listMy` (projects the current
  // admin is assigned to as mentor/PO) — there is no admin-scoped "list all projects"
  // endpoint. An admin therefore sees only their own assigned projects, not the full
  // program-wide list. Surfacing the complete listing requires a new backend endpoint
  // (e.g. an admin-scoped ProgramBProjects list). Do not swap this hook until that exists.
  const projectsQuery = useProgramBProjectsControllerListMy();
  const projects = projectsQuery.data ?? [];

  if (projectsQuery.isLoading) {
    return <AdminLoadingState />;
  }

  if (projectsQuery.isError) {
    return (
      <AdminErrorState
        title={t`Program B projects unavailable`}
        description={t`The Program B project request failed.`}
        actionLabel={t`Retry`}
        onAction={() => void projectsQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-border bg-card rounded-2xl border p-5">
        <p className="text-muted-foreground text-[11px] font-medium tracking-[0.12em] uppercase">
          {t`Admin workspace`}
        </p>
        <h1 className="text-foreground mt-2 text-2xl font-semibold">{t`Program B projects`}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t`Oversee Program B delivery, assign mentors, and record NTI final acceptance.`}
        </p>
      </div>

      {projects.length === 0 ? (
        <AdminEmptyState
          title={t`No Program B projects`}
          description={t`Only projects you're assigned to are shown — admin-wide listing requires a backend endpoint. Projects created from accepted Program B candidates will appear here once you're assigned.`}
        />
      ) : (
        <AdminTable>
          <AdminTableHead>
            <AdminTableRow>
              <AdminTableHeaderCell>{t`Project`}</AdminTableHeaderCell>
              <AdminTableHeaderCell>{t`Team`}</AdminTableHeaderCell>
              <AdminTableHeaderCell>{t`Status`}</AdminTableHeaderCell>
              <AdminTableHeaderCell>{t`Mentor`}</AdminTableHeaderCell>
              <AdminTableHeaderCell>{t`Updated`}</AdminTableHeaderCell>
              <AdminTableHeaderCell className="text-right">{t`Actions`}</AdminTableHeaderCell>
            </AdminTableRow>
          </AdminTableHead>

          <AdminTableBody>
            {projects.map((project) => (
              <AdminTableRow key={project.id}>
                <AdminTableCell className="text-foreground font-medium">
                  <Link
                    href={ROUTES.ADMIN.programBProjectDetail(project.id)}
                    className="hover:underline"
                  >
                    {normalizeUnknownText(project.backlogItem.title) ?? t`Program B project`}
                  </Link>
                </AdminTableCell>
                <AdminTableCell>{project.team.name ?? t`Unknown team`}</AdminTableCell>
                <AdminTableCell>{formatEnumLabel(project.status)}</AdminTableCell>
                <AdminTableCell>
                  {project.mentorAssignment.mentor
                    ? `${project.mentorAssignment.mentor.firstName} ${project.mentorAssignment.mentor.lastName}`
                    : t`Not assigned`}
                </AdminTableCell>
                <AdminTableCell>{formatAdminDateTime(project.updatedAt)}</AdminTableCell>
                <AdminTableCell>
                  <div className="flex justify-end">
                    <Button asChild size="sm" variant="outline">
                      <Link href={ROUTES.ADMIN.programBProjectDetail(project.id)}>{t`View`}</Link>
                    </Button>
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTableBody>
        </AdminTable>
      )}
    </div>
  );
}
