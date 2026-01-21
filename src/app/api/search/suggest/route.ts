import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (!q || q.length < 2) return NextResponse.json({ ok: true, items: [] });

  const items = await prisma.item.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { tags: { has: q } },
        { category: { contains: q, mode: "insensitive" } },
        { provider: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { slug: true, name: true, type: true },
    take: 10,
  });

  return NextResponse.json({ ok: true, items });
}
