"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { HeartPulse, Lock, Mail, User, ShieldCheck, Stethoscope, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("patient@telemed.ir");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await login({ email, password });
    setLoading(false);

    if (res.success) {
      router.push("/dashboard");
    } else {
      setError(res.error || "ورود ناموفق بود");
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("123456");
    setLoading(true);
    setError(null);

    const res = await login({ email: demoEmail, password: "123456" });
    setLoading(false);

    if (res.success) {
      router.push("/dashboard");
    } else {
      setError(res.error || "خطا در ورود سریع");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="w-14 h-14 bg-gradient-to-tr from-teal-600 to-cyan-500 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
          <HeartPulse className="w-8 h-8" />
        </div>
        <h2 className="mt-4 text-center text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          سامانه جامع تله‌مدیسین و سلامت
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          ورود امن بیماران، پزشکان و کادر درمان
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 sm:rounded-3xl border border-slate-100">
          {error && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs md:text-sm rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                پست الکترونیک (ایمیل)
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.ir"
                  className="w-full text-left pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  dir="ltr"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                رمز عبور
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-left pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  dir="ltr"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-teal-600/30 transition-all text-sm flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>ورود به حساب کاربری</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins for Fast Review */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-700 mb-3 text-center">
              ورود سریع دمو با نقش‌های آزمایشی (بدون نیاز به تایپ):
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("patient@telemed.ir")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-teal-200 bg-teal-50/60 hover:bg-teal-100 text-xs font-medium text-teal-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-600" />
                  <span>ورود به عنوان <strong>بیمار (امیرحسین صادقی)</strong></span>
                </div>
                <span className="text-[11px] bg-white px-2 py-0.5 rounded shadow-xs text-teal-700">کلیک برای ورود</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin("doctor@telemed.ir")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 text-xs font-medium text-indigo-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-indigo-600" />
                  <span>ورود به عنوان <strong>پزشک (دکتر مریم شفیعی)</strong></span>
                </div>
                <span className="text-[11px] bg-white px-2 py-0.5 rounded shadow-xs text-indigo-700">کلیک برای ورود</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin("admin@telemed.ir")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-xs font-medium text-purple-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>ورود به عنوان <strong>مدیر ارشد سامانه (ادمین کلان)</strong></span>
                </div>
                <span className="text-[11px] bg-white px-2 py-0.5 rounded shadow-xs text-purple-700">کلیک برای ورود</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            حساب کاربری ندارید؟{" "}
            <a href="/auth/register" className="font-bold text-teal-600 hover:underline">
              ثبت‌نام رایگان بیمار یا پزشک
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
