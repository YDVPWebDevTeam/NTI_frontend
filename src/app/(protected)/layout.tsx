import type { ReactNode } from 'react';

import { StudentWorkspaceLayout } from 'components/student-dashboard/page-shell';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return <StudentWorkspaceLayout>{children}</StudentWorkspaceLayout>;
}
