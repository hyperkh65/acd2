import { XMLParser } from "fast-xml-parser";

export type Candidate = {
  type: "TOOL" | "MODEL";
  name: string;
  url: string;
  rawText: string;
  source: string;
  sourceUrl: string;
};

function decodeHtml(s: string) {
  return s
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

async function fetchMetaQuick(url: string) {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) return null;
  const html = await r.text();

  const title =
    html.match(/<title>(.*?)<\/title>/i)?.[1]?.trim() ??
    html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1]?.trim() ??
    "Unknown";

  const desc =
    html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1]?.trim() ??
    html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)?.[1]?.trim() ??
    "";

  const t = decodeHtml(title).slice(0, 80);
  const d = decodeHtml(desc).slice(0, 600);
  if (!d) return null;
  return { title: t, description: d };
}

export async function fetchFuturepediaRecent(limit = 30): Promise<Candidate[]> {
  const sourceUrl = "https://www.futurepedia.io/sitemap.xml";
  const r = await fetch(sourceUrl, { cache: "no-store" });
  if (!r.ok) return [];
  const xml = await r.text();
  const parser = new XMLParser({ ignoreAttributes: false });
  const data = parser.parse(xml);

  const urls: { loc: string }[] = [];
  const arr = data?.urlset?.url ? (Array.isArray(data.urlset.url) ? data.urlset.url : [data.urlset.url]) : [];
  for (const u of arr) {
    if (u.loc && String(u.loc).includes("futurepedia.io")) urls.push({ loc: String(u.loc) });
  }

  const chosen = urls.slice(0, limit);
  const items: Candidate[] = [];
  for (const u of chosen) {
    const meta = await fetchMetaQuick(u.loc);
    if (!meta) continue;
    items.push({
      type: "TOOL",
      name: meta.title,
      url: u.loc,
      rawText: meta.description,
      source: "futurepedia",
      sourceUrl,
    });
  }
  return items;
}
