'use client';

import { t } from '@lingui/core/macro';
import { CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { type ReactNode, Suspense, useEffect, useRef, useState } from 'react';

import { useConfirmMyEmailChange } from 'lib/api';
import { ROUTES } from 'lib/constants';

type ConfirmStatus = 'confirming' | 'success' | 'error';

function ConfirmCard({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="border-border bg-card w-full rounded-2xl border p-8 text-center shadow-sm">
      <div className="bg-accent mx-auto flex h-12 w-12 items-center justify-center rounded-full">
        {icon}
      </div>
      <h1 className="text-foreground mt-4 text-xl font-semibold">{title}</h1>
      <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-7">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

function ConfirmEmailChangeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';

  const confirmMutation = useConfirmMyEmailChange();
  const [status, setStatus] = useState<ConfirmStatus>(token ? 'confirming' : 'error');
  const [message, setMessage] = useState<string>(
    token ? '' : t`This confirmation link is incomplete. Open the full link from your email.`,
  );
  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    if (!token || hasSubmittedRef.current) {
      return;
    }

    hasSubmittedRef.current = true;

    confirmMutation
      .mutateAsync({ data: { token } })
      .then((response) => {
        setStatus('success');
        setMessage(
          response?.message ||
            t`Your new email is now active. All sessions were signed out — please sign in again with your updated address.`,
        );
      })
      .catch((error: unknown) => {
        setStatus('error');
        setMessage(
          error instanceof Error
            ? error.message
            : t`We couldn't confirm this email change. The link may have expired or already been used.`,
        );
      });
  }, [confirmMutation, token]);

  if (status === 'confirming') {
    return (
      <ConfirmCard
        icon={<Loader2 className="text-primary h-6 w-6 animate-spin" />}
        title={t`Confirming your email change`}
        description={t`Please wait while we confirm your new email address.`}
      />
    );
  }

  if (status === 'success') {
    return (
      <ConfirmCard
        icon={<CheckCircle2 className="text-success h-6 w-6" />}
        title={t`Email updated`}
        description={message}
        action={
          <Link
            href={ROUTES.AUTH.LOGIN}
            className="border-primary bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-semibold transition"
          >
            {t`Go to sign in`}
          </Link>
        }
      />
    );
  }

  return (
    <ConfirmCard
      icon={<ShieldAlert className="text-destructive h-6 w-6" />}
      title={t`Email confirmation failed`}
      description={message}
      action={
        <Link
          href={ROUTES.AUTH.LOGIN}
          className="border-border bg-card text-foreground hover:bg-muted inline-flex items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-semibold transition"
        >
          {t`Back to sign in`}
        </Link>
      }
    />
  );
}

export default function AccountEmailChangeConfirmPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-4">
      <Suspense
        fallback={
          <ConfirmCard
            icon={<Loader2 className="text-primary h-6 w-6 animate-spin" />}
            title={t`Loading`}
            description={t`Preparing email confirmation.`}
          />
        }
      >
        <ConfirmEmailChangeContent />
      </Suspense>
    </main>
  );
}
