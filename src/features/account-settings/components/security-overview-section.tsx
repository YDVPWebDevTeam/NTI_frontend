'use client';

import { t } from '@lingui/core/macro';
import { AlertTriangle, KeyRound, MailCheck, ShieldAlert } from 'lucide-react';
import type { ReactNode } from 'react';

import {
  StudentKeyValueList,
  StudentSectionCard,
} from 'components/student-dashboard/page-shell-primitives';
import type { AuthenticatedUserDto } from 'lib/api';
import { formatEnumLabel } from 'lib/utils';

import type { SecurityFeedback } from '../lib/types';
import { SecurityFeedbackBanner } from './security-feedback-banner';

function SecurityBehaviorItem({ children, icon }: { children: ReactNode; icon: ReactNode }) {
  return (
    <div className="rounded-[1.25rem] border border-[#dce7ff] bg-[#f7faff] p-4">
      <div className="flex items-start gap-3">
        {icon}
        <p>{children}</p>
      </div>
    </div>
  );
}

export function SecurityOverviewSection({
  isReauthRedirectPending,
  latestFeedback,
  pendingEmail,
  user,
}: {
  isReauthRedirectPending: boolean;
  latestFeedback: SecurityFeedback;
  pendingEmail: string | null;
  user: AuthenticatedUserDto;
}) {
  return (
    <div className="space-y-6">
      <StudentSectionCard
        title={t`Security overview`}
        description={t`A quick view of the account identity and the last sensitive action state.`}
      >
        <div className="space-y-5">
          <StudentKeyValueList
            items={[
              { label: t`Current email`, value: user.email },
              { label: t`Role`, value: formatEnumLabel(user.role) },
              { label: t`Account status`, value: formatEnumLabel(user.status) },
              {
                label: t`Pending email`,
                value: pendingEmail ?? t`None`,
              },
            ]}
          />

          <SecurityFeedbackBanner feedback={latestFeedback} eyebrow={t`Latest update`} />

          {isReauthRedirectPending ? (
            <div className="rounded-[1.25rem] border border-[#f7d58a] bg-[#fff7e6] px-4 py-4 text-sm leading-6 text-[#7a4b00]">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  {t`The current session is being closed for safety. Redirecting you to sign in again.`}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </StudentSectionCard>

      <StudentSectionCard
        title={t`How the flows behave`}
        description={t`These states are intentional so security changes stay explicit.`}
      >
        <div className="space-y-4 text-sm leading-6 text-[#5b667b]">
          <SecurityBehaviorItem
            icon={<MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#1e58d5]" />}
          >
            {t`Email requests only create a pending verification step. The current address remains unchanged until the token is confirmed.`}
          </SecurityBehaviorItem>
          <SecurityBehaviorItem
            icon={<KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-[#1e58d5]" />}
          >
            {t`Password changes require the current password and immediately invalidate active refresh sessions across devices.`}
          </SecurityBehaviorItem>
          <SecurityBehaviorItem
            icon={<ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#1e58d5]" />}
          >
            {t`If the backend reports an invalid token, a conflict, or an expired session, the exact server error is surfaced here instead of being hidden behind generic copy.`}
          </SecurityBehaviorItem>
        </div>
      </StudentSectionCard>
    </div>
  );
}
