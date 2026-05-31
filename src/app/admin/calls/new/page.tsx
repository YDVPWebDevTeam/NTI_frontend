'use client';

import { t } from '@lingui/core/macro';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { AdminCallForm } from 'components/admin/admin-call-form';
import { Button } from 'components/shadcn';
import { useCreateAdminCall } from 'lib/api-client/admin/calls';
import { ROUTES } from 'lib/constants';

export default function CreateAdminCallPage() {
  const router = useRouter();
  const createMutation = useCreateAdminCall();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5">
        <div>
          <p className="text-[11px] font-medium tracking-[0.12em] text-slate-500 uppercase">
            {t`Calls`}
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">{t`Create call`}</h1>
        </div>

        <Button asChild variant="outline">
          <Link href={ROUTES.ADMIN.CALLS}>{t`Back to calls`}</Link>
        </Button>
      </div>

      <AdminCallForm
        submitLabel={t`Create call`}
        isSubmitting={createMutation.isPending}
        onSubmit={(values) => {
          createMutation.mutate(values, {
            onSuccess: () => router.push(ROUTES.ADMIN.CALLS),
          });
        }}
      />
    </div>
  );
}
