import { buildPathWithId } from '../shared/path';

export const adminUsersEndpoints = {
  users: '/admin/users',
  userById: (id: string) => buildPathWithId('/admin/users', id),
  updateUserStatus: (id: string) => buildPathWithId('/admin/users', id) + '/status',
} as const;
