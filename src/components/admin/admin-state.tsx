'use client';

import { t } from '@lingui/core/macro';
import { AlertTriangle, Inbox, LoaderCircle } from 'lucide-react';

import { Button } from 'components/shadcn';
import { Card, CardContent, CardHeader, CardTitle } from 'components/shadcn';

type AdminStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function AdminLoadingState({ label = t`Loading admin data...` }: { label?: string }) {
  return (
    <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-slate-200 bg-white/80">
      <div className="flex items-center gap-3 text-sm text-slate-600">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        <span>{label}</span>
      </div>
    </div>
  );
}

export function AdminEmptyState({ title, description, actionLabel, onAction }: AdminStateProps) {
  return (
    <Card className="border-dashed border-slate-300 bg-slate-50/70 shadow-none">
      <CardHeader>
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-700">
          <Inbox className="h-5 w-5" />
        </div>
        <CardTitle className="text-xl text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">{description}</p>
        {actionLabel && onAction ? (
          <Button variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function AdminErrorState({ title, description, actionLabel, onAction }: AdminStateProps) {
  return (
    <Card className="border-rose-200 bg-rose-50 shadow-none">
      <CardHeader>
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-700">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <CardTitle className="text-xl text-rose-950">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-rose-800">{description}</p>
        {actionLabel && onAction ? (
          <Button variant="outline" className="border-rose-300 bg-white" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
