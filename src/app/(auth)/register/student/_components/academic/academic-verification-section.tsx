import { t } from '@lingui/core/macro';
import type { ChangeEvent } from 'react';
import type { Control } from 'react-hook-form';

import { Checkbox } from 'components/shadcn';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from 'components/shadcn';
import type { StudentRegistrationValues } from '../../schema';
import { RegistrationSectionCard } from 'app/(auth)/register/student/_components/registration-section-card';

type AcademicVerificationSectionProps = {
  control: Control<StudentRegistrationValues>;
  selectedAcademicEvidenceFile: unknown;
  onAcademicEvidenceFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function AcademicVerificationSection({
  control,
  selectedAcademicEvidenceFile,
  onAcademicEvidenceFileChange,
}: AcademicVerificationSectionProps) {
  return (
    <RegistrationSectionCard title={t`Verification`}>
      <div className="space-y-6">
        <div className="space-y-2">
          <input
            id="academic-evidence-file-input"
            type="file"
            onChange={onAcademicEvidenceFileChange}
            className="border-input bg-background block w-full rounded-md border px-3 py-2 text-sm"
          />
          {selectedAcademicEvidenceFile instanceof File && (
            <p className="text-xs text-neutral-500">{selectedAcademicEvidenceFile.name}</p>
          )}
        </div>

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
    </RegistrationSectionCard>
  );
}
