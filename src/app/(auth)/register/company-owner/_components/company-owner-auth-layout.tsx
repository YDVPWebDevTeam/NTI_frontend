import { type ReactNode } from 'react';

import { AuthSplitShell } from 'components/layout';

type CompanyOwnerAuthLayoutProps = {
  eyebrow: ReactNode;
  title: ReactNode;
  description: ReactNode;
  children: ReactNode;
  headerEyebrow: ReactNode;
  headerTitle: ReactNode;
  headerDescription: ReactNode;
};

export function CompanyOwnerAuthLayout({
  eyebrow,
  title,
  description,
  children,
  headerEyebrow,
  headerTitle,
  headerDescription,
}: CompanyOwnerAuthLayoutProps) {
  return (
    <AuthSplitShell
      asideEyebrow={eyebrow}
      asideTitle={title}
      asideDescription={description}
      headerEyebrow={headerEyebrow}
      headerTitle={headerTitle}
      headerDescription={headerDescription}
    >
      {children}
    </AuthSplitShell>
  );
}
