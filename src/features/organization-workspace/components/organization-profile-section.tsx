'use client';

import { t } from '@lingui/core/macro';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Globe, Image as ImageIcon, Save } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import type { OrganizationResponseDto } from 'lib/api';
import {
  filesControllerCompleteUpload,
  filesControllerRequestUploadUrl,
  useOrganizationControllerUpdateMyOrganization,
} from 'lib/api';
import {
  uploadAndCompleteFile,
  uploadToPresignedUrl,
} from 'lib/api-client/openapi-runtime/file-upload';
import {
  ControlledFileField,
  ControlledInputField,
  ControlledTextareaField,
} from 'components/forms';
import { Form, Button } from 'components/shadcn';
import { formatEnumLabel } from 'lib/utils';
import {
  OrganizationErrorState,
  OrganizationLoadingState,
  OrganizationMetaList,
  OrganizationSectionCard,
} from './organization-workspace-primitives';
import {
  createOrganizationProfileSchema,
  normalizeOrganizationIco,
  normalizeOrganizationWebsite,
  type OrganizationProfileFormValues,
} from '../lib/schemas';

function getDefaultValues(organization: OrganizationResponseDto): OrganizationProfileFormValues {
  return {
    name: organization.name ?? '',
    ico: organization.ico ?? '',
    sector: organization.sector ?? '',
    description: organization.description ?? '',
    website: organization.website ?? '',
    logoFile: null,
  };
}

export function OrganizationProfileSection({
  organization,
  isLoading,
  isError,
  onRefresh,
}: {
  organization?: OrganizationResponseDto;
  isLoading: boolean;
  isError: boolean;
  onRefresh: () => Promise<void> | void;
}) {
  const updateOrganization = useOrganizationControllerUpdateMyOrganization();
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const form = useForm<OrganizationProfileFormValues>({
    resolver: zodResolver(createOrganizationProfileSchema()),
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

  useEffect(() => {
    if (!organization) {
      return;
    }

    form.reset(getDefaultValues(organization));
  }, [form, organization]);

  if (isLoading) {
    return <OrganizationLoadingState label={t`Loading organization profile…`} />;
  }

  if (isError || !organization) {
    return (
      <OrganizationErrorState
        title={t`Unable to load organization profile`}
        description={t`Profile details could not be loaded right now. You can retry without leaving the workspace.`}
        onRetry={() => void onRefresh()}
      />
    );
  }

  const selectedLogoFile = form.watch('logoFile');
  const isSubmitting = updateOrganization.isPending || isUploadingLogo;

  const handleSubmit = async (values: OrganizationProfileFormValues) => {
    try {
      let logoUrl = organization.logoUrl ?? null;

      if (values.logoFile instanceof File) {
        try {
          setIsUploadingLogo(true);

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

          logoUrl = uploadedLogo.publicUrl ?? null;
        } catch (error) {
          toast.error(
            error instanceof Error
              ? `${error.message} ${t`Profile changes will be saved without replacing the logo.`}`
              : t`Logo upload failed. Profile changes will be saved without replacing the logo.`,
          );
        } finally {
          setIsUploadingLogo(false);
        }
      }

      await updateOrganization.mutateAsync({
        data: {
          name: values.name.trim(),
          ico: normalizeOrganizationIco(values.ico),
          sector: values.sector.trim() || null,
          description: values.description.trim() || null,
          website: values.website.trim() ? normalizeOrganizationWebsite(values.website) : null,
          logoUrl,
        },
      });

      toast.success(t`Organization profile updated.`);
      form.reset(getDefaultValues({ ...organization, ...values, logoUrl: logoUrl ?? undefined }));
      await onRefresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t`Unable to update organization profile.`,
      );
    }
  };

  return (
    <OrganizationSectionCard
      title={t`Organization profile`}
      description={t`Keep your organization details up to date for everyone who works with it.`}
      badge={t`Owner only`}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Form {...form}>
          <form className="space-y-5" onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid gap-5 md:grid-cols-2">
              <ControlledInputField
                control={form.control}
                name="name"
                label={t`Company name`}
                placeholder={t`Northstar Labs`}
                autoComplete="organization"
                startIcon={<Building2 className="h-4 w-4" />}
              />

              <ControlledInputField
                control={form.control}
                name="ico"
                label={t`ICO`}
                placeholder="12345678"
                inputMode="numeric"
              />
            </div>

            <ControlledInputField
              control={form.control}
              name="sector"
              label={t`Sector`}
              placeholder={t`Information technology`}
            />

            <ControlledTextareaField
              control={form.control}
              name="description"
              label={t`Description`}
              placeholder={t`Describe what your organization does, who it serves, and how it uses the platform.`}
              rows={5}
            />

            <ControlledInputField
              control={form.control}
              name="website"
              label={t`Website`}
              type="url"
              placeholder="example.com"
              autoComplete="url"
              inputMode="url"
              startIcon={<Globe className="h-4 w-4" />}
              description={t`You can paste a full URL or just the domain. HTTPS will be added automatically if needed.`}
            />

            <ControlledFileField
              control={form.control}
              name="logoFile"
              label={t`Logo`}
              file={selectedLogoFile instanceof File ? selectedLogoFile : null}
              onFileChange={(file) =>
                form.setValue('logoFile', file, { shouldDirty: true, shouldValidate: true })
              }
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              description={t`Upload a new logo if you want to replace the current one.`}
              placeholder={t`Choose a logo file`}
              buttonLabel={t`Browse file`}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting || !form.formState.isDirty}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? t`Saving changes…` : t`Save profile changes`}
              </Button>
            </div>
          </form>
        </Form>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-[1.5rem] border border-[#dfe7fa] bg-[linear-gradient(180deg,#fbfdff_0%,#f4f8ff_100%)] p-5">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#6c7c99] uppercase">
              {t`Current branding`}
            </p>

            <div className="mt-4 flex min-h-44 items-center justify-center rounded-[1.25rem] border border-dashed border-[#cad8f8] bg-white p-6">
              {organization.logoUrl ? (
                <Image
                  src={organization.logoUrl}
                  alt={t`Organization logo`}
                  width={180}
                  height={120}
                  className="max-h-28 w-auto object-contain"
                  unoptimized
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-center text-sm text-[#60718d]">
                  <ImageIcon className="h-8 w-8 text-[#89a1d2]" />
                  <p>{t`No logo uploaded yet.`}</p>
                </div>
              )}
            </div>
          </div>

          <OrganizationMetaList
            items={[
              { label: t`Status`, value: formatEnumLabel(organization.status) },
              { label: t`Created`, value: new Date(organization.createdAt).toLocaleDateString() },
              { label: t`Updated`, value: new Date(organization.updatedAt).toLocaleDateString() },
              { label: t`Website`, value: organization.website ?? null },
            ]}
          />
        </div>
      </div>
    </OrganizationSectionCard>
  );
}
