"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Star,
  MapPin,
  Calendar,
  Clock,
  Video,
  PhoneCall,
  MessageSquare,
  Building,
  CheckCircle2,
  ChevronLeft
} from "lucide-react";
import { formatPrice, toPersianDigits } from "@/lib/persian";

export default function DoctorsDirectoryPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Load specialties
    fetch("/api/specialties")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSpecialties(d.data || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedSpecialty !== "all") queryParams.append("specialtyId", selectedSpecialty);
        if (selectedGender !== "all") queryParams.append("gender", selectedGender);
        if (searchQuery.trim()) queryParams.append("query", searchQuery.trim());

        const res = await fetch(`/api/doctors?${queryParams.toString()}`);
        const data = await res.json();
        if (data.success) {
          setDoctors(data.data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [selectedSpecialty, selectedGender, searchQuery]);

  return (
    <AppShell
      title="جستجو و نوبت‌دهی پزشکان متخصص"
      subtitle="بیش از ۱۰۰۰ پزشک معتمد با امکان ویزیت تصویری، صوتی، چت آنلاین و حضوری"
    >
      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <input
              type="text"
              placeholder="جستجوی نام پزشک، تخصص (مثال: قلب، پوست، داخلی)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
          </div>

          <div>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-slate-700"
            >
              <option value="all">همه تخصص‌های پزشکی</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nameFa}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-slate-700"
            >
              <option value="all">جنسیت پزشک (همه)</option>
              <option value="female">پزشک خانم</option>
              <option value="male">پزشک آقا</option>
            </select>
          </div>
        </div>

        {/* Quick specialty tags */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-3 border-t border-slate-100 no-scrollbar">
          <span className="text-xs text-slate-500 font-medium shrink-0">دسترسی سریع:</span>
          <button
            onClick={() => setSelectedSpecialty("all")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
              selectedSpecialty === "all" ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            همه
          </button>
          {specialties.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSpecialty(s.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                selectedSpecialty === s.id ? "bg-teal-600 text-white font-bold" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {s.nameFa}
            </button>
          ))}
        </div>
      </div>

      {/* Results List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium text-sm">در حال بارگذاری لیست پزشکان...</p>
        </div>
      ) : doctors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <p className="text-slate-600 font-semibold text-base mb-2">پزشکی با معیارهای انتخابی یافت نشد.</p>
          <p className="text-slate-400 text-xs">لطفاً فیلترهای جستجو را پاک کنید یا عبارت دیگری را امتحان کنید.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={doc.avatarUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150"}
                    alt={doc.fullName}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-base">{doc.fullName}</h3>
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg text-amber-700 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{toPersianDigits(doc.rating || "4.9")}</span>
                        <span className="text-[10px] text-amber-600/80">({toPersianDigits(doc.totalReviews || 120)})</span>
                      </div>
                    </div>

                    <p className="text-xs font-semibold text-teal-700 mt-0.5">{doc.specialtyFa}</p>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{doc.qualifications}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {doc.bio || "متخصص باتجربه و عضو هیئت علمی، آماده ارائه مشاوره آنلاین پزشکی و بررسی آزمایشات."}
                </p>

                {/* Badges / Support types */}
                <div className="flex flex-wrap gap-2 mb-4 text-[11px]">
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 font-medium">
                    <Video className="w-3.5 h-3.5" />
                    ویزیت تصویری
                  </span>
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-medium">
                    <PhoneCall className="w-3.5 h-3.5" />
                    ویزیت صوتی
                  </span>
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-medium">
                    <MessageSquare className="w-3.5 h-3.5" />
                    مشاوره متنی
                  </span>
                  {doc.clinicName && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {doc.clinicName}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">تعرفه ویزیت آنلاین</span>
                  <span className="text-sm font-extrabold text-slate-900">
                    {formatPrice(doc.consultationFee || 350000)}
                  </span>
                </div>

                <button
                  onClick={() => router.push(`/doctors/${doc.id}`)}
                  className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm shadow-teal-600/20 transition-all flex items-center gap-1.5"
                >
                  <span>مشاهده پروفایل و نوبت‌دهی</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
