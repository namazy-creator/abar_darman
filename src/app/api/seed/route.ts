import { NextResponse } from "next/server";
import { runDatabaseSeed } from "@/lib/seed";

export async function POST() {
  try {
    const result = await runDatabaseSeed();
    return NextResponse.json({ ok: true, result });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await runDatabaseSeed();
    return NextResponse.json({ ok: true, result });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
