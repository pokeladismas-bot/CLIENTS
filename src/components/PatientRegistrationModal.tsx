import React, { useState } from 'react';
import { 
  UserPlus, X, HeartPulse, Scale, Activity, Phone, MapPin, 
  Calendar, CheckCircle2, AlertCircle, FileText, Sparkles, Shield,
  Lock, KeyRound, ShieldCheck, Printer
} from 'lucide-react';
import { ClientCategory, DiabetesType, RegisteredPatient } from '../types';

interface PatientRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterPatient: (patient: RegisteredPatient) => void;
  initialCategory?: ClientCategory;
}

export const PatientRegistrationModal: React.FC<PatientRegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegisterPatient,
  initialCategory = 'kisukari',
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState<number>(35);
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [location, setLocation] = useState('Dar es Salaam');
  const [category, setCategory] = useState<ClientCategory>(initialCategory);
  const [diabetesType, setDiabetesType] = useState<DiabetesType>('type2');
  
  // Vitals
  const [weightKg, setWeightKg] = useState<number>(75);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(65);
  const [heightCm, setHeightCm] = useState<number>(165);
  const [glucoseMgDl, setGlucoseMgDl] = useState<string>('135');
  const [bloodPressure, setBloodPressure] = useState('120/80');
  const [waistCm, setWaistCm] = useState<number>(85);
  
  // Clinical / Dietary
  const [allergies, setAllergies] = useState('');
  const [foodPreferences, setFoodPreferences] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');
  const [primaryGoal, setPrimaryGoal] = useState('');

  // Security & Authentication for the patient
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123');
  const [canPrintReports, setCanPrintReports] = useState(false);

  if (!isOpen) return null;

  // Real-time BMI calculation
  const heightM = heightCm / 100;
  const bmi = heightM > 0 && weightKg > 0 ? Number((weightKg / (heightM * heightM)).toFixed(1)) : 0;
  
  const getBmiBadge = (val: number) => {
    if (val < 18.5) return { label: 'Uzito Mdogo (Underweight)', color: 'bg-amber-100 text-amber-800' };
    if (val <= 24.9) return { label: 'Uzito Bora (Normal)', color: 'bg-emerald-100 text-emerald-800' };
    if (val <= 29.9) return { label: 'Uzito Uliozidi (Overweight)', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Unene Uliopitiliza (Obese)', color: 'bg-rose-100 text-rose-800' };
  };

  const bmiStatus = getBmiBadge(bmi);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const cleanName = fullName.trim();
    const defaultUsername = username.trim() || cleanName.toLowerCase().split(' ')[0].replace(/[^a-z0-9]/g, '') || 'mgonjwa';

    const newPatient: RegisteredPatient = {
      id: 'pat-' + Date.now(),
      fullName: cleanName,
      phone: phone.trim() || '+255 700 000 000',
      username: defaultUsername,
      password: password.trim() || '123',
      canPrintReports,
      age: Number(age) || 30,
      gender,
      location: location.trim() || 'Tanzania',
      category,
      registeredDate: new Date().toISOString().split('T')[0],
      initialWeightKg: Number(weightKg) || 70,
      currentWeightKg: Number(weightKg) || 70,
      targetWeightKg: Number(targetWeightKg) || Number(weightKg) || 65,
      heightCm: Number(heightCm) || 165,
      initialGlucoseMgDl: glucoseMgDl ? Number(glucoseMgDl) : undefined,
      currentGlucoseMgDl: glucoseMgDl ? Number(glucoseMgDl) : undefined,
      bloodPressure: bloodPressure.trim() || '120/80',
      waistCm: waistCm ? Number(waistCm) : undefined,
      diabetesType: category === 'kisukari' ? diabetesType : undefined,
      allergies: allergies.trim() ? allergies.split(',').map(s => s.trim()) : [],
      foodPreferences: foodPreferences.trim() || 'Hana mapendeleo maalum',
      medicalConditions: medicalConditions.trim() || (category === 'kisukari' ? 'Kisukari' : category === 'kupunguza_uzito' ? 'Udhibiti wa Uzito' : 'Ushauri wa Lishe'),
      currentMedications: currentMedications.trim() || undefined,
      primaryGoal: primaryGoal.trim() || (category === 'kupunguza_uzito' ? `Kupunguza uzito kutoka ${weightKg}kg hadi ${targetWeightKg}kg` : category === 'kisukari' ? 'Kudhibiti sukari ya damu na kuboresha afya' : 'Kula mlo kamili na kuongeza kinga ya mwili'),
      prescriptions: [],
      weightLogs: [
        {
          id: 'w-init-' + Date.now(),
          date: new Date().toISOString().split('T')[0],
          weightKg: Number(weightKg) || 70,
          notes: 'Kipimo cha awali wakati wa usajili wa mgonjwa',
        },
      ],
    };

    onRegisterPatient(newPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950 text-white p-5 sm:p-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/40 text-teal-300 flex items-center justify-center">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Usajili wa Mgonjwa / Mteja Mpya
              </h3>
              <p className="text-xs text-teal-200/90 mt-0.5">
                Ingiza taarifa za kliniki kwa ajili ya Kisukari, Kupunguza Uzito, au Ushauri wa Kilishe
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          
          {/* Service Category Selection */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
              Chagua Aina ya Huduma / Kundi la Mteja:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setCategory('kisukari')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  category === 'kisukari'
                    ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-400 text-rose-950 font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <HeartPulse className={`w-4 h-4 ${category === 'kisukari' ? 'text-rose-600' : 'text-slate-500'}`} />
                  <span className="text-sm font-extrabold">Mgonjwa wa Kisukari</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Ufuatiliaji wa sukari, wanga, na mlo salama wa kisukari
                </p>
              </button>

              <button
                type="button"
                onClick={() => setCategory('kupunguza_uzito')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  category === 'kupunguza_uzito'
                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400 text-emerald-950 font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Scale className={`w-4 h-4 ${category === 'kupunguza_uzito' ? 'text-emerald-600' : 'text-slate-500'}`} />
                  <span className="text-sm font-extrabold">Kupunguza Uzito</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Kliniki ya kupunguza mafuta, kalori, na kuboresha BMI
                </p>
              </button>

              <button
                type="button"
                onClick={() => setCategory('lishe_jumla')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  category === 'lishe_jumla'
                    ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-400 text-teal-950 font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Activity className={`w-4 h-4 ${category === 'lishe_jumla' ? 'text-teal-600' : 'text-slate-500'}`} />
                  <span className="text-sm font-extrabold">Ushauri wa Jumla</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Lishe ya afya bora, kinga ya mwili na kuzuia magonjwa
                </p>
              </button>
            </div>
          </div>

          {/* Personal Info */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <span>Taarifa za Msingi za Mteja</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Jina Kamili la Mteja / Mgonjwa *</label>
                <input
                  type="text"
                  required
                  placeholder="Mfano: Juma Salum Bakari"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Namba ya Simu *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="+255 7XX XXX XXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Umri (Miaka)</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Jinsia</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                  >
                    <option value="female">Mwanamke</option>
                    <option value="male">Mwanaume</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Makazi / Mkoa / Mji</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Mfano: Kinondoni, Dar es Salaam"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                  />
                </div>
              </div>
            </div>

            {category === 'kisukari' && (
              <div className="pt-2 border-t border-slate-200">
                <label className="text-xs font-bold text-slate-700 block mb-1">Aina ya Kisukari:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'type2', label: 'Aina ya 2 (Type 2)' },
                    { id: 'type1', label: 'Aina ya 1 (Type 1)' },
                    { id: 'gestational', label: 'Kisukari cha Mimba' },
                    { id: 'prediabetes', label: 'Prediabetes' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setDiabetesType(item.id as DiabetesType)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        diabetesType === item.id
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Vitals & Measurements */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <span>Vipimo vya Awali (Baseline Vitals & Metrics)</span>
              </h4>
              <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${bmiStatus.color}`}>
                BMI: {bmi || '-'} • {bmiStatus.label}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Uzito wa Sasa (kg) *</label>
                <input
                  type="number"
                  step="0.5"
                  min={20}
                  max={250}
                  required
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Urefu (cm) *</label>
                <input
                  type="number"
                  min={80}
                  max={230}
                  required
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Lengo la Uzito (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  min={30}
                  max={200}
                  value={targetWeightKg}
                  onChange={(e) => setTargetWeightKg(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Sukari ya Damu (mg/dL)</label>
                <input
                  type="number"
                  placeholder="Mfano: 120"
                  value={glucoseMgDl}
                  onChange={(e) => setGlucoseMgDl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Shinikizo la Damu (BP)</label>
                <input
                  type="text"
                  placeholder="Mfano: 120/80"
                  value={bloodPressure}
                  onChange={(e) => setBloodPressure(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Mzunguko wa Kiuno (cm)</label>
                <input
                  type="number"
                  placeholder="Mfano: 85"
                  value={waistCm || ''}
                  onChange={(e) => setWaistCm(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                />
              </div>
            </div>
          </div>

          {/* Clinical & Dietary History */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Taarifa za Kilishe na Afya</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Mizio ya Vyakula (Allergies)</label>
                <input
                  type="text"
                  placeholder="Mfano: Maziwa ya ng'ombe, karanga, mayai..."
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Vyakula Anavyopendelea / Anavyochukia</label>
                <input
                  type="text"
                  placeholder="Mfano: Anapenda samaki na mboga, hatumii nguruwe..."
                  value={foodPreferences}
                  onChange={(e) => setFoodPreferences(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Magonjwa Mengine ya Kiafya</label>
                <input
                  type="text"
                  placeholder="Mfano: Presha ya damu, Vidonda vya tumbo..."
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Dawa Anazotumia Sasa</label>
                <input
                  type="text"
                  placeholder="Mfano: Metformin 500mg, Losartan..."
                  value={currentMedications}
                  onChange={(e) => setCurrentMedications(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Lengo Kuu la Mteja Kwenye Kliniki *</label>
              <textarea
                rows={2}
                placeholder={
                  category === 'kupunguza_uzito'
                    ? 'Mfano: Kupunguza kilo 15 ndani ya miezi 5, kupunguza kitambi, na kuanza mazoezi...'
                    : category === 'kisukari'
                    ? 'Mfano: Kudhibiti sukari isizidi 130 mg/dL bila kuchoka, kupunguza dozi ya dawa kwa ushauri wa daktari...'
                    : 'Mfano: Kula mlo uliokamilika, kuongeza kinga ya mwili na kuwa na nguvu kazini...'
                }
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
              />
            </div>
          </div>

          {/* Security Credentials & Print Access (Admin Control) */}
          <div className="bg-teal-50/70 p-4 sm:p-5 rounded-2xl border border-teal-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-teal-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-teal-700" />
                <span>Usalama na Nenosiri la Kuingia (Login & Privacy)</span>
              </h4>
              <span className="text-[10px] bg-teal-200/60 text-teal-900 px-2 py-0.5 rounded-full font-bold">
                Admin Control
              </span>
            </div>

            <p className="text-[11px] text-teal-950/80 leading-relaxed">
              Mteja atatumia nenosiri hili kuingia kwenye akaunti yake pekee. Taarifa zake hazitaonekana kwa mtumiaji mwingine yeyote isipokuwa wewe (Admin).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <span>Jina la Mtumiaji (Username)</span>
                </label>
                <input
                  type="text"
                  placeholder={fullName ? fullName.toLowerCase().split(' ')[0] : "Mfano: baraka"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-teal-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-teal-700" />
                  <span>Nenosiri / PIN ya Kuingia</span>
                </label>
                <input
                  type="text"
                  placeholder="Awali: 123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-teal-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white font-medium"
                />
              </div>
            </div>

            {/* Print Permission Checkbox */}
            <div className="pt-2 border-t border-teal-200 flex items-start gap-3">
              <input
                type="checkbox"
                id="check-can-print"
                checked={canPrintReports}
                onChange={(e) => setCanPrintReports(e.target.checked)}
                className="mt-1 w-4 h-4 text-teal-600 rounded border-teal-300 focus:ring-teal-500 cursor-pointer"
              />
              <label htmlFor="check-can-print" className="text-xs text-teal-950 font-medium cursor-pointer">
                <span className="font-bold block text-slate-900 flex items-center gap-1">
                  <Printer className="w-3.5 h-3.5 text-teal-700" />
                  Ruhusu Mgonjwa huyu Kuchapisha na Kupakua Ripoti (Print & Export Authorization)
                </span>
                <span className="text-[11px] text-slate-600 block mt-0.5">
                  Ikiachwa bila kuteuliwa, mgonjwa ataweza kuona taarifa tu lakini hataweza kuprint au kupakua PDF bila idhini ya Mtaalam.
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Ghairi
            </button>

            <button
              type="submit"
              disabled={!fullName.trim()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Sajili Mteja & Fungua Faili</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
