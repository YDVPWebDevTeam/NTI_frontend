import type { ReactNode } from 'react';

import { LandingFooter, LandingHeader } from 'components/layout';

/** Shared chrome for static marketing pages: landing header + footer. */
export function MarketingPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-surface font-body text-on-surface min-h-screen overflow-x-hidden antialiased">
      <LandingHeader />
      {children}
      <LandingFooter />
    </div>
  );
}
