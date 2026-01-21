import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aidic — AI Tools & Models Hub",
  description: "지금 필요한 AI 툴/모델을 빠르게 찾고 저장하세요.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-zinc-950 text-zinc-50">{children}</body>
    </html>
  );
}
