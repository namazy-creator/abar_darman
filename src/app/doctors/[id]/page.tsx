"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { useParams, useRouter } from "next/navigation";
import {
  Star,
  ShieldCheck,
  Calendar,
  Clock,
  Video,
  PhoneCall,
  MessageSquare,
  Building,
  MapPin,
  Check,
  ChevronLeft,
  ArrowRight,
  Info
} from "lucide-react";
import { formatPrice, toPersianDigits, gregorianToPersian } from "@/lib/persian";

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params.id as string;

  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [consultationType, setConsultationType] = useState<string>("video");
  const [patientNotes, setPatientNotes] = useState<string>("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!doctorId) return;
    fetch(`/api/doctors/${doctorId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setDoctor(d.data);
          if (d.data.availableSlots && d.data.availableSlots.length > 0) {
            setSelectedDate(d.data.availableSlots[0].date);
          }
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [doctorId]);

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot) {
      setErrorMessage("لطفاً یک تاریخ و ساعت برای نوبت خود انتخاب فرمایید.");
      return;
    }

    setBookingLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId,
          date: selectedDate,
          timeSlot: selectedSlot,
          type: consultationType,
          patientNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBookingSuccess(true);
        setTimeout(() => {
          router.push("/appointments");
        }, 1800);
      } else {
        setErrorMessage(data.error || "خطا در ثبت نوبت");
      }
    } catch (e: any) {
      setErrorMessage(e.message || "خطا در ارتباط با سرور");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <AppShell title="پروفایل پزشک">
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-600 text-sm">در حال بارگذاری اطلاعات پزشک...</p>
        </div>
      </AppShell>
    );
  }

  if (!doctor) {
    return (
      <AppShell title="پزشک یافت نشد">
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-100">
          <p className="text-slate-700 font-bold mb-4">پزشک مورد نظر یافت نشد یا در دسترس نیست.</p>
          <button
            onClick={() => router.push("/doctors")}
            className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold"
          >
            بازگشت به لیست پزشکان
          </button>
        </div>
      </AppShell>
    );
  }

  const currentDaySlots =
    doctor.availableSlots?.find((d: any) => d.date === selectedDate)?.slots || [];

  return (
    <AppShell
      title={doctor.fullName}
      subtitle={`بورد تخصصی ${doctor.specialtyFa || "پزشک متخصص"} - شماره نظام پزشکی: ${doctor.medicalLicense}`}
    >
      <div className="mb-6">
        <button
          onClick={() => router.push("/doctors")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-700 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت به فهرست پزشکان</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Doctor Info & Qualifications */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm text-center">
            <img
              src={doctor.avatarUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200"}
              alt={doctor.fullName}
              className="w-28 h-28 rounded-2xl object-cover border-2 border-slate-100 mx-auto shadow-sm"
            />
            <h2 className="text-lg font-bold text-slate-900 mt-4">{doctor.fullName}</h2>
            <p className="text-xs font-semibold text-teal-600 mt-0.5">{doctor.specialtyFa}</p>

            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg text-amber-700 text-xs font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{toPersianDigits(doctor.rating || "4.9")}</span>
                <span className="text-[10px] text-amber-600/80">({toPersianDigits(doctor.totalReviews || 120)} نظر)</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">|</span>
              <span className="text-xs text-slate-600 font-medium">
                {toPersianDigits(doctor.experienceYears || 10)} سال تجربه
              </span>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 text-right space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">مدارک و شایستگی‌ها:</span>
                <span className="font-semibold text-slate-800 leading-relaxed block">
                  {doctor.qualifications || "دارای بورد تخصصی و عضو انجمن پزشکان ایران"}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">مرکز درمانی همکار:</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {doctor.clinicName || "مرکز درمانی تخصصی پارس"}
                </span>
                {doctor.clinicAddress && (
                  <span className="text-[11px] text-slate-500 mt-0.5 block">{doctor.clinicAddress}</span>
                )}
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">تعرفه مشاوره پزشکی:</span>
                <span className="text-base font-extrabold text-teal-700 block">
                  {formatPrice(doctor.consultationFee || 350000)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm text-xs space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>تضمین اصالت و حریم خصوصی بیمار</span>
            </h4>
            <p className="text-slate-600 leading-relaxed">
              تمامی پزشکان سامانه مدیکال‌پلاس توسط وزارت بهداشت و سازمان نظام پزشکی احراز صلاحیت شده‌اند. مکالمات و اسناد صادر شده در پرونده سلامت شما به صورت رمزنگاری شده نگهداری می‌شود.
            </p>
          </div>
        </div>

        {/* Right Side: Appointment Booking Workspace */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
            <h3 className="text-base md:text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              <span>رزرو آنلاین نوبت مشاوره</span>
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              نوع مشاوره، روز و ساعت مورد نظر خود را برای شروع گفتگو انتخاب فرمایید.
            </p>

            {bookingSuccess ? (
              <div className="p-8 text-center bg-teal-50 rounded-2xl border border-teal-200">
                <div className="w-14 h-14 bg-teal-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md shadow-teal-600/30">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-teal-900 mb-1">نوبت با موفقیت رزرو و تایید شد!</h4>
                <p className="text-xs text-teal-700 leading-relaxed max-w-sm mx-auto">
                  اطلاعات نوبت در پرونده شما ذخیره شد و پیامک تایید نیز ارسال گردید. در حال انتقال به صفحه نوبت‌ها...
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {errorMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                    {errorMessage}
                  </div>
                )}

                {/* 1. Consultation Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2.5">
                    ۱. روش ویزیت را مشخص کنید:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setConsultationType("video")}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-semibold ${
                        consultationType === "video"
                          ? "border-teal-500 bg-teal-50 text-teal-800 shadow-sm"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Video className="w-5 h-5 text-teal-600" />
                      <span>ویزیت تصویری</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConsultationType("audio")}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-semibold ${
                        consultationType === "audio"
                          ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <PhoneCall className="w-5 h-5 text-emerald-600" />
                      <span>ویزیت صوتی</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConsultationType("chat")}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-semibold ${
                        consultationType === "chat"
                          ? "border-purple-500 bg-purple-50 text-purple-800 shadow-sm"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <MessageSquare className="w-5 h-5 text-purple-600" />
                      <span>مشاوره متنی</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConsultationType("in_person")}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-semibold ${
                        consultationType === "in_person"
                          ? "border-amber-500 bg-amber-50 text-amber-800 shadow-sm"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Building className="w-5 h-5 text-amber-600" />
                      <span>حضوری در مطب</span>
                    </button>
                  </div>
                </div>

                {/* 2. Date Selection (Next 7 Days) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2.5">
                    ۲. تاریخ حضور یا ویزیت آنلاین:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                    {doctor.availableSlots?.map((slotDay: any) => {
                      const isSelected = selectedDate === slotDay.date;
                      return (
                        <button
                          key={slotDay.date}
                          type="button"
                          onClick={() => {
                            setSelectedDate(slotDay.date);
                            setSelectedSlot("");
                          }}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            isSelected
                              ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                              : "border-slate-200 bg-white hover:border-teal-300 text-slate-700"
                          }`}
                        >
                          <span className="block text-[11px] font-bold mb-1">{slotDay.dayName}</span>
                          <span className={`block text-[11px] ${isSelected ? "text-teal-100" : "text-slate-500"}`}>
                            {gregorianToPersian(slotDay.date)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Time Slots */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2.5">
                    ۳. ساعت مشاوره را انتخاب فرمایید:
                  </label>
                  {currentDaySlots.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-400">
                      برای این تاریخ زمان آزادی باقی نمانده است. لطفاً روز دیگری را انتخاب کنید.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {currentDaySlots.map((ts: string) => {
                        const isSelected = selectedSlot === ts;
                        return (
                          <button
                            key={ts}
                            type="button"
                            onClick={() => setSelectedSlot(ts)}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                              isSelected
                                ? "border-teal-600 bg-teal-50 text-teal-800 ring-2 ring-teal-500"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            ساعت {ts}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 4. Patient Notes / Symptoms */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    ۴. علت مراجعه و شرح حال اولیه (اختیاری):
                  </label>
                  <textarea
                    rows={3}
                    value={patientNotes}
                    onChange={(e) => setPatientNotes(e.target.value)}
                    placeholder="مثال: سردردهای میگرنی ضربان‌دار از ۲ روز گذشته و حالت تهوع..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Submit action */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-500 block">مبلغ قابل پرداخت برای ویزیت:</span>
                    <span className="text-lg font-black text-slate-900">
                      {formatPrice(doctor.consultationFee || 350000)}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={bookingLoading || !selectedSlot}
                    onClick={handleBooking}
                    className="w-full sm:w-auto px-8 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-teal-600/30 transition-all text-xs flex items-center justify-center gap-2"
                  >
                    {bookingLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>تایید و نهایی‌سازی نوبت</span>
                        <ChevronLeft className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
