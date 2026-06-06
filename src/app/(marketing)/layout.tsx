import type { ReactNode } from 'react';

import { LandingFooter, LandingHeader } from 'components/layout';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-surface font-body text-on-surface overflow-x-hidden antialiased">
      <LandingHeader />
      {children}
      <LandingFooter />
    </div>
  );
}
