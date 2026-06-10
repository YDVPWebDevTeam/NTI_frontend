'use client';

import { t } from '@lingui/core/macro';
import { CheckCircle2, MailCheck, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import type { StudentProfileUserDto } from 'lib/api';
import {
  checkUniversityEmailDomain,
  useRequestUniversityEmailDomain,
} from 'lib/api-client/university-email-domains';
import {
  isStudentEmailDomainNotAllowedError,
  useResendStudentEmailVerification,
  useSetStudentEmail,
} from 'lib/api-client/student-email';
import { Button, Input, Label } from 'components/shadcn';

type StudentEmailStageProps = {
  user: StudentProfileUserDto;
  onRefresh: () => void;
};

function isLikelyEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function StudentEmailStage({ user, onRefresh }: StudentEmailStageProps) {
  const hasPendingEmail = Boolean(user.studentEmail) && !user.isStudentEmailConfirmed;
  const [showInput, setShowInput] = useState(!user.studentEmail);
  const [email, setEmail] = useState('');
  const [blockedDomain, setBlockedDomain] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const setStudentEmail = useSetStudentEmail();
  const resendVerification = useResendStudentEmailVerification();
  const requestDomain = useRequestUniversityEmailDomain();

  const isBusy = isChecking || setStudentEmail.isPending;

  const handleSubmit = async () => {
    const normalized = email.trim().toLowerCase();

    setBlockedDomain(null);

    if (!isLikelyEmail(normalized)) {
      toast.error(t`Enter a valid email address.`);

      return;
    }

    try {
      setIsChecking(true);
      const check = await checkUniversityEmailDomain(normalized);

      setIsChecking(false);

      if (!check.isUniversityDomain) {
        setBlockedDomain(check.domain);

        return;
      }

      await setStudentEmail.mutateAsync(normalized);
      toast.success(t`We sent a confirmation link to ${normalized}.`);
      setShowInput(false);
      setEmail('');
      onRefresh();
    } catch (error) {
      setIsChecking(false);

      if (isStudentEmailDomainNotAllowedError(error)) {
        setBlockedDomain(normalized.split('@')[1] ?? normalized);

        return;
      }

      toast.error(error instanceof Error ? error.message : t`Unable to save your student email.`);
    }
  };

  const handleRequestDomain = async () => {
    const normalized = email.trim().toLowerCase();

    try {
      await requestDomain.mutateAsync({ email: normalized });
      toast.success(t`Request sent. An administrator will review this domain.`);
      setBlockedDomain(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to send the request.`);
    }
  };

  const handleResend = async () => {
    try {
      await resendVerification.mutateAsync();
      toast.success(t`Confirmation link sent again.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to resend the email.`);
    }
  };

  if (user.isStudentEmailConfirmed) {
    return (
      <div className="border-success/30 bg-success/10 text-success flex items-start gap-3 rounded-sm border p-4 text-sm">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="space-y-1">
          <p className="font-semibold">{t`Student email verified`}</p>
          <p>{user.studentEmail}</p>
        </div>
      </div>
    );
  }

  const inputSection = (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="student-email-input">{t`University email`}</Label>
        <Input
          id="student-email-input"
          type="email"
          inputMode="email"
          spellCheck={false}
          autoComplete="email"
          placeholder={t`name@ukf.sk`}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <p className="text-muted-foreground text-xs">
          {t`Use your official university email address. We'll send a confirmation link to verify it.`}
        </p>
      </div>

      {blockedDomain ? (
        <div className="border-destructive/30 bg-destructive/10 text-destructive space-y-3 rounded-sm border p-4 text-sm">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold">{t`Domain not recognized`}</p>
              <p>
                {t`The domain "${blockedDomain}" is not on the approved university list. You can ask an administrator to add it.`}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={requestDomain.isPending}
            onClick={() => void handleRequestDomain()}
          >
            {requestDomain.isPending ? t`Sending…` : t`Request this domain`}
          </Button>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={isBusy}
          onClick={() => void handleSubmit()}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isBusy ? t`Sending…` : t`Send verification`}
        </Button>

        {user.studentEmail ? (
          <Button type="button" variant="outline" onClick={() => setShowInput(false)}>
            {t`Cancel`}
          </Button>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {hasPendingEmail && !showInput ? (
        <div className="space-y-4">
          <div className="border-info/30 bg-info/10 text-info flex items-start gap-3 rounded-sm border p-4 text-sm">
            <MailCheck className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold">{t`Confirm your student email`}</p>
              <p>
                {t`We sent a confirmation link to ${user.studentEmail ?? ''}. Open it to verify your student status.`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              disabled={resendVerification.isPending}
              onClick={() => void handleResend()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {resendVerification.isPending ? t`Sending…` : t`Resend confirmation`}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowInput(true)}>
              {t`Use a different email`}
            </Button>
          </div>
        </div>
      ) : (
        inputSection
      )}
    </div>
  );
}
