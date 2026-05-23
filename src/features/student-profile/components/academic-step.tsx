'use client';

import { useFormContext } from 'react-hook-form';

import { FormSectionCard } from 'components/forms';
import type { StudentRegistrationValues } from 'lib/auth/schemas';
import { AcademicIndicatorsSection } from './academic/academic-indicators-section';
import { AcademicVerificationSection } from './academic/academic-verification-section';
import { useAcademicDependentFields } from './academic/use-academic-dependent-fields';
import { t } from '@lingui/core/macro';
import { AcademicAffiliationProgramFields } from './academic/academic-affiliation-program-fields';
import { AcademicAffiliationStudyFields } from './academic/academic-affiliation-study-fields';

export function AcademicStep() {
  const { control, watch, setValue } = useFormContext<StudentRegistrationValues>();

  const universityId = watch('universityId');
  const facultyId = watch('facultyId');
  const hasTransferredSubjects = watch('hasTransferredSubjects');
  const selectedAcademicEvidenceFile = watch('academicEvidenceFile');

  const {
    universitiesQuery,
    facultiesQuery,
    specializationsQuery,
    universities,
    faculties,
    specializations,
    universityPlaceholder,
    facultyPlaceholder,
    specializationPlaceholder,
  } = useAcademicDependentFields({
    universityId,
    facultyId,
    hasTransferredSubjects,
    setValue,
  });

  return (
    <div className="space-y-8">
      <FormSectionCard
        title={t`Study Affiliation`}
        description={t`Select your university and program details.`}
      >
        <div className="grid gap-6 md:grid-cols-2">
          <AcademicAffiliationProgramFields
            control={control}
            universityId={universityId}
            facultyId={facultyId}
            universities={universities}
            faculties={faculties}
            specializations={specializations}
            isUniversitiesLoading={universitiesQuery.isLoading}
            isFacultiesLoading={facultiesQuery.isLoading}
            isSpecializationsLoading={specializationsQuery.isLoading}
            universityPlaceholder={universityPlaceholder}
            facultyPlaceholder={facultyPlaceholder}
            specializationPlaceholder={specializationPlaceholder}
          />
          <AcademicAffiliationStudyFields control={control} />
        </div>
      </FormSectionCard>

      <AcademicIndicatorsSection
        control={control}
        hasTransferredSubjects={hasTransferredSubjects}
      />

      <AcademicVerificationSection
        control={control}
        selectedAcademicEvidenceFile={selectedAcademicEvidenceFile}
        onAcademicEvidenceFileChange={(file) => {
          if (!file) {
            return;
          }

          setValue('academicEvidenceFile', file, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: false,
          });
        }}
      />
    </div>
  );
}
