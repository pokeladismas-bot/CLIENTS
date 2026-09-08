import React, { useState, useEffect } from 'react';
import { 
  Scale, HeartPulse, Activity, AlertTriangle, CheckCircle2, 
  Sparkles, RefreshCw, Flame, ArrowRight, ArrowDownRight, ArrowUpRight, 
  ShieldAlert, Utensils, Dumbbell, Info, ChevronRight, BookOpen, Check
} from 'lucide-react';
import { GlucoseLog, UserProfile } from '../types';

interface BmiCalculatorViewProps {
  profile: UserProfile;
  latestGlucose?: GlucoseLog;
  onUpdateProfile: (updated: UserProfile) => void;
  onOpenScanner: () => void;
  onOpenGlucoseModal: () => void;
}

interface AiBmiPlan {
  bmiValue: number;
  categorySwahili: string;
  clinicalAnalysis: string;
  insulinImpactExplanation: string;
  targetCalorieDaily: number;
  targetCarbsDailyGrams: number;
  targetProteinDailyGrams: number;
  targetFiberDailyGrams: number;
  weeklyWeightGoal: string;
  keyActionSteps: string[];
  sampleMealPlan: Array<{
    dayTitle: string;
    breakfast: string;
    lunch: string;
    dinner: string;
    snack: string;
    totalCarbsEst: string;
  }>;
  exercisePlan: {
    routine: string;
    frequency: string;
    safetyPrecaution: string;
    recommendedActivities: string[];
  };
  foodsToPrioritize: string[];
  foodsToAvoidCompletely: string[];
}

