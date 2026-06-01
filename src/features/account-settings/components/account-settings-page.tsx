'use client';

import { t } from '@lingui/core/macro';
import Link from 'next/link';

import {
  StudentPageShell,
  StudentSectionCard,
} from 'components/student-dashboard/page-shell-primitives';
import { Button } from 'components/shadcn';
import type { AuthenticatedUserDto } from 'lib/api';
import { getDefaultRouteForRole } from 'lib/auth/access';

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
      description={t`Update your password and email with the same guarded flows used for authentication. Sensitive changes may require verification or a fresh sign-in.`}
      actions={
        <Button
          asChild
          variant="outline"
          className="rounded-2xl border-[#d8e4fb] bg-white/90 text-[#122039] hover:bg-[#f5f8ff]"
        >
          <Link href={getDefaultRouteForRole(user.role)}>{t`Return to workspace`}</Link>
        </Button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(19rem,0.9fr)]">
        <div className="space-y-6">
          <StudentSectionCard
            title={t`Password change`}
            description={t`Use your current password to authorize the change. After success, every active refresh session is revoked and a new sign-in is required.`}
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
            description={t`Request a new address first, then confirm the verification token or email link. The current address remains active until confirmation succeeds.`}
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
