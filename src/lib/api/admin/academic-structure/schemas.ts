import { z } from 'zod';

const optionalString = z.string().optional();

export const universityFormSchema = z.object({
  name: z.string().trim().min(1, 'University name is required.'),
  shortName: optionalString,
  website: optionalString,
  city: optionalString,
  country: optionalString,
  isActive: z.boolean(),
});

export const facultyFormSchema = z.object({
  name: z.string().trim().min(1, 'Faculty name is required.'),
  shortName: optionalString,
  isActive: z.boolean(),
});

export const specializationFormSchema = z.object({
  name: z.string().trim().min(1, 'Specialization name is required.'),
  code: optionalString,
  degreeLabel: optionalString,
  isActive: z.boolean(),
});

export type UniversityFormSchema = z.infer<typeof universityFormSchema>;
export type FacultyFormSchema = z.infer<typeof facultyFormSchema>;
export type SpecializationFormSchema = z.infer<typeof specializationFormSchema>;
