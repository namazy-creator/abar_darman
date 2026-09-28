"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/context/AuthContext";
import {
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  Save,
  Coffee,
  Video
} from "lucide-react";

export default function DoctorAvailabilityPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 7 days schedule state
  const DAY_NAMES = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];
  const [schedules, setSchedules] = useState<any[]>(
    DAY_NAMES.map((_, idx) => ({
      dayOfWeek: idx,
      startTime: "09:00",
      endTime: "17:00",
      slotDuration: 30,
      isActive: idx <= 4, // Sat-Wed active by default
    }))
  );

  useEffect(() => {
    fetch("/api/doctor/availability")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.length > 0) {
          const map = new Map(d.data.map((item: any) => [item.dayOfWeek, item]));
          setSchedules(
            DAY_NAMES.map((_, idx) => {
              if (map.has(idx)) {
                return map.get(idx);
              }
              return {
                dayOfWeek: idx,
                startTime: "09:00",
                endTime: "17:00",
                slotDuration: 30,
                isActive: false,
              };
            })
          );
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleDay = (index: number) => {
    setSchedules((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const handleChangeTime = (index: number, field: "startTime" | "endTime", val: string) => {
    setSchedules((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, [field]: val } : s))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/doctor/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedules }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <AppShell
      title="تنظیمات زمان حضور و نوبت‌دهی خودکار"
      subtitle="ساعات کاری و بازه‌های ویزیت آنلاین و حضوری خود را برای تولید خودکار نوبت‌ها تنظیم کنید"
    >
      <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm max-w-4xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-1">برنامه هفتگی ویزیت</h3>
            <p className="text-xs text-slate-500">
              سیستم به صورت خودکار نوبت‌های ۳۰ دقیقه‌ای را بر اساس زمان‌های زیر به بیماران پیشنهاد می‌دهد.
            </p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="w-full sm:w-auto px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "در حال ذخیره..." : "ذخیره تغییرات"}</span>
          </button>
        </div>

        {saveSuccess && (
          <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>برنامه حضور هفتگی با موفقیت ذخیره شد و اسلات‌های جدید تولید شدند.</span>
          </div>
        )}

        <div className="space-y-3">
          {schedules.map((dayItem, idx) => {
            const isDayActive = dayItem.isActive;
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDayActive
                    ? "bg-white border-slate-200 shadow-xs"
                    : "bg-slate-50/70 border-slate-100 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isDayActive}
                    onChange={() => handleToggleDay(idx)}
                    className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{DAY_NAMES[idx]}</span>
                    <span className="text-[11px] text-slate-400 block">
                      {isDayActive ? "فعال برای نوبت‌دهی آنلاین" : "تعطیل / بدون نوبت"}
                    </span>
                  </div>
                </div>

                {isDayActive && (
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">از ساعت:</span>
                      <input
                        type="time"
                        value={dayItem.startTime}
                        onChange={(e) => handleChangeTime(idx, "startTime", e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">تا ساعت:</span>
                      <input
                        type="time"
                        value={dayItem.endTime}
                        onChange={(e) => handleChangeTime(idx, "endTime", e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
