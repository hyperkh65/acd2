import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import { prisma } from "@/lib/prisma";
import { ItemCard } from "@/components/ItemCard";

export const dynamic = "force-dynamic";

export default async function SharedCollectionPage({ params }: { params: { token: string } }) {
  const share = await prisma.collectionShare.findUnique({
    where: { token: params.token },
    include: { items: { include: { item: true }, orderBy: { order: "asc" } } },
  });
  if (!share) return notFound();

  return (
    <main>
      <Container>
        <Link href="/" className="text-zinc-300 hover:text-white">← Back</Link>
        <h1 className="mt-6 text-2xl font-bold">{share.title}</h1>
        {share.note ? <p className="mt-2 text-zinc-300">{share.note}</p> : null}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {share.items.map((x) => (
            <ItemCard
              key={x.item.slug}
              item={{
                slug: x.item.slug,
                name: x.item.name,
                type: x.item.type as any,
                faviconUrl: x.item.faviconUrl,
                oneLine: x.item.oneLine,
                summary: x.item.summary,
                tags: x.item.tags,
                pricing: x.item.pricing,
                supportsKorean: x.item.supportsKorean,
                hasApi: x.item.hasApi,
              }}
            />
          ))}
        </div>
      </Container>
    </main>
  );
}
