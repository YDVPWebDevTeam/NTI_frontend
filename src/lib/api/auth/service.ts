import { api } from 'lib/api/base-client';

import { authEndpoints } from './endpoints';
import { clearAccessToken, setAccessToken } from './token-store';
import type {
  AuthResponse,
  AuthUser,
  ConfirmEmailRequest,
  LoginRequest,
  RegisterRequest,
  ResendConfirmationEmailRequest,
} from './types';

function persistAccessToken(response: AuthResponse | AuthUser): AuthResponse | AuthUser {
  if ('accessToken' in response) {
    setAccessToken(response.accessToken);
  }

  return response;
}

export const authService = {
  async login(payload: LoginRequest) {
    const response = await api.post<AuthResponse, LoginRequest>(authEndpoints.login, payload);

    return persistAccessToken(response);
  },

  async registerStudent(payload: RegisterRequest) {
    const response = await api.post<AuthResponse | AuthUser, RegisterRequest>(
      authEndpoints.registerStudent,
      payload,
    );

    return persistAccessToken(response);
  },

  resendConfirmationEmail(payload: ResendConfirmationEmailRequest) {
    return api.post<{ message?: string } | void, ResendConfirmationEmailRequest>(
      authEndpoints.resendConfirmationEmail,
      payload,
    );
  },

  async confirmEmail(payload: ConfirmEmailRequest) {
    const response = await api.post<AuthResponse | AuthUser, ConfirmEmailRequest>(
      authEndpoints.confirmEmail,
      payload,
    );

    return persistAccessToken(response);
  },

  getCurrentUser() {
    return api.get<AuthUser>(authEndpoints.me);
  },

  async refresh() {
    const response = await api.post<AuthResponse | AuthUser>(authEndpoints.refresh);

    return persistAccessToken(response);
  },

  async logout() {
    try {
      return await api.post<{ success?: boolean } | void>(authEndpoints.logout);
    } finally {
      clearAccessToken();
    }
  },
};
