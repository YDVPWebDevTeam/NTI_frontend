'use client';

import { t } from '@lingui/core/macro';
import { useQueryClient } from '@tanstack/react-query';
import {
  BarChart3,
  Clock3,
  FileDown,
  FileSpreadsheet,
  RefreshCcw,
  TableProperties,
} from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  ReportsControllerExportReportDataset,
  ReportsControllerExportReportFormat,
  ReportsControllerGetApplicationsOrder,
  ReportsControllerGetApplicationsSort,
  ReportsControllerGetProgramBOrder,
  ReportsControllerGetProgramBSort,
  useReportsControllerGetApplications,
  useReportsControllerGetDashboard,
  useReportsControllerGetProgramB,
} from 'lib/api';
import { ApiRequestError, buildApiUrl } from 'lib/api-client/openapi-runtime/client';

import {
  AdminApplicationsReportTable,
  AdminEmptyState,
  AdminErrorState,
  AdminExportJobCard,
  AdminExportJobRow,
  AdminLoadingState,
  AdminProgramBReportTable,
  AdminReportsFilters,
  AdminStatCard,
  AdminTable,
  AdminTableBody,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow,
  type ExportFormat,
  HTTP_STATUS_FORBIDDEN,
  HTTP_STATUS_UNAUTHORIZED,
  PAGE_SIZE,
  type ReportDataset,
  REPORT_DATASETS,
  EXPORT_FORMATS,
  ALL_FILTER,
  MAX_STORED_EXPORT_JOB_IDS,
  REPORT_EXPORT_JOBS_STORAGE_KEY,
  getDatasetLabel,
  getDefaultExportFilename,
  getFilenameFromDisposition,
  getResponseErrorMessage,
  downloadBlob,
  useHandleAdminSessionFailure,
} from 'components/admin';
import {
  type ApplicationOrder,
  type ApplicationSort,
  type ApplicationStatusFilter,
  type ProgramBOrder,
  type ProgramBSort,
  type ProgramBStatusFilter,
  type ProgramTypeFilter,
} from 'components/admin';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'components/shadcn/select';
import { Button, Card, CardContent, CardHeader, CardTitle } from 'components/shadcn';

