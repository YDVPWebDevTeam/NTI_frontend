'use client';

import { t } from '@lingui/core/macro';
import { useRouter } from 'next/navigation';
import type { UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';

import {
  useConfirmEmailMutation,
  useRegisterStudentMutation,
  useResendConfirmationEmailMutation,
} from 'lib/api';
import {
  uploadAndCompleteFile,
  useCompleteUploadMutation,
  useRequestUploadUrlMutation,
  useUploadToPresignedUrlMutation,
} from 'lib/api';
import { useUpdateAcademicInformationMutation, useUpdateProfessionalSkillsMutation } from 'lib/api';
import { ROUTES } from 'lib/constants';
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
  const router = useRouter();

  const { mutateAsync: register, isPending: isRegisterPending } = useRegisterStudentMutation();
  const { mutateAsync: resendConfirmationEmail, isPending: isResendConfirmationPending } =
    useResendConfirmationEmailMutation();
  const { mutateAsync: confirmEmail, isPending: isConfirmEmailPending } = useConfirmEmailMutation();
  const { mutateAsync: updateAcademic, isPending: isAcademicPending } =
    useUpdateAcademicInformationMutation();
  const { mutateAsync: updateSkills, isPending: isSkillsPending } =
    useUpdateProfessionalSkillsMutation();
  const { mutateAsync: requestUploadUrl, isPending: isRequestingUploadUrl } =
    useRequestUploadUrlMutation();
  const { mutateAsync: uploadToPresignedUrl, isPending: isUploadingToPresignedUrl } =
    useUploadToPresignedUrlMutation();
  const { mutateAsync: completeUpload, isPending: isCompletingUpload } =
    useCompleteUploadMutation();

  const isBusy =
    isRegisterPending ||
    isResendConfirmationPending ||
    isConfirmEmailPending ||
    isAcademicPending ||
    isSkillsPending ||
    isRequestingUploadUrl ||
    isUploadingToPresignedUrl ||
    isCompletingUpload;

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

  const handleAcademicStep = async () => {
    const values = form.getValues();
    let academicEvidenceFileId = values.academicEvidenceFileId || undefined;

    if (values.academicEvidenceFile instanceof File) {
      const uploadedFile = await uploadAndCompleteFile(
        {
          requestUploadUrl,
          uploadToPresignedUrl,
          completeUpload,
        },
        {
          file: values.academicEvidenceFile,
          purpose: 'ACADEMIC_EVIDENCE',
          entityType: 'STUDENT_PROFILE',
        },
      );

      academicEvidenceFileId = uploadedFile.id;
      form.setValue('academicEvidenceFileId', uploadedFile.id, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      });
      form.setValue('academicEvidenceFile', null, {
        shouldDirty: true,
        shouldTouch: false,
        shouldValidate: false,
      });
    }

    await updateAcademic({
      universityId: values.universityId,
      facultyId: values.facultyId,
      specializationId: values.specializationId,
      degreeLevel: values.degreeLevel,
      studyMode: values.studyMode || undefined,
      studyYear: values.studyYear,
      expectedGraduationYear: values.expectedGraduationYear || undefined,
      hasTransferredSubjects: values.hasTransferredSubjects,
      transferredSubjectsCount: values.transferredSubjectsCount ?? undefined,
      profileSubjectsAverage: values.profileSubjectsAverage ?? undefined,
      relevantCourses: values.relevantCourses.filter(Boolean),
      academicAchievements: values.academicAchievements || undefined,
      academicEvidenceFileId,
      academicDeclarationAccepted: values.academicDeclarationAccepted,
    });
  };

  const handleSkillsStep = async () => {
    const values = form.getValues();
    let cvFileId = values.cvFileId || undefined;

    if (values.cvFile instanceof File) {
      const uploadedFile = await uploadAndCompleteFile(
        {
          requestUploadUrl,
          uploadToPresignedUrl,
          completeUpload,
        },
        {
          file: values.cvFile,
          purpose: 'CV',
          entityType: 'STUDENT_PROFILE',
        },
      );

      cvFileId = uploadedFile.id;
      form.setValue('cvFileId', uploadedFile.id, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      });
      form.setValue('cvFile', null, {
        shouldDirty: true,
        shouldTouch: false,
        shouldValidate: false,
      });
    }

    if (!cvFileId) {
      throw new Error(t`CV file is required.`);
    }

    await updateSkills({
      focusAreas: values.focusAreas,
      preferredRoles: values.preferredRoles,
      softSkills: values.softSkills.filter(Boolean),
      githubUrl: values.githubUrl || undefined,
      linkedinUrl: values.linkedinUrl || undefined,
      portfolioUrl: values.portfolioUrl || undefined,
      cvFileId,
      skills: values.skills.map((skill) => ({
        ...skill,
        experienceMonths: skill.experienceMonths ?? undefined,
        level: skill.level,
      })),
      projects: values.projects.map((project) => ({
        ...project,
        technologies: project.technologies?.filter(Boolean) ?? [],
        projectUrl: project.projectUrl || undefined,
      })),
      bio: values.bio || undefined,
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
        email: async ({ currentStepIndex, stepsLength, onAdvance }) => {
          await handleEmailStep();
          onAdvance(Math.min(currentStepIndex + 1, stepsLength - 1));
        },
        academic: async ({ currentStepIndex, stepsLength, onAdvance }) => {
          await handleAcademicStep();
          onAdvance(Math.min(currentStepIndex + 1, stepsLength - 1));
        },
        skills: async ({ currentStepIndex, stepsLength, onAdvance }) => {
          await handleSkillsStep();
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
    } catch (error) {
      handleError(error, t`Unable to register. Please try again.`);
    }
  };

  const finishRegistration = (onComplete: () => void) => {
    try {
      onComplete();
      router.push(ROUTES.ROOT);
    } catch (error) {
      handleError(error, t`Unable to register. Please try again.`);
    }
  };

  return {
    submitStep,
    resendConfirmation,
    finishRegistration,
    isBusy,
    isResending: isResendConfirmationPending,
  };
}
