'use client';

import { t } from '@lingui/core/macro';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, KeyRound, Lock } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useResetPassword } from 'lib/api';
import { type AuthFlowErrorAction, mapAuthError } from 'lib/auth/public-auth-flow';
import { createResetPasswordSchema, type ResetPasswordFormValues } from 'lib/auth/schemas';
import { ROUTES } from 'lib/constants';

import { ControlledInputField, ControlledPasswordField } from 'components/forms';
import { AuthSplitShell } from 'components/layout';
import { Button, Form } from 'components/shadcn';

export default function ResetPasswordPage() {
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

  const { setValue } = form;

  useEffect(() => {
    if (hasTokenFromUrl) {
      setValue('token', tokenFromUrl, { shouldValidate: true });
    }
  }, [hasTokenFromUrl, setValue, tokenFromUrl]);

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

  let headerDescription = t`Paste your reset token only if the email link did not open correctly.`;

  if (isSuccess) {
    headerDescription = t`Your password was reset successfully. You can now sign in with the new password.`;
  } else if (hasTokenFromUrl) {
    headerDescription = t`Enter a new password for your account.`;
  }

  return (
    <AuthSplitShell
      asideEyebrow={t`PASSWORD RESET`}
      asideTitle={t`Choose a new password`}
      asideDescription={t`Use the secure reset link from your email to update your NTI password.`}
      headerEyebrow={t`RESET PASSWORD`}
      headerTitle={isSuccess ? t`Password updated` : t`Create new password`}
      headerDescription={headerDescription}
    >
      {isSuccess ? (
        <Button
          asChild
          className="h-12 w-full rounded-sm bg-[#1e58d5] text-[12px] font-semibold tracking-widest text-white hover:bg-[#245fdc]"
        >
          <Link href={ROUTES.AUTH.LOGIN}>
            {t`RETURN TO LOGIN`}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            {hasTokenFromUrl ? null : (
              <ControlledInputField
                control={form.control}
                name="token"
                label={t`Reset token`}
                type="text"
                placeholder={t`Paste reset token`}
                startIcon={<KeyRound className="h-4 w-4" />}
              />
            )}

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

            <Button
              type="submit"
              disabled={isPending}
              className="h-12 w-full rounded-sm bg-[#1e58d5] text-[12px] font-semibold tracking-widest text-white hover:bg-[#245fdc]"
            >
              {isPending ? t`RESETTING...` : t`RESET PASSWORD`}
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
      )}
    </AuthSplitShell>
  );
}
