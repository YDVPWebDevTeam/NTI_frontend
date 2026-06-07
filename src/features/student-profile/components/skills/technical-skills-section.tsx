'use client';

import { t } from '@lingui/core/macro';
import { Plus, Trash } from 'lucide-react';
import type { Control } from 'react-hook-form';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { FormSectionCard } from 'components/forms';
import { Button } from 'components/shadcn';
import { Checkbox } from 'components/shadcn';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from 'components/shadcn';
import { Input } from 'components/shadcn';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'components/shadcn';
import { formatEnumLabel } from 'lib/utils';
import type { StudentRegistrationValues } from 'lib/auth/schemas';
import { SKILL_LEVEL_OPTIONS } from './constants';

type TechnicalSkillsSectionProps = {
  control: Control<StudentRegistrationValues>;
};

function SkillsFieldArrayMessage() {
  const { getFieldState, formState } = useFormContext<StudentRegistrationValues>();
  const error = getFieldState('skills', formState).error;

  if (!error?.message) {
    return null;
  }

  return <p className="text-destructive text-sm font-medium">{String(error.message)}</p>;
}

export function TechnicalSkillsSection({ control }: TechnicalSkillsSectionProps) {
  const {
    fields: skillsFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({
    control,
    name: 'skills',
  });

  return (
    <FormSectionCard
      title={t`Technical Skills`}
      description={t`List your primary technical skills and proficiency.`}
    >
      <div className="space-y-4">
        {skillsFields.map((field, index) => (
          <div
            key={field.id}
            className="bg-muted relative grid items-end gap-4 rounded-md border p-4 md:grid-cols-12"
          >
            <div className="md:col-span-4">
              <FormField
                control={control}
                name={`skills.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">{t`Skill Name`}</FormLabel>
                    <FormControl>
                      <Input placeholder={t`e.g., React`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-3">
              <FormField
                control={control}
                name={`skills.${index}.level`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">{t`Proficiency`}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t`Select level`} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SKILL_LEVEL_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {formatEnumLabel(option)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-3">
              <FormField
                control={control}
                name={`skills.${index}.experienceMonths`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">{t`Experience (months)`}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
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
            </div>

            <div className="md:col-span-1">
              <FormField
                control={control}
                name={`skills.${index}.isPrimary`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-center text-xs">{t`Primary`}</FormLabel>
                    <FormControl>
                      <div className="flex h-[40px] items-center justify-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(value) => field.onChange(Boolean(value))}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-1">
              <div className="space-y-2">
                <span className="block text-xs opacity-0" aria-hidden="true">
                  Action
                </span>
                <div className="flex h-[40px] items-center justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSkill(index)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            appendSkill({
              name: '',
              level: 'BEGINNER',
              experienceMonths: undefined,
              isPrimary: false,
            })
          }
          className="w-full border-dashed"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t`Add Skill`}
        </Button>

        <SkillsFieldArrayMessage />
      </div>
    </FormSectionCard>
  );
}
