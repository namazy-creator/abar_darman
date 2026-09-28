import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, doctorProfiles, specialties, clinics } from "@/db/schema";
import { eq, and, sql, or, ilike } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const specialtyId = searchParams.get("specialtyId");
    const query = searchParams.get("query");
    const gender = searchParams.get("gender");

    // Join doctorProfiles with users, specialties, and clinics
    const docs = await db
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
        specialtyIcon: specialties.icon,
        clinicId: doctorProfiles.clinicId,
        clinicName: clinics.name,
      })
      .from(doctorProfiles)
      .innerJoin(users, eq(doctorProfiles.userId, users.id))
      .leftJoin(specialties, eq(doctorProfiles.specialtyId, specialties.id))
      .leftJoin(clinics, eq(doctorProfiles.clinicId, clinics.id));

    let filtered = docs;

    if (specialtyId && specialtyId !== "all") {
      filtered = filtered.filter((d) => d.specialtyId === specialtyId);
    }

    if (gender && gender !== "all") {
      filtered = filtered.filter((d) => d.gender === gender);
    }

    if (query) {
      const q = query.toLowerCase().trim();
      filtered = filtered.filter(
        (d) =>
          d.fullName.toLowerCase().includes(q) ||
          (d.specialtyFa && d.specialtyFa.toLowerCase().includes(q)) ||
          (d.bio && d.bio.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({
      success: true,
      data: filtered,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
