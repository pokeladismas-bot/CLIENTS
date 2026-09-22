export type DiabetesType = 'type1' | 'type2' | 'gestational' | 'prediabetes';

export type GlucoseUnit = 'mg/dL' | 'mmol/L';

export type MeasurementTiming = 
  | 'fasting' // Asubuhi kabla ya kula
  | 'pre_breakfast' // Kabla ya kifungua kinywa
  | 'post_breakfast' // Baada ya kifungua kinywa (masaa 2)
  | 'pre_lunch' // Kabla ya chakula cha mchana
  | 'post_lunch' // Baada ya chakula cha mchana (masaa 2)
  | 'pre_dinner' // Kabla ya chakula cha usiku
  | 'post_dinner' // Baada ya chakula cha usiku (masaa 2)
  | 'bedtime' // Kabla ya kulala
  | 'random'; // Wakati wowote

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type GlycemicIndexLevel = 'Chini' | 'Wastani' | 'Juu';

export type FoodSafetyRating = 'Salama Sana' | 'Salama kwa Kiasi' | 'Tumia kwa Tahadhari' | 'Epuka';

export interface FoodPlateItem {
  name: string;
  portion: string;
  carbs: number; // in grams
  fiber: number;
  netCarbs: number;
  protein: number;
  fat: number;
  calories: number;
  glycemicIndex: GlycemicIndexLevel;
}

export interface FoodAnalysisResult {
  foodName: string;
  servingSize: string;
  totalCarbs: number; // in grams
  fiber: number; // in grams
  netCarbs: number; // in grams
  protein: number; // in grams
  fat: number; // in grams
  calories: number; // kcal
  glycemicIndexLevel: GlycemicIndexLevel;
  glycemicIndexValue: number; // 0 - 100
  glycemicLoad: number; // 0 - 40
  safetyRating: FoodSafetyRating;
  itemsBreakdown: FoodPlateItem[];
  glucoseImpactSummary: string;
  diabeticTips: string[];
  portionAdjustmentAdvice: string;
  alternativesSuggested: string[];
}

export interface MealLog {
  id: string;
  patientId?: string; // Links meal to specific patient for strict privacy
  timestamp: string; // ISO string
  mealType: MealType;
  title: string;
  imageUrl?: string;
  totalCarbs: number;
  netCarbs: number;
  fiber: number;
  protein: number;
  fat: number;
  calories: number;
  glycemicIndexLevel: GlycemicIndexLevel;
  glycemicLoad: number;
  safetyRating: FoodSafetyRating;
  itemsBreakdown: FoodPlateItem[];
  diabeticTips: string[];
  glucoseBefore?: number;
  glucoseAfter?: number;
  notes?: string;
}

export interface GlucoseLog {
  id: string;
  patientId?: string; // Links glucose reading to specific patient for strict privacy
  timestamp: string; // ISO string
  value: number; // stored in mg/dL (converted on display if mmol/L is selected)
  unit: GlucoseUnit;
  timing: MeasurementTiming;
  mealId?: string; // linked meal
  notes?: string;
  status: 'chini' | 'kawaida' | 'juu' | 'hatari'; // hypo, normal, elevated, severe
}

export type PortalMode = 'nutritionist' | 'patient';

export type UserRole = 'admin' | 'practitioner' | 'patient';

export interface AuthSession {
  role: UserRole;
  patientId?: string; // Set when role === 'patient'
  practitionerId?: string; // Set when role === 'practitioner'
  username: string;
  name: string;
  email?: string;
  phone?: string;
  loginTime: string;
  canPrintReports?: boolean;
}

export interface SecuritySettings {
  adminPassword: string; // Default: 'admin123'
  adminPin?: string; // PIN ya Kuingia ya Haraka ya Admin (Default: '8822')
  adminName: string; // 'DISMAS POKELA'
  adminEmail: string; // 'dismaspokela@gmail.com'
  allowPatientPrinting: boolean; // Controlled by Admin: whether patients can print/download reports
  requireAdminApprovalForExport: boolean;
  requireLoginFirst: boolean; // Require password/login gate before using the app

