'use client';

import { t } from '@lingui/core/macro';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Lock, Mail, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ControlledInputField, ControlledPasswordField } from 'components/forms';
import { Button, Form } from 'components/shadcn';
import { adminQueryKeys } from 'lib/api/admin/admin-query-keys';
import {
  adminLoginSchema,
  authService,
  setStoredAdminPasswordChangeRequired,
  type AdminLoginSchema,
} from 'lib/api/admin/auth';
import { ROUTES } from 'lib/constants';

export default function AdminLoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<AdminLoginSchema>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  const handleSubmit = async (values: AdminLoginSchema) => {
    try {
      const response = await authService.loginAdmin(values);

      if (response.requiresPasswordChange) {
        queryClient.setQueryData(adminQueryKeys.authFlow(), true);
        setStoredAdminPasswordChangeRequired(true);

        router.replace(ROUTES.ADMIN.FORCE_CHANGE_PASSWORD);

        return;
      }

      queryClient.setQueryData(adminQueryKeys.authFlow(), false);
      setStoredAdminPasswordChangeRequired(false);

      if (response.user) {
        queryClient.setQueryData(adminQueryKeys.authSession(), {
          user: response.user,
        });
      } else {
        await queryClient.invalidateQueries({ queryKey: adminQueryKeys.authSession() });
      }

      router.replace(ROUTES.ADMIN.ROOT);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to log in right now.`);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eff6ff_30%,#f8fafc_60%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.12)] lg:grid-cols-[420px_1fr]">
        <aside className="relative overflow-hidden bg-[#0f172a] px-8 py-10 text-white">
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                'linear-gradient(rgba(148,163,184,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.18) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          <div className="relative z-10 flex h-full flex-col">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-400/15 text-sky-200">
              <Shield className="h-6 w-6" />
            </div>
            <p className="mt-8 text-[11px] font-medium tracking-[0.16em] text-sky-200/70 uppercase">
              {t`Administrative Access`}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">{t`NTI Control Center`}</h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
              {t`Use your admin credentials to access moderation, organization reviews, and system invites.`}
            </p>
          </div>
        </aside>

        <section className="flex items-center px-6 py-8 sm:px-10 lg:px-14">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-[11px] font-medium tracking-[0.14em] text-slate-500 uppercase">
                {t`Sign In`}
              </p>
              <h2 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
                {t`Admin Login`}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {t`Authenticate with your admin account.`}
              </p>
            </div>

            <Form {...form}>
              <form className="space-y-5" onSubmit={form.handleSubmit(handleSubmit)}>
                <ControlledInputField
                  control={form.control}
                  name="email"
                  label={t`Email Address`}
                  type="email"
                  placeholder={t`admin@nti.sk`}
                  startIcon={<Mail className="h-4 w-4" />}
                />

                <ControlledPasswordField
                  control={form.control}
                  name="password"
                  label={t`Password`}
                  placeholder={t`Enter your password`}
                  startIcon={<Lock className="h-4 w-4" />}
                />

                <Button
                  type="submit"
                  className="h-12 w-full rounded-xl bg-slate-950 text-[12px] font-semibold tracking-[0.16em] uppercase hover:bg-slate-800"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? t`Signing In...` : t`Access Admin`}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </Form>
          </div>
        </section>
      </div>
    </main>
  );
}