export default function AdminReportsPage() {
  const queryClient = useQueryClient();
  const handleSessionFailure = useHandleAdminSessionFailure();
  const dashboardQuery = useReportsControllerGetDashboard();

  const [selectedDataset, setSelectedDataset] = useState<ReportDataset>(
    ReportsControllerExportReportDataset.applications,
  );
  const [exportFormat, setExportFormat] = useState<ExportFormat>(
    ReportsControllerExportReportFormat.csv,
  );
  const [exportJobIds, setExportJobIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const storedValue = window.localStorage.getItem(REPORT_EXPORT_JOBS_STORAGE_KEY);

      if (!storedValue) {
        return [];
      }

      const parsed = JSON.parse(storedValue) as unknown;

      if (!Array.isArray(parsed)) {
        return [];
      }

      return Array.from(
        new Set(parsed.filter((value): value is string => typeof value === 'string')),
      ).slice(0, MAX_STORED_EXPORT_JOB_IDS);
    } catch {
      return [];
    }
  });
  const [isExporting, setIsExporting] = useState(false);

  const [applicationsPage, setApplicationsPage] = useState(1);
  const [applicationsStatus, setApplicationsStatus] = useState<ApplicationStatusFilter>(ALL_FILTER);
  const [applicationsProgramType, setApplicationsProgramType] =
    useState<ProgramTypeFilter>(ALL_FILTER);
  const [applicationsDateFrom, setApplicationsDateFrom] = useState('');
  const [applicationsDateTo, setApplicationsDateTo] = useState('');
  const [applicationsSort, setApplicationsSort] = useState<ApplicationSort>(
    ReportsControllerGetApplicationsSort.createdAt,
  );
  const [applicationsOrder, setApplicationsOrder] = useState<ApplicationOrder>(
    ReportsControllerGetApplicationsOrder.desc,
  );

  const [programBPage, setProgramBPage] = useState(1);
  const [programBStatus, setProgramBStatus] = useState<ProgramBStatusFilter>(ALL_FILTER);
  const [programBDateFrom, setProgramBDateFrom] = useState('');
  const [programBDateTo, setProgramBDateTo] = useState('');
  const [programBSort, setProgramBSort] = useState<ProgramBSort>(
    ReportsControllerGetProgramBSort.createdAt,
  );
  const [programBOrder, setProgramBOrder] = useState<ProgramBOrder>(
    ReportsControllerGetProgramBOrder.desc,
  );

  const applicationsQuery = useReportsControllerGetApplications(
    {
      page: applicationsPage,
      limit: PAGE_SIZE,
      dateFrom: applicationsDateFrom || undefined,
      dateTo: applicationsDateTo || undefined,
      programType: applicationsProgramType === ALL_FILTER ? undefined : applicationsProgramType,
      status: applicationsStatus === ALL_FILTER ? undefined : applicationsStatus,
      sort: applicationsSort,
      order: applicationsOrder,
    },
    {
      query: {
        enabled: selectedDataset === ReportsControllerExportReportDataset.applications,
      },
    },
  );
  const programBQuery = useReportsControllerGetProgramB(
    {
      page: programBPage,
      limit: PAGE_SIZE,
      dateFrom: programBDateFrom || undefined,
      dateTo: programBDateTo || undefined,
      status: programBStatus === ALL_FILTER ? undefined : programBStatus,
      sort: programBSort,
      order: programBOrder,
    },
    {
      query: {
        enabled: selectedDataset === ReportsControllerExportReportDataset['program-b'],
      },
    },
  );

  const activeDatasetQuery =
    selectedDataset === ReportsControllerExportReportDataset.applications
      ? applicationsQuery
      : programBQuery;

  useEffect(() => {
    window.localStorage.setItem(
      REPORT_EXPORT_JOBS_STORAGE_KEY,
      JSON.stringify(exportJobIds.slice(0, MAX_STORED_EXPORT_JOB_IDS)),
    );
  }, [exportJobIds]);

  const refreshExportJobs = async () => {
    await queryClient.refetchQueries({
      predicate: (query) => {
        const firstKey = query.queryKey[0];

        return typeof firstKey === 'string' && firstKey.startsWith('/reports/export-jobs/');
      },
    });
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const params = new URLSearchParams({
        dataset: selectedDataset,
        format: exportFormat,
      });

      const isApplications = selectedDataset === ReportsControllerExportReportDataset.applications;
      const dateFrom = isApplications ? applicationsDateFrom : programBDateFrom;
      const dateTo = isApplications ? applicationsDateTo : programBDateTo;

      if (dateFrom) {
        params.set('dateFrom', dateFrom);
      }

      if (dateTo) {
        params.set('dateTo', dateTo);
      }

      if (isApplications) {
        if (applicationsProgramType !== ALL_FILTER) {
          params.set('programType', applicationsProgramType);
        }

        if (applicationsStatus !== ALL_FILTER) {
          params.set('status', applicationsStatus);
        }

        params.set('sort', applicationsSort);
        params.set('order', applicationsOrder);
      } else {
        if (programBStatus !== ALL_FILTER) {
          params.set('status', programBStatus);
        }

        params.set('sort', programBSort);
        params.set('order', programBOrder);
      }

      const response = await fetch(buildApiUrl(`/reports/export?${params.toString()}`), {
        credentials: 'include',
      });

      if (
        response.status === HTTP_STATUS_UNAUTHORIZED ||
        response.status === HTTP_STATUS_FORBIDDEN
      ) {
        throw new ApiRequestError(t`Your admin session has expired.`, response.status);
      }

      if (!response.ok) {
        throw new Error(await getResponseErrorMessage(response));
      }

      const contentType = response.headers.get('content-type') ?? '';

      if (contentType.includes('application/json')) {
        const payload = (await response.json()) as { exportJobId?: string };

        if (!payload.exportJobId) {
          throw new Error(t`The export job response was incomplete.`);
        }

        const exportJobId = payload.exportJobId;

        setExportJobIds((current) =>
          [exportJobId, ...current.filter((jobId) => jobId !== exportJobId)].slice(
            0,
            MAX_STORED_EXPORT_JOB_IDS,
          ),
        );
        toast.success(t`Export queued. Status will refresh automatically.`);

        return;
      }

      const blob = await response.blob();
      const filename = getFilenameFromDisposition(
        response.headers.get('content-disposition'),
        getDefaultExportFilename(selectedDataset, exportFormat),
      );

      downloadBlob(blob, filename);
      toast.success(t`Export is ready and downloading now.`);
    } catch (error) {
      await handleSessionFailure(error, t`Unable to export this report right now.`);
    } finally {
      setIsExporting(false);
    }
  };

  const isInitialLoading =
    dashboardQuery.isLoading &&
    ((selectedDataset === ReportsControllerExportReportDataset.applications &&
      applicationsQuery.isLoading) ||
      (selectedDataset === ReportsControllerExportReportDataset['program-b'] &&
        programBQuery.isLoading));

  if (isInitialLoading) {
    return <AdminLoadingState label={t`Loading reports...`} />;
  }

  let datasetContent: ReactNode;

  if (activeDatasetQuery.isError) {
    datasetContent = (
      <AdminErrorState
        title={t`Dataset unavailable`}
        description={t`The current report table could not be loaded.`}
        actionLabel={t`Retry`}
        onAction={() => void activeDatasetQuery.refetch()}
      />
    );
  } else if (activeDatasetQuery.isLoading) {
    datasetContent = <AdminLoadingState label={t`Loading dataset...`} />;
  } else if (selectedDataset === ReportsControllerExportReportDataset.applications) {
    datasetContent = (
      <AdminApplicationsReportTable
        queryData={applicationsQuery.data}
        page={applicationsPage}
        onPrevious={() => setApplicationsPage((current) => Math.max(1, current - 1))}
        onNext={() => setApplicationsPage((current) => current + 1)}
      />
    );
  } else {
    datasetContent = (
      <AdminProgramBReportTable
        queryData={programBQuery.data}
        page={programBPage}
        onPrevious={() => setProgramBPage((current) => Math.max(1, current - 1))}
        onNext={() => setProgramBPage((current) => current + 1)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {dashboardQuery.isError ? (
        <AdminErrorState
          title={t`Reporting dashboard unavailable`}
          description={t`Headline reporting data could not be loaded.`}
          actionLabel={t`Retry`}
          onAction={() => void dashboardQuery.refetch()}
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <AdminStatCard
            label={t`Application Decisions`}
            value={dashboardQuery.data?.decisionsLast30Days ?? 0}
            description={t`Decisions recorded during the last 30 days.`}
            icon={<BarChart3 className="h-5 w-5" />}
          />
          <AdminStatCard
            label={t`Active Projects`}
            value={dashboardQuery.data?.activeProjectsCount ?? 0}
            description={t`Program B projects currently in delivery.`}
            icon={<TableProperties className="h-5 w-5" />}
          />
          <AdminStatCard
            label={t`Open Calls`}
            value={dashboardQuery.data?.callsOpenCount ?? 0}
            description={t`Calls still open for new submissions.`}
            icon={<Clock3 className="h-5 w-5" />}
          />
          <AdminStatCard
            label={t`Applications In Scope`}
            value={
              dashboardQuery.data?.applicationsByStatus.reduce(
                (sum, item) => sum + item.count,
                0,
              ) ?? 0
            }
            description={t`Total application rows represented across status groups.`}
            icon={<FileSpreadsheet className="h-5 w-5" />}
          />
          <AdminStatCard
            label={t`Organizations Tracked`}
            value={
              dashboardQuery.data?.organizationsByStatus.reduce(
                (sum, item) => sum + item.count,
                0,
              ) ?? 0
            }
            description={t`Organizations included in the current reporting rollup.`}
            icon={<BarChart3 className="h-5 w-5" />}
          />
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="border-slate-200 bg-white shadow-none">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="text-2xl text-slate-950">{t`Datasets`}</CardTitle>
              <p className="mt-2 text-sm text-slate-600">
                {t`Switch between operational report tables, apply filters, and keep the export scope aligned with what you are reviewing.`}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full bg-white sm:w-auto"
              onClick={() => void activeDatasetQuery.refetch()}
            >
              <RefreshCcw className="h-4 w-4" />
              {t`Refresh table`}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 sm:grid-cols-2">
              {REPORT_DATASETS.map((dataset) => {
                const isActive = dataset === selectedDataset;

                return (
                  <button
                    key={dataset}
                    type="button"
                    className={
                      isActive
                        ? 'w-full rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors'
                        : 'w-full rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-950'
                    }
                    onClick={() => setSelectedDataset(dataset)}
                  >
                    {getDatasetLabel(dataset)}
                  </button>
                );
              })}
            </div>

            <AdminReportsFilters
              selectedDataset={selectedDataset}
              applicationsStatus={applicationsStatus}
              setApplicationsStatus={setApplicationsStatus}
              applicationsProgramType={applicationsProgramType}
              setApplicationsProgramType={setApplicationsProgramType}
              applicationsSort={applicationsSort}
              setApplicationsSort={setApplicationsSort}
              applicationsOrder={applicationsOrder}
              setApplicationsOrder={setApplicationsOrder}
              applicationsDateFrom={applicationsDateFrom}
              setApplicationsDateFrom={setApplicationsDateFrom}
              applicationsDateTo={applicationsDateTo}
              setApplicationsDateTo={setApplicationsDateTo}
              setApplicationsPage={setApplicationsPage}
              programBStatus={programBStatus}
              setProgramBStatus={setProgramBStatus}
              programBSort={programBSort}
              setProgramBSort={setProgramBSort}
              programBOrder={programBOrder}
              setProgramBOrder={setProgramBOrder}
              programBDateFrom={programBDateFrom}
              setProgramBDateFrom={setProgramBDateFrom}
              programBDateTo={programBDateTo}
              setProgramBDateTo={setProgramBDateTo}
              setProgramBPage={setProgramBPage}
            />

            {datasetContent}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200 bg-white shadow-none">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-950">{t`Export Current View`}</CardTitle>
              <p className="mt-2 text-sm text-slate-600">
                {t`Export the dataset currently selected on the left. Large result sets will continue as background jobs.`}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <div className="font-medium text-slate-950">{getDatasetLabel(selectedDataset)}</div>
                <div className="mt-1">
                  {t`Filters applied to the table are reused for the export request.`}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-medium tracking-[0.12em] text-slate-500 uppercase">
                  {t`Format`}
                </label>
                <Select
                  value={exportFormat}
                  onValueChange={(value) => setExportFormat(value as ExportFormat)}
                >
                  <SelectTrigger className="h-11 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPORT_FORMATS.map((format) => (
                      <SelectItem key={format} value={format}>
                        {format.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="button"
                className="w-full"
                disabled={isExporting}
                onClick={() => void handleExport()}
              >
                <FileDown className="h-4 w-4" />
                {isExporting ? t`Preparing export...` : t`Export dataset`}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-none">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="text-2xl text-slate-950">{t`Export Jobs`}</CardTitle>
                <p className="mt-2 text-sm text-slate-600">
                  {t`Queued exports stay here until they complete or fail.`}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full bg-white sm:w-auto"
                onClick={() => void refreshExportJobs()}
              >
                <RefreshCcw className="h-4 w-4" />
                {t`Refresh statuses`}
              </Button>
            </CardHeader>
            <CardContent>
              {exportJobIds.length === 0 ? (
                <AdminEmptyState
                  title={t`No export jobs yet`}
                  description={t`Start an export to monitor its status and download completed files from here.`}
                />
              ) : (
                <>
                  <div className="space-y-3 sm:hidden">
                    {exportJobIds.map((jobId) => (
                      <AdminExportJobMobileCard key={jobId} id={jobId} />
                    ))}
                  </div>
                  <AdminTable className="hidden rounded-xl sm:block">
                    <AdminTableHead>
                      <AdminTableRow>
                        <AdminTableHeaderCell>{t`Job Id`}</AdminTableHeaderCell>
                        <AdminTableHeaderCell>{t`Dataset`}</AdminTableHeaderCell>
                        <AdminTableHeaderCell>{t`Format`}</AdminTableHeaderCell>
                        <AdminTableHeaderCell>{t`Status`}</AdminTableHeaderCell>
                        <AdminTableHeaderCell>{t`Timeline`}</AdminTableHeaderCell>
                        <AdminTableHeaderCell className="text-right">
                          {t`Actions`}
                        </AdminTableHeaderCell>
                      </AdminTableRow>
                    </AdminTableHead>
                    <AdminTableBody>
                      {exportJobIds.map((jobId) => (
                        <AdminExportJobRow key={jobId} id={jobId} />
                      ))}
                    </AdminTableBody>
                  </AdminTable>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function AdminExportJobMobileCard({ id }: { id: string }) {
  return <AdminExportJobCard id={id} />;
}
