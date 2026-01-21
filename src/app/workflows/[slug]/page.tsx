import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function WorkflowDetail({ params }: { params: { slug: string } }) {
  const wf = await prisma.workflow.findUnique({ where: { slug: params.slug } });
  if (!wf) return notFound();

  const steps = Array.isArray(wf.steps) ? wf.steps : (wf.steps as any)?.steps ?? wf.steps;

  return (
    <main>
      <Container>
        <Link href="/workflows" className="text-zinc-300 hover:text-white">← Back</Link>
        <h1 className="mt-6 text-2xl font-bold">{wf.title}</h1>
        <p className="mt-2 text-zinc-300">{wf.summary}</p>

        <div className="mt-8 space-y-3">
          {(steps as any[]).map((s, idx) => (
            <div key={idx} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="font-semibold">{idx + 1}. {s.title}</div>
              <div className="mt-1 text-sm text-zinc-300">{s.description}</div>
              {s.itemSlug ? (
                <div className="mt-2 text-sm">
                  <Link className="text-zinc-200 hover:underline" href={`/tool/${s.itemSlug}`}>
                    관련 툴 보기 →
                  </Link>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </Container>
    </main>
  );
}
