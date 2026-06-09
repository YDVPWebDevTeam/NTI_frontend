'use client';

import { t } from '@lingui/core/macro';
import {
  AtSign,
  CalendarClock,
  ClipboardCheck,
  FileSpreadsheet,
  FolderKanban,
  GraduationCap,
  LayoutGrid,
  LogOut,
  Mail,
  Menu,
  ShieldCheck,
  UserCog,
  Users2,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

import { AdminBrandBlock } from 'components/layout/admin-brand-block';
import { PageSectionHeader } from 'components/layout/page-section-header';
import { LanguageSwitcher } from 'components/i18n/language-switcher';
import { Button } from 'components/shadcn';
import {
  clearAdminApiCache,
  logoutAdmin,
  setStoredAdminPasswordChangeRequired,
} from 'lib/api-client/admin/auth';
import { ROUTES } from 'lib/constants';
import { isApiRequestError, isAuthErrorStatus } from 'lib/api-client/openapi-runtime/client';
import { cn } from 'lib/utils';

import type { AdminNavItem, AdminSessionUser } from './types';
import { ADMIN_NAV_ITEMS, getAdminNavLabel, getAdminPageTitle } from './utils';

type AdminShellProps = {
  children: React.ReactNode;
  user: AdminSessionUser;
};

const NAV_ICON_BY_HREF: Record<string, React.ReactNode> = {
  [ROUTES.ADMIN.ROOT]: <LayoutGrid className="h-4 w-4" />,
  [ROUTES.ADMIN.MODERATION]: <ClipboardCheck className="h-4 w-4" />,
  [ROUTES.ADMIN.CALLS]: <CalendarClock className="h-4 w-4" />,
  [ROUTES.ADMIN.PROGRAM_B_PROJECTS]: <FolderKanban className="h-4 w-4" />,
  [ROUTES.ADMIN.REPORTS]: <FileSpreadsheet className="h-4 w-4" />,
  [ROUTES.ADMIN.USERS]: <Users2 className="h-4 w-4" />,
  [ROUTES.ADMIN.ACADEMIC_STRUCTURE]: <GraduationCap className="h-4 w-4" />,
  [ROUTES.ADMIN.ORGANIZATIONS]: <ShieldCheck className="h-4 w-4" />,
  [ROUTES.ADMIN.UNIVERSITY_EMAIL_DOMAINS]: <AtSign className="h-4 w-4" />,
  [ROUTES.ADMIN.INVITES]: <UserCog className="h-4 w-4" />,
  [ROUTES.ADMIN.CONTACT]: <Mail className="h-4 w-4" />,
};

function isActiveNavItem(item: AdminNavItem, pathname: string) {
  if (item.exact) {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function getTranslatedAdminNavLabel(href: string) {
  const label = getAdminNavLabel(href);

  switch (label) {
    case 'Overview':
      return t`Overview`;

    case 'Moderation':
      return t`Moderation`;

    case 'Calls':
      return t`Calls`;

    case 'Program B':
      return t`Program B`;

    case 'Reports':
      return t`Reports`;

    case 'Users':
      return t`Users`;

    case 'Academic Structure':
      return t`Academic Structure`;

    case 'Organizations':
      return t`Organizations`;

    case 'University Domains':
      return t`University Domains`;

    case 'Invites':
      return t`Invites`;

    case 'Contact':
      return t`Contact`;

    default:
      return label;
  }
}

function AdminNavigation({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="space-y-1">
      {ADMIN_NAV_ITEMS.map((item) => {
        const isActive = isActiveNavItem(item, pathname);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
              isActive
                ? 'bg-sky-400/15 text-white'
                : 'text-slate-300 hover:bg-white/5 hover:text-white',
            )}
            onClick={onNavigate}
          >
            <span>{NAV_ICON_BY_HREF[item.href]}</span>
            <span>{getTranslatedAdminNavLabel(item.href)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function AdminLanguageBlock() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-[11px] font-medium tracking-[0.12em] text-slate-400 uppercase">
        {t`Language`}
      </p>
      <p className="mt-1 text-sm text-slate-300">{t`Switch the app locale.`}</p>
      <LanguageSwitcher
        className="mt-4 w-full border border-white/10 bg-white/8 shadow-none"
        triggerClassName="w-full justify-between bg-transparent text-slate-100 hover:bg-white/10"
        contentClassName="border border-border bg-card"
      />
    </div>
  );
}

function AdminSidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <AdminBrandBlock compact className="mb-8" eyebrow={t`NTI Admin`} title={t`Control Center`} />

      <AdminNavigation pathname={pathname} onNavigate={onNavigate} />

      <div className="mt-auto pt-6">
        <AdminLanguageBlock />
      </div>
    </div>
  );
}

export function AdminShell({ children, user }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileSidebarOpen) return;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileSidebarOpen]);

  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } catch (error) {
      if (!isApiRequestError(error) || !isAuthErrorStatus(error.status)) {
        toast.error(error instanceof Error ? error.message : t`Unable to log out right now.`);
      }
    } finally {
      clearAdminApiCache(queryClient);
      setStoredAdminPasswordChangeRequired(false);
      router.replace(ROUTES.ADMIN.LOGIN);
    }
  };

  return (
    <div className="text-foreground min-h-screen bg-[linear-gradient(180deg,#f2f5fb_0%,#ebeff8_100%)]">
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label={t`Close navigation menu`}
            className="absolute inset-0 bg-slate-950/55"
            type="button"
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          <aside className="relative flex h-full w-[min(21rem,calc(100vw-2rem))] flex-col overflow-y-auto bg-[#0f172a] px-5 py-6 text-slate-100 shadow-2xl">
            <button
              aria-label={t`Close navigation menu`}
              className="absolute top-4 right-4 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-100 transition hover:bg-white/10"
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
            <AdminSidebarContent
              pathname={pathname}
              onNavigate={() => setIsMobileSidebarOpen(false)}
            />{' '}
          </aside>
        </div>
      )}

      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-[272px_minmax(0,1fr)]">
        <aside className="border-border hidden border-r bg-[#0f172a] px-5 py-6 text-slate-100 lg:block">
          <AdminSidebarContent pathname={pathname} />
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="border-border bg-card/90 sticky top-0 z-40 border-b px-4 py-4 backdrop-blur sm:px-8 lg:static">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <Button
                  variant="outline"
                  className="bg-card mt-1 shrink-0 lg:hidden"
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(true)}
                >
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">{t`Open navigation menu`}</span>
                </Button>

                <PageSectionHeader
                  eyebrow={t`Admin Workspace`}
                  title={getAdminPageTitle(pathname)}
                  theme="admin"
                  className="min-w-0 flex-1"
                  titleClassName="mt-1 text-2xl"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="border-border bg-muted min-w-0 rounded-xl border px-3 py-2 text-sm">
                  <div className="text-foreground truncate font-medium">{user.email}</div>
                  <div className="text-muted-foreground text-xs tracking-[0.08em] uppercase">
                    {user.role}
                  </div>
                </div>
                <Button variant="outline" className="bg-card" onClick={() => void handleLogout()}>
                  <LogOut className="h-4 w-4" />
                  {t`Log out`}
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

export function AdminShellSkeleton() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f2f5fb_0%,#ebeff8_100%)]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-[272px_minmax(0,1fr)]">
        <aside className="border-border hidden border-r bg-[#0f172a] p-6 lg:block">
          <div className="h-6 w-40 animate-pulse rounded bg-white/10" />
          <div className="mt-8 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-11 animate-pulse rounded-xl bg-white/10" />
            ))}
          </div>
        </aside>

        <div className="p-4 sm:p-8">
          <div className="bg-card/70 h-18 animate-pulse rounded-2xl" />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-card/70 h-32 animate-pulse rounded-2xl" />
            ))}
          </div>
          <div className="bg-card/70 mt-6 h-72 animate-pulse rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
