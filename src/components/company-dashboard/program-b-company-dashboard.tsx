'use client';

import { t } from '@lingui/core/macro';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, RefreshCw, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import {
  OrganizationStatus,
  useOrganizationControllerGetMyOrganization,
  useProgramBCompanyOverviewControllerGetBacklogSummary,
  useProgramBCompanyOverviewControllerGetOverview,
  useProgramBCompanyOverviewControllerGetProjectSummary,
} from 'lib/api';
import { invalidateProgramBCompanyWorkspace } from 'lib/api-client/program-b-company';
import { formatDateTime } from 'lib/date';
import { Button } from 'components/shadcn';
import { ROUTES } from 'lib/constants';
import { formatEnumLabel } from 'lib/utils';
import {
  BacklogPreviewCard,
  OverviewErrorState,
  PendingActionsSection,
  ProjectPreviewCard,
  renderMetricCards,
  renderMetricLoadingCards,
} from './program-b-company-dashboard-content';
import {
  CompanyDashboardLoadingCard,
  CompanyDashboardPreviewState,
  CompanyDashboardSection,
  CompanyDashboardStatus,
} from './program-b-company-dashboard-primitives';

const OVERVIEW_METRIC_SKELETON_COUNT = 4;
const PREVIEW_LIMIT = 3;
const COMPANY_DASHBOARD_QUERY_OPTIONS = {
  retry: false,
  refetchOnMount: true,
} as const;

function getPendingActionLinkContext(
  backlogItems: Array<{
    id: string;
    productOwner?: { fullName: string } | null;
    pendingCandidatesCount: number;
  }>,
  projectItems: Array<{
    id: string;
    awaitingFinalAcceptance: boolean;
    nextMilestone?: { dueAt?: string | null } | null;
  }>,
) {
  const backlogWithoutOwner = backlogItems.find((item) => !item.productOwner);
  const backlogWithPendingCandidates = backlogItems.find((item) => item.pendingCandidatesCount > 0);
  const projectAwaitingFinalAcceptance = projectItems.find((item) => item.awaitingFinalAcceptance);
  const projectWithOverdueMilestone = projectItems.find((item) => {
    if (!item.nextMilestone?.dueAt) {
      return false;
    }

    return new Date(item.nextMilestone.dueAt).getTime() < Date.now();
  });

  return {
    backlogDetailHrefByCode: {
      ASSIGN_PRODUCT_OWNER: backlogWithoutOwner
        ? ROUTES.COMPANY.programBBacklogDetail(backlogWithoutOwner.id)
        : undefined,
      REVIEW_CANDIDATES: backlogWithPendingCandidates
        ? ROUTES.COMPANY.programBBacklogDetail(backlogWithPendingCandidates.id)
        : undefined,
    },
    projectDetailHrefByCode: {
      FINAL_ACCEPTANCE: projectAwaitingFinalAcceptance
        ? ROUTES.COMPANY.programBProjectDetail(projectAwaitingFinalAcceptance.id)
        : undefined,
      OVERDUE_MILESTONE: projectWithOverdueMilestone
        ? ROUTES.COMPANY.programBProjectDetail(projectWithOverdueMilestone.id)
        : undefined,
    },
  };
}

