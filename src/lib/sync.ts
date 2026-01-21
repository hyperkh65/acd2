import { prisma } from "@/lib/prisma";
import { summarizeItem } from "@/lib/ai";
import { faviconFromDomain, getDomain, randomToken, toSlug } from "@/lib/utils";
import type { Candidate as ToolifyCandidate } from "@/lib/fetchers/toolify";
import { fetchToolifyModels, fetchToolifyNew } from "@/lib/fetchers/toolify";
import { fetchFuturepediaRecent } from "@/lib/fetchers/futurepedia";

type Candidate = ToolifyCandidate;

async function enrichCandidate(c: Candidate) {
  // Lightweight enrichment: fetch page meta if possible (optional)
  // For speed and stability, we rely on AI summarization using basic text.
  return c;
}

async function uniqueSlug(name: string) {
  const base = toSlug(name);
  const exists = await prisma.item.findFirst({ where: { slug: base } });
  if (!exists) return base;
  return `${base}-${randomToken(4).toLowerCase()}`;
}

export async function runSync(opts: { maxNewItems: number }) {
  const candidates: Candidate[] = [];
  candidates.push(...(await fetchToolifyNew(50)));
  candidates.push(...(await fetchToolifyModels(50)));

  // Optional additional source (can be noisy; keep small)
  try {
    const fp = await fetchFuturepediaRecent(10);
    candidates.push(...fp.map(x => ({...x, source:"futurepedia"} as any)));
  } catch {}

  // dedupe by URL
  const uniq = new Map<string, Candidate>();
  for (const c of candidates) {
    if (!c.url) continue;
    if (!uniq.has(c.url)) uniq.set(c.url, c);
  }

  let created = 0;
  const createdItems: any[] = [];
  const scanned = uniq.size;

  for (const c of uniq.values()) {
    if (created >= opts.maxNewItems) break;

    const exists = await prisma.item.findUnique({ where: { url: c.url } });
    if (exists) {
      await prisma.item.update({
        where: { id: exists.id },
        data: { lastSeenAt: new Date() },
      });
      continue;
    }

    const domain = getDomain(c.url);
    if (!domain) continue;

    const enriched = await enrichCandidate(c);
    const ai = await summarizeItem({
      type: c.type,
      name: enriched.name,
      url: enriched.url,
      rawText: enriched.rawText,
    });

    const item = await prisma.item.create({
      data: {
        type: c.type,
        name: enriched.name,
        slug: await uniqueSlug(enriched.name),
        url: enriched.url,
        domain,
        faviconUrl: faviconFromDomain(domain),
        oneLine: ai.oneLine,
        summary: ai.summary,
        tags: ai.tags,
        category: ai.category,
        pricing: ai.pricing,
        supportsKorean: ai.supportsKorean ?? false,
        hasApi: ai.hasApi ?? false,
        requiresLogin: ai.requiresLogin ?? false,
        provider: ai.provider ?? null,
        modality: ai.modality ?? null,
        openWeights: ai.openWeights ?? false,
        localRun: ai.localRun ?? false,
        source: enriched.source,
        sourceUrl: enriched.sourceUrl,
      },
    });

    created++;
    createdItems.push(item);
  }

  return { ok: true, scanned, created, createdItems };
}
