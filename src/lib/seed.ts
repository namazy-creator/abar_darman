import { db } from "@/db";
import {
  users,
  clinics,
  specialties,
  doctorProfiles,
  patientProfiles,
  doctorAvailability,
  appointments,
  consultations,
  prescriptions,
  medicalRecords,
  notifications
} from "@/db/schema";
import bcrypt from "bcryptjs";

export async function runDatabaseSeed() {
  // Check if users already seeded
  const existingUsers = await db.select().from(users).limit(1);
  if (existingUsers.length > 0) {
    return { status: "already_seeded", count: existingUsers.length };
  }

  const defaultPassword = await bcrypt.hash("123456", 10);

  // 1. Super Admin
  const adminId = "user_super_admin_1";
  await db.insert(users).values({
    id: adminId,
    email: "admin@telemed.ir",
    passwordHash: defaultPassword,
    fullName: "دکتر کیانوش رستمی",
    fullNameEn: "Dr. Kianoush Rostami",
    phoneNumber: "09121112233",
    role: "super_admin",
    nationalId: "0019283741",
    avatarUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80",
    isActive: true,
  });

  // 2. Clinics & Clinic Admins
  const clinicAdmin1Id = "user_clinic_admin_1";
  await db.insert(users).values({
    id: clinicAdmin1Id,
    email: "clinic1@telemed.ir",
    passwordHash: defaultPassword,
    fullName: "مهندس سارا جمشیدی",
    fullNameEn: "Sara Jamshidi",
    phoneNumber: "09123334455",
    role: "clinic_admin",
    nationalId: "0028371942",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    isActive: true,
  });

  const clinic1Id = "clinic_atieh";
  await db.insert(clinics).values({
    id: clinic1Id,
    name: "مرکز درمانی فوق تخصصی آتیه",
    nameEn: "Atieh Specialized Medical Center",
    address: "تهران، شهرک غرب، بلوار فرحزادی، تقاطع شهید دادمان",
    phone: "02182721",
    email: "info@atieh.ir",
    licenseNumber: "MED-CLINIC-9021",
    adminUserId: clinicAdmin1Id,
  });

  const clinic2Id = "clinic_pars";
  await db.insert(clinics).values({
    id: clinic2Id,
    name: "مجتمع پزشکی و بالینی پارس",
    nameEn: "Pars Clinical Complex",
    address: "تهران، میدان ونک، خیابان ولیعصر، خیابان نگار",
    phone: "02188882000",
    email: "support@parsclinic.com",
    licenseNumber: "MED-CLINIC-7741",
    adminUserId: clinicAdmin1Id,
  });

  // 3. Specialties
  const specList = [
    { id: "spec_cardio", fa: "متخصص قلب و عروق", en: "Cardiology", desc: "تشخیص و درمان بیماری‌های قلبی، فشار خون و نارسایی قلبی", icon: "HeartPulse" },
    { id: "spec_derma", fa: "متخصص پوست، مو و زیبایی", en: "Dermatology", desc: "مراقبت، درمان آکنه، اگزما و بیماری‌های پوستی", icon: "Sparkles" },
    { id: "spec_neuro", fa: "متخصص مغز و اعصاب", en: "Neurology", desc: "درمان سردردهای میگرنی، اختلالات خواب و بیماری‌های عصبی", icon: "Brain" },
    { id: "spec_psych", fa: "روان‌پزشک و مشاور اعصاب و روان", en: "Psychiatry", desc: "مدیریت استرس، افسردگی، پنیک و مشاوره‌های فردی", icon: "Smile" },
    { id: "spec_pedia", fa: "متخصص بیماری‌های کودکان", en: "Pediatrics", desc: "پایش رشد، سلامت نوزادان و بیماری‌های عفونی اطفال", icon: "Baby" },
    { id: "spec_ortho", fa: "متخصص ارتوپدی و مفاصل", en: "Orthopedics", desc: "درمان دردهای مفصلی، آرتروز، دیسک کمر و ستون فقرات", icon: "Bone" },
    { id: "spec_internal", fa: "متخصص بیماری‌های داخلی", en: "Internal Medicine", desc: "کنترل دیابت، تیروئید، مشکلات گوارشی و غدد", icon: "Activity" },
  ];

  for (const s of specList) {
    await db.insert(specialties).values({
      id: s.id,
      nameFa: s.fa,
      nameEn: s.en,
      description: s.desc,
      icon: s.icon,
    });
  }

  // 4. Doctors (10 Doctors)
  const doctorsData = [
    {
      id: "doc_1",
      email: "doctor@telemed.ir", // Quick demo login
      name: "دکتر مریم شفیعی",
      nameEn: "Dr. Maryam Shafiei",
      phone: "09124445566",
      specialtyId: "spec_cardio",
      clinicId: clinic1Id,
      license: "ن-۷۸۲۱۹",
      qualifications: "فوق تخصص آنژیوپلاستی و اکوکاردیوگرافی از دانشگاه تهران",
      bio: "بیش از ۱۲ سال تجربه در درمان آریتمی قلبی، فشار خون بالا و بازتوانی بیماران قلبی.",
      exp: 12,
      fee: 380000,
      rating: "4.95",
      reviews: 240,
      gender: "female",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80",
    },
    {
      id: "doc_2",
      email: "doc.alireza@telemed.ir",
      name: "دکتر علیرضا احمدی",
      nameEn: "Dr. Alireza Ahmadi",
      phone: "09125556677",
      specialtyId: "spec_derma",
      clinicId: clinic1Id,
      license: "ن-۶۵۳۴۲",
      qualifications: "بورد تخصصی درماتولوژی، لیزر و کاشت مو",
      bio: "عضو انجمن متخصصین پوست ایران، درمان‌های نوین پسوریازیس و آلرژی‌های شدید پوستی.",
      exp: 9,
      fee: 320000,
      rating: "4.88",
      reviews: 180,
      gender: "male",
      avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80",
    },
    {
      id: "doc_3",
      email: "doc.niloofar@telemed.ir",
      name: "دکتر نیلوفر رضایی",
      nameEn: "Dr. Niloofar Rezaei",
      phone: "09126667788",
      specialtyId: "spec_neuro",
      clinicId: clinic2Id,
      license: "ن-۸۴۹۳۱",
      qualifications: "متخصص مغز و اعصاب، فلوشیپ ام اس و سردرد",
      bio: "مشاوره و درمان میگرن مزمن، صرع، وزوز گوش و اختلالات تعادل حرکتی.",
      exp: 14,
      fee: 420000,
      rating: "4.92",
      reviews: 310,
      gender: "female",
      avatar: "https://images.unsplash.com/photo-1594824813590-70529d3cf556?w=200&auto=format&fit=crop&q=80",
    },
    {
      id: "doc_4",
      email: "doc.hossein@telemed.ir",
      name: "دکتر حسین مرادی",
      nameEn: "Dr. Hossein Moradi",
      phone: "09127778899",
      specialtyId: "spec_psych",
      clinicId: clinic2Id,
      license: "ن-۴۲۳۱۱",
      qualifications: "بورد تخصصی اعصاب و روان و روان‌درمانی تحلیلی",
      bio: "درمان دارویی و روان‌درمانی وسواس فکری، پنیک، اضطراب اجتماعی و افسردگی حاد.",
      exp: 8,
      fee: 350000,
      rating: "4.90",
      reviews: 145,
      gender: "male",
      avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&auto=format&fit=crop&q=80",
    },
    {
      id: "doc_5",
      email: "doc.zahra@telemed.ir",
      name: "دکتر زهرا اکبری",
      nameEn: "Dr. Zahra Akbari",
      phone: "09128889900",
      specialtyId: "spec_pedia",
      clinicId: clinic1Id,
      license: "ن-۹۱۰۲۳",
      qualifications: "فوق تخصص نوزادان و بیماری‌های عفونی اطفال",
      bio: "پایش نمودار رشد کودکان، واکسیناسیون، تغذیه و درمان حساسیت‌های غذایی شیرخواران.",
      exp: 11,
      fee: 300000,
      rating: "4.97",
      reviews: 280,
      gender: "female",
      avatar: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=200&auto=format&fit=crop&q=80",
    },
    {
      id: "doc_6",
      email: "doc.babak@telemed.ir",
      name: "دکتر بابک کریمی",
      nameEn: "Dr. Babak Karimi",
      phone: "09129990011",
      specialtyId: "spec_ortho",
      clinicId: clinic2Id,
      license: "ن-۳۲۸۴۷",
      qualifications: "جراح استخوان و مفاصل، فوق تخصص تعویض مفصل زانو",
      bio: "درمان دیسک گردن و کمر، آسیب‌های ورزشی رباط صلیبی و مینیسک با جدیدترین روش‌ها.",
      exp: 16,
      fee: 450000,
      rating: "4.86",
      reviews: 195,
      gender: "male",
      avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&auto=format&fit=crop&q=80",
    },
    {
      id: "doc_7",
      email: "doc.samira@telemed.ir",
      name: "دکتر سمیرا کاویانی",
      nameEn: "Dr. Samira Kaviani",
      phone: "09121110022",
      specialtyId: "spec_internal",
      clinicId: clinic1Id,
      license: "ن-۵۸۲۹۱",
      qualifications: "متخصص داخلی، دیابتولوژیست و درمان کبد چرب",
      bio: "تنظیم تخصصی قند خون، دیابت حاملگی، غدد تیروئید و بیماری‌های روده تحریک‌پذیر.",
      exp: 10,
      fee: 340000,
      rating: "4.93",
      reviews: 210,
      gender: "female",
      avatar: "https://images.unsplash.com/photo-1594824813590-70529d3cf556?w=200&auto=format&fit=crop&q=80",
    },
    {
      id: "doc_8",
      email: "doc.mohammad@telemed.ir",
      name: "دکتر محمد حیدری",
      nameEn: "Dr. Mohammad Heidari",
      phone: "09122221133",
      specialtyId: "spec_cardio",
      clinicId: clinic2Id,
      license: "ن-۷۴۱۸۲",
      qualifications: "بورد تخصصی بیماری‌های قلب و اکوکاردیوگرافی پیشرفته",
      bio: "مشاوره آنلاین آنژیوگرافی، درمان تپش قلب و بازبینی مدارک پزشکی بیماران سکته قلبی.",
      exp: 15,
      fee: 390000,
      rating: "4.89",
      reviews: 160,
      gender: "male",
      avatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&auto=format&fit=crop&q=80",
    },
    {
      id: "doc_9",
      email: "doc.leila@telemed.ir",
      name: "دکتر لیلا فراهانی",
      nameEn: "Dr. Leila Farahani",
      phone: "09123332244",
      specialtyId: "spec_derma",
      clinicId: clinic2Id,
      license: "ن-۶۹۵۱۱",
      qualifications: "فوق تخصص جراحی پوست و مزوتراپی درمانی",
      bio: "درمان تخصصی لک و کک‌ومک، ریزش موی ارثی و جوان‌سازی پوست.",
      exp: 7,
      fee: 310000,
      rating: "4.91",
      reviews: 130,
      gender: "female",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80",
    },
    {
      id: "doc_10",
      email: "doc.arash@telemed.ir",
      name: "دکتر آرش باقری",
      nameEn: "Dr. Arash Bagheri",
      phone: "09124443355",
      specialtyId: "spec_internal",
      clinicId: clinic1Id,
      license: "ن-۸۱۳۲۹",
      qualifications: "متخصص داخلی و گوارش، اندوسکوپی و کولونوسکوپی",
      bio: "تشخیص دقیق رفلاکس معده، هلیکوباکتر پیلوری و بیماری‌های سوءهاضمه.",
      exp: 13,
      fee: 360000,
      rating: "4.94",
      reviews: 275,
      gender: "male",
      avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80",
    },
  ];

  for (const doc of doctorsData) {
    await db.insert(users).values({
      id: doc.id,
      email: doc.email,
      passwordHash: defaultPassword,
      fullName: doc.name,
      fullNameEn: doc.nameEn,
      phoneNumber: doc.phone,
      role: "doctor",
      avatarUrl: doc.avatar,
      nationalId: `00${Math.floor(10000000 + Math.random() * 90000000)}`,
      isActive: true,
    });

    await db.insert(doctorProfiles).values({
      id: `prof_${doc.id}`,
      userId: doc.id,
      specialtyId: doc.specialtyId,
      clinicId: doc.clinicId,
      medicalLicense: doc.license,
      qualifications: doc.qualifications,
      bio: doc.bio,
      experienceYears: doc.exp,
      consultationFee: doc.fee,
      rating: doc.rating,
      totalReviews: doc.reviews,
      gender: doc.gender,
      isAvailableToday: true,
      supportedTypes: ["video", "audio", "chat", "in_person"],
    });

    // Seed Availability for this doctor (Saturday through Wednesday: 09:00 - 18:00)
    for (let day = 0; day <= 4; day++) {
      await db.insert(doctorAvailability).values({
        id: `avail_${doc.id}_day_${day}`,
        doctorId: doc.id,
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "18:00",
        slotDuration: 30,
        breakStartTime: "13:00",
        breakEndTime: "14:00",
        consultationTypes: ["video", "audio", "chat"],
        isActive: true,
      });
    }
  }

  // 5. Patients (Primary demo patient + 15 others)
  const patient1Id = "patient_1";
  await db.insert(users).values({
    id: patient1Id,
    email: "patient@telemed.ir", // Quick demo login
    passwordHash: defaultPassword,
    fullName: "امیرحسین صادقی",
    fullNameEn: "Amir Hossein Sadeghi",
    phoneNumber: "09351234567",
    role: "patient",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    nationalId: "0018492041",
    isActive: true,
  });

  await db.insert(patientProfiles).values({
    id: `prof_${patient1Id}`,
    userId: patient1Id,
    birthDate: "1370/06/15",
    gender: "male",
    bloodGroup: "A+",
    height: 178,
    weight: 76,
    emergencyContact: "09121118899 (همسر)",
    allergies: ["پنی‌سیلین", "گرد و غبار فصلی"],
    chronicDiseases: ["فشار خون خفیف", "میگرن دوره‌ای"],
  });

  const demoPatients = [
    { id: "pat_2", name: "فاطمه معتمدی", email: "fatemeh@demo.ir", phone: "09361112233", bg: "B+", gender: "female" },
    { id: "pat_3", name: "محمدرضا صابری", email: "reza@demo.ir", phone: "09372223344", bg: "O+", gender: "male" },
    { id: "pat_4", name: "شیدا انصاری", email: "sheida@demo.ir", phone: "09383334455", bg: "AB-", gender: "female" },
    { id: "pat_5", name: "علی توکلی", email: "ali@demo.ir", phone: "09394445566", bg: "O-", gender: "male" },
    { id: "pat_6", name: "مهسا ابراهیمی", email: "mahsa@demo.ir", phone: "09125557788", bg: "A-", gender: "female" },
    { id: "pat_7", name: "کامران داداشی", email: "kamran@demo.ir", phone: "09126668899", bg: "B-", gender: "male" },
    { id: "pat_8", name: "پرستو شجاعی", email: "parastoo@demo.ir", phone: "09127779900", bg: "A+", gender: "female" },
    { id: "pat_9", name: "وحید پیروزی", email: "vahid@demo.ir", phone: "09128880011", bg: "O+", gender: "male" },
    { id: "pat_10", name: "رویا کاظمی", email: "roya@demo.ir", phone: "09129991122", bg: "B+", gender: "female" },
  ];

  for (const p of demoPatients) {
    await db.insert(users).values({
      id: p.id,
      email: p.email,
      passwordHash: defaultPassword,
      fullName: p.name,
      phoneNumber: p.phone,
      role: "patient",
      nationalId: `00${Math.floor(10000000 + Math.random() * 90000000)}`,
      isActive: true,
    });

    await db.insert(patientProfiles).values({
      id: `prof_${p.id}`,
      userId: p.id,
      birthDate: "1368/03/20",
      gender: p.gender,
      bloodGroup: p.bg,
      height: 172,
      weight: 68,
      allergies: ["سفالوسپورین"],
      chronicDiseases: [],
    });
  }

  // 6. Appointments
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const appt1Id = "appt_active_1";
  await db.insert(appointments).values({
    id: appt1Id,
    patientId: patient1Id,
    doctorId: "doc_1",
    clinicId: clinic1Id,
    date: todayStr,
    timeSlot: "11:30",
    type: "video",
    status: "in_progress",
    patientNotes: "تپش قلب متناوب و درد خفیف در ناحیه قفسه سینه هنگام فعالیت ورزشی",
    amount: 380000,
    isPaid: true,
    meetingRoomId: "room-telemed-doc1-pat1",
  });

  const appt2Id = "appt_upcoming_2";
  await db.insert(appointments).values({
    id: appt2Id,
    patientId: patient1Id,
    doctorId: "doc_2",
    clinicId: clinic1Id,
    date: tomorrowStr,
    timeSlot: "16:00",
    type: "chat",
    status: "confirmed",
    patientNotes: "معاینه مجدد ضایعه پوستی ساعد دست راست بعد از مصرف پماد",
    amount: 320000,
    isPaid: true,
    meetingRoomId: "room-telemed-doc2-pat1",
  });

  const appt3Id = "appt_completed_3";
  await db.insert(appointments).values({
    id: appt3Id,
    patientId: patient1Id,
    doctorId: "doc_7",
    clinicId: clinic1Id,
    date: yesterdayStr,
    timeSlot: "10:00",
    type: "audio",
    status: "completed",
    patientNotes: "بررسی نتایج آزمایش خون و هورمون‌های تیروئید",
    amount: 340000,
    isPaid: true,
  });

  // Additional appointments for doctor dashboard
  await db.insert(appointments).values({
    id: "appt_doc1_pat2",
    patientId: "pat_2",
    doctorId: "doc_1",
    clinicId: clinic1Id,
    date: todayStr,
    timeSlot: "14:00",
    type: "video",
    status: "confirmed",
    patientNotes: "چکاپ دوره‌ای فشار خون بارداری",
    amount: 380000,
    isPaid: true,
    meetingRoomId: "room-telemed-doc1-pat2",
  });

  await db.insert(appointments).values({
    id: "appt_doc1_pat3",
    patientId: "pat_3",
    doctorId: "doc_1",
    clinicId: clinic1Id,
    date: todayStr,
    timeSlot: "15:30",
    type: "video",
    status: "confirmed",
    patientNotes: "مشاوره درباره مصرف قرص آتورواستاتین و تپش قلب",
    amount: 380000,
    isPaid: true,
  });

  // 7. Active Consultation Workspace for appt1
  await db.insert(consultations).values({
    id: "cons_active_1",
    appointmentId: appt1Id,
    doctorId: "doc_1",
    patientId: patient1Id,
    symptoms: "تپش قلب گهگاهی، تنگی نفس خفیف هنگام بالارفتن از پله‌ها",
    clinicalNotes: "بیمار هوشیار و علائم حیاتی پایدار است. فشار خون در مطب خانگی ۱۲۵/۸۰ گزارش شده است. نیاز به هولتر مانیتورینگ ۴۸ ساعته جهت بررسی دقیق‌تر.",
    diagnosis: "تاکی‌کاردی سینوسی حمله‌ای خوش‌خیم (Paroxysmal Sinus Tachycardia)",
    treatmentPlan: "مصرف پروپرانولول ۱۰ میلی‌گرم صبح‌ها، کاهش مصرف قهوه و چای پررنگ، انجام اکوکاردیوگرافی و آزمایش تیروئید.",
    followUpDate: "دو هفته آینده",
    status: "in_progress",
    chatMessages: [
      {
        id: "msg_1",
        senderId: "doc_1",
        senderName: "دکتر مریم شفیعی",
        text: "سلام آقای صادقی عزیز، صدای بنده و تصویر به خوبی دریافت می‌شود؟",
        timestamp: "11:31",
      },
      {
        id: "msg_2",
        senderId: patient1Id,
        senderName: "امیرحسین صادقی",
        text: "سلام خانم دکتر، بله کاملاً شفاف است. خدمتتون هستم.",
        timestamp: "11:32",
      },
      {
        id: "msg_3",
        senderId: "doc_1",
        senderName: "دکتر مریم شفیعی",
        text: "بسیار عالی، شرح حال شما را مطالعه کردم. لطفاً بفرمایید آیا درد به بازوی چپ یا فک هم انتشار دارد؟",
        timestamp: "11:33",
      },
      {
        id: "msg_4",
        senderId: patient1Id,
        senderName: "امیرحسین صادقی",
        text: "خیر خوشبختانه فقط در مرکز سینه احساس ضربان تند و گرفتگی ناگهانی دارم.",
        timestamp: "11:34",
      }
    ],
  });

  // 8. Prescriptions
  await db.insert(prescriptions).values({
    id: "rx_1",
    appointmentId: appt3Id,
    doctorId: "doc_7",
    patientId: patient1Id,
    diagnosis: "کم‌کاری خفیف تیروئید و کمبود ویتامین D3",
    items: [
      {
        medication: "قرص لووتیروکسین (Levothyroxine)",
        dosage: "۵۰ میکروگرم",
        frequency: "یک عدد ناشتا",
        duration: "۳ ماه",
        instructions: "حداقل نیم ساعت قبل از صرف صبحانه میل شود.",
      },
      {
        medication: "کپسول ویتامین D3",
        dosage: "۵۰,۰۰۰ واحد",
        frequency: "هفته‌ای یک عدد",
        duration: "۸ هفته",
        instructions: "همراه با وعده غذایی چرب میل شود.",
      },
    ],
    notes: "پس از اتمام دوره ۲ ماهه، آزمایش مجدد TSH و 25-OH Vitamin D تکرار شود.",
    status: "active",
  });

  await db.insert(prescriptions).values({
    id: "rx_2",
    appointmentId: appt1Id,
    doctorId: "doc_1",
    patientId: patient1Id,
    diagnosis: "تاکی‌کاردی و اضطراب خفیف قلبی",
    items: [
      {
        medication: "قرص پروپرانولول (Propranolol)",
        dosage: "۱۰ میلی‌گرم",
        frequency: "روزی ۲ بار (صبح و شب)",
        duration: "۱ ماه",
        instructions: "در صورت افت ضربان قلب زیر ۵۵ پالس در دقیقه مصرف را متوقف کنید.",
      },
    ],
    notes: "پرهیز از مصرف الکل، سیگار و محرک‌های کافئین‌دار.",
    status: "active",
  });

  // 9. Electronic Medical Records (EMR)
  await db.insert(medicalRecords).values({
    id: "rec_1",
    patientId: patient1Id,
    doctorId: "doc_7",
    title: "آزمایش خون کامل (CBC, Lipid Profile, Thyroid, Vit D3)",
    recordType: "lab_test",
    date: yesterdayStr,
    description: "نتایج بررسی بیوشیمی، کلسترول کل و آنزیم‌های کبدی. TSH: 4.8 mIU/L, Vit D: 18 ng/mL, Chol: 195 mg/dL.",
    resultsData: {
      "WBC": "6.8 10^3/uL (نرمال)",
      "RBC": "4.9 10^6/uL (نرمال)",
      "Hemoglobin": "15.2 g/dL (نرمال)",
      "TSH": "4.8 mIU/L (بالا)",
      "Vitamin D3": "18.2 ng/mL (کمبود)",
      "FBS": "92 mg/dL (نرمال)"
    },
  });

  await db.insert(medicalRecords).values({
    id: "rec_2",
    patientId: patient1Id,
    doctorId: "doc_1",
    title: "نوار قلب ۱۲ لیدی (ECG)",
    recordType: "clinical_summary",
    date: yesterdayStr,
    description: "ریتم سینوسی نرمال، ضربان قلب ۷۸ در دقیقه، بدون تغییرات قطعه ST یا موج T ایسکمیک.",
    resultsData: {
      "Heart Rate": "78 bpm",
      "PR Interval": "160 ms",
      "QRS Duration": "88 ms",
      "QTc": "410 ms",
      "Interpretation": "Normal Sinus Rhythm"
    },
  });

  // 10. Notifications
  await db.insert(notifications).values({
    id: "notif_1",
    userId: patient1Id,
    title: "اتاق ویزیت تصویری فعال شد",
    message: "جلسه مشاوره شما با دکتر مریم شفیعی آغاز شده است. جهت ورود کلیک کنید.",
    type: "appointment",
    link: `/consultations/${appt1Id}`,
    isRead: false,
  });

  await db.insert(notifications).values({
    id: "notif_2",
    userId: patient1Id,
    title: "نسخه الکترونیک جدید ثبت شد",
    message: "دکتر سمیرا کاویانی نسخه دارویی جدیدی برای شما تجویز نموده است.",
    type: "prescription",
    link: "/prescriptions",
    isRead: true,
  });

  await db.insert(notifications).values({
    id: "notif_3",
    userId: "doc_1",
    title: "بیمار جدید در انتظار ویزیت",
    message: "امیرحسین صادقی وارد اتاق مشاوره تصویری شد.",
    type: "appointment",
    link: `/consultations/${appt1Id}`,
    isRead: false,
  });

  return { status: "success", seededDoctors: doctorsData.length, seededPatients: demoPatients.length + 1 };
}
