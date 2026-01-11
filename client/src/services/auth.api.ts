// client/src/services/authService.ts

type ApiError = {
  message?: string | string[];
};

const API_BASE_URL =
  // Vite style (recommended): set VITE_API_BASE_URL in client .env if you want
  (import.meta as any)?.env?.VITE_API_BASE_URL ??
  // fallback to your docker mapped API port
  'http://localhost:3000';

function extractErrorMessage(data: ApiError | unknown): string {
  if (!data || typeof data !== 'object') return 'Something went wrong.';
  const msg = (data as ApiError).message;

  if (Array.isArray(msg)) return msg.join(', ');
  if (typeof msg === 'string') return msg;
  return 'Something went wrong.';
}

export async function registerUser(email: string, password: string): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(extractErrorMessage(data));
  }

  return (data?.message as string) ?? 'Registered successfully.';
}

export async function loginUser(email: string, password: string): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(extractErrorMessage(data));
  }

  const token = (data as any)?.accessToken;
  if (!token) throw new Error('No access token returned from server.');

  return token;
}
