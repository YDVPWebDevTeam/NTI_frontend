'use client';

import type { InputHTMLAttributes, ReactNode } from 'react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { type ControllerRenderProps } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from 'components/shadcn';
import { Input } from 'components/shadcn';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'components/shadcn';

const LABEL_CLASS_NAME = 'text-[11px] font-medium tracking-[0.1em] text-neutral-500 uppercase';
const INPUT_CLASS_NAME =
  'h-12 w-full rounded-sm border border-black/10 bg-white px-4 text-sm text-neutral-800 transition-all outline-none focus-visible:ring-blue-500';

type RenderField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> = (
  field: ControllerRenderProps<TFieldValues, TName>,
) => ReactNode;

type ControlledFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  className?: string;
  renderField: RenderField<TFieldValues, TName>;
};

export function ControlledFormField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({ control, name, label, className, renderField }: ControlledFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className={LABEL_CLASS_NAME}>{label}</FormLabel>
          <FormControl>{renderField(field)}</FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

type ControlledInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  type?: InputHTMLAttributes<HTMLInputElement>['type'];
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  startIcon?: ReactNode;
};

export function ControlledInputField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  type = 'text',
  placeholder,
  className,
  inputClassName,
  startIcon,
}: ControlledInputProps<TFieldValues, TName>) {
  return (
    <ControlledFormField
      control={control}
      name={name}
      label={label}
      className={className}
      renderField={(field) => (
        <div className="relative">
          {startIcon ? (
            <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-neutral-400">
              {startIcon}
            </span>
          ) : null}
          <Input
            {...field}
            value={(field.value as string | number | undefined) ?? ''}
            type={type}
            placeholder={placeholder}
            className={`${INPUT_CLASS_NAME} ${startIcon ? 'pl-11' : ''} ${inputClassName || ''}`}
          />
        </div>
      )}
    />
  );
}

type SelectOption = {
  value: string;
  label: string;
};

type ControlledSelectProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  placeholder: string;
  options: SelectOption[];
  className?: string;
  triggerClassName?: string;
};

export function ControlledSelectField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  placeholder,
  options,
  className,
  triggerClassName,
}: ControlledSelectProps<TFieldValues, TName>) {
  return (
    <ControlledFormField
      control={control}
      name={name}
      label={label}
      className={className}
      renderField={(field) => (
        <Select
          value={typeof field.value === 'string' ? field.value : ''}
          onValueChange={field.onChange}
        >
          <SelectTrigger
            className={`h-12 rounded-sm border-black/10 bg-white ${triggerClassName || ''}`}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
}
