import { NextResponse } from "next/server";
import { parseNaturalQuery } from "@/lib/ai";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (!q || q.length < 3) return NextResponse.json({ ok: true, items: [] });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ ok: false, error: "OPENAI_API_KEY missing" }, { status: 500 });
  }

  const parsed = await parseNaturalQuery(q);

  const where: any = {};
  if (parsed.type === "TOOL") where.type = "TOOL";
  if (parsed.type === "MODEL") where.type = "MODEL";
  if (parsed.category !== "ANY") where.category = parsed.category;
  if (parsed.pricing !== "ANY") where.pricing = parsed.pricing;
  if (typeof parsed.supportsKorean === "boolean") where.supportsKorean = parsed.supportsKorean;
  if (typeof parsed.hasApi === "boolean") where.hasApi = parsed.hasApi;
  if (typeof parsed.openWeights === "boolean") where.openWeights = parsed.openWeights;
  if (typeof parsed.localRun === "boolean") where.localRun = parsed.localRun;

  if (parsed.tags?.length) {
    where.tags = { hasSome: parsed.tags.slice(0, 6) };
  }

  if (parsed.keywords) {
    where.OR = [
      { name: { contains: parsed.keywords, mode: "insensitive" } },
      { summary: { contains: parsed.keywords, mode: "insensitive" } },
    ];
  }

  const items = await prisma.item.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 30,
    select: { slug: true, name: true, type: true, oneLine: true, category: true, pricing: true },
  });

  return NextResponse.json({ ok: true, parsed, items });
}
