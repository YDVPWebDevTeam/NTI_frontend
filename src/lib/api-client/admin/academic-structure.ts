'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import {
  adminAcademicStructureControllerDeleteFaculty,
  adminAcademicStructureControllerDeleteSpecialization,
  adminAcademicStructureControllerDeleteUniversity,
  adminCreateFaculty,
  adminCreateSpecialization,
  adminCreateUniversity,
  adminUpdateFaculty,
  adminUpdateSpecialization,
  adminUpdateUniversity,
  getAdminListUniversitiesQueryKey,
  useAdminListFaculties,
  useAdminListSpecializations,
  useAdminListUniversities,
  type AdminFacultyDto,
  type AdminListFacultiesParams,
  type AdminListSpecializationsParams,
  type AdminListUniversitiesParams,
  type AdminSpecializationDto,
  type AdminUniversityDto,
  type CreateFacultyDto,
  type CreateSpecializationDto,
  type CreateUniversityDto,
  type UpdateFacultyDto,
  type UpdateSpecializationDto,
  type UpdateUniversityDto,
} from 'lib/api';

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

export type ListAcademicStructureQuery = AdminListUniversitiesParams;

function invalidateAcademicStructure(queryClient: ReturnType<typeof useQueryClient>) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: getAdminListUniversitiesQueryKey() }),
    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === '/admin/academic-structure/faculties',
    }),
    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === '/admin/academic-structure/specializations',
    }),
  ]);
}

export function useAdminUniversities(query: ListAcademicStructureQuery) {
  return useAdminListUniversities(query, {
    query: {},
  });
}

export function useAdminFaculties(universityId: string, includeInactive: boolean) {
  const params: AdminListFacultiesParams = { includeInactive };

  return useAdminListFaculties(universityId, params, {
    query: {
      enabled: universityId.trim().length > 0,
    },
  });
}

export function useAdminSpecializations(facultyId: string, includeInactive: boolean) {
  const params: AdminListSpecializationsParams = { includeInactive };

  return useAdminListSpecializations(facultyId, params, {
    query: {
      enabled: facultyId.trim().length > 0,
    },
  });
}

export function useCreateUniversity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUniversityDto) => adminCreateUniversity(payload),
    onSuccess: async () => {
      await invalidateAcademicStructure(queryClient);
    },
  });
}

export function useUpdateUniversity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUniversityDto }) =>
      adminUpdateUniversity(id, payload),
    onSuccess: async () => {
      await invalidateAcademicStructure(queryClient);
    },
  });
}

export function useDeleteUniversity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminAcademicStructureControllerDeleteUniversity(id),
    onSuccess: async () => {
      await invalidateAcademicStructure(queryClient);
    },
  });
}

export function useCreateFaculty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFacultyDto) => adminCreateFaculty(payload),
    onSuccess: async () => {
      await invalidateAcademicStructure(queryClient);
    },
  });
}

export function useUpdateFaculty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateFacultyDto }) =>
      adminUpdateFaculty(id, payload),
    onSuccess: async () => {
      await invalidateAcademicStructure(queryClient);
    },
  });
}

export function useDeleteFaculty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminAcademicStructureControllerDeleteFaculty(id),
    onSuccess: async () => {
      await invalidateAcademicStructure(queryClient);
    },
  });
}

export function useCreateSpecialization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSpecializationDto) => adminCreateSpecialization(payload),
    onSuccess: async () => {
      await invalidateAcademicStructure(queryClient);
    },
  });
}

export function useUpdateSpecialization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSpecializationDto }) =>
      adminUpdateSpecialization(id, payload),
    onSuccess: async () => {
      await invalidateAcademicStructure(queryClient);
    },
  });
}

export function useDeleteSpecialization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminAcademicStructureControllerDeleteSpecialization(id),
    onSuccess: async () => {
      await invalidateAcademicStructure(queryClient);
    },
  });
}

export type {
  AdminFacultyDto,
  AdminSpecializationDto,
  AdminUniversityDto,
  CreateFacultyDto,
  CreateSpecializationDto,
  CreateUniversityDto,
  UpdateFacultyDto,
  UpdateSpecializationDto,
  UpdateUniversityDto,
};
