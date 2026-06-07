'use client';

import { t } from '@lingui/core/macro';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Lock, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { type ReactNode, Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useResetPassword } from 'lib/api';
import { type AuthFlowErrorAction, mapAuthError } from 'lib/auth/public-auth-flow';
import { createResetPasswordSchema, type ResetPasswordFormValues } from 'lib/auth/schemas';
import { ROUTES } from 'lib/constants';

import { ControlledPasswordField } from 'components/forms';
import { AuthSplitShell } from 'components/layout/auth-split-shell';
import { Button, Form } from 'components/shadcn';

function ResetPasswordFallback() {
  return (
    <AuthSplitShell
      asideEyebrow={t`PASSWORD RESET`}
      asideTitle={t`Choose a new password`}
      asideDescription={t`Use the secure reset link from your email to update your NTI password.`}
      headerEyebrow={t`RESET PASSWORD`}
      headerTitle={t`Create new password`}
      headerDescription={t`Loading…`}
    >
      <div className="h-12 w-full animate-pulse rounded-sm bg-black/5" />
    </AuthSplitShell>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token')?.trim() ?? '';
  const hasTokenFromUrl = tokenFromUrl.length > 0;

  const [isSuccess, setIsSuccess] = useState(false);
  const [errorState, setErrorState] = useState<AuthFlowErrorAction | null>(null);

  const { mutateAsync: resetPassword, isPending } = useResetPassword();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(createResetPasswordSchema()),
    defaultValues: {
      token: tokenFromUrl,
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const handleSubmit = async (values: ResetPasswordFormValues): Promise<void> => {
    setErrorState(null);

    try {
      await resetPassword({
        data: {
          token: values.token.trim(),
          password: values.password,
        },
      });

      setIsSuccess(true);
    } catch (error) {
      const mappedError = mapAuthError(error);

      setErrorState(mappedError);
    }
  };

  let headerTitle = t`Reset link incomplete`;
  let headerDescription = t`Open the full password reset link from your email.`;

  if (isSuccess) {
    headerTitle = t`Password updated`;
    headerDescription = t`Your password was reset successfully. You can now sign in with the new password.`;
  } else if (hasTokenFromUrl) {
    headerTitle = t`Create new password`;
    headerDescription = t`Enter a new password for your account.`;
  }

  let body: ReactNode;

  if (isSuccess) {
    body = (
      <Button
        asChild
        className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-full rounded-sm text-[12px] font-semibold tracking-widest"
      >
        <Link href={ROUTES.AUTH.LOGIN}>
          {t`RETURN TO LOGIN`}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    );
  } else if (hasTokenFromUrl) {
    body = (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          <ControlledPasswordField
            control={form.control}
            name="password"
            label={t`New password`}
            placeholder={t`Enter new password`}
            startIcon={<Lock className="h-4 w-4" />}
          />

          <ControlledPasswordField
            control={form.control}
            name="confirmPassword"
            label={t`Confirm new password`}
            placeholder={t`Repeat new password`}
            startIcon={<Lock className="h-4 w-4" />}
          />

          {errorState ? (
            <div className="border-destructive/30 bg-destructive/10 text-destructive space-y-2 rounded-sm border p-4 text-sm">
              <p className="font-semibold">{errorState.title}</p>
              <p>{errorState.description}</p>

              {errorState.href && errorState.actionLabel ? (
                <Button asChild variant="link" className="text-destructive h-auto p-0">
                  <Link href={errorState.href}>{errorState.actionLabel}</Link>
                </Button>
              ) : null}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-full rounded-sm text-[12px] font-semibold tracking-widest"
          >
            {isPending ? t`RESETTING...` : t`RESET PASSWORD`}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <Button
            asChild
            variant="link"
            className="text-primary h-auto p-0 text-[13px] font-medium"
          >
            <Link href={ROUTES.AUTH.LOGIN}>{t`Back to login`}</Link>
          </Button>
        </form>
      </Form>
    );
  } else {
    body = (
      <div className="space-y-5">
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-3 rounded-sm border p-4 text-sm">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="space-y-1">
            <p className="font-semibold">{t`This link is incomplete`}</p>
            <p>{t`Open the full reset link from your email. If it expired, request a new one from the forgot password page.`}</p>
          </div>
        </div>

        <Button
          asChild
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-full rounded-sm text-[12px] font-semibold tracking-widest"
        >
          <Link href={ROUTES.AUTH.FORGOT_PASSWORD}>
            {t`REQUEST NEW LINK`}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <AuthSplitShell
      asideEyebrow={t`PASSWORD RESET`}
      asideTitle={t`Choose a new password`}
      asideDescription={t`Use the secure reset link from your email to update your NTI password.`}
      headerEyebrow={t`RESET PASSWORD`}
      headerTitle={headerTitle}
      headerDescription={headerDescription}
    >
      {body}
    </AuthSplitShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
