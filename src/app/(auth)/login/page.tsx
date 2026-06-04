'use client';

import { t } from '@lingui/core/macro';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { getDefaultRouteForRole } from 'lib/auth/access';
import { getGetMeQueryOptions, useLogin } from 'lib/api';
import { ROUTES } from 'lib/constants';
import { createLoginSchema, type LoginFormValues } from 'lib/auth/schemas';

import { ControlledInputField, ControlledPasswordField } from 'components/forms';
import { AuthSplitShell } from 'components/layout';
import { Button } from 'components/shadcn';
import { Form } from 'components/shadcn';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { isPending: isLoginPending, mutateAsync: login } = useLogin();
  const accountAction = searchParams.get('accountAction');
  const changedEmail = searchParams.get('email')?.trim() ?? '';
  const nextPath = searchParams.get('next')?.trim() ?? '';
  const safeNextPath = nextPath.startsWith('/') && !nextPath.startsWith('//') ? nextPath : null;

  let accountActionMessage: string | null = null;

  if (accountAction === 'password-changed') {
    accountActionMessage = t`Your password was updated. Sign in again with the new password to continue.`;
  } else if (accountAction === 'email-changed') {
    accountActionMessage = changedEmail
      ? t`Your email was updated to ${changedEmail}. Sign in again with the new address to continue.`
      : t`Your email was updated. Sign in again with the new address to continue.`;
  } else if (accountAction === 'session-expired') {
    accountActionMessage = t`Your session expired during a protected account change. Sign in again to continue.`;
  }

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(createLoginSchema()),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      await login({ data: values });
      const me = await queryClient.fetchQuery(
        getGetMeQueryOptions({
          query: {
            retry: false,
          },
        }),
      );

      router.push(safeNextPath ?? getDefaultRouteForRole(me.role));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to log in. Please try again.`);
    }
  };

  return (
    <AuthSplitShell
      asideEyebrow={t`PLATFORM ACCESS`}
      asideTitle={t`Welcome back to NTI`}
      asideDescription={t`Sign in to continue with your student, team, or organization workflow.`}
      headerEyebrow={t`SIGN IN`}
      headerTitle={t`Access your account`}
      headerDescription={t`Enter your credentials below to access the platform.`}
      footerCta={
        <>
          <p className="text-sm font-medium text-white/70">{t`Don't have an account yet?`}</p>
          <Button
            asChild
            variant="outline"
            className="mt-4 border-white/20 bg-white/5 text-white hover:bg-white hover:text-[#041d67]"
          >
            <Link href={ROUTES.AUTH.REGISTER_SELECT}>
              {t`CREATE ACCOUNT`}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          {accountActionMessage ? (
            <div className="rounded-sm border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-950">
              {accountActionMessage}
            </div>
          ) : null}

          <ControlledInputField
            control={form.control}
            name="email"
            label={t`Email Address`}
            type="email"
            placeholder={t`name@institution.edu`}
            startIcon={<Mail className="h-4 w-4" />}
          />

          <ControlledPasswordField
            control={form.control}
            name="password"
            label={t`Password`}
            placeholder={t`Enter your password`}
            startIcon={<Lock className="h-4 w-4" />}
          />

          <div className="flex justify-between pt-2">
            <Button
              asChild
              variant="link"
              className="h-auto p-0 text-[13px] font-medium text-blue-600"
            >
              <Link href={ROUTES.AUTH.FORGOT_PASSWORD}>{t`Forgot password?`}</Link>
            </Button>
          </div>

          <Button
            type="submit"
            disabled={isLoginPending}
            className="h-12 w-full rounded-sm bg-[#1e58d5] text-[12px] font-semibold tracking-widest text-white hover:bg-[#245fdc]"
          >
            {isLoginPending ? t`SIGNING IN...` : t`ACCESS PLATFORM`}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </Form>
    </AuthSplitShell>
  );
}
