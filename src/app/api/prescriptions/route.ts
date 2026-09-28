import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { prescriptions, users, appointments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "احراز هویت الزامی است" }, { status: 401 });
    }

    let filter;
    if (session.role === "patient") {
      filter = eq(prescriptions.patientId, session.id);
    } else if (session.role === "doctor") {
      filter = eq(prescriptions.doctorId, session.id);
    }

    const query = db
      .select({
        id: prescriptions.id,
        appointmentId: prescriptions.appointmentId,
        doctorId: prescriptions.doctorId,
        patientId: prescriptions.patientId,
        diagnosis: prescriptions.diagnosis,
        items: prescriptions.items,
        notes: prescriptions.notes,
        status: prescriptions.status,
        createdAt: prescriptions.createdAt,
      })
      .from(prescriptions)
      .orderBy(desc(prescriptions.createdAt));

    const list = filter ? await query.where(filter) : await query;

    // Enrich with doctor and patient names
    const enriched = await Promise.all(
      list.map(async (rx) => {
        const [doc] = await db
          .select({ name: users.fullName, phone: users.phoneNumber })
          .from(users)
          .where(eq(users.id, rx.doctorId))
          .limit(1);

        const [pat] = await db
          .select({ name: users.fullName, phone: users.phoneNumber, nationalId: users.nationalId })
          .from(users)
          .where(eq(users.id, rx.patientId))
          .limit(1);

        return {
          ...rx,
          doctorName: doc?.name || "پزشک",
          doctorPhone: doc?.phone || "",
          patientName: pat?.name || "بیمار",
          patientNationalId: pat?.nationalId || "-",
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

    if (session.role !== "doctor" && session.role !== "super_admin") {
      return NextResponse.json({ error: "فقط پزشک می‌تواند نسخه الکترونیک صادر کند" }, { status: 403 });
    }

    const body = await req.json();
    const { patientId, appointmentId, diagnosis, items, notes } = body;

    if (!patientId || !diagnosis || !items || !items.length) {
      return NextResponse.json(
        { error: "وارد کردن تشخیص و حداقل یک قلم دارویی الزامی است" },
        { status: 400 }
      );
    }

    const rxId = `rx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    await db.insert(prescriptions).values({
      id: rxId,
      patientId,
      doctorId: session.id,
      appointmentId: appointmentId || null,
      diagnosis,
      items,
      notes: notes || null,
      status: "active",
    });

    return NextResponse.json({ success: true, message: "نسخه الکترونیک با موفقیت ثبت شد", id: rxId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
