import type { Control, FieldPath } from 'react-hook-form';

import { FormControl, FormDescription, FormField, FormItem, FormMessage } from 'components/shadcn';
import { toggleArraySelection } from '../../_lib/form-value-utils';
import type { StudentRegistrationValues } from '../../schema';
import { MultiSelectSection } from './multi-select-section';

type MultiSelectFormFieldProps<TValue extends string> = {
  control: Control<StudentRegistrationValues>;
  name: FieldPath<StudentRegistrationValues>;
  title: string;
  description: string;
  options: TValue[];
  helperText?: string;
};

export function MultiSelectFormField<TValue extends string>({
  control,
  name,
  title,
  description,
  options,
  helperText,
}: MultiSelectFormFieldProps<TValue>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selectedValues = (field.value ?? []) as TValue[];

        return (
          <FormItem>
            <FormControl>
              <MultiSelectSection
                title={title}
                description={description}
                options={options}
                selectedValues={selectedValues}
                onToggle={(value, checked) =>
                  field.onChange(toggleArraySelection(selectedValues, value, checked))
                }
              />
            </FormControl>
            {helperText ? <FormDescription>{helperText}</FormDescription> : null}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