  // Mfumo wa Kujifunga Kiotomatiki na Usasishaji wa Mara kwa Mara
  autoLockMinutes?: number; // Dakika za mfumo kujifunga kiotomatiki (e.g. 1, 3, 5, 10, 15, 30)
  autoSyncEnabled?: boolean; // Usasishaji wa mara kwa mara wa Firebase -> User Data -> Settings -> Reports -> Records
  syncIntervalSeconds?: number; // Muda wa mzunguko wa kusasisha taarifa (e.g. 15, 30, 60 sekunde)
  lastSyncedAt?: string; // Wakati taarifa zilisasishwa mara ya mwisho

  // Mfumo wa Kitaalamu & Ulinzi Zaidi (Professional & Advanced Security Controls)
  twoFactorAuthEnabled?: boolean; // Uthibitishaji wa Hatua Mbili (PIN ya pili kwa Admin)
  twoFactorPin?: string; // e.g. '8822'
  sessionTimeoutMinutes?: number; // Dakika za kujifunga kiotomatiki (e.g. 15, 30, 60 au 0 kwa kutositisha)
  auditLoggingEnabled?: boolean; // Rekodi za ukaguzi wa kimatibabu (Clinical Audit Logs)
  watermarkMedicalReports?: boolean; // Weka watermark ya usalama kwenye ripoti za matibabu
  strictDoctorVerification?: boolean; // Zuia daktari kuingia bila nambari rasmi ya MCT/Baraza la Tiba
  ipRestrictionEnabled?: boolean; // Zuia mabadiliko ya mfumo kwa vifaa visivyoidhinishwa
  allowOfflineSyncMode?: boolean; // Ruhusu uhifadhi salama wa ndani bila intaneti
  clinicalEncryptionBadge?: boolean; // Onyesha alama ya ulinzi wa HIPAA / viwango vya afya
  hospitalFacilityName?: string; // Jina rasmi la kliniki/hospitali kwenye ripoti
  registrationCouncilLicense?: string; // Nambari ya Leseni ya Wizara ya Afya / MCT
}

export interface WaterLogEntry {
  id: string;
  timestamp: string;
  glasses: number;
  amountMl: number;
}

export type ClientCategory = 'kisukari' | 'kupunguza_uzito' | 'lishe_jumla' | 'watoto_lishe' | 'shinikizo_la_damu';

export type BloodPressureStatus = 
  | 'chini' // Hypotension: Systolic < 90 au Diastolic < 60
  | 'kawaida' // Normal: Systolic < 120 NA Diastolic < 80
  | 'iliyoinuka' // Elevated: Systolic 120-129 NA Diastolic < 80
  | 'hatua_1' // Stage 1 Hypertension: Systolic 130-139 AU Diastolic 80-89
  | 'hatua_2' // Stage 2 Hypertension: Systolic >= 140 AU Diastolic >= 90
  | 'dharura'; // Hypertensive Crisis: Systolic > 180 NA/AU Diastolic > 120

export interface BloodPressureLog {
  id: string;
  timestamp: string; // ISO string
  systolic: number; // mmHg (e.g. 120)
  diastolic: number; // mmHg (e.g. 80)
  pulse?: number; // bpm (e.g. 72)
  status: BloodPressureStatus;
  notes?: string;
  arm?: 'kushoto' | 'kulia';
  position?: 'kukaa' | 'kusimama' | 'kulala';
}

export type ReferralPriority = 'kawaida' | 'ya_haraka' | 'dharura';
export type ReferralStatus = 'inasubiri' | 'inaendelea' | 'imethibitishwa' | 'imekamilika';

