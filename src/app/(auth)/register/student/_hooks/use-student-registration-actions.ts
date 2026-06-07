'use client';

import { t } from '@lingui/core/macro';
import type { UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';

import { useRegister } from 'lib/api';
import type { StudentRegistrationValues } from 'lib/auth/schemas';
import { useStudentProfileSubmit, type StudentRegistrationStepId } from 'features/student-profile';

type SubmitStepArgs = {
  stepId: StudentRegistrationStepId;
  currentStepIndex: number;
  stepsLength: number;
  onAdvance: (targetIndex: number) => void;
};

type StepSubmitHandler = (args: Omit<SubmitStepArgs, 'stepId'>) => void | Promise<void>;

export function useStudentRegistrationActions(form: UseFormReturn<StudentRegistrationValues>) {
  const { mutateAsync: register, isPending: isRegisterPending } = useRegister();
  const {
    submitAcademic,
    submitProfessional,
    isBusy: isProfileSubmitBusy,
  } = useStudentProfileSubmit(form);

  const isBusy = isRegisterPending || isProfileSubmitBusy;

  const handleError = (error: unknown, fallback: string) => {
    toast.error(error instanceof Error ? error.message : fallback);
  };

  const handleIdentityStep = async () => {
    const values = form.getValues();

    await register({
      data: {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
      },
    });
  };

  const submitStep = async ({
    stepId,
    currentStepIndex,
    stepsLength,
    onAdvance,
  }: SubmitStepArgs) => {
    try {
      const stepHandlers: Record<StudentRegistrationStepId, StepSubmitHandler> = {
        identity: async ({ currentStepIndex, stepsLength, onAdvance }) => {
          await handleIdentityStep();
          onAdvance(Math.min(currentStepIndex + 1, stepsLength - 1));
        },
        email: ({ currentStepIndex, stepsLength, onAdvance }) => {
          // Email confirmation now happens entirely via the link in the email
          // (handled on /verify-email), so this step is purely informational.
          onAdvance(Math.min(currentStepIndex + 1, stepsLength - 1));
        },
        academic: async ({ currentStepIndex, stepsLength, onAdvance }) => {
          await submitAcademic();
          onAdvance(Math.min(currentStepIndex + 1, stepsLength - 1));
        },
        skills: async ({ currentStepIndex, stepsLength, onAdvance }) => {
          await submitProfessional();
          onAdvance(Math.min(currentStepIndex + 1, stepsLength));
        },
        review: ({ stepsLength, onAdvance }) => {
          onAdvance(stepsLength);
        },
      };

      await stepHandlers[stepId]({ currentStepIndex, stepsLength, onAdvance });
    } catch (error) {
      handleError(error, t`Unable to register. Please try again.`);
    }
  };

  return {
    submitStep,
    isBusy,
  };
}
