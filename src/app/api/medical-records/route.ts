import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { medicalRecords, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "احراز هویت الزامی است" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const requestedPatientId = searchParams.get("patientId");

    let targetPatientId = session.id;
    if (session.role === "doctor" || session.role === "super_admin" || session.role === "clinic_admin") {
      if (requestedPatientId) {
        targetPatientId = requestedPatientId;
      }
    }

    const records = await db
      .select({
        id: medicalRecords.id,
        patientId: medicalRecords.patientId,
        doctorId: medicalRecords.doctorId,
        title: medicalRecords.title,
        recordType: medicalRecords.recordType,
        description: medicalRecords.description,
        resultsData: medicalRecords.resultsData,
        fileUrl: medicalRecords.fileUrl,
        date: medicalRecords.date,
        createdAt: medicalRecords.createdAt,
      })
      .from(medicalRecords)
      .where(eq(medicalRecords.patientId, targetPatientId))
      .orderBy(desc(medicalRecords.createdAt));

    return NextResponse.json({ success: true, data: records });
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
    const { patientId, title, recordType, description, resultsData, fileUrl, date } = body;

    const targetPatient = patientId || session.id;
    const recordId = `rec_${Date.now()}`;

    await db.insert(medicalRecords).values({
      id: recordId,
      patientId: targetPatient,
      doctorId: session.role === "doctor" ? session.id : null,
      title: title || "سند پزشکی جدید",
      recordType: recordType || "lab_test",
      description: description || "",
      resultsData: resultsData || {},
      fileUrl: fileUrl || null,
      date: date || new Date().toISOString().split("T")[0],
    });

    return NextResponse.json({ success: true, message: "سند پرونده الکترونیک با موفقیت افزوده شد" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
