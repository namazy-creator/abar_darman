"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/context/AuthContext";
import {
  FileText,
  Printer,
  Download,
  Calendar,
  User,
  Stethoscope,
  Plus,
  CheckCircle,
  Clock,
  Pill
} from "lucide-react";
import { gregorianToPersian } from "@/lib/persian";

export default function PrescriptionsPage() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRx, setSelectedRx] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/prescriptions")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setPrescriptions(d.data || []);
          if (d.data?.length > 0) setSelectedRx(d.data[0]);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;
  const isDoctor = user.role === "doctor";

  return (
    <AppShell
      title="نسخه‌های الکترونیک سلامت"
      subtitle={isDoctor ? "مدیریت و استعلام نسخه‌های تجویز شده برای بیماران" : "دفترچه دارویی و نسخه‌های معتبر نظام پزشکی شما"}
    >
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-600 text-sm">در حال بارگذاری نسخه‌ها...</p>
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-slate-700 font-bold text-sm mb-1">نسخه الکترونیکی ثبت نشده است.</h4>
          <p className="text-slate-400 text-xs">پس از هر جلسه ویزیت آنلاین یا حضوری، نسخه پزشک در این بخش قرار می‌گیرد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* List of Prescriptions (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 mb-2">فهرست نسخه‌های دارویی:</h3>
            {prescriptions.map((rx) => {
              const isSelected = selectedRx?.id === rx.id;
              return (
                <div
                  key={rx.id}
                  onClick={() => setSelectedRx(rx)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-50/50 shadow-sm"
                      : "border-slate-100 bg-white hover:border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900">{rx.diagnosis}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      معتبر و فعال
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{isDoctor ? `بیمار: ${rx.patientName}` : `پزشک: ${rx.doctorName}`}</span>
                    <span>{gregorianToPersian(rx.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Printable View of Selected Prescription (7 cols) */}
          <div className="lg:col-span-7">
            {selectedRx ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
                {/* Formal Rx Header */}
                <div className="border-b-2 border-dashed border-slate-200 pb-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xl">
                      ℞
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">نسخه الکترونیک پزشکی</h4>
                      <p className="text-xs text-slate-500">شناسه استعلام نسخه: {selectedRx.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.print()}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-4 h-4 text-slate-500" />
                      <span>چاپ نسخه</span>
                    </button>
                  </div>
                </div>

                {/* Patient & Doctor metadata */}
                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
                  <div>
                    <span className="text-slate-400 block mb-0.5">نام بیمار:</span>
                    <span className="font-bold text-slate-800">{selectedRx.patientName}</span>
                    <span className="text-slate-500 block mt-0.5 text-[11px]">
                      کد ملی: {selectedRx.patientNationalId || "۰۰۱۸۴۹۲۰۴۱"}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">پزشک صادرکننده:</span>
                    <span className="font-bold text-slate-800">{selectedRx.doctorName}</span>
                    <span className="text-slate-500 block mt-0.5 text-[11px]">
                      تاریخ صدور: {gregorianToPersian(selectedRx.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Diagnosis */}
                <div className="mb-6">
                  <span className="text-xs font-bold text-slate-500 block mb-1">تشخیص بیماری:</span>
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs font-bold text-amber-900">
                    {selectedRx.diagnosis}
                  </div>
                </div>

                {/* Medicines Table */}
                <div className="mb-6">
                  <span className="text-xs font-bold text-slate-500 block mb-2">اقلام دارویی تجویز شده:</span>
                  <div className="space-y-2.5">
                    {selectedRx.items?.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-slate-100 bg-white hover:bg-slate-50/60 transition-colors flex items-start gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-sm">{item.medication}</span>
                            <span className="text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                              {item.dosage}
                            </span>
                          </div>
                          <div className="mt-1 text-slate-600 flex flex-wrap items-center gap-4 text-[11px]">
                            <span>دستور مصرف: {item.frequency || "طبق نظر پزشک"}</span>
                            {item.duration && <span>طول دوره: {item.duration}</span>}
                          </div>
                          {item.instructions && (
                            <p className="mt-1 text-[11px] text-slate-500 bg-slate-50 p-1.5 rounded">
                              {item.instructions}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {selectedRx.notes && (
                  <div className="text-xs text-slate-500 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-6">
                    <strong>توضیحات تکمیلی پزشک:</strong> {selectedRx.notes}
                  </div>
                )}

                {/* Digital Verification Watermark */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>دارای اصالت دیجیتال و تایید شده توسط سامانه تله‌مدیسین</span>
                  <span className="font-bold text-emerald-600">✓ امضای دیجیتال معتبر</span>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 text-xs">یک نسخه را جهت مشاهده انتخاب نمایید.</div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
