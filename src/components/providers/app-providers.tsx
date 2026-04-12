'use client';

import { Toaster } from 'sonner';

import { LinguiProvider } from '@/src/components/providers/i18n-provider';

import { QueryProvider } from './query-provider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LinguiProvider>
      <QueryProvider>
        {children}
        <Toaster richColors closeButton position="top-right" />
      </QueryProvider>
    </LinguiProvider>
  );
}
