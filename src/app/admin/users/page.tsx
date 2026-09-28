"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/context/AuthContext";
import { Users, Search, CheckCircle, XCircle, ShieldCheck, ChevronLeft } from "lucide-react";
import { gregorianToPersian } from "@/lib/persian";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = roleFilter !== "all" ? `?role=${roleFilter}` : "";
      const res = await fetch(`/api/admin/users${q}`);
      const d = await res.json();
      if (d.success) setUsersList(d.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const toggleUserStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      if (res.ok) {
        setUsersList((prev) =>
          prev.map((u) => (u.id === id ? { ...u, isActive: !currentStatus } : u))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = usersList.filter((u) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s) ||
      (u.phoneNumber && u.phoneNumber.includes(s))
    );
  });

  return (
    <AppShell
      title="مدیریت کاربران و سطوح دسترسی"
      subtitle="نظارت بر حساب بیماران، کادر پزشکی، فعال‌سازی یا مسدودسازی دسترسی‌ها"
    >
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="جستجوی نام، ایمیل، موبایل..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setRoleFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                roleFilter === "all" ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              همه ({usersList.length})
            </button>
            <button
              onClick={() => setRoleFilter("doctor")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                roleFilter === "doctor" ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              پزشکان
            </button>
            <button
              onClick={() => setRoleFilter("patient")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                roleFilter === "patient" ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              بیماران
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-600 text-sm">در حال بارگذاری فهرست کاربران...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 pb-2">
                <th className="py-3 font-semibold">کاربر</th>
                <th className="py-3 font-semibold">نقش سامانه</th>
                <th className="py-3 font-semibold">شماره تماس</th>
                <th className="py-3 font-semibold">کد ملی</th>
                <th className="py-3 font-semibold">تاریخ عضویت</th>
                <th className="py-3 font-semibold">وضعیت حساب</th>
                <th className="py-3 font-semibold">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <td className="py-3">
                    <span className="font-bold text-slate-900 block">{u.fullName}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                        u.role === "doctor"
                          ? "bg-indigo-50 text-indigo-700"
                          : u.role === "super_admin"
                          ? "bg-purple-50 text-purple-700"
                          : "bg-teal-50 text-teal-700"
                      }`}
                    >
                      {u.role === "doctor" ? "پزشک" :
                       u.role === "super_admin" ? "مدیر کلان" :
                       u.role === "clinic_admin" ? "مدیر کلینیک" : "بیمار"}
                    </span>
                  </td>
                  <td className="py-3 text-slate-600 font-mono text-[11px]">{u.phoneNumber || "-"}</td>
                  <td className="py-3 text-slate-600 font-mono text-[11px]">{u.nationalId || "-"}</td>
                  <td className="py-3 text-slate-500 text-[11px]">{gregorianToPersian(u.createdAt)}</td>
                  <td className="py-3">
                    {u.isActive ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>فعال</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-rose-600">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>مسدود</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => toggleUserStatus(u.id, u.isActive)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                        u.isActive
                          ? "border-rose-200 text-rose-600 hover:bg-rose-50"
                          : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                      }`}
                    >
                      {u.isActive ? "غیرفعال‌سازی" : "فعال‌سازی حساب"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
