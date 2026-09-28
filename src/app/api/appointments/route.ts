import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { appointments, users, doctorProfiles, specialties, notifications } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "احراز هویت الزامی است" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filterStatus = searchParams.get("status");

    // Patients see their own appointments; Doctors see their assigned appointments; Admins see all
    let userFilter;
    if (session.role === "patient") {
      userFilter = eq(appointments.patientId, session.id);
    } else if (session.role === "doctor") {
      userFilter = eq(appointments.doctorId, session.id);
    } // Admins will see all if no userFilter

    const query = db
      .select({
        id: appointments.id,
        date: appointments.date,
        timeSlot: appointments.timeSlot,
        type: appointments.type,
        status: appointments.status,
        patientNotes: appointments.patientNotes,
        amount: appointments.amount,
        isPaid: appointments.isPaid,
        meetingRoomId: appointments.meetingRoomId,
        createdAt: appointments.createdAt,
        patientId: appointments.patientId,
        doctorId: appointments.doctorId,
        doctorName: users.fullName,
        doctorAvatar: users.avatarUrl,
        doctorPhone: users.phoneNumber,
        doctorSpecialtyFa: specialties.nameFa,
      })
      .from(appointments)
      .leftJoin(users, eq(appointments.doctorId, users.id))
      .leftJoin(doctorProfiles, eq(doctorProfiles.userId, users.id))
      .leftJoin(specialties, eq(doctorProfiles.specialtyId, specialties.id))
      .orderBy(desc(appointments.createdAt));

    const result = userFilter ? await query.where(userFilter) : await query;

    // Also enrich with patient name if doctor or admin
    const enriched = await Promise.all(
      result.map(async (item) => {
        const [pat] = await db
          .select({
            patientName: users.fullName,
            patientPhone: users.phoneNumber,
            patientAvatar: users.avatarUrl,
          })
          .from(users)
          .where(eq(users.id, item.patientId))
          .limit(1);

        return {
          ...item,
          patientName: pat?.patientName || "بیمار",
          patientPhone: pat?.patientPhone || "",
          patientAvatar: pat?.patientAvatar || null,
        };
      })
    );

    return NextResponse.json({ success: true, data: enriched });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "احراز هویت الزامی است" }, { status: 401 });
    }

    const body = await req.json();
    const { doctorId, date, timeSlot, type, patientNotes } = body;

    if (!doctorId || !date || !timeSlot) {
      return NextResponse.json(
        { error: "انتخاب پزشک، تاریخ و ساعت نوبت الزامی است" },
        { status: 400 }
      );
    }

    // Double booking prevention check
    const [existing] = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, doctorId),
          eq(appointments.date, date),
          eq(appointments.timeSlot, timeSlot),
          eq(appointments.status, "confirmed")
        )
      )
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "این زمان قبلاً توسط بیمار دیگری رزرو شده است. لطفاً ساعت دیگری را انتخاب نمایید." },
        { status: 409 }
      );
    }

    // Get doctor fee
    const [docProf] = await db
      .select()
      .from(doctorProfiles)
      .where(eq(doctorProfiles.userId, doctorId))
      .limit(1);

    const fee = docProf?.consultationFee || 350000;
    const appointmentId = `appt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const meetingRoomId = `room-${appointmentId}`;

    await db.insert(appointments).values({
      id: appointmentId,
      patientId: session.id,
      doctorId,
      date,
      timeSlot,
      type: type || "video",
      status: "confirmed",
      patientNotes: patientNotes || null,
      amount: fee,
      isPaid: true,
      meetingRoomId,
    });

    // Notify doctor
    await db.insert(notifications).values({
      id: `notif_${Date.now()}_doc`,
      userId: doctorId,
      title: "نوبت جدید رزرو شد",
      message: `${session.fullName} یک نوبت جدید برای تاریخ ${date} ساعت ${timeSlot} ثبت کرد.`,
      type: "appointment",
      link: `/appointments`,
    });

    // Notify patient
    await db.insert(notifications).values({
      id: `notif_${Date.now()}_pat`,
      userId: session.id,
      title: "رزرو نوبت موفق",
      message: `نوبت مشاوره شما با موفقیت ثبت و تایید گردید.`,
      type: "appointment",
      link: `/appointments`,
    });

    return NextResponse.json({
      success: true,
      message: "نوبت با موفقیت رزرو گردید.",
      appointmentId,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
