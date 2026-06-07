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
    <Card className="border-border bg-card shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-muted-foreground text-sm font-medium tracking-[0.08em] uppercase">
          {label}
        </CardTitle>
        {icon ? <div className="text-muted-foreground">{icon}</div> : null}
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-foreground text-3xl font-semibold tracking-tight">{value}</div>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}
