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
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-[11px] font-medium tracking-[0.12em] text-slate-500 uppercase">
          {t`Admin workspace`}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">{t`Program B projects`}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {t`Oversee Program B delivery, assign mentors, and record NTI final acceptance.`}
        </p>
      </div>

      {projects.length === 0 ? (
        <AdminEmptyState
          title={t`No Program B projects`}
          description={t`Projects created from accepted Program B candidates will appear here.`}
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
                <AdminTableCell className="font-medium text-slate-950">
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
