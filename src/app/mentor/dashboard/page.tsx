'use client';

import { t } from '@lingui/core/macro';

import { WorkspacePlaceholderPage } from 'components/workspace/workspace-placeholder-page';

export default function MentorDashboardPage() {
  return (
    <WorkspacePlaceholderPage
      title={t`Mentor dashboard`}
      description={t`This mentor workspace is routed correctly. Project mentoring and progress views can now be added under /mentor/* without reworking auth or shell ownership.`}
    />
  );
}
