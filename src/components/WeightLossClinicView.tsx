import React, { useState } from 'react';
import { 
  Scale, TrendingDown, Target, Award, PlusCircle, Calendar, 
  Flame, Droplets, Footprints, Utensils, CheckCircle2, ChevronRight, 
  Sparkles, AlertCircle, ArrowDown, Activity, Info, BookOpen, Heart
} from 'lucide-react';
import { RegisteredPatient, WeightLogEntry } from '../types';

interface WeightLossClinicViewProps {
  patient?: RegisteredPatient;
  onUpdatePatientWeight?: (weightKg: number, notes?: string) => void;
  onOpenConsultation?: () => void;
}

export const WeightLossClinicView: React.FC<WeightLossClinicViewProps> = ({
  patient,
  onUpdatePatientWeight,
  onOpenConsultation,
}) => {
  const [newWeightInput, setNewWeightInput] = useState<string>('');
  const [weightNote, setWeightNote] = useState<string>('');
  const [isLoggingWeight, setIsLoggingWeight] = useState(false);
  const [activeTab, setActiveTab] = useState<'tracker' | 'meal_plan' | 'habits' | 'foods'>('tracker');
  const [waterGlasses, setWaterGlasses] = useState(6);

  // Defaults if viewing without a preselected patient
  const startWeight = patient?.initialWeightKg || 92;
  const currentWeight = patient?.currentWeightKg || 85;
  const targetWeight = patient?.targetWeightKg || 75;
  const heightCm = patient?.heightCm || 172;

  // Calculations
  const heightM = heightCm / 100;
  const currentBmi = Number((currentWeight / (heightM * heightM)).toFixed(1));
  const startBmi = Number((startWeight / (heightM * heightM)).toFixed(1));
  const idealWeightMin = Number((18.5 * heightM * heightM).toFixed(1));
  const idealWeightMax = Number((24.9 * heightM * heightM).toFixed(1));

  const weightLost = Math.max(0, Number((startWeight - currentWeight).toFixed(1)));
  const weightRemaining = Math.max(0, Number((currentWeight - targetWeight).toFixed(1)));
  const totalGoalToLose = Math.max(1, startWeight - targetWeight);
  const progressPercent = Math.min(100, Math.max(0, Math.round((weightLost / totalGoalToLose) * 100)));

  // BMR & TDEE calculation (Harris-Benedict formula approximation)
  const isFemale = patient?.gender === 'female';
  const age = patient?.age || 35;
  const bmr = isFemale
    ? Math.round(10 * currentWeight + 6.25 * heightCm - 5 * age - 161)
    : Math.round(10 * currentWeight + 6.25 * heightCm - 5 * age + 5);
  const tdee = Math.round(bmr * 1.375); // Light to moderate activity
  const recommendedDeficitCalories = Math.max(1300, tdee - 500); // 500 kcal deficit

  const handleLogWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newWeightInput);
    if (!isNaN(val) && val > 30 && val < 250) {
      if (onUpdatePatientWeight) {
        onUpdatePatientWeight(val, weightNote.trim());
      }
      setIsLoggingWeight(false);
      setNewWeightInput('');
      setWeightNote('');
    }
  };

  const getBmiBadge = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Uzito Mdogo', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    if (bmi <= 24.9) return { label: 'Uzito Bora / Salama (Normal)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (bmi <= 29.9) return { label: 'Uzito Uliozidi (Overweight)', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    return { label: 'Unene Uliopitiliza (Obese)', color: 'bg-rose-100 text-rose-800 border-rose-300' };
  };

  const bmiStatus = getBmiBadge(currentBmi);

  // Sample weight logs fallback if patient logs not present
  const weightLogs: WeightLogEntry[] = patient?.weightLogs && patient.weightLogs.length > 0 
    ? patient.weightLogs 
    : [
        { id: '1', date: 'Wiki 1', weightKg: startWeight, notes: 'Kuanza kliniki ya kupunguza uzito' },
        { id: '2', date: 'Wiki 3', weightKg: startWeight - 2.5, notes: 'Kuzingatia upungufu wa kalori' },
        { id: '3', date: 'Wiki 5', weightKg: startWeight - 4.8, notes: 'Kuanza matembezi na kunywa maji' },
        { id: '4', date: 'Hivi Sasa', weightKg: currentWeight, notes: 'Maendeleo thabiti' },
      ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner: Weight Loss Clinic */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-emerald-700/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <Scale className="w-3.5 h-3.5" />
            <span>Kliniki ya Kupunguza Uzito & Udhibiti wa Mafuta Mwilini</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Safari Yako ya Kupunguza Uzito (Weight Transformation)
          </h2>
          <p className="text-sm text-emerald-100/90 max-w-2xl">
            Mwongozo wa kitaalamu wa kupunguza uzito kwa njia salama ya asili kupitia nakisi ya kalori, vyakula vyenye nyuzinyuzi nyingi vya Kitanzania, na tabia za kila siku.
          </p>
        </div>

        <button
          onClick={() => setIsLoggingWeight(!isLoggingWeight)}
          className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg transition-all flex items-center gap-2 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Rekodi Uzito wa Leo</span>
        </button>
      </div>

      {/* Weight Log Modal / Dropdown Form */}
      {isLoggingWeight && (
        <form onSubmit={handleLogWeightSubmit} className="bg-white p-5 rounded-3xl border-2 border-emerald-500 shadow-md space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-600" />
              <span>Ingiza Kipimo cha Uzito wa Leo (kg)</span>
            </h4>
            <button
              type="button"
              onClick={() => setIsLoggingWeight(false)}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold"
            >
              Funga
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Uzito Mpya (Kilo)</label>
              <input
                type="number"
                step="0.1"
                min={30}
                max={250}
                required
                placeholder={`Mfano: ${currentWeight}`}
                value={newWeightInput}
                onChange={(e) => setNewWeightInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Maelezo ya Leo (Hiari)</label>
              <input
                type="text"
                placeholder="Mfano: Asubuhi kabla ya kula, baada ya matembezi..."
                value={weightNote}
                onChange={(e) => setWeightNote(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsLoggingWeight(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 cursor-pointer"
            >
              Ghairi
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs cursor-pointer"
            >
              Hifadhi Uzito Mpya
            </button>
          </div>
        </form>
      )}

      {/* Progress Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Total Lost */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Kilo Zilizopungua</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-black text-emerald-700">-{weightLost}</span>
              <span className="text-sm font-bold text-slate-600">kg</span>
            </div>
            <p className="text-[11px] text-emerald-800 font-semibold mt-1">
              Tangu kuanza kliniki ({startWeight} kg)
            </p>
          </div>
        </div>

        {/* Current Weight */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Uzito wa Sasa</span>
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-black text-slate-900">{currentWeight}</span>
              <span className="text-sm font-bold text-slate-600">kg</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${bmiStatus.color}`}>
                BMI {currentBmi} • {bmiStatus.label}
              </span>
            </div>
          </div>
        </div>

        {/* Target & Remaining */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Lengo Linalolengwa</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-black text-indigo-900">{targetWeight}</span>
              <span className="text-sm font-bold text-slate-600">kg</span>
            </div>
            <p className="text-[11px] text-slate-600 font-semibold mt-1">
              Zimebaki: <strong className="text-indigo-700">{weightRemaining} kg</strong> kufikia lengo
            </p>
          </div>
        </div>

        {/* Journey Progress Bar */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Mafanikio ya Lengo</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{progressPercent}%</span>
              <span className="text-xs font-bold text-emerald-700">Inaendelea Vizuri!</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

      </div>

      {/* Tabs navigation for Weight Loss clinic */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab('tracker')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'tracker'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          Mwenendo & Historia ya Uzito
        </button>

        <button
          onClick={() => setActiveTab('meal_plan')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'meal_plan'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          Mpango wa Mlo wa Kupunguza Uzito
        </button>

        <button
          onClick={() => setActiveTab('habits')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'habits'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          Tabia za Kila Siku & Maji
        </button>

        <button
          onClick={() => setActiveTab('foods')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'foods'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          Vyakula 10 Bora vya Kuchoma Mafuta
        </button>
      </div>

      {/* Tab 1: Tracker & History */}
      {activeTab === 'tracker' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Metabolism & Calorie Deficit Box (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Kiwango cha Nishati & Nakisi ya Kalori (Caloric Deficit)</span>
              </h4>
              
              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between">
                  <span className="text-slate-600 font-semibold">BMR (Nishati ya Mwili Bila Kazi):</span>
                  <strong className="text-slate-900 text-sm font-black">{bmr} kcal/siku</strong>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between">
                  <span className="text-slate-600 font-semibold">TDEE (Jumla ya Matumizi ya Kalori):</span>
                  <strong className="text-teal-900 text-sm font-black">{tdee} kcal/siku</strong>
                </div>

                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-emerald-900 font-bold block">Lengo la Kula kwa Siku (Deficit):</span>
                    <span className="text-[10px] text-emerald-700">Nakisi ya -500 kcal kwa wiki kupunguza kilo 0.5 - 1.0</span>
                  </div>
                  <strong className="text-emerald-800 text-base font-black">{recommendedDeficitCalories} kcal</strong>
                </div>
              </div>

              <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-900">
                  <Info className="w-4 h-4" />
                  <span>Kanuni ya Dhahabu ya Kliniki:</span>
                </p>
                <p className="leading-relaxed">
                  Usijinyime chakula kiasi cha kula chini ya kalori 1,200. Kujinyima kupita kiasi kunapunguza kimetaboliki (starvation mode) na kukufanya unenepe tena haraka. Kula chakula chenye ujazo mwingi lakini kalori chache (mboga, supu, tango, mbegu).
                </p>
              </div>
            </div>

            {/* Healthy Weight Range */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                Kiwango Bora cha Uzito kwa Urefu Wako ({heightCm} cm)
              </h4>
              <div className="flex items-center justify-between p-3 bg-teal-50 rounded-2xl border border-teal-200 text-xs">
                <span className="text-teal-900 font-bold">Uzito Salama wa Kiafya (Normal BMI):</span>
                <span className="text-teal-950 font-black text-sm">{idealWeightMin} - {idealWeightMax} kg</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Kufikia uzito ulio kati ya {idealWeightMin} kg na {idealWeightMax} kg kutapunguza hatari ya shinikizo la damu, maumivu ya viungo, na kisukari kwa zaidi ya 80%.
              </p>
            </div>
          </div>

          {/* Right: History Timeline (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Rekodi ya Vipimo vya Uzito ({weightLogs.length})</span>
              </h4>
              <button
                onClick={() => setIsLoggingWeight(true)}
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Weka Kipimo</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-[440px] overflow-y-auto">
              {weightLogs.map((log, index) => {
                const prevLog = weightLogs[index + 1];
                const diff = prevLog ? Number((log.weightKg - prevLog.weightKg).toFixed(1)) : null;

                return (
                  <div key={log.id || index} className="py-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                        #{weightLogs.length - index}
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-black text-slate-900">
                          {log.date}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {log.notes || 'Kipimo cha kawaida cha kliniki'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm sm:text-base font-black text-slate-900">
                        {log.weightKg} kg
                      </p>
                      {diff !== null && (
                        <p className={`text-[10px] font-extrabold ${diff < 0 ? 'text-emerald-700' : diff > 0 ? 'text-rose-700' : 'text-slate-500'}`}>
                          {diff < 0 ? `▼ ${Math.abs(diff)} kg` : diff > 0 ? `▲ +${diff} kg` : 'Hakuna mabadiliko'}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Weight Loss Meal Plan */}
      {activeTab === 'meal_plan' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h4 className="text-lg font-black text-slate-900">
              Mpango wa Mlo wa Siku 7 wa Kupunguza Uzito (Low-Carb, High-Fiber Plan)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Umeandaliwa na wataalamu wa lishe kwa ajili ya kupunguza mafuta mwilini bila njaa na kulinda misuli.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Meal 1 */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                  Kifungua Kinywa (07:00 - 08:30)
                </span>
                <span className="text-[11px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md">
                  ~350 kcal • Protini 24g
                </span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                <li>Mayai 2 ya kuchemsha (sio ya kukaanga kwa mafuta).</li>
                <li>Parachichi nusu au robo kwa ajili ya mafuta salama ya moyo.</li>
                <li>Chai ya viungo asili (Tangawizi, Mdalasini, Hiliki) bila sukari kabisa.</li>
                <li><strong>Mbadala:</strong> Uji wa ulezi na soya kikombe 1 kidogo bila sukari.</li>
              </ul>
            </div>

            {/* Meal 2 */}
            <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-teal-950 uppercase tracking-wider">
                  Chakula cha Mchana (12:30 - 14:00)
                </span>
                <span className="text-[11px] font-bold bg-teal-200 text-teal-900 px-2 py-0.5 rounded-md">
                  ~500 kcal • Fiber 12g
                </span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                <li>Kipande 1 kidogo cha ugali wa dona (ukubwa wa ngumi) au viazi vitamu vidogo 2 vya kuchemsha.</li>
                <li>Samaki wa mvuke au sato/sangara aliyetokotwa na nyanya na kitunguu saumu.</li>
                <li>Nusu nzima ya sahani iwe mboga za majani (mchicha, sukuma wiki, mnavu).</li>
                <li>Glasi 1 kubwa ya maji dakika 20 kabla ya chakula.</li>
              </ul>
            </div>

            {/* Meal 3 */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                  Chakula cha Usiku (18:30 - 19:30)
                </span>
                <span className="text-[11px] font-bold bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded-md">
                  ~400 kcal • Mwepesi sana
                </span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                <li>Supu ya kuku wa kienyeji au kunde bila viazi au ndizi usiku.</li>
                <li>Saladi kubwa ya matango, nyanya na pilipili hoho na limao/ndimu.</li>
                <li>Epuka kabisa kula wanga mzito (ugali mkubwa, chipsi, wali) baada ya saa 2:00 usiku.</li>
              </ul>
            </div>

            {/* Meal 4 */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-950 uppercase tracking-wider">
                  Vitafunwa Salama vya Mchana (Snacks)
                </span>
                <span className="text-[11px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">
                  ~150 kcal
                </span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                <li>Karanga mbichi au za kuoka punje 15 - 20 (bila chumvi kali).</li>
                <li>Matango au karoti zilizokatwa vipande virefu.</li>
                <li>Tunda 1 dogo: pera, chenza, au tufaha (kula na maganda yake safi).</li>
                <li>Chai ya rangi ya kijani (Green Tea).</li>
              </ul>
            </div>

          </div>
        </div>
      )}

      {/* Tab 3: Habits & Water */}
      {activeTab === 'habits' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Water Tracker */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                <span>Unywaji wa Maji wa Leo (Lita 3 Lengwa)</span>
              </h4>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                {waterGlasses} / 10 Glasi (~{(waterGlasses * 0.3).toFixed(1)}L)
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Maji huharakisha uchomaji wa mafuta (Metabolic Rate) kwa 30% ndani ya dakika 40 baada ya kunywa. Kunywa glasi 2 kabla ya kila mlo.
            </p>

            {/* Glasses interactive bar */}
            <div className="flex flex-wrap gap-2 pt-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setWaterGlasses(i + 1)}
                  className={`w-10 h-12 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                    i < waterGlasses
                      ? 'bg-blue-600 text-white shadow-xs scale-105'
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}
                  title={`Glasi ya ${i + 1}`}
                >
                  <Droplets className="w-4 h-4" />
                  <span className="text-[10px] font-bold mt-0.5">{i + 1}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setWaterGlasses(Math.max(0, waterGlasses - 1))}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer"
              >
                - Punguza Glasi
              </button>
              <button
                onClick={() => setWaterGlasses(Math.min(12, waterGlasses + 1))}
                className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-lg border border-blue-200 cursor-pointer"
              >
                + Nimekunywa Glasi Nyingine
              </button>
            </div>
          </div>

          {/* Daily Physical Habits */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <Footprints className="w-5 h-5 text-emerald-600" />
              <span>Ratiba ya Mazoezi ya Kupunguza Mafuta</span>
            </h4>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Matembezi ya Haraka (Brisk Walking):</strong>
                  <span className="text-slate-600">Dakika 30 hadi 45 kila asubuhi au jioni (hatua 7,000 - 10,000). Husaidia kuchoma mafuta ya kiuno na mapaja.</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Kupanda Ngazi Badala ya Lifti:</strong>
                  <span className="text-slate-600">Njia rahisi ya kuchoma kalori wakati wa shughuli za ofisini au nyumbani bila kwenda gym.</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Usingizi wa Saa 7 hadi 8:</strong>
                  <span className="text-slate-600">Kukosa usingizi kunapandisha homoni ya Cortisol na Ghrelin inayoongeza hamu kubwa ya kula vyakula vya wanga na mafuta.</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Tab 4: Top 10 Fat Burning Foods */}
      {activeTab === 'foods' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h4 className="text-base sm:text-lg font-black text-slate-900">
              Vyakula 10 Bora vya Asili ya Kitanzania Vinavyosaidia Kuchoma Mafuta
            </h4>
            <p className="text-xs text-slate-500">
              Vyakula hivi vina kalori kidogo, nyuzinyuzi nyingi, na virutubisho vinavyoongeza kimetaboliki:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {[
              { name: '1. Tango na Ndimu / Limao', desc: 'Maji mengi sana na kalori sifuri. Hupunguza hamu ya kula na kusafisha mfumo wa mmeng’enyo.' },
              { name: '2. Mchicha & Sukuma Wiki', desc: 'Tajiri wa nyuzinyuzi, madini chuma na klorofili. Unaweza kula sahani nzima bila kuongeza uzito.' },
              { name: '3. Samaki wa Sato na Sangara', desc: 'Protini safi inayojenga misuli na kuongeza kasi ya mwili kuchoma mafuta masaa 4 baada ya kula.' },
              { name: '4. Mayai ya Kuchemsha', desc: 'Hutoa shibe ya kudumu masaa 5 mwilini na kukufanya usitamani vitafunwa vya barabarani.' },
              { name: '5. Ugali wa Dona & Ulezi', desc: 'Nafaka isiyokobolewa inayoingia taratibu kwenye damu, tofauti na sembe inayotengeneza mafuta ya kiuno.' },
              { name: '6. Parachichi (Robo hadi Nusu)', desc: 'Mafuta ya monounsaturated yanayosaidia mwili kuunguza mafuta mabaya (LDL cholesterol).' },
              { name: '7. Tangawizi & Vitunguu Saumu', desc: 'Huongeza joto la mwili (Thermogenesis) na kuongeza matumizi ya kalori kwa asilimia 5.' },
              { name: '8. Dagaa wa Kukaanga Kiasi / Kuchemsha', desc: 'Tajiri wa Calcium na Protini inayosaidia kuzuia mrundikano wa mafuta ya tumbo.' },
              { name: '9. Maharage ya Soya na Dengu', desc: 'Mbadala mzuri wa nyama nyekundu yenye mafuta. Yana protini na nyuzinyuzi nyingi.' },
              { name: '10. Chai ya Kijani (Green Tea)', desc: 'Ina kiambata cha EGCG kinachochochea seli za mafuta kutoa nishati wakati wa mazoezi.' },
            ].map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <h5 className="font-extrabold text-xs text-emerald-950">{item.name}</h5>
                <p className="text-[11px] text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
