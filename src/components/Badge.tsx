export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-200">
      {children}
    </span>
  );
}
