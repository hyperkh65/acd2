import Link from "next/link";
import Container from "@/components/Container";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function WorkflowsPage() {
  const workflows = await prisma.workflow.findMany({
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  return (
    <main>
      <Container>
        <Link href="/" className="text-zinc-300 hover:text-white">← Back</Link>
        <h1 className="mt-6 text-2xl font-bold">Workflows</h1>
        <p className="mt-2 text-zinc-300">툴 조합 레시피를 저장해두세요.</p>

        <div className="mt-6 space-y-3">
          {workflows.length === 0 ? (
            <div className="text-zinc-400">
              아직 워크플로우가 없습니다. Admin에서 시드 데이터를 넣을 수 있어요.
            </div>
          ) : (
            workflows.map((wf) => (
              <Link
                key={wf.slug}
                href={`/workflows/${wf.slug}`}
                className="block rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 hover:border-zinc-600"
              >
                <div className="font-semibold">{wf.title}</div>
                <div className="text-sm text-zinc-300">{wf.summary}</div>
              </Link>
            ))
          )}
        </div>
      </Container>
    </main>
  );
}
