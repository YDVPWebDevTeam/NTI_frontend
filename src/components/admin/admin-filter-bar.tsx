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
import { AdminFilterOption } from 'lib/api-client/admin/types';
import { formatEnumLabel } from 'lib/utils';

type AdminFilterBarProps<TFilter extends string> = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  status: TFilter;
  onStatusChange: (value: TFilter) => void;
  filters: readonly TFilter[];
};

export function AdminFilterBar<TFilter extends string>({
  search,
  onSearchChange,
  searchPlaceholder,
  status,
  onStatusChange,
  filters,
}: AdminFilterBarProps<TFilter>) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-end">
      <div className="min-w-0 flex-1">
        <label className="mb-2 block text-[11px] font-medium tracking-[0.12em] text-slate-500 uppercase">
          {t`Search`}
        </label>
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="h-11 bg-white"
        />
      </div>
      <div className="w-full lg:w-56">
        <label className="mb-2 block text-[11px] font-medium tracking-[0.12em] text-slate-500 uppercase">
          {t`Status`}
        </label>
        <Select value={status} onValueChange={(value) => onStatusChange(value as TFilter)}>
          <SelectTrigger className="h-11 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {filters.map((filter) => (
              <SelectItem key={filter} value={filter}>
                {filter === AdminFilterOption.ALL ? t`All statuses` : formatEnumLabel(filter)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
