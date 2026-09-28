import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "telemed-persian-secure-platform-jwt-secret-key-2026-ultra-safe"
);

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: "patient" | "doctor" | "clinic_admin" | "super_admin";
  phoneNumber?: string | null;
  avatarUrl?: string | null;
}

export async function createToken(payload: SessionUser): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionUser;
  } catch (err) {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("telemed_token")?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("telemed_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set("telemed_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
