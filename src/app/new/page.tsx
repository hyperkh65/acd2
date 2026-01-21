import Container from "@/components/Container";
import { prisma } from "@/lib/prisma";
import { ItemCard } from "@/components/ItemCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewPage() {
  const since = new Date(Date.now() - 72 * 60 * 60 * 1000);
  const items = await prisma.item.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    take: 90,
    select: { slug: true, name: true, type: true, faviconUrl: true, oneLine: true, summary: true, tags: true, pricing: true, supportsKorean: true, hasApi: true },
  });

  return (
    <main>
      <Container>
        <Link href="/" className="text-zinc-300 hover:text-white">← Back</Link>
        <h1 className="mt-6 text-2xl font-bold">NEW (72h)</h1>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => <ItemCard key={t.slug} item={t as any} />)}
        </div>
      </Container>
    </main>
  );
}
