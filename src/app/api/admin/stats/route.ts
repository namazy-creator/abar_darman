import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { users, doctorProfiles, appointments, consultations, prescriptions, clinics, specialties } from "@/db/schema";
import { count, eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "super_admin" && session.role !== "clinic_admin")) {
      return NextResponse.json({ error: "دسترسی تنها برای مدیران سیستم مجاز است" }, { status: 403 });
    }

    const [totalUsers] = await db.select({ val: count() }).from(users);
    const [totalDoctors] = await db.select({ val: count() }).from(doctorProfiles);
    const [totalAppointments] = await db.select({ val: count() }).from(appointments);
    const [totalConsultations] = await db.select({ val: count() }).from(consultations);
    const [totalPrescriptions] = await db.select({ val: count() }).from(prescriptions);
    const [totalClinics] = await db.select({ val: count() }).from(clinics);
    const [totalSpecialties] = await db.select({ val: count() }).from(specialties);

    // Sum revenue
    const revenueResult = await db
      .select({
        totalRevenue: sql<number>`sum(${appointments.amount})`,
      })
      .from(appointments)
      .where(eq(appointments.isPaid, true));

    const revenue = revenueResult[0]?.totalRevenue || 0;

    // Recent 10 users
    const recentUsers = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
        phoneNumber: users.phoneNumber,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .limit(10);

    // Recent 10 appointments
    const recentAppointments = await db
      .select({
        id: appointments.id,
        date: appointments.date,
        timeSlot: appointments.timeSlot,
        type: appointments.type,
        status: appointments.status,
        amount: appointments.amount,
        createdAt: appointments.createdAt,
      })
      .from(appointments)
      .limit(10);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: totalUsers.val,
        totalDoctors: totalDoctors.val,
        totalPatients: totalUsers.val - totalDoctors.val - 2, // approximation
        totalAppointments: totalAppointments.val,
        totalConsultations: totalConsultations.val,
        totalPrescriptions: totalPrescriptions.val,
        totalClinics: totalClinics.val,
        totalSpecialties: totalSpecialties.val,
        revenue,
      },
      recentUsers,
      recentAppointments,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
