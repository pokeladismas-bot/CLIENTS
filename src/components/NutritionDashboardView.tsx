import React from 'react';
import { 
  Activity, Flame, Scale, ShieldCheck, Plus, Camera, HeartPulse, 
  Calendar, Clock, Trash2, Sparkles, ChevronRight, AlertCircle, 
  CheckCircle2, ArrowUpRight, Megaphone, Pin, ArrowRight, BookOpen, Bell, BellOff, Printer
} from 'lucide-react';
import { GlucoseLog, MealLog, NutritionAnnouncement, UserProfile } from '../types';

interface NutritionDashboardViewProps {
  meals: MealLog[];
  glucoseLogs: GlucoseLog[];
  profile: UserProfile;
  announcements?: NutritionAnnouncement[];
  onOpenScanner: () => void;
  onOpenGlucoseModal: () => void;
  onSelectTab: (tab: any) => void;
  onDeleteMeal: (mealId: string) => void;
}

export const NutritionDashboardView: React.FC<NutritionDashboardViewProps> = ({
  meals,
  glucoseLogs,
  profile,
  announcements = [],
  onOpenScanner,
  onOpenGlucoseModal,
  onSelectTab,
  onDeleteMeal,
}) => {
  // Calculate today's totals
  const today = new Date().toDateString();
  const todayMeals = meals.filter(
    (m) => new Date(m.timestamp).toDateString() === today
  );

  const totalCarbs = todayMeals.reduce((acc, m) => acc + (m.totalCarbs || 0), 0);
  const netCarbs = todayMeals.reduce((acc, m) => acc + (m.netCarbs || 0), 0);
  const totalFiber = todayMeals.reduce((acc, m) => acc + (m.fiber || 0), 0);
  const totalProtein = todayMeals.reduce((acc, m) => acc + (m.protein || 0), 0);
  const totalFat = todayMeals.reduce((acc, m) => acc + (m.fat || 0), 0);
  const totalCalories = todayMeals.reduce((acc, m) => acc + (m.calories || 0), 0);

  const carbLimit = profile.dailyCarbLimitGrams || 130;
  const carbPercent = Math.min(Math.round((totalCarbs / carbLimit) * 100), 100);
  const carbsRemaining = Math.max(carbLimit - totalCarbs, 0);

  const latestGlucose = glucoseLogs.length > 0 ? glucoseLogs[glucoseLogs.length - 1] : undefined;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner: Patient Overview & Quick Action Hero */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <Activity className="w-3.5 h-3.5" />
              <span>Ufuatiliaji wa Lishe wa Leo • {new Date().toLocaleDateString('sw-TZ', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Habari, {profile.name}
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Hali ya {profile.diabetesType === 'type2' ? 'Kisukari cha Aina ya 2' : profile.diabetesType === 'type1' ? 'Kisukari cha Aina ya 1' : 'Kisukari'}. 
              Wanga wako wa leo uko chini ya udhibiti madhubuti wa lishe.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3">
            <button
              onClick={onOpenScanner}
              className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Piga Picha ya Mlo</span>
            </button>

            <button
              onClick={onOpenGlucoseModal}
              className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-xs transition-all flex items-center justify-center gap-2"
            >
              <HeartPulse className="w-4 h-4 text-rose-400" />
              <span>Weka Sukari</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Daily Carbohydrate Budget */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                🌾
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Bajeti ya Wanga (Carb Tracker)</h3>
                <p className="text-xs text-slate-500">Lengo la siku: Upeo wa {carbLimit}g</p>
              </div>
            </div>
            <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
              totalCarbs > carbLimit ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {totalCarbs > carbLimit ? 'Umezidi Lengo' : `${carbsRemaining}g Zimebaki`}
            </span>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Umetumia: <strong className="text-emerald-700">{totalCarbs}g</strong></span>
              <span>Lengo: <strong>{carbLimit}g</strong></span>
            </div>
            <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  totalCarbs > carbLimit ? 'bg-rose-500' : 'bg-emerald-600'
                }`}
                style={{ width: `${carbPercent}%` }}
              />
            </div>
          </div>

          {/* Detailed Nutrients breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center">
              <span className="text-[10px] font-bold uppercase text-emerald-800 block">Wanga Halisi (Net)</span>
              <span className="text-xl font-extrabold text-emerald-700 my-0.5 block">{netCarbs}g</span>
              <span className="text-[10px] text-emerald-600">Huathiri Sukari</span>
            </div>

            <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-200 text-center">
              <span className="text-[10px] font-bold uppercase text-teal-800 block">Nyuzinyuzi (Fiber)</span>
              <span className="text-xl font-extrabold text-teal-700 my-0.5 block">{totalFiber}g</span>
              <span className="text-[10px] text-teal-600">Lengo: {profile.dailyFiberTarget}g</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-600 block">Protini</span>
              <span className="text-xl font-extrabold text-slate-800 my-0.5 block">{totalProtein}g</span>
              <span className="text-[10px] text-slate-500">Lengo: {profile.dailyProteinTarget}g</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-600 block">Kalori</span>
              <span className="text-xl font-extrabold text-slate-800 my-0.5 block">{totalCalories}</span>
              <span className="text-[10px] text-slate-500">kcal</span>
            </div>
          </div>
        </div>

        {/* Card 2: Current Glucose & AI Advice Snippet */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-600 text-xs font-bold uppercase tracking-wider">
                <HeartPulse className="w-4 h-4" />
                <span>Kipimo cha Mwisho</span>
              </div>
              <button
                onClick={() => onSelectTab('glucose')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-0.5"
              >
                <span>Grafu</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {latestGlucose ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                    {latestGlucose.value}
                  </span>
                  <span className="text-xs font-bold text-slate-500">{profile.unit}</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500">
                    {new Date(latestGlucose.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    latestGlucose.status === 'kawaida' ? 'bg-emerald-100 text-emerald-800' :
                    latestGlucose.status === 'chini' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {latestGlucose.status === 'kawaida' ? 'Kiwango Salama' :
                     latestGlucose.status === 'chini' ? 'Kiwango cha Chini' : 'Kiwango cha Juu'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs text-slate-500">
                Bado hujarekodi sukari ya leo.
              </div>
            )}

            {/* Daily Reminder Status Bar */}
            <div 
              onClick={() => onSelectTab('glucose')}
              className="p-2.5 bg-rose-50/70 hover:bg-rose-100/70 rounded-2xl border border-rose-200/80 cursor-pointer transition-colors flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 block text-[11px]">
                    Kikumbusho: {profile.dailyReminders?.enabled ? 'Kimewashwa' : 'Kimezimwa'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {profile.dailyReminders?.enabled 
                      ? `${profile.dailyReminders.morningTime || '07:30'} • ${profile.dailyReminders.afternoonTime || '13:30'} • ${profile.dailyReminders.eveningTime || '20:00'}`
                      : 'Bofya hapa kuwasha kengele ya kila siku'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-emerald-800">
                <Sparkles className="w-3.5 h-3.5" />
                Ushauri wa Mlo Unaofuata:
              </span>
              <p className="leading-relaxed">
                {latestGlucose && latestGlucose.value > 140
                  ? 'Sukari iko juu kiasi: Mlo unaofuata unapaswa kuwa na mboga nyingi za majani, samaki na wanga kidogo sana wa mtama.'
                  : 'Kiwango kiko vizuri: Dumisha sahani yenye nusu mboga, robo protini na robo wanga wa dona/ulezi.'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => onSelectTab('recommendations')}
              className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-600 text-white rounded-xl text-xs font-extrabold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              title="Chapisha ripoti ya lishe, pakua PDF au picha"
            >
              <Printer className="w-4 h-4" />
              <span>Chapisha Ushauri wa Chakula (PDF/Picha)</span>
            </button>

            <button
              onClick={() => onSelectTab('recommendations')}
              className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Tazama Mapendekezo Kamili ya Lishe</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Card 3: BMI & Weight Management Quick Glance */}
      {(() => {
        const heightM = (profile.heightCm || 170) / 100;
        const weight = profile.weightKg || 78;
        const currentBmi = Number((weight / (heightM * heightM)).toFixed(1));
        const isBmiAbnormal = currentBmi < 18.5 || currentBmi >= 25.0;

        let statusText = 'Uzito wa Kawaida (Wenye Afya)';
        let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
        if (currentBmi < 18.5) {
          statusText = 'Chini ya Uzito';
          badgeColor = 'bg-sky-100 text-sky-800 border-sky-300';
        } else if (currentBmi >= 25.0 && currentBmi < 30.0) {
          statusText = 'Uzito Uliozidi (Overweight)';
          badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
        } else if (currentBmi >= 30.0) {
          statusText = 'Unene (Obesity)';
          badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
        }

        return (
          <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-slate-50 border border-teal-200 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-teal-600/20">
                <Scale className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-base">
                    Kikokotoo cha BMI & Kimetaboliki
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeColor}`}>
                    BMI {currentBmi} • {statusText}
                  </span>
                </div>
                <p className="text-xs text-slate-600 max-w-xl">
                  {isBmiAbnormal 
                    ? `BMI yako ya ${currentBmi} inahitaji marekebisho ya lishe na mazoezi ili kupunguza usugu wa insulini na kudhibiti sukari kwa ufanisi.`
                    : 'BMI yako iko katika kiwango bora cha afya! Endelea kudumisha lishe bora yenye wanga wenye nyuzi.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectTab('bmi')}
              className="py-2.5 px-4 bg-teal-700 hover:bg-teal-800 active:scale-98 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shadow-sm"
              id="btn-dashboard-bmi-recommendations"
            >
              <span>{isBmiAbnormal ? 'Tazama Mapendekezo ya BMI' : 'Fungua Kikokotoo cha BMI'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        );
      })()}

      {/* Card 4: Matangazo & Taarifa za Hivi Punde za Kilishe */}
      {announcements.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Megaphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Matangazo & Taarifa za Kilishe</h3>
                <p className="text-xs text-slate-500">Miongozo ya hivi karibuni kutoka kwa jopo la madaktari na wataalamu</p>
              </div>
            </div>

            <button
              onClick={() => onSelectTab('announcements')}
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 group py-1.5 px-3 rounded-lg hover:bg-teal-50 transition-colors"
              id="btn-dashboard-view-all-announcements"
            >
              <span>Tazama Yote ({announcements.length})</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {announcements.slice(0, 2).map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectTab('announcements')}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-teal-200 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-2 group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {item.categoryLabelSwahili}
                    </span>
                    {item.isPinned && (
                      <span className="text-[10px] text-amber-700 font-bold flex items-center gap-1">
                        <Pin className="w-3 h-3 rotate-45" /> Pinned
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-teal-700 transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px] text-slate-400">
                  <span>{item.author.name}</span>
                  <span className="text-teal-700 font-bold flex items-center gap-0.5">
                    Soma <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Meals Timeline */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Milo Iliyorekodiwa Leo ({todayMeals.length})</h3>
            <p className="text-xs text-slate-500">Orodha ya vyakula ulivyokula na kiasi cha wanga kilichopimwa</p>
          </div>

          <button
            onClick={onOpenScanner}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 transition-colors"
          >
            <Camera className="w-4 h-4 text-emerald-600" />
            <span>Pima Mlo Mwingine</span>
          </button>
        </div>

        {todayMeals.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h4 className="font-bold text-slate-800 text-sm">Hakuna mlo uliorekodiwa leo</h4>
              <p className="text-xs text-slate-500">
                Piga picha sahani yako au chagua kutoka kwenye mifano ili AI ikokotoe wanga na uiongeze hapa.
              </p>
            </div>
            <button
              onClick={onOpenScanner}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
            >
              Piga Picha ya Chakula
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayMeals.map((meal) => (
              <div
                key={meal.id}
                className="bg-slate-50/70 border border-slate-200 hover:border-emerald-300 rounded-2xl p-4 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex gap-3">
                  {meal.imageUrl && (
                    <img
                      src={meal.imageUrl}
                      alt={meal.title}
                      className="w-20 h-20 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                        {meal.mealType === 'breakfast' ? 'Kifungua Kinywa' :
                         meal.mealType === 'lunch' ? 'Chakula cha Mchana' :
                         meal.mealType === 'dinner' ? 'Chakula cha Usiku' : 'Kitafunio'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm mt-1 truncate">{meal.title}</h4>

                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className="font-extrabold text-emerald-800">
                        Wanga: {meal.totalCarbs}g (Net: {meal.netCarbs}g)
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600">{meal.calories} kcal</span>
                    </div>
                  </div>
                </div>

                {/* Badges & Safety */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      meal.glycemicIndexLevel === 'Chini' ? 'bg-emerald-100 text-emerald-800' :
                      meal.glycemicIndexLevel === 'Wastani' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      GI {meal.glycemicIndexLevel}
                    </span>

                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-200/80 text-slate-700">
                      Protini: {meal.protein}g
                    </span>
                  </div>

                  <button
                    onClick={() => onDeleteMeal(meal.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Futa mlo huu"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
