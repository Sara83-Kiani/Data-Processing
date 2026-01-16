type ApiError = {
  message?: string | string[];
};

const API_BASE_URL =
  (import.meta as any)?.env?.VITE_API_BASE_URL ??
  'http://localhost:3000';

function extractErrorMessage(data: ApiError | unknown): string {
  if (!data || typeof data !== 'object') return 'Something went wrong.';
  const msg = (data as ApiError).message;

  if (Array.isArray(msg)) return msg.join(', ');
  if (typeof msg === 'string') return msg;
  return 'Something went wrong.';
}

function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

export async function authedFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as any),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('activeProfile');
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) {
    throw new Error(extractErrorMessage(data));
  }

  return data as T;
}
