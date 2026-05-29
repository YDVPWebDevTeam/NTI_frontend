'use client';

import { t } from '@lingui/core/macro';
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  TriangleAlert,
  Users,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';

import type {
  CompanyBacklogSummaryItemDto,
  CompanyProjectSummaryItemDto,
  ProgramBCompanyOverviewDto,
  ProgramBCompanyPendingActionDto,
} from 'lib/api';
import { CompanyProjectSummaryItemDtoStatus, ProgramBCompanyPendingActionDtoCode } from 'lib/api';
import { formatDateTime } from 'lib/date';
import { Button } from 'components/shadcn';
import { ROUTES } from 'lib/constants';
import { normalizeUnknownText } from 'lib/student-dashboard/normalizers';
import { formatEnumLabel } from 'lib/utils';
import {
  CompanyDashboardLoadingCard,
  CompanyDashboardMetricCard,
  CompanyStatusBadge,
  CompanyDashboardStatus,
} from './program-b-company-dashboard-primitives';

const pendingActionPresentationMap = {
  [ProgramBCompanyPendingActionDtoCode.ASSIGN_PRODUCT_OWNER]: {
    title: t`Assign product owners`,
    description: t`Backlog items are missing ownership and need a responsible company contact.`,
    cta: t`Open backlog`,
    href: ROUTES.COMPANY.PROGRAM_B_BACKLOG,
  },
  [ProgramBCompanyPendingActionDtoCode.REVIEW_CANDIDATES]: {
    title: t`Review candidate teams`,
    description: t`Submitted candidates are waiting for shortlist or acceptance decisions.`,
    cta: t`Review backlog candidates`,
    href: ROUTES.COMPANY.PROGRAM_B_BACKLOG,
  },
  [ProgramBCompanyPendingActionDtoCode.FINAL_ACCEPTANCE]: {
    title: t`Record final acceptance`,
    description: t`Completed delivery is waiting for final company acceptance in the project workspace.`,
    cta: t`Open projects`,
    href: ROUTES.COMPANY.PROGRAM_B_PROJECTS,
  },
  [ProgramBCompanyPendingActionDtoCode.OVERDUE_MILESTONE]: {
    title: t`Resolve overdue milestones`,
    description: t`Active projects contain milestones that have moved past their expected due date.`,
    cta: t`Inspect projects`,
    href: ROUTES.COMPANY.PROGRAM_B_PROJECTS,
  },
} satisfies Record<
  ProgramBCompanyPendingActionDtoCode,
  {
    title: string;
    description: string;
    cta: string;
    href: string;
  }
>;

type PendingActionLinkContext = {
  backlogDetailHrefByCode: Partial<Record<ProgramBCompanyPendingActionDtoCode, string>>;
  projectDetailHrefByCode: Partial<Record<ProgramBCompanyPendingActionDtoCode, string>>;
};

function resolvePendingActionHref(
  code: ProgramBCompanyPendingActionDtoCode,
  context: PendingActionLinkContext,
) {
  if (
    code === ProgramBCompanyPendingActionDtoCode.ASSIGN_PRODUCT_OWNER ||
    code === ProgramBCompanyPendingActionDtoCode.REVIEW_CANDIDATES
  ) {
    return context.backlogDetailHrefByCode[code] ?? pendingActionPresentationMap[code].href;
  }

  return context.projectDetailHrefByCode[code] ?? pendingActionPresentationMap[code].href;
}

export function renderMetricCards(overview: ProgramBCompanyOverviewDto) {
  const metrics: Array<{
    label: string;
    value: string;
    hint: string;
    icon: LucideIcon;
  }> = [
    {
      label: t`Backlog items`,
      value: String(overview.backlog.total),
      hint: t`${overview.backlog.withoutProductOwner} without product owner · ${overview.backlog.published} published`,
      icon: ClipboardList,
    },
    {
      label: t`Candidates`,
      value: String(overview.candidates.pendingReview),
      hint: t`${overview.candidates.submitted} submitted · ${overview.candidates.shortlisted} shortlisted`,
      icon: Users,
    },
    {
      label: t`Projects`,
      value: String(overview.projects.total),
      hint: t`${overview.projects.awaitingFinalAcceptance} awaiting final acceptance · ${overview.projects.overdueMilestones} overdue milestones`,
      icon: FolderKanban,
    },
    {
      label: t`Pending actions`,
      value: String(overview.pendingActions.length),
      hint: t`Operational queues that still need company-side decisions.`,
      icon: BriefcaseBusiness,
    },
  ];

  return metrics.map((metric) => (
    <CompanyDashboardMetricCard
      key={metric.label}
      label={metric.label}
      value={metric.value}
      hint={metric.hint}
      icon={<metric.icon className="h-5 w-5" />}
    />
  ));
}

export function renderMetricLoadingCards(count: number) {
  return Array.from({ length: count }, (_, index) => <CompanyDashboardLoadingCard key={index} />);
}

