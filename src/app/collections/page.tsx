"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Folder = { id: string; title: string; slugs: string[]; note?: string };

function loadFolders(): Folder[] {
  try {
    return JSON.parse(localStorage.getItem("aidic_folders") || "[]");
  } catch {
    return [];
  }
}
function saveFolders(v: Folder[]) {
  localStorage.setItem("aidic_folders", JSON.stringify(v));
}

export default function CollectionsPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [sharing, setSharing] = useState<string>("");

  useEffect(() => setFolders(loadFolders()), []);

  function addFolder() {
    const f: Folder = { id: crypto.randomUUID(), title: title || "새 컬렉션", note, slugs: [] };
    const next = [f, ...folders];
    setFolders(next);
    saveFolders(next);
    setTitle("");
    setNote("");
  }

  function removeFolder(id: string) {
    const next = folders.filter((f) => f.id !== id);
    setFolders(next);
    saveFolders(next);
  }

  async function shareFolder(f: Folder) {
    setSharing("sharing...");
    const r = await fetch("/api/collection/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: f.title, note: f.note, slugs: f.slugs }),
    });
    const d = await r.json();
    if (!r.ok) {
      setSharing(d?.error ?? "failed");
      return;
    }
    const url = `${location.origin}/c/${d.token}`;
    setSharing(url);
    await fetch("/api/event", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ type:"SHARE" }) }).catch(()=>{});
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link href="/" className="text-zinc-300 hover:text-white">← Back</Link>
        <h1 className="mt-6 text-2xl font-bold">Collections</h1>
        <p className="mt-2 text-zinc-300">폴더로 저장하고 공유할 수 있어요. (로컬 저장)</p>

        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="text-sm font-semibold">새 컬렉션 만들기</div>
          <div className="mt-3 space-y-2">
            <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="컬렉션 이름" className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none"/>
            <input value={note} onChange={(e)=>setNote(e.target.value)} placeholder="메모(옵션)" className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none"/>
            <button onClick={addFolder} className="rounded-xl bg-white px-4 py-2 font-semibold text-zinc-900 hover:bg-zinc-200">추가</button>
          </div>
        </div>

        {sharing ? (
          <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-sm">
            <div className="font-semibold">공유 링크</div>
            <div className="mt-2 break-all text-zinc-200">{sharing}</div>
          </div>
        ) : null}

        <div className="mt-8 space-y-3">
          {folders.length === 0 ? (
            <div className="text-zinc-400">아직 컬렉션이 없습니다. 저장 페이지에서 폴더에 담을 수 있도록 확장할 수 있어요.</div>
          ) : (
            folders.map((f) => (
              <div key={f.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold">{f.title}</div>
                    <div className="text-xs text-zinc-400">{f.note ?? ""}</div>
                    <div className="mt-2 text-xs text-zinc-400">items: {f.slugs.length}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>shareFolder(f)} disabled={f.slugs.length===0} className="rounded-xl border border-zinc-700 px-3 py-2 text-sm hover:border-zinc-500 disabled:opacity-50">공유</button>
                    <button onClick={()=>removeFolder(f.id)} className="rounded-xl border border-zinc-700 px-3 py-2 text-sm hover:border-zinc-500">삭제</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
