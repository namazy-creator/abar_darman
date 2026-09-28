import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, doctorProfiles, specialties, clinics, doctorAvailability, appointments } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [doctor] = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        fullNameEn: users.fullNameEn,
        avatarUrl: users.avatarUrl,
        phoneNumber: users.phoneNumber,
        medicalLicense: doctorProfiles.medicalLicense,
        qualifications: doctorProfiles.qualifications,
        bio: doctorProfiles.bio,
        experienceYears: doctorProfiles.experienceYears,
        consultationFee: doctorProfiles.consultationFee,
        rating: doctorProfiles.rating,
        totalReviews: doctorProfiles.totalReviews,
        isAvailableToday: doctorProfiles.isAvailableToday,
        supportedTypes: doctorProfiles.supportedTypes,
        gender: doctorProfiles.gender,
        specialtyId: doctorProfiles.specialtyId,
        specialtyFa: specialties.nameFa,
        specialtyEn: specialties.nameEn,
        clinicId: doctorProfiles.clinicId,
        clinicName: clinics.name,
        clinicAddress: clinics.address,
        clinicPhone: clinics.phone,
      })
      .from(doctorProfiles)
      .innerJoin(users, eq(doctorProfiles.userId, users.id))
      .leftJoin(specialties, eq(doctorProfiles.specialtyId, specialties.id))
      .leftJoin(clinics, eq(doctorProfiles.clinicId, clinics.id))
      .where(eq(users.id, id))
      .limit(1);

    if (!doctor) {
      return NextResponse.json({ error: "پزشک مورد نظر یافت نشد" }, { status: 404 });
    }

    // Availability schedules
    const schedules = await db
      .select()
      .from(doctorAvailability)
      .where(eq(doctorAvailability.doctorId, id));

    // Next 7 days slots generation
    const availableSlots: { date: string; dayName: string; slots: string[] }[] = [];
    const DAY_NAMES = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];
    
    // Check existing appointments to prevent double-booking
    const doctorAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, id),
          eq(appointments.status, "confirmed")
        )
      );

    const bookedMap = new Set(doctorAppointments.map(a => `${a.date}_${a.timeSlot}`));

    for (let i = 0; i < 7; i++) {
      const d = new Date(Date.now() + i * 86400000);
      const dateStr = d.toISOString().split("T")[0];
      // In JS, 0 is Sunday, 6 is Saturday. In Persian calendar, Sat=0, Sun=1...
      const jsDay = d.getDay();
      const persianDayIndex = (jsDay + 1) % 7; // Sat is 6 -> (6+1)%7=0

      const schedule = schedules.find((s) => s.dayOfWeek === persianDayIndex && s.isActive);
      const daySlots: string[] = [];

      if (schedule) {
        // Generate hourly / 30-min slots
        const [startH] = schedule.startTime.split(":").map(Number);
        const [endH] = schedule.endTime.split(":").map(Number);

        for (let h = startH; h < endH; h++) {
          const timeSlot1 = `${h.toString().padStart(2, "0")}:00`;
          const timeSlot2 = `${h.toString().padStart(2, "0")}:30`;

          if (!bookedMap.has(`${dateStr}_${timeSlot1}`)) daySlots.push(timeSlot1);
          if (!bookedMap.has(`${dateStr}_${timeSlot2}`)) daySlots.push(timeSlot2);
        }
      } else {
        // Fallback default slots
        ["09:00", "09:30", "10:30", "11:00", "16:00", "16:30", "17:30"].forEach((ts) => {
          if (!bookedMap.has(`${dateStr}_${ts}`)) daySlots.push(ts);
        });
      }

      availableSlots.push({
        date: dateStr,
        dayName: DAY_NAMES[persianDayIndex],
        slots: daySlots,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...doctor,
        schedules,
        availableSlots,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
