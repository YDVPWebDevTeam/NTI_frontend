'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  adminUpdateUserStatus,
  getAdminListUsersQueryKey,
  useAdminListUsers,
  type AdminListUsersParams,
  type AdminUpdateUserStatusMutationBody,
} from 'lib/api';

export type ChangeUserStatusInput = {
  id: string;
  status: AdminUpdateUserStatusMutationBody['status'];
};

export function useUsers(params?: AdminListUsersParams) {
  return useAdminListUsers(params, {
    query: {
      select: (response) => response.data,
    },
  });
}

export function useChangeUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: ChangeUserStatusInput) => adminUpdateUserStatus(id, { status }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
    },
  });
}
