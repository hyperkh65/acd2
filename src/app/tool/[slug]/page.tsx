import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/Badge";

export const dynamic = "force-dynamic";

async function getAlternatives(item: any) {
  // simple alternative 추천: same category + overlapping tags
  const tags = item.tags ?? [];
  const candidates = await prisma.item.findMany({
    where: {
      id: { not: item.id },
      type: item.type,
      OR: [
        { category: item.category ?? undefined },
        { tags: { hasSome: tags.slice(0, 5) } },
      ],
    },
    take: 8,
    orderBy: { createdAt: "desc" },
    select: { slug: true, name: true, oneLine: true, pricing: true, supportsKorean: true, hasApi: true, tags: true, type: true },
  });
  return candidates.slice(0, 4);
}

function clientScript(slug: string) {
  return `
    (function(){
      const slug=${JSON.stringify(slug)};
      fetch('/api/event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'VIEW',slug})}).catch(()=>{});
      window.__aidicSave=function(){
        const key='aidic_saved';
        const raw=localStorage.getItem(key);
        const arr=raw?JSON.parse(raw):[];
        if(!arr.includes(slug)) arr.push(slug);
        localStorage.setItem(key,JSON.stringify(arr));
        fetch('/api/event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'SAVE',slug})}).catch(()=>{});
        alert('저장 완료!');
      }
      window.__aidicOutbound=function(){
        fetch('/api/event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'OUTBOUND',slug})}).catch(()=>{});
      }
    })();
  `;
}

export default async function DetailPage({ params }: { params: { slug: string } }) {
  const item = await prisma.item.findUnique({ where: { slug: params.slug } });
  if (!item) return notFound();

  const alternatives = await getAlternatives(item);

  return (
    <main>
      <Container>
        <Link href="/" className="text-zinc-300 hover:text-white">← Back</Link>

        <div className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="flex items-center gap-4">
            <img src={item.faviconUrl ?? ""} alt="" className="h-12 w-12 rounded-xl" />
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold">{item.name}</h1>
              <p className="mt-1 text-sm text-zinc-300">{item.oneLine ?? ""}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {item.category ? <Badge>{item.category}</Badge> : null}
                {item.pricing ? <Badge>{item.pricing}</Badge> : null}
                {item.supportsKorean ? <Badge>KR</Badge> : null}
                {item.hasApi ? <Badge>API</Badge> : null}
                {item.openWeights ? <Badge>Open</Badge> : null}
                {item.localRun ? <Badge>Local</Badge> : null}
              </div>
            </div>
          </div>

          {item.summary ? (
            <p className="mt-5 text-zinc-200">{item.summary}</p>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            {(item.tags ?? []).map((t) => <Badge key={t}>{t}</Badge>)}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              onClick={() => (globalThis as any).__aidicOutbound?.()}
              className="rounded-2xl bg-white px-5 py-3 text-center font-semibold text-zinc-900 hover:bg-zinc-200"
            >
              사이트로 이동
            </a>

            <button
              onClick={() => (globalThis as any).__aidicSave?.()}
              className="rounded-2xl border border-zinc-700 px-5 py-3 text-zinc-200 hover:border-zinc-500"
            >
              ⭐ 저장하기
            </button>
          </div>

          {alternatives.length ? (
            <div className="mt-10">
              <h2 className="text-lg font-semibold">대체 추천 (비교)</h2>
              <div className="mt-4 overflow-x-auto rounded-2xl border border-zinc-800">
                <table className="min-w-full text-sm">
                  <thead className="bg-zinc-900">
                    <tr>
                      <th className="px-4 py-3 text-left">이름</th>
                      <th className="px-4 py-3 text-left">요약</th>
                      <th className="px-4 py-3 text-left">가격</th>
                      <th className="px-4 py-3 text-left">KR</th>
                      <th className="px-4 py-3 text-left">API</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alternatives.map((a) => (
                      <tr key={a.slug} className="border-t border-zinc-800">
                        <td className="px-4 py-3">
                          <Link href={`/${a.type === "MODEL" ? "model" : "tool"}/${a.slug}`} className="hover:underline">
                            {a.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-zinc-300">{a.oneLine ?? ""}</td>
                        <td className="px-4 py-3">{a.pricing ?? ""}</td>
                        <td className="px-4 py-3">{a.supportsKorean ? "✓" : ""}</td>
                        <td className="px-4 py-3">{a.hasApi ? "✓" : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>

        <script dangerouslySetInnerHTML={{ __html: clientScript(item.slug) }} />
      </Container>
    </main>
  );
}
