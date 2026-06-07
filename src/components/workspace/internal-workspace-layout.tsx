'use client';

import { t } from '@lingui/core/macro';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { LanguageSwitcher } from 'components/i18n/language-switcher';
import { NtiBrand } from 'components/layout/nti-brand';
import { Button } from 'components/shadcn';
import type { AuthenticatedUserDto } from 'lib/api';
import { ROUTES } from 'lib/constants';
import { cn, formatEnumLabel } from 'lib/utils';
import { useWorkspaceLogout } from './use-workspace-logout';

function isNavItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

type NavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
};

type InternalWorkspaceLayoutProps = {
  children: ReactNode;
  description: string;
  navItems: readonly NavItem[];
  title: string;
  user: AuthenticatedUserDto;
};

export function InternalWorkspaceLayout({
  children,
  description,
  navItems,
  title,
  user,
}: InternalWorkspaceLayoutProps) {
  const pathname = usePathname();
  const { handleLogout, isPending: isLogoutPending } = useWorkspaceLogout();

  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="border-border bg-card/92 sticky top-0 z-40 border-b backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <NtiBrand href={ROUTES.ROOT} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-[0.12em] uppercase">
                {user.email}
              </p>
              <p className="text-muted-foreground truncate text-xs">{formatEnumLabel(user.role)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher
              className="border-border bg-muted border shadow-none"
              triggerClassName="bg-transparent text-foreground hover:bg-accent"
            />
            <Button
              variant="outline"
              className="rounded-2xl"
              disabled={isLogoutPending}
              onClick={() => void handleLogout()}
            >
              <LogOut className="h-4 w-4" />
              {t`Log out`}
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
        <aside className="lg:w-72 lg:shrink-0">
          <div className="border-border bg-card rounded-2xl border p-4 shadow-sm">
            <div className="bg-muted mb-4 rounded-2xl px-4 py-3">
              <p className="text-foreground text-sm font-semibold">{title}</p>
              <p className="text-muted-foreground mt-1 text-xs">{description}</p>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isNavItemActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
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
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
