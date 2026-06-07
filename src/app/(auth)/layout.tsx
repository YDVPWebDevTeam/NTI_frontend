'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useGetMe, UserStatus } from 'lib/api';
import { getPostAuthRedirect } from 'lib/auth/public-auth-flow';

import { PublicShell } from 'components/layout/public-shell';

// Lightweight guard: if an already-authenticated ACTIVE user lands on an auth
// page, send them to their post-auth destination. Unauthenticated users get a
// 401 from /me (expected) and keep rendering the auth pages normally, so we
// never block rendering on the query.
function useRedirectAuthenticatedUser() {
  const router = useRouter();

  const meQuery = useGetMe({
    query: {
      retry: false,
    },
  });

  useEffect(() => {
    const user = meQuery.data;

    if (!user || user.status !== UserStatus.ACTIVE) {
      return;
    }

    router.replace(getPostAuthRedirect(user));
  }, [meQuery.data, router]);
}

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useRedirectAuthenticatedUser();

  return <PublicShell>{children}</PublicShell>;
}
