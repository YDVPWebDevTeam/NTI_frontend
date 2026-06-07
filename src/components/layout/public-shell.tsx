import type { ReactNode } from 'react';

import { Footer } from './footer';
import { Header } from './header';

type PublicShellProps = {
  children: ReactNode;
};

export function PublicShell({ children }: PublicShellProps) {
  return (
    <div className="bg-muted flex min-h-screen flex-col">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
