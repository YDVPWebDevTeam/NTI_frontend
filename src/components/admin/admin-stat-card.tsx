'use client';

import type { ReactNode } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from 'components/shadcn';

type AdminStatCardProps = {
  label: string;
  value: string | number;
  description: string;
  icon?: ReactNode;
};

export function AdminStatCard({ label, value, description, icon }: AdminStatCardProps) {
  return (
    <Card className="border-slate-200 bg-white shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium tracking-[0.08em] text-slate-500 uppercase">
          {label}
        </CardTitle>
        {icon ? <div className="text-slate-500">{icon}</div> : null}
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-3xl font-semibold tracking-tight text-slate-950">{value}</div>
        <p className="text-sm text-slate-600">{description}</p>
      </CardContent>
    </Card>
  );
}
