import { t } from '@lingui/core/macro';
import type { Control } from 'react-hook-form';

import { ControlledFileField, FormSectionCard } from 'components/forms';
import { Checkbox } from 'components/shadcn';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from 'components/shadcn';
import type { StudentRegistrationValues } from 'lib/auth/schemas';

type AcademicVerificationSectionProps = {
  control: Control<StudentRegistrationValues>;
  selectedAcademicEvidenceFile: unknown;
  onAcademicEvidenceFileChange: (file: File | null) => void;
};

export function AcademicVerificationSection({
  control,
  selectedAcademicEvidenceFile,
  onAcademicEvidenceFileChange,
}: AcademicVerificationSectionProps) {
  return (
    <FormSectionCard title={t`Verification`}>
      <div className="space-y-6">
        <ControlledFileField
          control={control}
          name="academicEvidenceFileId"
          label={t`Academic evidence`}
          file={selectedAcademicEvidenceFile instanceof File ? selectedAcademicEvidenceFile : null}
          onFileChange={onAcademicEvidenceFileChange}
          placeholder={t`Choose academic evidence`}
          buttonLabel={t`Browse file`}
        />

        <FormField
          control={control}
          name="academicDeclarationAccepted"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md bg-neutral-50 p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(value) => field.onChange(Boolean(value))}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-medium">
                  {t`I declare that the academic information provided is accurate.`}
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
      </div>
    </FormSectionCard>
  );
}
