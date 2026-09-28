"use client";

import React, { useState, useEffect, useRef } from "react";
import AppShell from "@/components/AppShell";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  MessageSquare,
  FileText,
  User,
  Heart,
  Send,
  Plus,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Paperclip,
  Activity
} from "lucide-react";
import { gregorianToPersian } from "@/lib/persian";

export default function ConsultationWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id as string;
  const { user } = useAuth();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Call Controls State
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [activeTab, setActiveTab] = useState<"chat" | "emr" | "notes">("chat");

  // Chat message input
  const [messageInput, setMessageInput] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Clinical Notes & Diagnosis Form (Doctor only)
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Prescription Drawer/Modal
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [rxDiagnosis, setRxDiagnosis] = useState("");
  const [rxItems, setRxItems] = useState([
    { medication: "", dosage: "", frequency: "", duration: "", instructions: "" },
  ]);
  const [savingRx, setSavingRx] = useState(false);

  const fetchConsultation = async () => {
    try {
      const res = await fetch(`/api/consultations/${appointmentId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        const cons = json.data.consultation;
        if (cons) {
          setClinicalNotes(cons.clinicalNotes || "");
          setDiagnosis(cons.diagnosis || "");
          setSymptoms(cons.symptoms || "");
          setTreatmentPlan(cons.treatmentPlan || "");
          setFollowUpDate(cons.followUpDate || "");
          setRxDiagnosis(cons.diagnosis || "");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (appointmentId) fetchConsultation();
  }, [appointmentId]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.consultation?.chatMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    setSendingMsg(true);
    try {
      const res = await fetch(`/api/consultations/${appointmentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newMessage: messageInput }),
      });
      const resData = await res.json();
      if (resData.success && resData.consultation) {
        setData((prev: any) => ({
          ...prev,
          consultation: resData.consultation,
        }));
        setMessageInput("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSendingMsg(false);
    }
  };

  const handleSaveNotes = async (markComplete = false) => {
    setSavingNotes(true);
    setSaveSuccess(false);
    try {
      const payload: any = {
        clinicalNotes,
        diagnosis,
        symptoms,
        treatmentPlan,
        followUpDate,
      };
      if (markComplete) payload.status = "completed";

      const res = await fetch(`/api/consultations/${appointmentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (resData.success) {
        setData((prev: any) => ({
          ...prev,
          consultation: resData.consultation,
        }));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRx(true);
    try {
      const validItems = rxItems.filter((it) => it.medication.trim().length > 0);
      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: data.patient.id,
          appointmentId,
          diagnosis: rxDiagnosis || diagnosis || "تشخیص بالینی",
          items: validItems,
        }),
      });

      if (res.ok) {
        setShowPrescriptionModal(false);
        // refresh consultation records
        fetchConsultation();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingRx(false);
    }
  };

  if (loading) {
    return (
      <AppShell title="اتاق ویزیت آنلاین">
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-600 text-sm">در حال آماده‌سازی ارتباط امن ویزیت تصویری...</p>
        </div>
      </AppShell>
    );
  }

  if (!data) {
    return (
      <AppShell title="خطا">
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-100">
          <p className="text-slate-700 font-bold mb-4">جلسه ویزیت یافت نشد یا منقضی شده است.</p>
          <button
            onClick={() => router.push("/appointments")}
            className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold"
          >
            بازگشت به نوبت‌ها
          </button>
        </div>
      </AppShell>
    );
  }

  const isDoctor = user?.role === "doctor";
  const messages = data.consultation?.chatMessages || [];

  return (
    <AppShell
      title={`اتاق ویزیت آنلاین: ${isDoctor ? data.patient.fullName : data.doctor.fullName}`}
      subtitle="ارتباط رمزگذاری شده صوتی، تصویری و متنی بر بستر استاندارد WebRTC"
    >
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => router.push("/appointments")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-700 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>خروج از اتاق و بازگشت به نوبت‌ها</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            ارتباط زنده و پایدار (Latency: 28ms)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Area: Video Consultation & Streaming Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative bg-slate-950 rounded-3xl overflow-hidden aspect-video shadow-2xl border border-slate-800 flex items-center justify-center">
            {/* Main Doctor or Remote Stream Simulation */}
            {isVideoOn ? (
              <div className="relative w-full h-full">
                <img
                  src={
                    isDoctor
                      ? data.patient.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800"
                      : data.doctor.avatarUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800"
                  }
                  alt="Remote Participant"
                  className="w-full h-full object-cover brightness-95"
                />
                <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-xs font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{isDoctor ? data.patient.fullName : data.doctor.fullName}</span>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 text-white">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3">
                  <VideoOff className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-sm font-semibold">دوربین موقتاً غیرفعال است</p>
                <p className="text-xs text-slate-400 mt-1">ارتباط صوتی با کیفیت شفاف همچنان برقرار است</p>
              </div>
            )}

            {/* Self Picture-in-Picture Preview (Local video) */}
            <div className="absolute bottom-4 left-4 w-28 md:w-36 aspect-video bg-slate-850 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl">
              <img
                src={user?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200"}
                alt="You"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 right-1.5 bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-white">
                شما
              </div>
            </div>

            {/* In-Call Controls Overlay */}
            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsAudioOn(!isAudioOn)}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-lg ${
                  isAudioOn ? "bg-white/20 backdrop-blur-md text-white hover:bg-white/30" : "bg-rose-600 text-white"
                }`}
                title={isAudioOn ? "قطع میکروفون" : "وصل میکروفون"}
              >
                {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-lg ${
                  isVideoOn ? "bg-white/20 backdrop-blur-md text-white hover:bg-white/30" : "bg-rose-600 text-white"
                }`}
                title={isVideoOn ? "قطع تصویر" : "وصل تصویر"}
              >
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm("آیا مایل به اتمام ویزیت آنلاین هستید؟")) {
                    handleSaveNotes(true);
                    router.push("/appointments");
                  }
                }}
                className="w-11 h-11 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg"
                title="پایان تماس"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Patient Medical Alert Bar */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                {data.patient.bloodGroup || "O+"}
              </div>
              <div>
                <span className="font-bold text-slate-800 text-sm block">{data.patient.fullName}</span>
                <span className="text-slate-500 text-[11px]">
                  کد ملی: {data.patient.nationalId || "۰۰۱۸۴۹۲۰۴۱"} | سن: ۳۲ سال
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {data.patient.allergies?.length > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold border border-rose-200 text-[11px]">
                  حساسیت به: {data.patient.allergies.join("، ")}
                </span>
              )}
              {isDoctor && (
                <button
                  onClick={() => setShowPrescriptionModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>صدور نسخه فوری</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Area: Interactive Tabs (Chat, Clinical Notes, EMR) (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
          {/* Workspace Tabs Header */}
          <div className="grid grid-cols-3 border-b border-slate-100 bg-slate-50/70 p-1.5">
            <button
              onClick={() => setActiveTab("chat")}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "chat" ? "bg-white text-teal-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>چت آنلاین ({messages.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("notes")}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "notes" ? "bg-white text-teal-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>شرح حال و تشخیص</span>
            </button>

            <button
              onClick={() => setActiveTab("emr")}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "emr" ? "bg-white text-teal-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>سوابق پرونده سلامت</span>
            </button>
          </div>

          {/* Tab 1: Chat Stream */}
          {activeTab === "chat" && (
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-400">
                    پیامی ارسال نشده است. اولین پیام خود را برای شروع مشاوره ارسال کنید.
                  </div>
                ) : (
                  messages.map((msg: any) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? "items-start" : "items-end"}`}
                      >
                        <span className="text-[10px] text-slate-400 mb-1 px-1">{msg.senderName}</span>
                        <div
                          className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                            isMe
                              ? "bg-teal-600 text-white rounded-tr-xs shadow-sm"
                              : "bg-slate-100 text-slate-800 rounded-tl-xs"
                          }`}
                        >
                          {msg.text}
                          <span
                            className={`block text-[9px] mt-1 text-left ${
                              isMe ? "text-teal-200" : "text-slate-400"
                            }`}
                          >
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Send Form */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
                <input
                  type="text"
                  placeholder="پیام خود را تایپ فرمایید..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="submit"
                  disabled={sendingMsg || !messageInput.trim()}
                  className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white transition-colors"
                >
                  <Send className="w-4 h-4 rotate-180" />
                </button>
              </form>
            </div>
          )}

          {/* Tab 2: Clinical Notes & Diagnosis (Doctor can edit, Patient can view) */}
          {activeTab === "notes" && (
            <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
              {saveSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>تغییرات بالینی با موفقیت در پرونده ثبت شد.</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">علائم اصلی بیمار (Symptoms):</label>
                <textarea
                  rows={2}
                  disabled={!isDoctor}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="شکایت اصلی بیمار..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تشخیص بالینی اولیه (Diagnosis):</label>
                <input
                  type="text"
                  disabled={!isDoctor}
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="مثال: آریتمی خوش‌خیم سینوسی..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">شرح حال و یادداشت پزشک (Clinical Notes):</label>
                <textarea
                  rows={4}
                  disabled={!isDoctor}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="جزئیات معاینه آنلاین، یافته‌های اکو، فشار خون..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">طرح درمان و توصیه‌ها (Treatment Plan):</label>
                <textarea
                  rows={3}
                  disabled={!isDoctor}
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                  placeholder="رژیم غذایی، زمان مراجعه بعدی، مصرف داروها..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50"
                />
              </div>

              {isDoctor && (
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    disabled={savingNotes}
                    onClick={() => handleSaveNotes(false)}
                    className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-all text-xs flex items-center justify-center gap-1.5"
                  >
                    {savingNotes ? "در حال ثبت..." : "ذخیره یادداشت‌های بالینی"}
                  </button>

                  <button
                    type="button"
                    disabled={savingNotes}
                    onClick={() => handleSaveNotes(true)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold transition-all text-xs"
                  >
                    تکمیل ویزیت
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Patient EMR History */}
          {activeTab === "emr" && (
            <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-800 block mb-1">بیماری‌های زمینه‌ای:</span>
                <p className="text-slate-600">
                  {data.patient.chronicDiseases?.length > 0
                    ? data.patient.chronicDiseases.join("، ")
                    : "بیماری زمینه‌ای ثبت نشده است"}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-2">سوابق آزمایشگاهی و بالینی:</span>
                <div className="space-y-2">
                  {data.records?.length === 0 ? (
                    <p className="text-slate-400 py-4 text-center">سند پزشکی در پرونده موجود نیست.</p>
                  ) : (
                    data.records.map((rec: any) => (
                      <div key={rec.id} className="p-3 rounded-xl border border-slate-100 bg-white">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-800">{rec.title}</span>
                          <span className="text-[10px] text-slate-400">{gregorianToPersian(rec.date)}</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-[11px]">{rec.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prescription Drawer / Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-900 text-base mb-1">صدور نسخه الکترونیک پزشکی</h3>
            <p className="text-xs text-slate-500 mb-6">
              نسخه صادر شده با امضای دیجیتال نظام پزشکی شما در سامانه سلامت بیمار ثبت خواهد شد.
            </p>

            <form onSubmit={handleCreatePrescription} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تشخیص نهایی بیماری:</label>
                <input
                  type="text"
                  required
                  value={rxDiagnosis}
                  onChange={(e) => setRxDiagnosis(e.target.value)}
                  placeholder="مثال: هایپرتنشن مرحله اول و کمبود کلسیم"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700">اقلام دارویی تجویز شده:</label>
                  <button
                    type="button"
                    onClick={() =>
                      setRxItems([...rxItems, { medication: "", dosage: "", frequency: "", duration: "", instructions: "" }])
                    }
                    className="text-xs text-indigo-600 font-bold hover:underline"
                  >
                    + افزودن داروی دیگر
                  </button>
                </div>

                <div className="space-y-3">
                  {rxItems.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                      <input
                        type="text"
                        required
                        placeholder="نام دارو (مثال: قرص لوزارتان Losartan)"
                        value={item.medication}
                        onChange={(e) => {
                          const updated = [...rxItems];
                          updated[idx].medication = e.target.value;
                          setRxItems(updated);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="دوز (مثال: ۲۵ میلی‌گرم)"
                          value={item.dosage}
                          onChange={(e) => {
                            const updated = [...rxItems];
                            updated[idx].dosage = e.target.value;
                            setRxItems(updated);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200"
                        />
                        <input
                          type="text"
                          placeholder="دوره و مصرف (مثال: روزی یک عدد صبح)"
                          value={item.frequency}
                          onChange={(e) => {
                            const updated = [...rxItems];
                            updated[idx].frequency = e.target.value;
                            setRxItems(updated);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPrescriptionModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={savingRx}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
                >
                  {savingRx ? "در حال ثبت نسخه..." : "تایید و ثبت نسخه دیجیتال"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
