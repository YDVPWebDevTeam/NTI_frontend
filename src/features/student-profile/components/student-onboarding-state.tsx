import { t } from '@lingui/core/macro';
import { Loader2 } from 'lucide-react';

import { Button, Card, CardContent } from 'components/shadcn';

export function StudentOnboardingLoadingState() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4">
      <div className="flex items-center gap-3 text-sm text-neutral-600">
        <Loader2 className="h-5 w-5 animate-spin text-[#1e58d5]" />
        <span>{t`Loading profile onboarding...`}</span>
      </div>
    </main>
  );
}

type StudentOnboardingErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function StudentOnboardingErrorState({
  message,
  onRetry,
}: StudentOnboardingErrorStateProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4">
      <Card className="w-full border-red-200 bg-red-50 shadow-none">
        <CardContent className="space-y-4 p-6 text-red-700">
          <h1 className="text-2xl font-semibold">{t`Profile onboarding is unavailable`}</h1>
          <p>{message}</p>
          <Button type="button" onClick={onRetry}>
            {t`Retry`}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
