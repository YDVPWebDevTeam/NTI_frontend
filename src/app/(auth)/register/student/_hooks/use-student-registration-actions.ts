'use client';

import { t } from '@lingui/core/macro';
import type { UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';

import {
  useConfirmEmailMutation,
  useRegisterStudentMutation,
  useResendConfirmationEmailMutation,
} from 'lib/api';
import { useStudentProfileSubmit } from 'features/student-profile-flow';
import type { StudentRegistrationStepId } from '../_lib/registration-config';
import type { StudentRegistrationValues } from '../schema';

type SubmitStepArgs = {
  stepId: StudentRegistrationStepId;
  currentStepIndex: number;
  stepsLength: number;
  onAdvance: (targetIndex: number) => void;
};

type StepSubmitHandler = (args: Omit<SubmitStepArgs, 'stepId'>) => void | Promise<void>;

export function useStudentRegistrationActions(form: UseFormReturn<StudentRegistrationValues>) {
  const { mutateAsync: register, isPending: isRegisterPending } = useRegisterStudentMutation();
  const { mutateAsync: resendConfirmationEmail, isPending: isResendConfirmationPending } =
    useResendConfirmationEmailMutation();
  const { mutateAsync: confirmEmail, isPending: isConfirmEmailPending } = useConfirmEmailMutation();
  const {
    submitAcademic,
    submitProfessional,
    isBusy: isProfileSubmitBusy,
  } = useStudentProfileSubmit(form);

  const isBusy =
    isRegisterPending ||
    isResendConfirmationPending ||
    isConfirmEmailPending ||
    isProfileSubmitBusy;

  const handleError = (error: unknown, fallback: string) => {
    toast.error(error instanceof Error ? error.message : fallback);
  };

  const handleIdentityStep = async () => {
    const values = form.getValues();

    await register({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      password: values.password,
    });
  };

  const handleEmailStep = async () => {
    const values = form.getValues();
    const token = values.verificationCode.trim();

    if (!token) {
      return;
    }

    await confirmEmail({ token });
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
        email: async ({ currentStepIndex, stepsLength, onAdvance }) => {
          await handleEmailStep();
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

  const resendConfirmation = async (email: string) => {
    try {
      await resendConfirmationEmail(email);

      toast.success(t`Confirmation email sent.`);

      return true;
    } catch (error) {
      handleError(error, t`Unable to resend the confirmation email right now.`);

      return false;
    }
  };

  return {
    submitStep,
    resendConfirmation,
    isBusy,
    isResending: isResendConfirmationPending,
  };
}
