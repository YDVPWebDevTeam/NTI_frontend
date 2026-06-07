'use client';

import type { Messages } from '@lingui/core';
import { Toaster } from 'sonner';

import type { AppLocale } from 'lib/i18n/config';

import { LinguiProvider } from './i18n-provider';

import { QueryProvider } from './query-provider';

type AppProvidersProps = {
  children: React.ReactNode;
  initialLocale: AppLocale;
  initialMessages: Messages;
};

export function AppProviders({ children, initialLocale, initialMessages }: AppProvidersProps) {
  return (
    <LinguiProvider initialLocale={initialLocale} initialMessages={initialMessages}>
      <QueryProvider>
        {children}
        <Toaster richColors closeButton position="top-right" />
      </QueryProvider>
    </LinguiProvider>
  );
}
