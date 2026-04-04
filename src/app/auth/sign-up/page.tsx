'use client';

import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Check,
  Code2,
  Cpu,
  Gamepad2,
  Globe,
  MailCheck,
  Server,
  University,
} from 'lucide-react';
import { Header } from '@/src/components/layout/header';
import { Footer } from '@/src/components/layout/footer';
import { Button } from '@/src/components/shadcn/button';

type SkillOption = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

const STEPS = [
  { id: 'identity', label: 'Identity Verification', process: 'PROCESS 01' },
  { id: 'email', label: 'Email Verification', process: 'PROCESS 02' },
  { id: 'academic', label: 'Academic Status', process: 'PROCESS 03' },
  { id: 'skills', label: 'Skills & Stacks', process: 'PROCESS 04' },
] as const;

const IDENTITY_STEP = 0;
const EMAIL_STEP = 1;
const ACADEMIC_STEP = 2;
const SKILLS_STEP = 3;
const CODE_MIN_LENGTH = 4;
const STEP_INDEX_PAD = 2;

const SKILL_OPTIONS: SkillOption[] = [
  {
    id: 'software',
    title: 'Software Development',
    description:
      'Desktop and mobile ecosystems, architecture fundamentals, and embedded programming.',
    icon: Code2,
  },
  {
    id: 'ai-data',
    title: 'AI & Data Technologies',
    description: 'Machine learning workflows, model deployment, and practical data-driven systems.',
    icon: BrainCircuit,
  },
  {
    id: 'web',
    title: 'Web Applications',
    description:
      'Frontend frameworks, backend APIs, and high-performance cloud-ready applications.',
    icon: Globe,
  },
  {
    id: 'systems',
    title: 'IoT & Intelligent Systems',
    description: 'Low-level C/C++, sensor integration, and robotics device communication.',
    icon: Cpu,
  },
  {
    id: 'backend',
    title: 'Distributed Backend Systems',
    description:
      'Scalable services, messaging pipelines, observability, and resilient data layers.',
    icon: Server,
  },
  {
    id: 'gaming',
    title: 'Game Development',
    description:
      'Interactive 3D environments, rendering pipelines, and realtime simulation design.',
    icon: Gamepad2,
  },
];

