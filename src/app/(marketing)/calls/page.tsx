import { msg } from '@lingui/core/macro';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { LandingAuthActions } from 'components/layout';
import {
  ApplicationsControllerListActivePublicCallsType,
  applicationsControllerListActivePublicCalls,
  type PublicCallDto,
} from 'lib/api';
import { ROUTES } from 'lib/constants';
import { getServerI18n } from 'lib/i18n/server-i18n';
import { getRequestLocale } from 'lib/i18n/server-locale';

const ACTIVE_CALLS_LIMIT = 12;

type CallsPageProps = {
  searchParams: Promise<{
    page?: string | string[];
  }>;
};

type ActiveCallsState = {
  calls: PublicCallDto[];
  hasError: boolean;
  totalPages: number;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const serverI18n = await getServerI18n(locale);

  return {
    title: `${serverI18n._(msg`Calls & Deadlines`)} | NTI`,
    description: serverI18n._(
      msg`Explore active program calls, review important dates, and prepare your application before the deadline.`,
    ),
  };
}

function getPaginationClassName(isDisabled: boolean): string {
  const baseClassName =
    'inline-flex min-h-12 min-w-28 items-center justify-center rounded-xl border px-5 py-3 text-sm font-semibold transition-colors';

  if (isDisabled) {
    return `${baseClassName} cursor-not-allowed border-border bg-muted text-muted-foreground/60`;
  }

  return `${baseClassName} border-border bg-card text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`;
}

function parsePage(value: string | string[] | undefined): number {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsedValue = Number.parseInt(rawValue ?? '1', 10);

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return 1;
  }

  return parsedValue;
}

function getCallsPageHref(page: number): string {
  if (page <= 1) {
    return ROUTES.CALLS;
  }

  const searchParams = new URLSearchParams({
    page: String(page),
  });

  return `${ROUTES.CALLS}?${searchParams.toString()}`;
}

async function getActiveCalls(page: number): Promise<ActiveCallsState> {
  try {
    const response = await applicationsControllerListActivePublicCalls({
      page,
      limit: ACTIVE_CALLS_LIMIT,
      sort: 'closesAt',
      order: 'asc',
      type: ApplicationsControllerListActivePublicCallsType.PROGRAM_B,
    });

    return {
      calls: response.data,
      hasError: false,
      totalPages: response.meta.totalPages,
    };
  } catch {
    return {
      calls: [],
      hasError: true,
      totalPages: 0,
    };
  }
}

