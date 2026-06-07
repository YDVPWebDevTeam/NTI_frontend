'use client';

import { t } from '@lingui/core/macro';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  ShieldCheck,
  LayoutGrid,
  LogOut,
  Menu,
  Rocket,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';

import { NtiBrand } from 'components/layout/nti-brand';
import { LanguageSwitcher } from 'components/i18n/language-switcher';
import { Button } from 'components/shadcn';
import { useWorkspaceLogout } from 'components/workspace/use-workspace-logout';
import { useGetMyStudentProfile } from 'lib/api';
import { ROUTES } from 'lib/constants';
import { useStudentWorkspaceUser } from 'lib/student-dashboard/student-workspace-user-context';
import { cn, formatEnumLabel } from 'lib/utils';

function isNavItemActive(pathname: string, href: string) {
  if (href === ROUTES.STUDENT.DASHBOARD) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function StudentNavItem({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all',
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-accent hover:text-primary',
      )}
    >
      <span
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-xl border transition-colors',
          active
            ? 'border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground'
            : 'border-border bg-card text-primary',
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span>{label}</span>
    </Link>
  );
}

function StudentSidebar({
  pathname,
  onNavigate,
  items,
}: {
  pathname: string;
  onNavigate?: () => void;
  items: ReadonlyArray<{ href: string; label: string; icon: LucideIcon }>;
}) {
  return (
    <div className="flex flex-col">
      <nav className="space-y-2">
        {items.map((item) => (
          <StudentNavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={isNavItemActive(pathname, item.href)}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
    </div>
  );
}

export function StudentWorkspaceLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const me = useStudentWorkspaceUser();
  const { handleLogout, isPending: isLogoutPending } = useWorkspaceLogout();
  const studentProfileQuery = useGetMyStudentProfile({
    query: { enabled: true },
  });
  const [mobileNavState, setMobileNavState] = useState({ open: false, pathname });
  const isMobileNavOpen = mobileNavState.open && mobileNavState.pathname === pathname;
  const studentNavItems = [
    { href: ROUTES.STUDENT.DASHBOARD, label: t`Dashboard`, icon: LayoutGrid },
    { href: ROUTES.STUDENT.PROFILE, label: t`Profile`, icon: UserRound },
    { href: ROUTES.STUDENT.TEAM, label: t`Team`, icon: Users },
    { href: ROUTES.STUDENT.PROGRAM_B_BACKLOG, label: t`Program B backlog`, icon: Rocket },
    { href: ROUTES.ACCOUNT, label: t`Account security`, icon: ShieldCheck },
  ] as const;
  const studentUser = studentProfileQuery.data?.user;
  const displayName =
    studentUser && (studentUser.firstName || studentUser.lastName)
      ? `${studentUser.firstName} ${studentUser.lastName}`.trim()
      : (me.email ?? t`Signed-in user`);
  const roleLabel = formatEnumLabel(me.role);

  const shellBody = (
    <>
      <header className="border-border bg-card/92 sticky top-0 z-40 border-b backdrop-blur-xl">
        <div className="flex w-full items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href={ROUTES.ROOT}
            className="flex items-center gap-3 rounded-2xl transition hover:opacity-85"
            aria-label={t`Go to site home`}
          >
            <NtiBrand size="sm" />
            <div className="min-w-0 text-left">
              <p className="text-foreground truncate text-sm font-semibold tracking-[0.12em] uppercase">
                {displayName}
              </p>
              <p className="text-muted-foreground truncate text-xs">{roleLabel}</p>
            </div>
          </Link>

          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSwitcher
              className="border-border bg-muted border shadow-none"
              triggerClassName="bg-transparent text-foreground hover:bg-accent"
            />
            <Button
              variant="outline"
              className="border-border bg-card/90 text-foreground hover:bg-muted rounded-2xl"
              disabled={isLogoutPending}
              onClick={() => void handleLogout()}
            >
              <LogOut className="h-4 w-4" />
              {t`Log out`}
            </Button>
          </div>

          <div className="flex min-w-0 items-center gap-3 lg:hidden">
            <Button
              variant="outline"
              size="icon"
              className="border-border bg-card/90 shrink-0 rounded-2xl"
              onClick={() => setMobileNavState({ open: !isMobileNavOpen, pathname })}
              aria-label={isMobileNavOpen ? t`Close navigation` : t`Open navigation`}
            >
              {isMobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      <div
        className={cn(
          'fixed inset-0 z-50 transition-opacity duration-300 ease-out lg:hidden',
          isMobileNavOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <button
          type="button"
          aria-label={t`Close navigation`}
          className={cn(
            'bg-foreground/35 absolute inset-0 backdrop-blur-[2px] transition-opacity duration-300 ease-out',
            isMobileNavOpen ? 'opacity-100' : 'opacity-0',
          )}
          onClick={() => setMobileNavState({ open: false, pathname })}
        />
        <aside
          className={cn(
            'border-border bg-card absolute inset-y-0 left-0 w-[min(88vw,22rem)] border-r p-4 shadow-sm transition-transform duration-300 ease-out',
            isMobileNavOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="flex h-full flex-col overflow-y-auto">
            <StudentSidebar
              pathname={pathname}
              items={studentNavItems}
              onNavigate={() => setMobileNavState({ open: false, pathname })}
            />
            <div className="border-border bg-card mt-auto space-y-4 rounded-2xl border p-5 shadow-sm">
              <div>
                <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.22em] uppercase">
                  {t`Language`}
                </p>
                <p className="text-foreground mt-1.5 text-sm font-medium">
                  {t`Switch the app locale.`}
                </p>
              </div>
              <LanguageSwitcher
                className="border-border bg-card w-full border shadow-none"
                triggerClassName="w-full justify-between rounded-xl bg-transparent text-foreground hover:bg-accent"
              />
              <Button
                variant="outline"
                className="border-border bg-card text-foreground hover:bg-muted w-full justify-start rounded-xl"
                disabled={isLogoutPending}
                onClick={() => void handleLogout()}
              >
                <LogOut className="h-4 w-4" />
                {t`Log out`}
              </Button>
            </div>
          </div>
        </aside>
      </div>

      <div className="flex w-full gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="hidden w-full max-w-[19rem] self-start lg:block">
          <div className="sticky top-24">
            <StudentSidebar pathname={pathname} items={studentNavItems} />
          </div>
        </aside>
        <div className="min-w-0 flex-1 space-y-6 py-2 lg:py-6">{children}</div>
      </div>
    </>
  );

  return (
    <main className="bg-background min-h-screen">
      {shellBody}
      <footer className="border-border bg-card/80 border-t">
        <div className="text-muted-foreground flex w-full flex-col gap-3 px-4 py-5 text-sm sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>{t`NTI student workspace. Separate flows for profile completion, team coordination, and program work.`}</p>
          <div className="flex flex-wrap gap-4">
            <Link href={ROUTES.PRIVACY_POLICY} className="hover:text-primary transition">
              {t`Privacy policy`}
            </Link>
            <Link href={ROUTES.TERMS_OF_SERVICE} className="hover:text-primary transition">
              {t`Terms of service`}
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
