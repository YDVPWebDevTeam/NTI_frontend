'use client';

import type { ReactNode, TdHTMLAttributes, ThHTMLAttributes, HTMLAttributes } from 'react';

import { cn } from 'lib/utils';

type AdminTableProps = {
  children: ReactNode;
  className?: string;
};

export function AdminTable({ children, className }: AdminTableProps) {
  return (
    <div className={cn('border-border bg-card overflow-hidden rounded-2xl border', className)}>
      <div className="overflow-x-auto">
        <table className="divide-border min-w-full divide-y text-left text-sm">{children}</table>
      </div>
    </div>
  );
}

export function AdminTableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-muted text-muted-foreground text-xs tracking-[0.08em] uppercase">
      {children}
    </thead>
  );
}

export function AdminTableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-border bg-card divide-y">{children}</tbody>;
}

export function AdminTableRow({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn('align-top', className)} {...props}>
      {children}
    </tr>
  );
}

export function AdminTableHeaderCell({
  children,
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={cn('px-4 py-3 font-semibold', className)} {...props}>
      {children}
    </th>
  );
}

export function AdminTableCell({
  children,
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn('text-foreground px-4 py-4', className)} {...props}>
      {children}
    </td>
  );
}
