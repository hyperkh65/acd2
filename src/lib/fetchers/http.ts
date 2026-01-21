export async function fetchHtml(url: string, timeoutMs = 12000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const r = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; AidicBot/1.0; +https://ai.2days.kr)",
        "accept-language": "en-US,en;q=0.9,ko;q=0.8",
      },
    });

    if (!r.ok) return null;
    return await r.text();
  } catch {
    return null;
  } finally {
    clearTimeout(id);
  }
}
