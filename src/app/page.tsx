import { prisma } from "@/lib/prisma";
import { ItemCard } from "@/components/ItemCard";

async function getTrending() {
  // 최근 24시간 기준
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const events = await prisma.event.groupBy({
    by: ["itemId", "type"],
    where: {
      createdAt: { gte: since },
      itemId: { not: null }
    },
    _count: {
      itemId: true
    },
    orderBy: {
      _count: {
        itemId: "desc"
      }
    },
    take: 50
  });

  const ids = events
    .map((e) => e.itemId)
    .filter((id): id is string => Boolean(id));

  if (ids.length === 0) return [];

  const items = await prisma.item.findMany({
    where: {
      id: { in: ids }
    }
  });

  // 이벤트 count 기준으로 정렬 유지
  const map = new Map(items.map((i) => [i.id, i]));
  return ids.map((id) => map.get(id)).filter(Boolean);
}

export default async function Home() {
  const now = new Date();
  const new72 = new Date(now.getTime() - 72 * 60 * 60 * 1000);

  const [latest, newly, trending] = await Promise.all([
    prisma.item.findMany({
      orderBy: { createdAt: "desc" },
      take: 20
    }),
    prisma.item.findMany({
      where: { createdAt: { gte: new72 } },
      orderBy: { createdAt: "desc" },
      take: 20
    }),
    getTrending()
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 space-y-12">
      <section>
        <h2 className="text-xl font-bold mb-4">🔥 Trending</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {trending.map((item) =>
            item ? <ItemCard key={item.id} item={item} /> : null
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">🆕 New (72h)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {newly.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">📦 Latest</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {latest.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
