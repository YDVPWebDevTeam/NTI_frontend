import type { DegreeLevel, StudyMode } from 'lib/api';
import { getGraduationYearOptions } from 'lib/date';

export const DEGREE_LEVEL_OPTIONS: DegreeLevel[] = ['BACHELOR', 'MASTER', 'PHD', 'OTHER'];
export const STUDY_MODE_OPTIONS: StudyMode[] = ['FULL_TIME', 'PART_TIME'];

export const GRADUATION_YEAR_OPTIONS = getGraduationYearOptions();

export function parseOptionalNumber(value: string) {
  if (value.trim() === '') {
    return undefined;
  }

  const parsedValue = Number(value);

  return Number.isNaN(parsedValue) ? undefined : parsedValue;
}
