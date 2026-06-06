'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { orvalMutator } from 'lib/api-client/openapi-runtime/runtime';

/* ─── Types (mirror backend DTOs) ────────────────────────── */

export type ContactSubmissionStatus = 'NEW' | 'REVIEWED' | 'RESOLVED';

export type ContactSubmissionDto = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  topic?: string | null;
  status: ContactSubmissionStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateContactSubmissionPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
  topic?: string;
};

/* ─── Query key ───────────────────────────────────────────── */

export const CONTACT_SUBMISSIONS_QUERY_KEY = ['/contact'] as const;

/* ─── Raw calls (generated style) ────────────────────────── */

export function submitContact(payload: CreateContactSubmissionPayload) {
  return orvalMutator<ContactSubmissionDto>(
    {
      url: '/contact',
      method: 'POST',
      data: payload,
      headers: { 'Content-Type': 'application/json' },
    },
    undefined,
  );
}

export function listContactSubmissions() {
  return orvalMutator<ContactSubmissionDto[]>({ url: '/contact', method: 'GET' }, undefined);
}

export function updateContactStatus(id: string, status: ContactSubmissionStatus) {
  return orvalMutator<ContactSubmissionDto>(
    {
      url: `/contact/${id}/status`,
      method: 'PATCH',
      data: { status },
      headers: { 'Content-Type': 'application/json' },
    },
    undefined,
  );
}

/* ─── React Query hooks ───────────────────────────────────── */

export function useContactSubmissions() {
  return useQuery({
    queryKey: CONTACT_SUBMISSIONS_QUERY_KEY,
    queryFn: () => listContactSubmissions(),
    select: (response) => {
      const r = response as unknown as { data?: ContactSubmissionDto[] };

      return r.data ?? (response as unknown as ContactSubmissionDto[]);
    },
  });
}

export function useUpdateContactStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContactSubmissionStatus }) =>
      updateContactStatus(id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CONTACT_SUBMISSIONS_QUERY_KEY });
    },
  });
}