export interface PatientReferral {
  id: string;
  patientId: string;
  date: string;
  referralNumber: string; // e.g., 'RUFAA-2026-001'
  referringDoctor: string; // e.g., 'Dkt. Grace Kimaro (Mtaalam wa Lishe)'
  referringFacility: string; // e.g., 'Kliniki ya AfyaLishe'
  targetFacility: string; // e.g., 'Hospitali ya Taifa Muhimbili'
  targetDepartment: string; // e.g., 'Idara ya Kisukari na Tezi' au 'Idara ya Watoto & Lishe'
  specialistName?: string;
  priority: ReferralPriority;
  status: ReferralStatus;
  primaryDiagnosis: string;
  reasonForReferral: string;
  clinicalSummary: string;
  latestVitals?: {
    glucoseMgDl?: number;
    bloodPressure?: string;
    weightKg?: number;
    heightCm?: number;
    bmi?: number;
    muacCm?: number;
  };
  currentMedications?: string;
  currentDietaryPlan?: string;
  specificInvestigationRequested?: string;
  notesToSpecialist?: string;
}

export type ChildFeedingChallenge = 
  | 'picky_eating' // Kuchagua sana vyakula / Ugumu wa kula
  | 'stunting_growth' // Kudumaa au uzito duni (Failure to thrive)
  | 'type1_diabetes' // Kisukari cha Utotoni (Aina ya 1)
  | 'allergies' // Mizio ya vyakula (Maziwa ya ng'ombe, mayai, karanga, gluteni)
  | 'anemia_deficiency' // Upungufu wa damu au virutubisho (Madini Chuma, Vitamini A)
  | 'sweet_tooth_junk' // Kupenda vyakula vya sukari na pipi/biskuti
  | 'junk_food_dependency' // Kutegemea peremende na vitafunwa vya kiwandani
  | 'poor_appetite' // Kukosa hamu ya kula
  | 'swallowing_chewing' // Changamoto za kumeza au kutafuna
  | 'chewing_swallowing'; // Alias ya kumeza au kutafuna

export interface ChildFeedingLog {
  id: string;
  date: string;
  mealType: 'kifungua_kinywa' | 'mchana' | 'usiku' | 'vitafunwa' | 'maziwa';
  foodItems: string;
  portionConsumed: 'yote' | 'nusu' | 'kidogo' | 'alikataa';
  waterAndFluidsMl?: number;
  reactionOrAllergy?: string;
  moodDuringMeal?: 'mchangamfu' | 'alilazimishwa' | 'alilia' | 'taratibu';
  notes?: string;
}

export interface ChildNutritionProfile {
  guardianName: string;
  guardianPhone: string;
  guardianRelation: string; // Mama, Baba, Mlezi
  birthDate?: string;
  ageMonths?: number;
  breastfeedingStatus: 'anaendelea' | 'ameachishwa' | 'haihusiki';
  weaningAgeMonths?: number;
  birthWeightKg?: number;
  muacCm?: number; // Mid-Upper Arm Circumference (Mzingo wa mkono)
  muacStatus?: 'kijani' | 'njano' | 'nyekundu'; // Kijani >12.5cm, Njano 11.5-12.5cm, Nyekundu <11.5cm
  growthPercentileNotes?: string;
  feedingChallenges: ChildFeedingChallenge[];
  knownAllergies: string[];
  favoriteFoods: string[];
  dislikedFoods: string[];
  feedingLogs: ChildFeedingLog[];
  specialPediatricDietPlan?: string;
}

export interface PatientAIAnalysisResult {
  patientName: string;
  analyzedDate: string;
  overallHealthTrend: 'inaboreka' | 'thabiti' | 'inazidi_kushuka' | 'inahitaji_uangalizi_wa_haraka';
  executiveSummary: string;
  glucoseTrendAnalysis: {
    averageGlucose: number;
    fastingTrend: string;
    postMealTrend: string;
    spikesOrDropsPattern: string;
    glycemicVariability: string;
  };
  criticalAlerts: string[]; // Urgent clinical warnings (e.g. Dawn Phenomenon, night hypos, severe swings)
  clinicalDietaryRecommendations: string[];
  suggestedActionItemsForNutritionist: string[];
  pediatricInsights?: string; // If child patient
  referralRecommendation?: {
    isRecommended: boolean;
    recommendedDepartment?: string;
    clinicalJustification?: string;
  };
}

