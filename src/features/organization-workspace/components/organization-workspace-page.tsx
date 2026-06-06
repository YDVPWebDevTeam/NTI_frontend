'use client';

import { t } from '@lingui/core/macro';
import { Building2, Files } from 'lucide-react';

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
import { useOrganizationDocumentsControllerListDocumentsCompat } from 'lib/api';
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
  const documentsQuery = useOrganizationDocumentsControllerListDocumentsCompat(organizationId, {
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
    documentsValue = documentsQuery.isLoading ? '...' : String(documentsQuery.data?.length ?? 0);
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
        <div className="rounded-[1.75rem] border border-white/85 bg-white/92 p-6 shadow-[0_14px_36px_rgba(19,27,46,0.05)]">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#1f56c2]">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-[#101a2e]">{t`Owner controls`}</h2>
              <p className="text-sm leading-6 text-[#5b667b]">
                {t`Only the company owner can update company details, manage invites, change member access, and transfer ownership.`}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/85 bg-white/92 p-6 shadow-[0_14px_36px_rgba(19,27,46,0.05)]">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef8ff] text-[#1570a6]">
              <Files className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-[#101a2e]">{t`Documents`}</h2>
              <p className="text-sm leading-6 text-[#5b667b]">
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
