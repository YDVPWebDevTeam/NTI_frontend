'use client';

import { useLingui } from '@lingui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { type FormEvent, useEffect, useMemo } from 'react';
import { type Resolver, useForm } from 'react-hook-form';

import { Form } from 'components/shadcn';
import { useStudentRegistrationStore } from 'store/student-registration-store';
import { RegistrationActions } from './_components/registration-actions';
import { RegistrationCompletion } from './_components/registration-completion';
import { RegistrationStageHeader } from './_components/registration-stage-header';
import { RegistrationStepContent } from './_components/registration-step-content';
import { RegistrationStepper } from './_components/registration-stepper';
import { getStudentRegistrationDefaultValues } from './_lib/default-values';
import { getStudentRegistrationSteps } from './_lib/registration-config';
import { useStudentRegistrationActions } from './_hooks/use-student-registration-actions';
import { createStudentRegistrationSchema, type StudentRegistrationValues } from './schema';

export default function SignUpPage() {
  const { i18n } = useLingui();

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
    defaultValues: getStudentRegistrationDefaultValues(),
    mode: 'onChange',
  });

  const { submitStep, resendConfirmation, finishRegistration, isBusy, isResending } =
    useStudentRegistrationActions(form);

  const handleNextStep = async () => {
    const isValid = await form.trigger(currentStep.fields);

    if (!isValid) {
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
      <div className="flex w-full flex-col overflow-hidden rounded-xl border border-black/10 bg-[#e7e8eb] shadow-sm">
        <RegistrationStepper
          steps={steps}
          activeStepIndex={safeCurrentStepIndex}
          isCompletionStep={isCompletionStep}
        />

        <section className="bg-[#ececef] px-5 py-7 sm:px-8 sm:py-10 lg:px-12">
          {isCompletionStep ? (
            <RegistrationCompletion
              onFinish={() => {
                finishRegistration(() => {
                  resetStep();
                  form.reset();
                });
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
                  <RegistrationStepContent
                    stepId={currentStep.id}
                    isResending={isResending}
                    onResend={resendConfirmation}
                  />

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
