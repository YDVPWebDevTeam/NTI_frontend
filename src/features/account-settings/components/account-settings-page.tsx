'use client';

import { t } from '@lingui/core/macro';

import {
  StudentPageShell,
  StudentSectionCard,
} from 'components/student-dashboard/page-shell-primitives';
import type { AuthenticatedUserDto } from 'lib/api';

import { useAccountSecurity } from '../hooks/use-account-security';
import { EmailChangeSection } from './email-change-section';
import { PasswordChangeSection } from './password-change-section';
import { SecurityOverviewSection } from './security-overview-section';

export function AccountSettingsPage({ user }: { user: AuthenticatedUserDto }) {
  const security = useAccountSecurity(user);

  return (
    <StudentPageShell
      eyebrow={t`Account security`}
      title={t`Manage your account`}
      description={t`Change your email or password here. For some updates, we may ask you to verify the change or sign in again.`}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(19rem,0.9fr)]">
        <div className="space-y-6">
          <StudentSectionCard
            title={t`Password change`}
            description={t`Enter your current password to make the change. After that, you'll need to sign in again.`}
          >
            <PasswordChangeSection
              feedback={security.passwordFeedback}
              form={security.passwordForm}
              isPending={security.passwordMutation.isPending}
              isRedirectPending={security.isReauthRedirectPending}
              onSubmit={security.handlePasswordSubmit}
            />
          </StudentSectionCard>

          <StudentSectionCard
            title={t`Email change`}
            description={t`Enter your new email first, then confirm it from your inbox. Your current email stays active until you finish that step.`}
          >
            <EmailChangeSection
              canConfirmEmailChange={
                Boolean(security.pendingEmail) || Boolean(security.confirmTokenFromSearch)
              }
              confirmFeedback={security.emailConfirmFeedback}
              confirmForm={security.emailConfirmForm}
              isConfirmPending={security.emailConfirmMutation.isPending}
              isRedirectPending={security.isReauthRedirectPending}
              isRequestPending={security.emailRequestMutation.isPending}
              onConfirmSubmit={security.handleEmailConfirmSubmit}
              onRequestSubmit={security.handleEmailRequestSubmit}
              pendingEmail={security.pendingEmail}
              requestFeedback={security.emailRequestFeedback}
              requestForm={security.emailRequestForm}
            />
          </StudentSectionCard>
        </div>

        <SecurityOverviewSection
          isReauthRedirectPending={security.isReauthRedirectPending}
          latestFeedback={security.latestFeedback}
          pendingEmail={security.pendingEmail}
          user={user}
        />
      </div>
    </StudentPageShell>
  );
}
