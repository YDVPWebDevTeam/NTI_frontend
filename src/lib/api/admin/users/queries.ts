'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { adminQueryKeys } from '../admin-query-keys';
import { adminUsersService } from './service';
import type { UpdatableUserStatus } from './types';

type ChangeUserStatusInput = {
  id: string;
  status: UpdatableUserStatus;
};

export function useUsers() {
  return useQuery({
    queryKey: adminQueryKeys.users(),
    queryFn: () => adminUsersService.getUsers(),
  });
}

export function useChangeUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: ChangeUserStatusInput) =>
      adminUsersService.updateUserStatus(id, { status }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.users() });
    },
  });
}
