export const DEFAULT_AVATAR =
  "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg";
// TODO: self-host to /public/default-avatar.png and update next.config remotePatterns.

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (typeof body?.error?.message === "string") message = body.error.message;
      else if (typeof body?.error === "string") message = body.error;
    } catch {
      // keep generic message
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}