export default function SignUpPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const [university, setUniversity] = useState('');
  const [studyProgram, setStudyProgram] = useState('');
  const [studyLevel, setStudyLevel] = useState('Bachelor');
  const [graduationYear, setGraduationYear] = useState('');

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const emailValid = (email: string): boolean => {
    const trimmed = email.trim();
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    return trimmed.length > 0 && regex.test(trimmed);
  };

  const stepIsValid = useMemo(() => {
    if (currentStep === IDENTITY_STEP) {
      return Boolean(fullName.trim() && emailValid(email) && password.trim() && acceptTerms);
    }
    if (currentStep === EMAIL_STEP) {
      return isEmailVerified;
    }
    if (currentStep === ACADEMIC_STEP) {
      return Boolean(
        university.trim() && studyProgram.trim() && studyLevel.trim() && graduationYear.trim(),
      );
    }

    return selectedSkills.length > 0;
  }, [
    acceptTerms,
    currentStep,
    email,
    fullName,
    graduationYear,
    isEmailVerified,
    password,
    selectedSkills.length,
    studyLevel,
    studyProgram,
    university,
  ]);

  const toggleSkill = (skillId: string) => {
    setSelectedSkills((previous) =>
      previous.includes(skillId)
        ? previous.filter((item) => item !== skillId)
        : [...previous, skillId],
    );
  };

  const handleNext = () => {
    if (!stepIsValid) return;
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSendCode = () => {
    if (!email.trim()) return;
    setCodeSent(true);
  };

  const handleVerifyCode = () => {
    if (verificationCode.trim().length < CODE_MIN_LENGTH) return;
    setIsEmailVerified(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#e7e8eb]">
      <Header />

      <main className="mx-auto flex w-full max-w-[1280px] flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
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
                SYSTEM MANIFEST
              </p>
              <h1 className="mt-4 text-3xl leading-tight font-semibold tracking-tight">
                Precision Engine Registration
              </h1>

              <div className="mt-9 space-y-5 lg:mt-12">
                {STEPS.map((step, index) => {
                  const isCompleted = index < currentStep;
                  const isActive = index === currentStep;

                  return (
                    <div key={step.id} className="flex items-start gap-3">
                      <div
                        className={[
                          'mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-semibold',
                          isCompleted
                            ? 'border-blue-400 bg-blue-500 text-white'
                            : isActive
                              ? 'border-white bg-white text-[#041d67]'
                              : 'border-white/25 bg-white/10 text-white/60',
                        ].join(' ')}
                      >
                        {isCompleted ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          `${index + 1}`.padStart(STEP_INDEX_PAD, '0')
                        )}
                      </div>

                      <div>
                        <p className="text-[10px] font-medium tracking-[0.12em] text-white/50">
                          {step.process}
                        </p>
                        <p
                          className={[
                            'text-md mt-1 leading-normal font-medium',
                            isActive ? 'text-white' : 'text-white/60',
                          ].join(' ')}
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
                ACTIVE STAGE
              </p>
              <h2 className="mt-2 text-4xl leading-tight font-semibold tracking-tight text-[#0c1a4f]">
                {currentStep === IDENTITY_STEP && 'Identity Verification'}
                {currentStep === EMAIL_STEP && 'Email Verification'}
                {currentStep === ACADEMIC_STEP && 'Academic Status'}
                {currentStep === SKILLS_STEP && 'Skills & Stacks'}
              </h2>
              <p className="mt-3 max-w-[680px] text-[16px] leading-relaxed text-neutral-600">
                {currentStep === IDENTITY_STEP &&
                  'Create your registration profile with core credentials and accept the institutional privacy terms.'}
                {currentStep === EMAIL_STEP &&
                  'Confirm your email address to secure your access and continue the onboarding process.'}
                {currentStep === ACADEMIC_STEP &&
                  'Provide your current academic information to align your incubation pathway and project matching.'}
                {currentStep === SKILLS_STEP &&
                  'Select your strongest technical competencies to personalize the ecosystem and challenge recommendations.'}
              </p>
            </div>

            {currentStep === IDENTITY_STEP && (
              <div className="grid grid-cols-1 gap-4 sm:gap-5">
                <Field label="Full Name" htmlFor="full-name">
                  <input
                    id="full-name"
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="h-12 w-full rounded-sm border border-black/10 bg-white px-4 text-sm text-neutral-800 transition-all outline-none focus:border-blue-500"
                    placeholder="Enter your full legal name"
                  />
                </Field>

                <Field label="Email Address" htmlFor="email-address">
                  <input
                    id="email-address"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-12 w-full rounded-sm border border-black/10 bg-white px-4 text-sm text-neutral-800 transition-all outline-none focus:border-blue-500"
                    placeholder="name@institution.edu"
                  />
                </Field>

                <Field label="Password" htmlFor="password">
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-12 w-full rounded-sm border border-black/10 bg-white px-4 text-sm text-neutral-800 transition-all outline-none focus:border-blue-500"
                    placeholder="Create a secure password"
                  />
                </Field>

                <label className="mt-1 flex items-start gap-3 rounded-sm border border-black/10 bg-white px-4 py-4 text-sm text-neutral-700">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(event) => setAcceptTerms(event.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-black/20"
                  />
                  <span>
                    I accept the Privacy Policy and institutional data processing terms required for
                    platform access.
                  </span>
                </label>
              </div>
            )}

            {currentStep === EMAIL_STEP && (
              <div className="space-y-4">
                <div className="rounded-sm border border-black/10 bg-white px-4 py-4 text-sm text-neutral-700">
                  <p>
                    Verification will be sent to{' '}
                    <span className="font-medium text-neutral-900">
                      {email || 'your email address'}
                    </span>
                    .
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    onClick={handleSendCode}
                    className="h-12 rounded-sm bg-[#1e58d5] px-5 text-[11px] font-semibold tracking-[0.1em] text-white hover:bg-[#245fdc]"
                    disabled={!email.trim()}
                  >
                    SEND VERIFICATION CODE
                  </Button>

                  {codeSent && (
                    <span className="inline-flex items-center gap-2 text-sm text-green-700">
                      <MailCheck className="h-4 w-4" />
                      Verification code sent.
                    </span>
                  )}
                </div>

                <Field label="Verification Code" htmlFor="verification-code">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      id="verification-code"
                      type="text"
                      value={verificationCode}
                      onChange={(event) => setVerificationCode(event.target.value)}
                      className="h-12 w-full rounded-sm border border-black/10 bg-white px-4 text-sm tracking-[0.24em] text-neutral-800 transition-all outline-none focus:border-blue-500"
                      placeholder="000000"
                    />

                    <Button
                      type="button"
                      onClick={handleVerifyCode}
                      className="h-12 rounded-sm border border-black/10 bg-white px-5 text-[11px] font-semibold tracking-[0.1em] text-neutral-800 hover:bg-black/[0.03]"
                      disabled={
                        !codeSent ||
                        verificationCode.trim().length < CODE_MIN_LENGTH ||
                        isEmailVerified
                      }
                    >
                      {isEmailVerified ? 'VERIFIED' : 'VERIFY'}
                    </Button>
                  </div>
                </Field>

                {isEmailVerified && (
                  <div className="rounded-sm border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                    Email verification completed successfully.
                  </div>
                )}
              </div>
            )}

            {currentStep === ACADEMIC_STEP && (
              <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
                <Field label="University" htmlFor="university" className="md:col-span-2">
                  <div className="relative">
                    <University className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <select
                      id="university"
                      value={university}
                      onChange={(event) => setUniversity(event.target.value)}
                      className="h-12 w-full rounded-sm border border-black/10 bg-white pr-4 pl-10 text-sm text-neutral-800 transition-all outline-none focus:border-blue-500"
                    >
                      <option value="">Select university</option>
                      <option value="UKF University">UKF University</option>
                      <option value="EUBA University">EUBA University</option>
                    </select>
                  </div>
                </Field>

                <Field label="Study Program" htmlFor="study-program">
                  <input
                    id="study-program"
                    type="text"
                    value={studyProgram}
                    onChange={(event) => setStudyProgram(event.target.value)}
                    className="h-12 w-full rounded-sm border border-black/10 bg-white px-4 text-sm text-neutral-800 transition-all outline-none focus:border-blue-500"
                    placeholder="Computer Science"
                  />
                </Field>

                <Field label="Degree Level" htmlFor="degree-level">
                  <select
                    id="degree-level"
                    value={studyLevel}
                    onChange={(event) => setStudyLevel(event.target.value)}
                    className="h-12 w-full rounded-sm border border-black/10 bg-white px-4 text-sm text-neutral-800 transition-all outline-none focus:border-blue-500"
                  >
                    <option>Bachelor</option>
                    <option>Master</option>
                    <option>PhD</option>
                  </select>
                </Field>

                <Field label="Expected Graduation Year" htmlFor="grad-year">
                  <input
                    id="grad-year"
                    type="number"
                    min="2026"
                    max="2040"
                    value={graduationYear}
                    onChange={(event) => setGraduationYear(event.target.value)}
                    className="h-12 w-full rounded-sm border border-black/10 bg-white px-4 text-sm text-neutral-800 transition-all outline-none focus:border-blue-500"
                    placeholder="2028"
                  />
                </Field>
              </div>
            )}

            {currentStep === SKILLS_STEP && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {SKILL_OPTIONS.map((skill) => {
                    const selected = selectedSkills.includes(skill.id);
                    const Icon = skill.icon;

                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => toggleSkill(skill.id)}
                        className={[
                          'group relative flex min-h-36 w-full flex-col gap-3 rounded-sm border bg-white px-5 py-4 text-left transition-all',
                          selected
                            ? 'border-blue-600 shadow-[0_0_0_1px_rgba(37,99,235,0.15)]'
                            : 'border-black/10 hover:border-blue-300',
                        ].join(' ')}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex h-11 w-11 items-center justify-center bg-black/[0.03] text-blue-700">
                            <Icon className="h-5 w-5" />
                          </div>

                          <span
                            className={[
                              'inline-flex h-5 w-5 items-center justify-center border',
                              selected
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-black/20 bg-white',
                            ].join(' ')}
                          >
                            {selected && <Check className="h-3.5 w-3.5" />}
                          </span>
                        </div>

                        <p className="text-[28px] leading-none font-black tracking-tight text-black/5">
                          {String(
                            SKILL_OPTIONS.findIndex((item) => item.id === skill.id) + 1,
                          ).padStart(STEP_INDEX_PAD, '0')}
                        </p>

                        <div>
                          <h3 className="text-[24px] font-medium tracking-tight text-neutral-900">
                            {skill.title}
                          </h3>
                          <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                            {skill.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-sm border border-black/10 bg-white px-4 py-4 text-sm text-neutral-700">
                  <p>
                    Selected stacks:{' '}
                    <span className="font-medium text-neutral-900">
                      {selectedSkills.length > 0 ? selectedSkills.length : 0}
                    </span>
                  </p>
                </div>
              </div>
            )}

            <div className="mt-9 flex flex-col-reverse gap-3 border-t border-black/[0.07] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentStep === IDENTITY_STEP}
                className="h-11 justify-center rounded-sm border border-black/10 px-5 text-[11px] font-semibold tracking-[0.1em] text-neutral-700 hover:bg-black/[0.03] disabled:opacity-40 sm:justify-start"
              >
                <ArrowLeft className="h-4 w-4" />
                PREVIOUS STEP
              </Button>

              {currentStep < STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!stepIsValid}
                  className="h-11 rounded-sm bg-[#1e58d5] px-7 text-[11px] font-semibold tracking-[0.1em] text-white hover:bg-[#245fdc] disabled:opacity-40"
                >
                  NEXT STEP
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={!stepIsValid}
                  className="h-11 rounded-sm bg-[#1e58d5] px-7 text-[11px] font-semibold tracking-[0.1em] text-white hover:bg-[#245fdc] disabled:opacity-40"
                >
                  FINISH REGISTRATION
                </Button>
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

type FieldProps = {
  children: React.ReactNode;
  label: string;
  htmlFor: string;
  className?: string;
};

function Field({ children, label, htmlFor, className }: FieldProps) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-[11px] font-medium tracking-[0.1em] text-neutral-500 uppercase"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
