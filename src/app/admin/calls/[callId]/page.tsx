'use client';

import { t } from '@lingui/core/macro';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import {
  AdminErrorState,
  AdminLoadingState,
  AdminStatusBadge,
  formatAdminDateTime,
} from 'components/admin';
import { Button, Card, CardContent, CardHeader, CardTitle } from 'components/shadcn';
import {
  AdminCallStatus,
  useAdminCall,
  useArchiveAdminCall,
  useCloseAdminCall,
  useOpenAdminCall,
} from 'lib/api-client/admin/calls';
import { ROUTES } from 'lib/constants';
import { formatEnumLabel } from 'lib/utils';

export default function AdminCallDetailPage() {
  const params = useParams<{ callId: string }>();
  const callId = params.callId?.trim() ?? '';

  const callQuery = useAdminCall(callId);
  const openMutation = useOpenAdminCall();
  const closeMutation = useCloseAdminCall();
  const archiveMutation = useArchiveAdminCall();

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

  const call = callQuery.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-medium tracking-[0.12em] text-slate-500 uppercase">
            {formatEnumLabel(call.type)}
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">{call.title}</h1>
          <div className="mt-3">
            <AdminStatusBadge status={call.status} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={ROUTES.ADMIN.CALLS}>{t`Back`}</Link>
          </Button>

          <Button asChild variant="outline">
            <Link href={ROUTES.ADMIN.callEdit(call.id)}>{t`Edit`}</Link>
          </Button>

          {call.status === AdminCallStatus.DRAFT ? (
            <Button onClick={() => openMutation.mutate(call.id)} disabled={openMutation.isPending}>
              {t`Open`}
            </Button>
          ) : null}

          {call.status === AdminCallStatus.OPEN ? (
            <Button
              onClick={() => closeMutation.mutate(call.id)}
              disabled={closeMutation.isPending}
            >
              {t`Close`}
            </Button>
          ) : null}

          {call.status === AdminCallStatus.CLOSED ? (
            <Button
              onClick={() => archiveMutation.mutate(call.id)}
              disabled={archiveMutation.isPending}
            >
              {t`Archive`}
            </Button>
          ) : null}
        </div>
      </div>

      <Card className="border-slate-200 bg-white shadow-none">
        <CardHeader>
          <CardTitle>{t`Call details`}</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 text-sm md:grid-cols-2">
          <div>
            <p className="text-slate-500">{t`ID`}</p>
            <p className="font-mono text-slate-950">{call.id}</p>
          </div>

          <div>
            <p className="text-slate-500">{t`Type`}</p>
            <p className="text-slate-950">{formatEnumLabel(call.type)}</p>
          </div>

          <div>
            <p className="text-slate-500">{t`Opens at`}</p>
            <p className="text-slate-950">{formatAdminDateTime(call.opensAt)}</p>
          </div>

          <div>
            <p className="text-slate-500">{t`Closes at`}</p>
            <p className="text-slate-950">{formatAdminDateTime(call.closesAt)}</p>
          </div>

          <div>
            <p className="text-slate-500">{t`Created at`}</p>
            <p className="text-slate-950">{formatAdminDateTime(call.createdAt)}</p>
          </div>

          <div>
            <p className="text-slate-500">{t`Updated at`}</p>
            <p className="text-slate-950">{formatAdminDateTime(call.updatedAt)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
