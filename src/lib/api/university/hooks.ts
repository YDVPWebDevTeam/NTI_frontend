'use client';

import { useQuery } from '@tanstack/react-query';

import type { ListUniversitiesParams } from './types';
import { lookupService } from './service';

export function useUniversitiesQuery(params: ListUniversitiesParams = {}, enabled = true) {
  return useQuery({
    queryKey: ['lookups', 'universities', params],
    queryFn: () => lookupService.listUniversities(params),
    enabled,
  });
}

export function useFacultiesByUniversityQuery(universityId?: string) {
  return useQuery({
    queryKey: ['lookups', 'faculties', universityId],
    queryFn: () => lookupService.listFacultiesByUniversity(universityId as string),
    enabled: Boolean(universityId),
  });
}

export function useSpecializationsByFacultyQuery(facultyId?: string) {
  return useQuery({
    queryKey: ['lookups', 'specializations', facultyId],
    queryFn: () => lookupService.listSpecializationsByFaculty(facultyId as string),
    enabled: Boolean(facultyId),
  });
}