export function ProgramBCompanyDashboard() {
  const queryClient = useQueryClient();
  const organizationQuery = useOrganizationControllerGetMyOrganization({
    query: {
      retry: false,
    },
  });
  const organization = organizationQuery.data;
  const isOrganizationActive = organization?.status === OrganizationStatus.ACTIVE;
  const overviewQuery = useProgramBCompanyOverviewControllerGetOverview({
    query: {
      ...COMPANY_DASHBOARD_QUERY_OPTIONS,
      enabled: isOrganizationActive,
    },
  });
  const backlogSummaryQuery = useProgramBCompanyOverviewControllerGetBacklogSummary(
    { limit: PREVIEW_LIMIT },
    {
      query: {
        ...COMPANY_DASHBOARD_QUERY_OPTIONS,
        enabled: isOrganizationActive,
      },
    },
  );
  const projectSummaryQuery = useProgramBCompanyOverviewControllerGetProjectSummary(
    { limit: PREVIEW_LIMIT },
    {
      query: {
        ...COMPANY_DASHBOARD_QUERY_OPTIONS,
        enabled: isOrganizationActive,
      },
    },
  );

  const overview = overviewQuery.data;
  const backlogItems = backlogSummaryQuery.data?.items ?? [];
  const projectItems = projectSummaryQuery.data?.items ?? [];
  const pendingActionLinkContext = getPendingActionLinkContext(backlogItems, projectItems);
  const isRefreshing =
    overviewQuery.isFetching || backlogSummaryQuery.isFetching || projectSummaryQuery.isFetching;
  const hasPartialFailure =
    overviewQuery.isError || backlogSummaryQuery.isError || projectSummaryQuery.isError;

  const refreshDashboard = async () => {
    await invalidateProgramBCompanyWorkspace(queryClient);
  };

  let overviewContent: ReactNode;

  if (overviewQuery.isLoading && !overview) {
    overviewContent = renderMetricLoadingCards(OVERVIEW_METRIC_SKELETON_COUNT);
  } else if (overview) {
    overviewContent = renderMetricCards(overview);
  } else {
    overviewContent = <OverviewErrorState />;
  }

  if (organizationQuery.isLoading && !organization) {
    return (
      <CompanyDashboardStatus
        title={t`Loading company workspace`}
        description={t`Resolving your organization access before loading Program B company data.`}
      />
    );
  }

  if (organizationQuery.isError || !organization) {
    return (
      <CompanyDashboardStatus
        title={t`Company organization is unavailable`}
        description={t`We could not resolve the organization linked to your company account.`}
        icon={<TriangleAlert className="h-5 w-5" />}
        tone="danger"
      />
    );
  }

  if (!isOrganizationActive) {
    return (
      <div className="space-y-6">
        <section className="rounded-[1.75rem] border border-[#dfe7fa] bg-white/90 p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#1e58d5] uppercase">
            {t`Company workspace`}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#10213d]">
            {t`Program B company dashboard`}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#60718d]">
            {t`Program B company summary becomes available after your organization reaches the active state.`}
          </p>
        </section>

        <CompanyDashboardStatus
          title={t`Organization status: ${formatEnumLabel(organization.status)}`}
          description={t`Your company account is linked to an organization, but Program B company overview endpoints are only available for active organizations.`}
        />
      </div>
    );
  }

  let pendingActionsContent: ReactNode;

  if (overviewQuery.isLoading && !overview) {
    pendingActionsContent = (
      <div className="grid gap-4 xl:grid-cols-2">
        <CompanyDashboardLoadingCard />
        <CompanyDashboardLoadingCard />
      </div>
    );
  } else if (overview) {
    pendingActionsContent = (
      <PendingActionsSection actions={overview.pendingActions} context={pendingActionLinkContext} />
    );
  } else {
    pendingActionsContent = (
      <CompanyDashboardStatus
        title={t`Pending actions are unavailable`}
        description={t`We could not load the Program B action queues right now.`}
        icon={<TriangleAlert className="h-5 w-5" />}
        tone="danger"
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-[#dfe7fa] bg-white/90 p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#1e58d5] uppercase">
              {t`Company workspace`}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#10213d]">
              {t`Program B company dashboard`}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#60718d]">
              {t`Action queues, backlog movement, and project delivery status are summarized here so company users can move directly into the right Program B workspace.`}
            </p>
            <p className="mt-3 text-sm text-[#60718d]">
              {overview?.updatedAt
                ? t`Overview updated ${formatDateTime(overview.updatedAt)}`
                : t`Dashboard data refreshes automatically when you return from related Program B workspaces.`}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => void refreshDashboard()}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              {t`Refresh data`}
            </Button>
            <Button asChild>
              <Link href={ROUTES.COMPANY.PROGRAM_B_BACKLOG}>{t`Open Program B backlog`}</Link>
            </Button>
          </div>
        </div>
      </section>

      {hasPartialFailure ? (
        <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          <p className="font-semibold">{t`Some dashboard sections could not be refreshed.`}</p>
          <p className="mt-1 leading-7">
            {t`Available sections are still shown below, and you can refresh again without leaving the workspace.`}
          </p>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{overviewContent}</section>

      <CompanyDashboardSection
        title={t`Pending actions`}
        description={t`These queues need direct company attention and link into the relevant Program B workspace.`}
        action={
          <Button asChild variant="outline" size="sm">
            <Link href={ROUTES.COMPANY.PROGRAM_B_PROJECTS}>{t`Open project workspace`}</Link>
          </Button>
        }
      >
        {pendingActionsContent}
      </CompanyDashboardSection>

      <section className="grid gap-6 xl:grid-cols-2">
        <CompanyDashboardSection
          title={t`Backlog preview`}
          description={t`Recent organization-scoped Program B backlog items from the dedicated summary endpoint.`}
          action={
            <Button asChild variant="outline" size="sm">
              <Link href={ROUTES.COMPANY.PROGRAM_B_BACKLOG}>{t`Open backlog`}</Link>
            </Button>
          }
        >
          <CompanyDashboardPreviewState
            items={backlogItems}
            isError={backlogSummaryQuery.isError}
            isLoading={backlogSummaryQuery.isLoading}
            hasData={Boolean(backlogSummaryQuery.data)}
            renderItem={(item) => <BacklogPreviewCard key={item.id} item={item} />}
            emptyTitle={t`No backlog items yet`}
            emptyDescription={t`Once backlog work is created for this organization, the latest items will appear here.`}
            errorTitle={t`Unable to load backlog preview`}
            errorDescription={t`The organization backlog summary could not be loaded right now.`}
            errorIcon={<TriangleAlert className="h-5 w-5" />}
          />
        </CompanyDashboardSection>

        <CompanyDashboardSection
          title={t`Project preview`}
          description={t`Current Program B delivery from the dedicated company project summary endpoint.`}
          action={
            <Button asChild variant="outline" size="sm">
              <Link href={ROUTES.COMPANY.PROGRAM_B_PROJECTS}>{t`Open projects`}</Link>
            </Button>
          }
        >
          <CompanyDashboardPreviewState
            items={projectItems}
            isError={projectSummaryQuery.isError}
            isLoading={projectSummaryQuery.isLoading}
            hasData={Boolean(projectSummaryQuery.data)}
            renderItem={(item) => <ProjectPreviewCard key={item.id} item={item} />}
            emptyTitle={t`No active projects yet`}
            emptyDescription={t`Projects created from accepted Program B candidates will show up here.`}
            errorTitle={t`Unable to load project preview`}
            errorDescription={t`The company project summary could not be loaded right now.`}
            errorIcon={<TriangleAlert className="h-5 w-5" />}
          />
        </CompanyDashboardSection>
      </section>
    </div>
  );
}
