import { t } from '@lingui/core/macro';
import { useFormContext } from 'react-hook-form';

import type { StudentRegistrationValues } from '../schema';
import { MultiSelectFormField } from './skills/multi-select-form-field';
import { PortfolioResumeSection } from './skills/portfolio-resume-section';
import { ProjectsSummarySection } from './skills/projects-summary-section';
import { FOCUS_AREA_OPTIONS, PREFERRED_ROLE_OPTIONS, SOFT_SKILL_OPTIONS } from './skills/constants';
import { TechnicalSkillsSection } from './skills/technical-skills-section';

export function SkillsStep() {
  const { control, setValue, watch } = useFormContext<StudentRegistrationValues>();
  const selectedCvFile = watch('cvFile');

  return (
    <div className="space-y-8">
      <MultiSelectFormField
        control={control}
        name="focusAreas"
        title={t`Focus Areas`}
        description={t`What are your main areas of interest?`}
        options={FOCUS_AREA_OPTIONS}
      />

      <TechnicalSkillsSection control={control} />

      <MultiSelectFormField
        control={control}
        name="preferredRoles"
        title={t`Preferred Roles`}
        description={t`What kind of team role are you looking for?`}
        options={PREFERRED_ROLE_OPTIONS}
      />

      <MultiSelectFormField
        control={control}
        name="softSkills"
        title={t`Soft Skills`}
        description={t`Select your strongest collaboration and communication skills.`}
        options={SOFT_SKILL_OPTIONS}
        helperText={t`Choose from the supported soft-skill categories.`}
      />

      <PortfolioResumeSection
        control={control}
        setValue={setValue}
        selectedCvFile={selectedCvFile}
      />

      <ProjectsSummarySection control={control} />
    </div>
  );
}
