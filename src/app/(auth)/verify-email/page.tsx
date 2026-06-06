'use client';

import { t } from '@lingui/core/macro';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, CheckCircle2, KeyRound, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useConfirmEmail } from 'lib/api';
import {
  type AuthFlowErrorAction,
  getPostAuthRedirect,
  mapAuthError,
} from 'lib/auth/public-auth-flow';
import { createEmailVerificationSchema, type EmailVerificationFormValues } from 'lib/auth/schemas';
import { ROUTES } from 'lib/constants';

import { ControlledInputField } from 'components/forms';
import { AuthSplitShell } from 'components/layout';
import { Button, Form } from 'components/shadcn';

type VerificationStatus = 'idle' | 'confirming' | 'success' | 'error';

const REDIRECT_DELAY_MS = 1200;

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token')?.trim() ?? '';
  const hasTokenFromUrl = tokenFromUrl.length > 0;
  const hasSubmittedUrlTokenRef = useRef(false);

  const [status, setStatus] = useState<VerificationStatus>(hasTokenFromUrl ? 'confirming' : 'idle');
  const [errorState, setErrorState] = useState<AuthFlowErrorAction | null>(null);

  const { mutateAsync: confirmEmail, isPending } = useConfirmEmail();

  const form = useForm<EmailVerificationFormValues>({
    resolver: zodResolver(createEmailVerificationSchema()),
    defaultValues: {
      token: tokenFromUrl,
    },
    mode: 'onChange',
  });

  const { setValue } = form;

  useEffect(() => {
    if (hasTokenFromUrl) {
      setValue('token', tokenFromUrl, { shouldValidate: true });
    }
  }, [hasTokenFromUrl, setValue, tokenFromUrl]);

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
          router.replace(getPostAuthRedirect(response.user));
        }, REDIRECT_DELAY_MS);
      } catch (error) {
        const mappedError = mapAuthError(error);

        setStatus('error');
        setErrorState(mappedError);
      }
    },
    [confirmEmail, router],
  );

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

  const handleSubmit = async (values: EmailVerificationFormValues): Promise<void> => {
    await confirmToken(values.token);
  };

  let headerTitle = t`Verify your email`;
  let headerDescription = t`Paste your verification token if the email link did not open correctly.`;

  if (status === 'confirming') {
    headerTitle = t`Confirming your email`;
    headerDescription = t`Please wait while we verify your email address.`;
  }

  if (status === 'success') {
    headerTitle = t`Email confirmed`;
    headerDescription = t`Your email address was confirmed successfully. Redirecting you to your workspace.`;
  }

  if (status === 'error') {
    headerTitle = t`Verification failed`;
    headerDescription = t`The verification link could not be completed. You can try again or return to login.`;
  }

  const isConfirming = status === 'confirming';
  const isSuccess = status === 'success';
  const shouldShowManualForm = status === 'idle' || status === 'error';

  return (
    <AuthSplitShell
      asideEyebrow={t`EMAIL VERIFICATION`}
      asideTitle={t`Confirm your NTI account`}
      asideDescription={t`Verify your email address to activate your account and continue with onboarding.`}
      headerEyebrow={t`VERIFY EMAIL`}
      headerTitle={headerTitle}
      headerDescription={headerDescription}
    >
      {isConfirming ? (
        <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-sm border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t`Confirming your email address...`}</span>
          </div>
        </div>
      ) : null}

      {isSuccess ? (
        <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-sm border border-green-100 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle2 className="h-5 w-5" />
            <span>{t`Email confirmed successfully.`}</span>
          </div>

          <Button
            asChild
            className="h-12 w-full rounded-sm bg-[#1e58d5] text-[12px] font-semibold tracking-widest text-white hover:bg-[#245fdc]"
          >
            <Link href={ROUTES.AUTH.LOGIN}>
              {t`CONTINUE`}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="space-y-5">
          {errorState ? (
            <div className="space-y-2 rounded-sm border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p className="font-semibold">{errorState.title}</p>
              <p>{errorState.description}</p>

              {errorState.href && errorState.actionLabel ? (
                <Button asChild variant="link" className="h-auto p-0 text-red-700">
                  <Link href={errorState.href}>{errorState.actionLabel}</Link>
                </Button>
              ) : null}
            </div>
          ) : null}

          {hasTokenFromUrl ? (
            <Button
              asChild
              className="h-12 w-full rounded-sm bg-[#1e58d5] text-[12px] font-semibold tracking-widest text-white hover:bg-[#245fdc]"
            >
              <Link href={ROUTES.AUTH.LOGIN}>
                {t`RETURN TO LOGIN`}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : null}
        </div>
      ) : null}

      {shouldShowManualForm ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <ControlledInputField
              control={form.control}
              name="token"
              label={t`Verification token`}
              type="text"
              placeholder={t`Paste verification token`}
              startIcon={<KeyRound className="h-4 w-4" />}
            />

            <Button
              type="submit"
              disabled={isPending}
              className="h-12 w-full rounded-sm bg-[#1e58d5] text-[12px] font-semibold tracking-widest text-white hover:bg-[#245fdc]"
            >
              {isPending ? t`CONFIRMING...` : t`CONFIRM EMAIL`}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button
              asChild
              variant="link"
              className="h-auto p-0 text-[13px] font-medium text-blue-600"
            >
              <Link href={ROUTES.AUTH.LOGIN}>{t`Back to login`}</Link>
            </Button>
          </form>
        </Form>
      ) : null}
    </AuthSplitShell>
  );
}