function formatCallDate(value: string | null | undefined, locale: string): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const dateLocale = locale.startsWith('sk') ? 'sk-SK' : 'en-US';

  return new Intl.DateTimeFormat(dateLocale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export default async function CallsPage({ searchParams }: CallsPageProps) {
  const [locale, params] = await Promise.all([getRequestLocale(), searchParams]);

  const currentPage = parsePage(params.page);

  const [serverI18n, activeCallsState] = await Promise.all([
    getServerI18n(locale),
    getActiveCalls(currentPage),
  ]);

  const { calls, hasError, totalPages } = activeCallsState;

  if (!hasError && totalPages > 0 && currentPage > totalPages) {
    redirect(getCallsPageHref(totalPages));
  }

  const previousPageHref = getCallsPageHref(Math.max(1, currentPage - 1));

  const nextPageHref = getCallsPageHref(Math.min(totalPages, currentPage + 1));

  return (
    <main className="min-h-screen flex-1 pt-20">
      <section className="px-4 py-14 sm:px-6 sm:py-16 lg:px-12 lg:py-20">
        <div className="mx-auto w-full max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-primary text-sm font-semibold tracking-[0.16em] uppercase">
              {serverI18n._(msg`Program B · Live practice`)}
            </p>

            <h1 className="text-foreground mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              {serverI18n._(msg`Open calls & deadlines`)}
            </h1>

            <p className="text-muted-foreground mt-5 text-lg leading-8">
              {serverI18n._(
                msg`These are open Program B challenges from partner companies. Review the deadlines and register your team to apply. Program A runs on a rolling quarterly basis — register to be notified when a round opens.`,
              )}
            </p>
          </div>

          <section id="calls-results" className="mt-10 scroll-mt-24" aria-live="polite">
            {hasError ? (
              <div className="border-destructive/30 bg-destructive/5 rounded-3xl border p-8">
                <h2 className="text-destructive text-lg font-semibold">
                  {serverI18n._(msg`Calls could not be loaded`)}
                </h2>

                <p className="text-destructive/90 mt-2 text-sm leading-7">
                  {serverI18n._(
                    msg`The active program calls are temporarily unavailable. Please try again later.`,
                  )}
                </p>
              </div>
            ) : null}

            {!hasError && calls.length === 0 ? (
              <div className="border-border bg-card rounded-3xl border p-8 shadow-sm">
                <h2 className="text-foreground text-lg font-semibold">
                  {serverI18n._(msg`No open calls right now`)}
                </h2>

                <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-7">
                  {serverI18n._(
                    msg`There are no open Program B challenges at the moment. Explore the programs to learn how they work, or register to be notified when the next call opens.`,
                  )}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={ROUTES.PROGRAMS}
                    className="border-border bg-card text-foreground hover:bg-muted focus-visible:ring-ring inline-flex min-h-12 items-center justify-center rounded-xl border px-5 py-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    {serverI18n._(msg`Explore the programs`)}
                  </Link>

                  <Link
                    href={ROUTES.AUTH.REGISTER_SELECT}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex min-h-12 items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    {serverI18n._(msg`Create an account`)}
                  </Link>
                </div>
              </div>
            ) : null}

            {!hasError && calls.length > 0 ? (
              <div className="grid min-h-[360px] auto-rows-fr items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
                {calls.map((call) => {
                  const opensAt = formatCallDate(call.opensAt, locale);

                  const closesAt = formatCallDate(call.closesAt, locale);

                  return (
                    <article
                      key={call.id}
                      className="border-border bg-card flex h-full min-h-[360px] flex-col rounded-3xl border p-7 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="flex flex-1 flex-col">
                        <div>
                          <span className="bg-accent text-primary inline-flex rounded-full px-3 py-1 text-xs font-semibold">
                            {serverI18n._(msg`Program B`)}
                          </span>

                          <h2 className="text-foreground mt-5 text-xl leading-8 font-semibold">
                            {call.title}
                          </h2>
                        </div>

                        <dl className="border-border mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-6">
                          <div>
                            <dt className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                              {serverI18n._(msg`Opens`)}
                            </dt>

                            <dd className="text-foreground mt-2 text-sm font-medium">
                              {opensAt ?? serverI18n._(msg`Not specified`)}
                            </dd>
                          </div>

                          <div>
                            <dt className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                              {serverI18n._(msg`Deadline`)}
                            </dt>

                            <dd className="text-foreground mt-2 text-sm font-medium">
                              {closesAt ?? serverI18n._(msg`Not specified`)}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      <div className="mt-auto pt-9">
                        <LandingAuthActions
                          className="w-full"
                          authenticatedClassName="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-foreground px-5 py-3 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          loadingFallback={
                            <div className="bg-muted h-12 w-full animate-pulse rounded-xl" />
                          }
                          unauthenticatedActions={[
                            {
                              href: ROUTES.AUTH.REGISTER_SELECT,
                              label: serverI18n._(msg`Register to apply`),
                              className:
                                'inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                            },
                          ]}
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : null}

            {!hasError && totalPages > 1 ? (
              <nav
                className="mt-10 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:gap-5"
                aria-label={serverI18n._(msg`Calls pagination`)}
              >
                <div className="flex justify-start">
                  {currentPage > 1 ? (
                    <Link
                      href={previousPageHref}
                      scroll={false}
                      className={getPaginationClassName(false)}
                      aria-label={serverI18n._(msg`Go to previous calls page`)}
                    >
                      {serverI18n._(msg`Previous`)}
                    </Link>
                  ) : (
                    <span className={getPaginationClassName(true)} aria-disabled="true">
                      {serverI18n._(msg`Previous`)}
                    </span>
                  )}
                </div>

                <span className="text-muted-foreground text-center text-sm font-medium whitespace-nowrap">
                  {serverI18n._(msg`Page ${currentPage} of ${totalPages}`)}
                </span>

                <div className="flex justify-end">
                  {currentPage < totalPages ? (
                    <Link
                      href={nextPageHref}
                      scroll={false}
                      className={getPaginationClassName(false)}
                      aria-label={serverI18n._(msg`Go to next calls page`)}
                    >
                      {serverI18n._(msg`Next`)}
                    </Link>
                  ) : (
                    <span className={getPaginationClassName(true)} aria-disabled="true">
                      {serverI18n._(msg`Next`)}
                    </span>
                  )}
                </div>
              </nav>
            ) : null}
          </section>
        </div>
      </section>
    </main>
  );
}
