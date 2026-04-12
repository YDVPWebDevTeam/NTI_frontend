'use client';

import { t } from '@lingui/core/macro';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ROUTES } from '@/src/lib/constants';
import { createLoginSchema, type LoginFormValues } from '@/src/lib/auth/schemas';
import type { AuthResponse, AuthUser } from '@/src/lib/api/auth';
import { useLoginMutation } from '@/src/lib/api/auth';

import { ControlledInputField } from '@/src/components/forms/auth/form-field-primitives';
import { Button } from '@/src/components/shadcn/button';
import { Form } from '@/src/components/shadcn/form';

function getAuthUser(response: AuthResponse | AuthUser): AuthUser {
  return 'user' in response ? response.user : response;
}

export default function LoginPage() {
  const router = useRouter();
  const { isPending: isLoginPending, mutateAsync: login } = useLoginMutation();

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
      const response = await login(values);
      const user = getAuthUser(response);

      router.push(user.status === 'PENDING' ? ROUTES.AUTH.VERIFY_EMAIL : ROUTES.ROOT);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to log in. Please try again.`);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="grid w-full grid-cols-1 overflow-hidden border border-black/10 bg-[#e7e8eb] lg:grid-cols-[400px_1fr]">
        <aside className="relative bg-[#041d67] px-6 py-8 text-white lg:px-8 lg:py-10">
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.16) 1px, transparent 0)',
              backgroundSize: '22px 22px',
            }}
          />

          <div className="relative z-10 flex h-full flex-col">
            <div>
              <p className="text-[11px] font-medium tracking-[0.14em] text-white/50">
                {t`SYSTEM IMMERSION`}
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight">
                {t`Welcome Back to NTI Engine`}
              </h1>
            </div>

            <div className="mt-auto pt-16">
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
            </div>
          </div>
        </aside>

        <section className="flex items-center bg-[#ececef] px-5 py-7 sm:px-8 sm:py-10 lg:px-12">
          <div className="w-full max-w-120">
            <div className="mb-8">
              <p className="text-[11px] font-medium tracking-[0.12em] text-neutral-500">
                {t`AUTHENTICATION GATEWAY`}
              </p>
              <h2 className="mt-2 text-4xl font-semibold tracking-tight text-[#0c1a4f]">
                {t`Sign In`}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">
                {t`Enter your credentials below to access the platform.`}
              </p>
            </div>

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

                <ControlledInputField
                  control={form.control}
                  name="password"
                  label={t`Password`}
                  type="password"
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
                  {isLoginPending ? t`SIGNING IN...` : t`ACCESS ENGINE`}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </Form>
          </div>
        </section>
      </div>
    </main>
  );
}
