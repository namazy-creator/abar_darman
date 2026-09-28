import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { appointments, users, doctorProfiles, specialties, consultations } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "احراز هویت الزامی است" }, { status: 401 });
    }

    const { id } = await params;

    const [appt] = await db
      .select({
        id: appointments.id,
        patientId: appointments.patientId,
        doctorId: appointments.doctorId,
        date: appointments.date,
        timeSlot: appointments.timeSlot,
        type: appointments.type,
        status: appointments.status,
        patientNotes: appointments.patientNotes,
        amount: appointments.amount,
        isPaid: appointments.isPaid,
        meetingRoomId: appointments.meetingRoomId,
        createdAt: appointments.createdAt,
      })
      .from(appointments)
      .where(eq(appointments.id, id))
      .limit(1);

    if (!appt) {
      return NextResponse.json({ error: "نوبت یافت نشد" }, { status: 404 });
    }

    // Role check: Patient can only view their own; Doctor can only view their own; Admins can view any
    if (
      session.role === "patient" && appt.patientId !== session.id ||
      session.role === "doctor" && appt.doctorId !== session.id
    ) {
      return NextResponse.json({ error: "عدم دسترسی به این پرونده نوبت" }, { status: 403 });
    }

    // Doctor info
    const [doctor] = await db
      .select({
        name: users.fullName,
        avatar: users.avatarUrl,
        phone: users.phoneNumber,
        specialtyFa: specialties.nameFa,
      })
      .from(users)
      .leftJoin(doctorProfiles, eq(doctorProfiles.userId, users.id))
      .leftJoin(specialties, eq(doctorProfiles.specialtyId, specialties.id))
      .where(eq(users.id, appt.doctorId))
      .limit(1);

    // Patient info
    const [patient] = await db
      .select({
        name: users.fullName,
        avatar: users.avatarUrl,
        phone: users.phoneNumber,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, appt.patientId))
      .limit(1);

    return NextResponse.json({
      success: true,
      data: {
        ...appt,
        doctor,
        patient,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update status (e.g., cancel, in_progress, completed)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "احراز هویت الزامی است" }, { status: 401 });
    }

    const { id } = await params;
    const { status, date, timeSlot } = await req.json();

    const [existing] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "نوبت یافت نشد" }, { status: 404 });
    }

    const isOwner = (session.role === "patient" && existing.patientId === session.id) ||
                    (session.role === "doctor" && existing.doctorId === session.id) ||
                    (session.role === "super_admin" || session.role === "clinic_admin");
    if (!isOwner) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const updateData: any = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (date) updateData.date = date;
    if (timeSlot) updateData.timeSlot = timeSlot;

    await db.update(appointments).set(updateData).where(eq(appointments.id, id));

    return NextResponse.json({ success: true, message: "وضعیت نوبت بروزرسانی شد" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
