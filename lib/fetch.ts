/** Shared client fetch helper: JSON + consistent error messages. */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (typeof body?.error?.message === 'string') message = body.error.message;
      else if (typeof body?.error === 'string') message = body.error;
    } catch {
      // keep generic message
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}
