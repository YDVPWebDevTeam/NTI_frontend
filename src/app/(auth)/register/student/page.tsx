'use client';

import { useLingui } from '@lingui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { type FormEvent, Suspense, useEffect, useMemo, useRef } from 'react';
import { type Resolver, useForm } from 'react-hook-form';

import { ROUTES } from 'lib/constants';

import { Form } from 'components/shadcn';
import {
  createStudentRegistrationSchema,
  getStudentProfileDefaultValues,
  getStudentRegistrationSteps,
  type StudentRegistrationValues,
} from 'features/student-profile';
import { RegistrationStageHeader } from 'features/student-profile';
import { useStudentRegistrationStore } from 'store/student-registration-store';
import { RegistrationActions } from './_components/registration-actions';
import { RegistrationCompletion } from './_components/registration-completion';
import { RegistrationStepContent } from './_components/registration-step-content';
import { RegistrationStepper } from './_components/registration-stepper';
import { useStudentRegistrationActions } from './_hooks/use-student-registration-actions';

function SignUpContent() {
  const { i18n } = useLingui();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Email confirmation is handled entirely on /verify-email. If an email link
  // ever lands here with a token (e.g. one sent before the backend was updated),
  // forward it so the token is confirmed automatically instead of being ignored.
  const confirmationToken = searchParams.get('token')?.trim() ?? '';

  useEffect(() => {
    if (confirmationToken) {
      router.replace(`${ROUTES.AUTH.VERIFY_EMAIL}?token=${encodeURIComponent(confirmationToken)}`);
    }
  }, [confirmationToken, router]);

  const currentStepIndex = useStudentRegistrationStore((state) => state.currentStepIndex);
  const goToNextStep = useStudentRegistrationStore((state) => state.goToNextStep);
  const goToPreviousStep = useStudentRegistrationStore((state) => state.goToPreviousStep);
  const resetStep = useStudentRegistrationStore((state) => state.resetStep);
  const setCurrentStepIndex = useStudentRegistrationStore((state) => state.setCurrentStepIndex);

  const studentRegistrationSchema = useMemo(() => createStudentRegistrationSchema(), [i18n.locale]);
  const steps = useMemo(() => getStudentRegistrationSteps(), [i18n.locale]);

  const safeCurrentStepIndex = Math.min(currentStepIndex, steps.length - 1);
  const currentStep = steps[safeCurrentStepIndex];
  const isCompletionStep = currentStepIndex >= steps.length;
  const isLastStep = safeCurrentStepIndex === steps.length - 1;

  useEffect(() => {
    if (currentStepIndex > steps.length) {
      setCurrentStepIndex(steps.length);
    }
  }, [currentStepIndex, setCurrentStepIndex, steps.length]);

  const form = useForm<StudentRegistrationValues>({
    resolver: zodResolver(studentRegistrationSchema) as Resolver<StudentRegistrationValues>,
    defaultValues: getStudentProfileDefaultValues(),
    mode: 'onChange',
  });

  const { submitStep, isBusy } = useStudentRegistrationActions(form);

  // The store persists only `currentStepIndex`, not the form draft. On reload
  // the form is re-created from empty defaults, so a persisted step > 0 would
  // return the user to a later step with no real data and let them submit
  // partial information. If we detect a later step but the form has no real
  // identity data, reset to the first step. Runs once on mount.
  const hasCheckedPersistedStepRef = useRef(false);

  useEffect(() => {
    if (hasCheckedPersistedStepRef.current) {
      return;
    }

    hasCheckedPersistedStepRef.current = true;

    if (currentStepIndex <= 0) {
      return;
    }

    const hasRealData = Boolean(
      form.getValues('email')?.trim() || form.getValues('firstName')?.trim(),
    );

    if (!hasRealData) {
      resetStep();
    }
  }, [currentStepIndex, form, resetStep]);

  const handleNextStep = async () => {
    const isValid = await form.trigger(currentStep.fields);

    if (!isValid) {
      const firstInvalidField = currentStep.fields.find(
        (fieldName) => form.getFieldState(fieldName).invalid,
      );

      if (firstInvalidField) {
        form.setFocus(firstInvalidField);
      }

      return;
    }

    await submitStep({
      stepId: currentStep.id,
      currentStepIndex,
      stepsLength: steps.length,
      onAdvance: (targetIndex) => {
        goToNextStep(targetIndex);
      },
    });
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleNextStep();
  };

  const handleStartFromBeginning = () => {
    resetStep();
    form.reset();
  };

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="border-border bg-muted flex w-full flex-col overflow-hidden rounded-xl border shadow-sm">
        <RegistrationStepper
          steps={steps}
          activeStepIndex={safeCurrentStepIndex}
          isCompletionStep={isCompletionStep}
        />

        <section className="bg-background px-5 py-7 sm:px-8 sm:py-10 lg:px-12">
          {isCompletionStep ? (
            <RegistrationCompletion
              onInviteClick={() => {
                resetStep();
                form.reset();
              }}
            />
          ) : (
            <>
              <RegistrationStageHeader
                title={currentStep.label}
                description={currentStep.description}
                showRestartButton={safeCurrentStepIndex > 0}
                onStartFromBeginning={handleStartFromBeginning}
                isBusy={isBusy}
              />

              <Form {...form}>
                <form onSubmit={handleFormSubmit}>
                  <RegistrationStepContent stepId={currentStep.id} />

                  <RegistrationActions
                    safeCurrentStepIndex={safeCurrentStepIndex}
                    isLastStep={isLastStep}
                    isBusy={isBusy}
                    onPreviousStep={goToPreviousStep}
                  />
                </form>
              </Form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpContent />
    </Suspense>
  );
}
