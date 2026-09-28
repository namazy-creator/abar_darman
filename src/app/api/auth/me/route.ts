import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const [user] = await db.select().from(users).where(eq(users.id, session.id)).limit(1);
    if (!user || !user.isActive) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        fullNameEn: user.fullNameEn,
        role: user.role,
        phoneNumber: user.phoneNumber,
        avatarUrl: user.avatarUrl,
        nationalId: user.nationalId,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 });
  }
}
