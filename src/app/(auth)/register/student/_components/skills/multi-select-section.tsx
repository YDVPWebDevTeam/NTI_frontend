import { Checkbox } from 'components/shadcn';
import { formatEnumLabel } from 'lib/utils';
import { RegistrationSectionCard } from '../registration-section-card';

type MultiSelectSectionProps<TValue extends string> = {
  title: string;
  description: string;
  options: TValue[];
  selectedValues: TValue[];
  onToggle: (value: TValue, checked: boolean) => void;
};

export function MultiSelectSection<TValue extends string>({
  title,
  description,
  options,
  selectedValues,
  onToggle,
}: MultiSelectSectionProps<TValue>) {
  return (
    <RegistrationSectionCard title={title} description={description}>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const isChecked = selectedValues.includes(option);

          return (
            <label
              key={option}
              className="flex cursor-pointer items-start gap-3 rounded-md border border-black/10 bg-neutral-50 p-3"
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={(value) => onToggle(option, Boolean(value))}
              />
              <span className="text-sm text-neutral-700">{formatEnumLabel(option)}</span>
            </label>
          );
        })}
      </div>
    </RegistrationSectionCard>
  );
}
