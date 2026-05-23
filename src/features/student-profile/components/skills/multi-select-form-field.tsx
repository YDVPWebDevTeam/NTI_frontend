import type { Control, FieldPath } from 'react-hook-form';

import { FormControl, FormDescription, FormField, FormItem, FormMessage } from 'components/shadcn';
import type { StudentRegistrationValues } from 'lib/auth/schemas';
import { toggleArraySelection } from '../../lib/form-value-utils';
import { MultiSelectSection } from './multi-select-section';

type MultiSelectFormFieldProps<TValue extends string> = {
  control: Control<StudentRegistrationValues>;
  name: FieldPath<StudentRegistrationValues>;
  title: string;
  description: string;
  options: TValue[];
  helperText?: string;
  maxSelections?: number;
};

export function MultiSelectFormField<TValue extends string>({
  control,
  name,
  title,
  description,
  options,
  helperText,
  maxSelections,
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
              <MultiSelectSection<TValue>
                title={title}
                description={description}
                options={options}
                selectedValues={selectedValues}
                maxSelections={maxSelections}
                onValueChange={(value, checked) =>
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
