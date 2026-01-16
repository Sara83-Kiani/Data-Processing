const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000';

function getToken() {
  return localStorage.getItem('accessToken');
}

export async function apiFetch<T>(
  path: string,
  opts: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    ...(opts.headers as any),
    'Content-Type': 'application/json',
  };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });

  const text = await res.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    throw new Error(data?.message ?? `Request failed: ${res.status}`);
  }

  return data as T;
}
