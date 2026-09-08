import React, { useState, useEffect } from 'react';
import { 
  Sparkles, HeartPulse, ArrowRight, AlertTriangle, CheckCircle2, 
  RefreshCw, Utensils, Droplets, ShieldAlert, ChevronRight, Apple, 
  Flame, BookOpen, Coffee, Sun, Moon, Printer, FileDown, Image
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DietaryRecommendationItem, GlucoseLog, GlucoseRecommendationResponse, MealLog, UserProfile } from '../types';
import { PrintDietaryReportModal } from './PrintDietaryReportModal';

interface DietaryRecommendationsViewProps {
  latestGlucose?: GlucoseLog;
  profile: UserProfile;
  recentMeals: MealLog[];
  onOpenScanner: () => void;
  onOpenGlucoseModal: () => void;
}

export const DietaryRecommendationsView: React.FC<DietaryRecommendationsViewProps> = ({
  latestGlucose,
  profile,
  recentMeals,
  onOpenScanner,
  onOpenGlucoseModal,
}) => {
  const [testedGlucose, setTestedGlucose] = useState<number>(latestGlucose ? latestGlucose.value : 115);
  const [testedTiming, setTestedTiming] = useState<string>(latestGlucose ? latestGlucose.timing : 'fasting');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<GlucoseRecommendationResponse | null>(null);
  const [activeMealCategory, setActiveMealCategory] = useState<'all' | 'breakfast' | 'lunch' | 'dinner' | 'snack'>('all');
  const [customPreference, setCustomPreference] = useState<string>('Vyakula vya asili vya Kitanzania/Afrika Mashariki');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Load recommendations when tested glucose changes
  useEffect(() => {
    fetchRecommendations(testedGlucose, testedTiming);
  }, []);

  const fetchRecommendations = async (glucoseVal: number, timingVal: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/recommend-diet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          glucoseValue: glucoseVal,
          timing: timingVal,
          diabetesType: profile.diabetesType,
          recentMeals: recentMeals.slice(0, 3),
          userPreferences: customPreference,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Imeshindikana kupata mapendekezo ya lishe.');
      }

      setRecommendation(json.data);
    } catch (err: any) {
      console.error('Recommendations error:', err);
      setError(err.message || 'Hitilafu ya mtandao wakati wa kuandaa mapendekezo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateGlucose = (val: number, label: string) => {
    setTestedGlucose(val);
    fetchRecommendations(val, testedTiming);
  };

  const getMealIcon = (type: string) => {
    switch (type) {
      case 'breakfast':
        return <Coffee className="w-4 h-4 text-amber-500" />;
      case 'lunch':
        return <Sun className="w-4 h-4 text-orange-500" />;
      case 'dinner':
        return <Moon className="w-4 h-4 text-indigo-500" />;
      default:
        return <Apple className="w-4 h-4 text-emerald-500" />;
    }
  };

  const filteredMeals = recommendation?.recommendedDietaryPlan.suggestedMeals.filter((m) => {
    if (activeMealCategory === 'all') return true;
    return m.mealType === activeMealCategory;
  }) || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header & Quick Glucose Tester */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Background decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Mapendekezo ya Kisasa ya Lishe ya Kisukari</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Lishe Iliyolengwa Kulingana na Sukari Yako
              </h2>
              <p className="text-sm text-slate-300 max-w-2xl mt-1">
                Kiwango chako cha sukari kinaamua mlo gani unapaswa kula sasa hivi. Mfumo unarekebisha wanga na protini ili kudhibiti glukosi yako.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
                title="Chapisha ripoti ya ushauri wa lishe, pakua PDF au picha"
              >
                <Printer className="w-4 h-4" />
                <span>Chapisha / Pakua Ushauri</span>
              </button>

              <button
                onClick={onOpenGlucoseModal}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <HeartPulse className="w-4 h-4" />
                <span>Weka Kipimo Kipya</span>
              </button>
            </div>
          </div>

          {/* Interactive Blood Glucose Presets / Simulator */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-slate-200">
                Pima mapendekezo kulingana na viwango tofauti vya sukari:
              </span>
              <span className="text-emerald-300">
                Kiwango kinachochunguzwa: <strong>{testedGlucose} mg/dL</strong> ({(testedGlucose / 18).toFixed(1)} mmol/L)
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSimulateGlucose(65, 'Chini')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  testedGlucose === 65 
                    ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300' 
                    : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                }`}
              >
                Sukari Chini (&lt;70 mg/dL)
              </button>

              <button
                onClick={() => handleSimulateGlucose(115, 'Kawaida')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  testedGlucose === 115 
                    ? 'bg-emerald-400 text-emerald-950 ring-2 ring-emerald-300' 
                    : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                }`}
              >
                Sukari Kawaida (115 mg/dL)
              </button>

              <button
                onClick={() => handleSimulateGlucose(195, 'Juu')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  testedGlucose === 195 
                    ? 'bg-rose-500 text-white ring-2 ring-rose-300' 
                    : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                }`}
              >
                Sukari Juu (195 mg/dL)
              </button>

              <button
                onClick={() => handleSimulateGlucose(270, 'Hatari')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  testedGlucose === 270 
                    ? 'bg-red-600 text-white ring-2 ring-red-400' 
                    : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                }`}
              >
                Sukari Juu Sana (270 mg/dL)
              </button>

              {/* Custom input */}
              <div className="flex items-center gap-1.5 ml-auto">
                <input
                  type="number"
                  value={testedGlucose}
                  onChange={(e) => setTestedGlucose(Number(e.target.value))}
                  className="w-20 px-2.5 py-1 text-xs rounded-lg bg-black/40 border border-white/20 text-white text-center focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
                <button
                  onClick={() => fetchRecommendations(testedGlucose, testedTiming)}
                  className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                  title="Sasisha Mapendekezo"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-16 text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-700">AI inaandaa mapendekezo ya lishe kwa sukari ya {testedGlucose} mg/dL...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-1">
            <p className="font-bold">Imeshindikana kupakia mapendekezo</p>
            <p className="text-xs mt-0.5">{error}</p>
            <button
              onClick={() => fetchRecommendations(testedGlucose, testedTiming)}
              className="mt-2 px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
            >
              Jaribu Tena
            </button>
          </div>
        </div>
      )}

      {/* Recommendation Results */}
      {recommendation && !isLoading && (
        <div className="space-y-6">
          {/* Quick Print & Export Bar */}
          <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 text-white rounded-2xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-teal-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 text-teal-300 flex items-center justify-center flex-shrink-0">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                  <span>Chapisha & Pakua Ushauri wa Chakula</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30">
                    PDF • Picha • Print
                  </span>
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Unaweza kuchapisha moja kwa moja kwenye printa, kupakua waraka wa PDF, au kuhifadhi kadi ya picha (PNG) kwa ajili ya WhatsApp.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="px-3.5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0"
              >
                <Printer className="w-4 h-4" />
                <span>Chapisha (Print)</span>
              </button>

              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0"
              >
                <FileDown className="w-4 h-4" />
                <span>Pakua PDF</span>
              </button>

              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0"
              >
                <Image className="w-4 h-4" />
                <span>Pakua Picha</span>
              </button>
            </div>
          </div>
          {/* Urgent Note Banner if Hypo or Severe Hyper */}
          {recommendation.urgentActionNote && (
            <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
              recommendation.glucoseStatusCategory.includes('Chini')
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}>
              <ShieldAlert className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-sm sm:text-base">{recommendation.glucoseStatusCategory}</h4>
                <p className="text-xs sm:text-sm leading-relaxed">{recommendation.urgentActionNote}</p>
              </div>
            </div>
          )}

          {/* Immediate Strategy Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Hatua ya Haraka ya Lishe (Immediate Strategy)</span>
            </div>
            <p className="text-sm sm:text-base text-slate-800 font-medium leading-relaxed">
              {recommendation.recommendedDietaryPlan.immediateAdvice}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-blue-900">
                <span className="font-bold block mb-1 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-blue-600" />
                  Maji na Vimiminika:
                </span>
                {recommendation.recommendedDietaryPlan.hydrationAdvice}
              </div>

              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                <span className="font-bold block mb-1 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                  Kipimo cha Sahani:
                </span>
                {recommendation.recommendedDietaryPlan.portionGuidance}
              </div>
            </div>
          </div>

          {/* Foods to Prioritize vs Foods to Avoid Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Foods to prioritize */}
            <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">Vyakula vya Kula Zaidi Sasa</h4>
              </div>
              <ul className="space-y-2">
                {recommendation.recommendedDietaryPlan.foodsToPrioritize.map((food, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                    <span>{food}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Foods to avoid */}
            <div className="bg-white rounded-2xl p-5 border border-rose-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">Vyakula vya Kuepuka Sasa</h4>
              </div>
              <ul className="space-y-2">
                {recommendation.recommendedDietaryPlan.foodsToAvoidNow.map((food, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 flex-shrink-0" />
                    <span>{food}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Suggested Meal Plans Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Mapendekezo ya Milo Mahususi</h3>
                <p className="text-xs text-slate-500">Milo yenye uwiano sahihi wa wanga na virutubisho</p>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setActiveMealCategory('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activeMealCategory === 'all' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Yote
                </button>
                <button
                  onClick={() => setActiveMealCategory('breakfast')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activeMealCategory === 'breakfast' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Asubuhi
                </button>
                <button
                  onClick={() => setActiveMealCategory('lunch')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activeMealCategory === 'lunch' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Mchana
                </button>
                <button
                  onClick={() => setActiveMealCategory('dinner')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activeMealCategory === 'dinner' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Usiku
                </button>
                <button
                  onClick={() => setActiveMealCategory('snack')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activeMealCategory === 'snack' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Kitafunio
                </button>
              </div>
            </div>

            {/* Meal Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMeals.map((meal, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700">
                        {getMealIcon(meal.mealType)}
                        <span className="capitalize">
                          {meal.mealType === 'breakfast' ? 'Kifungua Kinywa' :
                           meal.mealType === 'lunch' ? 'Chakula cha Mchana' :
                           meal.mealType === 'dinner' ? 'Chakula cha Usiku' : 'Kitafunio'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Wanga: ~{meal.carbsEstimate}g
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          meal.giLevel === 'Chini' ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' :
                          meal.giLevel === 'Wastani' ? 'bg-amber-50 text-amber-700 border border-amber-300' : 'bg-rose-50 text-rose-700 border border-rose-300'
                        }`}>
                          GI {meal.giLevel}
                        </span>
                      </div>
                    </div>

                    <h4 className="font-bold text-base text-slate-900">{meal.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{meal.description}</p>

                    <div className="p-2.5 bg-emerald-50/60 rounded-xl text-xs text-emerald-950">
                      <strong>Kwanini inafaa sasa: </strong>{meal.benefitsForCurrentGlucose}
                    </div>

                    {/* Ingredients tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {meal.ingredients.map((ing, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      ~{meal.calories} kcal
                    </span>
                    <button
                      onClick={onOpenScanner}
                      className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold transition-colors"
                    >
                      <span>Piga picha sahani yako</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Print / Export Report Modal */}
      {isPrintModalOpen && (
        <PrintDietaryReportModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          profile={profile}
          testedGlucose={testedGlucose}
          testedTiming={testedTiming}
          recommendation={recommendation}
          latestGlucoseLog={latestGlucose}
        />
      )}
    </div>
  );
};
