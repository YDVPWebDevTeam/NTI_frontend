import type {
  ReportsControllerExportReportDataset,
  ReportsControllerExportReportFormat,
  ReportsControllerGetApplicationsOrder,
  ReportsControllerGetApplicationsProgramType,
  ReportsControllerGetApplicationsSort,
  ReportsControllerGetApplicationsStatus,
  ReportsControllerGetProgramBOrder,
  ReportsControllerGetProgramBSort,
  ReportsControllerGetProgramBStatus,
} from 'lib/api';

export type ReportDataset =
  (typeof ReportsControllerExportReportDataset)[keyof typeof ReportsControllerExportReportDataset];

export type ExportFormat =
  (typeof ReportsControllerExportReportFormat)[keyof typeof ReportsControllerExportReportFormat];

export type ApplicationStatusFilter =
  | 'ALL'
  | (typeof ReportsControllerGetApplicationsStatus)[keyof typeof ReportsControllerGetApplicationsStatus];

export type ProgramBStatusFilter =
  | 'ALL'
  | (typeof ReportsControllerGetProgramBStatus)[keyof typeof ReportsControllerGetProgramBStatus];

export type ProgramTypeFilter =
  | 'ALL'
  | (typeof ReportsControllerGetApplicationsProgramType)[keyof typeof ReportsControllerGetApplicationsProgramType];

export type ApplicationSort =
  (typeof ReportsControllerGetApplicationsSort)[keyof typeof ReportsControllerGetApplicationsSort];

export type ProgramBSort =
  (typeof ReportsControllerGetProgramBSort)[keyof typeof ReportsControllerGetProgramBSort];

export type ApplicationOrder =
  (typeof ReportsControllerGetApplicationsOrder)[keyof typeof ReportsControllerGetApplicationsOrder];

export type ProgramBOrder =
  (typeof ReportsControllerGetProgramBOrder)[keyof typeof ReportsControllerGetProgramBOrder];
