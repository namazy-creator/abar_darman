import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "super_admin" && session.role !== "clinic_admin")) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    const query = db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        fullNameEn: users.fullNameEn,
        phoneNumber: users.phoneNumber,
        role: users.role,
        nationalId: users.nationalId,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    const allUsers = role ? await query.where(eq(users.role, role as any)) : await query;

    return NextResponse.json({ success: true, data: allUsers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "super_admin" && session.role !== "clinic_admin")) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const { id, isActive, role } = await req.json();

    const updateData: any = { updatedAt: new Date() };
    if (isActive !== undefined) updateData.isActive = isActive;
    if (role !== undefined) updateData.role = role;

    await db.update(users).set(updateData).where(eq(users.id, id));

    return NextResponse.json({ success: true, message: "کاربر بروزرسانی شد" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
