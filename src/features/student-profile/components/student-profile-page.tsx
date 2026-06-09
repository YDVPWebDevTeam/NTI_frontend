'use client';

import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { type Resolver, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  getNextStudentOnboardingStage,
  getStudentJourneySteps,
  getStudentOnboardingStageMeta,
  getStudentOnboardingStages,
  STUDENT_PROFILE_FIELD_GROUPS,
  type StudentOnboardingStageId,
} from '../lib/config';
import { getStudentProfileDefaultValues } from '../lib/default-values';
import { mapStudentProfileToFormValues } from '../lib/mappers';
import { useStudentProfileSubmit } from '../hooks/use-student-profile-submit';
import { createStudentRegistrationSchema, type StudentRegistrationValues } from 'lib/auth/schemas';
import { Button, Form } from 'components/shadcn';
import { useGetMyStudentProfile } from 'lib/api';
import { ROUTES } from 'lib/constants';
import {
  StudentPageShell,
  StudentSectionCard,
  StudentStatusCard,
} from 'components/student-dashboard/page-shell-primitives';

import { RegistrationStageHeader } from './registration-stage-header';
import { StudentOnboardingActions } from './student-onboarding-actions';
import { StudentOnboardingBody } from './student-onboarding-body';
import { StudentOnboardingStageList } from './student-onboarding-stage-list';
import { StudentOnboardingStepper } from './student-onboarding-stepper';

export function StudentProfilePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { i18n } = useLingui();
  const [selectedStage, setSelectedStage] = useState<StudentOnboardingStageId | null>(null);

  const schema = useMemo(() => createStudentRegistrationSchema(), [i18n.locale]);
  const form = useForm<StudentRegistrationValues>({
    resolver: zodResolver(schema) as Resolver<StudentRegistrationValues>,
    defaultValues: getStudentProfileDefaultValues(),
    mode: 'onChange',
  });

  const profileQuery = useGetMyStudentProfile({
    query: { enabled: true },
  });
  const {
    submitAcademic,
    submitProfessional,
    isBusy: isProfileSubmitBusy,
  } = useStudentProfileSubmit(form);
  const isOnboardingComplete = Boolean(
    profileQuery.data?.completion.academicInformationCompleted &&
    profileQuery.data?.completion.professionalSkillsCompleted,
  );
  const derivedStage = profileQuery.data
    ? getNextStudentOnboardingStage(profileQuery.data.completion)
    : 'academic';
  const activeStage = selectedStage ?? derivedStage;
  const isProfileUpdateFlow = pathname === ROUTES.STUDENT.PROFILE;
  const shouldRedirectToTeam = !isProfileUpdateFlow && isOnboardingComplete;

  useEffect(() => {
    if (!profileQuery.data) {
      return;
    }

    form.reset(mapStudentProfileToFormValues(profileQuery.data));
  }, [form, profileQuery.data]);

  // Once both onboarding stages are complete, send students straight to team
  // setup instead of surfacing an intermediate "continue" step.
  useEffect(() => {
    if (shouldRedirectToTeam) {
      router.replace(ROUTES.STUDENT.TEAM);
    }
  }, [router, shouldRedirectToTeam]);

  const saveStage = async (stageId: 'academic' | 'skills') => {
    const isValid = await form.trigger(STUDENT_PROFILE_FIELD_GROUPS[stageId]);

    if (!isValid) {
      const firstInvalidField = STUDENT_PROFILE_FIELD_GROUPS[stageId].find(
        (fieldName) => form.getFieldState(fieldName).invalid,
      );

      if (firstInvalidField) {
        form.setFocus(firstInvalidField);
      }

      return;
    }

    try {
      await (stageId === 'academic' ? submitAcademic() : submitProfessional());

      const refreshedProfile = await profileQuery.refetch();

      if (refreshedProfile.data) {
        form.reset(mapStudentProfileToFormValues(refreshedProfile.data));
        setSelectedStage(getNextStudentOnboardingStage(refreshedProfile.data.completion));
      }

      toast.success(
        stageId === 'academic' ? t`Academic information saved.` : t`Professional skills saved.`,
      );
    } catch (error) {
      const fallbackMessage =
        stageId === 'academic'
          ? t`Unable to save academic information.`
          : t`Unable to save professional skills.`;

      toast.error(error instanceof Error ? error.message : fallbackMessage);
    }
  };

  const profileShellProps = {
    eyebrow: t`Profile settings`,
    title: t`Update your student profile`,
    description: t`Keep your academic and professional information up to date.`,
  };

  if (profileQuery.isLoading) {
    return (
      <StudentPageShell {...profileShellProps}>
        <div className="bg-accent flex min-h-28 items-center justify-center rounded-2xl">
          <Loader2 className="text-primary h-5 w-5 animate-spin" />
        </div>
      </StudentPageShell>
    );
  }

  if (profileQuery.isError) {
    const profileError = profileQuery.error as unknown;

    return (
      <StudentPageShell {...profileShellProps}>
        <div className="space-y-4">
          <StudentStatusCard
            title={t`Unable to load your profile`}
            description={
              profileError instanceof Error ? profileError.message : t`Unable to load your profile.`
            }
          />
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => void profileQuery.refetch()}>
              {t`Retry`}
            </Button>
          </div>
        </div>
      </StudentPageShell>
    );
  }

  if (!profileQuery.data) {
    return null;
  }

  // Redirect to team setup is in-flight; avoid flashing the onboarding form.
  if (shouldRedirectToTeam) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-6">
        <Loader2 className="text-primary h-5 w-5 animate-spin" />
      </main>
    );
  }

  const stageMeta = getStudentOnboardingStageMeta(activeStage);
  const stages = getStudentOnboardingStages(profileQuery.data.completion);
  // Team existence isn't known on this page; the team step renders as upcoming.
  const journeySteps = getStudentJourneySteps(profileQuery.data.completion, false);

  const onboardingForm = (
    <Form {...form}>
      <div className="space-y-6">
        <StudentOnboardingBody activeStage={activeStage} />

        <StudentOnboardingActions
          activeStage={activeStage}
          isBusy={isProfileSubmitBusy}
          onStageChange={setSelectedStage}
          onSaveAcademic={() => void saveStage('academic')}
          onSaveSkills={() => void saveStage('skills')}
        />
      </div>
    </Form>
  );

  // Onboarding presents academic + skills as a guided stepper wizard (matching
  // the registration flow), while the in-workspace profile-update route keeps
  // the section-card layout for free-form editing.
  if (!isProfileUpdateFlow) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="border-border bg-muted flex w-full flex-col overflow-hidden rounded-xl border shadow-sm">
          <StudentOnboardingStepper stages={journeySteps} activeStage={activeStage} />

          <section className="bg-background px-5 py-7 sm:px-8 sm:py-10 lg:px-12">
            <RegistrationStageHeader title={stageMeta.title} description={stageMeta.description} />
            <div className="mt-8">{onboardingForm}</div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <StudentPageShell {...profileShellProps}>
      <StudentSectionCard
        title={t`Profile sections`}
        description={t`Select a section to review or update your information.`}
      >
        <StudentOnboardingStageList
          stages={stages}
          activeStage={activeStage}
          onStageChange={setSelectedStage}
        />
      </StudentSectionCard>

      <StudentSectionCard title={stageMeta.title} description={stageMeta.description}>
        {onboardingForm}
      </StudentSectionCard>
    </StudentPageShell>
  );
}
