import React, { useState } from 'react';
import { 
  X, Save, User, Phone, MapPin, Activity, Scale, HeartPulse, 
  Baby, AlertTriangle, Shield, Check, FileText, Info 
} from 'lucide-react';
import { 
  RegisteredPatient, ClientCategory, DiabetesType, 
  ChildFeedingChallenge 
} from '../types';

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: RegisteredPatient;
  onSave: (updated: RegisteredPatient) => void;
}

export const EditPatientModal: React.FC<EditPatientModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSave,
}) => {
  const [fullName, setFullName] = useState(patient.fullName);
  const [phone, setPhone] = useState(patient.phone);
  const [age, setAge] = useState<number>(patient.age);
  const [gender, setGender] = useState<'male' | 'female'>(patient.gender);
  const [location, setLocation] = useState(patient.location || '');
  const [category, setCategory] = useState<ClientCategory>(patient.category || 'kisukari');
  const [diabetesType, setDiabetesType] = useState<DiabetesType>(patient.diabetesType || 'type2');
  
  // Baseline & Target Metrics
  const [initialWeightKg, setInitialWeightKg] = useState<number>(patient.initialWeightKg || 70);
  const [currentWeightKg, setCurrentWeightKg] = useState<number>(patient.currentWeightKg || 70);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(patient.targetWeightKg || 65);
  const [heightCm, setHeightCm] = useState<number>(patient.heightCm || 165);
  const [bloodPressure, setBloodPressure] = useState(patient.bloodPressure || '');
  const [waistCm, setWaistCm] = useState<number | undefined>(patient.waistCm);
  
  // Clinical
  const [allergiesText, setAllergiesText] = useState(
    Array.isArray(patient.allergies) ? patient.allergies.join(', ') : ''
  );
  const [foodPreferences, setFoodPreferences] = useState(patient.foodPreferences || '');
  const [medicalConditions, setMedicalConditions] = useState(patient.medicalConditions || '');
  const [currentMedications, setCurrentMedications] = useState(patient.currentMedications || '');
  const [primaryGoal, setPrimaryGoal] = useState(patient.primaryGoal || '');
  
  // Credentials
  const [username, setUsername] = useState(patient.username || '');
  const [password, setPassword] = useState(patient.password || '');
  const [canPrintReports, setCanPrintReports] = useState(patient.canPrintReports ?? false);

  // Child Profile State (for watoto_lishe or pediatric)
  const isChild = category === 'watoto_lishe' || age < 18;
  const [guardianName, setGuardianName] = useState(patient.childProfile?.guardianName || '');
  const [guardianPhone, setGuardianPhone] = useState(patient.childProfile?.guardianPhone || '');
  const [guardianRelation, setGuardianRelation] = useState(patient.childProfile?.guardianRelation || 'Mzazi / Mlezi');
  const [breastfeedingStatus, setBreastfeedingStatus] = useState<'anaendelea' | 'ameachishwa' | 'haihusiki'>(
    patient.childProfile?.breastfeedingStatus || 'haihusiki'
  );
  const [muacCm, setMuacCm] = useState<number | undefined>(patient.childProfile?.muacCm);
  const [selectedChallenges, setSelectedChallenges] = useState<ChildFeedingChallenge[]>(
    patient.childProfile?.feedingChallenges || []
  );

  if (!isOpen) return null;

  const toggleChallenge = (ch: ChildFeedingChallenge) => {
    setSelectedChallenges(prev => 
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
  };

  const getMuacStatus = (val?: number): 'kijani' | 'njano' | 'nyekundu' => {
    if (!val) return 'kijani';
    if (val < 11.5) return 'nyekundu';
    if (val <= 12.5) return 'njano';
    return 'kijani';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const allergies = allergiesText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const updatedPatient: RegisteredPatient = {
      ...patient,
      fullName: fullName.trim(),
      phone: phone.trim(),
      age: Number(age),
      gender,
      location: location.trim(),
      category,
      diabetesType: category === 'kisukari' ? diabetesType : patient.diabetesType,
      initialWeightKg: Number(initialWeightKg),
      currentWeightKg: Number(currentWeightKg),
      targetWeightKg: Number(targetWeightKg),
      heightCm: Number(heightCm),
      bloodPressure: bloodPressure.trim(),
      waistCm: waistCm ? Number(waistCm) : undefined,
      allergies,
      foodPreferences: foodPreferences.trim(),
      medicalConditions: medicalConditions.trim(),
      currentMedications: currentMedications.trim(),
      primaryGoal: primaryGoal.trim(),
      username: username.trim() || undefined,
      password: password.trim() || undefined,
      canPrintReports,
      childProfile: isChild ? {
        guardianName: guardianName.trim(),
        guardianPhone: guardianPhone.trim(),
        guardianRelation: guardianRelation.trim(),
        breastfeedingStatus,
        muacCm: muacCm ? Number(muacCm) : undefined,
        muacStatus: getMuacStatus(muacCm ? Number(muacCm) : undefined),
        feedingChallenges: selectedChallenges,
        knownAllergies: allergies,
        favoriteFoods: patient.childProfile?.favoriteFoods || [],
        dislikedFoods: patient.childProfile?.dislikedFoods || [],
        feedingLogs: patient.childProfile?.feedingLogs || [],
        specialPediatricDietPlan: patient.childProfile?.specialPediatricDietPlan,
      } : patient.childProfile,
    };

    onSave(updatedPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white">
                Rekebisha Taarifa za Mgonjwa
              </h2>
              <p className="text-xs text-teal-200">
                Sasisha wasifu, vipimo vya kliniki, na mpango wa ufuatiliaji
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-teal-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Kitengo cha Mgonjwa / Kliniki
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'kisukari', label: 'Kisukari', icon: HeartPulse },
                { id: 'kupunguza_uzito', label: 'Uzito & Kitambi', icon: Scale },
                { id: 'watoto_lishe', label: 'Watoto & Ulaji', icon: Baby },
                { id: 'lishe_jumla', label: 'Lishe ya Jumla', icon: Activity },
              ].map(cat => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id as ClientCategory)}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50 border-teal-600 text-teal-900 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-teal-600' : 'text-slate-400'}`} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Basic Demographics */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>Taarifa za Msingi</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jina Kamili</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Namba ya Simu</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+255 7XX XXX XXX"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Umri (Miaka)</label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    required
                    value={age}
                    onChange={e => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jinsia</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as 'male' | 'female')}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  >
                    <option value="female">Mwanamke</option>
                    <option value="male">Mwanaume</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mahali / Makazi</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Mf. Sinza, Dar es Salaam"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>

            {category === 'kisukari' && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Aina ya Kisukari</label>
                <select
                  value={diabetesType}
                  onChange={e => setDiabetesType(e.target.value as DiabetesType)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                >
                  <option value="type1">Kisukari Aina ya 1 (Type 1)</option>
                  <option value="type2">Kisukari Aina ya 2 (Type 2)</option>
                  <option value="gestational">Kisukari cha Ujauzito (Gestational)</option>
                  <option value="prediabetes">Kiwango cha Kabla ya Kisukari (Prediabetes)</option>
                </select>
              </div>
            )}
          </div>

          {/* Pediatric & Child Nutrition Section if applicable */}
          {isChild && (
            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <Baby className="w-4 h-4 text-amber-600" />
                  <span>Taarifa Maalum za Mtoto & Mlezi</span>
                </h3>
                <span className="text-[11px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                  Ufuatiliaji wa Mtoto
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jina la Mlezi / Mzazi</label>
                  <input
                    type="text"
                    value={guardianName}
                    onChange={e => setGuardianName(e.target.value)}
                    placeholder="Mf. Aurelia Mrema"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Simu ya Mlezi</label>
                  <input
                    type="tel"
                    value={guardianPhone}
                    onChange={e => setGuardianPhone(e.target.value)}
                    placeholder="+255 7XX XXX XXX"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Uhusiano</label>
                  <input
                    type="text"
                    value={guardianRelation}
                    onChange={e => setGuardianRelation(e.target.value)}
                    placeholder="Mama / Baba / Mlezi"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hali ya Kunyonyesha</label>
                  <select
                    value={breastfeedingStatus}
                    onChange={e => setBreastfeedingStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  >
                    <option value="anaendelea">Bado ananyonya maziwa ya mama</option>
                    <option value="ameachishwa">Ameachishwa kunyonya (Weaned)</option>
                    <option value="haihusiki">Haihusiki (Umri mkubwa)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mzingo wa Mkono (MUAC cm)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={muacCm || ''}
                      onChange={e => setMuacCm(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Mf. 12.3"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                    {muacCm && (
                      <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-xl uppercase whitespace-nowrap ${
                        muacCm < 11.5 ? 'bg-rose-100 text-rose-800' :
                        muacCm <= 12.5 ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {muacCm < 11.5 ? 'Nyekundu (Mkali)' : muacCm <= 12.5 ? 'Njano (Wastani)' : 'Kijani (Salama)'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Feeding challenges toggles */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Changamoto za Kilishe na Ulaji wa Mtoto
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'picky_eating', label: 'Kuchagua vyakula / Ugumu wa kula' },
                    { id: 'stunting_growth', label: 'Kudumaa / Uzito duni' },
                    { id: 'type1_diabetes', label: 'Kisukari cha Utotoni' },
                    { id: 'allergies', label: 'Mizio ya vyakula' },
                    { id: 'anemia_deficiency', label: 'Upungufu wa damu / virutubisho' },
                    { id: 'poor_appetite', label: 'Kukosa hamu ya kula' },
                  ].map(ch => {
                    const isChecked = selectedChallenges.includes(ch.id as ChildFeedingChallenge);
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => toggleChallenge(ch.id as ChildFeedingChallenge)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold text-left border flex items-center justify-between cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{ch.label}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-amber-700" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Body Measurements & Targets */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-teal-600" />
              <span>Vipimo vya Mwili & Malengo</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Uzito wa Awali (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={initialWeightKg}
                  onChange={e => setInitialWeightKg(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Uzito wa Sasa (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={currentWeightKg}
                  onChange={e => setCurrentWeightKg(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lengo la Uzito (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={targetWeightKg}
                  onChange={e => setTargetWeightKg(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Urefu (cm)</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={e => setHeightCm(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Shinikizo la Damu (BP)</label>
                <input
                  type="text"
                  value={bloodPressure}
                  onChange={e => setBloodPressure(e.target.value)}
                  placeholder="Mf. 120/80"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mzingo wa Kiuno (cm)</label>
                <input
                  type="number"
                  value={waistCm || ''}
                  onChange={e => setWaistCm(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Mf. 84"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Clinical Notes & Allergies */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              <span>Taarifa za Kilishe & Dawa</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mizio ya Vyakula (Tenganisha kwa koma)
              </label>
              <input
                type="text"
                value={allergiesText}
                onChange={e => setAllergiesText(e.target.value)}
                placeholder="Mf. Maziwa ya ng'ombe, karanga, ngano"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Dawa Anazotumia Sasa</label>
              <input
                type="text"
                value={currentMedications}
                onChange={e => setCurrentMedications(e.target.value)}
                placeholder="Mf. Metformin 500mg, Multivitamin"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lengo Kuu la Mteja / Mgonjwa</label>
              <textarea
                rows={2}
                value={primaryGoal}
                onChange={e => setPrimaryGoal(e.target.value)}
                placeholder="Mf. Kudhibiti sukari isipande juu ya 130 mg/dL na kupunguza kilo 5..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Patient Portal Credentials */}
          <div className="bg-teal-50/70 p-4 rounded-2xl border border-teal-200 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-teal-700" />
              <span>Akaunti ya Mgonjwa & Ruhusa</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jina la Kuingilia (Username)</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Mf. amina au baraka"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nenosiri / PIN ya Mgonjwa</label>
                <input
                  type="text"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mf. 1234"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={canPrintReports}
                onChange={e => setCanPrintReports(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
              <span className="text-xs font-bold text-teal-950">
                Mruhusu mgonjwa huyu kupakua au kuchapisha ripoti za kliniki
              </span>
            </label>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Ghairi
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-95 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Hifadhi Mabadiliko</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
