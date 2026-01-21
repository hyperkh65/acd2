import Link from "next/link";
import { Badge } from "./Badge";

export function ItemCard({
  item,
}: {
  item: {
    slug: string;
    name: string;
    type: "TOOL" | "MODEL";
    faviconUrl?: string | null;
    oneLine?: string | null;
    summary?: string | null;
    tags?: string[];
    category?: string | null;
    pricing?: string | null;
    supportsKorean?: boolean;
    hasApi?: boolean;
  };
}) {
  return (
    <Link
      href={`/${item.type === "MODEL" ? "model" : "tool"}/${item.slug}`}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 hover:border-zinc-600 hover:bg-zinc-900 transition"
    >
      <div className="flex items-center gap-3">
        <img
          src={item.faviconUrl ?? ""}
          alt=""
          className="h-9 w-9 rounded"
        />
        <div className="min-w-0">
          <div className="truncate font-semibold">{item.name}</div>
          <div className="truncate text-sm text-zinc-300">
            {item.oneLine ?? item.category ?? ""}
          </div>
        </div>
      </div>

      {item.summary ? (
        <div className="mt-3 text-sm text-zinc-200 line-clamp-3">
          {item.summary}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {item.pricing ? <Badge>{item.pricing}</Badge> : null}
        {item.supportsKorean ? <Badge>KR</Badge> : null}
        {item.hasApi ? <Badge>API</Badge> : null}
        {(item.tags ?? []).slice(0, 3).map((t) => (
          <Badge key={t}>{t}</Badge>
        ))}
      </div>
    </Link>
  );
}
