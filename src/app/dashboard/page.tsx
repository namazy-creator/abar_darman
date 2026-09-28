"use client";

import React, { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Video,
  FileText,
  UserCheck,
  Stethoscope,
  TrendingUp,
  AlertCircle,
  ChevronLeft,
  CheckCircle2,
  PhoneCall,
  Activity
} from "lucide-react";
import { gregorianToPersian, toPersianDigits, formatPrice, getStatusBadge, getTypeBadge } from "@/lib/persian";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // If admin, auto redirect or show link
  useEffect(() => {
    if (user && (user.role === "super_admin" || user.role === "clinic_admin")) {
      router.push("/admin");
    }
  }, [user, router]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [apptRes, rxRes, emrRes] = await Promise.all([
          fetch("/api/appointments").then((r) => r.json()),
          fetch("/api/prescriptions").then((r) => r.json()),
          fetch("/api/medical-records").then((r) => r.json()),
        ]);

        if (apptRes.success) setAppointments(apptRes.data || []);
        if (rxRes.success) setPrescriptions(rxRes.data || []);
        if (emrRes.success) setMedicalRecords(emrRes.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (user) loadDashboardData();
  }, [user]);

  if (!user) return null;

  const isDoctor = user.role === "doctor";
  const activeAppointment = appointments.find((a) => a.status === "in_progress" || a.status === "confirmed");

  return (
    <AppShell
      title={`خوش آمدید، ${user.fullName}`}
      subtitle={isDoctor ? "میز کار و داشبورد مطب آنلاین شما" : "پنل مدیریت سلامت و مشاوره‌های پزشکی شما"}
    >
      {/* Quick Action Alert: If Active Video Consultation */}
      {activeAppointment && (
        <div className="mb-6 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <Video className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-bold">
                  {activeAppointment.status === "in_progress" ? "ویزیت آنلاین در حال برگزاری" : "نوبت نزدیک"}
                </span>
                <span className="text-xs opacity-90">{gregorianToPersian(activeAppointment.date)} - ساعت {activeAppointment.timeSlot}</span>
              </div>
              <h3 className="text-base md:text-lg font-bold mt-0.5">
                {isDoctor ? `جلسه مشاوره با ${activeAppointment.patientName}` : `ویزیت آنلاین با ${activeAppointment.doctorName}`}
              </h3>
            </div>
          </div>
          <button
            onClick={() => router.push(`/consultations/${activeAppointment.id}`)}
            className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-white text-teal-800 font-bold text-sm shadow-md hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <span>ورود به اتاق ویزیت تصویری</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 md:p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">
              {isDoctor ? "کل نوبت‌های ثبت شده" : "نوبت‌های فعال من"}
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">
            {toPersianDigits(appointments.length)}
          </div>
          <p className="text-[11px] text-teal-600 mt-1 font-medium">نوبت آنلاین و حضوری</p>
        </div>

        <div className="p-4 md:p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">
              {isDoctor ? "نسخه‌های صادر شده" : "نسخه‌های دارویی"}
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">
            {toPersianDigits(prescriptions.length)}
          </div>
          <p className="text-[11px] text-indigo-600 mt-1 font-medium">نسخه دیجیتال فعال</p>
        </div>

        <div className="p-4 md:p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">
              {isDoctor ? "سوابق و پرونده‌ها" : "اسناد پزشکی ثبت‌شده"}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">
            {toPersianDigits(medicalRecords.length)}
          </div>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">آزمایش‌ها و شرح‌حال</p>
        </div>

        <div className="p-4 md:p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">
              {isDoctor ? "درآمد ویزیت‌ها" : "کیفیت ارتباط بالینی"}
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">
            {isDoctor
              ? formatPrice(appointments.reduce((sum, a) => sum + (a.amount || 0), 0))
              : "رمزگذاری امن"}
          </div>
          <p className="text-[11px] text-purple-600 mt-1 font-medium">
            {isDoctor ? "تسویه‌حساب خودکار" : "پروتکل E2EE استاندارد"}
          </p>
        </div>
      </div>

      {/* Main Grid: Appointments & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Appointments Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-800 text-base md:text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                <span>نوبت‌های مشاوره و ویزیت</span>
              </h3>
              <button
                onClick={() => router.push(isDoctor ? "/appointments" : "/doctors")}
                className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                <span>{isDoctor ? "مشاهده همه" : "رزرو نوبت جدید"}</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400 text-sm">در حال دریافت نوبت‌ها...</div>
            ) : appointments.length === 0 ? (
              <div className="py-12 text-center">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-600">هنوز نوبتی برای شما ثبت نشده است.</p>
                {!isDoctor && (
                  <button
                    onClick={() => router.push("/doctors")}
                    className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition-colors"
                  >
                    جستجو و رزرو پزشک متخصص
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.slice(0, 4).map((item) => {
                  const status = getStatusBadge(item.status);
                  const type = getTypeBadge(item.type);
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={
                            isDoctor
                              ? item.patientAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120"
                              : item.doctorAvatar || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120"
                          }
                          alt="Avatar"
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-sm">
                              {isDoctor ? item.patientName : item.doctorName}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${status.bg} font-semibold`}>
                              {status.labelFa}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {isDoctor ? "بیمار پرونده بالینی" : (item.doctorSpecialtyFa || "پزشک عمومی")}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                            <span className="flex items-center gap-1 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {gregorianToPersian(item.date)}
                            </span>
                            <span className="flex items-center gap-1 font-medium">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              ساعت {item.timeSlot}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${type.color}`}>
                              {type.labelFa}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => router.push(`/consultations/${item.id}`)}
                          className="px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-bold transition-colors flex items-center gap-1.5"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>اتاق ویزیت</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Electronic Prescriptions Preview */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-base md:text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>آخرین نسخه‌های الکترونیک</span>
              </h3>
              <button
                onClick={() => router.push("/prescriptions")}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>مشاهده کلیه نسخه‌ها</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {prescriptions.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">نسخه فعالی برای نمایش موجود نیست.</p>
            ) : (
              <div className="space-y-3">
                {prescriptions.slice(0, 2).map((rx) => (
                  <div key={rx.id} className="p-4 rounded-xl border border-indigo-50 bg-indigo-50/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800">تشخیص: {rx.diagnosis}</span>
                      <span className="text-[11px] text-slate-500 font-medium">{gregorianToPersian(rx.createdAt)}</span>
                    </div>
                    <div className="space-y-1.5">
                      {rx.items?.map((it: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-100">
                          <span className="font-bold text-slate-700">{it.medication}</span>
                          <span className="text-slate-500">{it.dosage} - {it.frequency}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Shortcuts & Emergency Care */}
        <div className="space-y-6">
          {/* Quick Doctor Search Box */}
          {!isDoctor && (
            <div className="bg-gradient-to-br from-teal-700 to-teal-900 rounded-2xl p-6 text-white shadow-md">
              <h4 className="font-extrabold text-base mb-1">ویزیت فوری با پزشکان برتر</h4>
              <p className="text-xs text-teal-100 mb-4 leading-relaxed">
                ارتباط در کمتر از ۱۵ دقیقه با متخصصین قلب، داخلی، پوست، روانپزشکی و اطفال.
              </p>
              <button
                onClick={() => router.push("/doctors")}
                className="w-full py-2.5 rounded-xl bg-white text-teal-800 font-bold text-xs hover:bg-slate-100 transition-colors shadow-sm"
              >
                رزرو ویزیت آنلاین فوری
              </button>
            </div>
          )}

          {/* Quick EMR / Clinical Info Summary */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>خلاصه سوابق سلامت (EMR)</span>
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">گروه خونی:</span>
                <span className="font-bold text-slate-700">A+</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">حساسیت‌های دارویی:</span>
                <span className="font-bold text-rose-600">پنی‌سیلین</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">بیماری مزمن:</span>
                <span className="font-bold text-slate-700">فشار خون خفیف</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">آخرین فشار خون ثبت شده:</span>
                <span className="font-bold text-emerald-700">۱۲۵ / ۸۰ mmHg</span>
              </div>
            </div>
            <button
              onClick={() => router.push("/medical-records")}
              className="w-full mt-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              مشاهده پرونده کامل بالینی
            </button>
          </div>

          {/* Regulatory & Telemedicine Security Compliance Note */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>استاندارد امنیت سلامت و حریم خصوصی</span>
            </div>
            این سامانه طبق موازین حاکمیت داده‌های پزشکی و الزامات سلامت الکترونیک پیاده‌سازی شده است. کلیه ارتباطات تصویری، پیام‌های متنی و اسناد پرونده سلامت با پروتکل‌های امن ذخیره و تبادل می‌شوند.
          </div>
        </div>
      </div>
    </AppShell>
  );
}