export interface NutritionistPrescription {
  id: string;
  date: string; // ISO string
  nutritionistName: string;
  clinicalAssessment: string;
  recommendedDailyCalories: number;
  recommendedDailyCarbsGrams: number;
  recommendedDailyProteinGrams: number;
  recommendedDailyFiberGrams: number;
  dietaryInstructions: string;
  foodsToEmphasize: string[];
  foodsToStrictlyAvoid: string[];
  mealPlanSummary?: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks: string;
  };
  targetWeightKg?: number;
  targetGlucoseMgDl?: number;
  nextCheckupDate?: string;
}

export interface WeightLogEntry {
  id: string;
  date: string;
  weightKg: number;
  notes?: string;
}

export type WeightLog = WeightLogEntry;

export interface RegisteredPatient {
  id: string;
  fullName: string;
  phone: string;
  age: number;
  gender: 'male' | 'female';
  location: string;
  category: ClientCategory; // 'kisukari' | 'kupunguza_uzito' | 'lishe_jumla'
  registeredDate: string;
  
  // Login credentials for patient privacy
  username?: string;
  email?: string; // Registered email for account recovery and notifications
  password?: string; // Login password or PIN for patient portal
  canPrintReports?: boolean; // Patient-level print permission granted by admin
  
  // Baseline & Target Metrics
  initialWeightKg: number;
  currentWeightKg: number;
  targetWeightKg: number;
  heightCm: number;
  initialGlucoseMgDl?: number;
  currentGlucoseMgDl?: number;
  bloodPressure?: string; // e.g. "125/82"
  waistCm?: number;
  
  // Diabetes Specific (if category === 'kisukari')
  diabetesType?: DiabetesType;
  
  // Clinical / Dietary info
  allergies?: string[];
  foodPreferences?: string;
  medicalConditions?: string;
  currentMedications?: string;
  primaryGoal: string;
  
  // Prescribed Meal Plans & Doctor's/Nutritionist's Notes
  prescriptions: NutritionistPrescription[];

  // Weight logs for weight loss tracking
  weightLogs: WeightLogEntry[];

  // Medical & Clinical Referrals (Rufaa za Mgonjwa)
  referrals?: PatientReferral[];

  // Pediatric & Child Nutrition Tracking (Watoto & Changamoto za Kilishe)
  childProfile?: ChildNutritionProfile;

  // Blood Pressure Logs (Vipimo vya Shinikizo la Damu)
  bloodPressureLogs?: BloodPressureLog[];
}

export interface MealReminderItem {
  id: string;
  name: string; // e.g. "Kifungua Kinywa", "Mchana", "Usiku", "Vitafunwa"
  time: string; // "07:30"
  enabled: boolean;
  notes: string;
  completedToday?: boolean;
}

export interface HydrationReminderConfig {
  enabled: boolean;
  dailyTargetGlasses: number; // e.g. 8 - 12
  intervalMinutes: number; // e.g. 60, 90, 120
  startTime: string; // "07:00"
  endTime: string; // "21:00"
  soundEnabled: boolean;
}

export interface UserProfile {
  name: string;
  diabetesType: DiabetesType;
  category?: ClientCategory;
  unit: GlucoseUnit;
  targetFastingMin: number; // default 70 mg/dL
  targetFastingMax: number; // default 130 mg/dL
  targetPostMealMax: number; // default 180 mg/dL
  dailyCarbLimitGrams: number; // default 130g
  dailyCalorieTarget: number; // default 1800 kcal
  dailyProteinTarget: number; // default 75g
  dailyFiberTarget: number; // default 30g
  weightKg?: number;
  targetWeightKg?: number;
  heightCm?: number;
  gender?: 'male' | 'female';
  age?: number;
  waistCm?: number;
  bloodPressure?: string;
  phone?: string;
  location?: string;
  medicationInfo?: string;
  primaryGoal?: string;
  registeredPatientId?: string;
  isAdmin?: boolean;
  dailyReminders?: DailyReminderConfig;
  bloodPressureLogs?: BloodPressureLog[];
}

