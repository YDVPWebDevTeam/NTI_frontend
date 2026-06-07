'use client';

import { AlertTriangle, CheckCircle2, ShieldAlert, ShieldCheck } from 'lucide-react';

import type { FeedbackTone, SecurityFeedback } from '../lib/types';

const FEEDBACK_STYLES: Record<
  FeedbackTone,
  { container: string; icon: string; Icon: typeof CheckCircle2 }
> = {
  success: {
    container: 'border-success/30 bg-success/10 text-success',
    icon: 'bg-success/10 text-success',
    Icon: CheckCircle2,
  },
  info: {
    container: 'border-info/30 bg-info/10 text-info',
    icon: 'bg-info/10 text-info',
    Icon: ShieldCheck,
  },
  warning: {
    container: 'border-warning/30 bg-warning/10 text-warning',
    icon: 'bg-warning/10 text-warning',
    Icon: AlertTriangle,
  },
  danger: {
    container: 'border-destructive/30 bg-destructive/10 text-destructive',
    icon: 'bg-destructive/10 text-destructive',
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
    <div className={`rounded-2xl border p-5 shadow-sm ${container}`}>
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
