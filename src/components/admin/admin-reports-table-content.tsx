'use client';

import { t } from '@lingui/core/macro';

import type { ApplicationsReportResponseDto, ProgramBReportResponseDto } from 'lib/api';
import { Button } from 'components/shadcn';
import { formatEnumLabel } from 'lib/utils';

import { formatAdminDateTime } from './utils';
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow,
} from './admin-table';
import { formatOptionalReportDate } from './admin-reports-utils';

type AdminReportsPaginationProps = {
  currentPage: number;
  totalPages: number;
  totalRows: number;
  onPrevious: () => void;
  onNext: () => void;
};

function AdminReportsPagination({
  currentPage,
  totalPages,
  totalRows,
  onPrevious,
  onNext,
}: AdminReportsPaginationProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {t`Page`} {currentPage} {t`of`} {totalPages} · {totalRows} {t`rows`}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="bg-white"
          disabled={currentPage <= 1}
          onClick={onPrevious}
        >
          {t`Previous`}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="bg-white"
          disabled={currentPage >= totalPages}
          onClick={onNext}
        >
          {t`Next`}
        </Button>
      </div>
    </div>
  );
}

type AdminApplicationsReportTableProps = {
  queryData?: ApplicationsReportResponseDto;
  page: number;
  onPrevious: () => void;
  onNext: () => void;
};

