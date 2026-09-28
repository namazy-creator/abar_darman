import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "ایمیل و رمز عبور الزامی است." },
        { status: 400 }
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "کاربری با این مشخصات یافت نشد." },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "حساب کاربری شما غیرفعال شده است. لطفاً با پشتیبانی تماس بگیرید." },
        { status: 403 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "رمز عبور وارد شده نادرست است." },
        { status: 401 }
      );
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      phoneNumber: user.phoneNumber,
      avatarUrl: user.avatarUrl,
    };

    const token = await createToken(tokenPayload);
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: tokenPayload,
      message: "ورود موفقیت‌آمیز بود.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "خطای سرور" }, { status: 500 });
  }
}
