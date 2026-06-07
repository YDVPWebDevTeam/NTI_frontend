'use client';

import { t } from '@lingui/core/macro';
import type { Dispatch, SetStateAction } from 'react';

import { Input } from 'components/shadcn';
import {
  ReportsControllerGetApplicationsOrder,
  ReportsControllerExportReportDataset,
} from 'lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'components/shadcn/select';
import { formatEnumLabel } from 'lib/utils';

import type {
  ApplicationOrder,
  ApplicationSort,
  ApplicationStatusFilter,
  ProgramBOrder,
  ProgramBSort,
  ProgramBStatusFilter,
  ProgramTypeFilter,
  ReportDataset,
} from './admin-reports-types';
import {
  ALL_FILTER,
  APPLICATION_SORT_OPTIONS,
  APPLICATION_STATUS_OPTIONS,
  getOrderLabel,
  getSortLabel,
  PROGRAM_B_SORT_OPTIONS,
  PROGRAM_B_STATUS_OPTIONS,
  PROGRAM_TYPE_OPTIONS,
} from './admin-reports-utils';

type AdminReportsFiltersProps = {
  selectedDataset: ReportDataset;
  applicationsStatus: ApplicationStatusFilter;
  setApplicationsStatus: (value: ApplicationStatusFilter) => void;
  applicationsProgramType: ProgramTypeFilter;
  setApplicationsProgramType: (value: ProgramTypeFilter) => void;
  applicationsSort: ApplicationSort;
  setApplicationsSort: (value: ApplicationSort) => void;
  applicationsOrder: ApplicationOrder;
  setApplicationsOrder: (value: ApplicationOrder) => void;
  applicationsDateFrom: string;
  setApplicationsDateFrom: (value: string) => void;
  applicationsDateTo: string;
  setApplicationsDateTo: (value: string) => void;
  setApplicationsPage: Dispatch<SetStateAction<number>>;
  programBStatus: ProgramBStatusFilter;
  setProgramBStatus: (value: ProgramBStatusFilter) => void;
  programBSort: ProgramBSort;
  setProgramBSort: (value: ProgramBSort) => void;
  programBOrder: ProgramBOrder;
  setProgramBOrder: (value: ProgramBOrder) => void;
  programBDateFrom: string;
  setProgramBDateFrom: (value: string) => void;
  programBDateTo: string;
  setProgramBDateTo: (value: string) => void;
  setProgramBPage: Dispatch<SetStateAction<number>>;
};

export function AdminReportsFilters({
  selectedDataset,
  applicationsStatus,
  setApplicationsStatus,
  applicationsProgramType,
  setApplicationsProgramType,
  applicationsSort,
  setApplicationsSort,
  applicationsOrder,
  setApplicationsOrder,
  applicationsDateFrom,
  setApplicationsDateFrom,
  applicationsDateTo,
  setApplicationsDateTo,
  setApplicationsPage,
  programBStatus,
  setProgramBStatus,
  programBSort,
  setProgramBSort,
  programBOrder,
  setProgramBOrder,
  programBDateFrom,
  setProgramBDateFrom,
  programBDateTo,
  setProgramBDateTo,
  setProgramBPage,
}: AdminReportsFiltersProps) {
  const isApplications = selectedDataset === ReportsControllerExportReportDataset.applications;

  return (
    <div className="border-border bg-muted/70 grid gap-4 rounded-2xl border p-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className="min-w-0">
        <label className="text-muted-foreground mb-2 block text-[11px] font-medium tracking-[0.12em] uppercase">
          {t`Status`}
        </label>
        <Select
          value={isApplications ? applicationsStatus : programBStatus}
          onValueChange={(value) => {
            if (isApplications) {
              setApplicationsPage(1);
              setApplicationsStatus(value as ApplicationStatusFilter);

              return;
            }

            setProgramBPage(1);
            setProgramBStatus(value as ProgramBStatusFilter);
          }}
        >
          <SelectTrigger className="bg-card h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(isApplications ? APPLICATION_STATUS_OPTIONS : PROGRAM_B_STATUS_OPTIONS).map(
              (status) => (
                <SelectItem key={status} value={status}>
                  {status === ALL_FILTER ? t`All statuses` : formatEnumLabel(status)}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>

      {isApplications ? (
        <div className="min-w-0">
          <label className="text-muted-foreground mb-2 block text-[11px] font-medium tracking-[0.12em] uppercase">
            {t`Program`}
          </label>
          <Select
            value={applicationsProgramType}
            onValueChange={(value) => {
              setApplicationsPage(1);
              setApplicationsProgramType(value as ProgramTypeFilter);
            }}
          >
            <SelectTrigger className="bg-card h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROGRAM_TYPE_OPTIONS.map((programType) => (
                <SelectItem key={programType} value={programType}>
                  {programType === ALL_FILTER ? t`All programs` : formatEnumLabel(programType)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="min-w-0">
        <label className="text-muted-foreground mb-2 block text-[11px] font-medium tracking-[0.12em] uppercase">
          {t`Sort`}
        </label>
        <Select
          value={isApplications ? applicationsSort : programBSort}
          onValueChange={(value) => {
            if (isApplications) {
              setApplicationsPage(1);
              setApplicationsSort(value as ApplicationSort);

              return;
            }

            setProgramBPage(1);
            setProgramBSort(value as ProgramBSort);
          }}
        >
          <SelectTrigger className="bg-card h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(isApplications ? APPLICATION_SORT_OPTIONS : PROGRAM_B_SORT_OPTIONS).map((sort) => (
              <SelectItem key={sort} value={sort}>
                {getSortLabel(sort)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-0">
        <label className="text-muted-foreground mb-2 block text-[11px] font-medium tracking-[0.12em] uppercase">
          {t`Order`}
        </label>
        <Select
          value={isApplications ? applicationsOrder : programBOrder}
          onValueChange={(value) => {
            if (isApplications) {
              setApplicationsPage(1);
              setApplicationsOrder(value as ApplicationOrder);

              return;
            }

            setProgramBPage(1);
            setProgramBOrder(value as ProgramBOrder);
          }}
        >
          <SelectTrigger className="bg-card h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[
              ReportsControllerGetApplicationsOrder.asc,
              ReportsControllerGetApplicationsOrder.desc,
            ].map((order) => (
              <SelectItem key={order} value={order}>
                {getOrderLabel(order)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-0">
        <label className="text-muted-foreground mb-2 block text-[11px] font-medium tracking-[0.12em] uppercase">
          {t`Date From`}
        </label>
        <Input
          type="date"
          value={isApplications ? applicationsDateFrom : programBDateFrom}
          onChange={(event) => {
            if (isApplications) {
              setApplicationsPage(1);
              setApplicationsDateFrom(event.target.value);

              return;
            }

            setProgramBPage(1);
            setProgramBDateFrom(event.target.value);
          }}
          className="bg-card h-11"
        />
      </div>

      <div className="min-w-0">
        <label className="text-muted-foreground mb-2 block text-[11px] font-medium tracking-[0.12em] uppercase">
          {t`Date To`}
        </label>
        <Input
          type="date"
          value={isApplications ? applicationsDateTo : programBDateTo}
          onChange={(event) => {
            if (isApplications) {
              setApplicationsPage(1);
              setApplicationsDateTo(event.target.value);

              return;
            }

            setProgramBPage(1);
            setProgramBDateTo(event.target.value);
          }}
          className="bg-card h-11"
        />
      </div>
    </div>
  );
}
