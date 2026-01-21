"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string>("");

  async function run() {
    setLoading(true);
    setLog("");
    try {
      const r = await fetch("/api/admin/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error ?? "Failed");
      setLog(JSON.stringify(d.result, null, 2));
    } catch (e: any) {
      setLog(String(e.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-xl px-4 py-10">
        <Link href="/" className="text-zinc-300 hover:text-white">← Back</Link>
        <h1 className="mt-6 text-2xl font-bold">Admin</h1>
        <p className="mt-2 text-zinc-300">비밀번호 입력 후 동기화를 실행하세요.</p>

        <div className="mt-6 space-y-3">
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Admin password"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 outline-none focus:border-zinc-600"
          />
          <button
            onClick={run}
            disabled={loading}
            className="w-full rounded-2xl bg-white px-4 py-3 font-semibold text-zinc-900 hover:bg-zinc-200 disabled:opacity-60"
          >
            {loading ? "업데이트 중..." : "업데이트 실행"}
          </button>

          <pre className="whitespace-pre-wrap rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-xs text-zinc-200">
            {log || "실행 로그가 여기에 표시됩니다."}
          </pre>

          <div className="text-xs text-zinc-500">
            Cron 테스트: <code className="text-zinc-300">/api/cron/sync?token=CRON_TOKEN</code>
          </div>
        </div>
      </div>
    </main>
  );
}
