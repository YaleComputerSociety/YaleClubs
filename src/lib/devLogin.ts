const MAX_REDIRECT_LENGTH = 2048;
const LOCAL_DEV_FALLBACK_ORIGIN = "http://localhost:3000";
const NETID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{1,31}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+$/;
const ROLE_PATTERN = /^[A-Za-z0-9_-]{1,32}$/;

export function isLocalDevHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

/** Sign-in link. On localhost the server turns this into a dev session instead of Yale CAS. */
export function casSignInHref(returnPath = "/"): string {
  const path = safeAppPath(returnPath);
  return path === "/" ? "/api/auth/redirect" : `/api/auth/redirect?from=${encodeURIComponent(path)}`;
}

/** The role is never read from the request: a stored role always wins, then USER_ROLE. */
export function resolveDevLoginIdentity(input: {
  netid?: string | null | undefined;
  email?: string | null | undefined;
  envNetid?: string | null | undefined;
  envEmail?: string | null | undefined;
  envRole?: string | null | undefined;
}): { netid: string; email: string; role: string } {
  const netid = firstMatch(NETID_PATTERN, input.netid, input.envNetid) ?? "devuser";
  const email = firstMatch(EMAIL_PATTERN, input.email, input.envEmail) ?? `${netid}@yale.edu`;
  const role = firstMatch(ROLE_PATTERN, input.envRole) ?? "user";
  return { netid, email, role };
}

/**
 * Where dev login should land. A missing target stays on the local origin that
 * served the request, so `/api/auth/dev-login` needs no `?redirect=` query.
 * Only same-app paths and localhost URLs are accepted.
 */
export function resolveDevLoginRedirect(input: {
  redirectParam?: string | null | undefined;
  requestOrigin: string;
  baseUrl?: string | null | undefined;
}): string {
  const fallback = `${fallbackOrigin(input.requestOrigin, input.baseUrl)}/`;
  const raw = input.redirectParam?.trim() ?? "";
  if (!raw || raw.length > MAX_REDIRECT_LENGTH || hasUnsafeChars(raw)) return fallback;

  if (raw.startsWith("/") && !raw.startsWith("//")) {
    const origin = fallbackOrigin(input.requestOrigin, input.baseUrl);
    try {
      const target = new URL(raw, origin);
      if (target.origin !== origin) return fallback;
      return `${target.origin}${target.pathname}${target.search}${target.hash}`;
    } catch {
      return fallback;
    }
  }

  try {
    const target = new URL(raw);
    if (target.username || target.password) return fallback;
    if (target.protocol !== "http:" && target.protocol !== "https:") return fallback;
    if (!isLocalDevHostname(target.hostname)) return fallback;
    return target.toString();
  } catch {
    return fallback;
  }
}

function fallbackOrigin(requestOrigin: string, baseUrl?: string | null): string {
  const request = originIfLocal(requestOrigin);
  if (request) return request;
  const configured = originIfLocal(baseUrl);
  if (configured) return configured;
  return LOCAL_DEV_FALLBACK_ORIGIN;
}

function originIfLocal(value?: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (!isLocalDevHostname(url.hostname)) return null;
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

function safeAppPath(from: string): string {
  const trimmed = from.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || hasUnsafeChars(trimmed)) return "/";
  return trimmed;
}

function firstMatch(pattern: RegExp, ...values: Array<string | null | undefined>): string | undefined {
  for (const value of values) {
    const trimmed = value?.trim() ?? "";
    if (trimmed.length <= 254 && pattern.test(trimmed)) return trimmed;
  }
  return undefined;
}

function hasUnsafeChars(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code <= 0x20 || code === 0x5c) return true;
  }
  return false;
}
