import React, { useState } from 'react';
import { User, X, CheckCircle2, ShieldCheck, HeartPulse, Scale, Bell, Clock, Volume2 } from 'lucide-react';
import { DailyReminderConfig, DiabetesType, GlucoseUnit, UserProfile } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [name, setName] = useState<string>(profile.name);
  const [diabetesType, setDiabetesType] = useState<DiabetesType>(profile.diabetesType);
  const [unit, setUnit] = useState<GlucoseUnit>(profile.unit);
  const [weightKg, setWeightKg] = useState<number>(profile.weightKg || 78);
  const [heightCm, setHeightCm] = useState<number>(profile.heightCm || 170);
  const [gender, setGender] = useState<'male' | 'female'>(profile.gender || 'male');
  const [age, setAge] = useState<number>(profile.age || 45);
  const [waistCm, setWaistCm] = useState<number>(profile.waistCm || 92);
  const [dailyCarbLimitGrams, setDailyCarbLimitGrams] = useState<number>(profile.dailyCarbLimitGrams);
  const [dailyFiberTarget, setDailyFiberTarget] = useState<number>(profile.dailyFiberTarget);
  const [dailyProteinTarget, setDailyProteinTarget] = useState<number>(profile.dailyProteinTarget);
  const [targetFastingMax, setTargetFastingMax] = useState<number>(profile.targetFastingMax);
  const [targetPostMealMax, setTargetPostMealMax] = useState<number>(profile.targetPostMealMax);
  const [medicationInfo, setMedicationInfo] = useState<string>(profile.medicationInfo || '');
  const [isAdmin, setIsAdmin] = useState<boolean>(profile.isAdmin || false);
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(
    profile.dailyReminders?.enabled !== undefined ? profile.dailyReminders.enabled : true
  );
  const [morningTime, setMorningTime] = useState<string>(
    profile.dailyReminders?.morningTime || '07:30'
  );
  const [afternoonTime, setAfternoonTime] = useState<string>(
    profile.dailyReminders?.afternoonTime || '13:30'
  );
  const [eveningTime, setEveningTime] = useState<string>(
    profile.dailyReminders?.eveningTime || '20:00'
  );

  if (!isOpen) return null;

  const heightInM = heightCm / 100;
  const currentBmi = heightInM > 0 ? Number((weightKg / (heightInM * heightInM)).toFixed(1)) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...profile,
      name,
      diabetesType,
      unit,
      weightKg: Number(weightKg),
      heightCm: Number(heightCm),
      gender,
      age: Number(age),
      waistCm: Number(waistCm),
      dailyCarbLimitGrams: Number(dailyCarbLimitGrams),
      dailyFiberTarget: Number(dailyFiberTarget),
      dailyProteinTarget: Number(dailyProteinTarget),
      targetFastingMax: Number(targetFastingMax),
      targetPostMealMax: Number(targetPostMealMax),
      medicationInfo: medicationInfo.trim(),
      isAdmin,
      dailyReminders: {
        enabled: remindersEnabled,
        morningTime,
        morningEnabled: true,
        afternoonTime,
        afternoonEnabled: true,
        eveningTime,
        eveningEnabled: true,
        browserNotifications: profile.dailyReminders?.browserNotifications || false,
        soundEnabled: profile.dailyReminders?.soundEnabled !== undefined ? profile.dailyReminders.soundEnabled : true,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-white">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Wasifu na Malengo ya Kisukari</h3>
              <p className="text-xs text-slate-500">Binafsisha mipangilio ya lishe, uzito, na viwango vya sukari</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Jina la Mgonjwa:</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Aina ya Kisukari:</label>
              <select
                value={diabetesType}
                onChange={(e) => setDiabetesType(e.target.value as DiabetesType)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="type2">Kisukari cha Aina ya 2 (Type 2)</option>
                <option value="type1">Kisukari cha Aina ya 1 (Type 1)</option>
                <option value="gestational">Kisukari cha Ujauzito (Gestational)</option>
                <option value="prediabetes">Awamu ya Awali (Pre-diabetes)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kipimo cha Glukosi:</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as GlucoseUnit)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="mg/dL">mg/dL (Kiwango Kikuu)</option>
                <option value="mmol/L">mmol/L</option>
              </select>
            </div>
          </div>

          {/* Body Measurements & BMI */}
          <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-teal-600" />
                <span>Vipimo vya Mwili & BMI</span>
              </h4>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-teal-200 text-teal-900 border border-teal-300">
                BMI: {currentBmi} kg/m²
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Uzito (kg):</label>
                <input
                  type="number"
                  step="0.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Urefu (cm):</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Umri (Miaka):</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Mzingo Kiuno (cm):</label>
                <input
                  type="number"
                  value={waistCm}
                  onChange={(e) => setWaistCm(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Daily Carb Limits */}
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-emerald-600" />
              <span>Malengo ya Lishe kwa Siku</span>
            </h4>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Upeo wa Wanga (g):</label>
                <input
                  type="number"
                  min="30"
                  max="300"
                  value={dailyCarbLimitGrams}
                  onChange={(e) => setDailyCarbLimitGrams(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-emerald-800 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Lengo Nyuzi/Fiber (g):</label>
                <input
                  type="number"
                  min="15"
                  max="80"
                  value={dailyFiberTarget}
                  onChange={(e) => setDailyFiberTarget(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-teal-800 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Protini (g):</label>
                <input
                  type="number"
                  min="30"
                  max="200"
                  value={dailyProteinTarget}
                  onChange={(e) => setDailyProteinTarget(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Blood Sugar Target Ranges */}
          <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-rose-600" />
              <span>Malengo ya Sukari ya Damu (mg/dL)</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                  Upeo Asubuhi Kabla ya Kula:
                </label>
                <input
                  type="number"
                  value={targetFastingMax}
                  onChange={(e) => setTargetFastingMax(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                />
                <span className="text-[10px] text-slate-500">Kawaida: 70 - 130 mg/dL</span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                  Upeo Masaa 2 Baada ya Kula:
                </label>
                <input
                  type="number"
                  value={targetPostMealMax}
                  onChange={(e) => setTargetPostMealMax(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                />
                <span className="text-[10px] text-slate-500">Kawaida: &lt; 180 mg/dL</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Dawa / Insulini unayotumia (Hiari):
            </label>
            <textarea
              rows={2}
              placeholder="Mfano: Metformin 500mg, Insulini dozi 10 units..."
              value={medicationInfo}
              onChange={(e) => setMedicationInfo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Daily Glucose Reminders Setting Card */}
          <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Vikumbusho vya Kila Siku vya Sukari</span>
                  <span className="text-[11px] text-slate-500">Kupokea arifa za kupima sukari kila siku</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={remindersEnabled}
                  onChange={(e) => setRemindersEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            {remindersEnabled && (
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-rose-200/60">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Asubuhi (Fasting):</label>
                  <input
                    type="time"
                    value={morningTime}
                    onChange={(e) => setMorningTime(e.target.value)}
                    className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Mchana (Post-Lunch):</label>
                  <input
                    type="time"
                    value={afternoonTime}
                    onChange={(e) => setAfternoonTime(e.target.value)}
                    className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Usiku (Bedtime):</label>
                  <input
                    type="time"
                    value={eveningTime}
                    onChange={(e) => setEveningTime(e.target.value)}
                    className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Admin / Nutritional Specialist Mode Toggle */}
          <div className="p-3.5 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Jukumu la Msimamizi / Daktari wa Lishe (Admin)</span>
              <span className="text-[11px] text-slate-500">Inakuruhusu kuweka, kuhariri, na kufuta matangazo ya kilishe</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Hifadhi Mabadiliko</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
