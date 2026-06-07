'use client';

import { t } from '@lingui/core/macro';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useEffectEvent, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  getGetMeQueryKey,
  type AuthenticatedUserDto,
  useChangeMyPassword,
  useConfirmMyEmailChange,
  useRequestMyEmailChange,
} from 'lib/api';
import { isApiRequestError } from 'lib/api-client/openapi-runtime/client';
import { ROUTES } from 'lib/constants';

import {
  createChangeEmailConfirmSchema,
  createChangeEmailRequestSchema,
  createChangePasswordSchema,
  type ChangeEmailConfirmFormValues,
  type ChangeEmailRequestFormValues,
  type ChangePasswordFormValues,
} from '../lib/schemas';
import type { SecurityFeedback } from '../lib/types';

const REAUTH_REDIRECT_DELAY_MS = 1200;
const TOO_MANY_REQUESTS_STATUS = 429;

type ReauthReason = 'password-changed' | 'email-changed' | 'session-expired';

export function useAccountSecurity(user: AuthenticatedUserDto) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const confirmTokenFromSearch = searchParams.get('token')?.trim() ?? '';

  const [latestFeedback, setLatestFeedback] = useState<SecurityFeedback>({
    title: t`Your account is protected`,
    description: t`You can update your password or email here. If anything extra is needed, we'll walk you through it.`,
    tone: 'info',
  });
  const [passwordFeedback, setPasswordFeedback] = useState<SecurityFeedback | null>(null);
  const [emailRequestFeedback, setEmailRequestFeedback] = useState<SecurityFeedback | null>(null);
  const [emailConfirmFeedback, setEmailConfirmFeedback] = useState<SecurityFeedback | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [isReauthRedirectPending, setIsReauthRedirectPending] = useState(false);
  const [hasAutoConfirmedToken, setHasAutoConfirmedToken] = useState(false);
  const [reauthTimerId, setReauthTimerId] = useState<number | null>(null);

  const passwordMutation = useChangeMyPassword();
  const emailRequestMutation = useRequestMyEmailChange();
  const emailConfirmMutation = useConfirmMyEmailChange();

  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(createChangePasswordSchema()),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
    mode: 'onChange',
  });

  const emailRequestForm = useForm<ChangeEmailRequestFormValues>({
    resolver: zodResolver(createChangeEmailRequestSchema(user.email)),
    defaultValues: {
      newEmail: '',
    },
    mode: 'onChange',
  });

  const emailConfirmForm = useForm<ChangeEmailConfirmFormValues>({
    resolver: zodResolver(createChangeEmailConfirmSchema()),
    defaultValues: {
      token: confirmTokenFromSearch,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (!confirmTokenFromSearch) {
      return;
    }

    emailConfirmForm.setValue('token', confirmTokenFromSearch, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });
  }, [confirmTokenFromSearch, emailConfirmForm]);

  useEffect(
    () => () => {
      if (reauthTimerId != null) {
        window.clearTimeout(reauthTimerId);
      }
    },
    [reauthTimerId],
  );

  const redirectToLogin = (reason: ReauthReason) => {
    if (reauthTimerId != null) {
      window.clearTimeout(reauthTimerId);
    }

    setIsReauthRedirectPending(true);

    void queryClient.cancelQueries({ queryKey: getGetMeQueryKey() });
    queryClient.removeQueries({ queryKey: getGetMeQueryKey(), exact: true });
    void queryClient.invalidateQueries();

    const params = new URLSearchParams({ accountAction: reason });

    if (reason === 'email-changed' && pendingEmail) {
      params.set('email', pendingEmail);
    }

    if (reason === 'session-expired' && pathname) {
      const currentSearch = searchParams.toString();

      params.set('next', currentSearch ? `${pathname}?${currentSearch}` : pathname);
    }

    const timeoutId = window.setTimeout(() => {
      router.replace(`${ROUTES.AUTH.LOGIN}?${params.toString()}`);
    }, REAUTH_REDIRECT_DELAY_MS);

    setReauthTimerId(timeoutId);
  };

  const handleAuthError = (error: unknown, fallbackMessage: string) => {
    if (isApiRequestError(error) && error.status === 401) {
      const feedback: SecurityFeedback = {
        title: t`Your session is no longer valid`,
        description: t`Sign in again before making more account changes.`,
        tone: 'warning',
      };

      setLatestFeedback(feedback);
      toast.error(error.message || fallbackMessage);
      redirectToLogin('session-expired');

      return true;
    }

    return false;
  };

  const handleTooManyRequestsError = (error: unknown) => {
    if (isApiRequestError(error) && error.status === TOO_MANY_REQUESTS_STATUS) {
      const feedback: SecurityFeedback = {
        title: t`Please wait before trying again`,
        description: t`Please wait about a minute before requesting another email confirmation.`,
        tone: 'warning',
      };

      setEmailRequestFeedback(feedback);
      setLatestFeedback(feedback);
      toast.error(feedback.description);

      return true;
    }

    return false;
  };

  const handlePasswordSubmit = async (values: ChangePasswordFormValues) => {
    setPasswordFeedback(null);

    try {
      const response = await passwordMutation.mutateAsync({ data: values });
      const feedback: SecurityFeedback = {
        title: t`Password updated`,
        description:
          response.message ||
          t`Your password was updated. To keep your account safe, you'll need to sign in again with the new password.`,
        tone: 'warning',
      };

      setPasswordFeedback(feedback);
      setLatestFeedback(feedback);
      passwordForm.reset();
      toast.success(t`Password changed. Sign in again with your new password.`);
      redirectToLogin('password-changed');
    } catch (error) {
      if (handleAuthError(error, t`Unable to change the password right now.`)) {
        return;
      }

      const feedback: SecurityFeedback = {
        title: t`Password change failed`,
        description:
          error instanceof Error ? error.message : t`Unable to change the password right now.`,
        tone: 'danger',
      };

      setPasswordFeedback(feedback);
      setLatestFeedback(feedback);
      toast.error(feedback.description);
    }
  };

  const handleEmailRequestSubmit = async (values: ChangeEmailRequestFormValues) => {
    setEmailRequestFeedback(null);

    try {
      const normalizedEmail = values.newEmail.trim().toLowerCase();
      const response = await emailRequestMutation.mutateAsync({
        data: { newEmail: normalizedEmail },
      });
      const feedback: SecurityFeedback = {
        title: t`Verification pending`,
        description:
          response.message ||
          t`We sent a confirmation message to your new email. Your current email will stay the same until you confirm the change.`,
        tone: 'info',
      };

      setPendingEmail(normalizedEmail);
      setEmailRequestFeedback(feedback);
      setLatestFeedback(feedback);
      emailRequestForm.reset();
      toast.success(t`Email change confirmation sent.`);

      return true;
    } catch (error) {
      if (handleAuthError(error, t`Unable to request the email change right now.`)) {
        return false;
      }

      if (handleTooManyRequestsError(error)) {
        return false;
      }

      const feedback: SecurityFeedback = {
        title: t`Email change request failed`,
        description:
          error instanceof Error ? error.message : t`Unable to request the email change right now.`,
        tone: 'danger',
      };

      setEmailRequestFeedback(feedback);
      setLatestFeedback(feedback);
      toast.error(feedback.description);

      return false;
    }
  };

  const handleEmailConfirmSubmit = async (values: ChangeEmailConfirmFormValues) => {
    setEmailConfirmFeedback(null);

    try {
      const response = await emailConfirmMutation.mutateAsync({
        data: { token: values.token.trim() },
      });
      const feedback: SecurityFeedback = {
        title: t`Email updated`,
        description:
          response.message ||
          t`Your new email is now active. To keep your account safe, you'll need to sign in again.`,
        tone: 'warning',
      };

      setEmailConfirmFeedback(feedback);
      setLatestFeedback(feedback);
      emailConfirmForm.reset({ token: '' });
      toast.success(t`Email confirmed. Sign in again with your updated address.`);
      redirectToLogin('email-changed');
    } catch (error) {
      if (handleAuthError(error, t`Unable to confirm the email change right now.`)) {
        return;
      }

      const feedback: SecurityFeedback = {
        title: t`Email confirmation failed`,
        description:
          error instanceof Error ? error.message : t`Unable to confirm the email change right now.`,
        tone: 'danger',
      };

      setEmailConfirmFeedback(feedback);
      setLatestFeedback(feedback);
      toast.error(feedback.description);
    }
  };

  const runAutoConfirm = useEffectEvent(() => {
    setHasAutoConfirmedToken(true);
    void emailConfirmForm.handleSubmit(handleEmailConfirmSubmit)();
  });

  useEffect(() => {
    if (!confirmTokenFromSearch || hasAutoConfirmedToken || emailConfirmMutation.isPending) {
      return;
    }

    runAutoConfirm();
  }, [
    confirmTokenFromSearch,
    emailConfirmMutation.isPending,
    hasAutoConfirmedToken,
    runAutoConfirm,
  ]);

  // While a token is present in the URL the auto-confirm effect will fire (or is
  // already running). Surface this so the manual confirm button can be disabled to
  // avoid a manual submit racing with the auto-confirm.
  const isAutoConfirmPending =
    confirmTokenFromSearch.length > 0 && (!hasAutoConfirmedToken || emailConfirmMutation.isPending);

  return {
    confirmTokenFromSearch,
    isAutoConfirmPending,
    emailConfirmFeedback,
    emailConfirmForm,
    emailConfirmMutation,
    emailRequestFeedback,
    emailRequestForm,
    emailRequestMutation,
    isReauthRedirectPending,
    latestFeedback,
    passwordFeedback,
    passwordForm,
    passwordMutation,
    pendingEmail,
    handleEmailConfirmSubmit,
    handleEmailRequestSubmit,
    handlePasswordSubmit,
  };
}
