import React from 'react';
import { FormSectionCard } from 'components/forms';
import { Checkbox } from 'components/shadcn';
import { cn, formatEnumLabel } from 'lib/utils';

type MultiSelectSectionProps<TValue extends string> = {
  title: string;
  description: string;
  options: TValue[];
  selectedValues: TValue[];
  onValueChange: (value: TValue, checked: boolean) => void;
  maxSelections?: number;
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'onToggle'>;

const MultiSelectSectionInner = React.forwardRef(function MultiSelectSection<TValue extends string>(
  {
    title,
    description,
    options,
    selectedValues,
    onValueChange,
    maxSelections,
    ...props
  }: MultiSelectSectionProps<TValue>,
  ref: React.Ref<HTMLDivElement>,
) {
  const isMaxReached = maxSelections !== undefined && selectedValues.length >= maxSelections;

  return (
    <div ref={ref} {...props}>
      <FormSectionCard title={title} description={description}>
        <div className="grid gap-3 sm:grid-cols-2">
          {options.map((option) => {
            const isChecked = selectedValues.includes(option);
            const isDisabled = isMaxReached && !isChecked;

            return (
              <label
                key={option}
                className={cn(
                  'border-border bg-muted flex items-start gap-3 rounded-md border p-3',
                  isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                )}
              >
                <Checkbox
                  checked={isChecked}
                  disabled={isDisabled}
                  onCheckedChange={(value) => onValueChange(option, Boolean(value))}
                />
                <span className="text-foreground text-sm">{formatEnumLabel(option)}</span>
              </label>
            );
          })}
        </div>
      </FormSectionCard>
    </div>
  );
});

MultiSelectSectionInner.displayName = 'MultiSelectSection';

export const MultiSelectSection = MultiSelectSectionInner as <TValue extends string>(
  props: MultiSelectSectionProps<TValue> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement;
