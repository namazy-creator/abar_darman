"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Calendar,
  Clock,
  Video,
  User,
  Stethoscope,
  Filter,
  CheckCircle,
  XCircle,
  PhoneCall,
  MessageSquare,
  Building,
  ChevronLeft,
  AlertTriangle
} from "lucide-react";
import { gregorianToPersian, formatPrice, getStatusBadge, getTypeBadge } from "@/lib/persian";

export default function AppointmentsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [cancelModalId, setCancelModalId] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/appointments");
      const data = await res.json();
      if (data.success) {
        setAppointments(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchAppointments();
  }, [user]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
        );
        setCancelModalId(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  if (!user) return null;
  const isDoctor = user.role === "doctor";

  const filteredAppointments = appointments.filter((a) => {
    if (statusFilter === "all") return true;
    return a.status === statusFilter;
  });

  return (
    <AppShell
      title="مدیریت نوبت‌های مشاوره"
      subtitle={isDoctor ? "نوبت‌های رزرو شده مراجعین شما به تفکیک زمان و وضعیت" : "تاریخچه نوبت‌ها و جلسات پزشکی شما"}
    >
      {/* Filters and Header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === "all" ? "bg-teal-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            همه نوبت‌ها ({appointments.length})
          </button>
          <button
            onClick={() => setStatusFilter("confirmed")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === "confirmed" ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            تایید شده ({appointments.filter((a) => a.status === "confirmed").length})
          </button>
          <button
            onClick={() => setStatusFilter("completed")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === "completed" ? "bg-slate-800 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            تکمیل شده
          </button>
          <button
            onClick={() => setStatusFilter("cancelled")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === "cancelled" ? "bg-rose-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            لغو شده
          </button>
        </div>

        {!isDoctor && (
          <button
            onClick={() => router.push("/doctors")}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm"
          >
            رزرو نوبت جدید
          </button>
        )}
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-600 text-sm">در حال بارگذاری نوبت‌ها...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-slate-700 font-bold text-sm mb-1">نوبتی با این وضعیت یافت نشد.</h4>
          <p className="text-slate-400 text-xs mb-4">می‌توانید فیلترهای دیگر را بررسی یا نوبت جدیدی رزرو کنید.</p>
          {!isDoctor && (
            <button
              onClick={() => router.push("/doctors")}
              className="px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl"
            >
              مشاهده لیست پزشکان متخصص
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((item) => {
            const status = getStatusBadge(item.status);
            const type = getTypeBadge(item.type);
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:border-slate-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={
                      isDoctor
                        ? item.patientAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120"
                        : item.doctorAvatar || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120"
                    }
                    alt="avatar"
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">
                        {isDoctor ? item.patientName : item.doctorName}
                      </h3>
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${status.bg} font-bold`}>
                        {status.labelFa}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-0.5">
                      {isDoctor ? `شماره تماس بیمار: ${item.patientPhone || "ثبت نشده"}` : (item.doctorSpecialtyFa || "پزشک معالج")}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-3">
                      <span className="flex items-center gap-1 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-teal-600" />
                        {gregorianToPersian(item.date)}
                      </span>
                      <span className="flex items-center gap-1 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        ساعت {item.timeSlot}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${type.color}`}>
                        {type.labelFa}
                      </span>
                      <span className="text-slate-400">|</span>
                      <span className="font-bold text-slate-700">{formatPrice(item.amount)}</span>
                    </div>

                    {item.patientNotes && (
                      <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg mt-2.5 border border-slate-100 max-w-xl">
                        <strong>شرح حال بیمار:</strong> {item.patientNotes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  {(item.status === "confirmed" || item.status === "in_progress") && (
                    <button
                      onClick={() => router.push(`/consultations/${item.id}`)}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm shadow-teal-600/20 flex items-center gap-1.5"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>ورود به اتاق ویزیت</span>
                    </button>
                  )}

                  {item.status === "confirmed" && (
                    <button
                      onClick={() => setCancelModalId(item.id)}
                      className="px-3 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
                    >
                      لغو نوبت
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-center mb-1">آیا از لغو این نوبت اطمینان دارید؟</h4>
            <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
              با لغو نوبت، زمان برای سایر بیماران آزاد شده و مبلغ ویزیت طبق قوانین استرداد عودت داده خواهد شد.
            </p>
            <div className="flex items-center gap-3">
              <button
                disabled={updating}
                onClick={() => handleUpdateStatus(cancelModalId, "cancelled")}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                {updating ? "در حال لغو..." : "بله، لغو شود"}
              </button>
              <button
                disabled={updating}
                onClick={() => setCancelModalId(null)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
