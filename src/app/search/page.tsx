"use client";

import { useState } from "react";
import Link from "next/link";

export default function NaturalSearchPage() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [err, setErr] = useState<string>("");

  async function run() {
    setLoading(true);
    setErr("");
    setParsed(null);
    setItems([]);
    try {
      const r = await fetch(`/api/search/nl?q=${encodeURIComponent(q)}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error ?? "Failed");
      setParsed(d.parsed);
      setItems(d.items ?? []);
    } catch (e: any) {
      setErr(String(e.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link href="/" className="text-zinc-300 hover:text-white">← Back</Link>
        <h1 className="mt-6 text-2xl font-bold">AI로 검색하기</h1>
        <p className="mt-2 text-zinc-300">예: “무료 한국어 LLM 중 API 있는 거”, “쇼츠 자동 편집 툴”</p>

        <div className="mt-6 flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 outline-none focus:border-zinc-600"
            placeholder="질문을 입력하세요"
          />
          <button
            onClick={run}
            disabled={loading || q.length < 3}
            className="rounded-2xl bg-white px-5 py-3 font-semibold text-zinc-900 hover:bg-zinc-200 disabled:opacity-60"
          >
            {loading ? "검색중" : "검색"}
          </button>
        </div>

        {err ? <div className="mt-4 text-sm text-red-300">{err}</div> : null}

        {parsed ? (
          <pre className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-xs text-zinc-200 whitespace-pre-wrap">
            {JSON.stringify(parsed, null, 2)}
          </pre>
        ) : null}

        <div className="mt-8 space-y-3">
          {items.map((it) => (
            <Link
              key={it.slug}
              href={`/${it.type === "MODEL" ? "model" : "tool"}/${it.slug}`}
              className="block rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 hover:border-zinc-600"
            >
              <div className="font-semibold">{it.name}</div>
              <div className="text-sm text-zinc-300">{it.oneLine ?? it.category ?? ""}</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
