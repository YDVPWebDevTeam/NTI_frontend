'use client';

import { t } from '@lingui/core/macro';
import Link from 'next/link';
import { useDeferredValue, useState } from 'react';

import {
  type ProgramBBacklogControllerListPublishedOrder,
  type ProgramBBacklogControllerListPublishedSort,
  useProgramBBacklogControllerListPublished,
} from 'lib/api';
import { Input } from 'components/shadcn';
import {
  StudentPageShell,
  StudentSectionCard,
} from 'components/student-dashboard/page-shell-primitives';
import { ROUTES } from 'lib/constants';
import { normalizeUnknownText } from 'lib/student-dashboard/normalizers';

export function StudentProgramBBacklogPage() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<ProgramBBacklogControllerListPublishedSort>('updatedAt');
  const [order, setOrder] = useState<ProgramBBacklogControllerListPublishedOrder>('desc');
  const deferredQuery = useDeferredValue(query);

  const backlogQuery = useProgramBBacklogControllerListPublished(
    {
      q: deferredQuery || undefined,
      page,
      limit: 12,
      sort,
      order,
    },
    {
      query: { enabled: true },
    },
  );

  return (
    <StudentPageShell
      title={t`Program B backlog`}
      description={t`Searchable, sortable, paginated list of published Program B opportunities backed by generated backlog hooks.`}
    >
      <StudentSectionCard
        title={t`Filters`}
        description={t`Filtering is local UI state mapped into generated query params.`}
      >
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder={t`Search title or description`}
          />
          <select
            className="border-border bg-card rounded-md border px-3 py-2 text-sm"
            value={sort}
            onChange={(event) =>
              setSort(event.target.value as ProgramBBacklogControllerListPublishedSort)
            }
          >
            <option value="updatedAt">{t`Updated at`}</option>
            <option value="createdAt">{t`Created at`}</option>
            <option value="budget">{t`Budget`}</option>
            <option value="title">{t`Title`}</option>
          </select>
          <select
            className="border-border bg-card rounded-md border px-3 py-2 text-sm"
            value={order}
            onChange={(event) =>
              setOrder(event.target.value as ProgramBBacklogControllerListPublishedOrder)
            }
          >
            <option value="desc">{t`Descending`}</option>
            <option value="asc">{t`Ascending`}</option>
          </select>
        </div>
      </StudentSectionCard>

      <div className="grid gap-4 lg:grid-cols-2">
        {(backlogQuery.data?.data ?? []).map((item) => (
          <StudentSectionCard
            key={item.id}
            title={normalizeUnknownText(item.title) ?? t`Untitled backlog item`}
            description={normalizeUnknownText(item.description) ?? t`No description provided.`}
          >
            <div className="text-muted-foreground space-y-3 text-sm">
              <p>
                {t`Status:`} <span className="text-foreground font-medium">{item.status}</span>
              </p>
              <p>
                {t`Budget:`}{' '}
                <span className="text-foreground font-medium">
                  {normalizeUnknownText(item.budget) ?? t`Not specified`}
                </span>
              </p>
              <Link
                href={ROUTES.STUDENT.programBBacklogDetail(item.id)}
                className="border-border text-primary hover:border-primary inline-flex rounded-md border px-3 py-2 text-sm font-medium transition"
              >
                {t`Open detail`}
              </Link>
            </div>
          </StudentSectionCard>
        ))}
      </div>

      <StudentSectionCard title={t`Pagination`}>
        <div className="text-muted-foreground flex items-center justify-between text-sm">
          <span>
            {t`Page`} {backlogQuery.data?.meta.page ?? page} {t`of`}{' '}
            {backlogQuery.data?.meta.totalPages ?? 1}
          </span>
          <div className="flex gap-2">
            <button
              className="border-border rounded-md border px-3 py-2 disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              {t`Previous`}
            </button>
            <button
              className="border-border rounded-md border px-3 py-2 disabled:opacity-40"
              disabled={page >= (backlogQuery.data?.meta.totalPages ?? 1)}
              onClick={() => setPage((current) => current + 1)}
            >
              {t`Next`}
            </button>
          </div>
        </div>
      </StudentSectionCard>
    </StudentPageShell>
  );
}
