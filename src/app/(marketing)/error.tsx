'use client';

import { t } from '@lingui/core/macro';
import { useEffect } from 'react';

type MarketingErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function MarketingError({ error, reset }: MarketingErrorProps) {
  useEffect(() => {
    // Surface the error for monitoring; the boundary keeps the UI usable.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-1 items-center justify-center px-6 py-32">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-tertiary text-sm font-bold tracking-[0.2em] uppercase">
          {t`Something went wrong`}
        </p>

        <h1 className="font-headline text-on-surface mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t`This page failed to load`}
        </h1>

        <p className="text-on-surface-variant mx-auto mt-5 max-w-md text-lg leading-relaxed">
          {t`An unexpected error occurred. You can try again — if the problem persists, please come back later.`}
        </p>

        <button
          type="button"
          onClick={reset}
          className="primary-gradient shadow-primary/25 mt-8 inline-flex items-center justify-center rounded-xl px-8 py-3.5 font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
        >
          {t`Try again`}
        </button>
      </div>
    </main>
  );
}
