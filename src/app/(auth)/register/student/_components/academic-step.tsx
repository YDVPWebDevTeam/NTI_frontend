import { useFormContext } from 'react-hook-form';

import type { StudentRegistrationValues } from '../schema';
import { AcademicIndicatorsSection } from './academic/academic-indicators-section';
import { AcademicVerificationSection } from './academic/academic-verification-section';
import { useAcademicDependentFields } from './academic/use-academic-dependent-fields';
import { t } from '@lingui/core/macro';
import { AcademicAffiliationProgramFields } from 'app/(auth)/register/student/_components/academic/academic-affiliation-program-fields';
import { AcademicAffiliationStudyFields } from 'app/(auth)/register/student/_components/academic/academic-affiliation-study-fields';
import { RegistrationSectionCard } from 'app/(auth)/register/student/_components/registration-section-card';

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
      <RegistrationSectionCard
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
      </RegistrationSectionCard>

      <AcademicIndicatorsSection
        control={control}
        hasTransferredSubjects={hasTransferredSubjects}
      />

      <AcademicVerificationSection
        control={control}
        selectedAcademicEvidenceFile={selectedAcademicEvidenceFile}
        onAcademicEvidenceFileChange={(event) => {
          const selectedFile = event.target.files?.[0];

          if (!selectedFile) {
            return;
          }

          setValue('academicEvidenceFile', selectedFile, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: false,
          });
          event.target.value = '';
        }}
      />
    </div>
  );
}
