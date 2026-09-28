"use client";

import React, { useState, useEffect } from "react";
import Link from "next/navigation";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Activity,
  Calendar,
  Users,
  UserCheck,
  FileText,
  FilePlus,
  Stethoscope,
  Bell,
  LogOut,
  Menu,
  X,
  Clock,
  ShieldAlert,
  Building,
  HeartPulse,
  Settings,
  ChevronDown
} from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AppShell({ children, title, subtitle }: AppShellProps) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetch("/api/notifications")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setNotifications(data.data);
            setUnreadCount(data.data.filter((n: any) => !n.isRead).length);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const markAllNotificationsAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "all" }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium text-sm">در حال بارگذاری سامانه تله‌مدیسین...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Role based navigation links
  const getNavLinks = () => {
    if (user.role === "patient") {
      return [
        { label: "میز کار من", href: "/dashboard", icon: Activity },
        { label: "جستجوی پزشکان", href: "/doctors", icon: Stethoscope },
        { label: "نوبت‌های من", href: "/appointments", icon: Calendar },
        { label: "نسخه‌های الکترونیک", href: "/prescriptions", icon: FilePlus },
        { label: "پرونده سلامت (EMR)", href: "/medical-records", icon: FileText },
      ];
    } else if (user.role === "doctor") {
      return [
        { label: "داشبورد مطب", href: "/dashboard", icon: Activity },
        { label: "نوبت‌ها و مراجعین", href: "/appointments", icon: Calendar },
        { label: "تنظیمات زمان حضور", href: "/doctor/availability", icon: Clock },
        { label: "ثبت و مدیریت نسخه", href: "/prescriptions", icon: FilePlus },
        { label: "پرونده‌های بالینی", href: "/medical-records", icon: FileText },
      ];
    } else {
      // Super Admin & Clinic Admin
      return [
        { label: "داشبورد مدیریت کلان", href: "/admin", icon: Activity },
        { label: "مدیریت کاربران و بیماران", href: "/admin/users", icon: Users },
        { label: "فهرست پزشکان سامانه", href: "/doctors", icon: Stethoscope },
        { label: "کلیه نوبت‌ها", href: "/appointments", icon: Calendar },
        { label: "نسخه‌های صادر شده", href: "/prescriptions", icon: FilePlus },
      ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-l border-slate-200 shrink-0">
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-lg tracking-tight">مدیکال‌پلاس</h1>
            <span className="text-[11px] text-teal-600 font-medium">سامانه هوشمند سلامت</span>
          </div>
        </div>

        {/* Current user badge */}
        <div className="p-4 mx-4 my-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
          <img
            src={user.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"}
            alt={user.fullName}
            className="w-11 h-11 rounded-full object-cover border border-slate-200"
          />
          <div className="overflow-hidden">
            <h2 className="text-sm font-bold text-slate-800 truncate">{user.fullName}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${
                user.role === 'doctor' ? 'bg-indigo-500' :
                user.role === 'super_admin' ? 'bg-purple-500' :
                user.role === 'clinic_admin' ? 'bg-amber-500' : 'bg-emerald-500'
              }`} />
              <span className="text-[11px] text-slate-500 font-medium">
                {user.role === "doctor" ? "پزشک معالج" :
                 user.role === "super_admin" ? "مدیر ارشد سامانه" :
                 user.role === "clinic_admin" ? "مدیر کلینیک" : "بیمار"}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-teal-600 text-white shadow-sm shadow-teal-600/30 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>خروج از حساب</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-base md:text-lg font-bold text-slate-800">{title || "میز کار تله‌مدیسین"}</h1>
              {subtitle && <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Seed Refresh Button for Easy Demo Testing */}
            <button
              onClick={async () => {
                await fetch("/api/seed");
                window.location.reload();
              }}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
              title="بارگذاری مجدد اطلاعات نمونه برای تست سریع"
            >
              <HeartPulse className="w-3.5 h-3.5 text-teal-600" />
              <span>بازنشانی داده‌های نمونه</span>
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute left-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="font-bold text-sm text-slate-800">اعلان‌ها و پیام‌ها</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-xs text-teal-600 hover:underline"
                      >
                        خواندن همه
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto mt-2">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        پیام جدیدی وجود ندارد
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`py-2.5 px-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer ${
                            !n.isRead ? "bg-teal-50/50" : ""
                          }`}
                          onClick={() => {
                            if (n.link) router.push(n.link);
                            setShowNotifications(false);
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <span className="text-xs font-semibold text-slate-800">{n.title}</span>
                            {!n.isRead && <span className="w-2 h-2 rounded-full bg-teal-500 mt-1" />}
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Role switchers for instant evaluation */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
              <span className="px-2 text-slate-500 font-medium">نقش جاری:</span>
              <span className="font-bold text-teal-700 bg-white px-2 py-0.5 rounded-lg shadow-sm">
                {user.role === "doctor" ? "پزشک" :
                 user.role === "super_admin" ? "مدیر کلان" :
                 user.role === "clinic_admin" ? "مدیر کلینیک" : "بیمار"}
              </span>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[80%] bg-white h-full flex flex-col p-6 z-10 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-800">مدیکال‌پلاس</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 border-b border-slate-100">
                <p className="text-xs text-slate-500">کاربر وارد شده:</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{user.fullName}</p>
                <p className="text-xs text-teal-600 mt-0.5">{user.email}</p>
              </div>

              <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
                {navLinks.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        router.push(item.href);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                        isActive
                          ? "bg-teal-600 text-white font-semibold"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <button
                onClick={() => logout()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>خروج از حساب</span>
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
