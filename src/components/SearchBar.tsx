"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type SuggestItem = { slug: string; name: string; type: "TOOL" | "MODEL" };

function useDebounce<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function SearchBar() {
  const [q, setQ] = useState("");
  const dq = useDebounce(q, 180);
  const [items, setItems] = useState<SuggestItem[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!dq || dq.length < 2) {
      setItems([]);
      return;
    }
    let alive = true;
    fetch(`/api/search/suggest?q=${encodeURIComponent(dq)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setItems(d.items ?? []);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [dq]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as any)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={boxRef} className="relative">
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="지금 필요한 AI를 검색하세요 (툴/모델/태그)"
        className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 outline-none focus:border-zinc-600"
      />
      {open && items.length > 0 ? (
        <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl">
          {items.map((it) => (
            <Link
              key={it.slug}
              href={`/${it.type === "MODEL" ? "model" : "tool"}/${it.slug}`}
              className="block px-4 py-3 hover:bg-zinc-900"
              onClick={() => setOpen(false)}
            >
              <div className="text-sm text-zinc-200">{it.name}</div>
              <div className="text-xs text-zinc-500">
                {it.type === "MODEL" ? "Model" : "Tool"}
              </div>
            </Link>
          ))}
          <div className="border-t border-zinc-800 px-4 py-3 text-xs text-zinc-500">
            자연어로도 검색 가능:{" "}
            <span className="text-zinc-300">“무료 한국어 LLM 추천”</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
