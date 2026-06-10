'use client';

import { t } from '@lingui/core/macro';
import { Building2, Clock, Files } from 'lucide-react';

import {
  StudentMetricCard,
  StudentMetricGrid,
  StudentPageShell,
  StudentStatusCard,
} from 'components/student-dashboard/page-shell-primitives';
import {
  OrganizationResponseDtoStatus,
  UserStatus,
  useOrganizationControllerGetMyOrganization,
  useOrganizationControllerListMembers,
  useOrganizationControllerListInvites,
  type AuthenticatedUserDto,
} from 'lib/api';
import { useOrganizationDocumentsControllerListDocuments } from 'lib/api';
import { formatEnumLabel } from 'lib/utils';
import { OrganizationDocumentsSection } from './organization-documents-section';
import { OrganizationInvitesSection } from './organization-invites-section';
import { OrganizationMembersSection } from './organization-members-section';
import { OrganizationProfileSection } from './organization-profile-section';

const INVITE_PAGE_SIZE = 10;

export function OrganizationWorkspacePage({ currentUser }: { currentUser: AuthenticatedUserDto }) {
  const organizationQuery = useOrganizationControllerGetMyOrganization();
  const organization = organizationQuery.data;
  const organizationId = organization?.id ?? '';
  const isUserActive = currentUser.status === UserStatus.ACTIVE;
  const isOrganizationActive = organization?.status === OrganizationResponseDtoStatus.ACTIVE;
  const hasOperationalAccess = Boolean(organizationId) && isUserActive && isOrganizationActive;

  const invitesQuery = useOrganizationControllerListInvites(
    organizationId,
    { page: 1, limit: INVITE_PAGE_SIZE },
    {
      query: {
        enabled: hasOperationalAccess,
      },
    },
  );
  const membersQuery = useOrganizationControllerListMembers(organizationId, {
    query: {
      enabled: hasOperationalAccess,
    },
  });
  const documentsQuery = useOrganizationDocumentsControllerListDocuments(organizationId, {
    query: {
      enabled: hasOperationalAccess,
    },
  });
  const organizationHint = organization?.status
    ? `${t`Status`}: ${formatEnumLabel(organization.status)}`
    : t`Organization profile`;
  const lockedMetricHint = t`Available after account activation`;
  const activationDescription = isUserActive
    ? t`Your organization is still being activated. Invites, member changes, and document tools will open as soon as activation is complete.`
    : t`Your account is still waiting for approval. You'll be able to manage invites, members, and documents after approval.`;
  let pendingInvitesValue = '—';
  let membersValue = '—';
  let documentsValue = '—';

  if (hasOperationalAccess) {
    pendingInvitesValue = invitesQuery.isLoading
      ? '...'
      : String(
          (invitesQuery.data?.data ?? []).filter((invite) => invite.status === 'PENDING').length,
        );
    membersValue = membersQuery.isLoading ? '...' : String(membersQuery.data?.length ?? 0);
    documentsValue = documentsQuery.isLoading
      ? '...'
      : String((documentsQuery.data as unknown as unknown[] | undefined)?.length ?? 0);
  }

  if (!organizationQuery.isLoading && !organization) {
    return (
      <StudentStatusCard
        title={t`Organization is unavailable`}
        description={t`No organization is currently linked to this company owner account.`}
      />
    );
  }

  return (
    <StudentPageShell
      eyebrow={t`Organization workspace`}
      title={t`Manage your organization`}
      description={t`Keep your company details, shared files, and team access up to date in one place.`}
    >
      {!isOrganizationActive && organization && (
        <div className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/40">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/60 dark:text-amber-400">
            <Clock className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              {t`Waiting for approval`}
            </p>
            <p className="text-sm leading-6 text-amber-700 dark:text-amber-400">
              {t`Your organization registration is under review. An administrator will approve it shortly. Invites, members, and document tools will become available once your account is activated.`}
            </p>
          </div>
        </div>
      )}

      <StudentMetricGrid>
        <StudentMetricCard
          label={t`Organization`}
          value={organizationQuery.isLoading ? '...' : (organization?.name ?? '—')}
          hint={organizationHint}
        />
        <StudentMetricCard
          label={t`Pending invites`}
          value={pendingInvitesValue}
          hint={hasOperationalAccess ? t`Open invitations` : lockedMetricHint}
        />
        <StudentMetricCard
          label={t`Members`}
          value={membersValue}
          hint={hasOperationalAccess ? t`People with access` : lockedMetricHint}
        />
        <StudentMetricCard
          label={t`Documents`}
          value={documentsValue}
          hint={hasOperationalAccess ? t`Shared organization files` : lockedMetricHint}
        />
      </StudentMetricGrid>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="bg-accent text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-foreground text-xl font-semibold">{t`Owner controls`}</h2>
              <p className="text-muted-foreground text-sm leading-6">
                {t`Only the company owner can update company details, manage invites, change member access, and transfer ownership.`}
              </p>
            </div>
          </div>
        </div>

        <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="bg-info/10 text-info flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
              <Files className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-foreground text-xl font-semibold">{t`Documents`}</h2>
              <p className="text-muted-foreground text-sm leading-6">
                {t`Keep important company files in one place so they're easy to upload, find, and download later.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <OrganizationProfileSection
        organization={organization}
        isLoading={organizationQuery.isLoading}
        isError={organizationQuery.isError}
        onRefresh={async () => {
          await organizationQuery.refetch();
        }}
      />

      {organizationId ? (
        <>
          {hasOperationalAccess ? null : (
            <StudentStatusCard
              title={t`Organization operations are waiting for activation`}
              description={activationDescription}
            />
          )}

          {hasOperationalAccess ? (
            <OrganizationInvitesSection organizationId={organizationId} />
          ) : null}
          {hasOperationalAccess ? (
            <OrganizationMembersSection organizationId={organizationId} currentUser={currentUser} />
          ) : null}
          {hasOperationalAccess ? (
            <OrganizationDocumentsSection organizationId={organizationId} />
          ) : null}
        </>
      ) : (
        <StudentStatusCard
          title={t`Organization setup is incomplete`}
          description={t`The remaining sections will appear once this owner account is linked to an organization.`}
        />
      )}
    </StudentPageShell>
  );
}
