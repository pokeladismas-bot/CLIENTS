import React, { useState } from 'react';
import { User, X, CheckCircle2, ShieldCheck, HeartPulse, Scale, Bell, Clock, Volume2, Settings, Sliders, Lock, KeyRound, MapPin, Compass, Utensils } from 'lucide-react';
import { AuthSession, DailyReminderConfig, DiabetesType, GlucoseUnit, SecuritySettings, UserProfile } from '../types';
import { TANZANIA_REGIONS, getDistrictsForRegion, getRegionInfo } from '../data/tanzaniaRegions';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
  authSession?: AuthSession | null;
  securitySettings?: SecuritySettings;
  onOpenSecuritySettings?: () => void;
  onOpenChangePasswordModal?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  authSession = null,
  securitySettings,
  onOpenSecuritySettings,
  onOpenChangePasswordModal,
}) => {
  const [name, setName] = useState<string>(profile.name);
  const [diabetesType, setDiabetesType] = useState<DiabetesType>(profile.diabetesType);
  const [unit, setUnit] = useState<GlucoseUnit>(profile.unit);
  const [region, setRegion] = useState<string>(profile.region || 'Dar es Salaam');
  const [district, setDistrict] = useState<string>(profile.district || 'Kinondoni');
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
    const finalDistrict = district || getDistrictsForRegion(region)[0] || 'Mjini';
    onSaveProfile({
      ...profile,
      name,
      diabetesType,
      unit,
      region,
      district: finalDistrict,
      location: `${finalDistrict}, ${region}`,
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

          {/* Mkoa na Wilaya ya Mgonjwa kwa Ajili ya Ushauri wa Vyakula */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                <span>Eneo la Makazi (Mkoa na Wilaya ya Tanzania)</span>
              </span>
              <span className="text-[10px] text-teal-800 font-bold bg-teal-100 px-2 py-0.5 rounded-full">
                Ushauri wa Vyakula vya Eneo Hili
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Mkoa:</label>
                <select
                  value={region}
                  onChange={(e) => {
                    const newReg = e.target.value;
                    setRegion(newReg);
                    const dists = getDistrictsForRegion(newReg);
                    setDistrict(dists[0] || '');
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {TANZANIA_REGIONS.map((r) => (
                    <option key={r.name} value={r.name}>
                      {r.name} ({r.zone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Wilaya:</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {getDistrictsForRegion(region).map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(() => {
              const regInfo = getRegionInfo(region);
              if (!regInfo) return null;
              return (
                <div className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-200/80 text-[11px] text-teal-900 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <Utensils className="w-3.5 h-3.5 text-teal-700" />
                    <span>Vyakula vya asili vya {regInfo.name} ({district}):</span>
                  </div>
                  <p className="text-[10px] text-teal-800 leading-tight">
                    {regInfo.commonStaples.slice(0, 3).join(', ')} • {regInfo.commonVegetables.slice(0, 3).join(', ')} • {regInfo.commonProteins.slice(0, 2).join(', ')}
                  </p>
                </div>
              );
            })()}
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

          {/* Admin Dedicated System Settings Block */}
          {(authSession?.role === 'admin' || isAdmin) && (
            <div className="p-4 bg-teal-50/90 rounded-2xl border-2 border-teal-500/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-800 text-teal-200 flex items-center justify-center font-black">
                    <ShieldCheck className="w-5 h-5 text-teal-300" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 block">Mipangilio ya Msimamizi Mkuu (Admin Settings)</span>
                    <span className="text-[11px] text-teal-800 font-medium">Akaunti: {securitySettings?.adminEmail || 'dismaspokela@gmail.com'}</span>
                  </div>
                </div>
                <span className="text-[10px] bg-teal-700 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Admin
                </span>
              </div>

              <div className="text-xs text-slate-700 space-y-1.5 bg-white p-3 rounded-xl border border-teal-200/80">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">PIN ya Admin ya Haraka:</span>
                  <span className="font-mono font-bold text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">{securitySettings?.adminPin || '8822'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Nenosiri Kuu la Mfumo:</span>
                  <span className="font-mono font-bold text-slate-700">••••••••</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Kufunga Mfumo (Auto-Lock):</span>
                  <span className="font-bold text-slate-800">Dakika {securitySettings?.autoLockMinutes || 10}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Usawazishaji (Auto-Sync):</span>
                  <span className="font-bold text-emerald-700">
                    {securitySettings?.autoSyncEnabled !== false ? `Kila sekunde ${securitySettings?.syncIntervalSeconds || 30}` : 'Imezimwa'}
                  </span>
                </div>
              </div>

              {/* Badilisha Nenosiri Lako baada ya kuingia kwenye mfumo */}
              {onOpenChangePasswordModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenChangePasswordModal();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <KeyRound className="w-4 h-4 text-amber-200" />
                  <span>🔑 Badilisha Nenosiri Lako la Kuingia</span>
                </button>
              )}

              {onOpenSecuritySettings && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSecuritySettings();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 active:scale-[0.99] text-white text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Sliders className="w-4 h-4 text-teal-200" />
                  <span>Fungua Mipangilio Kamili ya Usalama & Mfumo</span>
                </button>
              )}
            </div>
          )}

          {/* Badilisha Nenosiri kwa mtumiaji wa kawaida aliyeingia kwenye mfumo */}
          {authSession && authSession.role !== 'admin' && onOpenChangePasswordModal && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenChangePasswordModal();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <KeyRound className="w-4 h-4 text-amber-600" />
                <span>🔑 Badilisha Nenosiri / PIN Yako</span>
              </button>
            </div>
          )}

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
