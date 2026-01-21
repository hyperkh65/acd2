export function toSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function faviconFromDomain(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}


export function normalizeUrl(url: string) {
  try {
    const u = new URL(url);
    // strip tracking params
    u.searchParams.delete("ref");
    u.searchParams.delete("utm_source");
    u.searchParams.delete("utm_medium");
    u.searchParams.delete("utm_campaign");
    u.searchParams.delete("utm_content");
    u.searchParams.delete("utm_term");
    u.hash = "";
    // remove trailing slash (except root)
    const p = u.pathname;
    if (p.length > 1 && p.endsWith("/")) u.pathname = p.slice(0, -1);
    return u.toString();
  } catch {
    return url;
  }
}
export function safeJson<T>(value: unknown, fallback: T): T {
  try {
    return value as T;
  } catch {
    return fallback;
  }
}

export function randomToken(len = 16) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}
