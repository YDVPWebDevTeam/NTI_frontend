'use client';

import { t } from '@lingui/core/macro';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  AdminStatusBadge,
  AdminStatCard,
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableRow,
  formatAdminDateTime,
} from 'components/admin';
import { ControlledInputField, ControlledSelectField } from 'components/forms';
import { Button, Card, CardContent, CardHeader, CardTitle, Form } from 'components/shadcn';
import { UserRole } from 'lib/api';
import { clearAdminApiCache } from 'lib/api-client/admin/auth';
import { isApiRequestError, isAuthErrorStatus } from 'lib/api-client/openapi-runtime/client';
import {
  createSystemInviteSchema,
  systemInviteRoles,
  useCreateSystemInvite,
  type CreateSystemInviteSchema,
} from 'lib/api-client/admin/system-invites';
import { ROUTES } from 'lib/constants';
import { formatEnumLabel } from 'lib/utils';

export default function AdminInvitesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const createInviteMutation = useCreateSystemInvite();
  const form = useForm<CreateSystemInviteSchema>({
    resolver: zodResolver(createSystemInviteSchema),
    defaultValues: {
      email: '',
      roleToAssign: UserRole.ADMIN,
    },
    mode: 'onChange',
  });

  const createdInvite = createInviteMutation.data;

  const handleSubmit = async (values: CreateSystemInviteSchema) => {
    try {
      await createInviteMutation.mutateAsync(values);
      toast.success(t`System invite created.`);
    } catch (error: unknown) {
      if (isApiRequestError(error) && isAuthErrorStatus(error.status)) {
        clearAdminApiCache(queryClient);
        toast.error(t`Your admin session has expired.`);
        router.replace(ROUTES.ADMIN.LOGIN);

        return;
      }

      toast.error(error instanceof Error ? error.message : t`Unable to create the invite.`);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,520px)_minmax(0,1fr)]">
      <Card className="border-slate-200 bg-white shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-950">{t`Create System Invite`}</CardTitle>
          <p className="text-sm leading-6 text-slate-600">
            {t`Generate a direct invite for a target role.`}
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-5" onSubmit={form.handleSubmit(handleSubmit)}>
              <ControlledInputField
                control={form.control}
                name="email"
                label={t`Email Address`}
                type="email"
                placeholder="person@example.com"
              />
              <ControlledSelectField
                control={form.control}
                name="roleToAssign"
                label={t`Role To Assign`}
                placeholder={t`Select a role`}
                options={systemInviteRoles.map((role) => ({
                  value: role,
                  label: formatEnumLabel(role),
                }))}
              />

              <Button
                type="submit"
                disabled={createInviteMutation.isPending}
                className="h-11 rounded-xl bg-slate-950 px-5 hover:bg-slate-800"
              >
                {createInviteMutation.isPending ? t`Creating...` : t`Create Invite`}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <AdminStatCard
            label={t`Invite Status`}
            value={createdInvite ? formatEnumLabel(createdInvite.status) : t`None`}
            description={t`Most recent response from the invite endpoint.`}
          />
          <AdminStatCard
            label={t`Role`}
            value={createdInvite ? formatEnumLabel(createdInvite.roleToAssign) : t`None`}
            description={t`Role attached to the latest generated invite.`}
          />
          <AdminStatCard
            label={t`Expires`}
            value={createdInvite ? formatAdminDateTime(createdInvite.expiresAt) : t`None`}
            description={t`Expiry timestamp returned by the backend.`}
          />
        </section>

        <Card className="border-slate-200 bg-white shadow-none">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-950">{t`Latest Invite Response`}</CardTitle>
          </CardHeader>
          <CardContent>
            {createdInvite ? (
              <AdminTable className="border-0">
                <AdminTableBody>
                  <AdminTableRow>
                    <AdminTableCell className="w-48 font-medium text-slate-950">{t`Invite Id`}</AdminTableCell>
                    <AdminTableCell className="font-mono text-xs">
                      {createdInvite.id}
                    </AdminTableCell>
                  </AdminTableRow>
                  <AdminTableRow>
                    <AdminTableCell className="font-medium text-slate-950">{t`Email`}</AdminTableCell>
                    <AdminTableCell>{createdInvite.email}</AdminTableCell>
                  </AdminTableRow>
                  <AdminTableRow>
                    <AdminTableCell className="font-medium text-slate-950">{t`Role`}</AdminTableCell>
                    <AdminTableCell>{formatEnumLabel(createdInvite.roleToAssign)}</AdminTableCell>
                  </AdminTableRow>
                  <AdminTableRow>
                    <AdminTableCell className="font-medium text-slate-950">{t`Status`}</AdminTableCell>
                    <AdminTableCell>
                      <AdminStatusBadge status={createdInvite.status} />
                    </AdminTableCell>
                  </AdminTableRow>
                  <AdminTableRow>
                    <AdminTableCell className="font-medium text-slate-950">{t`Created At`}</AdminTableCell>
                    <AdminTableCell>{formatAdminDateTime(createdInvite.createdAt)}</AdminTableCell>
                  </AdminTableRow>
                  <AdminTableRow>
                    <AdminTableCell className="font-medium text-slate-950">{t`Expires At`}</AdminTableCell>
                    <AdminTableCell>{formatAdminDateTime(createdInvite.expiresAt)}</AdminTableCell>
                  </AdminTableRow>
                </AdminTableBody>
              </AdminTable>
            ) : (
              <p className="text-sm text-slate-600">
                {t`Create an invite to inspect the returned metadata here.`}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
