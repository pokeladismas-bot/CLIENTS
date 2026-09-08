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

export type UserRole = 'admin' | 'patient';

export interface AuthSession {
  role: UserRole;
  patientId?: string; // Set when role === 'patient'
  username: string;
  name: string;
  phone?: string;
  loginTime: string;
  canPrintReports?: boolean;
}

export interface SecuritySettings {
  adminPassword: string; // Default: 'admin123'
  allowPatientPrinting: boolean; // Controlled by Admin: whether patients can print/download reports
  requireAdminApprovalForExport: boolean;
  requireLoginFirst: boolean; // Require password/login gate before using the app
}

export interface WaterLogEntry {
  id: string;
  timestamp: string;
  glasses: number;
  amountMl: number;
}

export type ClientCategory = 'kisukari' | 'kupunguza_uzito' | 'lishe_jumla';

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