export function PendingActionsSection({
  actions,
  context,
}: {
  actions: ProgramBCompanyPendingActionDto[];
  context: PendingActionLinkContext;
}) {
  if (!actions.length) {
    return (
      <CompanyDashboardStatus
        title={t`No pending actions right now`}
        description={t`The current Program B company workflow does not have any open action queues.`}
        icon={<CheckCircle2 className="h-5 w-5" />}
      />
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {actions.map((action) => {
        const presentation = pendingActionPresentationMap[action.code] ?? {
          title: formatEnumLabel(action.code),
          description: t`This workspace needs attention.`,
          cta: t`Open workspace`,
          href: ROUTES.COMPANY.DASHBOARD,
        };
        const href = resolvePendingActionHref(action.code, context);

        return (
          <div
            key={action.code}
            className="rounded-[1.5rem] border border-[#dfe7fa] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="max-w-xl">
                <p className="text-lg font-semibold text-[#10213d]">{presentation.title}</p>
                <p className="mt-2 text-sm leading-7 text-[#60718d]">{presentation.description}</p>
              </div>
              <span className="rounded-full bg-[#e8f0ff] px-3 py-1 text-sm font-semibold text-[#1e58d5]">
                {action.count}
              </span>
            </div>
            <div className="mt-5">
              <Button asChild size="sm">
                <Link href={href}>
                  {presentation.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function BacklogPreviewCard({ item }: { item: CompanyBacklogSummaryItemDto }) {
  return (
    <div className="rounded-2xl border border-[#dfe7fa] bg-[#f8fbff] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-[#10213d]">
            {normalizeUnknownText(item.title) ?? t`Untitled backlog item`}
          </p>
          <p className="mt-1 text-sm text-[#60718d]">
            {item.productOwner?.fullName
              ? t`Product owner: ${item.productOwner.fullName}`
              : t`Product owner is not assigned yet.`}
          </p>
        </div>
        <CompanyStatusBadge status={item.status} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#60718d]">
        <span className="rounded-full bg-white px-3 py-1 ring-1 ring-[#d7e3ff]">
          {t`${item.pendingCandidatesCount} pending reviews`}
        </span>
        <span className="rounded-full bg-white px-3 py-1 ring-1 ring-[#d7e3ff]">
          {t`${item.candidatesCount} total candidates`}
        </span>
        <span className="rounded-full bg-white px-3 py-1 ring-1 ring-[#d7e3ff]">
          {t`Updated ${formatDateTime(item.updatedAt)}`}
        </span>
      </div>

      <div className="mt-4">
        <Link
          href={ROUTES.COMPANY.programBBacklogDetail(item.id)}
          className="inline-flex items-center text-sm font-medium text-[#1e58d5]"
        >
          {t`Open backlog detail`}
        </Link>
      </div>
    </div>
  );
}

export function ProjectPreviewCard({ item }: { item: CompanyProjectSummaryItemDto }) {
  const isClosedProject = item.status === CompanyProjectSummaryItemDtoStatus.CLOSED;

  return (
    <div
      className={`rounded-2xl border p-4 ${
        isClosedProject
          ? 'border-rose-200 bg-[linear-gradient(180deg,#fff7f7_0%,#fff1f1_100%)]'
          : 'border-[#dfe7fa] bg-[#f8fbff]'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-[#10213d]">
            {normalizeUnknownText(item.title) ?? t`Project`}
          </p>
          <p className="mt-1 text-sm text-[#60718d]">{item.teamName}</p>
        </div>
        <CompanyStatusBadge status={item.status} />
      </div>

      {isClosedProject ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-white/80 px-3 py-2 text-xs font-medium text-rose-700">
          {t`This project is closed and now read-only.`}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#60718d]">
        {item.awaitingFinalAcceptance ? (
          <span className="rounded-full bg-[#fff4d6] px-3 py-1 text-[#9a6500] ring-1 ring-[#f4d27b]">
            {t`Awaiting final acceptance`}
          </span>
        ) : null}

        <span className="rounded-full bg-white px-3 py-1 ring-1 ring-[#d7e3ff]">
          {item.nextMilestone?.title
            ? t`Next milestone: ${item.nextMilestone.title}`
            : t`No upcoming milestone`}
        </span>
        <span className="rounded-full bg-white px-3 py-1 ring-1 ring-[#d7e3ff]">
          {t`Updated ${formatDateTime(item.updatedAt)}`}
        </span>
      </div>

      <p className="mt-4 text-sm text-[#60718d]">
        {item.mentor?.fullName
          ? t`Mentor: ${item.mentor.fullName}`
          : t`Mentor is not assigned yet.`}
      </p>

      <div className="mt-4">
        <Link
          href={ROUTES.COMPANY.programBProjectDetail(item.id)}
          className="inline-flex items-center text-sm font-medium text-[#1e58d5]"
        >
          {t`Open project detail`}
        </Link>
      </div>
    </div>
  );
}

export function OverviewErrorState() {
  return (
    <div className="md:col-span-2 xl:col-span-4">
      <CompanyDashboardStatus
        title={t`Unable to load overview metrics`}
        description={t`The summary counts are unavailable right now, but the dedicated backlog and project sections can still load independently.`}
        icon={<TriangleAlert className="h-5 w-5" />}
        tone="danger"
      />
    </div>
  );
}
