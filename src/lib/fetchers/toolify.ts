import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";
import type { Element } from "domhandler";

export type ToolifyItem = {
  name: string;
  url: string;
  description?: string;
  logo?: string;
};

const BASE_URL = "https://www.toolify.ai";

/**
 * anchor 태그에서 툴 이름 추출
 */
function pickName($: CheerioAPI, a: Element): string {
  const $a = $(a);

  const title = ($a.attr("title") ?? "").trim();
  if (title) return title.slice(0, 80);

  const text = $a.text().trim();
  return text.slice(0, 80);
}

/**
 * Toolify 메인/카테고리 페이지 스캔
 */
export async function fetchToolify(): Promise<ToolifyItem[]> {
  const res = await fetch(BASE_URL, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (compatible; AidicBot/1.0; +https://aidic2.vercel.app)"
    },
    cache: "no-store"
  });

  if (!res.ok) {
    throw new Error(`Toolify fetch failed: ${res.status}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  const items: ToolifyItem[] = [];
  const seen = new Set<string>();

  $("a[href^='/tool/']").each((_, el) => {
    const a = el as Element;
    const href = $(a).attr("href");
    if (!href) return;

    const url = href.startsWith("http")
      ? href
      : `${BASE_URL}${href}`;

    if (seen.has(url)) return;
    seen.add(url);

    const name = pickName($, a);
    if (!name || name.length < 2) return;

    const logo =
      $(a).find("img").attr("src") ??
      $(a).find("img").attr("data-src");

    items.push({
      name,
      url,
      logo
    });
  });

  return items.slice(0, 100);
}
