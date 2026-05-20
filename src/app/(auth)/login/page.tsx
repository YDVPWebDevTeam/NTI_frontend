'use client';

import { t } from '@lingui/core/macro';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ROUTES } from 'lib/constants';
import { createLoginSchema, type LoginFormValues } from 'lib/auth/schemas';
import { useLogin } from 'lib/api';

import { ControlledInputField, ControlledPasswordField } from 'components/forms';
import { AuthSplitShell } from 'components/layout';
import { Button } from 'components/shadcn';
import { Form } from 'components/shadcn';

export default function LoginPage() {
  const router = useRouter();
  const { isPending: isLoginPending, mutateAsync: login } = useLogin();

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

      router.push(ROUTES.DASHBOARD);
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
