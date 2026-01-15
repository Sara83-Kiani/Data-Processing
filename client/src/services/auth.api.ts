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

export async function registerUser(
  email: string,
  password: string,
  invitationCode?: string,
): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, invitationCode }),
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

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(extractErrorMessage(data));
  }

  return data;
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(extractErrorMessage(data));
  }

  return data;
}
