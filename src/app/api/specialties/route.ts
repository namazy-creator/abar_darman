import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { specialties } from "@/db/schema";

export async function GET() {
  try {
    const list = await db.select().from(specialties);
    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
