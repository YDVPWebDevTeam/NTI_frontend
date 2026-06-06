'use client';

import { use } from 'react';

import { ProgramAMentorProjectDetailPage } from 'features/mentor-program-a/components';

export default function MentorProgramAProjectDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return <ProgramAMentorProjectDetailPage applicationId={id} />;
}
