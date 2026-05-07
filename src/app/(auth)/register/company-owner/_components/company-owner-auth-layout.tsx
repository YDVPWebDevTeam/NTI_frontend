import { type ReactNode } from 'react';

type CompanyOwnerAuthLayoutProps = {
  eyebrow: ReactNode;
  title: ReactNode;
  description: ReactNode;
  children: ReactNode;
};

export function CompanyOwnerAuthLayout({
  eyebrow,
  title,
  description,
  children,
}: CompanyOwnerAuthLayoutProps) {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="grid w-full grid-cols-1 overflow-hidden border border-black/10 bg-[#e7e8eb] lg:grid-cols-[400px_1fr]">
        <aside className="relative bg-[#041d67] px-6 py-8 text-white lg:px-8 lg:py-10">
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.16) 1px, transparent 0)',
              backgroundSize: '22px 22px',
            }}
          />

          <div className="relative z-10 flex h-full flex-col">
            <div>
              <p className="text-[11px] font-medium tracking-[0.14em] text-white/50">{eyebrow}</p>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight">{title}</h1>

              <p className="mt-4 text-sm leading-relaxed text-white/60">{description}</p>
            </div>
          </div>
        </aside>

        <section className="flex items-center bg-[#ececef] px-5 py-7 sm:px-8 sm:py-10 lg:px-12">
          <div className="w-full max-w-120">{children}</div>
        </section>
      </div>
    </main>
  );
}
