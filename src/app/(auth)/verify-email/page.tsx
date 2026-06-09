'use client';

import { t } from '@lingui/core/macro';
import { ArrowRight, CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';
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

import { AuthSplitShell } from 'components/layout/auth-split-shell';
import { Button } from 'components/shadcn';

type VerificationStatus = 'confirming' | 'success' | 'error' | 'missing-token';

const REDIRECT_DELAY_MS = 1200;

function VerifyEmailFallback() {
  return (
    <AuthSplitShell
      asideEyebrow={t`EMAIL VERIFICATION`}
      asideTitle={t`Confirm your NTI account`}
      asideDescription={t`Verify your email address to activate your account and continue with onboarding.`}
      headerEyebrow={t`VERIFY EMAIL`}
      headerTitle={t`Verify your email`}
      headerDescription={t`Loading…`}
    >
      <div className="border-info/30 bg-info/10 text-info flex items-center gap-3 rounded-sm border p-4 text-sm">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>{t`Loading…`}</span>
      </div>
    </AuthSplitShell>
  );
}

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token')?.trim() ?? '';
  const hasTokenFromUrl = tokenFromUrl.length > 0;
  const hasSubmittedUrlTokenRef = useRef(false);

  const [status, setStatus] = useState<VerificationStatus>(
    hasTokenFromUrl ? 'confirming' : 'missing-token',
  );
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

  // The token is taken straight from the email link and confirmed automatically.
  // This works on any device, even one with no existing session, because the
  // token itself is the proof of email ownership.
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

  let headerTitle = t`Verify your email`;
  let headerDescription = t`Open the confirmation link from the email we sent you to finish verifying your account.`;

  if (status === 'confirming') {
    headerTitle = t`Confirming your email`;
    headerDescription = t`Please wait while we verify your email address.`;
  } else if (status === 'success') {
    headerTitle = t`Email confirmed`;
    headerDescription = t`Your email address was confirmed successfully. Redirecting you to your workspace.`;
  } else if (status === 'error') {
    headerTitle = t`Verification failed`;
    headerDescription = t`The verification link could not be completed. It may have expired or already been used.`;
  }

  return (
    <AuthSplitShell
      asideEyebrow={t`EMAIL VERIFICATION`}
      asideTitle={t`Confirm your NTI account`}
      asideDescription={t`Verify your email address to activate your account and continue with onboarding.`}
      headerEyebrow={t`VERIFY EMAIL`}
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
            <Link href={ROUTES.AUTH.LOGIN}>
              {t`CONTINUE`}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
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
                  : (errorState?.title ?? t`Verification failed`)}
              </p>
              <p>
                {status === 'missing-token'
                  ? t`Open the full confirmation link from your email. If it still does not work, request a new confirmation email from the login page.`
                  : (errorState?.description ?? t`The verification link could not be completed.`)}
              </p>
            </div>
          </div>

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
    </AuthSplitShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
