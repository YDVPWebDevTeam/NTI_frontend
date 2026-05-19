'use client';

import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { GraduationCap, LayoutGrid, LogOut, ShieldCheck, UserCog, Users2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { AdminBrandBlock, PageSectionHeader } from 'components/layout';
import { Button } from 'components/shadcn';
import { adminQueryKeys } from 'lib/api/admin/admin-query-keys';
import { authService, setStoredAdminPasswordChangeRequired } from 'lib/api/admin/auth';
import { ROUTES } from 'lib/constants';
import { isApiRequestError, isAuthErrorStatus } from 'lib/api/base-client';
import { cn } from 'lib/utils';

import type { AdminNavItem, AdminSessionUser } from './types';
import { ADMIN_NAV_ITEMS, getAdminPageTitle } from './utils';

type AdminShellProps = {
  children: React.ReactNode;
  user: AdminSessionUser;
};

const NAV_ICON_BY_HREF: Record<string, React.ReactNode> = {
  [ROUTES.ADMIN.ROOT]: <LayoutGrid className="h-4 w-4" />,
  [ROUTES.ADMIN.USERS]: <Users2 className="h-4 w-4" />,
  [ROUTES.ADMIN.ACADEMIC_STRUCTURE]: <GraduationCap className="h-4 w-4" />,
  [ROUTES.ADMIN.ORGANIZATIONS]: <ShieldCheck className="h-4 w-4" />,
  [ROUTES.ADMIN.INVITES]: <UserCog className="h-4 w-4" />,
};

function isActiveNavItem(item: AdminNavItem, pathname: string) {
  if (item.exact) {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function AdminShell({ children, user }: AdminShellProps) {
  const { i18n } = useLingui();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      if (!isApiRequestError(error) || !isAuthErrorStatus(error.status)) {
        toast.error(error instanceof Error ? error.message : t`Unable to log out right now.`);
      }
    } finally {
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.all });
      queryClient.removeQueries({ queryKey: adminQueryKeys.all });
      setStoredAdminPasswordChangeRequired(false);
      router.replace(ROUTES.ADMIN.LOGIN);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f2f5fb_0%,#ebeff8_100%)] text-slate-950">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-[272px_minmax(0,1fr)]">
        <aside className="border-r border-slate-200 bg-[#0f172a] px-5 py-6 text-slate-100">
          <AdminBrandBlock
            compact
            className="mb-8"
            eyebrow={t`NTI Admin`}
            title={t`Control Center`}
          />

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
                >
                  <span>{NAV_ICON_BY_HREF[item.href]}</span>
                  <span>{i18n._(item.label)}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur sm:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <PageSectionHeader
                eyebrow={t`Admin Workspace`}
                title={getAdminPageTitle(pathname)}
                theme="admin"
                className="flex-1"
                titleClassName="mt-1 text-2xl"
              />

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                  <div className="font-medium text-slate-900">{user.email}</div>
                  <div className="text-xs tracking-[0.08em] text-slate-500 uppercase">
                    {user.role}
                  </div>
                </div>
                <Button variant="outline" className="bg-white" onClick={() => void handleLogout()}>
                  <LogOut className="h-4 w-4" />
                  {t`Log out`}
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-5 py-6 sm:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

export function AdminShellSkeleton() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f2f5fb_0%,#ebeff8_100%)]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-[272px_minmax(0,1fr)]">
        <aside className="border-r border-slate-200 bg-[#0f172a] p-6">
          <div className="h-6 w-40 animate-pulse rounded bg-white/10" />
          <div className="mt-8 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-11 animate-pulse rounded-xl bg-white/10" />
            ))}
          </div>
        </aside>
        <div className="p-6 sm:p-8">
          <div className="h-18 animate-pulse rounded-2xl bg-white/70" />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-32 animate-pulse rounded-2xl bg-white/70" />
            ))}
          </div>
          <div className="mt-6 h-72 animate-pulse rounded-2xl bg-white/70" />
        </div>
      </div>
    </div>
  );
}
