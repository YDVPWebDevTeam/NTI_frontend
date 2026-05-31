'use client';

import { t } from '@lingui/core/macro';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDeferredValue, useState } from 'react';
import { toast } from 'sonner';

import {
  type ProgramBBacklogControllerListMyOrder,
  type ProgramBBacklogControllerListMySort,
  useProgramBBacklogControllerCreate,
  useProgramBBacklogControllerListMy,
} from 'lib/api';
import { invalidateProgramBCompanyWorkspace } from 'lib/api-client/program-b-company';
import {
  CompanyDashboardLoadingCard,
  CompanyStatusBadge,
  CompanyDashboardStatus,
} from 'components/company-dashboard/program-b-company-dashboard-primitives';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Textarea,
} from 'components/shadcn';
import { ROUTES } from 'lib/constants';
import { normalizeUnknownText } from 'lib/student-dashboard/normalizers';

export default function CompanyProgramBBacklogPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<ProgramBBacklogControllerListMySort>('updatedAt');
  const [order, setOrder] = useState<ProgramBBacklogControllerListMyOrder>('desc');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [newExpectedOutcomes, setNewExpectedOutcomes] = useState('');
  const createBacklog = useProgramBBacklogControllerCreate();
  const deferredQuery = useDeferredValue(query);
  const backlogQuery = useProgramBBacklogControllerListMy({
    q: deferredQuery || undefined,
    page,
    limit: 12,
    sort,
    order,
  });
  const backlogItems = backlogQuery.data?.data ?? [];

  const resetCreateForm = () => {
    setNewTitle('');
    setNewDescription('');
    setNewBudget('');
    setNewExpectedOutcomes('');
  };

  const handleCreate = async () => {
    const trimmedBudget = newBudget.trim();
    const parsedBudget = trimmedBudget === '' ? undefined : Number(trimmedBudget);

    if (parsedBudget != null && (Number.isNaN(parsedBudget) || parsedBudget < 0)) {
      toast.error(t`Budget must be a non-negative number.`);

      return;
    }

    try {
      const created = await createBacklog.mutateAsync({
        data: {
          title: newTitle.trim() || undefined,
          description: newDescription.trim() || undefined,
          budget: parsedBudget,
          expectedOutcomes: newExpectedOutcomes.trim() || undefined,
        },
      });

      toast.success(t`Backlog item created.`);
      setIsCreateOpen(false);
      resetCreateForm();
      await invalidateProgramBCompanyWorkspace(queryClient, {});
      router.push(ROUTES.COMPANY.programBBacklogDetail(created.id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to create backlog item.`);
    }
  };

  let backlogContent;

  if (backlogQuery.isLoading && !backlogQuery.data) {
    backlogContent = (
      <div className="grid gap-4 lg:grid-cols-2">
        <CompanyDashboardLoadingCard />
        <CompanyDashboardLoadingCard />
      </div>
    );
  } else if (backlogQuery.isError && !backlogQuery.data) {
    backlogContent = (
      <CompanyDashboardStatus
        title={t`Unable to load company backlog`}
        description={t`The Program B backlog list could not be loaded right now.`}
        tone="danger"
      />
    );
  } else if (backlogItems.length === 0) {
    backlogContent = (
      <CompanyDashboardStatus
        title={t`No backlog items found`}
        description={
          deferredQuery
            ? t`Try adjusting the search phrase or filters to find another backlog item.`
            : t`Backlog items for your organization will appear here once Program B work is created.`
        }
      />
    );
  } else {
    backlogContent = (
      <div className="grid gap-4 lg:grid-cols-2">
        {backlogItems.map((item) => (
          <article
            key={item.id}
            className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
          >
            <p className="font-semibold text-[#10213d]">
              {normalizeUnknownText(item.title) ?? t`Untitled backlog item`}
            </p>
            <p className="mt-2 text-sm leading-7 text-[#60718d]">
              {normalizeUnknownText(item.description) ?? t`No description provided.`}
            </p>
            <div className="mt-4 flex items-center justify-between gap-3 text-sm">
              <CompanyStatusBadge status={item.status} />
              <Link
                href={ROUTES.COMPANY.programBBacklogDetail(item.id)}
                className="font-medium text-[#1e58d5]"
              >
                {t`Open detail`}
              </Link>
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-[#dfe7fa] bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-[#10213d]">{t`Company Program B backlog`}</h1>
            <p className="mt-2 text-sm text-[#60718d]">
              {t`Published and draft backlog items scoped to the authenticated organization.`}
            </p>
          </div>
          <Button type="button" onClick={() => setIsCreateOpen(true)}>
            {t`New backlog item`}
          </Button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder={t`Search backlog items`}
          />
          <select
            className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm"
            value={sort}
            onChange={(event) => setSort(event.target.value as ProgramBBacklogControllerListMySort)}
          >
            <option value="updatedAt">{t`Updated at`}</option>
            <option value="createdAt">{t`Created at`}</option>
            <option value="budget">{t`Budget`}</option>
            <option value="title">{t`Title`}</option>
          </select>
          <select
            className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm"
            value={order}
            onChange={(event) =>
              setOrder(event.target.value as ProgramBBacklogControllerListMyOrder)
            }
          >
            <option value="desc">{t`Descending`}</option>
            <option value="asc">{t`Ascending`}</option>
          </select>
        </div>
      </section>

      {backlogContent}

      <section className="flex items-center justify-between rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <span className="text-sm text-[#60718d]">
          {t`Page`} {backlogQuery.data?.meta.page ?? page} {t`of`}{' '}
          {backlogQuery.data?.meta.totalPages ?? 1}
        </span>
        <div className="flex gap-2">
          <button
            className="rounded-md border border-black/10 px-3 py-2 text-sm disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            {t`Previous`}
          </button>
          <button
            className="rounded-md border border-black/10 px-3 py-2 text-sm disabled:opacity-40"
            disabled={page >= (backlogQuery.data?.meta.totalPages ?? 1)}
            onClick={() => setPage((current) => current + 1)}
          >
            {t`Next`}
          </button>
        </div>
      </section>

      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            resetCreateForm();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t`New backlog item`}</DialogTitle>
            <DialogDescription>
              {t`Create a draft backlog item. You can publish it to students once the details are ready.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-backlog-title">{t`Title`}</Label>
              <Input
                id="new-backlog-title"
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-backlog-description">{t`Description`}</Label>
              <Textarea
                id="new-backlog-description"
                rows={4}
                value={newDescription}
                onChange={(event) => setNewDescription(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-backlog-budget">{t`Budget`}</Label>
              <Input
                id="new-backlog-budget"
                type="number"
                min={0}
                value={newBudget}
                onChange={(event) => setNewBudget(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-backlog-outcomes">{t`Expected outcomes`}</Label>
              <Textarea
                id="new-backlog-outcomes"
                rows={3}
                value={newExpectedOutcomes}
                onChange={(event) => setNewExpectedOutcomes(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              {t`Cancel`}
            </Button>
            <Button
              type="button"
              disabled={createBacklog.isPending}
              onClick={() => void handleCreate()}
            >
              {createBacklog.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t`Create`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
