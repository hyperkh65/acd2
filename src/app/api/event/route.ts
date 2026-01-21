import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const BodySchema = z.object({
  type: z.enum(["VIEW", "SAVE", "OUTBOUND", "SHARE"]),
  slug: z.string().optional(),
  ref: z.string().optional(),
  meta: z.any().optional(),
});

export async function POST(req: Request) {
  const body = BodySchema.parse(await req.json().catch(() => ({})));
  const ua = req.headers.get("user-agent") ?? undefined;

  let itemId: string | undefined = undefined;
  if (body.slug) {
    const item = await prisma.item.findUnique({ where: { slug: body.slug }, select: { id: true } });
    itemId = item?.id;
  }

  await prisma.event.create({
    data: {
      type: body.type as any,
      itemId: itemId ?? null,
      ua,
      ref: body.ref ?? null,
      meta: body.meta ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}
