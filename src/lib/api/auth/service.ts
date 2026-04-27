import { api } from 'lib/api/base-client';

import { authEndpoints } from './endpoints';
import type {
  AuthResponse,
  AuthUser,
  ConfirmEmailRequest,
  LoginRequest,
  RegisterRequest,
  ResendConfirmationEmailRequest,
} from './types';

export const authService = {
  login(payload: LoginRequest) {
    return api.post<AuthResponse, LoginRequest>(authEndpoints.login, payload);
  },

  registerStudent(payload: RegisterRequest) {
    return api.post<AuthResponse | AuthUser, RegisterRequest>(
      authEndpoints.registerStudent,
      payload,
    );
  },

  resendConfirmationEmail(payload: ResendConfirmationEmailRequest) {
    return api.post<{ message?: string } | void, ResendConfirmationEmailRequest>(
      authEndpoints.resendConfirmationEmail,
      payload,
    );
  },

  confirmEmail(payload: ConfirmEmailRequest) {
    return api.post<AuthResponse | AuthUser, ConfirmEmailRequest>(
      authEndpoints.confirmEmail,
      payload,
    );
  },

  getCurrentUser() {
    return api.get<AuthUser>(authEndpoints.me);
  },

  refresh() {
    return api.post<AuthResponse | AuthUser>(authEndpoints.refresh);
  },

  logout() {
    return api.post<{ success?: boolean } | void>(authEndpoints.logout);
  },
};
