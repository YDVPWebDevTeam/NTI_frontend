import type {
  AuthResponse,
  AuthUser,
  ConfirmEmailRequest,
  LoginRequest,
  RegisterRequest,
  ResendConfirmationEmailRequest,
} from './types';
import { baseClient } from '@/src/lib/api/base-client';

export function login(payload: LoginRequest): Promise<AuthResponse> {
  return baseClient<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function registerStudent(payload: RegisterRequest): Promise<AuthResponse | AuthUser> {
  return baseClient<AuthResponse | AuthUser>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function resendConfirmationEmail(
  payload: ResendConfirmationEmailRequest,
): Promise<{ message?: string } | void> {
  return baseClient<{ message?: string } | void>('/auth/resend-confirmation-email', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function confirmEmail(payload: ConfirmEmailRequest): Promise<AuthResponse | AuthUser> {
  return baseClient<AuthResponse | AuthUser>('/auth/confirm-email', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getCurrentUser(): Promise<AuthUser> {
  return baseClient<AuthUser>('/auth/me', {
    method: 'GET',
  });
}

export function logout(): Promise<{ success?: boolean } | void> {
  return baseClient<{ success?: boolean } | void>('/auth/logout', {
    method: 'POST',
  });
}
