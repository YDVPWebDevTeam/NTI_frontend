'use client';

import { useMutation, useQuery } from '@tanstack/react-query';

import type { ConfirmEmailRequest, LoginRequest, RegisterRequest } from './types';
import { authService } from './service';

export function useLoginMutation() {
  return useMutation({
    mutationFn: (payload: LoginRequest) => authService.login(payload),
  });
}

export function useRegisterStudentMutation() {
  return useMutation({
    mutationFn: (payload: RegisterRequest) => authService.registerStudent(payload),
  });
}

export function useResendConfirmationEmailMutation() {
  return useMutation({
    mutationFn: (email: string) => authService.resendConfirmationEmail({ email }),
  });
}

export function useConfirmEmailMutation() {
  return useMutation({
    mutationFn: (payload: ConfirmEmailRequest) => authService.confirmEmail(payload),
  });
}

export function useAuthSessionQuery(enabled = true) {
  return useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      try {
        return await authService.refresh();
      } catch {
        return null;
      }
    },
    enabled,
    retry: false,
  });
}

export function useCurrentUserQuery(enabled = true) {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authService.getCurrentUser(),
    enabled,
    retry: false,
  });
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: () => authService.logout(),
  });
}
