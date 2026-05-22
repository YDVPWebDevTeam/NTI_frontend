'use client';

import Link from 'next/link';
import { useDeferredValue, useState } from 'react';

import {
  type ProgramBBacklogControllerListPublishedOrder,
  type ProgramBBacklogControllerListPublishedSort,
  UserRole,
  useProgramBBacklogControllerListPublished,
} from 'lib/api';
import { Input } from 'components/shadcn';
import {
  StudentPageShell,
  StudentSectionCard,
  StudentStatusCard,
} from 'components/student-dashboard/page-shell';
import { ROUTES } from 'lib/constants';
import { normalizeUnknownText } from 'lib/student-dashboard/normalizers';
import { useAuthenticatedUser } from 'lib/student-dashboard/use-authenticated-user';

export default function ProgramBBacklogPage() {
  const { isLoading } = useAuthenticatedUser([UserRole.STUDENT]);
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
      query: {
        enabled: !isLoading,
      },
    },
  );

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4">
        <StudentStatusCard
          title="Loading Program B backlog"
          description="Resolving your student session and backlog filters."
        />
      </main>
    );
  }

  return (
    <StudentPageShell
      title="Program B backlog"
      description="Searchable, sortable, paginated list of published Program B opportunities backed by generated backlog hooks."
    >
      <StudentSectionCard
        title="Filters"
        description="Filtering is local UI state mapped into generated query params."
      >
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search title or description"
          />
          <select
            className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm"
            value={sort}
            onChange={(event) =>
              setSort(event.target.value as ProgramBBacklogControllerListPublishedSort)
            }
          >
            <option value="updatedAt">Updated at</option>
            <option value="createdAt">Created at</option>
            <option value="budget">Budget</option>
            <option value="title">Title</option>
          </select>
          <select
            className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm"
            value={order}
            onChange={(event) =>
              setOrder(event.target.value as ProgramBBacklogControllerListPublishedOrder)
            }
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </StudentSectionCard>

      <div className="grid gap-4 lg:grid-cols-2">
        {(backlogQuery.data?.data ?? []).map((item) => (
          <StudentSectionCard
            key={item.id}
            title={normalizeUnknownText(item.title) ?? 'Untitled backlog item'}
            description={normalizeUnknownText(item.description) ?? 'No description provided.'}
          >
            <div className="space-y-3 text-sm text-neutral-700">
              <p>
                Status: <span className="font-medium text-neutral-950">{item.status}</span>
              </p>
              <p>
                Budget:{' '}
                <span className="font-medium text-neutral-950">
                  {normalizeUnknownText(item.budget) ?? 'Not specified'}
                </span>
              </p>
              <Link
                href={ROUTES.programBBacklogDetail(item.id)}
                className="inline-flex rounded-md border border-black/10 px-3 py-2 text-sm font-medium text-[#1e58d5] transition hover:border-[#1e58d5]"
              >
                Open detail
              </Link>
            </div>
          </StudentSectionCard>
        ))}
      </div>

      <StudentSectionCard title="Pagination">
        <div className="flex items-center justify-between text-sm text-neutral-700">
          <span>
            Page {backlogQuery.data?.meta.page ?? page} of {backlogQuery.data?.meta.totalPages ?? 1}
          </span>
          <div className="flex gap-2">
            <button
              className="rounded-md border border-black/10 px-3 py-2 disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </button>
            <button
              className="rounded-md border border-black/10 px-3 py-2 disabled:opacity-40"
              disabled={page >= (backlogQuery.data?.meta.totalPages ?? 1)}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </StudentSectionCard>
    </StudentPageShell>
  );
}
