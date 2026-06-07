'use client';

import { t } from '@lingui/core/macro';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Lock, Mail, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { AuthSplitShell } from 'components/layout/auth-split-shell';
import { ControlledInputField, ControlledPasswordField } from 'components/forms';
import { Button, Form } from 'components/shadcn';
import {
  adminSessionKeys,
  loginAdmin,
  setStoredAdminPasswordChangeRequired,
} from 'lib/api-client/admin/auth';
import { adminLoginSchema, type AdminLoginSchema } from 'lib/admin-auth-schemas';
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
      const response = await loginAdmin(values);

      if (response.requiresPasswordChange) {
        queryClient.setQueryData(adminSessionKeys.authFlow, true);
        setStoredAdminPasswordChangeRequired(true);

        router.replace(ROUTES.ADMIN.FORCE_CHANGE_PASSWORD);

        return;
      }

      queryClient.setQueryData(adminSessionKeys.authFlow, false);
      setStoredAdminPasswordChangeRequired(false);

      if (response.user) {
        queryClient.setQueryData(adminSessionKeys.authSession, {
          user: response.user,
        });
      } else {
        await queryClient.invalidateQueries({ queryKey: adminSessionKeys.authSession });
      }

      router.replace(ROUTES.ADMIN.ROOT);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to log in right now.`);
    }
  };

  return (
    <AuthSplitShell
      theme="admin"
      asideLead={
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-400/15 text-sky-200">
          <Shield className="h-6 w-6" />
        </div>
      }
      asideEyebrow={t`Administrative Access`}
      asideTitle={t`Admin control center`}
      asideDescription={t`Use your admin credentials to access moderation, organization reviews, and system invites.`}
      footerCta={
        <Button
          asChild
          variant="outline"
          className="border-white/20 bg-white/5 text-white hover:bg-white hover:text-slate-950"
        >
          <Link href={ROUTES.AUTH.LOGIN}>
            <ArrowLeft className="h-4 w-4" />
            {t`Standard login`}
          </Link>
        </Button>
      }
      headerEyebrow={t`Sign In`}
      headerTitle={t`Admin Login`}
      headerDescription={t`Authenticate with your admin account.`}
    >
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
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-full rounded-xl text-[12px] font-semibold tracking-[0.16em] uppercase"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? t`Signing In...` : t`Access Admin`}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </Form>
    </AuthSplitShell>
  );
}