export interface DailyReminderConfig {
  enabled: boolean;
  morningTime: string; // e.g. "07:30"
  morningEnabled: boolean;
  afternoonTime: string; // e.g. "13:30"
  afternoonEnabled: boolean;
  eveningTime: string; // e.g. "20:00"
  eveningEnabled: boolean;
  browserNotifications: boolean;
  soundEnabled: boolean;
  
  // Extended Meal Reminders
  mealsEnabled?: boolean;
  mealSlots?: MealReminderItem[];

  // Extended Water & Hydration Reminders
  hydration?: HydrationReminderConfig;
}

// Online & Nearby Clinicians (Mawasiliano na Daktari Aliye Karibu na Aliye Online)
export interface OnlineDoctor {
  id: string;
  name: string;
  title: string;
  roleType?: 'doctor' | 'nutritionist'; // 'doctor' = Daktari, 'nutritionist' = Mtaalamu wa Lishe
  qualifications?: string; // Sifa alizosomea (e.g. MD, MMed, MSc Clinical Nutrition, BSc Dietetics)
  educationInstitution?: string; // Chuo alichosomea (e.g. MUHAS, KCMUCo, SUA)
  experienceYears?: number; // Miaka ya uzoefu wa kazi
  specialty: 'shinikizo_la_damu' | 'kisukari' | 'lishe_ya_kliniki' | 'watoto' | 'afya_ya_jamii';
  specialtyLabelSwahili: string;
  facility: string;
  location: string; // e.g. "Kinondoni, Dar es Salaam"
  city: string; // e.g. "Dar es Salaam"
  district?: string; // e.g. "Ilala"
  isOnline: boolean;
  rating: number; // e.g. 4.9
  reviewsCount: number;
  phone: string;
  whatsappNumber?: string; // Nambari ya WhatsApp kwa mawasiliano ya haraka
  registrationCouncilNo?: string; // Nambari ya usajili wa bodi (e.g. Baraza la Madaktari Tanganyika - MCT)
  avatarUrl?: string;
  languages: string[];
  bio: string;
  distanceKm?: number;
  consultationFeeTzs: number; // Set strictly by Admin DISMAS POKELA
  freeFollowup: boolean;
  isAcceptingEmergencies: boolean;
  // User account credentials & email dispatch:
  email?: string; // Registered email to receive initial credentials
  username?: string; // Username for logging in as practitioner
  password?: string; // Current password
  initialPassword?: string; // Initial password assigned by Admin
  isPasswordChanged?: boolean; // Whether practitioner has updated their password
  emailSentAt?: string; // Timestamp when initial credentials were sent to email
  paymentDetails?: {
    lipaNamba?: string; // e.g. M-Pesa / Tigo Pesa Lipa Namba
    merchantName?: string;
    paymentInstructions?: string;
    accountNumber?: string;
    bankName?: string;
  };
}

export interface DoctorConsultationMessage {
  id: string;
  sender: 'patient' | 'doctor';
  senderName: string;
  text: string;
  timestamp: string;
  isRead?: boolean;
}

// Tanzanian Food Guide Plate (TFNC Food Plate Guide)
export interface FoodPlateGroup {
  id: string;
  name: string;
  swahiliTitle: string;
  recommendedPortionPercentage: string; // e.g. "30-33%"
  plateVisualColor: string;
  iconName: string;
  description: string;
  keyNutrients: string[];
  localFoodExamples: {
    name: string;
    description: string;
    portionAdvice: string;
  }[];
  healthAdvice: {
    forHypertension: string;
    forDiabetes: string;
    forWeightLoss: string;
    forChildren: string;
  };
}

// Printable & Downloadable Eating Plan for Patients without phones
export interface PrintableMealDayPlan {
  dayName: string; // e.g. "Jumatatu", "Jumanne"
  dayNumber: number;
  breakfast: string;
  midMorningSnack: string;
  lunch: string;
  afternoonSnack: string;
  dinner: string;
  bedtime: string;
}

