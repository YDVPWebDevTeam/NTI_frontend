'use client';

import { t } from '@lingui/core/macro';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { filesService, uploadAndCompleteFile, useCreateOrganizationMutation } from 'lib/api';
import { ROUTES } from 'lib/constants';

import { ControlledInputField } from 'components/forms';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from 'components/shadcn';

import { CompanyOwnerAuthLayout } from '../_components/company-owner-auth-layout';

const COMPANY_NAME_MIN_LENGTH = 2;
const COMPANY_NAME_MAX_LENGTH = 100;
const ICO_LENGTH = 8;
const SECTOR_MIN_LENGTH = 2;
const DESCRIPTION_MIN_LENGTH = 10;

function createCompanyOwnerOrganizationSchema() {
  return z.object({
    name: z
      .string()
      .trim()
      .min(COMPANY_NAME_MIN_LENGTH, {
        message: t`Company name must be at least 2 characters.`,
      })
      .max(COMPANY_NAME_MAX_LENGTH, {
        message: t`Company name must be at most 100 characters.`,
      }),
    ico: z
      .string()
      .trim()
      .length(ICO_LENGTH, {
        message: t`IČO must contain exactly 8 characters.`,
      }),
    sector: z
      .string()
      .trim()
      .min(SECTOR_MIN_LENGTH, {
        message: t`Sector must be at least 2 characters.`,
      }),
    description: z
      .string()
      .trim()
      .min(DESCRIPTION_MIN_LENGTH, {
        message: t`Description must be at least 10 characters.`,
      }),
    website: z
      .string()
      .trim()
      .url({
        message: t`Please enter a valid website URL.`,
      }),
    logoFile: z.unknown().optional().nullable(),
  });
}

type CompanyOwnerOrganizationValues = z.infer<
  ReturnType<typeof createCompanyOwnerOrganizationSchema>
>;

export default function CreateCompanyOwnerOrganizationPage() {
  const router = useRouter();

  const { mutateAsync: createOrganization, isPending } = useCreateOrganizationMutation();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CompanyOwnerOrganizationValues>({
    resolver: zodResolver(createCompanyOwnerOrganizationSchema()),
    defaultValues: {
      name: '',
      ico: '',
      sector: '',
      description: '',
      website: '',
      logoFile: null,
    },
    mode: 'onChange',
  });

  const selectedLogoFile = form.watch('logoFile');
  const isSubmitDisabled = isPending || isSubmitting;

  const handleSubmit = async (values: CompanyOwnerOrganizationValues) => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      let logoUrl: string | undefined;

      if (values.logoFile instanceof File) {
        const uploadedLogo = await uploadAndCompleteFile(
          {
            requestUploadUrl: (payload) => filesService.requestUploadUrl(payload),
            uploadToPresignedUrl: ({ uploadUrl, file }) =>
              filesService.uploadToPresignedUrl(uploadUrl, file),
            completeUpload: (payload) => filesService.completeUpload(payload),
          },
          {
            file: values.logoFile,
            purpose: 'organization-logo',
            entityType: 'organization',
          },
        );

        logoUrl = uploadedLogo.publicUrl;
      }

      await createOrganization({
        name: values.name,
        ico: values.ico,
        sector: values.sector,
        description: values.description,
        website: values.website,
        logoUrl,
      });

      sessionStorage.removeItem('companyOwnerEmail');

      router.push(ROUTES.DASHBOARD);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Organization creation failed`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CompanyOwnerAuthLayout
      eyebrow={t`ORGANIZATION SETUP`}
      title={t`Create your organization profile`}
      description={t`Add company details so your organization can be reviewed and connected to the platform.`}
    >
      <div className="mb-8">
        <p className="text-[11px] font-medium tracking-[0.12em] text-neutral-500">
          {t`COMPANY DETAILS`}
        </p>

        <h2 className="mt-2 text-4xl font-semibold tracking-tight text-[#0c1a4f]">
          {t`Create organization`}
        </h2>

        <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">
          {t`Add basic information about your organization.`}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          <ControlledInputField
            control={form.control}
            name="name"
            label={t`Company name`}
            type="text"
            placeholder={t`Test Company`}
          />

          <ControlledInputField
            control={form.control}
            name="ico"
            label={t`IČO`}
            type="text"
            placeholder={t`12345678`}
          />

          <ControlledInputField
            control={form.control}
            name="sector"
            label={t`Sector`}
            type="text"
            placeholder={t`IT`}
          />

          <ControlledInputField
            control={form.control}
            name="description"
            label={t`Description`}
            type="text"
            placeholder={t`Software development company.`}
          />

          <ControlledInputField
            control={form.control}
            name="website"
            label={t`Website`}
            type="url"
            placeholder={t`https://example.com`}
          />

          <FormField
            control={form.control}
            name="logoFile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t`Logo`}</FormLabel>

                <FormControl>
                  <input
                    id="logo"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;

                      field.onChange(file);
                    }}
                    className="border-input bg-background block w-full rounded-md border px-3 py-2 text-sm"
                  />
                </FormControl>

                {selectedLogoFile instanceof File && (
                  <p className="text-xs text-neutral-500">{selectedLogoFile.name}</p>
                )}

                <p className="text-xs text-gray-500">{t`PNG, JPG or WEBP. Logo is optional.`}</p>

                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isSubmitDisabled}
            className="h-12 w-full rounded-sm bg-[#1e58d5] text-[12px] font-semibold tracking-widest text-white hover:bg-[#245fdc]"
          >
            {isSubmitDisabled ? t`CREATING ORGANIZATION...` : t`CREATE ORGANIZATION`}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </Form>
    </CompanyOwnerAuthLayout>
  );
}
