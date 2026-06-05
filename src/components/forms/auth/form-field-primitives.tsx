'use client';

import { t } from '@lingui/core/macro';
import { Eye, EyeOff } from 'lucide-react';
import { useState, type InputHTMLAttributes, type ReactNode } from 'react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { type ControllerRenderProps } from 'react-hook-form';

import { cn } from 'lib/utils';
import {
  Button,
  FileInput,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from 'components/shadcn';

export const LABEL_CLASS_NAME =
  'text-[11px] font-medium tracking-[0.1em] text-neutral-500 uppercase';
export const INPUT_CLASS_NAME =
  'h-12 w-full rounded-sm border border-black/10 bg-white px-4 text-sm text-neutral-800 transition-colors focus-visible:ring-blue-500';
const ICON_WRAPPER_CLASS_NAME =
  'pointer-events-none absolute top-1/2 -translate-y-1/2 text-neutral-400';

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

type SharedControlledInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  startIcon?: ReactNode;
  description?: string;
  autoComplete?: InputHTMLAttributes<HTMLInputElement>['autoComplete'];
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode'];
  spellCheck?: boolean;
};

type ControlledInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = SharedControlledInputProps<TFieldValues, TName> & {
  type?: InputHTMLAttributes<HTMLInputElement>['type'];
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
  description,
  autoComplete,
  inputMode,
  spellCheck,
}: ControlledInputProps<TFieldValues, TName>) {
  return (
    <ControlledFormField
      control={control}
      name={name}
      label={label}
      className={className}
      renderField={(field) => (
        <div className="space-y-2">
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
              autoComplete={autoComplete}
              inputMode={inputMode}
              spellCheck={spellCheck}
              className={cn(INPUT_CLASS_NAME, startIcon ? 'pl-11' : '', inputClassName)}
            />
          </div>
          {description ? <FormDescription>{description}</FormDescription> : null}
        </div>
      )}
    />
  );
}

type ControlledPasswordProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = SharedControlledInputProps<TFieldValues, TName> & {
  toggleLabels?: {
    show: string;
    hide: string;
  };
};

export function ControlledPasswordField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  placeholder,
  className,
  inputClassName,
  startIcon,
  description,
  autoComplete,
  inputMode,
  spellCheck,
  toggleLabels = {
    show: t`Show password`,
    hide: t`Hide password`,
  },
}: ControlledPasswordProps<TFieldValues, TName>) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <ControlledFormField
      control={control}
      name={name}
      label={label}
      className={className}
      renderField={(field) => (
        <div className="space-y-2">
          <div className="relative">
            {startIcon ? (
              <span className={cn(ICON_WRAPPER_CLASS_NAME, 'left-4')}>{startIcon}</span>
            ) : null}
            <Input
              {...field}
              value={(field.value as string | number | undefined) ?? ''}
              type={isVisible ? 'text' : 'password'}
              placeholder={placeholder}
              autoComplete={autoComplete}
              inputMode={inputMode}
              spellCheck={spellCheck}
              className={cn(INPUT_CLASS_NAME, startIcon ? 'pl-11' : '', 'pr-12', inputClassName)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-1/2 right-1 h-10 w-10 -translate-y-1/2 rounded-sm text-neutral-500 hover:bg-transparent hover:text-neutral-700"
              onClick={() => {
                setIsVisible((current) => !current);
              }}
              aria-label={isVisible ? toggleLabels.hide : toggleLabels.show}
            >
              <span aria-hidden="true">
                {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </span>
            </Button>
          </div>
          {description ? <FormDescription>{description}</FormDescription> : null}
        </div>
      )}
    />
  );
}

type ControlledTextareaProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = SharedControlledInputProps<TFieldValues, TName> & {
  rows?: number;
};

const DEFAULT_TEXTAREA_ROWS = 4;

export function ControlledTextareaField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  placeholder,
  className,
  inputClassName,
  description,
  spellCheck,
  rows = DEFAULT_TEXTAREA_ROWS,
}: ControlledTextareaProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className={LABEL_CLASS_NAME}>{label}</FormLabel>
          <FormControl>
            <Textarea
              {...field}
              value={(field.value as string | undefined) ?? ''}
              rows={rows}
              placeholder={placeholder}
              spellCheck={spellCheck}
              className={cn(
                'min-h-28 w-full rounded-sm border border-black/10 bg-white px-4 py-3 text-sm text-neutral-800 focus-visible:ring-blue-500',
                inputClassName,
              )}
            />
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
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
            className={cn('h-12 rounded-sm border-black/10 bg-white', triggerClassName)}
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

type ControlledFileFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  accept?: string;
  className?: string;
  description?: string;
  placeholder?: string;
  buttonLabel?: string;
  renderStatus?: (field: ControllerRenderProps<TFieldValues, TName>) => ReactNode;
};

export function ControlledFileField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  file,
  onFileChange,
  accept,
  className,
  description,
  placeholder,
  buttonLabel,
  renderStatus,
}: ControlledFileFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className={LABEL_CLASS_NAME}>{label}</FormLabel>
          <FormControl>
            <div className="space-y-2">
              <FileInput
                id={`${String(name)}-file-input`}
                file={file}
                onFileChange={onFileChange}
                accept={accept}
                placeholder={placeholder}
                buttonLabel={buttonLabel}
              />
              {renderStatus ? renderStatus(field) : null}
            </div>
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
