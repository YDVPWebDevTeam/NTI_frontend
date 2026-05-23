'use client';

import { t } from '@lingui/core/macro';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { LanguageSwitcher } from 'components/i18n/language-switcher';
import { NtiBrand } from 'components/layout';
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7fafc_0%,#eef4ff_100%)] text-[#11203a]">
      <header className="sticky top-0 z-40 border-b border-[#dfe7fa] bg-white/92 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <NtiBrand href={ROUTES.ROOT} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-[0.12em] uppercase">
                {user.email}
              </p>
              <p className="truncate text-xs text-[#60718d]">{formatEnumLabel(user.role)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher
              className="border border-[#d8e4fb] bg-[#f8fbff] shadow-none"
              triggerClassName="bg-transparent text-[#10213d] hover:bg-[#eef4ff]"
            />
            <Button
              variant="outline"
              className="rounded-2xl border-[#d8e4fb] bg-white/90 text-[#122039] hover:bg-[#f5f8ff]"
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
          <div className="rounded-[1.75rem] border border-[#dfe7fa] bg-white/88 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <div className="mb-4 rounded-2xl bg-[#f4f8ff] px-4 py-3">
              <p className="text-sm font-semibold text-[#122039]">{title}</p>
              <p className="mt-1 text-xs text-[#60718d]">{description}</p>
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
                        ? 'bg-[#0f4fb8] text-white shadow-[0_16px_28px_rgba(15,79,184,0.28)]'
                        : 'text-[#53637b] hover:bg-[#edf4ff] hover:text-[#123a82]',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-xl border transition-colors',
                        active
                          ? 'border-white/20 bg-white/10 text-white'
                          : 'border-[#d8e4fb] bg-white text-[#355ea8]',
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
