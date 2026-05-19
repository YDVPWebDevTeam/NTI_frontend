'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { adminQueryKeys } from '../admin-query-keys';
import { adminAcademicStructureService } from './service';

import type {
  CreateFacultyDto,
  CreateSpecializationDto,
  CreateUniversityDto,
  ListAcademicStructureQuery,
  UpdateFacultyDto,
  UpdateSpecializationDto,
  UpdateUniversityDto,
} from './types';

export function useAdminUniversities(query: ListAcademicStructureQuery) {
  return useQuery({
    queryKey: adminQueryKeys.academicStructureUniversities(query),
    queryFn: () => adminAcademicStructureService.getUniversities(query),
  });
}

export function useAdminFaculties(universityId: string, includeInactive: boolean) {
  return useQuery({
    queryKey: adminQueryKeys.academicStructureFaculties(universityId, includeInactive),
    queryFn: () => adminAcademicStructureService.getFaculties(universityId, { includeInactive }),
    enabled: universityId.trim().length > 0,
  });
}

export function useAdminSpecializations(facultyId: string, includeInactive: boolean) {
  return useQuery({
    queryKey: adminQueryKeys.academicStructureSpecializations(facultyId, includeInactive),
    queryFn: () => adminAcademicStructureService.getSpecializations(facultyId, { includeInactive }),
    enabled: facultyId.trim().length > 0,
  });
}

export function useCreateUniversity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUniversityDto) =>
      adminAcademicStructureService.createUniversity(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.academicStructure(),
      });
    },
  });
}

export function useUpdateUniversity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUniversityDto }) =>
      adminAcademicStructureService.updateUniversity(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.academicStructure(),
      });
    },
  });
}

export function useDeleteUniversity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminAcademicStructureService.deleteUniversity(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.academicStructure(),
      });
    },
  });
}

export function useCreateFaculty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFacultyDto) => adminAcademicStructureService.createFaculty(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.academicStructure(),
      });
    },
  });
}

export function useUpdateFaculty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateFacultyDto }) =>
      adminAcademicStructureService.updateFaculty(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.academicStructure(),
      });
    },
  });
}

export function useDeleteFaculty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminAcademicStructureService.deleteFaculty(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.academicStructure(),
      });
    },
  });
}

export function useCreateSpecialization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSpecializationDto) =>
      adminAcademicStructureService.createSpecialization(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.academicStructure(),
      });
    },
  });
}

export function useUpdateSpecialization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSpecializationDto }) =>
      adminAcademicStructureService.updateSpecialization(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.academicStructure(),
      });
    },
  });
}

export function useDeleteSpecialization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminAcademicStructureService.deleteSpecialization(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.academicStructure(),
      });
    },
  });
}
