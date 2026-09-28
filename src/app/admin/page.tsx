"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Users,
  Stethoscope,
  Calendar,
  CreditCard,
  Building,
  Activity,
  FileCheck,
  TrendingUp,
  UserCheck,
  ShieldCheck,
  CheckCircle,
  XCircle
} from "lucide-react";
import { formatPrice, toPersianDigits, gregorianToPersian } from "@/lib/persian";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStats(d);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  return (
    <AppShell
      title="داشبورد مدیریت کلان سامانه تله‌مدیسین"
      subtitle="نظارت جامع بر زیرساخت درمان، پزشکان، بیماران، تراکنش‌ها و نوبت‌های آنلاین"
    >
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-600 text-sm">در حال دریافت آمار و اطلاعات مدیریتی...</p>
        </div>
      ) : stats ? (
        <div className="space-y-8">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">پزشکان فعال</span>
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">
                {toPersianDigits(stats.stats.totalDoctors)}
              </div>
              <span className="text-[11px] text-teal-600 font-semibold">پزشک تایید شده</span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">کل بیماران عضو</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">
                {toPersianDigits(stats.stats.totalUsers - stats.stats.totalDoctors)}
              </div>
              <span className="text-[11px] text-indigo-600 font-semibold">پرونده فعال سلامت</span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">نوبت‌های ویزیت ثبت‌شده</span>
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">
                {toPersianDigits(stats.stats.totalAppointments)}
              </div>
              <span className="text-[11px] text-purple-600 font-semibold">جلسه ویزیت</span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">مجموع تراکنش‌های مالی</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">
                {formatPrice(stats.stats.revenue)}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">گردش مالی پلتفرم</span>
            </div>
          </div>

          {/* Quick Sub-Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400">مراکز درمانی و کلینیک‌ها:</span>
                <p className="font-extrabold text-slate-800 text-sm">
                  {toPersianDigits(stats.stats.totalClinics)} کلینیک تخصصی
                </p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400">تخصص‌های بالینی فعال:</span>
                <p className="font-extrabold text-slate-800 text-sm">
                  {toPersianDigits(stats.stats.totalSpecialties)} دپارتمان تخصصی
                </p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400">نسخه‌های الکترونیک صادر شده:</span>
                <p className="font-extrabold text-slate-800 text-sm">
                  {toPersianDigits(stats.stats.totalPrescriptions)} نسخه معتبر
                </p>
              </div>
            </div>
          </div>

          {/* Recent Registrations Table */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" />
                <span>آخرین کاربران و بیماران ثبت‌نام شده</span>
              </h3>
              <button
                onClick={() => router.push("/admin/users")}
                className="text-xs font-bold text-teal-600 hover:underline"
              >
                مدیریت کاربران
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 pb-2">
                    <th className="py-2.5 font-semibold">نام و نام خانوادگی</th>
                    <th className="py-2.5 font-semibold">پست الکترونیک</th>
                    <th className="py-2.5 font-semibold">نقش کاربری</th>
                    <th className="py-2.5 font-semibold">وضعیت حساب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recentUsers.map((u: any) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-bold text-slate-800">{u.fullName}</td>
                      <td className="py-3 text-slate-500 font-mono text-[11px]">{u.email}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-700">
                          {u.role === "doctor" ? "پزشک" :
                           u.role === "super_admin" ? "مدیر کلان" :
                           u.role === "clinic_admin" ? "مدیر کلینیک" : "بیمار"}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="flex items-center gap-1 font-bold text-emerald-600">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>فعال</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
