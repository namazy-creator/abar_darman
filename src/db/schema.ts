import { pgTable, text, timestamp, boolean, integer, jsonb, pgEnum } from "drizzle-orm/pg-core";

// Role enum
export const userRoleEnum = pgEnum("user_role", [
  "patient",
  "doctor",
  "clinic_admin",
  "super_admin"
]);

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "no_show"
]);

export const consultationTypeEnum = pgEnum("consultation_type", [
  "video",
  "audio",
  "chat",
  "in_person"
]);

// 1. Users
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  fullNameEn: text("full_name_en"),
  phoneNumber: text("phone_number"),
  role: userRoleEnum("role").notNull().default("patient"),
  avatarUrl: text("avatar_url"),
  nationalId: text("national_id"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2. Clinics
export const clinics = pgTable("clinics", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  licenseNumber: text("license_number"),
  adminUserId: text("admin_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. Specialties
export const specialties = pgTable("specialties", {
  id: text("id").primaryKey(),
  nameFa: text("name_fa").notNull(),
  nameEn: text("name_en").notNull(),
  icon: text("icon").notNull().default("Stethoscope"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. Doctor Profiles
export const doctorProfiles = pgTable("doctor_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  medicalLicense: text("medical_license").notNull(),
  specialtyId: text("specialty_id").references(() => specialties.id),
  clinicId: text("clinic_id").references(() => clinics.id),
  qualifications: text("qualifications"), // e.g. MD, Fellowship in Cardiology
  bio: text("bio"),
  experienceYears: integer("experience_years").default(5),
  consultationFee: integer("consultation_fee").notNull().default(350000), // in Tomans
  supportedTypes: jsonb("supported_types").$type<string[]>().default(["video", "audio", "chat", "in_person"]),
  rating: text("rating").default("4.9"),
  totalReviews: integer("total_reviews").default(120),
  isAvailableToday: boolean("is_available_today").default(true),
  gender: text("gender").default("male"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 5. Patient Profiles
export const patientProfiles = pgTable("patient_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  birthDate: text("birth_date"), // e.g. 1365/04/12 or 1986-07-03
  gender: text("gender").default("male"),
  bloodGroup: text("blood_group").default("O+"),
  height: integer("height"), // in cm
  weight: integer("weight"), // in kg
  emergencyContact: text("emergency_contact"),
  allergies: jsonb("allergies").$type<string[]>().default([]),
  chronicDiseases: jsonb("chronic_diseases").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 6. Doctor Availability
export const doctorAvailability = pgTable("doctor_availability", {
  id: text("id").primaryKey(),
  doctorId: text("doctor_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Sat, 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri
  startTime: text("start_time").notNull(), // "09:00"
  endTime: text("end_time").notNull(), // "17:00"
  slotDuration: integer("slot_duration").notNull().default(30), // minutes
  breakStartTime: text("break_start_time").default("13:00"),
  breakEndTime: text("break_end_time").default("14:00"),
  consultationTypes: jsonb("consultation_types").$type<string[]>().default(["video", "audio", "chat"]),
  isActive: boolean("is_active").default(true),
});

// 7. Appointments
export const appointments = pgTable("appointments", {
  id: text("id").primaryKey(),
  patientId: text("patient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  doctorId: text("doctor_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  clinicId: text("clinic_id").references(() => clinics.id),
  date: text("date").notNull(), // YYYY-MM-DD
  timeSlot: text("time_slot").notNull(), // "10:30"
  type: consultationTypeEnum("type").notNull().default("video"),
  status: appointmentStatusEnum("status").notNull().default("confirmed"),
  patientNotes: text("patient_notes"),
  amount: integer("amount").notNull().default(350000),
  isPaid: boolean("is_paid").default(true),
  meetingRoomId: text("meeting_room_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 8. Consultations & Telemedicine Session Workspace
export const consultations = pgTable("consultations", {
  id: text("id").primaryKey(),
  appointmentId: text("appointment_id").notNull().references(() => appointments.id, { onDelete: "cascade" }),
  doctorId: text("doctor_id").notNull().references(() => users.id),
  patientId: text("patient_id").notNull().references(() => users.id),
  symptoms: text("symptoms"),
  clinicalNotes: text("clinical_notes"),
  diagnosis: text("diagnosis"),
  treatmentPlan: text("treatment_plan"),
  followUpDate: text("follow_up_date"),
  chatMessages: jsonb("chat_messages").$type<{
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: string;
    fileUrl?: string;
  }[]>().default([]),
  status: text("status").notNull().default("in_progress"), // in_progress, completed
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
});

// 9. Prescriptions
export const prescriptions = pgTable("prescriptions", {
  id: text("id").primaryKey(),
  appointmentId: text("appointment_id").references(() => appointments.id),
  doctorId: text("doctor_id").notNull().references(() => users.id),
  patientId: text("patient_id").notNull().references(() => users.id),
  diagnosis: text("diagnosis").notNull(),
  items: jsonb("items").$type<{
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[]>().notNull().default([]),
  notes: text("notes"),
  status: text("status").notNull().default("active"), // active, dispensed, expired
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 10. Electronic Medical Records (EMR)
export const medicalRecords = pgTable("medical_records", {
  id: text("id").primaryKey(),
  patientId: text("patient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  doctorId: text("doctor_id").references(() => users.id),
  title: text("title").notNull(),
  recordType: text("record_type").notNull(), // lab_test, radiology, surgery, clinical_summary, allergy_note
  description: text("description").notNull(),
  resultsData: jsonb("results_data").$type<Record<string, any>>().default({}),
  fileUrl: text("file_url"),
  date: text("date").notNull(), // YYYY-MM-DD
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 11. Notifications
export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"), // info, appointment, prescription, system
  link: text("link"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
