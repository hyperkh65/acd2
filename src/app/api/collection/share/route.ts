import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomToken } from "@/lib/utils";
import { z } from "zod";

export const runtime = "nodejs";

const BodySchema = z.object({
  title: z.string().min(1).max(60),
  note: z.string().max(200).optional(),
  slugs: z.array(z.string().min(1).max(120)).min(1).max(100),
});

export async function POST(req: Request) {
  const body = BodySchema.parse(await req.json().catch(() => ({})));

  const token = randomToken(14);
  const items = await prisma.item.findMany({
    where: { slug: { in: body.slugs } },
    select: { id: true },
  });

  const share = await prisma.collectionShare.create({
    data: {
      token,
      title: body.title,
      note: body.note ?? null,
      items: {
        create: items.map((it, idx) => ({ itemId: it.id, order: idx })),
      },
    },
    select: { token: true },
  });

  return NextResponse.json({ ok: true, token: share.token });
}
