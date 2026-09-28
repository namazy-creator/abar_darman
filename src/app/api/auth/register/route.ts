import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, patientProfiles, doctorProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullName, phoneNumber, role, medicalLicense } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "تمام فیلدهای الزامی را تکمیل کنید." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "رمز عبور باید حداقل ۶ کاراکتر باشد." },
        { status: 400 }
      );
    }

    // Check if user exists
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "این ایمیل قبلاً در سامانه ثبت شده است." },
        { status: 400 }
      );
    }

    const assignedRole = role === "doctor" ? "doctor" : "patient";
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    await db.insert(users).values({
      id: userId,
      email: email.toLowerCase().trim(),
      passwordHash,
      fullName: fullName.trim(),
      phoneNumber: phoneNumber || null,
      role: assignedRole,
      isActive: true,
    });

    if (assignedRole === "patient") {
      await db.insert(patientProfiles).values({
        id: `prof_${userId}`,
        userId,
        allergies: [],
        chronicDiseases: [],
      });
    } else if (assignedRole === "doctor") {
      await db.insert(doctorProfiles).values({
        id: `prof_${userId}`,
        userId,
        medicalLicense: medicalLicense || "درحال تایید",
        supportedTypes: ["video", "audio", "chat"],
        consultationFee: 350000,
      });
    }

    const tokenPayload: import("@/lib/auth").SessionUser = {
      id: userId,
      email,
      fullName,
      role: assignedRole as "patient" | "doctor",
      phoneNumber,
      avatarUrl: null,
    };

    const token = await createToken(tokenPayload);
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: tokenPayload,
      message: "ثبت‌نام با موفقیت انجام شد.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "خطای سرور" }, { status: 500 });
  }
}
