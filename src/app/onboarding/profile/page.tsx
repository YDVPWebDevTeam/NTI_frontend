'use client';

import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { type Resolver, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  createStudentRegistrationSchema,
  getNextStudentOnboardingStage,
  getStudentOnboardingStageMeta,
  getStudentOnboardingStages,
  getStudentProfileDefaultValues,
  mapStudentProfileToFormValues,
  STUDENT_PROFILE_FIELD_GROUPS,
  type StudentOnboardingStageId,
  type StudentRegistrationValues,
  useStudentProfileSubmit,
} from 'features/student-profile-flow';
import { Form } from 'components/shadcn';
import { UserRole, useGetMyStudentProfile } from 'lib/api';
import { ROUTES } from 'lib/constants';
import { useAuthenticatedUser } from 'lib/student-dashboard/use-authenticated-user';

import { RegistrationStageHeader } from 'app/(auth)/register/student/_components/registration-stage-header';
import { StudentOnboardingActions } from './_components/student-onboarding-actions';
import { StudentOnboardingBody } from './_components/student-onboarding-body';
import { StudentOnboardingHero } from './_components/student-onboarding-hero';
import {
  StudentOnboardingErrorState,
  StudentOnboardingLoadingState,
} from './_components/student-onboarding-state';

export default function StudentProfileOnboardingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { i18n } = useLingui();
  const [selectedStage, setSelectedStage] = useState<StudentOnboardingStageId | null>(null);
  const { isLoading: isAuthLoading } = useAuthenticatedUser([UserRole.STUDENT]);

  const schema = useMemo(() => createStudentRegistrationSchema(), [i18n.locale]);
  const form = useForm<StudentRegistrationValues>({
    resolver: zodResolver(schema) as Resolver<StudentRegistrationValues>,
    defaultValues: getStudentProfileDefaultValues(),
    mode: 'onChange',
  });

  const profileQuery = useGetMyStudentProfile({
    query: {
      enabled: !isAuthLoading,
    },
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

  useEffect(() => {
    if (!profileQuery.data) {
      return;
    }

    form.reset(mapStudentProfileToFormValues(profileQuery.data));
  }, [form, profileQuery.data]);

  const isBusy = isProfileSubmitBusy;

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

      const successMessage =
        stageId === 'academic' ? t`Academic information saved.` : t`Professional skills saved.`;

      toast.success(successMessage);
    } catch (error) {
      const fallbackMessage =
        stageId === 'academic'
          ? t`Unable to save academic information.`
          : t`Unable to save professional skills.`;

      toast.error(error instanceof Error ? error.message : fallbackMessage);
    }
  };

  if (isAuthLoading || profileQuery.isLoading) {
    return <StudentOnboardingLoadingState />;
  }

  if (profileQuery.isError) {
    const profileError = profileQuery.error as unknown;

    return (
      <StudentOnboardingErrorState
        message={
          profileError instanceof Error ? profileError.message : t`Unable to load your profile.`
        }
        onRetry={() => void profileQuery.refetch()}
      />
    );
  }

  if (!profileQuery.data) {
    return null;
  }

  const stageMeta = getStudentOnboardingStageMeta(activeStage);
  const stages = getStudentOnboardingStages(profileQuery.data.completion);
  const isProfileUpdateFlow = pathname === ROUTES.PROFILE;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div
        className={`w-full overflow-hidden rounded-xl border border-black/10 shadow-sm ${
          isProfileUpdateFlow ? 'bg-white' : 'bg-[#ececef]'
        }`}
      >
        <StudentOnboardingHero
          stages={stages}
          activeStage={activeStage}
          onStageChange={setSelectedStage}
          variant={isProfileUpdateFlow ? 'profile-update' : 'invite-onboarding'}
        />

        <section className="px-5 py-7 sm:px-8 sm:py-10 lg:px-12">
          <RegistrationStageHeader
            title={stageMeta.title}
            description={stageMeta.description}
            isBusy={isBusy}
          />

          <Form {...form}>
            <div className="space-y-6">
              <StudentOnboardingBody activeStage={activeStage} />

              <StudentOnboardingActions
                activeStage={activeStage}
                isBusy={isBusy}
                isComplete={isOnboardingComplete}
                onContinue={() => router.replace(ROUTES.DASHBOARD)}
                onStageChange={setSelectedStage}
                onSaveAcademic={() => void saveStage('academic')}
                onSaveSkills={() => void saveStage('skills')}
              />
            </div>
          </Form>
        </section>
      </div>
    </main>
  );
}
