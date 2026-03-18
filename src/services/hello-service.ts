// Example service — replace with real API base URL and endpoints.

export async function fetchHello() {
  const res = await fetch('/api/hello');

  if (!res.ok) throw new Error('Failed to fetch hello');

  const data: unknown = await res.json();

  return data;
}
