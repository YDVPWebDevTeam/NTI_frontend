import { t } from '@lingui/core/macro';
import type { Control } from 'react-hook-form';

import { Checkbox } from 'components/shadcn';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from 'components/shadcn';
import { Input } from 'components/shadcn';
import { Textarea } from 'components/shadcn';
import type { StudentRegistrationValues } from '../../schema';
import { parseOptionalNumber } from './constants';
import { RegistrationSectionCard } from 'app/(auth)/register/student/_components/registration-section-card';

type AcademicIndicatorsSectionProps = {
  control: Control<StudentRegistrationValues>;
  hasTransferredSubjects: boolean;
};

export function AcademicIndicatorsSection({
  control,
  hasTransferredSubjects,
}: AcademicIndicatorsSectionProps) {
  return (
    <RegistrationSectionCard
      title={t`Academic Indicators`}
      description={t`Help us understand your academic performance.`}
    >
      <div className="space-y-6">
        <FormField
          control={control}
          name="hasTransferredSubjects"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(value) => field.onChange(Boolean(value))}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>{t`Do you currently have transferred / unfinished subjects?`}</FormLabel>
              </div>
            </FormItem>
          )}
        />

        {hasTransferredSubjects ? (
          <FormField
            control={control}
            name="transferredSubjectsCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t`Number of transferred subjects`}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(parseOptionalNumber(event.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        <FormField
          control={control}
          name="profileSubjectsAverage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t`Average grade from key subjects`}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min={1}
                  max={5}
                  value={field.value ?? ''}
                  onChange={(event) => field.onChange(parseOptionalNumber(event.target.value))}
                />
              </FormControl>
              <p className="text-xs text-neutral-500">{t`This is used as a supporting evaluation signal.`}</p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="relevantCourses"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t`Relevant Courses`}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t`E.g. Algorithms, Distributed Systems, UX Design`}
                  value={field.value?.join(', ') ?? ''}
                  onChange={(event) => {
                    const courses = event.target.value
                      .split(',')
                      .map((course) => course.trim())
                      .filter(Boolean);

                    field.onChange(courses);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="academicAchievements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t`Academic Achievements (Optional)`}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder={t`E.g. competitions, awards, scholarships...`}
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </RegistrationSectionCard>
  );
}
