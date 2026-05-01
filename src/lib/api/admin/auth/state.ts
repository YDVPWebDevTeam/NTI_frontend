const ADMIN_PASSWORD_CHANGE_STORAGE_KEY = 'nti.admin.requires-password-change';

function getAdminAuthStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

export function getStoredAdminPasswordChangeRequired() {
  return getAdminAuthStorage()?.getItem(ADMIN_PASSWORD_CHANGE_STORAGE_KEY) === 'true';
}

export function setStoredAdminPasswordChangeRequired(required: boolean) {
  const storage = getAdminAuthStorage();

  if (!storage) {
    return;
  }

  if (required) {
    storage.setItem(ADMIN_PASSWORD_CHANGE_STORAGE_KEY, 'true');

    return;
  }

  storage.removeItem(ADMIN_PASSWORD_CHANGE_STORAGE_KEY);
}
