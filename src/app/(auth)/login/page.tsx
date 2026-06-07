'use client';

import { t } from '@lingui/core/macro';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getGetMeQueryKey, useLogin } from 'lib/api';
import { getPostAuthRedirect, mapAuthError } from 'lib/auth/public-auth-flow';
import { createLoginSchema, type LoginFormValues } from 'lib/auth/schemas';
import { ROUTES } from 'lib/constants';

import { ControlledInputField, ControlledPasswordField } from 'components/forms';
import { AuthSplitShell } from 'components/layout/auth-split-shell';
import { Button, Form } from 'components/shadcn';

type AccountActionBanner = {
  title: string;
  description: string;
};

// Maps the `accountAction` query param produced by
// features/account-settings/hooks/use-account-security.ts (ReauthReason) to a
// contextual banner shown on the login page after the user is redirected here.
function getAccountActionBanner(accountAction: string | null): AccountActionBanner | null {
  switch (accountAction) {
    case 'email-changed':
      return {
        title: t`Email updated`,
        description: t`Your email address was changed. Please sign in again with your new email.`,
      };

    case 'password-changed':
      return {
        title: t`Password updated`,
        description: t`Your password was changed. Please sign in again with your new password.`,
      };

    case 'session-expired':
      return {
        title: t`Session expired`,
        description: t`Your session is no longer valid. Please sign in again to continue.`,
      };

    default:
      return null;
  }
}

// Only allow same-origin relative paths to avoid open-redirect issues.
function sanitizeRedirectTarget(value: string | null): string | null {
  if (!value) {
    return null;
  }

  if (!value.startsWith('/') || value.startsWith('//')) {
    return null;
  }

  return value;
}

function LoginContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const { mutateAsync: login, isPending: isLoginPending } = useLogin();

  const accountAction = searchParams.get('accountAction');
  const emailFromUrl = searchParams.get('email')?.trim() ?? '';
  const redirectTarget = useMemo(
    () => sanitizeRedirectTarget(searchParams.get('next') ?? searchParams.get('redirectTo')),
    [searchParams],
  );

  const accountActionBanner = useMemo(() => getAccountActionBanner(accountAction), [accountAction]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(createLoginSchema()),
    defaultValues: {
      email: emailFromUrl,
      password: '',
    },
    mode: 'onChange',
  });

  const handleSubmit = async (values: LoginFormValues): Promise<void> => {
    try {
      const response = await login({
        data: {
          email: values.email.trim(),
          password: values.password,
        },
      });

      queryClient.setQueryData(getGetMeQueryKey(), response.user);

      // Honor a sanitized `next`/`redirectTo` target only for active users that
      // would otherwise land on their default route; fall back to the
      // role/status-aware redirect for everyone else.
      const postAuthRedirect = getPostAuthRedirect(response.user);

      if (redirectTarget && postAuthRedirect !== ROUTES.AUTH.LOGIN) {
        router.push(redirectTarget);

        return;
      }

      router.push(postAuthRedirect);
    } catch (error) {
      const mappedError = mapAuthError(error);

      toast.error(mappedError.description);
    }
  };

  return (
    <AuthSplitShell
      asideEyebrow={t`WELCOME BACK`}
      asideTitle={t`Sign in to your NTI workspace`}
      asideDescription={t`Continue your onboarding, track applications, and manage your NTI profile from one place.`}
      headerEyebrow={t`SIGN IN`}
      headerTitle={t`Access your account`}
      headerDescription={t`Use your email and password to continue.`}
      footerCta={
        <div className="space-y-3 text-sm text-white/80">
          <p>{t`New to NTI?`}</p>

          <Button
            asChild
            variant="outline"
            className="h-11 rounded-sm border-white/30 bg-transparent text-[12px] font-semibold tracking-widest text-white hover:bg-white hover:text-[#041d67]"
          >
            <Link href={ROUTES.AUTH.REGISTER_SELECT}>{t`CREATE AN ACCOUNT`}</Link>
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          {accountActionBanner ? (
            <div
              className="border-info/30 bg-info/10 text-info space-y-1 rounded-sm border p-4 text-sm"
              aria-live="polite"
            >
              <p className="font-semibold">{accountActionBanner.title}</p>
              <p>{accountActionBanner.description}</p>
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
            placeholder={t`Enter password`}
            startIcon={<Lock className="h-4 w-4" />}
          />

          <div className="flex justify-end">
            <Button
              asChild
              variant="link"
              className="text-primary h-auto p-0 text-[13px] font-medium"
            >
              <Link href={ROUTES.AUTH.FORGOT_PASSWORD}>{t`Forgot password?`}</Link>
            </Button>
          </div>

          <Button
            type="submit"
            disabled={isLoginPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-full rounded-sm text-[12px] font-semibold tracking-widest"
          >
            {isLoginPending ? t`SIGNING IN...` : t`SIGN IN`}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <div className="border-t border-black/10 pt-5">
            <p className="text-muted-foreground text-sm">
              {t`Registering as a company?`}{' '}
              <Link
                href={ROUTES.AUTH.REGISTER_COMPANY}
                className="text-primary hover:text-primary/90 font-semibold"
              >
                {t`Create company owner account`}
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </AuthSplitShell>
  );
}

function LoginFallback() {
  return (
    <AuthSplitShell
      asideEyebrow={t`WELCOME BACK`}
      asideTitle={t`Sign in to your NTI workspace`}
      asideDescription={t`Continue your onboarding, track applications, and manage your NTI profile from one place.`}
      headerEyebrow={t`SIGN IN`}
      headerTitle={t`Access your account`}
      headerDescription={t`Loading…`}
    >
      <div className="h-12 w-full animate-pulse rounded-sm bg-black/5" />
    </AuthSplitShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}
