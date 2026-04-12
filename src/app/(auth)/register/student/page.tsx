'use client';

import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/src/components/shadcn/button';
import { Form } from '@/src/components/shadcn/form';
import { ROUTES } from '@/src/lib/constants';
import {
  useConfirmEmailMutation,
  useRegisterStudentMutation,
  useResendConfirmationEmailMutation,
} from '@/src/lib/api/auth';
import { cn } from '@/src/lib/utils';
import { EmailStep } from './_components/email-step';
import { IdentityStep } from './_components/identity-step';
import { createStudentRegistrationSchema, type StudentRegistrationValues } from './schema';
import { toast } from 'sonner';

const STEP_INDEX_PAD_LENGTH = 2;

type RegistrationStepConfig = {
  id: string;
  label: string;
  process: string;
  fields: (keyof StudentRegistrationValues)[];
  description: string;
};

export default function SignUpPage() {
  const { i18n } = useLingui();
  const router = useRouter();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const studentRegistrationSchema = useMemo(() => createStudentRegistrationSchema(), [i18n.locale]);

  const steps: RegistrationStepConfig[] = useMemo(
    () => [
      {
        id: 'identity',
        label: t`Identity Verification`,
        process: t`PROCESS 01`,
        fields: ['fullName', 'email', 'password', 'acceptTerms'],
        description: t`Create your registration profile with core credentials and accept the institutional privacy terms.`,
      },
      {
        id: 'email',
        label: t`Email Confirmation`,
        process: t`PROCESS 02`,
        fields: ['verificationCode'],
        description: t`Confirm your email address from the message sent to your inbox before full platform access.`,
      },
      {
        id: 'academic',
        label: t`Academic Information`,
        process: t`PROCESS 03`,
        fields: [],
        description: t`Tell us about your educational background.`,
      },
      {
        id: 'skills',
        label: t`Professional Skills`,
        process: t`PROCESS 04`,
        fields: [],
        description: t`Highlight your technical and soft skills for potential partners.`,
      },
    ],
    [i18n.locale],
  );

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  const { mutateAsync: register, isPending: isRegisterPending } = useRegisterStudentMutation();
  const { mutateAsync: resendConfirmationEmail, isPending: isResendConfirmationPending } =
    useResendConfirmationEmailMutation();
  const { mutateAsync: confirmEmail, isPending: isConfirmEmailPending } = useConfirmEmailMutation();

  const form = useForm<StudentRegistrationValues>({
    resolver: zodResolver(studentRegistrationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      acceptTerms: false,
      verificationCode: '',
    },
    mode: 'onChange',
  });

  const handleNextStep = async () => {
    const isValid = await form.trigger(currentStep.fields);

    if (!isValid) {
      return;
    }

    try {
      if (currentStep.id === 'identity') {
        const values = form.getValues();

        await register({
          name: values.fullName,
          email: values.email,
          password: values.password,
        });
      }

      if (currentStep.id === 'email') {
        const values = form.getValues();

        await confirmEmail({
          token: values.verificationCode,
        });
      }

      setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t`Unable to register. Please try again.`,
      );
    }
  };

  const handlePreviousStep = () => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const isStepValid = !currentStep.fields.some((field) => !!form.formState.errors[field]);

  const handleSubmit = () => {
    if (!isLastStep) {
      return;
    }

    try {
      router.push(ROUTES.ROOT);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t`Unable to register. Please try again.`,
      );
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="grid w-full grid-cols-1 overflow-hidden border border-black/10 bg-[#e7e8eb] lg:grid-cols-[320px_1fr]">
        <aside className="relative bg-[#041d67] px-6 py-8 text-white lg:px-8 lg:py-10">
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.16) 1px, transparent 0)',
              backgroundSize: '22px 22px',
            }}
          />

          <div className="relative z-10">
            <p className="text-[11px] font-medium tracking-[0.14em] text-white/50">
              {t`SYSTEM MANIFEST`}
            </p>
            <h1 className="mt-4 text-3xl leading-tight font-semibold tracking-tight">
              {t`Precision Engine Registration`}
            </h1>

            <div className="mt-9 space-y-5 lg:mt-12">
              {steps.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isActive = index === currentStepIndex;

                return (
                  <div key={step.id} className="flex items-start gap-3">
                    <div
                      className={cn(
                        'mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-semibold',
                        isCompleted
                          ? 'border-blue-400 bg-blue-500 text-white'
                          : isActive
                            ? 'border-white bg-white text-[#041d67]'
                            : 'border-white/25 bg-white/10 text-white/60',
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        `${index + 1}`.padStart(STEP_INDEX_PAD_LENGTH, '0')
                      )}
                    </div>

                    <div>
                      <p className="text-[10px] font-medium tracking-[0.12em] text-white/50">
                        {step.process}
                      </p>
                      <p
                        className={cn(
                          'text-md mt-1 leading-normal font-medium',
                          isActive ? 'text-white' : 'text-white/60',
                        )}
                      >
                        {step.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        <section className="bg-[#ececef] px-5 py-7 sm:px-8 sm:py-10 lg:px-12">
          <div className="mb-7 border-b border-black/[0.07] pb-6">
            <p className="text-[11px] font-medium tracking-[0.12em] text-neutral-500">
              {t`ACTIVE STAGE`}
            </p>
            <h2 className="mt-2 text-4xl leading-tight font-semibold tracking-tight text-[#0c1a4f]">
              {currentStep.label}
            </h2>
            <p className="mt-3 max-w-170 text-[16px] leading-relaxed text-neutral-600">
              {currentStep.description}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              {currentStep.id === 'identity' ? <IdentityStep /> : null}
              {currentStep.id === 'email' ? (
                <EmailStep
                  isResending={isResendConfirmationPending}
                  onResend={async (email) => {
                    await resendConfirmationEmail(email);
                  }}
                />
              ) : null}
              {currentStep.id === 'academic' ? (
                <div className="py-10 text-center text-neutral-500">{t`Academic information placeholder...`}</div>
              ) : null}
              {currentStep.id === 'skills' ? (
                <div className="py-10 text-center text-neutral-500">{t`Professional skills placeholder...`}</div>
              ) : null}

              <div className="mt-9 flex flex-col-reverse gap-3 border-t border-black/[0.07] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handlePreviousStep}
                  disabled={isRegisterPending || isConfirmEmailPending}
                  className="h-11 justify-center rounded-sm border border-black/10 px-5 text-[11px] font-semibold tracking-widest text-neutral-700 hover:bg-black/3 disabled:opacity-40 sm:justify-start"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t`PREVIOUS STEP`}
                </Button>

                {isLastStep ? (
                  <Button
                    type="submit"
                    className="h-11 rounded-sm bg-[#1e58d5] px-7 text-[11px] font-semibold tracking-widest text-white hover:bg-[#245fdc] disabled:opacity-40"
                  >
                    {t`FINISH REGISTRATION`}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    disabled={isRegisterPending || isConfirmEmailPending || !isStepValid}
                    className="h-11 rounded-sm bg-[#1e58d5] px-7 text-[11px] font-semibold tracking-widest text-white hover:bg-[#245fdc] disabled:opacity-40"
                  >
                    {isRegisterPending || isConfirmEmailPending ? t`PROCESSING...` : t`NEXT STEP`}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </section>
      </div>
    </main>
  );
}
