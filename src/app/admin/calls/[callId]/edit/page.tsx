'use client';

import { t } from '@lingui/core/macro';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { AdminErrorState, AdminLoadingState } from 'components/admin';
import { AdminCallForm } from 'components/admin/admin-call-form';
import { Button } from 'components/shadcn';
import { useAdminCall, useUpdateAdminCall } from 'lib/api-client/admin/calls';
import { extractApiErrorMessage } from 'lib/api-client/openapi-runtime/client';
import { ROUTES } from 'lib/constants';

export default function EditAdminCallPage() {
  const params = useParams<{ callId: string }>();
  const router = useRouter();

  const callId = params.callId?.trim() ?? '';
  const callQuery = useAdminCall(callId);
  const updateMutation = useUpdateAdminCall();

  if (!callId) {
    return (
      <AdminErrorState
        title={t`Invalid call id`}
        description={t`The requested call could not be identified from the route.`}
      />
    );
  }

  if (callQuery.isLoading) {
    return <AdminLoadingState />;
  }

  if (callQuery.isError || !callQuery.data) {
    return (
      <AdminErrorState
        title={t`Call unavailable`}
        description={t`The call detail request failed.`}
        actionLabel={t`Retry`}
        onAction={() => void callQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-border bg-card flex items-center justify-between rounded-2xl border p-5">
        <div>
          <p className="text-muted-foreground text-[11px] font-medium tracking-[0.12em] uppercase">
            {t`Calls`}
          </p>
          <h1 className="text-foreground mt-2 text-2xl font-semibold">{t`Edit call`}</h1>
        </div>

        <Button asChild variant="outline">
          <Link href={ROUTES.ADMIN.callDetails(callId)}>{t`Back to detail`}</Link>
        </Button>
      </div>

      <AdminCallForm
        initialCall={callQuery.data}
        submitLabel={t`Save changes`}
        isSubmitting={updateMutation.isPending}
        onSubmit={(values) => {
          updateMutation.mutate(
            {
              id: callId,
              data: values,
            },
            {
              onSuccess: () => {
                toast.success(t`Call updated.`);
                router.push(ROUTES.ADMIN.callDetails(callId));
              },
              onError: (error) => {
                toast.error(
                  extractApiErrorMessage(error) ??
                    (error instanceof Error ? error.message : t`Unable to update the call.`),
                );
              },
            },
          );
        }}
      />
    </div>
  );
}
