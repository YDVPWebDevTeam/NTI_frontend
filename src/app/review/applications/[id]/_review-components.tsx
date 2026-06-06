import { t } from '@lingui/core/macro';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';

import type { ApplicationEvaluationDto, ApplicationSectionDto } from 'lib/api/index.schemas';

import { formatDate, toText } from 'lib/review/application-display';

const JSON_INDENT = 2;

function renderJsonValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return JSON.stringify(value, null, JSON_INDENT);
}

function prettySectionTitle(key: string): string {
  switch (key) {
    case 'profile':
      return t`Profile`;

    case 'idea_overview':
      return t`Idea overview`;

    default:
      return key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </section>
  );
}

export function CardHeader({ children }: { children: ReactNode }) {
  return <div className="border-b border-slate-100 px-6 py-5">{children}</div>;
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950">{children}</h2>;
}

export function CardContent({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`px-6 py-5 ${className}`}>{children}</div>;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
      {children}
    </div>
  );
}

export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-900">{value}</p>
    </div>
  );
}

export function SectionCard({ section }: { section: ApplicationSectionDto }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-950">{prettySectionTitle(section.key)}</h3>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
          v{section.version}
        </span>
      </div>

      <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-50 p-4 text-sm leading-6 whitespace-pre-wrap text-slate-700">
        {renderJsonValue(section.valueJson)}
      </pre>
    </div>
  );
}

export function EvaluationCard({
  evaluation,
  isOwn,
}: {
  evaluation: ApplicationEvaluationDto;
  isOwn: boolean;
}) {
  const scores = Array.isArray(evaluation.scores) ? evaluation.scores : [];

  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-950">{isOwn ? t`Your evaluation` : t`Reviewer`}</p>
          <p className="mt-1 text-sm text-slate-500">{formatDate(evaluation.createdAt)}</p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          {toText(evaluation.recommendation, t`No recommendation`)}
        </span>
      </div>

      {toText(evaluation.comment, '').length > 0 && (
        <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">
          {toText(evaluation.comment)}
        </p>
      )}

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {scores.map((score) => (
          <div key={score.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold tracking-[0.08em] text-slate-500 uppercase">
              {score.criterionCode}
            </p>
            <p className="mt-1 text-lg font-bold text-slate-950">{score.score}/100</p>
            {toText(score.comment, '').length > 0 && (
              <p className="mt-1 text-xs leading-5 text-slate-600">{toText(score.comment)}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export type EligibilitySignalRow = {
  code: string;
  passed: boolean;
  reason: string;
};

export function EligibilitySignalsCard({
  isLoading,
  signals,
}: {
  isLoading: boolean;
  signals: EligibilitySignalRow[];
}) {
  return (
    <div className="space-y-3">
      {isLoading && <EmptyState>{t`Loading eligibility signals...`}</EmptyState>}
      {!isLoading && signals.length === 0 && (
        <EmptyState>{t`No eligibility signals were returned by the backend.`}</EmptyState>
      )}
      {signals.map((signal) => (
        <div
          key={signal.code}
          className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3"
        >
          {signal.passed ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          ) : (
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">{signal.code}</p>
            {signal.reason.length > 0 && (
              <p className="mt-1 text-sm leading-6 text-slate-600">{signal.reason}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
