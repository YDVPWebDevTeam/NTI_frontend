'use client';

import { t } from '@lingui/core/macro';
import { ClipboardCheck } from 'lucide-react';

import { AdminEmptyState } from 'components/admin';
import { Card, CardContent, CardHeader, CardTitle } from 'components/shadcn';

export default function AdminModerationPage() {
  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white shadow-none">
        <CardHeader>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-700">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <CardTitle className="text-2xl text-slate-950">{t`Program A Moderation`}</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminEmptyState
            title={t`Moderation workspace is coming soon`}
            description={t`This placeholder keeps the admin route available while the full Program A moderation workflow is being implemented.`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
