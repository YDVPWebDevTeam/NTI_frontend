'use client';

import { t } from '@lingui/core/macro';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useLogin } from 'lib/api';
import { getPostAuthRedirect, mapAuthError } from 'lib/auth/public-auth-flow';
import { createLoginSchema, type LoginFormValues } from 'lib/auth/schemas';
import { ROUTES } from 'lib/constants';

import { ControlledInputField, ControlledPasswordField } from 'components/forms';
import { AuthSplitShell } from 'components/layout';
import { Button, Form } from 'components/shadcn';

export default function LoginPage() {
  const router = useRouter();
  const { mutateAsync: login, isPending: isLoginPending } = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(createLoginSchema()),
    defaultValues: {
      email: '',
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

      router.push(getPostAuthRedirect(response.user));
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
            <Link href={ROUTES.AUTH.REGISTER_STUDENT}>{t`CREATE STUDENT ACCOUNT`}</Link>
          </Button>
        </div>
      }
    >
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
            {isLoginPending ? t`SIGNING IN...` : t`SIGN IN`}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <div className="border-t border-black/10 pt-5">
            <p className="text-sm text-slate-600">
              {t`Registering as a company?`}{' '}
              <Link
                href={ROUTES.AUTH.REGISTER_COMPANY}
                className="font-semibold text-blue-600 hover:text-blue-700"
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
