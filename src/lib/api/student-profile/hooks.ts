'use client';

import { useMutation, useQuery } from '@tanstack/react-query';

import { studentProfileService } from './service';
import type { UpdateAcademicInformationRequest, UpdateProfessionalSkillsRequest } from './types';

export function useMyStudentProfileQuery(enabled = true) {
  return useQuery({
    queryKey: ['student-profile', 'me'],
    queryFn: () => studentProfileService.getMyProfile(),
    enabled,
  });
}

export function useUpdateProfessionalSkillsMutation() {
  return useMutation({
    mutationFn: (payload: UpdateProfessionalSkillsRequest) =>
      studentProfileService.updateProfessionalSkills(payload),
  });
}

export function useUpdateAcademicInformationMutation() {
  return useMutation({
    mutationFn: (payload: UpdateAcademicInformationRequest) =>
      studentProfileService.updateAcademicInformation(payload),
  });
}
