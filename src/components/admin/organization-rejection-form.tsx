'use client';

import { t } from '@lingui/core/macro';
import { useState } from 'react';

import { Button, Textarea } from 'components/shadcn';

type OrganizationRejectionFormProps = {
  disabled?: boolean;
  onCancel: () => void;
  onSubmit: (reason: string) => Promise<void> | void;
};

export function OrganizationRejectionForm({
  disabled,
  onCancel,
  onSubmit,
}: OrganizationRejectionFormProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      setError(t`A rejection reason is required.`);

      return;
    }

    setError('');
    await onSubmit(trimmedReason);
  };

  return (
    <div className="space-y-3 rounded-xl border border-rose-200 bg-rose-50 p-3">
      <Textarea
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder={t`Explain why this organization should be rejected.`}
        disabled={disabled}
        className="min-h-24 border-rose-200 bg-white"
      />
      {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="destructive"
          onClick={() => void handleSubmit()}
          disabled={disabled}
        >
          {disabled ? t`Rejecting...` : t`Confirm Rejection`}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={disabled}>
          {t`Cancel`}
        </Button>
      </div>
    </div>
  );
}
