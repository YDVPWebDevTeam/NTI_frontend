'use client';

import { t } from '@lingui/core/macro';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useForgotPassword } from 'lib/api';
import { ROUTES } from 'lib/constants';
import { createForgotPasswordSchema, type ForgotPasswordFormValues } from 'lib/auth/schemas';
import { mapAuthError } from 'lib/auth/public-auth-flow';

import { ControlledInputField } from 'components/forms';
import { AuthSplitShell } from 'components/layout';
import { Button, Form } from 'components/shadcn';

export default function ForgotPasswordPage() {
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mutateAsync: forgotPassword, isPending } = useForgotPassword();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(createForgotPasswordSchema()),
    defaultValues: { email: '' },
    mode: 'onChange',
  });

  const handleSubmit = async (values: ForgotPasswordFormValues) => {
    setErrorMessage(null);

    try {
      await forgotPassword({
        data: {
          email: values.email.trim(),
        },
      });

      setIsSent(true);
    } catch (error) {
      const mappedError = mapAuthError(error);

      setErrorMessage(mappedError.description);
    }
  };

  return (
    <AuthSplitShell
      asideEyebrow={t`ACCOUNT RECOVERY`}
      asideTitle={t`Recover your NTI access`}
      asideDescription={t`Request a secure link and choose a new password from your email.`}
      headerEyebrow={t`FORGOT PASSWORD`}
      headerTitle={isSent ? t`Check your email` : t`Reset your password`}
      headerDescription={
        isSent
          ? t`If an account exists for that email, a reset link has been sent. Open the link to continue.`
          : t`Enter your email address and we will send you a password reset link.`
      }
    >
      {isSent ? (
        <div className="space-y-4">
          <Button
            asChild
            className="h-12 w-full rounded-sm bg-[#1e58d5] text-[12px] font-semibold tracking-widest text-white hover:bg-[#245fdc]"
          >
            <Link href={ROUTES.AUTH.LOGIN}>
              {t`RETURN TO LOGIN`}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <ControlledInputField
              control={form.control}
              name="email"
              label={t`Email Address`}
              type="email"
              placeholder={t`name@institution.edu`}
              startIcon={<Mail className="h-4 w-4" />}
            />

            {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

            <Button
              type="submit"
              disabled={isPending}
              className="h-12 w-full rounded-sm bg-[#1e58d5] text-[12px] font-semibold tracking-widest text-white hover:bg-[#245fdc]"
            >
              {isPending ? t`SENDING...` : t`SEND RESET LINK`}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button
              asChild
              variant="link"
              className="h-auto p-0 text-[13px] font-medium text-blue-600"
            >
              <Link href={ROUTES.AUTH.LOGIN}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t`Back to login`}
              </Link>
            </Button>
          </form>
        </Form>
      )}
    </AuthSplitShell>
  );
}