export interface PrintableMealPlan {
  id: string;
  patientName: string;
  patientAge?: number;
  patientPhone?: string;
  patientLocation?: string;
  category: ClientCategory;
  conditionLabel: string;
  startDate: string;
  endDate: string;
  durationLabel: string; // e.g. "Mpango wa Wiki 1 (Siku 7)"
  nutritionistName: string;
  nutritionistPhone: string;
  facilityName: string;
  dailyWaterTargetGlasses: number;
  saltRestrictionAdvice: string;
  keyInstructions: string[];
  foodsToStrictlyAvoid: string[];
  foodsToEmphasize: string[];
  days: PrintableMealDayPlan[];
}

export type AnnouncementCategory = 
  | 'lishe_tips' 
  | 'matangazo_kliniki' 
  | 'tahadhari_sukari' 
  | 'utafiti_mpya' 
  | 'semina_warsha' 
  | 'ushuhuda_hadithi';

export interface NutritionAnnouncement {
  id: string;
  title: string;
  category: AnnouncementCategory;
  categoryLabelSwahili: string;
  summary: string;
  content: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  publishedAt: string;
  isPinned: boolean;
  priority: 'normal' | 'important' | 'urgent';
  tags: string[];
  imageUrl?: string;
  actionButtonText?: string;
  actionLinkTab?: 'scanner' | 'glucose' | 'recommendations' | 'food_db' | 'bmi' | 'chat';
  likesCount: number;
  readTimeMinutes: number;
}

export type BmiCategory = 
  | 'underweight' 
  | 'normal' 
  | 'overweight' 
  | 'obese_1' 
  | 'obese_2' 
  | 'obese_3';

export interface BmiAnalysisResult {
  bmi: number;
  category: BmiCategory;
  categoryLabelSwahili: string;
  idealWeightRange: { min: number; max: number };
  weightDifferenceKg: number; // positive = needs to lose, negative = needs to gain, 0 = normal
  bmr: number;
  tdee: number;
  suggestedDailyCalories: number;
  suggestedDailyCarbsGrams: number;
  waistRiskSwahili?: string;
  healthRisksForDiabetes: string[];
  actionStepsSwahili: string[];
  dietaryGuidelines: {
    ruleTitle: string;
    description: string;
    foodsRecommended: string[];
    foodsToLimitOrAvoid: string[];
  };
  exerciseGuideline: {
    frequency: string;
    cardioMinutes: number;
    resistanceDays: number;
    diabeticPrecautions: string;
    tips: string[];
  };
}

export interface DietaryRecommendationItem {
  title: string;
  mealType: MealType;
  carbsEstimate: number;
  calories: number;
  giLevel: GlycemicIndexLevel;
  description: string;
  benefitsForCurrentGlucose: string;
  ingredients: string[];
}

export interface GlucoseRecommendationResponse {
  currentGlucoseLevel: number;
  glucoseStatusCategory: 'Chini Sana (Hypoglycemia)' | 'Kiwango Bora (Kawaida)' | 'Kiwango cha Juu (Hyperglycemia)' | 'Juu Sana (Hatari)';
  urgentActionNote?: string;
  recommendedDietaryPlan: {
    immediateAdvice: string;
    suggestedMeals: DietaryRecommendationItem[];
    foodsToPrioritize: string[];
    foodsToAvoidNow: string[];
    hydrationAdvice: string;
    portionGuidance: string;
  };
}

export interface FoodGuideItem {
  id: string;
  name: string;
  category: 'Wanga' | 'Mboga' | 'Protini' | 'Matunda' | 'Vinywaji' | 'Vitafunio';
  gi: GlycemicIndexLevel;
  giValue: number;
  carbsPer100g: number;
  fiberPer100g: number;
  safety: FoodSafetyRating;
  description: string;
  swahiliName: string;
  tips: string;
}

export type DashboardTheme = 'emerald' | 'ocean' | 'midnight' | 'amber' | 'violet' | 'teal';

