'use client';

import { t } from '@lingui/core/macro';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useConfirmEmailMutation } from 'lib/api';
import { ROUTES } from 'lib/constants';

import { ControlledInputField } from 'components/forms';
import { Button, Form } from 'components/shadcn';

import { CompanyOwnerAuthLayout } from '../_components/company-owner-auth-layout';
import {
  createCompanyOwnerEmailConfirmationSchema,
  type CompanyOwnerEmailConfirmationValues,
} from './schema';

export default function ConfirmCompanyOwnerEmailPage() {
  const router = useRouter();

  const { mutateAsync: confirmEmail, isPending } = useConfirmEmailMutation();

  const form = useForm<CompanyOwnerEmailConfirmationValues>({
    resolver: zodResolver(createCompanyOwnerEmailConfirmationSchema()),
    defaultValues: { token: '' },
    mode: 'onChange',
  });

  const handleSubmit = async (values: CompanyOwnerEmailConfirmationValues) => {
    try {
      await confirmEmail({
        token: values.token.trim(),
      });

      router.push(ROUTES.AUTH.REGISTER_COMPANY_ORGANIZATION);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Email confirmation failed`);
    }
  };

  return (
    <CompanyOwnerAuthLayout
      eyebrow={t`EMAIL VERIFICATION`}
      title={t`Confirm your company owner account`}
      description={t`Verify your email address before creating your organization profile.`}
    >
      <div className="mb-8">
        <p className="text-[11px] font-medium tracking-[0.12em] text-neutral-500">
          {t`VERIFICATION STEP`}
        </p>

        <h2 className="mt-2 text-4xl font-semibold tracking-tight text-[#0c1a4f]">
          {t`Confirm email`}
        </h2>

        <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">
          {t`Enter the verification token from your email.`}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          <ControlledInputField
            control={form.control}
            name="token"
            label={t`Verification token`}
            type="text"
            placeholder={t`Paste your verification token`}
          />

          <Button
            type="submit"
            disabled={isPending}
            className="h-12 w-full rounded-sm bg-[#1e58d5] text-[12px] font-semibold tracking-widest text-white hover:bg-[#245fdc]"
          >
            {isPending ? t`CONFIRMING...` : t`CONFIRM EMAIL`}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </Form>
    </CompanyOwnerAuthLayout>
  );
}
