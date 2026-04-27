import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

export const DATE_FORMATS = {
  ISO_DATE: 'YYYY-MM-DD',
  ISO_DATE_TIME: 'YYYY-MM-DD HH:mm',
} as const;

const GRADUATION_YEAR_MAX_OFFSET = 6;
const GRADUATION_YEAR_OPTIONS_COUNT = GRADUATION_YEAR_MAX_OFFSET + 1;

type DateInput = string | number | Date | Dayjs;

export function getCurrentYear() {
  return dayjs().year();
}

export function getMaxGraduationYear() {
  return getCurrentYear() + GRADUATION_YEAR_MAX_OFFSET;
}

export function getGraduationYearOptions() {
  const currentYear = getCurrentYear();

  return Array.from({ length: GRADUATION_YEAR_OPTIONS_COUNT }, (_, index) => currentYear + index);
}

export function formatDate(value: DateInput, format: string = DATE_FORMATS.ISO_DATE) {
  return dayjs(value).format(format);
}
