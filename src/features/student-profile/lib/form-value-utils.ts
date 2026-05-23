export function parseCommaSeparatedList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function toggleArraySelection<TValue extends string>(
  selectedValues: TValue[],
  value: TValue,
  checked: boolean,
) {
  if (checked) {
    return Array.from(new Set([...selectedValues, value]));
  }

  return selectedValues.filter((item) => item !== value);
}
