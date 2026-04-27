'use client';

import { t } from '@lingui/core/macro';
import Link from 'next/link';
import { useFormContext } from 'react-hook-form';

import { ControlledInputField } from 'components/forms';
import { Checkbox } from 'components/shadcn';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from 'components/shadcn';
import { ROUTES } from 'lib/constants';
import type { StudentRegistrationValues } from '../schema';

export function IdentityStep() {
  const { control } = useFormContext<StudentRegistrationValues>();

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        <ControlledInputField
          control={control}
          name="firstName"
          label={t`First Name`}
          placeholder={t`Enter your first name`}
        />

        <ControlledInputField
          control={control}
          name="lastName"
          label={t`Last Name`}
          placeholder={t`Enter your last name`}
        />
      </div>

      <ControlledInputField
        control={control}
        name="email"
        label={t`Email Address`}
        type="email"
        placeholder={t`name@institution.edu`}
      />

      <ControlledInputField
        control={control}
        name="password"
        label={t`Password`}
        type="password"
        placeholder={t`Create a secure password`}
      />

      <FormField
        control={control}
        name="acceptTerms"
        render={({ field }) => (
          <FormItem className="mt-1 flex flex-row items-start space-y-0 space-x-3 rounded-sm border border-black/10 bg-white px-4 py-4 text-sm text-neutral-700">
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
