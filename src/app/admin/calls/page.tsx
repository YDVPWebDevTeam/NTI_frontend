'use client';

import { t } from '@lingui/core/macro';
import { CalendarClock } from 'lucide-react';

import { AdminEmptyState } from 'components/admin';
import { Card, CardContent, CardHeader, CardTitle } from 'components/shadcn';

export default function AdminCallsPage() {
  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white shadow-none">
        <CardHeader>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-700">
            <CalendarClock className="h-5 w-5" />
          </div>
          <CardTitle className="text-2xl text-slate-950">{t`Admin Calls`}</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminEmptyState
            title={t`Call management workspace is coming soon`}
            description={t`This placeholder keeps the admin calls route available while the full call management workspace is being implemented.`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
