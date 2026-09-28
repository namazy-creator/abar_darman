"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { HeartPulse, Lock, Mail, User, Stethoscope, Phone, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [medicalLicense, setMedicalLicense] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await register({
      fullName,
      email,
      password,
      phoneNumber,
      role,
      medicalLicense: role === "doctor" ? medicalLicense : undefined,
    });

    setLoading(false);

    if (res.success) {
      router.push("/dashboard");
    } else {
      setError(res.error || "خطا در ثبت‌نام");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="w-14 h-14 bg-gradient-to-tr from-teal-600 to-cyan-500 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
          <HeartPulse className="w-8 h-8" />
        </div>
        <h2 className="mt-4 text-center text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          عضویت در سامانه تله‌مدیسین
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          دسترسی آنلاین به پزشکان متخصص سراسر کشور
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 sm:rounded-3xl border border-slate-100">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Role selector tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-5">
            <button
              type="button"
              onClick={() => setRole("patient")}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                role === "patient" ? "bg-white text-teal-700 shadow-sm" : "text-slate-600"
              }`}
            >
              <User className="w-4 h-4" />
              <span>ثبت‌نام بیمار</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("doctor")}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                role === "doctor" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600"
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>ثبت‌نام پزشک</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                نام و نام خانوادگی
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={role === "doctor" ? "دکتر علی حسینی" : "امیرحسین رضایی"}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                شماره موبایل
              </label>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="09123456789"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                dir="ltr"
              />
            </div>

            {role === "doctor" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  شماره نظام پزشکی
                </label>
                <input
                  type="text"
                  required
                  value={medicalLicense}
                  onChange={(e) => setMedicalLicense(e.target.value)}
                  placeholder="ن-۱۲۳۴۵"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  dir="ltr"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                آدرس ایمیل
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-left"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                رمز عبور (حداقل ۶ کاراکتر)
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-left"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-teal-600/30 transition-all text-sm flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>تکمیل ثبت‌نام و ورود</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            قبلاً ثبت‌نام کرده‌اید؟{" "}
            <a href="/auth/login" className="font-bold text-teal-600 hover:underline">
              ورود به حساب کاربری
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
