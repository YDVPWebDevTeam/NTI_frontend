'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { orvalMutator } from 'lib/api-client/openapi-runtime/runtime';

/* ─── Types (mirror backend DTOs) ────────────────────────── */

export type UniversityEmailDomainStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type UniversityEmailDomain = {
  id: string;
  domain: string;
  status: UniversityEmailDomainStatus;
  requestedById?: string | null;
  reviewedById?: string | null;
  requestNote?: string | null;
  reviewNote?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApprovedUniversityEmailDomain = {
  domain: string;
};

export type CheckUniversityEmailDomainResponse = {
  domain: string;
  isUniversityDomain: boolean;
};

export type RequestUniversityEmailDomainPayload = {
  email: string;
  note?: string;
};

/* ─── Query keys ──────────────────────────────────────────── */

export const APPROVED_UNIVERSITY_DOMAINS_QUERY_KEY = ['/university-email-domains'] as const;
export const ADMIN_UNIVERSITY_DOMAINS_QUERY_KEY = ['/admin/university-email-domains'] as const;

export function checkUniversityEmailDomainQueryKey(email: string) {
  return ['/university-email-domains/check', email] as const;
}

// eslint-disable-next-line no-magic-numbers -- 5 minutes in milliseconds
const CHECK_DOMAIN_STALE_TIME_MS = 5 * 60 * 1000;

/* ─── Raw calls (generated style) ─────────────────────────── */

export function listApprovedUniversityEmailDomains() {
  return orvalMutator<ApprovedUniversityEmailDomain[]>(
    { url: '/university-email-domains', method: 'GET' },
    undefined,
  );
}

export function checkUniversityEmailDomain(email: string) {
  return orvalMutator<CheckUniversityEmailDomainResponse>(
    { url: '/university-email-domains/check', method: 'GET', params: { email } },
    undefined,
  );
}

export function requestUniversityEmailDomain(payload: RequestUniversityEmailDomainPayload) {
  return orvalMutator<UniversityEmailDomain>(
    {
      url: '/university-email-domains/requests',
      method: 'POST',
      data: payload,
      headers: { 'Content-Type': 'application/json' },
    },
    undefined,
  );
}

export function listUniversityEmailDomains(status?: UniversityEmailDomainStatus) {
  return orvalMutator<UniversityEmailDomain[]>(
    {
      url: '/admin/university-email-domains',
      method: 'GET',
      params: status ? { status } : undefined,
    },
    undefined,
  );
}

export function createUniversityEmailDomain(domain: string) {
  return orvalMutator<UniversityEmailDomain>(
    {
      url: '/admin/university-email-domains',
      method: 'POST',
      data: { domain },
      headers: { 'Content-Type': 'application/json' },
    },
    undefined,
  );
}

export function approveUniversityEmailDomain(id: string) {
  return orvalMutator<UniversityEmailDomain>(
    { url: `/admin/university-email-domains/${id}/approve`, method: 'POST' },
    undefined,
  );
}

export function rejectUniversityEmailDomain(id: string, reason: string) {
  return orvalMutator<UniversityEmailDomain>(
    {
      url: `/admin/university-email-domains/${id}/reject`,
      method: 'POST',
      data: { reason },
      headers: { 'Content-Type': 'application/json' },
    },
    undefined,
  );
}

export function deleteUniversityEmailDomain(id: string) {
  return orvalMutator<void>(
    { url: `/admin/university-email-domains/${id}`, method: 'DELETE' },
    undefined,
  );
}

/* ─── React Query hooks ───────────────────────────────────── */

/** Checks a single email against the approved domain list (used for the registration warning). */
export function useCheckUniversityEmailDomain(email: string, enabled: boolean) {
  return useQuery({
    queryKey: checkUniversityEmailDomainQueryKey(email),
    queryFn: () => checkUniversityEmailDomain(email),
    enabled: enabled && email.trim().length > 0,
    staleTime: CHECK_DOMAIN_STALE_TIME_MS,
  });
}

export function useRequestUniversityEmailDomain() {
  return useMutation({
    mutationFn: (payload: RequestUniversityEmailDomainPayload) =>
      requestUniversityEmailDomain(payload),
  });
}

export function useUniversityEmailDomains(status?: UniversityEmailDomainStatus) {
  return useQuery({
    queryKey: [...ADMIN_UNIVERSITY_DOMAINS_QUERY_KEY, status ?? 'ALL'],
    queryFn: () => listUniversityEmailDomains(status),
  });
}

export function useCreateUniversityEmailDomain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (domain: string) => createUniversityEmailDomain(domain),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_UNIVERSITY_DOMAINS_QUERY_KEY });
    },
  });
}

export function useApproveUniversityEmailDomain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approveUniversityEmailDomain(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_UNIVERSITY_DOMAINS_QUERY_KEY });
    },
  });
}

export function useRejectUniversityEmailDomain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectUniversityEmailDomain(id, reason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_UNIVERSITY_DOMAINS_QUERY_KEY });
    },
  });
}

export function useDeleteUniversityEmailDomain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUniversityEmailDomain(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_UNIVERSITY_DOMAINS_QUERY_KEY });
    },
  });
}
