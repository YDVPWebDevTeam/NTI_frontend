'use client';

import { t } from '@lingui/core/macro';
import Link from 'next/link';
import { useDeferredValue, useState } from 'react';

import {
  type ProgramBBacklogControllerListMyOrder,
  type ProgramBBacklogControllerListMySort,
  useProgramBBacklogControllerListMy,
} from 'lib/api';
import { Input } from 'components/shadcn';
import { ROUTES } from 'lib/constants';
import { normalizeUnknownText } from 'lib/student-dashboard/normalizers';

export default function CompanyProgramBBacklogPage() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<ProgramBBacklogControllerListMySort>('updatedAt');
  const [order, setOrder] = useState<ProgramBBacklogControllerListMyOrder>('desc');
  const deferredQuery = useDeferredValue(query);
  const backlogQuery = useProgramBBacklogControllerListMy({
    q: deferredQuery || undefined,
    page,
    limit: 12,
    sort,
    order,
  });

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-[#dfe7fa] bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <h1 className="text-2xl font-semibold text-[#10213d]">{t`Company Program B backlog`}</h1>
        <p className="mt-2 text-sm text-[#60718d]">
          {t`Published and draft backlog items scoped to the authenticated organization.`}
        </p>
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

      <div className="grid gap-4 lg:grid-cols-2">
        {(backlogQuery.data?.data ?? []).map((item) => (
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
              <span className="rounded-full bg-[#edf3ff] px-3 py-1 font-medium text-[#0f4fb8]">
                {item.status}
              </span>
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
    </div>
  );
}