export function AdminApplicationsReportTable({
  queryData,
  page,
  onPrevious,
  onNext,
}: AdminApplicationsReportTableProps) {
  const rows = queryData?.data ?? [];
  const meta = queryData?.meta;

  return (
    <div className="space-y-4">
      <div className="space-y-3 sm:hidden">
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
            {t`No application rows match the current filters.`}
          </div>
        ) : (
          rows.map((row) => (
            <article key={row.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="font-medium text-slate-950">{row.callTitle}</div>
              <div className="mt-1 font-mono text-xs break-all text-slate-500">{row.id}</div>
              <dl className="mt-4 grid gap-3 text-sm">
                <div>
                  <dt className="text-xs font-medium tracking-[0.08em] text-slate-500 uppercase">
                    {t`Team`}
                  </dt>
                  <dd className="mt-1 text-slate-700">{row.teamName}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium tracking-[0.08em] text-slate-500 uppercase">
                    {t`Created By`}
                  </dt>
                  <dd className="mt-1 break-all text-slate-700">{row.createdByEmail}</dd>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <dt className="text-xs font-medium tracking-[0.08em] text-slate-500 uppercase">
                      {t`Program`}
                    </dt>
                    <dd className="mt-1 text-slate-700">{formatEnumLabel(row.programType)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium tracking-[0.08em] text-slate-500 uppercase">
                      {t`Status`}
                    </dt>
                    <dd className="mt-1 text-slate-700">{formatEnumLabel(row.status)}</dd>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <dt className="text-xs font-medium tracking-[0.08em] text-slate-500 uppercase">
                      {t`Submitted`}
                    </dt>
                    <dd className="mt-1 text-slate-700">
                      {formatOptionalReportDate(row.submittedAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium tracking-[0.08em] text-slate-500 uppercase">
                      {t`Decided`}
                    </dt>
                    <dd className="mt-1 text-slate-700">
                      {formatOptionalReportDate(row.decidedAt)}
                    </dd>
                  </div>
                </div>
              </dl>
            </article>
          ))
        )}
      </div>

      <AdminTable className="hidden sm:block">
        <AdminTableHead>
          <AdminTableRow>
            <AdminTableHeaderCell>{t`Call`}</AdminTableHeaderCell>
            <AdminTableHeaderCell>{t`Team`}</AdminTableHeaderCell>
            <AdminTableHeaderCell>{t`Created By`}</AdminTableHeaderCell>
            <AdminTableHeaderCell>{t`Program`}</AdminTableHeaderCell>
            <AdminTableHeaderCell>{t`Status`}</AdminTableHeaderCell>
            <AdminTableHeaderCell>{t`Submitted`}</AdminTableHeaderCell>
            <AdminTableHeaderCell>{t`Decided`}</AdminTableHeaderCell>
          </AdminTableRow>
        </AdminTableHead>
        <AdminTableBody>
          {rows.map((row) => (
            <AdminTableRow key={row.id}>
              <AdminTableCell>
                <div className="font-medium text-slate-950">{row.callTitle}</div>
                <div className="mt-1 font-mono text-xs text-slate-500">{row.id}</div>
              </AdminTableCell>
              <AdminTableCell>{row.teamName}</AdminTableCell>
              <AdminTableCell>{row.createdByEmail}</AdminTableCell>
              <AdminTableCell>{formatEnumLabel(row.programType)}</AdminTableCell>
              <AdminTableCell>{formatEnumLabel(row.status)}</AdminTableCell>
              <AdminTableCell>{formatOptionalReportDate(row.submittedAt)}</AdminTableCell>
              <AdminTableCell>{formatOptionalReportDate(row.decidedAt)}</AdminTableCell>
            </AdminTableRow>
          ))}
          {rows.length === 0 ? (
            <AdminTableRow>
              <AdminTableCell className="py-10 text-center text-slate-500" colSpan={7}>
                {t`No application rows match the current filters.`}
              </AdminTableCell>
            </AdminTableRow>
          ) : null}
        </AdminTableBody>
      </AdminTable>

      <AdminReportsPagination
        currentPage={meta?.page ?? page}
        totalPages={meta?.totalPages ?? 1}
        totalRows={meta?.total ?? 0}
        onPrevious={onPrevious}
        onNext={onNext}
      />
    </div>
  );
}

type AdminProgramBReportTableProps = {
  queryData?: ProgramBReportResponseDto;
  page: number;
  onPrevious: () => void;
  onNext: () => void;
};

export function AdminProgramBReportTable({
  queryData,
  page,
  onPrevious,
  onNext,
}: AdminProgramBReportTableProps) {
  const rows = queryData?.data ?? [];
  const meta = queryData?.meta;

  return (
    <div className="space-y-4">
      <div className="space-y-3 sm:hidden">
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
            {t`No Program B rows match the current filters.`}
          </div>
        ) : (
          rows.map((row) => (
            <article key={row.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="font-medium text-slate-950">{row.backlogTitle}</div>
              <div className="mt-1 font-mono text-xs break-all text-slate-500">{row.id}</div>
              <dl className="mt-4 grid gap-3 text-sm">
                <div>
                  <dt className="text-xs font-medium tracking-[0.08em] text-slate-500 uppercase">
                    {t`Organization`}
                  </dt>
                  <dd className="mt-1 text-slate-700">{row.organizationName}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium tracking-[0.08em] text-slate-500 uppercase">
                    {t`Team`}
                  </dt>
                  <dd className="mt-1 text-slate-700">{row.teamName}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium tracking-[0.08em] text-slate-500 uppercase">
                    {t`Created By`}
                  </dt>
                  <dd className="mt-1 break-all text-slate-700">{row.createdByEmail}</dd>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <dt className="text-xs font-medium tracking-[0.08em] text-slate-500 uppercase">
                      {t`Status`}
                    </dt>
                    <dd className="mt-1 text-slate-700">{formatEnumLabel(row.status)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium tracking-[0.08em] text-slate-500 uppercase">
                      {t`Submitted`}
                    </dt>
                    <dd className="mt-1 text-slate-700">{formatAdminDateTime(row.submittedAt)}</dd>
                  </div>
                </div>
              </dl>
            </article>
          ))
        )}
      </div>

      <AdminTable className="hidden sm:block">
        <AdminTableHead>
          <AdminTableRow>
            <AdminTableHeaderCell>{t`Backlog`}</AdminTableHeaderCell>
            <AdminTableHeaderCell>{t`Organization`}</AdminTableHeaderCell>
            <AdminTableHeaderCell>{t`Team`}</AdminTableHeaderCell>
            <AdminTableHeaderCell>{t`Created By`}</AdminTableHeaderCell>
            <AdminTableHeaderCell>{t`Status`}</AdminTableHeaderCell>
            <AdminTableHeaderCell>{t`Submitted`}</AdminTableHeaderCell>
          </AdminTableRow>
        </AdminTableHead>
        <AdminTableBody>
          {rows.map((row) => (
            <AdminTableRow key={row.id}>
              <AdminTableCell>
                <div className="font-medium text-slate-950">{row.backlogTitle}</div>
                <div className="mt-1 font-mono text-xs text-slate-500">{row.id}</div>
              </AdminTableCell>
              <AdminTableCell>{row.organizationName}</AdminTableCell>
              <AdminTableCell>{row.teamName}</AdminTableCell>
              <AdminTableCell>{row.createdByEmail}</AdminTableCell>
              <AdminTableCell>{formatEnumLabel(row.status)}</AdminTableCell>
              <AdminTableCell>{formatAdminDateTime(row.submittedAt)}</AdminTableCell>
            </AdminTableRow>
          ))}
          {rows.length === 0 ? (
            <AdminTableRow>
              <AdminTableCell className="py-10 text-center text-slate-500" colSpan={6}>
                {t`No Program B rows match the current filters.`}
              </AdminTableCell>
            </AdminTableRow>
          ) : null}
        </AdminTableBody>
      </AdminTable>

      <AdminReportsPagination
        currentPage={meta?.page ?? page}
        totalPages={meta?.totalPages ?? 1}
        totalRows={meta?.total ?? 0}
        onPrevious={onPrevious}
        onNext={onNext}
      />
    </div>
  );
}
