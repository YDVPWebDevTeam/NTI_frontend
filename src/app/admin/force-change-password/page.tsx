'use client';

import { t } from '@lingui/core/macro';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, KeyRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ControlledPasswordField } from 'components/forms';
import { Button, Form } from 'components/shadcn';
import { adminQueryKeys } from 'lib/api/admin/admin-query-keys';
import {
  forceChangePasswordSchema,
  authService,
  setStoredAdminPasswordChangeRequired,
  type ForceChangePasswordSchema,
} from 'lib/api/admin/auth';
import { ROUTES } from 'lib/constants';

export default function AdminForceChangePasswordPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<ForceChangePasswordSchema>({
    resolver: zodResolver(forceChangePasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmNewPassword: '',
    },
    mode: 'onChange',
  });

  const handleSubmit = async (values: ForceChangePasswordSchema) => {
    try {
      const session = await authService.forceChangePassword(values);

      queryClient.setQueryData(adminQueryKeys.authFlow(), false);
      setStoredAdminPasswordChangeRequired(false);
      queryClient.setQueryData(adminQueryKeys.authSession(), session);
      router.replace(ROUTES.ADMIN.ROOT);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to change the password.`);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8 sm:px-6">
      <div className="w-full max-w-xl rounded-[28px] border border-slate-800 bg-slate-900 p-8 text-slate-50 shadow-[0_40px_120px_rgba(2,6,23,0.55)] sm:p-10">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-400/15 text-sky-200">
          <KeyRound className="h-6 w-6" />
        </div>
        <p className="mt-6 text-[11px] font-medium tracking-[0.16em] text-sky-200/70 uppercase">
          {t`Password Reset Required`}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{t`Set a new admin password`}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          {t`This account must update its password before the admin session can continue.`}
        </p>

        <Form {...form}>
          <form className="mt-8 space-y-5" onSubmit={form.handleSubmit(handleSubmit)}>
            <ControlledPasswordField
              control={form.control}
              name="newPassword"
              label={t`New Password`}
              placeholder={t`Enter a strong password`}
            />
            <ControlledPasswordField
              control={form.control}
              name="confirmNewPassword"
              label={t`Confirm Password`}
              placeholder={t`Repeat the new password`}
            />

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="h-12 w-full rounded-xl bg-sky-500 text-[12px] font-semibold tracking-[0.16em] text-slate-950 uppercase hover:bg-sky-400"
            >
              {form.formState.isSubmitting ? t`Updating...` : t`Save New Password`}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </Form>
      </div>
    </main>
  );
}
