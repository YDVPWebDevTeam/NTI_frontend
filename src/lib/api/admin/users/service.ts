import { api } from 'lib/api/base-client';

import { unwrapAdminData } from '../shared/response';
import { adminUsersEndpoints } from './endpoints';

import type { AdminUser, UpdateUserStatusRequest } from './types';

export const adminUsersService = {
  async getUsers() {
    const response = await api.get<AdminUser[] | { data: AdminUser[] }>(adminUsersEndpoints.users);

    return unwrapAdminData(response);
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
