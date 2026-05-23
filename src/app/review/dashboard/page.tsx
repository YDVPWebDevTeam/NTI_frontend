'use client';

import { t } from '@lingui/core/macro';

import { WorkspacePlaceholderPage } from 'components/workspace/workspace-placeholder-page';

export default function ReviewDashboardPage() {
  return (
    <WorkspacePlaceholderPage
      title={t`Review dashboard`}
      description={t`This review workspace is routed correctly. Program A review queues and detail routes can now be added under /review/* without reworking auth or layout structure.`}
    />
  );
}
