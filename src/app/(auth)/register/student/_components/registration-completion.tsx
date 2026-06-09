import { t } from '@lingui/core/macro';
import { ArrowRight, MailCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { ResendConfirmationEmail } from 'components/auth/resend-confirmation-email';
import { Button } from 'components/shadcn';
import { ROUTES } from 'lib/constants/routes';

type RegistrationCompletionProps = {
  email?: string;
  onBackToLoginClick?: () => void;
};

export function RegistrationCompletion({ email, onBackToLoginClick }: RegistrationCompletionProps) {
  const trimmedEmail = email?.trim() ?? '';

  return (
    <div className="animate-in fade-in zoom-in slide-in-from-bottom-8 border-border bg-card relative overflow-hidden rounded-3xl border p-6 shadow-sm duration-700 sm:p-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
        <div className="bg-primary/15 absolute -top-24 -right-24 h-64 w-64 animate-pulse rounded-full blur-3xl" />
        <div
          className="bg-primary/10 absolute -bottom-24 -left-24 h-64 w-64 animate-pulse rounded-full blur-3xl"
          style={{ animationDelay: '1s' }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <div className="group border-primary/20 from-primary/5 to-primary/20 mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border bg-linear-to-br shadow-sm">
          <MailCheck className="text-primary h-12 w-12" />
        </div>

        <div className="border-border bg-card text-muted-foreground mt-8 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.24em] uppercase shadow-md">
          <Sparkles className="text-primary h-3.5 w-3.5" />
          {t`Account created`}
        </div>

        <h3 className="text-foreground mt-6 text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
          {t`Confirm your email to continue`}
        </h3>
        <p className="text-muted-foreground mt-5 text-base leading-relaxed">
          {trimmedEmail
            ? t`We sent a confirmation link to ${trimmedEmail}. Open it to verify your account, then you'll continue setting up your profile in onboarding.`
            : t`We sent you a confirmation link. Open it to verify your account, then you'll continue setting up your profile in onboarding.`}
        </p>

        <div className="mx-auto mt-8 max-w-md">
          <ResendConfirmationEmail email={trimmedEmail} />
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 rounded-full px-8 text-[12px] font-bold tracking-[0.15em] shadow-md transition-all hover:shadow-lg"
          >
            <Link href={ROUTES.AUTH.LOGIN} onClick={onBackToLoginClick}>
              {t`BACK TO LOGIN`}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
