'use client';

import { t } from '@lingui/core/macro';
import { BriefcaseBusiness, FolderKanban, LayoutGrid, ListTodo, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';

import { InternalWorkspaceLayout } from 'components/workspace/internal-workspace-layout';
import type { AuthenticatedUserDto } from 'lib/api';
import { ROUTES } from 'lib/constants';

type CompanyWorkspaceLayoutProps = {
  children: ReactNode;
  user: AuthenticatedUserDto;
};

export function CompanyWorkspaceLayout({ children, user }: CompanyWorkspaceLayoutProps) {
  const navItems = [
    { href: ROUTES.COMPANY.DASHBOARD, label: t`Dashboard`, icon: LayoutGrid },
    { href: ROUTES.COMPANY.ORGANIZATION, label: t`Organization`, icon: BriefcaseBusiness },
    { href: ROUTES.COMPANY.PROGRAM_B_BACKLOG, label: t`Program B backlog`, icon: ListTodo },
    { href: ROUTES.COMPANY.PROGRAM_B_PROJECTS, label: t`Projects`, icon: FolderKanban },
    { href: ROUTES.ACCOUNT, label: t`Account security`, icon: ShieldCheck },
  ] as const;

  return (
    <InternalWorkspaceLayout
      user={user}
      title={t`Company workspace`}
      description={t`Organization-scoped access`}
      navItems={navItems}
    >
      {children}
    </InternalWorkspaceLayout>
  );
}
