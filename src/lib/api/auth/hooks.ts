'use client';

import { useMutation, useQuery } from '@tanstack/react-query';

import type { ConfirmEmailRequest, LoginRequest, RegisterRequest } from './types';
import {
  confirmEmail,
  getCurrentUser,
  login,
  logout,
  registerStudent,
  resendConfirmationEmail,
} from './service';

export function useLoginMutation() {
  return useMutation({
    mutationFn: (payload: LoginRequest) => login(payload),
  });
}

export function useRegisterStudentMutation() {
  return useMutation({
    mutationFn: (payload: RegisterRequest) => registerStudent(payload),
  });
}

export function useResendConfirmationEmailMutation() {
  return useMutation({
    mutationFn: (email: string) => resendConfirmationEmail({ email }),
  });
}

export function useConfirmEmailMutation() {
  return useMutation({
    mutationFn: (payload: ConfirmEmailRequest) => confirmEmail(payload),
  });
}

export function useCurrentUserQuery(enabled = true) {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getCurrentUser,
    enabled,
    retry: false,
  });
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: logout,
  });
}
