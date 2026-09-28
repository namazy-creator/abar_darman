"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/context/AuthContext";
import {
  FileText,
  Activity,
  Plus,
  Calendar,
  CheckCircle,
  FileCheck,
  AlertCircle,
  Clock,
  Download
} from "lucide-react";
import { gregorianToPersian } from "@/lib/persian";

export default function MedicalRecordsPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add record modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [recordType, setRecordType] = useState("lab_test");
  const [description, setDescription] = useState("");
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);

  const fetchRecords = async () => {
    try {
      const res = await fetch("/api/medical-records");
      const d = await res.json();
      if (d.success) setRecords(d.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/medical-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          recordType,
          description,
          date: recordDate,
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setTitle("");
        setDescription("");
        fetchRecords();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell
      title="پرونده الکترونیک سلامت (EHR / EMR)"
      subtitle="آرشیو یکپارچه آزمایشات، مدارک تصویربرداری، سوابق بستری و تشخیص‌های بالینی"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">مجموع اسناد ثبت شده:</span>
          <span className="text-xs font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200">
            {records.length} سند
          </span>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن سند یا نتیجه آزمایش جدید</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-600 text-sm">در حال بارگذاری پرونده سلامت...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-slate-700 font-bold text-sm mb-1">پرونده پزشکی شما خالی است.</h4>
          <p className="text-slate-400 text-xs mb-4">می‌توانید آزمایشات و سوابق پزشکی خود را جهت دسترسی پزشکان بارگذاری نمایید.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl"
          >
            بارگذاری اولین سند
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {records.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:border-teal-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{rec.title}</h4>
                      <span className="text-[11px] text-teal-600 font-medium">
                        {rec.recordType === "lab_test" ? "آزمایشگاه تشخیص طبی" : "خلاصه پرونده بالینی"}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {gregorianToPersian(rec.date)}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {rec.description}
                </p>

                {/* Results preview if exists */}
                {rec.resultsData && Object.keys(rec.resultsData).length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                    {Object.entries(rec.resultsData).map(([k, v]) => (
                      <div key={k} className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block text-[10px]">{k}</span>
                        <span className="font-bold text-slate-800 text-[11px]">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>تایید شده توسط پزشک معالج</span>
                <span className="font-semibold text-teal-700">دارای تاییدیه رسمی</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 text-base mb-1">افزودن سند پزشکی به پرونده</h3>
            <p className="text-xs text-slate-500 mb-6">
              اطلاعات آزمایش یا سوابق بالینی خود را جهت نمایش در اتاق ویزیت پزشک وارد کنید.
            </p>

            <form onSubmit={handleAddRecord} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان سند / آزمایش:</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: آزمایش قند خون سه ماهه HbA1c یا سونوگرافی شکم"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">دسته‌بندی مدرک:</label>
                  <select
                    value={recordType}
                    onChange={(e) => setRecordType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="lab_test">آزمایش خون و بیوشیمی</option>
                    <option value="radiology">رادیولوژی و سونوگرافی</option>
                    <option value="clinical_summary">شرح حال و نوار قلب (ECG)</option>
                    <option value="surgery">سوابق جراحی و بستری</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاریخ انجام:</label>
                  <input
                    type="date"
                    required
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">توضیحات و مقادیر آزمایش:</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="نتایج کلیدی، نام آزمایشگاه و توصیه پزشک..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/30"
                >
                  {saving ? "در حال ثبت..." : "افزودن به پرونده"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
