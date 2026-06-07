'use client';

import * as React from 'react';
import { t } from '@lingui/core/macro';
import { AlertTriangle, Inbox, LoaderCircle } from 'lucide-react';

import { cn } from 'lib/utils';

import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';

/**
 * Shared loading / empty / error / not-found views so every workspace and admin
 * page communicates these states the same way (token-based, theme-aware).
 */

export function LoadingState({ label, className }: { label?: string; className?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'border-border bg-card flex min-h-[240px] items-center justify-center rounded-2xl border',
        className,
      )}
    >
      <div className="text-muted-foreground flex items-center gap-3 text-sm">
        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
        <span>{label ?? t`Loading…`}</span>
      </div>
    </div>
  );
}

type StateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  children?: React.ReactNode;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  className,
  children,
}: StateProps) {
  return (
    <Card className={cn('bg-muted/40 border-dashed shadow-none', className)}>
      <CardHeader>
        <div className="bg-muted text-muted-foreground mb-3 flex h-10 w-10 items-center justify-center rounded-full">
          <Inbox className="h-5 w-5" aria-hidden />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
        {children}
        {actionLabel && onAction ? (
          <Button variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function ErrorState({ title, description, actionLabel, onAction, className }: StateProps) {
  return (
    <Card className={cn('border-destructive/30 bg-destructive/5 shadow-none', className)}>
      <CardHeader>
        <div className="bg-destructive/10 text-destructive mb-3 flex h-10 w-10 items-center justify-center rounded-full">
          <AlertTriangle className="h-5 w-5" aria-hidden />
        </div>
        <CardTitle className="text-destructive text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {description ? <p className="text-destructive/90 text-sm">{description}</p> : null}
        {actionLabel && onAction ? (
          <Button variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
