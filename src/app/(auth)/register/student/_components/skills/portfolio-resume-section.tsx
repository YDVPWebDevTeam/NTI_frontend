import { t } from '@lingui/core/macro';
import type { Control, UseFormSetValue } from 'react-hook-form';

import { FormField, FormControl, FormItem, FormLabel, FormMessage } from 'components/shadcn';
import { Input } from 'components/shadcn';
import type { StudentRegistrationValues } from '../../schema';
import { RegistrationSectionCard } from '../registration-section-card';

type PortfolioResumeSectionProps = {
  control: Control<StudentRegistrationValues>;
  setValue: UseFormSetValue<StudentRegistrationValues>;
  selectedCvFile: unknown;
};

export function PortfolioResumeSection({
  control,
  setValue,
  selectedCvFile,
}: PortfolioResumeSectionProps) {
  return (
    <RegistrationSectionCard
      title={t`Portfolio & Resume`}
      description={t`Upload your CV and add links to your profiles.`}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          control={control}
          name="cvFileId"
          render={({ field }) => {
            const cvStatus = (() => {
              if (selectedCvFile instanceof File) {
                return <p className="text-xs text-neutral-500">{selectedCvFile.name}</p>;
              }

              if (field.value) {
                return (
                  <p className="text-xs text-neutral-500">
                    {t`Using existing CV (ID: ${field.value})`}
                  </p>
                );
              }

              return (
                <p className="text-xs font-medium text-red-600">
                  {t`Required. Selected file will be uploaded upon submission.`}
                </p>
              );
            })();

            return (
              <FormItem className="md:col-span-2">
                <FormLabel>{t`CV File`}</FormLabel>
                <div className="space-y-2">
                  <input
                    id="cv-file-input"
                    type="file"
                    onChange={(event) => {
                      const file = event.target.files?.[0];

                      if (!file) {
                        return;
                      }

                      field.onChange(undefined);
                      setValue('cvFile', file, { shouldDirty: true, shouldTouch: true });
                      event.target.value = '';
                    }}
                    className="border-input bg-background block w-full rounded-md border px-3 py-2 text-sm"
                  />

                  {cvStatus}
                </div>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={control}
          name="githubUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t`GitHub Profile`}</FormLabel>
              <FormControl>
                <Input placeholder="https://github.com/..." {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="linkedinUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t`LinkedIn Profile`}</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://linkedin.com/in/..."
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="portfolioUrl"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>{t`Personal Portfolio / Website`}</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </RegistrationSectionCard>
  );
}
