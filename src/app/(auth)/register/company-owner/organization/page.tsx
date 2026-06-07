'use client';

import { t } from '@lingui/core/macro';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  filesControllerCompleteUpload,
  filesControllerRequestUploadUrl,
  useOrganizationControllerCreate,
  useOrganizationControllerGetMyOrganization,
} from 'lib/api';
import { isApiRequestError } from 'lib/api-client/openapi-runtime/client';
import {
  uploadAndCompleteFile,
  uploadToPresignedUrl,
} from 'lib/api-client/openapi-runtime/file-upload';
import { ROUTES } from 'lib/constants';

import {
  ControlledFileField,
  ControlledInputField,
  ControlledTextareaField,
} from 'components/forms';
import { Button, Form } from 'components/shadcn';

import { CompanyOwnerAuthLayout } from '../_components/company-owner-auth-layout';
import {
  createCompanyOwnerOrganizationSchema,
  normalizeIco,
  normalizeWebsite,
  type CompanyOwnerOrganizationValues,
} from './schema';

const CONFLICT_STATUS = 409;

export default function CreateCompanyOwnerOrganizationPage() {
  const router = useRouter();

  const { mutateAsync: createOrganization, isPending } = useOrganizationControllerCreate();
  const myOrganizationQuery = useOrganizationControllerGetMyOrganization({
    query: {
      retry: false,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!myOrganizationQuery.data) {
      return;
    }

    router.replace(ROUTES.COMPANY.ORGANIZATION);
  }, [myOrganizationQuery.data, router]);

  const handleSubmit = async (values: CompanyOwnerOrganizationValues) => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let logoUrl: string | undefined;

      if (values.logoFile instanceof File) {
        try {
          const uploadedLogo = await uploadAndCompleteFile(
            {
              requestUploadUrl: (payload) => filesControllerRequestUploadUrl(payload),
              uploadToPresignedUrl,
              completeUpload: (payload) => filesControllerCompleteUpload(payload),
            },
            {
              file: values.logoFile,
              visibility: 'PUBLIC',
              purpose: 'organization-logo',
              entityType: 'organization',
            },
          );

          logoUrl = uploadedLogo.publicUrl;
        } catch (error) {
          toast.error(
            error instanceof Error
              ? `${error.message} ${t`The organization will be created without a logo.`}`
              : t`Logo upload failed. The organization will be created without a logo.`,
          );
        }
      }

      await createOrganization({
        data: {
          name: values.name,
          ico: normalizeIco(values.ico),
          sector: values.sector,
          description: values.description,
          website: normalizeWebsite(values.website),
          logoUrl,
        },
      });

      router.push(ROUTES.COMPANY.ORGANIZATION);
    } catch (error) {
      if (isApiRequestError(error) && error.status === CONFLICT_STATUS) {
        const message = t`Your company owner account is already linked to an organization. Opening your organization workspace.`;

        setSubmitError(message);
        toast.error(message);
        router.push(ROUTES.COMPANY.ORGANIZATION);

        return;
      }

      const message =
        error instanceof Error
          ? error.message
          : t`Unable to create the organization right now. Review the details and try again.`;

      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CompanyOwnerAuthLayout
      eyebrow={t`ORGANIZATION SETUP`}
      title={t`Create your organization profile`}
      description={t`Add company details so your organization can be reviewed and connected to the platform.`}
      headerEyebrow={t`COMPANY DETAILS`}
      headerTitle={t`Create organization`}
      headerDescription={t`Add basic information about your organization.`}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          <ControlledInputField
            control={form.control}
            name="name"
            label={t`Company name`}
            type="text"
            placeholder={t`Test Company…`}
            autoComplete="organization"
            spellCheck={false}
          />

          <ControlledInputField
            control={form.control}
            name="ico"
            label={t`ICO`}
            type="text"
            placeholder="12345678…"
            inputMode="numeric"
            spellCheck={false}
            description={t`Enter the 8-digit company identifier.`}
          />

          <ControlledInputField
            control={form.control}
            name="sector"
            label={t`Sector`}
            type="text"
            placeholder={t`Information Technology…`}
            spellCheck={false}
          />

          <ControlledTextareaField
            control={form.control}
            name="description"
            label={t`Description`}
            placeholder={t`Describe what your organization does, who it serves, and how it will use the platform…`}
            rows={5}
          />

          <ControlledInputField
            control={form.control}
            name="website"
            label={t`Website`}
            type="text"
            placeholder="example.com…"
            autoComplete="url"
            inputMode="url"
            spellCheck={false}
            description={t`You can enter the domain only. HTTPS will be added automatically if needed.`}
          />

          <ControlledFileField
            control={form.control}
            name="logoFile"
            label={t`Logo`}
            file={selectedLogoFile instanceof File ? selectedLogoFile : null}
            onFileChange={(file) => form.setValue('logoFile', file, { shouldDirty: true })}
            accept="image/png,image/jpeg,image/webp"
            description={t`PNG, JPG or WEBP. Logo is optional.`}
            placeholder={t`Choose your logo…`}
            buttonLabel={t`Browse file`}
          />

          {submitError ? (
            <div
              className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm"
              aria-live="polite"
            >
              {submitError}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={isSubmitDisabled}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-full rounded-sm text-[12px] font-semibold tracking-widest"
          >
            {isSubmitDisabled ? t`Creating organization…` : t`Create organization`}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </Form>
    </CompanyOwnerAuthLayout>
  );
}
