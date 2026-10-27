// Small helpers shared by the Pages Functions.

export const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });

export const bad = (error: string, status = 400) => json({ error }, status);

/** Parse a JSON body, returning null on anything that isn't a JSON object. */
export async function readJson<T = Record<string, unknown>>(request: Request): Promise<T | null> {
  try {
    const data = await request.json();
    return data && typeof data === 'object' ? (data as T) : null;
  } catch {
    return null;
  }
}

/** The site origin for redirect URLs: SITE_URL secret, else the request's own origin. */
export function siteOrigin(request: Request, env: { SITE_URL?: string }): string {
  return (env.SITE_URL || new URL(request.url).origin).replace(/\/$/, '');
}

export function clientIp(request: Request): string {
  return request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
}

/** Verify a Cloudflare Turnstile token. Skipped (returns true) when no secret is configured. */
export async function verifyTurnstile(token: string | undefined, secret: string | undefined, ip: string): Promise<boolean> {
  if (!secret) return true;
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token, remoteip: ip });
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const data = (await res.json().catch(() => ({}))) as { success?: boolean };
  return data.success === true;
}
