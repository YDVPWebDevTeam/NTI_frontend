import type { ReactNode } from 'react';

import { Footer } from './footer';
import { Header } from './header';

type PublicShellProps = {
  children: ReactNode;
};

export function PublicShell({ children }: PublicShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#e7e8eb]">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
