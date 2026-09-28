import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { consultations, appointments, users, patientProfiles, medicalRecords, prescriptions } from "@/db/schema";
import { eq, or, and } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // appointmentId or consultationId
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "احراز هویت الزامی است" }, { status: 401 });
    }

    const { id } = await params;

    // Search by appointmentId or consultation id
    let [cons] = await db
      .select()
      .from(consultations)
      .where(or(eq(consultations.appointmentId, id), eq(consultations.id, id)))
      .limit(1);

    // If no existing consultation yet, but valid appointment, auto-initialize
    let apptRecord;
    if (!cons) {
      [apptRecord] = await db
        .select()
        .from(appointments)
        .where(eq(appointments.id, id))
        .limit(1);

      if (!apptRecord) {
        return NextResponse.json({ error: "جلسه مشاوره یا نوبت مورد نظر یافت نشد" }, { status: 404 });
      }

      // Check access
      const isAuthorized = (session.role === "patient" && apptRecord.patientId === session.id) ||
                           (session.role === "doctor" && apptRecord.doctorId === session.id) ||
                           (session.role === "super_admin" || session.role === "clinic_admin");
      if (!isAuthorized) {
        return NextResponse.json({ error: "عدم دسترسی به این جلسه" }, { status: 403 });
      }

      // Create new active consultation
      const newConsId = `cons_${Date.now()}`;
      await db.insert(consultations).values({
        id: newConsId,
        appointmentId: apptRecord.id,
        doctorId: apptRecord.doctorId,
        patientId: apptRecord.patientId,
        symptoms: apptRecord.patientNotes || "بدون علائم اولیه ثبت شده",
        status: "in_progress",
        chatMessages: [
          {
            id: `msg_init_${Date.now()}`,
            senderId: "system",
            senderName: "سیستم تله‌مدیسین",
            text: "اتاق ویزیت امن آماده شد. ارتباط صوتی و تصویری برقرار است.",
            timestamp: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
          }
        ],
      });

      [cons] = await db
        .select()
        .from(consultations)
        .where(eq(consultations.id, newConsId))
        .limit(1);
    }

    // Patient detailed profile and EMR summary
    const [patientUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, cons.patientId))
      .limit(1);

    const [patientProf] = await db
      .select()
      .from(patientProfiles)
      .where(eq(patientProfiles.userId, cons.patientId))
      .limit(1);

    const [doctorUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, cons.doctorId))
      .limit(1);

    // Patient past records & prescriptions
    const patientRecords = await db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.patientId, cons.patientId));

    const patientPrescriptions = await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.patientId, cons.patientId));

    return NextResponse.json({
      success: true,
      data: {
        consultation: cons,
        patient: {
          id: patientUser.id,
          fullName: patientUser.fullName,
          email: patientUser.email,
          phoneNumber: patientUser.phoneNumber,
          avatarUrl: patientUser.avatarUrl,
          nationalId: patientUser.nationalId,
          birthDate: patientProf?.birthDate || "۱۳۷۰/۰۱/۰۱",
          gender: patientProf?.gender || "male",
          bloodGroup: patientProf?.bloodGroup || "O+",
          height: patientProf?.height || 175,
          weight: patientProf?.weight || 75,
          allergies: patientProf?.allergies || [],
          chronicDiseases: patientProf?.chronicDiseases || [],
          emergencyContact: patientProf?.emergencyContact || "-",
        },
        doctor: {
          id: doctorUser.id,
          fullName: doctorUser.fullName,
          avatarUrl: doctorUser.avatarUrl,
        },
        records: patientRecords,
        prescriptions: patientPrescriptions,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update consultation (notes, chat message, status, diagnosis, treatmentPlan)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "احراز هویت الزامی است" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    let [cons] = await db
      .select()
      .from(consultations)
      .where(or(eq(consultations.appointmentId, id), eq(consultations.id, id)))
      .limit(1);

    if (!cons) {
      return NextResponse.json({ error: "مشاوره یافت نشد" }, { status: 404 });
    }

    const updateFields: any = {};

    // Chat message appending
    if (body.newMessage) {
      const existingMsgs = cons.chatMessages || [];
      const msgObj = {
        id: `msg_${Date.now()}`,
        senderId: session.id,
        senderName: session.fullName,
        text: body.newMessage,
        timestamp: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
        fileUrl: body.fileUrl || undefined,
      };
      updateFields.chatMessages = [...existingMsgs, msgObj];
    }

    // Clinical clinical notes, diagnosis, symptoms, followUp
    if (body.clinicalNotes !== undefined) updateFields.clinicalNotes = body.clinicalNotes;
    if (body.diagnosis !== undefined) updateFields.diagnosis = body.diagnosis;
    if (body.symptoms !== undefined) updateFields.symptoms = body.symptoms;
    if (body.treatmentPlan !== undefined) updateFields.treatmentPlan = body.treatmentPlan;
    if (body.followUpDate !== undefined) updateFields.followUpDate = body.followUpDate;
    if (body.status !== undefined) {
      updateFields.status = body.status;
      if (body.status === "completed") {
        updateFields.endedAt = new Date();
        // Also mark appointment completed
        await db.update(appointments).set({ status: "completed" }).where(eq(appointments.id, cons.appointmentId));
      }
    }

    await db.update(consultations).set(updateFields).where(eq(consultations.id, cons.id));

    // Return updated
    const [updated] = await db.select().from(consultations).where(eq(consultations.id, cons.id)).limit(1);

    return NextResponse.json({ success: true, consultation: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
