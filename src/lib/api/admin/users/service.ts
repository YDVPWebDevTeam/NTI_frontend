import { api } from 'lib/api/base-client';

import { adminUsersEndpoints } from './endpoints';

import type { AdminUser, UpdateUserStatusRequest } from './types';

export const adminUsersService = {
  getUsers() {
    return api.get<AdminUser[]>(adminUsersEndpoints.users);
  },

  getUserById(id: string) {
    return api.get<AdminUser>(adminUsersEndpoints.userById(id));
  },

  updateUserStatus(id: string, payload: UpdateUserStatusRequest) {
    return api.patch<AdminUser, UpdateUserStatusRequest>(
      adminUsersEndpoints.updateUserStatus(id),
      payload,
    );
  },
};
