import { t } from '@lingui/core/macro';
import type { Control, UseFormSetValue, UseFormClearErrors } from 'react-hook-form';

import { ControlledFileField, FormSectionCard } from 'components/forms';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, Input } from 'components/shadcn';
import type { StudentRegistrationValues } from '../../schema';

type PortfolioResumeSectionProps = {
  control: Control<StudentRegistrationValues>;
  setValue: UseFormSetValue<StudentRegistrationValues>;
  clearErrors: UseFormClearErrors<StudentRegistrationValues>;
  selectedCvFile: unknown;
};

export function PortfolioResumeSection({
  control,
  setValue,
  clearErrors,
  selectedCvFile,
}: PortfolioResumeSectionProps) {
  return (
    <FormSectionCard
      title={t`Portfolio & Resume`}
      description={t`Upload your CV and add links to your profiles.`}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <ControlledFileField
          control={control}
          name="cvFileId"
          className="md:col-span-2"
          label={t`CV File`}
          file={selectedCvFile instanceof File ? selectedCvFile : null}
          onFileChange={(file) => {
            if (!file) {
              return;
            }

            setValue('cvFileId', '', {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: false,
            });
            setValue('cvFile', file, {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            });
            clearErrors('cvFileId');
          }}
          buttonLabel={t`Browse file`}
          placeholder={t`Choose your CV`}
          renderStatus={(field) =>
            field.value ? (
              <p className="text-xs text-neutral-500">{t`Using existing CV (ID: ${field.value})`}</p>
            ) : null
          }
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
    </FormSectionCard>
  );
}
