'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';

import { studentProfileService } from './service';
import type {
  CompleteStudentProfileRequest,
  UpdateAcademicInformationRequest,
  UpdateProfessionalSkillsRequest,
} from './types';

export function useMyStudentProfileQuery(enabled = true) {
  return useQuery({
    queryKey: ['student-profile', 'me'],
    queryFn: () => studentProfileService.getMyProfile(),
    enabled,
  });
}

export function useUpdateProfessionalSkillsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfessionalSkillsRequest) =>
      studentProfileService.updateProfessionalSkills(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(['student-profile', 'me'], data);
    },
  });
}

export function useUpdateAcademicInformationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateAcademicInformationRequest) =>
      studentProfileService.updateAcademicInformation(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(['student-profile', 'me'], data);
    },
  });
}

export function useCompleteProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CompleteStudentProfileRequest) =>
      studentProfileService.completeProfile(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(['student-profile', 'me'], data);
    },
  });
}
