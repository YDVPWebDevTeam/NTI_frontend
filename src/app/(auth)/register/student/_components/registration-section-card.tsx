import type { ReactNode } from 'react';

type RegistrationSectionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function RegistrationSectionCard({
  title,
  description,
  children,
}: RegistrationSectionCardProps) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-6 md:p-8">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-[#0c1a4f]">{title}</h3>
        {description ? <p className="text-sm text-neutral-500">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}
