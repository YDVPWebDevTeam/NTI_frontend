import type { ReactNode } from 'react';

import { cn } from 'lib/utils';

import { NtiBrand } from './nti-brand';
import { PageSectionHeader } from './page-section-header';

type AuthSplitShellProps = {
  asideEyebrow: ReactNode;
  asideTitle: ReactNode;
  asideDescription: ReactNode;
  children: ReactNode;
  footerCta?: ReactNode;
  headerEyebrow?: ReactNode;
  headerTitle?: ReactNode;
  headerDescription?: ReactNode;
  headerActions?: ReactNode;
  asideLead?: ReactNode;
  theme?: 'auth' | 'admin';
  className?: string;
};

const SHELL_STYLES = {
  auth: {
    outer: 'mx-auto flex w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8',
    frame:
      'grid w-full grid-cols-1 overflow-hidden border border-black/10 bg-[#e7e8eb] lg:grid-cols-[400px_1fr]',
    aside: 'relative bg-[#041d67] px-6 py-8 text-white lg:px-8 lg:py-10',
    asidePattern: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.16) 1px, transparent 0)',
    asidePatternSize: '22px 22px',
    section: 'flex items-center bg-[#ececef] px-5 py-7 sm:px-8 sm:py-10 lg:px-12',
    brandVariant: 'light' as const,
  },
  admin: {
    outer:
      'min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eff6ff_30%,#f8fafc_60%)] px-4 py-8 sm:px-6 lg:px-8',
    frame:
      'mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.12)] lg:grid-cols-[420px_1fr]',
    aside: 'relative overflow-hidden bg-[#0f172a] px-8 py-10 text-white',
    asidePattern:
      'linear-gradient(rgba(148,163,184,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.18) 1px, transparent 1px)',
    asidePatternSize: '28px 28px',
    section: 'flex items-center px-6 py-8 sm:px-10 lg:px-14',
    brandVariant: 'admin' as const,
  },
} as const;

export function AuthSplitShell({
  asideEyebrow,
  asideTitle,
  asideDescription,
  children,
  footerCta,
  headerEyebrow,
  headerTitle,
  headerDescription,
  headerActions,
  asideLead,
  theme = 'auth',
  className,
}: AuthSplitShellProps) {
  const styles = SHELL_STYLES[theme];

  return (
    <main className={cn(styles.outer, className)}>
      <div className={styles.frame}>
        <aside className={styles.aside}>
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage: styles.asidePattern,
              backgroundSize: styles.asidePatternSize,
            }}
          />

          <div className="relative z-10 flex h-full flex-col">
            <NtiBrand
              size="sm"
              variant={styles.brandVariant}
              className="font-semibold"
              ariaLabel="NTI"
            />

            {asideLead ? <div className="mt-8">{asideLead}</div> : null}

            <PageSectionHeader
              className="mt-8"
              eyebrow={asideEyebrow}
              title={asideTitle}
              description={asideDescription}
              theme="inverse"
            />

            {footerCta ? <div className="mt-auto pt-16">{footerCta}</div> : null}
          </div>
        </aside>

        <section className={styles.section}>
          <div className="w-full max-w-md">
            {headerTitle ? (
              <PageSectionHeader
                className="mb-8"
                eyebrow={headerEyebrow}
                title={headerTitle}
                description={headerDescription}
                actions={headerActions}
                theme={theme === 'admin' ? 'admin' : 'default'}
              />
            ) : null}

            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
