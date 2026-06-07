'use client';

import { t } from '@lingui/core/macro';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { AdminCallForm } from 'components/admin/admin-call-form';
import { Button } from 'components/shadcn';
import { useCreateAdminCall } from 'lib/api-client/admin/calls';
import { extractApiErrorMessage } from 'lib/api-client/openapi-runtime/client';
import { ROUTES } from 'lib/constants';

export default function CreateAdminCallPage() {
  const router = useRouter();
  const createMutation = useCreateAdminCall();

  return (
    <div className="space-y-6">
      <div className="border-border bg-card flex items-center justify-between rounded-2xl border p-5">
        <div>
          <p className="text-muted-foreground text-[11px] font-medium tracking-[0.12em] uppercase">
            {t`Calls`}
          </p>
          <h1 className="text-foreground mt-2 text-2xl font-semibold">{t`Create call`}</h1>
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
            onSuccess: () => {
              toast.success(t`Call created.`);
              router.push(ROUTES.ADMIN.CALLS);
            },
            onError: (error) => {
              toast.error(
                extractApiErrorMessage(error) ??
                  (error instanceof Error ? error.message : t`Unable to create the call.`),
              );
            },
          });
        }}
      />
    </div>
  );
}
