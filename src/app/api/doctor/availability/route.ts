import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { doctorAvailability } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "doctor") {
      return NextResponse.json({ error: "تنها پزشک مجاز به دریافت تنظیمات حضور است" }, { status: 403 });
    }

    const schedules = await db
      .select()
      .from(doctorAvailability)
      .where(eq(doctorAvailability.doctorId, session.id));

    return NextResponse.json({ success: true, data: schedules });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "doctor") {
      return NextResponse.json({ error: "تنها پزشک مجاز به ویرایش زمان‌های حضور است" }, { status: 403 });
    }

    const { schedules } = await req.json();

    if (!Array.isArray(schedules)) {
      return NextResponse.json({ error: "داده‌های ارسالی نامعتبر است" }, { status: 400 });
    }

    // Delete existing schedules for this doctor
    await db.delete(doctorAvailability).where(eq(doctorAvailability.doctorId, session.id));

    // Re-insert updated schedules
    for (const s of schedules) {
      await db.insert(doctorAvailability).values({
        id: `avail_${session.id}_${s.dayOfWeek}_${Date.now()}`,
        doctorId: session.id,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime || "09:00",
        endTime: s.endTime || "17:00",
        slotDuration: s.slotDuration || 30,
        consultationTypes: s.consultationTypes || ["video", "audio", "chat"],
        isActive: s.isActive ?? true,
      });
    }

    return NextResponse.json({ success: true, message: "تنظیمات نوبت‌دهی با موفقیت ذخیره شد" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
