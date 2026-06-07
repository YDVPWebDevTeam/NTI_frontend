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

import { StudentOnboardingActions } from './student-onboarding-actions';
import { StudentOnboardingBody } from './student-onboarding-body';
import { StudentOnboardingStageList } from './student-onboarding-stage-list';

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

  useEffect(() => {
    if (!profileQuery.data) {
      return;
    }

    form.reset(mapStudentProfileToFormValues(profileQuery.data));
  }, [form, profileQuery.data]);

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

  const stageMeta = getStudentOnboardingStageMeta(activeStage);
  const stages = getStudentOnboardingStages(profileQuery.data.completion);
  const isProfileUpdateFlow = pathname === ROUTES.STUDENT.PROFILE;
  const shouldShowContinueOnly = !isProfileUpdateFlow && isOnboardingComplete;

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
        <Form {...form}>
          <div className="space-y-6">
            <StudentOnboardingBody activeStage={activeStage} />

            <StudentOnboardingActions
              activeStage={activeStage}
              isBusy={isProfileSubmitBusy}
              isComplete={shouldShowContinueOnly}
              onContinue={() => router.replace(ROUTES.STUDENT.TEAM)}
              onStageChange={setSelectedStage}
              onSaveAcademic={() => void saveStage('academic')}
              onSaveSkills={() => void saveStage('skills')}
            />
          </div>
        </Form>
      </StudentSectionCard>
    </StudentPageShell>
  );
}
