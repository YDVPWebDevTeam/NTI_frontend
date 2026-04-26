import { t } from '@lingui/core/macro';
import type { Control } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from 'components/shadcn';
import { Input } from 'components/shadcn';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'components/shadcn';
import { formatEnumLabel } from 'lib/utils';
import type { StudentRegistrationValues } from '../../schema';
import { DEGREE_LEVEL_OPTIONS, GRADUATION_YEAR_OPTIONS, STUDY_MODE_OPTIONS } from './constants';

type AcademicAffiliationStudyFieldsProps = {
  control: Control<StudentRegistrationValues>;
};

export function AcademicAffiliationStudyFields({ control }: AcademicAffiliationStudyFieldsProps) {
  return (
    <>
      <FormField
        control={control}
        name="degreeLevel"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t`Degree Level`}</FormLabel>
            <FormControl>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t`Select degree`} />
                </SelectTrigger>
                <SelectContent>
                  {DEGREE_LEVEL_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {formatEnumLabel(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="studyMode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t`Study Mode`}</FormLabel>
            <FormControl>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t`Select study mode`} />
                </SelectTrigger>
                <SelectContent>
                  {STUDY_MODE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {formatEnumLabel(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="studyYear"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t`Current Year of Study`}</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={1}
                max={8}
                value={field.value ?? ''}
                onChange={(event) => {
                  const nextValue = event.target.valueAsNumber;

                  field.onChange(Number.isNaN(nextValue) ? undefined : nextValue);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="expectedGraduationYear"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t`Expected Graduation Year`}</FormLabel>
            <FormControl>
              <Select
                value={field.value?.toString() ?? ''}
                onValueChange={(val) => field.onChange(parseInt(val, 10))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t`Select graduation year`} />
                </SelectTrigger>
                <SelectContent>
                  {GRADUATION_YEAR_OPTIONS.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
