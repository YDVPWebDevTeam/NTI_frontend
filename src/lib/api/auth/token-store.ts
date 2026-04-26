const ACCESS_TOKEN_STORAGE_KEY = 'nti_access_token';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getAccessToken(): string | null {
  if (!isBrowser()) {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function setAccessToken(token: string | null | undefined): void {
  if (!isBrowser()) {
    return;
  }

  if (!token) {
    window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);

    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
}

export function clearAccessToken(): void {
  setAccessToken(null);
}
