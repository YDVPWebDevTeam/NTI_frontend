import type { ApiResponse } from './types';

export async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`http://localhost:3001/api/v1/${url}`, {
    headers: {
      'Content-type': 'application/json',
    },
    credentials: 'include',
    ...options,
  });

  const data: ApiResponse<T> = await res.json();

  if (!data.success) {
    throw new Error(data.message || 'Error occured, try again');
  }

  return data.data;
}
