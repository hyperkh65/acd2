import { prisma } from "@/lib/prisma";
import { summarizeItem } from "@/lib/ai";
import {
  faviconFromDomain,
  getDomain,
  randomToken,
  toSlug
} from "@/lib/utils";

import type { ToolifyItem } from "@/lib/fetchers/toolify";
import {
  fetchToolifyModels,
  fetchToolifyNew
} from "@/lib/fetchers/toolify";

import { fetchFuturepediaRecent } from "@/lib/fetchers/futurepedia";

type SyncOptions = {
  maxNewItems?: number;
};

export async function runSync(
  options: SyncOptions = {}
): Promise<{ inserted: number }> {
  const maxNewItems = options.maxNewItems ?? 30;

  const candidates: ToolifyItem[] = [];

  // Toolify
  candidates.push(...(await fetchToolifyNew()));
  candidates.push(...(await fetchToolifyModels()));

  // Futurepedia (구조 호환됨)
  candidates.push(...(await fetchFuturepediaRecent()));

  let inserted = 0;

  for (const c of candidates.slice(0, maxNewItems)) {
    const domain = getDomain(c.url);
    if (!domain) continue;

    const exists = await prisma.item.findFirst({
      where: { url: c.url }
    });
    if (exists) continue;

    // 🔑 summarizeItem이 요구하는 입력 형태로 맞춘다
    const summary = await summarizeItem({
      type: "TOOL",
      name: c.name,
      url: c.url,
      rawText: c.description ?? c.name
    });

    await prisma.item.create({
      data: {
        id: randomToken(),
        name: c.name,
        slug: toSlug(c.name),
        url: c.url,
        domain,
        description: summary,
        logo: c.logo ?? faviconFromDomain(domain)
      }
    });

    inserted++;
  }

  return { inserted };
}
