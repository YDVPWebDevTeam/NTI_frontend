'use client';

import { t } from '@lingui/core/macro';

import { EmptyState, ErrorState, LoadingState } from 'components/shadcn/state-views';

type AdminStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function AdminLoadingState({ label = t`Loading admin data...` }: { label?: string }) {
  return <LoadingState label={label} />;
}

export function AdminEmptyState(props: AdminStateProps) {
  return <EmptyState {...props} />;
}

export function AdminErrorState(props: AdminStateProps) {
  return <ErrorState {...props} />;
}
