import { NextResponse } from "next/server";
import { runSync } from "@/lib/sync";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { password } = await req.json().catch(() => ({ password: "" }));

    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { ok: false, error: "ADMIN_PASSWORD missing" },
        { status: 500 }
      );
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { ok: false, error: "OPENAI_API_KEY missing" },
        { status: 500 }
      );
    }

    const result = await runSync({ maxNewItems: 30 });

    return NextResponse.json({
      ok: true,
      result
    });
  } catch (error: any) {
    console.error("ADMIN SYNC FAILED:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error?.message ?? "Unknown error"
      },
      { status: 500 }
    );
  }
}
