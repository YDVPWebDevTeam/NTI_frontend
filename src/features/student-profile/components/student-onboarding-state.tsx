import { t } from '@lingui/core/macro';
import { Loader2 } from 'lucide-react';

import { Button, Card, CardContent } from 'components/shadcn';

export function StudentOnboardingLoadingState() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4">
      <div className="text-muted-foreground flex items-center gap-3 text-sm">
        <Loader2 className="text-primary h-5 w-5 animate-spin" />
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
      <Card className="border-destructive/30 bg-destructive/10 w-full shadow-none">
        <CardContent className="text-destructive space-y-4 p-6">
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
