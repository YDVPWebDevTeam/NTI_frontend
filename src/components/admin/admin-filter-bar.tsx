'use client';

import { t } from '@lingui/core/macro';

import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'components/shadcn';
import { AdminFilterOption, type AdminStatus } from 'lib/api-client/admin/types';

import { formatStatusLabel } from './utils';

type AdminFilterBarProps<TFilter extends string> = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  status: TFilter;
  onStatusChange: (value: TFilter) => void;
  filters: readonly TFilter[];
};

function formatFilterLabel(filter: string) {
  if (filter === AdminFilterOption.ALL) {
    return t`All statuses`;
  }

  return formatStatusLabel(filter as AdminStatus);
}

export function AdminFilterBar<TFilter extends string>({
  search,
  onSearchChange,
  searchPlaceholder,
  status,
  onStatusChange,
  filters,
}: AdminFilterBarProps<TFilter>) {
  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-4 lg:flex-row lg:items-end">
      <div className="min-w-0 flex-1">
        <label className="text-muted-foreground mb-2 block text-[11px] font-medium tracking-[0.12em] uppercase">
          {t`Search`}
        </label>
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="bg-card h-11"
        />
      </div>

      <div className="w-full lg:w-56">
        <label className="text-muted-foreground mb-2 block text-[11px] font-medium tracking-[0.12em] uppercase">
          {t`Status`}
        </label>
        <Select value={status} onValueChange={(value) => onStatusChange(value as TFilter)}>
          <SelectTrigger className="bg-card h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {filters.map((filter) => (
              <SelectItem key={filter} value={filter}>
                {formatFilterLabel(filter)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
