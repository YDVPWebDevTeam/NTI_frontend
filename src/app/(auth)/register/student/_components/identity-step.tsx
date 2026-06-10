'use client';

import { t } from '@lingui/core/macro';
import { Info } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { ControlledInputField, ControlledPasswordField } from 'components/forms';
import { Checkbox } from 'components/shadcn';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from 'components/shadcn';
import type { StudentRegistrationValues } from 'lib/auth/schemas';
import { useCheckUniversityEmailDomain } from 'lib/api-client/university-email-domains';
import { ROUTES } from 'lib/constants';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_CHECK_DEBOUNCE_MS = 500;

function NonUniversityEmailNotice() {
  const control = useFormContext<StudentRegistrationValues>().control;
  const email = useWatch({ control, name: 'email' }) ?? '';
  const [debouncedEmail, setDebouncedEmail] = useState('');

  useEffect(() => {
    const trimmed = email.trim().toLowerCase();
    const timeoutId = window.setTimeout(() => {
      setDebouncedEmail(EMAIL_PATTERN.test(trimmed) ? trimmed : '');
    }, EMAIL_CHECK_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [email]);

  const domainCheck = useCheckUniversityEmailDomain(debouncedEmail, debouncedEmail.length > 0);

  if (!domainCheck.data || domainCheck.data.isUniversityDomain) {
    return null;
  }

  return (
    <div className="border-warning/40 bg-warning/15 text-foreground flex items-start gap-2 rounded-sm border px-3 py-2 text-xs">
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <span>
        {t`This doesn't look like a university email. You can register with it, but you'll need to add and confirm a student email during onboarding.`}
      </span>
    </div>
  );
}

export function IdentityStep() {
  const { control } = useFormContext<StudentRegistrationValues>();

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        <ControlledInputField
          control={control}
          name="firstName"
          label={t`First Name`}
          placeholder={t`Enter your first name…`}
          autoComplete="given-name"
          spellCheck={false}
        />

        <ControlledInputField
          control={control}
          name="lastName"
          label={t`Last Name`}
          placeholder={t`Enter your last name…`}
          autoComplete="family-name"
          spellCheck={false}
        />
      </div>

      <div className="space-y-2">
        <ControlledInputField
          control={control}
          name="email"
          label={t`Email Address`}
          type="email"
          placeholder={t`name@institution.edu…`}
          autoComplete="email"
          inputMode="email"
          spellCheck={false}
        />
        <NonUniversityEmailNotice />
      </div>

      <ControlledPasswordField
        control={control}
        name="password"
        label={t`Password`}
        placeholder={t`Create a secure password…`}
        autoComplete="new-password"
        spellCheck={false}
        description={t`Use at least 6 characters.`}
      />

      <FormField
        control={control}
        name="acceptTerms"
        render={({ field }) => (
          <FormItem className="border-border bg-card text-foreground mt-1 flex flex-row items-start space-y-0 space-x-3 rounded-sm border px-4 py-4 text-sm">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                className="mt-0.5 rounded border-black/20"
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                {t`I accept the `}
                <Link
                  className="underline underline-offset-2 hover:no-underline"
                  href={ROUTES.PRIVACY_POLICY}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t`Privacy Policy`}
                </Link>
                {t` and institutional data processing terms required for platform access.`}
              </FormLabel>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}
