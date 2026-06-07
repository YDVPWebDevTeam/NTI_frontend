'use client';

import { t } from '@lingui/core/macro';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Loader2, Lock, Mail, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { startTransition, Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { ControlledInputField, ControlledPasswordField } from 'components/forms';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Form,
  Input,
} from 'components/shadcn';
import {
  invitesControllerValidateToken,
  useInvitationControllerAccept,
  useLogin,
  useLogout,
  useRegisterViaInvite,
} from 'lib/api';
import { isApiRequestError } from 'lib/api-client/openapi-runtime/client';
import {
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MIN_LENGTH,
  createLoginSchema,
} from 'lib/auth/schemas';
import { ROUTES } from 'lib/constants';
import {
  getInviteActionErrorMessage,
  getInviteValidationState,
  type InviteScreenState,
} from 'lib/invites/error-state';

const USER_ALREADY_EXISTS_STATUS = 409;
const FORBIDDEN_STATUS = 403;

const createRegisterViaInviteSchema = () =>
  z.object({
    firstName: z
      .string()
      .trim()
      .min(NAME_MIN_LENGTH, { message: t`Must be at least 2 characters.` })
      .max(NAME_MAX_LENGTH, { message: t`Must be at most 50 characters.` }),
    lastName: z
      .string()
      .trim()
      .min(NAME_MIN_LENGTH, { message: t`Must be at least 2 characters.` })
      .max(NAME_MAX_LENGTH, { message: t`Must be at most 50 characters.` }),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, { message: t`Password must be at least 6 characters.` }),
  });

type RegisterViaInviteValues = z.infer<ReturnType<typeof createRegisterViaInviteSchema>>;
type ExistingAccountValues = z.infer<ReturnType<typeof createLoginSchema>>;
type InvitePath = 'create-account' | 'existing-account';

function InvitePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const token = searchParams.get('token')?.trim() ?? '';

  const [activePath, setActivePath] = useState<InvitePath>('create-account');
  const [existingAccountError, setExistingAccountError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const registerSchema = useMemo(() => createRegisterViaInviteSchema(), []);
  const loginSchema = useMemo(() => createLoginSchema(), []);

  const validateInvite = useQuery({
    queryKey: ['invites/validate', token],
    queryFn: () => invitesControllerValidateToken({ token }),
    enabled: token.length > 0,
    retry: false,
  });
  const registerViaInvite = useRegisterViaInvite();
  const login = useLogin();
  const logout = useLogout();
  const acceptInvitation = useInvitationControllerAccept();

  const registerForm = useForm<RegisterViaInviteValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      password: '',
    },
    mode: 'onChange',
  });

  const loginForm = useForm<ExistingAccountValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  const missingTokenState: InviteScreenState | null = token
    ? null
    : {
        title: t`Missing invite token`,
        description: t`This invite link is incomplete. Open the full invite URL and try again.`,
      };

  const routeToProfileOnboarding = () => {
    void queryClient.invalidateQueries({ queryKey: ['auth'] });
    void queryClient.invalidateQueries({ queryKey: ['student-profile', 'me'] });

    startTransition(() => {
      router.replace(ROUTES.ONBOARDING_PROFILE);
    });
  };

  const handleRegister = async (values: RegisterViaInviteValues) => {
    setRegisterError(null);

    try {
      await registerViaInvite.mutateAsync({
        data: {
          ...values,
          token,
        },
      });

      routeToProfileOnboarding();
    } catch (error) {
      if (isApiRequestError(error) && error.status === USER_ALREADY_EXISTS_STATUS) {
        setRegisterError(
          t`An account with this invited email already exists. Use the existing account path instead.`,
        );

        return;
      }

      setRegisterError(
        getInviteActionErrorMessage(
          error,
          t`Unable to create the invited account right now. Please try again.`,
        ),
      );
    }
  };

  const handleExistingAccountLogin = async (values: ExistingAccountValues) => {
    setExistingAccountError(null);

    const normalizedEmail = values.email.trim().toLowerCase();
    const invitedEmail = acceptedInvite?.email.trim().toLowerCase();

    if (invitedEmail && normalizedEmail !== invitedEmail) {
      setExistingAccountError(t`Use the same email address that received this invitation.`);

      return;
    }

    let didLogin = false;

    try {
      await login.mutateAsync({ data: values });
      didLogin = true;
      await acceptInvitation.mutateAsync({ data: { token } });
      routeToProfileOnboarding();
    } catch (error) {
      // If login succeeded but accepting the invite failed (expired=400,
      // already-accepted=409, forbidden=403, etc.), the user is now logged in as
      // this account but stranded on the invite screen. Always log them back out so
      // they aren't silently left in a half-joined session, then surface a clear
      // message about the invite state.
      if (didLogin) {
        try {
          await logout.mutateAsync();
        } finally {
          void queryClient.invalidateQueries({ queryKey: ['/auth/me'] });
          void queryClient.invalidateQueries({ queryKey: ['auth'] });
        }

        setExistingAccountError(
          getInviteActionErrorMessage(
            error,
            t`We signed you in, but couldn't join this invite — it may be expired or already accepted. You've been signed back out. Please request a new invite.`,
          ),
        );

        return;
      }

      setExistingAccountError(
        getInviteActionErrorMessage(error, t`Unable to join the invited team right now.`),
      );
    }
  };

  const acceptedInvite = validateInvite.data ?? null;
  const validationErrorState = validateInvite.error
    ? getInviteValidationState(validateInvite.error)
    : null;
  const isValidating =
    token.length > 0 && validateInvite.isLoading && !acceptedInvite && !validationErrorState;
  const blockingState = missingTokenState ?? validationErrorState;
  const cardTitle =
    activePath === 'create-account' ? t`Create account from invite` : t`Log in and accept invite`;
  const registerButtonLabel = registerViaInvite.isPending
    ? t`CREATING ACCOUNT...`
    : t`CREATE ACCOUNT AND JOIN TEAM`;
  const existingButtonLabel =
    login.isPending || acceptInvitation.isPending || logout.isPending
      ? t`JOINING TEAM...`
      : t`LOGIN AND ACCEPT INVITE`;

  let mainContent = null;

  if (isValidating) {
    mainContent = (
      <div className="border-border bg-card flex min-h-90 items-center justify-center rounded-xl border">
        <div className="text-muted-foreground flex items-center gap-3 text-sm">
          <Loader2 className="text-primary h-5 w-5 animate-spin" />
          <span>{t`Validating invite...`}</span>
        </div>
      </div>
    );
  } else if (blockingState) {
    mainContent = (
      <Card className="border-destructive/30 bg-destructive/10 shadow-none">
        <CardHeader>
          <CardTitle className="text-destructive text-2xl">{blockingState.title}</CardTitle>
        </CardHeader>
        <CardContent className="text-destructive space-y-4 text-sm">
          <p>{blockingState.description}</p>
          <Button type="button" onClick={() => router.replace(ROUTES.ROOT)}>
            {t`Back to home`}
          </Button>
        </CardContent>
      </Card>
    );
  } else if (acceptedInvite) {
    mainContent = (
      <div className="space-y-6">
        <div>
          <p className="text-muted-foreground text-[11px] font-medium tracking-[0.12em]">
            {t`INVITE ONBOARDING`}
          </p>
          <h2 className="text-foreground mt-2 text-4xl font-semibold tracking-tight">
            {t`Accept your invitation`}
          </h2>
          <p className="text-muted-foreground mt-3 text-[15px] leading-relaxed">
            {t`Choose whether you need a new account or want to join with an existing account. The invited email stays fixed to this invite.`}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant={activePath === 'create-account' ? 'default' : 'outline'}
            className={activePath === 'create-account' ? 'bg-primary' : ''}
            onClick={() => setActivePath('create-account')}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {t`Create account`}
          </Button>
          <Button
            type="button"
            variant={activePath === 'existing-account' ? 'default' : 'outline'}
            className={activePath === 'existing-account' ? 'bg-primary' : ''}
            onClick={() => setActivePath('existing-account')}
          >
            <Mail className="mr-2 h-4 w-4" />
            {t`I already have an account`}
          </Button>
        </div>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-accent text-accent-foreground">
                {acceptedInvite.teamName}
              </Badge>
              <span className="text-muted-foreground text-sm">{acceptedInvite.email}</span>
            </div>
            <CardTitle className="text-foreground text-2xl">{cardTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-muted-foreground text-[11px] font-medium tracking-[0.1em] uppercase">
                {t`Invited email`}
              </label>
              <Input value={acceptedInvite.email} disabled className="bg-muted h-12 rounded-sm" />
            </div>

            {activePath === 'create-account' ? (
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <ControlledInputField
                      control={registerForm.control}
                      name="firstName"
                      label={t`First Name`}
                      placeholder={t`Enter your first name…`}
                      autoComplete="given-name"
                      spellCheck={false}
                    />
                    <ControlledInputField
                      control={registerForm.control}
                      name="lastName"
                      label={t`Last Name`}
                      placeholder={t`Enter your last name…`}
                      autoComplete="family-name"
                      spellCheck={false}
                    />
                  </div>

                  <ControlledPasswordField
                    control={registerForm.control}
                    name="password"
                    label={t`Password`}
                    placeholder={t`Create a secure password…`}
                    startIcon={<Lock className="h-4 w-4" />}
                    autoComplete="new-password"
                    spellCheck={false}
                    description={t`Use at least 6 characters to secure the invited account.`}
                  />

                  {registerError ? (
                    <div
                      className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm"
                      aria-live="polite"
                    >
                      {registerError}
                    </div>
                  ) : null}

                  <Button
                    type="submit"
                    disabled={registerViaInvite.isPending}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-full rounded-sm text-[12px] font-semibold tracking-widest"
                  >
                    {registerButtonLabel}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...loginForm}>
                <form
                  onSubmit={loginForm.handleSubmit(handleExistingAccountLogin)}
                  className="space-y-5"
                >
                  <ControlledInputField
                    control={loginForm.control}
                    name="email"
                    label={t`Email Address`}
                    type="email"
                    placeholder={t`name@institution.edu…`}
                    startIcon={<Mail className="h-4 w-4" />}
                    autoComplete="email"
                    inputMode="email"
                    spellCheck={false}
                    description={t`Use the same email address that received this invitation.`}
                  />

                  <ControlledPasswordField
                    control={loginForm.control}
                    name="password"
                    label={t`Password`}
                    placeholder={t`Enter your password…`}
                    startIcon={<Lock className="h-4 w-4" />}
                    autoComplete="current-password"
                    spellCheck={false}
                  />

                  {existingAccountError ? (
                    <div
                      className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm"
                      aria-live="polite"
                    >
                      {existingAccountError}
                    </div>
                  ) : null}

                  <Button
                    type="submit"
                    disabled={login.isPending || acceptInvitation.isPending || logout.isPending}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-full rounded-sm text-[12px] font-semibold tracking-widest"
                  >
                    {existingButtonLabel}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="border-border bg-muted grid w-full grid-cols-1 overflow-hidden border lg:grid-cols-[420px_1fr]">
        <aside className="relative bg-[#0f254f] px-6 py-8 text-white lg:px-8 lg:py-10">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(135deg, rgba(255,255,255,0.14) 25%, transparent 25%), linear-gradient(225deg, rgba(255,255,255,0.14) 25%, transparent 25%)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative z-10 flex h-full flex-col">
            <div>
              <p className="text-[11px] font-medium tracking-[0.14em] text-white/60">
                {t`TEAM INVITE`}
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight">
                {t`Join your invited team`}
              </h1>
              <p className="mt-4 text-sm leading-6 text-white/75">
                {t`This flow validates the invite first, then gets you into the invited team and your student profile onboarding.`}
              </p>
            </div>

            {acceptedInvite ? (
              <div className="mt-8 space-y-4 rounded-xl border border-white/15 bg-white/8 p-5">
                <div>
                  <p className="text-xs font-medium tracking-[0.1em] text-white/50 uppercase">
                    {t`Invited email`}
                  </p>
                  <p className="mt-1 text-lg font-semibold">{acceptedInvite.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium tracking-[0.1em] text-white/50 uppercase">
                    {t`Target team`}
                  </p>
                  <p className="mt-1 text-lg font-semibold">{acceptedInvite.teamName}</p>
                </div>
              </div>
            ) : null}

            <div className="mt-auto pt-10">
              <Button
                asChild
                variant="outline"
                className="border-white/25 bg-white/5 text-white hover:bg-white hover:text-[#0f254f]"
              >
                <Link href={ROUTES.AUTH.LOGIN}>{t`Standard login`}</Link>
              </Button>
            </div>
          </div>
        </aside>

        <section className="bg-background flex items-center px-5 py-7 sm:px-8 sm:py-10 lg:px-12">
          <div className="w-full max-w-160">{mainContent}</div>
        </section>
      </div>
    </main>
  );
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="text-muted-foreground flex items-center gap-3 text-sm">
            <Loader2 className="text-primary h-5 w-5 animate-spin" />
            <span>{t`Loading invite…`}</span>
          </div>
        </main>
      }
    >
      <InvitePageContent />
    </Suspense>
  );
}
