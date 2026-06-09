'use client';

import { t } from '@lingui/core/macro';
import { ArrowRight, CheckCircle2, Loader2, MailCheck, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';

import { useConfirmEmail } from 'lib/api';
import {
  type AuthFlowErrorAction,
  getPostAuthRedirect,
  mapAuthError,
} from 'lib/auth/public-auth-flow';
import { ROUTES } from 'lib/constants';

import { ResendConfirmationEmail } from 'components/auth/resend-confirmation-email';
import { Button } from 'components/shadcn';

import { CompanyOwnerAuthLayout } from '../_components/company-owner-auth-layout';

type ConfirmationStatus = 'confirming' | 'success' | 'error' | 'awaiting' | 'missing-token';

const REDIRECT_DELAY_MS = 1200;

function ConfirmCompanyOwnerEmailFallback() {
  return (
    <CompanyOwnerAuthLayout
      eyebrow={t`EMAIL VERIFICATION`}
      title={t`Confirm your company owner account`}
      description={t`Verify your email address before creating your organization profile.`}
      headerEyebrow={t`VERIFICATION STEP`}
      headerTitle={t`Confirm email`}
      headerDescription={t`Loading…`}
    >
      <div className="border-info/30 bg-info/10 text-info flex items-center gap-3 rounded-sm border p-4 text-sm">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>{t`Loading…`}</span>
      </div>
    </CompanyOwnerAuthLayout>
  );
}

function ConfirmCompanyOwnerEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token')?.trim() ?? '';
  const emailFromUrl = searchParams.get('email')?.trim() ?? '';
  const hasTokenFromUrl = tokenFromUrl.length > 0;
  const hasSubmittedUrlTokenRef = useRef(false);

  const [status, setStatus] = useState<ConfirmationStatus>(() => {
    if (hasTokenFromUrl) {
      return 'confirming';
    }

    return emailFromUrl ? 'awaiting' : 'missing-token';
  });
  const [errorState, setErrorState] = useState<AuthFlowErrorAction | null>(null);

  const { mutateAsync: confirmEmail } = useConfirmEmail();

  const confirmToken = useCallback(
    async (token: string): Promise<void> => {
      setStatus('confirming');
      setErrorState(null);

      try {
        const response = await confirmEmail({
          data: {
            token: token.trim(),
          },
        });

        setStatus('success');

        window.setTimeout(() => {
          router.replace(getPostAuthRedirect(response.user, { afterEmailConfirmation: true }));
        }, REDIRECT_DELAY_MS);
      } catch (error) {
        setStatus('error');
        setErrorState(mapAuthError(error));
      }
    },
    [confirmEmail, router],
  );

  // The token comes straight from the email link and is confirmed automatically,
  // so this works even when the link is opened on a device with no session.
  useEffect(() => {
    if (!hasTokenFromUrl || hasSubmittedUrlTokenRef.current) {
      return;
    }

    hasSubmittedUrlTokenRef.current = true;

    const timeoutId = window.setTimeout(() => {
      void confirmToken(tokenFromUrl);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [confirmToken, hasTokenFromUrl, tokenFromUrl]);

  let headerTitle = t`Confirm email`;
  let headerDescription = t`Open the confirmation link from the email we sent to verify your company owner account.`;

  if (status === 'confirming') {
    headerTitle = t`Confirming email`;
    headerDescription = t`Please wait while we verify your company owner account.`;
  } else if (status === 'success') {
    headerTitle = t`Email confirmed`;
    headerDescription = t`Your email address was confirmed successfully. Redirecting you to the next step.`;
  } else if (status === 'awaiting') {
    headerTitle = t`Confirm your email`;
    headerDescription = t`We sent a confirmation link to your inbox. Open it to verify your account.`;
  } else if (status === 'error') {
    headerTitle = t`Email confirmation failed`;
    headerDescription = t`The verification link could not be completed. It may have expired or already been used.`;
  }

  return (
    <CompanyOwnerAuthLayout
      eyebrow={t`EMAIL VERIFICATION`}
      title={t`Confirm your company owner account`}
      description={t`Verify your email address before creating your organization profile.`}
      headerEyebrow={t`VERIFICATION STEP`}
      headerTitle={headerTitle}
      headerDescription={headerDescription}
    >
      {status === 'confirming' ? (
        <div className="border-info/30 bg-info/10 text-info flex items-center gap-3 rounded-sm border p-4 text-sm">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{t`Confirming your email address...`}</span>
        </div>
      ) : null}

      {status === 'success' ? (
        <div className="space-y-5">
          <div className="border-success/30 bg-success/10 text-success flex items-center gap-3 rounded-sm border p-4 text-sm">
            <CheckCircle2 className="h-5 w-5" />
            <span>{t`Email confirmed successfully.`}</span>
          </div>

          <Button
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-full rounded-sm text-[12px] font-semibold tracking-widest"
          >
            <Link href={ROUTES.AUTH.REGISTER_COMPANY_ORGANIZATION}>
              {t`CONTINUE`}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : null}

      {status === 'awaiting' ? (
        <div className="space-y-5">
          <div className="border-border bg-card text-foreground rounded-xl border px-4 py-4 text-sm">
            <p className="flex items-center gap-2">
              <MailCheck className="text-primary h-4 w-4" aria-hidden="true" />
              {t`We sent a confirmation link to`}{' '}
              <span className="text-foreground font-medium">{emailFromUrl}</span>.
            </p>
            <p className="text-muted-foreground mt-2">
              {t`Open that link from any device to confirm your email — it works even if you are signed out.`}
            </p>
          </div>

          <ResendConfirmationEmail email={emailFromUrl} />

          <Button
            asChild
            variant="link"
            className="text-primary h-auto p-0 text-[13px] font-medium"
          >
            <Link href={ROUTES.AUTH.LOGIN}>{t`Back to login`}</Link>
          </Button>
        </div>
      ) : null}

      {status === 'missing-token' || status === 'error' ? (
        <div className="space-y-5">
          <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-3 rounded-sm border p-4 text-sm">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold">
                {status === 'missing-token'
                  ? t`This link is incomplete`
                  : (errorState?.title ?? t`Email confirmation failed`)}
              </p>
              <p>
                {status === 'missing-token'
                  ? t`Open the full confirmation link from your email. If it still does not work, request a new confirmation email below or from the login page.`
                  : (errorState?.description ?? t`The verification link could not be completed.`)}
              </p>
            </div>
          </div>

          {emailFromUrl ? <ResendConfirmationEmail email={emailFromUrl} /> : null}

          <Button
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-full rounded-sm text-[12px] font-semibold tracking-widest"
          >
            <Link href={errorState?.href ?? ROUTES.AUTH.LOGIN}>
              {errorState?.actionLabel ?? t`RETURN TO LOGIN`}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : null}
    </CompanyOwnerAuthLayout>
  );
}

export default function ConfirmCompanyOwnerEmailPage() {
  return (
    <Suspense fallback={<ConfirmCompanyOwnerEmailFallback />}>
      <ConfirmCompanyOwnerEmailContent />
    </Suspense>
  );
}
