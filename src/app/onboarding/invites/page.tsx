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
import { formatEnumLabel } from 'lib/utils';
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
  const validateInviteMutation = validateInvite.mutate;
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

    validateInviteMutation(
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
  }, [token, validateInviteMutation]);

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
      router.push(ROUTES.COMPANY.ROOT);
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
      router.push(ROUTES.COMPANY.ROOT);
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
                <p className="mt-2">
                  {t`The invite assigns the company employee role automatically.`}
                </p>
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
                <CardTitle className="font-headline text-foreground text-3xl">
                  {t`Accept organization invite`}
                </CardTitle>

                <p className="text-on-surface-variant mt-2 text-sm leading-6">
                  {t`Use the invitation details below to join the organization workspace.`}
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {token ? null : (
                <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm">
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
                <div className="border-border bg-muted text-muted-foreground flex items-center gap-3 rounded-xl border px-4 py-3 text-sm">
                  <Loader2 className="text-primary h-4 w-4 animate-spin" />
                  {t`Validating invitation…`}
                </div>
              ) : null}

              {token && validateInvite.isError ? (
                <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm">
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
                  <p className="text-muted-foreground text-[11px] font-medium tracking-[0.12em] uppercase">
                    {t`Invitation details`}
                  </p>

                  <div className="mt-3 space-y-3">
                    <div>
                      <p className="text-muted-foreground text-xs">{t`Organization`}</p>
                      <p className="text-foreground text-lg font-semibold">
                        {invitation.organizationName}
                      </p>
                    </div>

                    <div>
                      <p className="text-muted-foreground text-xs">{t`Invited email`}</p>
                      <p className="text-foreground flex items-center gap-2 text-sm font-medium">
                        <Mail className="text-muted-foreground h-4 w-4" />
                        {invitation.email}
                      </p>
                    </div>

                    <Badge className="bg-accent text-accent-foreground hover:bg-accent">
                      {formatEnumLabel(invitation.roleToAssign)}
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
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-lg text-[12px] font-semibold tracking-widest'
                          : 'text-foreground h-11 rounded-lg text-[12px] font-semibold tracking-widest'
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
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-lg text-[12px] font-semibold tracking-widest'
                          : 'text-foreground h-11 rounded-lg text-[12px] font-semibold tracking-widest'
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
                            className="text-muted-foreground text-[11px] font-medium tracking-[0.12em] uppercase"
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
                            className="border-border bg-card h-12 rounded-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="last-name"
                            className="text-muted-foreground text-[11px] font-medium tracking-[0.12em] uppercase"
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
                            className="border-border bg-card h-12 rounded-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="new-password"
                          className="text-muted-foreground text-[11px] font-medium tracking-[0.12em] uppercase"
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
                          className="border-border bg-card h-12 rounded-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="confirm-password"
                          className="text-muted-foreground text-[11px] font-medium tracking-[0.12em] uppercase"
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
                          className="border-border bg-card h-12 rounded-sm"
                        />

                        {passwordMismatch ? (
                          <p className="text-destructive text-sm" aria-live="polite">
                            {t`Passwords do not match.`}
                          </p>
                        ) : null}
                      </div>

                      <Button
                        type="submit"
                        disabled={!isCreateAccountFormValid || isCreateAccountPending}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-full rounded-sm text-[12px] font-semibold tracking-widest"
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
                      <div className="border-info/30 bg-info/10 text-info rounded-xl border px-4 py-3 text-sm">
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
                          className="text-muted-foreground text-[11px] font-medium tracking-[0.12em] uppercase"
                        >
                          {t`Email`}
                        </label>

                        <Input
                          id="existing-email"
                          value={invitation.email}
                          disabled
                          type="email"
                          className="border-border bg-muted h-12 rounded-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="existing-password"
                          className="text-muted-foreground text-[11px] font-medium tracking-[0.12em] uppercase"
                        >
                          {t`Password`}
                        </label>

                        <Input
                          id="existing-password"
                          value={existingAccountPassword}
                          onChange={(event) => setExistingAccountPassword(event.target.value)}
                          type="password"
                          autoComplete="current-password"
                          className="border-border bg-card h-12 rounded-sm"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={!isExistingAccountFormValid || isExistingAccountPending}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-full rounded-sm text-[12px] font-semibold tracking-widest"
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
