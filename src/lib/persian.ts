// Persian Jalali date formatter and number localization helper

const PERSIAN_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
];

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toPersianDigits(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return "";
  return num
    .toString()
    .replace(/[0-9]/g, (w) => PERSIAN_DIGITS[parseInt(w, 10)]);
}

export function formatPrice(amount: number): string {
  const formatted = new Intl.NumberFormat("fa-IR").format(amount);
  return `${formatted} تومان`;
}

// Convert Gregorian YYYY-MM-DD to Persian Date string
export function gregorianToPersian(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return "";
  try {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);
    
    // Intrinsic Intl formatting with Persian calendar
    const formatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return formatter.format(d);
  } catch (e) {
    return String(dateInput);
  }
}

export function gregorianToPersianWithTime(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return "";
  try {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);
    
    const formatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    return formatter.format(d);
  } catch (e) {
    return String(dateInput);
  }
}

export function getStatusBadge(status: string) {
  switch (status) {
    case "confirmed":
      return { labelFa: "تایید شده", labelEn: "Confirmed", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    case "in_progress":
      return { labelFa: "در حال ویزیت", labelEn: "In Progress", bg: "bg-blue-50 text-blue-700 border-blue-200" };
    case "completed":
      return { labelFa: "تکمیل شده", labelEn: "Completed", bg: "bg-slate-100 text-slate-700 border-slate-200" };
    case "cancelled":
      return { labelFa: "لغو شده", labelEn: "Cancelled", bg: "bg-rose-50 text-rose-700 border-rose-200" };
    case "no_show":
      return { labelFa: "عدم حضور", labelEn: "No Show", bg: "bg-amber-50 text-amber-700 border-amber-200" };
    case "pending":
    default:
      return { labelFa: "در انتظار", labelEn: "Pending", bg: "bg-amber-50 text-amber-700 border-amber-200" };
  }
}

export function getTypeBadge(type: string) {
  switch (type) {
    case "video":
      return { labelFa: "ویزیت تصویری", icon: "Video", color: "text-blue-600 bg-blue-50" };
    case "audio":
      return { labelFa: "ویزیت صوتی", icon: "PhoneCall", color: "text-emerald-600 bg-emerald-50" };
    case "chat":
      return { labelFa: "مشاوره متنی", icon: "MessageSquare", color: "text-purple-600 bg-purple-50" };
    case "in_person":
      return { labelFa: "حضوری در مطب", icon: "Building", color: "text-amber-600 bg-amber-50" };
    default:
      return { labelFa: "آنلاین", icon: "Activity", color: "text-slate-600 bg-slate-50" };
  }
}
