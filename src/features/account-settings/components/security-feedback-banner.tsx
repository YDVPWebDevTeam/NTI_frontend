'use client';

import { AlertTriangle, CheckCircle2, ShieldAlert, ShieldCheck } from 'lucide-react';

import type { FeedbackTone, SecurityFeedback } from '../lib/types';

const FEEDBACK_STYLES: Record<
  FeedbackTone,
  { container: string; icon: string; Icon: typeof CheckCircle2 }
> = {
  success: {
    container: 'border-emerald-200 bg-emerald-50/90 text-emerald-950',
    icon: 'bg-emerald-100 text-emerald-700',
    Icon: CheckCircle2,
  },
  info: {
    container: 'border-sky-200 bg-sky-50/90 text-sky-950',
    icon: 'bg-sky-100 text-sky-700',
    Icon: ShieldCheck,
  },
  warning: {
    container: 'border-amber-200 bg-amber-50/90 text-amber-950',
    icon: 'bg-amber-100 text-amber-700',
    Icon: AlertTriangle,
  },
  danger: {
    container: 'border-rose-200 bg-rose-50/90 text-rose-950',
    icon: 'bg-rose-100 text-rose-700',
    Icon: ShieldAlert,
  },
};

export function SecurityFeedbackBanner({
  feedback,
  eyebrow,
}: {
  feedback: SecurityFeedback;
  eyebrow: string;
}) {
  const { container, icon, Icon } = FEEDBACK_STYLES[feedback.tone];

  return (
    <div
      className={`rounded-[1.5rem] border p-5 shadow-[0_12px_24px_rgba(15,23,42,0.05)] ${container}`}
    >
      <div className="flex gap-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${icon}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase">{eyebrow}</p>
          <p className="mt-2 text-base font-semibold">{feedback.title}</p>
          <p className="mt-1 text-sm leading-6 opacity-90">{feedback.description}</p>
        </div>
      </div>
    </div>
  );
}
