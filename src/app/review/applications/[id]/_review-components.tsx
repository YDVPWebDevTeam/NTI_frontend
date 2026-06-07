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
    <section className={`border-border bg-card rounded-2xl border shadow-sm ${className}`}>
      {children}
    </section>
  );
}

export function CardHeader({ children }: { children: ReactNode }) {
  return <div className="border-border border-b px-6 py-5">{children}</div>;
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-foreground flex items-center gap-2 text-xl font-bold">{children}</h2>;
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
    <div className="border-border bg-muted text-muted-foreground rounded-2xl border border-dashed px-4 py-4 text-sm">
      {children}
    </div>
  );
}

export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="border-border bg-muted rounded-2xl border p-4">
      <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
        {label}
      </p>
      <p className="text-foreground mt-2 text-sm leading-6">{value}</p>
    </div>
  );
}

export function SectionCard({ section }: { section: ApplicationSectionDto }) {
  return (
    <div className="border-border bg-card rounded-2xl border p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-foreground text-lg font-bold">{prettySectionTitle(section.key)}</h3>
        <span className="border-border bg-muted text-muted-foreground rounded-full border px-3 py-1 text-xs font-semibold">
          v{section.version}
        </span>
      </div>

      <pre className="bg-muted text-muted-foreground mt-4 overflow-x-auto rounded-2xl p-4 text-sm leading-6 whitespace-pre-wrap">
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
    <div className="border-border rounded-2xl border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-foreground font-semibold">
            {isOwn ? t`Your evaluation` : t`Reviewer`}
          </p>
          <p className="text-muted-foreground mt-1 text-sm">{formatDate(evaluation.createdAt)}</p>
        </div>
        <span className="border-success/30 bg-success/10 text-success rounded-full border px-3 py-1 text-xs font-semibold">
          {toText(evaluation.recommendation, t`No recommendation`)}
        </span>
      </div>

      {toText(evaluation.comment, '').length > 0 && (
        <p className="bg-muted text-muted-foreground mt-3 rounded-xl p-3 text-sm leading-6">
          {toText(evaluation.comment)}
        </p>
      )}

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {scores.map((score) => (
          <div key={score.id} className="border-border bg-muted rounded-xl border p-3">
            <p className="text-muted-foreground text-xs font-semibold tracking-[0.08em] uppercase">
              {score.criterionCode}
            </p>
            <p className="text-foreground mt-1 text-lg font-bold">{score.score}/100</p>
            {toText(score.comment, '').length > 0 && (
              <p className="text-muted-foreground mt-1 text-xs leading-5">
                {toText(score.comment)}
              </p>
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
          className="border-border bg-muted flex items-start gap-3 rounded-2xl border p-3"
        >
          {signal.passed ? (
            <CheckCircle2 className="text-success mt-0.5 h-5 w-5 shrink-0" />
          ) : (
            <XCircle className="text-destructive mt-0.5 h-5 w-5 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-foreground text-sm font-semibold">{signal.code}</p>
            {signal.reason.length > 0 && (
              <p className="text-muted-foreground mt-1 text-sm leading-6">{signal.reason}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
