'use client';

import * as React from 'react';
import { t } from '@lingui/core/macro';
import { LoaderCircle } from 'lucide-react';

import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Extra content (e.g. a required reason textarea) rendered between description and actions. */
  children?: React.ReactNode;
  confirmLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
  /** Use the destructive treatment for irreversible / dangerous actions. */
  destructive?: boolean;
  /** Disable confirm (e.g. when a required reason is empty). */
  confirmDisabled?: boolean;
  loading?: boolean;
  onConfirm: () => void;
}

/**
 * Standard confirmation step for destructive / irreversible actions
 * (approve, reject, archive, delete, submit evaluation...). Replaces the
 * mix of `window.confirm` and one-click mutations across the app.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmLabel,
  cancelLabel,
  destructive = false,
  confirmDisabled = false,
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => (loading ? undefined : onOpenChange(next))}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        {children}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelLabel ?? t`Cancel`}
          </Button>
          <Button
            type="button"
            variant={destructive ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={confirmDisabled || loading}
          >
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : null}
            {confirmLabel ?? t`Confirm`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
