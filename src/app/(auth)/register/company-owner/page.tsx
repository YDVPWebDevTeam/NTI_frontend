'use client';

import { t } from '@lingui/core/macro';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useRegisterCompanyOwnerMutation } from 'lib/api';
import { ROUTES } from 'lib/constants';

import { ControlledInputField, ControlledPasswordField } from 'components/forms';
import { Button, Form } from 'components/shadcn';

import { CompanyOwnerAuthLayout } from './_components/company-owner-auth-layout';
import {
  createCompanyOwnerRegistrationSchema,
  type CompanyOwnerRegistrationValues,
} from './schema';

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
      eyebrow={t`ORGANIZATION ACCESS`}
      title={t`Create your company owner account`}
      description={t`Register your account to continue with organization onboarding.`}
      headerEyebrow={t`ACCOUNT SETUP`}
      headerTitle={t`Register company owner`}
      headerDescription={t`Create your company owner account to continue with organization registration.`}
    >
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
