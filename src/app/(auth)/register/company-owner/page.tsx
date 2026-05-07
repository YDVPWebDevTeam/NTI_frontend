'use client';

import { t } from '@lingui/core/macro';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { useRegisterCompanyOwnerMutation } from 'lib/api';
import { ROUTES } from 'lib/constants';

import { ControlledInputField, ControlledPasswordField } from 'components/forms';
import { Button, Form } from 'components/shadcn';

import { CompanyOwnerAuthLayout } from './_components/company-owner-auth-layout';

const COMPANY_OWNER_NAME_MIN_LENGTH = 2;
const COMPANY_OWNER_NAME_MAX_LENGTH = 50;
const COMPANY_OWNER_PASSWORD_MIN_LENGTH = 6;

function createCompanyOwnerRegistrationSchema() {
  return z.object({
    email: z.email({
      message: t`Please enter a valid email address.`,
    }),
    firstName: z
      .string()
      .trim()
      .min(COMPANY_OWNER_NAME_MIN_LENGTH, {
        message: t`First name must be at least 2 characters.`,
      })
      .max(COMPANY_OWNER_NAME_MAX_LENGTH, {
        message: t`First name must be at most 50 characters.`,
      }),
    lastName: z
      .string()
      .trim()
      .min(COMPANY_OWNER_NAME_MIN_LENGTH, {
        message: t`Last name must be at least 2 characters.`,
      })
      .max(COMPANY_OWNER_NAME_MAX_LENGTH, {
        message: t`Last name must be at most 50 characters.`,
      }),
    password: z.string().min(COMPANY_OWNER_PASSWORD_MIN_LENGTH, {
      message: t`Password must be at least 6 characters.`,
    }),
  });
}

type CompanyOwnerRegistrationValues = z.infer<
  ReturnType<typeof createCompanyOwnerRegistrationSchema>
>;

export default function RegisterCompanyOwnerPage() {
  const router = useRouter();

  const { mutateAsync: registerCompanyOwner, isPending } = useRegisterCompanyOwnerMutation();

  const form = useForm<CompanyOwnerRegistrationValues>({
    resolver: zodResolver(createCompanyOwnerRegistrationSchema()),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
    },
    mode: 'onChange',
  });

  const handleSubmit = async (values: CompanyOwnerRegistrationValues) => {
    try {
      await registerCompanyOwner({
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        password: values.password,
      });

      sessionStorage.setItem('companyOwnerEmail', values.email);

      form.reset({
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        password: '',
      });

      router.push(ROUTES.AUTH.REGISTER_COMPANY_CONFIRM_EMAIL);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Registration failed`);
    }
  };

  return (
    <CompanyOwnerAuthLayout
      eyebrow={t`COMPANY OWNER GATEWAY`}
      title={t`Create your company owner account`}
      description={t`Register your account to continue with organization onboarding.`}
    >
      <div className="mb-8">
        <p className="text-[11px] font-medium tracking-[0.12em] text-neutral-500">
          {t`ACCOUNT SETUP`}
        </p>

        <h2 className="mt-2 text-4xl font-semibold tracking-tight text-[#0c1a4f]">
          {t`Register company owner`}
        </h2>

        <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">
          {t`Create your company owner account to continue with organization registration.`}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          <ControlledInputField
            control={form.control}
            name="email"
            label={t`Email`}
            type="email"
            placeholder={t`owner@example.com`}
          />

          <ControlledInputField
            control={form.control}
            name="firstName"
            label={t`First name`}
            type="text"
            placeholder={t`John`}
          />

          <ControlledInputField
            control={form.control}
            name="lastName"
            label={t`Last name`}
            type="text"
            placeholder={t`Doe`}
          />

          <ControlledPasswordField
            control={form.control}
            name="password"
            label={t`Password`}
            placeholder={t`StrongPass123!`}
          />

          <Button
            type="submit"
            disabled={isPending}
            className="h-12 w-full rounded-sm bg-[#1e58d5] text-[12px] font-semibold tracking-widest text-white hover:bg-[#245fdc]"
          >
            {isPending ? t`CREATING ACCOUNT...` : t`CREATE ACCOUNT`}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </Form>
    </CompanyOwnerAuthLayout>
  );
}
