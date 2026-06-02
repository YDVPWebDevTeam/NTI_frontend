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
        title={t`Helpful to know`}
        description={t`A few things to keep in mind when updating your email or password.`}
      >
        <div className="space-y-4 text-sm leading-6 text-[#5b667b]">
          <SecurityBehaviorItem
            icon={<MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#1e58d5]" />}
          >
            {t`When you change your email, your current address stays active until you confirm the new one from your inbox.`}
          </SecurityBehaviorItem>
          <SecurityBehaviorItem
            icon={<KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-[#1e58d5]" />}
          >
            {t`To change your password, enter your current one first. After the update, you'll be asked to sign in again.`}
          </SecurityBehaviorItem>
          <SecurityBehaviorItem
            icon={<ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#1e58d5]" />}
          >
            {t`If something needs attention, we'll show a clear message so you know what to do next.`}
          </SecurityBehaviorItem>
        </div>
      </StudentSectionCard>
    </div>
  );
}
