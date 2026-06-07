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
    <div className="border-border bg-muted rounded-2xl border p-4">
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
        description={t`See your current account details and the latest update here.`}
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
            <div className="border-warning/30 bg-warning/10 text-warning rounded-2xl border px-4 py-4 text-sm leading-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{t`We're signing you out now. Please sign in again to keep going.`}</p>
              </div>
            </div>
          ) : null}
        </div>
      </StudentSectionCard>

      <StudentSectionCard
        title={t`Helpful to know`}
        description={t`A few quick notes before you make changes.`}
      >
        <div className="text-muted-foreground space-y-4 text-sm leading-6">
          <SecurityBehaviorItem
            icon={<MailCheck className="text-primary mt-0.5 h-4 w-4 shrink-0" />}
          >
            {t`When you change your email, your current address stays active until you confirm the new one from your inbox.`}
          </SecurityBehaviorItem>
          <SecurityBehaviorItem
            icon={<KeyRound className="text-primary mt-0.5 h-4 w-4 shrink-0" />}
          >
            {t`To change your password, enter your current one first. After the update, you'll be asked to sign in again.`}
          </SecurityBehaviorItem>
          <SecurityBehaviorItem
            icon={<ShieldAlert className="text-primary mt-0.5 h-4 w-4 shrink-0" />}
          >
            {t`If something goes wrong, we'll tell you what to do next.`}
          </SecurityBehaviorItem>
        </div>
      </StudentSectionCard>
    </div>
  );
}
