import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "احراز هویت الزامی است" }, { status: 401 });
    }

    const list = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, session.id))
      .orderBy(desc(notifications.createdAt))
      .limit(20);

    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "احراز هویت الزامی است" }, { status: 401 });
    }

    const { id } = await req.json();

    if (id === "all") {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, session.id));
    } else {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, id));
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
