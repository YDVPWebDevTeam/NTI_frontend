'use client';

import { t } from '@lingui/core/macro';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Loader2,
  Mail,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  useAcceptOrganizationInvite,
  useLogin,
  useOrganizationControllerAcceptInvite,
  useOrganizationControllerValidateInvite,
} from 'lib/api';

import { ROUTES } from 'lib/constants';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from 'components/shadcn';

type InviteMode = 'create-account' | 'existing-account';

type CreateAccountForm = {
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
};

const MIN_NAME_LENGTH = 2;
const MIN_PASSWORD_LENGTH = 8;

const initialCreateAccountForm: CreateAccountForm = {
  firstName: '',
  lastName: '',
  password: '',
  confirmPassword: '',
};

export default function OrganizationInviteOnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get('token')?.trim() ?? '';

  const [mode, setMode] = useState<InviteMode>('create-account');
  const [createAccountForm, setCreateAccountForm] =
    useState<CreateAccountForm>(initialCreateAccountForm);
  const [existingAccountPassword, setExistingAccountPassword] = useState('');

  const validateInvite = useOrganizationControllerValidateInvite();
  const acceptOrganizationInvite = useAcceptOrganizationInvite();
  const login = useLogin();
  const acceptExistingAccountInvite = useOrganizationControllerAcceptInvite();

  const [validatedInvitation, setValidatedInvitation] = useState<{
    token: string;
    data: typeof validateInvite.data;
  }>();

  useEffect(() => {
    if (!token) {
      return;
    }

    validateInvite.mutate(
      {
        data: {
          token,
        },
      },
      {
        onSuccess: (data) => {
          setValidatedInvitation({
            token,
            data,
          });
        },
        onError: () => {
          setValidatedInvitation(undefined);
        },
      },
    );
  }, [token, validateInvite]);

  const invitation = validatedInvitation?.token === token ? validatedInvitation.data : undefined;

  const isCreateAccountFormValid = useMemo(() => {
    const firstName = createAccountForm.firstName.trim();
    const lastName = createAccountForm.lastName.trim();
    const password = createAccountForm.password;
    const confirmPassword = createAccountForm.confirmPassword;

    return (
      firstName.length >= MIN_NAME_LENGTH &&
      lastName.length >= MIN_NAME_LENGTH &&
      password.length >= MIN_PASSWORD_LENGTH &&
      confirmPassword.length >= MIN_PASSWORD_LENGTH &&
      password === confirmPassword
    );
  }, [createAccountForm]);

  const isExistingAccountFormValid = existingAccountPassword.length >= MIN_PASSWORD_LENGTH;

  const isCreateAccountPending = acceptOrganizationInvite.isPending;
  const isExistingAccountPending = login.isPending || acceptExistingAccountInvite.isPending;

  const handleCreateAccountSubmit = async () => {
    if (!token || !isCreateAccountFormValid) {
      return;
    }

    try {
      await acceptOrganizationInvite.mutateAsync({
        data: {
          token,
          firstName: createAccountForm.firstName.trim(),
          lastName: createAccountForm.lastName.trim(),
          password: createAccountForm.password,
          confirmPassword: createAccountForm.confirmPassword,
        },
      });

      toast.success(t`Organization invitation accepted.`);
      router.push(ROUTES.DASHBOARD);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to accept invitation.`);
    }
  };

  const handleExistingAccountSubmit = async () => {
    if (!token || !invitation?.email || !isExistingAccountFormValid) {
      return;
    }

    try {
      await login.mutateAsync({
        data: {
          email: invitation.email,
          password: existingAccountPassword,
        },
      });

      await acceptExistingAccountInvite.mutateAsync({
        data: {
          token,
        },
      });

      toast.success(t`Organization invitation accepted.`);
      router.push(ROUTES.DASHBOARD);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t`Unable to sign in and accept the organization invitation.`,
      );
    }
  };

  const updateCreateAccountField = (field: keyof CreateAccountForm, value: string) => {
    setCreateAccountForm((currentValue) => ({
      ...currentValue,
      [field]: value,
    }));
  };

  const passwordMismatch =
    createAccountForm.confirmPassword.length > 0 &&
    createAccountForm.password !== createAccountForm.confirmPassword;

  return (
    <main className="bg-surface text-on-surface min-h-screen">
      <div className="grid min-h-screen lg:grid-cols-[minmax(360px,0.95fr)_minmax(0,1.05fr)]">
        <section className="relative overflow-hidden bg-[#061742] px-6 py-10 text-white sm:px-10 lg:px-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(58,115,255,0.36),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(0,184,148,0.22),transparent_32%)]" />

          <div className="relative z-10 flex min-h-full flex-col justify-between gap-16">
            <div>
              <Link href="/" className="inline-flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                  <ShieldCheck className="h-6 w-6" />
                </div>

                <span className="font-headline text-xl font-bold tracking-tight">NTI</span>
              </Link>

              <div className="mt-16 max-w-xl">
                <Badge className="mb-6 bg-white/12 text-white hover:bg-white/12">
                  <UserPlus className="mr-2 h-4 w-4" />
                  {t`Organization invitation`}
                </Badge>

                <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">
                  {t`Join your company workspace`}
                </h1>

                <p className="mt-5 text-base leading-8 text-white/72">
                  {t`Create an employee account or sign in with your existing account to accept this organization invitation.`}
                </p>
              </div>
            </div>

            <div className="grid gap-4 text-sm text-white/72 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
                <p className="font-semibold text-white">{t`Secure onboarding`}</p>
                <p className="mt-2">{t`Your invitation token is verified before account setup.`}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
                <p className="font-semibold text-white">{t`Employee access`}</p>
                <p className="mt-2">{t`The invite assigns the company employee role automatically.`}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-12">
          <Card className="bg-surface-container-lowest w-full max-w-xl rounded-2xl border border-black/10 shadow-sm">
            <CardHeader className="space-y-5">
              <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl">
                <Building2 className="h-6 w-6" />
              </div>

              <div>
                <CardTitle className="font-headline text-3xl text-[#0c1a4f]">
                  {t`Accept organization invite`}
                </CardTitle>

                <p className="text-on-surface-variant mt-2 text-sm leading-6">
                  {t`Use the invitation details below to join the organization workspace.`}
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {token ? null : (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <div className="flex gap-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

                    <div>
                      <p className="font-semibold">{t`Missing invitation token`}</p>
                      <p className="mt-1">
                        {t`Open the full invitation link from your email and try again.`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {token && validateInvite.isPending ? (
                <div className="flex items-center gap-3 rounded-xl border border-black/10 bg-[#f7f8fa] px-4 py-3 text-sm text-neutral-600">
                  <Loader2 className="h-4 w-4 animate-spin text-[#1e58d5]" />
                  {t`Validating invitation…`}
                </div>
              ) : null}

              {token && validateInvite.isError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <div className="flex gap-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

                    <div>
                      <p className="font-semibold">{t`Invitation is not available`}</p>
                      <p className="mt-1">
                        {t`The invitation link may be expired, revoked, or invalid.`}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {invitation ? (
                <div className="bg-surface-container-low rounded-2xl border border-black/10 p-4">
                  <p className="text-[11px] font-medium tracking-[0.12em] text-neutral-500 uppercase">
                    {t`Invitation details`}
                  </p>

                  <div className="mt-3 space-y-3">
                    <div>
                      <p className="text-xs text-neutral-500">{t`Organization`}</p>
                      <p className="text-lg font-semibold text-[#0c1a4f]">
                        {invitation.organizationName}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-neutral-500">{t`Invited email`}</p>
                      <p className="flex items-center gap-2 text-sm font-medium text-neutral-900">
                        <Mail className="h-4 w-4 text-neutral-400" />
                        {invitation.email}
                      </p>
                    </div>

                    <Badge className="bg-[#dce8ff] text-[#0c3fa3] hover:bg-[#dce8ff]">
                      {invitation.roleToAssign}
                    </Badge>
                  </div>
                </div>
              ) : null}

              {invitation ? (
                <>
                  <div className="bg-surface-container-low grid gap-2 rounded-xl p-1 sm:grid-cols-2">
                    <Button
                      type="button"
                      variant={mode === 'create-account' ? 'default' : 'ghost'}
                      onClick={() => setMode('create-account')}
                      className={
                        mode === 'create-account'
                          ? 'h-11 rounded-lg bg-[#1e58d5] text-[12px] font-semibold tracking-widest text-white hover:bg-[#245fdc]'
                          : 'h-11 rounded-lg text-[12px] font-semibold tracking-widest text-[#0c1a4f]'
                      }
                    >
                      {t`CREATE ACCOUNT`}
                    </Button>

                    <Button
                      type="button"
                      variant={mode === 'existing-account' ? 'default' : 'ghost'}
                      onClick={() => setMode('existing-account')}
                      className={
                        mode === 'existing-account'
                          ? 'h-11 rounded-lg bg-[#1e58d5] text-[12px] font-semibold tracking-widest text-white hover:bg-[#245fdc]'
                          : 'h-11 rounded-lg text-[12px] font-semibold tracking-widest text-[#0c1a4f]'
                      }
                    >
                      {t`I HAVE ACCOUNT`}
                    </Button>
                  </div>

                  {mode === 'create-account' ? (
                    <form
                      className="space-y-4"
                      onSubmit={(event) => {
                        event.preventDefault();
                        void handleCreateAccountSubmit();
                      }}
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label
                            htmlFor="first-name"
                            className="text-[11px] font-medium tracking-[0.12em] text-neutral-500 uppercase"
                          >
                            {t`First name`}
                          </label>

                          <Input
                            id="first-name"
                            value={createAccountForm.firstName}
                            onChange={(event) =>
                              updateCreateAccountField('firstName', event.target.value)
                            }
                            autoComplete="given-name"
                            className="h-12 rounded-sm border-black/10 bg-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="last-name"
                            className="text-[11px] font-medium tracking-[0.12em] text-neutral-500 uppercase"
                          >
                            {t`Last name`}
                          </label>

                          <Input
                            id="last-name"
                            value={createAccountForm.lastName}
                            onChange={(event) =>
                              updateCreateAccountField('lastName', event.target.value)
                            }
                            autoComplete="family-name"
                            className="h-12 rounded-sm border-black/10 bg-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="new-password"
                          className="text-[11px] font-medium tracking-[0.12em] text-neutral-500 uppercase"
                        >
                          {t`Password`}
                        </label>

                        <Input
                          id="new-password"
                          value={createAccountForm.password}
                          onChange={(event) =>
                            updateCreateAccountField('password', event.target.value)
                          }
                          type="password"
                          autoComplete="new-password"
                          className="h-12 rounded-sm border-black/10 bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="confirm-password"
                          className="text-[11px] font-medium tracking-[0.12em] text-neutral-500 uppercase"
                        >
                          {t`Confirm password`}
                        </label>

                        <Input
                          id="confirm-password"
                          value={createAccountForm.confirmPassword}
                          onChange={(event) =>
                            updateCreateAccountField('confirmPassword', event.target.value)
                          }
                          type="password"
                          autoComplete="new-password"
                          className="h-12 rounded-sm border-black/10 bg-white"
                        />

                        {passwordMismatch ? (
                          <p className="text-sm text-red-700" aria-live="polite">
                            {t`Passwords do not match.`}
                          </p>
                        ) : null}
                      </div>

                      <Button
                        type="submit"
                        disabled={!isCreateAccountFormValid || isCreateAccountPending}
                        className="h-12 w-full rounded-sm bg-[#1e58d5] text-[12px] font-semibold tracking-widest text-white hover:bg-[#245fdc]"
                      >
                        {isCreateAccountPending ? t`JOINING...` : t`JOIN ORGANIZATION`}

                        {isCreateAccountPending ? (
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowRight className="ml-2 h-4 w-4" />
                        )}
                      </Button>
                    </form>
                  ) : (
                    <form
                      className="space-y-4"
                      onSubmit={(event) => {
                        event.preventDefault();
                        void handleExistingAccountSubmit();
                      }}
                    >
                      <div className="rounded-xl border border-[#1e58d5]/15 bg-[#f4f8ff] px-4 py-3 text-sm text-[#23407b]">
                        <div className="flex gap-3">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

                          <p>
                            {t`Sign in with the account that uses the invited email address. After login, the invitation will be accepted automatically.`}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="existing-email"
                          className="text-[11px] font-medium tracking-[0.12em] text-neutral-500 uppercase"
                        >
                          {t`Email`}
                        </label>

                        <Input
                          id="existing-email"
                          value={invitation.email}
                          disabled
                          type="email"
                          className="h-12 rounded-sm border-black/10 bg-neutral-100"
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="existing-password"
                          className="text-[11px] font-medium tracking-[0.12em] text-neutral-500 uppercase"
                        >
                          {t`Password`}
                        </label>

                        <Input
                          id="existing-password"
                          value={existingAccountPassword}
                          onChange={(event) => setExistingAccountPassword(event.target.value)}
                          type="password"
                          autoComplete="current-password"
                          className="h-12 rounded-sm border-black/10 bg-white"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={!isExistingAccountFormValid || isExistingAccountPending}
                        className="h-12 w-full rounded-sm bg-[#1e58d5] text-[12px] font-semibold tracking-widest text-white hover:bg-[#245fdc]"
                      >
                        {isExistingAccountPending ? t`ACCEPTING...` : t`SIGN IN AND ACCEPT`}

                        {isExistingAccountPending ? (
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowRight className="ml-2 h-4 w-4" />
                        )}
                      </Button>
                    </form>
                  )}
                </>
              ) : null}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
