'use client';

import { UserRole } from 'lib/api';
import { StudentStatusCard } from 'components/student-dashboard/page-shell-primitives';
import { StudentProfilePage } from 'features/student-profile';
import { useAuthenticatedUser } from 'lib/student-dashboard/use-authenticated-user';

export default function OnboardingProfilePage() {
  const { isAllowed, isLoading, me } = useAuthenticatedUser([UserRole.STUDENT]);

  if (isLoading || !me || !isAllowed) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4">
        <StudentStatusCard
          title="Loading workspace"
          description="Resolving your authenticated workspace."
        />
      </main>
    );
  }

  return <StudentProfilePage />;
}
