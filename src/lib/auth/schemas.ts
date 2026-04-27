import { i18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import * as z from 'zod';
import { getCurrentYear, getMaxGraduationYear } from 'lib/date';

export const PASSWORD_MIN_LENGTH = 6;
export const VERIFICATION_CODE_MIN_LENGTH = 4;
export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 50;
export const STUDY_YEAR_MAX = 8;
export const MAX_SOFT_SKILLS = 3;

export function createLoginSchema() {
  return z.object({
    email: z.email({ message: i18n._(msg`Please enter a valid email address.`) }),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, { message: i18n._(msg`Password must be at least 6 characters.`) }),
  });
}

export function createStudentIdentitySchema() {
  return z.object({
    firstName: z
      .string()
      .trim()
      .min(NAME_MIN_LENGTH, { message: i18n._(msg`Must be at least 2 characters.`) })
      .max(NAME_MAX_LENGTH, { message: i18n._(msg`Must be at most 50 characters.`) }),
    lastName: z
      .string()
      .trim()
      .min(NAME_MIN_LENGTH, { message: i18n._(msg`Must be at least 2 characters.`) })
      .max(NAME_MAX_LENGTH, { message: i18n._(msg`Must be at most 50 characters.`) }),
    email: z.email({ message: i18n._(msg`Must be a valid email address.`) }),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, { message: i18n._(msg`Password must be at least 6 characters.`) }),
    acceptTerms: z.boolean().refine((val) => val, {
      message: i18n._(msg`You must accept the terms.`),
    }),
  });
}

export function createStudentEmailStepSchema() {
  return z.object({
    verificationCode: z
      .string()
      .trim()
      .refine(
        (value) => value.length === 0 || value.length >= VERIFICATION_CODE_MIN_LENGTH,
        i18n._(msg`Code must be at least 4 characters.`),
      ),
  });
}

export function createStudentAcademicSchema() {
  return z.object({
    universityId: z.string().min(1, { message: i18n._(msg`University is required.`) }),
    facultyId: z.string().min(1, { message: i18n._(msg`Faculty is required.`) }),
    specializationId: z.string().min(1, { message: i18n._(msg`Specialization is required.`) }),
    degreeLevel: z.string().min(1, { message: i18n._(msg`Degree level is required.`) }),
    studyMode: z.string().optional(),
    studyYear: z
      .number()
      .int({ message: i18n._(msg`Year of study must be a whole number.`) })
      .min(1, { message: i18n._(msg`Year of study must be between 1 and 8.`) })
      .max(STUDY_YEAR_MAX, { message: i18n._(msg`Year of study must be between 1 and 8.`) }),
    expectedGraduationYear: z.coerce
      .number()
      .min(getCurrentYear(), { message: i18n._(msg`Year cannot be in the past.`) })
      .max(getMaxGraduationYear(), { message: i18n._(msg`Year is too far in the future.`) })
      .optional(),
    hasTransferredSubjects: z.boolean().default(false),
    transferredSubjectsCount: z.coerce.number().optional().nullable(),
    profileSubjectsAverage: z.coerce.number().optional().nullable(),
    relevantCourses: z.array(z.string()).optional().default([]),
    academicAchievements: z.string().optional(),
    academicEvidenceFile: z.unknown().optional().nullable(),
    academicEvidenceFileId: z.string().optional(),
    academicDeclarationAccepted: z.boolean().refine((val) => val, {
      message: i18n._(msg`You must accept the academic declaration.`),
    }),
  });
}

export function createStudentSkillsSchema() {
  const softSkillSchema = z.enum([
    'TEAMWORK',
    'COMMUNICATION',
    'LEADERSHIP',
    'PRESENTATION',
    'PROBLEM_SOLVING',
    'TIME_MANAGEMENT',
    'PROJECT_COORDINATION',
  ]);

  return z
    .object({
      focusAreas: z
        .array(z.string())
        .min(1, { message: i18n._(msg`Select at least one focus area.`) }),
      preferredRoles: z
        .array(z.string())
        .min(1, { message: i18n._(msg`Select at least one preferred role.`) }),
      softSkills: z
        .array(softSkillSchema)
        .max(MAX_SOFT_SKILLS, { message: i18n._(msg`Select at most 3 soft skills.`) })
        .optional()
        .default([]),
      githubUrl: z
        .string()
        .url({ message: i18n._(msg`Enter a valid URL.`) })
        .optional()
        .or(z.literal('')),
      linkedinUrl: z
        .string()
        .url({ message: i18n._(msg`Enter a valid URL.`) })
        .optional()
        .or(z.literal('')),
      portfolioUrl: z
        .string()
        .url({ message: i18n._(msg`Enter a valid URL.`) })
        .optional()
        .or(z.literal('')),
      cvFile: z.unknown().optional().nullable(),
      cvFileId: z.string().optional(),
      skills: z
        .array(
          z.object({
            name: z.string().min(1, { message: i18n._(msg`Skill name is required.`) }),
            level: z.string().min(1, { message: i18n._(msg`Level is required.`) }),
            experienceMonths: z.coerce.number().optional().nullable(),
            isPrimary: z.boolean().optional().default(false),
          }),
        )
        .min(1, { message: i18n._(msg`Add at least one technical skill.`) }),
      projects: z
        .array(
          z.object({
            title: z.string().min(1, { message: i18n._(msg`Project title is required.`) }),
            description: z.string().min(1, { message: i18n._(msg`Description is required.`) }),
            role: z.string().min(1, { message: i18n._(msg`Role is required.`) }),
            technologies: z.array(z.string()).optional().default([]),
            projectUrl: z
              .string()
              .url({ message: i18n._(msg`Enter a valid URL.`) })
              .optional()
              .or(z.literal('')),
          }),
        )
        .optional()
        .default([]),
      bio: z.string().optional(),
    })
    .superRefine((values, ctx) => {
      if (!values.skills.some((skill) => skill.isPrimary)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['skills'],
          message: i18n._(msg`At least one skill must be marked as primary.`),
        });
      }

      const hasSelectedCvFile = typeof File !== 'undefined' && values.cvFile instanceof File;
      const hasUploadedCvFileId = Boolean(values.cvFileId?.trim());

      if (!hasSelectedCvFile && !hasUploadedCvFileId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['cvFileId'],
          message: i18n._(msg`CV file is required.`),
        });
      }
    });
}

export function createStudentRegistrationSchema() {
  const studentIdentitySchema = createStudentIdentitySchema();
  const studentEmailStepSchema = createStudentEmailStepSchema();
  const studentAcademicSchema = createStudentAcademicSchema();
  const studentSkillsSchema = createStudentSkillsSchema();

  return z
    .object({
      ...studentIdentitySchema.shape,
      ...studentEmailStepSchema.shape,
      ...studentAcademicSchema.shape,
      ...studentSkillsSchema.shape,
    })
    .superRefine((values, ctx) => {
      if (!values.skills.some((skill) => skill.isPrimary)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['skills'],
          message: i18n._(msg`At least one skill must be marked as primary.`),
        });
      }

      const hasSelectedCvFile = Boolean(values.cvFile);
      const hasUploadedCvFileId = Boolean(values.cvFileId?.trim());

      if (!hasSelectedCvFile && !hasUploadedCvFileId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['cvFileId'],
          message: i18n._(msg`CV file is required.`),
        });
      }
    });
}

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;
export type StudentRegistrationValues = z.infer<ReturnType<typeof createStudentRegistrationSchema>>;
