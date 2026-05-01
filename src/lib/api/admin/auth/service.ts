import { api } from 'lib/api/base-client';

import { authEndpoints } from './endpoints';

import type {
  AdminLoginRequest,
  AdminLoginResponse,
  AuthSessionResponse,
  ForceChangePasswordRequest,
  LogoutResponse,
} from './types';

export const authService = {
  loginAdmin(payload: AdminLoginRequest) {
    return api.post<AdminLoginResponse, AdminLoginRequest>(authEndpoints.loginAdmin, payload);
  },

  forceChangePassword(payload: ForceChangePasswordRequest) {
    return api.post<AuthSessionResponse, ForceChangePasswordRequest>(
      authEndpoints.forceChangePassword,
      payload,
    );
  },

  refresh() {
    return api.post<AuthSessionResponse>(authEndpoints.refresh);
  },

  logout() {
    return api.post<LogoutResponse>(authEndpoints.logout);
  },
};