export const BmiCalculatorView: React.FC<BmiCalculatorViewProps> = ({
  profile,
  latestGlucose,
  onUpdateProfile,
  onOpenScanner,
  onOpenGlucoseModal,
}) => {
  // Input states
  const [weightKg, setWeightKg] = useState<number>(profile.weightKg || 78);
  const [heightCm, setHeightCm] = useState<number>(profile.heightCm || 170);
  const [age, setAge] = useState<number>(profile.age || 45);
  const [gender, setGender] = useState<'male' | 'female'>(profile.gender || 'male');
  const [waistCm, setWaistCm] = useState<number>(profile.waistCm || 92);
  const [activityLevel, setActivityLevel] = useState<string>('moderate');

  // AI Plan states
  const [aiPlan, setAiPlan] = useState<AiBmiPlan | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isSavedToProfile, setIsSavedToProfile] = useState<boolean>(false);

  // Calculate Real-time BMI
  const heightInMeters = heightCm / 100;
  const bmiRaw = heightInMeters > 0 ? weightKg / (heightInMeters * heightInMeters) : 0;
  const bmi = Number(bmiRaw.toFixed(1));

  // Ideal weight range (BMI 18.5 - 24.9)
  const minIdealWeight = Number((18.5 * heightInMeters * heightInMeters).toFixed(1));
  const maxIdealWeight = Number((24.9 * heightInMeters * heightInMeters).toFixed(1));

  // Weight Difference
  let weightDiff = 0;
  if (weightKg > maxIdealWeight) {
    weightDiff = Number((weightKg - maxIdealWeight).toFixed(1)); // need to lose
  } else if (weightKg < minIdealWeight) {
    weightDiff = Number((weightKg - minIdealWeight).toFixed(1)); // negative, need to gain
  }

  // Determine BMI category & styling
  let categoryKey: 'underweight' | 'normal' | 'overweight' | 'obese1' | 'obese2' | 'obese3' = 'normal';
  let categoryLabel = 'Uzito wa Kawaida (Wenye Afya)';
  let categoryBadgeBg = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  let categoryColor = '#10b981';
  let isAbnormal = false;

  if (bmi < 18.5) {
    categoryKey = 'underweight';
    categoryLabel = 'Chini ya Uzito (Underweight)';
    categoryBadgeBg = 'bg-sky-100 text-sky-800 border-sky-300';
    categoryColor = '#0284c7';
    isAbnormal = true;
  } else if (bmi >= 18.5 && bmi <= 24.9) {
    categoryKey = 'normal';
    categoryLabel = 'Uzito wa Kawaida (Normal / Afya Nzuri)';
    categoryBadgeBg = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    categoryColor = '#10b981';
    isAbnormal = false;
  } else if (bmi >= 25.0 && bmi <= 29.9) {
    categoryKey = 'overweight';
    categoryLabel = 'Uzito Uliozidi (Overweight)';
    categoryBadgeBg = 'bg-amber-100 text-amber-800 border-amber-300';
    categoryColor = '#f59e0b';
    isAbnormal = true;
  } else if (bmi >= 30.0 && bmi <= 34.9) {
    categoryKey = 'obese1';
    categoryLabel = 'Unene wa Daraja la 1 (Obesity Class I)';
    categoryBadgeBg = 'bg-orange-100 text-orange-800 border-orange-300';
    categoryColor = '#f97316';
    isAbnormal = true;
  } else if (bmi >= 35.0 && bmi <= 39.9) {
    categoryKey = 'obese2';
    categoryLabel = 'Unene wa Daraja la 2 (Obesity Class II)';
    categoryBadgeBg = 'bg-rose-100 text-rose-800 border-rose-300';
    categoryColor = '#e11d48';
    isAbnormal = true;
  } else {
    categoryKey = 'obese3';
    categoryLabel = 'Unene Uliokithiri (Severe Obesity Class III)';
    categoryBadgeBg = 'bg-purple-100 text-purple-900 border-purple-300';
    categoryColor = '#7e22ce';
    isAbnormal = true;
  }

  // Metabolic calculations (Mifflin-St Jeor)
  // BMR = 10*weight + 6.25*height - 5*age + (male: +5, female: -161)
  const bmrBase = 10 * weightKg + 6.25 * heightCm - 5 * age + (gender === 'male' ? 5 : -161);
  const bmr = Math.round(bmrBase);

  // Activity multipliers
  const actMultiplier = 
    activityLevel === 'sedentary' ? 1.2 :
    activityLevel === 'light' ? 1.375 :
    activityLevel === 'moderate' ? 1.55 : 1.725;

  const tdee = Math.round(bmr * actMultiplier);

  // Suggested Caloric Target for Diabetes
  let suggestedCalorie = tdee;
  let suggestedCarbs = 130;
  if (categoryKey === 'overweight' || categoryKey === 'obese1') {
    suggestedCalorie = Math.max(tdee - 500, 1400); // safe deficit
    suggestedCarbs = 100; // lower carbs for insulin resistance
  } else if (categoryKey === 'obese2' || categoryKey === 'obese3') {
    suggestedCalorie = Math.max(tdee - 650, 1300);
    suggestedCarbs = 80;
  } else if (categoryKey === 'underweight') {
    suggestedCalorie = tdee + 400; // surplus for mass
    suggestedCarbs = 150;
  }

  // Waist circumference risk assessment (>94cm male, >80cm female is higher visceral fat)
  const isHighWaistRisk = gender === 'male' ? waistCm > 94 : waistCm > 80;

  // Fetch AI Plan
  const fetchAiBmiPlan = async () => {
    setIsLoadingAi(true);
    setAiError(null);
    try {
      const res = await fetch('/api/calculate-bmi-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weightKg,
          heightCm,
          age,
          gender,
          waistCm,
          diabetesType: profile.diabetesType,
          currentGlucose: latestGlucose?.value,
          activityLevel,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Imeshindikana kuandaa mpango wa BMI.');
      }

      setAiPlan(json.data);
    } catch (err: any) {
      console.error('BMI Plan Error:', err);
      setAiError(err.message || 'Hitilafu ya mtandao.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleApplyToProfile = () => {
    const updated: UserProfile = {
      ...profile,
      weightKg,
      heightCm,
      age,
      gender,
      waistCm,
      dailyCalorieTarget: aiPlan?.targetCalorieDaily || suggestedCalorie,
      dailyCarbLimitGrams: aiPlan?.targetCarbsDailyGrams || suggestedCarbs,
      dailyProteinTarget: aiPlan?.targetProteinDailyGrams || profile.dailyProteinTarget,
      dailyFiberTarget: aiPlan?.targetFiberDailyGrams || profile.dailyFiberTarget,
    };
    onUpdateProfile(updated);
    setIsSavedToProfile(true);
    setTimeout(() => setIsSavedToProfile(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30 mb-2">
                <Scale className="w-3.5 h-3.5" />
                <span>Kikokotoo cha BMI & Mwongozo wa Kimetaboliki wa Kisukari</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Kikokotoo cha BMI na Udhibiti wa Uzito
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl mt-1">
                Kiwango chako cha uzito (BMI) huamua jinsi seli zako zinavyopokea insulini. Pima BMI yako kupata mpango maalum wa lishe na kupunguza au kuongeza uzito kwa usalama.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onOpenGlucoseModal}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2"
              >
                <HeartPulse className="w-4 h-4" />
                <span>Kipimo cha Sukari</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Inputs (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Scale className="w-4 h-4 text-teal-600" />
              <span>Vipimo Vyako vya Mwili</span>
            </h3>
            <span className="text-xs text-slate-400">Rekebisha hapa chini</span>
          </div>

          {/* Weight Input */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <label>Uzito (Kilogramu):</label>
              <span className="text-sm text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                {weightKg} kg
              </span>
            </div>
            <input
              type="range"
              min="35"
              max="180"
              step="0.5"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <div className="flex gap-1.5 pt-1">
              {[55, 65, 75, 85, 95, 110].map((w) => (
                <button
                  key={w}
                  onClick={() => setWeightKg(w)}
                  className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold transition-all ${
                    weightKg === w ? 'bg-teal-600 text-white border-teal-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {w}kg
                </button>
              ))}
            </div>
          </div>

          {/* Height Input */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <label>Urefu (Sentimita):</label>
              <span className="text-sm text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                {heightCm} cm ({(heightCm / 100).toFixed(2)} m)
              </span>
            </div>
            <input
              type="range"
              min="120"
              max="215"
              step="1"
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <div className="flex gap-1.5 pt-1">
              {[155, 160, 165, 170, 175, 180].map((h) => (
                <button
                  key={h}
                  onClick={() => setHeightCm(h)}
                  className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold transition-all ${
                    heightCm === h ? 'bg-teal-600 text-white border-teal-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {h}cm
                </button>
              ))}
            </div>
          </div>

          {/* Gender & Age */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Jinsia:</label>
              <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setGender('male')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    gender === 'male' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Mwanaume
                </button>
                <button
                  onClick={() => setGender('female')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    gender === 'female' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Mwanamke
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Umri (Miaka):</label>
              <input
                type="number"
                min="10"
                max="100"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Waist circumference */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <label>Mzingo wa Kiuno (Waist cm):</label>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                isHighWaistRisk ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {waistCm} cm {isHighWaistRisk ? '(Mafuta Mengi ya Ndani)' : '(Salama)'}
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              value={waistCm}
              onChange={(e) => setWaistCm(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <p className="text-[10px] text-slate-400">
              Mzingo wa kiuno unaozidi {gender === 'male' ? '94cm' : '80cm'} huashiria mafuta kwenye kongosho na ini (Visceral Fat).
            </p>
          </div>

          {/* Activity Level */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Kiwango cha Shughuli za Kila Siku:</label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="sedentary">Kukaa sana / Kazi ya ofisini (Sedentary)</option>
              <option value="light">Mazoezi mepesi siku 1-3 kwa wiki</option>
              <option value="moderate">Mazoezi ya wastani siku 3-5 kwa wiki</option>
              <option value="active">Mazoezi makali au kazi ya nguvu kila siku</option>
            </select>
          </div>
        </div>

        {/* Right Area: Results & Visual Gauge (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main BMI Result Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Kiwango Chako cha BMI (Body Mass Index)
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                    {bmi}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">kg/m²</span>
                </div>
              </div>

              <div className="flex flex-col sm:items-end">
                <span className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border ${categoryBadgeBg}`}>
                  {categoryLabel}
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  Uzito Bora: <strong>{minIdealWeight} - {maxIdealWeight} kg</strong>
                </span>
              </div>
            </div>

            {/* Visual Color Scale Gauge */}
            <div className="space-y-2">
              <div className="relative pt-6">
                {/* Needle / Marker */}
                <div 
                  className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-300"
                  style={{
                    left: `${Math.max(5, Math.min(95, ((bmi - 14) / (42 - 14)) * 100))}%`,
                  }}
                >
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-900 text-white shadow-md">
                    {bmi}
                  </span>
                  <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-slate-900" />
                </div>

                {/* Progress Bar Segments */}
                <div className="h-4 w-full rounded-full overflow-hidden flex shadow-inner border border-slate-200">
                  <div className="w-[16%] bg-sky-400" title="Chini (< 18.5)" />
                  <div className="w-[23%] bg-emerald-500" title="Kawaida (18.5 - 24.9)" />
                  <div className="w-[18%] bg-amber-400" title="Uliozidi (25 - 29.9)" />
                  <div className="w-[18%] bg-orange-500" title="Unene 1 (30 - 34.9)" />
                  <div className="w-[15%] bg-rose-500" title="Unene 2 (35 - 39.9)" />
                  <div className="w-[10%] bg-purple-700" title="Unene Uliokithiri (>= 40)" />
                </div>
              </div>

              {/* Scale Labels */}
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-0.5">
                <span>&lt; 18.5 (Chini)</span>
                <span>18.5 - 24.9 (Bora)</span>
                <span>25 - 29.9 (Ziada)</span>
                <span>30 - 34.9 (Unene 1)</span>
                <span>&gt; 35 (Juu Sana)</span>
              </div>
            </div>

            {/* Quick Metrics Breakdown: Deficit/Surplus & Daily Targets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
              <div className="p-3 bg-slate-50 rounded-2xl text-center border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Kilo za Kurekebisha</span>
                <span className={`text-base sm:text-lg font-extrabold my-0.5 block ${
                  weightDiff > 0 ? 'text-amber-600' : weightDiff < 0 ? 'text-blue-600' : 'text-emerald-600'
                }`}>
                  {weightDiff > 0 ? `-${weightDiff} kg` : weightDiff < 0 ? `+${Math.abs(weightDiff)} kg` : '0 kg (Sahihi)'}
                </span>
                <span className="text-[10px] text-slate-500">
                  {weightDiff > 0 ? 'Punguza' : weightDiff < 0 ? 'Ongeza' : 'Dumisha'}
                </span>
              </div>

              <div className="p-3 bg-teal-50/70 rounded-2xl text-center border border-teal-200">
                <span className="text-[10px] font-bold uppercase text-teal-800 block">Lengo la Kalori</span>
                <span className="text-base sm:text-lg font-extrabold text-teal-700 my-0.5 block">{suggestedCalorie}</span>
                <span className="text-[10px] text-teal-600">kcal kwa siku</span>
              </div>

              <div className="p-3 bg-emerald-50/70 rounded-2xl text-center border border-emerald-200">
                <span className="text-[10px] font-bold uppercase text-emerald-800 block">Upeo wa Wanga</span>
                <span className="text-base sm:text-lg font-extrabold text-emerald-700 my-0.5 block">{suggestedCarbs}g</span>
                <span className="text-[10px] text-emerald-600">Gramu kwa siku</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl text-center border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Matumizi (TDEE)</span>
                <span className="text-base sm:text-lg font-extrabold text-slate-800 my-0.5 block">{tdee}</span>
                <span className="text-[10px] text-slate-500">kcal za kawaida</span>
              </div>
            </div>

            {/* Action Button to update profile with these metrics */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleApplyToProfile}
                className="flex-1 py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 active:scale-98 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {isSavedToProfile ? <Check className="w-4 h-4 text-emerald-300" /> : <Scale className="w-4 h-4" />}
                <span>{isSavedToProfile ? 'Imesasishwa Kwenye Wasifu!' : 'Hifadhi Malengo Haya Kwenye Wasifu Wangu'}</span>
              </button>

              <button
                onClick={fetchAiBmiPlan}
                disabled={isLoadingAi}
                className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className={`w-4 h-4 text-amber-400 ${isLoadingAi ? 'animate-spin' : ''}`} />
                <span>{isLoadingAi ? 'AI Inaandaa Mpango...' : 'Tengeneza Mpango Maalumu wa AI'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CLINICAL RECOMMENDATIONS SECTION (Mapendekezo Baada ya Kukutwa na BMI Isiyo Sahihi) */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-700" />
            <span>Mapendekezo ya Kimatibabu na Lishe kwa BMI ya {bmi} ({categoryLabel})</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Miongozo mahususi ya kurekebisha uzito, kuboresha unyeti wa insulini, na kuzuia madhara ya kisukari
          </p>
        </div>

        {/* Abnormal BMI Warning / Explanation Banner */}
        {isAbnormal ? (
          <div className={`p-5 rounded-3xl border flex flex-col md:flex-row items-start gap-4 ${
            categoryKey === 'underweight' 
              ? 'bg-sky-50 border-sky-200 text-sky-950' 
              : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}>
            <div className={`p-3 rounded-2xl flex-shrink-0 ${
              categoryKey === 'underweight' ? 'bg-sky-200 text-sky-800' : 'bg-amber-200 text-amber-800'
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h4 className="font-extrabold text-base">
                {categoryKey === 'underweight'
                  ? 'Uangalizi Maalumu: BMI Chini ya Uzito Salama (< 18.5)'
                  : 'Uangalizi Maalumu: BMI Imezidi Kiwango cha Afya (> 25.0)'}
              </h4>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
                {categoryKey === 'underweight'
                  ? 'Kupungua uzito kupita kiasi kwa mgonjwa wa kisukari huashiria upungufu wa virutubisho, upotevu wa misuli (Muscle Wasting), au ukosefu wa insulini mwilini. Ni muhimu kuongeza uzito kupitia protini na mafuta yenye afya bila kupandisha sukari ghafla.'
                  : `Uzito uliozidi hufanya seli za mwili kuwa sugu kwa insulini (Insulin Resistance). Kupunguza hata kilo 5 hadi 10 (asilimia 5% - 10% ya uzito wako) kutashusha sukari yako mara moja na kupunguza dozi ya dawa za kisukari unazotumia.`}
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {categoryKey !== 'underweight' ? (
                  <>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
                      🎯 Lengo la Kwanza: Punguza ~{((weightKg * 0.07)).toFixed(1)}kg (7% ya uzito wako)
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-teal-100 text-teal-900 border border-teal-300">
                      ⚡ Kasi Salama: Punguza 0.5kg kwa wiki
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-sky-100 text-sky-900 border border-sky-300">
                      🎯 Lengo la Kwanza: Ongeza ~{Math.abs(weightDiff).toFixed(1)}kg kufikia uzito wa kawaida
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-teal-100 text-teal-900 border border-teal-300">
                      ⚡ Kasi Salama: Ongeza 0.3kg - 0.5kg kwa wiki
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-3xl border border-emerald-200 bg-emerald-50 text-emerald-950 flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-emerald-200 text-emerald-800 flex-shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-base">Hongera! Kiwango Chako cha BMI Kiko Katika Hali Bora ya Afya (18.5 - 24.9)</h4>
              <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
                Uzito wako unakusaidia kutumia insulini kwa ufanisi mkubwa. Lengo lako kuu sasa ni kudumisha uzito huu kupitia lishe bora yenye wanga wenye nyuzinyuzi nyingi na mazoezi endelevu.
              </p>
            </div>
          </div>
        )}

        {/* 3 Pillars of Intervention Grid: Nutrition, Exercise, Precautions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Lishe & Mpangilio wa Sahani */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Utensils className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">
                {categoryKey === 'underweight' ? 'Lishe ya Kuongeza Uzito Kiafya' : 'Mkakati wa Lishe & Kupunguza Uzito'}
              </h4>
              <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
                {categoryKey === 'underweight' ? (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600 font-bold">✓</span>
                      <span><strong>Ongeza Mafuta Mazuri:</strong> Kula parachichi zima, kijiko cha siagi ya karanga asilia, au mbegu za maboga kila siku.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600 font-bold">✓</span>
                      <span><strong>Protini Nyingi Kila Mlo:</strong> Samaki sato, dagaa, mayai 2 ya kuchemsha, kuku wa kienyeji, na maharage.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600 font-bold">✓</span>
                      <span><strong>Milo Midogo 5-6 kwa Siku:</strong> Usile milo mikubwa miwili inayopandisha sukari ghafla; gawanya chakula mara 5.</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span><strong>Kanuni ya Nusu Sahani:</strong> 50% ya sahani iwe mboga za majani (mchicha, sukuma, kisamvu), 25% protini, 25% tu wanga wa dona/mtama.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span><strong>Punguza Wanga hadi ~{suggestedCarbs}g/siku:</strong> Ondoa kabisa sukari, soda, biskuti, na ugali mkubwa wa sembe.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span><strong>Kunywa Maji Glasi 8-10:</strong> Glasi 1 ya maji kabla ya kila mlo hupunguza njaa na kusaidia figo kutoa sukari iliyozidi.</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            <button
              onClick={onOpenScanner}
              className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Pima Wanga wa Sahani Yako</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Mazoezi Maalumu kwa BMI Hii */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Dumbbell className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">
                {categoryKey === 'underweight' ? 'Mazoezi ya Kujenga Misuli (Strength)' : 'Mpango wa Kuchoma Mafuta & Insulini'}
              </h4>
              <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
                {categoryKey === 'underweight' ? (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">✓</span>
                      <span><strong>Mazoezi ya Misuli (Resistance):</strong> Fanya squats, push-ups, au kuinua uzito mdogo siku 3 kwa wiki ili uzito unaoongezeka uwe misuli, si mafuta.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">✓</span>
                      <span><strong>Punguza Cardio Ndefu:</strong> Epuka kukimbia masafa marefu yanayochoma kalori nyingi kupita kiasi.</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">✓</span>
                      <span><strong>Kutembea kwa Kasi Dakika 30-45:</strong> Fanya hivi angalau siku 5 kwa wiki. Huwasha vipokezi vya GLUT4 kuchukua sukari bila insulini.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">✓</span>
                      <span><strong>Kutembea Dakika 15 Baada ya Kula:</strong> Huzuia sukari kupanda juu sana (post-meal spike) na husaidia kuyeyusha chakula.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">✓</span>
                      <span><strong>Mazoezi ya Misuli Siku 2:</strong> Misuli mikubwa huchoma kalori hata ukiwa umelala.</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            <div className="p-2.5 bg-blue-50 rounded-xl text-[11px] text-blue-900 font-medium">
              💡 <strong>Kidokezo:</strong> Dakika 30 za mazoezi hupunguza usugu wa insulini kwa masaa 24 hadi 48 yanayofuata!
            </div>
          </div>

          {/* Card 3: Tahadhari za Kimatibabu na Dawa */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Tahadhari za Dawa & Sukari Kushuka</h4>
              <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">⚠️</span>
                  <span><strong>Hatari ya Sukari Kushuka (Hypo):</strong> Unapoanza kupunguza uzito na kufanya mazoezi, dozi zako za dawa (kama Insulini au Glibenclamide/Glimepiride) zinaweza kuhitaji kupunguzwa na daktari.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">⚠️</span>
                  <span><strong>Pima Sukari Mara kwa Mara:</strong> Pima kabla na baada ya mazoezi ili kuhakikisha haishuki chini ya 70 mg/dL.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">⚠️</span>
                  <span><strong>Beba Glukosi ya Dharura:</strong> Daima beba peremende au pakiti ya glukosi iwapo unahisi kizunguzungu au kutetemeka.</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenGlucoseModal}
              className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Rekodi Kipimo Kipya cha Sukari</span>
              <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
            </button>
          </div>
        </div>

        {/* AI GENERATED METABOLIC REPORT SECTION */}
        {isLoadingAi && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin mx-auto" />
            <h4 className="font-bold text-slate-800 text-base">Gemini AI inaandaa Mpango Maalumu wa BMI na Kisukari...</h4>
            <p className="text-xs text-slate-500">Inachambua uzito wako wa {weightKg}kg na kulinganisha na mahitaji yako ya kimetaboliki.</p>
          </div>
        )}

        {aiError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center justify-between">
            <span>Hitilafu: {aiError}</span>
            <button
              onClick={fetchAiBmiPlan}
              className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold"
            >
              Jaribu Tena
            </button>
          </div>
        )}

        {aiPlan && !isLoadingAi && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-300 shadow-lg space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">
                    Mpango Maalumu wa Kimatibabu wa BMI kutoka kwa AI
                  </h3>
                  <p className="text-xs text-slate-500">Ushauri uliolengwa kwa ajili ya uzito wa {weightKg}kg na kisukari</p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-teal-100 text-teal-800 border border-teal-300 w-fit">
                {aiPlan.categorySwahili} (BMI {aiPlan.bmiValue})
              </span>
            </div>

            {/* Clinical & Insulin Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h5 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-teal-600" />
                  <span>Tathmini ya Kimetaboliki</span>
                </h5>
                <p className="text-xs text-slate-700 leading-relaxed">{aiPlan.clinicalAnalysis}</p>
              </div>

              <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-2">
                <h5 className="font-bold text-xs uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-600" />
                  <span>Athari Kwenye Insulini & Sukari</span>
                </h5>
                <p className="text-xs text-amber-900 leading-relaxed">{aiPlan.insulinImpactExplanation}</p>
              </div>
            </div>

            {/* Macro Targets Card */}
            <div className="p-5 bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-teal-300 uppercase tracking-wider">Malengo ya Kila Siku Yaliyopendekezwa</span>
                <span className="text-slate-300">{aiPlan.weeklyWeightGoal}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-white/10 rounded-xl">
                  <span className="text-[10px] uppercase text-slate-300 block">Kalori</span>
                  <span className="text-xl font-black text-white">{aiPlan.targetCalorieDaily} kcal</span>
                </div>
                <div className="p-3 bg-white/10 rounded-xl">
                  <span className="text-[10px] uppercase text-slate-300 block">Wanga (Carbs)</span>
                  <span className="text-xl font-black text-teal-300">{aiPlan.targetCarbsDailyGrams}g</span>
                </div>
                <div className="p-3 bg-white/10 rounded-xl">
                  <span className="text-[10px] uppercase text-slate-300 block">Protini</span>
                  <span className="text-xl font-black text-white">{aiPlan.targetProteinDailyGrams}g</span>
                </div>
                <div className="p-3 bg-white/10 rounded-xl">
                  <span className="text-[10px] uppercase text-slate-300 block">Nyuzinyuzi (Fiber)</span>
                  <span className="text-xl font-black text-emerald-300">{aiPlan.targetFiberDailyGrams}g</span>
                </div>
              </div>
            </div>

            {/* Sample 3-Day Meal Plan Grid */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-teal-600" />
                <span>Mfano wa Ratiba ya Milo ya Asili (Kitanzania) Kulingana na BMI Yako</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {aiPlan.sampleMealPlan.map((day, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                    <div className="flex justify-between items-center font-bold text-teal-800 border-b border-slate-200 pb-1.5">
                      <span>{day.dayTitle}</span>
                      <span className="text-[10px] bg-teal-100 px-2 py-0.5 rounded-full">{day.totalCarbsEst}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Asubuhi:</span>
                      <p className="text-slate-700">{day.breakfast}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Mchana:</span>
                      <p className="text-slate-700">{day.lunch}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Usiku:</span>
                      <p className="text-slate-700">{day.dinner}</p>
                    </div>
                    {day.snack && (
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Kitafunio:</span>
                        <p className="text-slate-600 italic">{day.snack}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Foods to prioritize vs avoid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2 text-xs">
                <span className="font-bold text-emerald-900 block flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Vyakula vya Kula Zaidi Kufikia BMI Bora:
                </span>
                <ul className="space-y-1 text-slate-700">
                  {aiPlan.foodsToPrioritize.map((food, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{food}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-2xl space-y-2 text-xs">
                <span className="font-bold text-rose-900 block flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Vyakula vya Kuacha au Kupunguza Kabisa:
                </span>
                <ul className="space-y-1 text-slate-700">
                  {aiPlan.foodsToAvoidCompletely.map((food, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-rose-600 font-bold">•</span>
                      <span>{food}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Exercise Plan */}
            <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-2 text-xs text-blue-950">
              <span className="font-bold block flex items-center gap-1.5 text-blue-900">
                <Dumbbell className="w-4 h-4 text-blue-600" />
                Mpango wa Mazoezi: {aiPlan.exercisePlan.frequency}
              </span>
              <p>{aiPlan.exercisePlan.routine}</p>
              <div className="p-2.5 bg-white rounded-xl border border-blue-100 space-y-1">
                <span className="font-bold text-blue-900 block">Tahadhari ya Daktari:</span>
                <p className="text-slate-700">{aiPlan.exercisePlan.safetyPrecaution}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
