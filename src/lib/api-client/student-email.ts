'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getGetMyStudentProfileQueryKey } from 'lib/api';
import { isApiRequestError } from 'lib/api-client/openapi-runtime/client';
import { orvalMutator } from 'lib/api-client/openapi-runtime/runtime';

/* ─── Types (mirror backend DTOs) ────────────────────────── */

export type StudentEmailState = {
  studentEmail: string | null;
  isStudentEmailConfirmed: boolean;
};

/** HTTP 422 the backend returns when the email domain is not on the approved list. */
const DOMAIN_NOT_ALLOWED_STATUS = 422;

export function isStudentEmailDomainNotAllowedError(error: unknown): boolean {
  return isApiRequestError(error) && error.status === DOMAIN_NOT_ALLOWED_STATUS;
}

/* ─── Raw calls (generated style) ─────────────────────────── */

export function setStudentEmail(studentEmail: string) {
  return orvalMutator<StudentEmailState>(
    {
      url: '/student-profile/me/student-email',
      method: 'PATCH',
      data: { studentEmail },
      headers: { 'Content-Type': 'application/json' },
    },
    undefined,
  );
}

export function resendStudentEmailVerification() {
  return orvalMutator<StudentEmailState>(
    { url: '/student-profile/me/student-email/resend', method: 'POST' },
    undefined,
  );
}

export function confirmStudentEmail(token: string) {
  return orvalMutator<StudentEmailState>(
    {
      url: '/student-profile/student-email/confirm',
      method: 'POST',
      data: { token },
      headers: { 'Content-Type': 'application/json' },
    },
    undefined,
  );
}

/* ─── React Query hooks ───────────────────────────────────── */

export function useSetStudentEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (studentEmail: string) => setStudentEmail(studentEmail),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: getGetMyStudentProfileQueryKey() });
    },
  });
}

export function useResendStudentEmailVerification() {
  return useMutation({
    mutationFn: () => resendStudentEmailVerification(),
  });
}

export function useConfirmStudentEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => confirmStudentEmail(token),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: getGetMyStudentProfileQueryKey() });
    },
  });
}
