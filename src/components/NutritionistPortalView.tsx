import React, { useState } from 'react';
import { 
  Users, UserPlus, HeartPulse, Scale, Activity, Search, Filter, 
  Calendar, FileText, Printer, CheckCircle2, ChevronRight, PlusCircle, 
  Sparkles, AlertCircle, ArrowUpRight, Clock, MapPin, Phone, ShieldAlert,
  Edit3, Trash2, Lock, KeyRound, ShieldCheck, Eye, EyeOff, Shield, Check,
  Baby, Send, Database, Download, Smartphone
} from 'lucide-react';
import { 
  ClientCategory, RegisteredPatient, NutritionistPrescription, 
  SecuritySettings, GlucoseLog, MealLog 
} from '../types';
import { EditPatientModal } from './EditPatientModal';
import { PatientReferralModal } from './PatientReferralModal';
import { PatientAIAnalysisModal } from './PatientAIAnalysisModal';
import { ChildNutritionTrackerView } from './ChildNutritionTrackerView';

interface NutritionistPortalViewProps {
  patients: RegisteredPatient[];
  onOpenRegisterModal: (category?: ClientCategory) => void;
  onUpdatePatient: (updated: RegisteredPatient) => void;
  onDeletePatient?: (patientId: string) => void;
  onSelectActivePatientForView: (patient: RegisteredPatient) => void;
  onOpenPrintReport: (glucoseValue?: number) => void;
  securitySettings?: SecuritySettings;
  onUpdateSecuritySettings?: (settings: SecuritySettings) => void;
  glucoseLogs?: GlucoseLog[];
  mealLogs?: MealLog[];
  onOpenAdminPractitionersModal?: () => void;
  onOpenAdminBackupModal?: () => void;
  onOpenInstallerModal?: () => void;
  onOpenSecuritySettings?: () => void;
}

export const NutritionistPortalView: React.FC<NutritionistPortalViewProps> = ({
  patients,
  onOpenRegisterModal,
  onUpdatePatient,
  onDeletePatient,
  onSelectActivePatientForView,
  onOpenPrintReport,
  securitySettings,
  onUpdateSecuritySettings,
  glucoseLogs = [],
  mealLogs = [],
  onOpenAdminPractitionersModal,
  onOpenAdminBackupModal,
  onOpenInstallerModal,
  onOpenSecuritySettings,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isEditingPatientModalOpen, setIsEditingPatientModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isAIAnalysisModalOpen, setIsAIAnalysisModalOpen] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [patientSubTab, setPatientSubTab] = useState<'prescriptions' | 'pediatric' | 'referrals'>('prescriptions');
  
  // State for adding new prescription
  const [isAddingPrescription, setIsAddingPrescription] = useState(false);
  const [assessmentText, setAssessmentText] = useState('');
  const [targetCalories, setTargetCalories] = useState<number>(1700);
  const [targetCarbs, setTargetCarbs] = useState<number>(120);
  const [targetProtein, setTargetProtein] = useState<number>(85);
  const [targetFiber, setTargetFiber] = useState<number>(32);
  const [breakfastPlan, setBreakfastPlan] = useState('');
  const [lunchPlan, setLunchPlan] = useState('');
  const [dinnerPlan, setDinnerPlan] = useState('');
  const [snacksPlan, setSnacksPlan] = useState('');
  const [emphasizeFoods, setEmphasizeFoods] = useState('');
  const [avoidFoods, setAvoidFoods] = useState('');
  const [dietaryInstructions, setDietaryInstructions] = useState('');
  const [nextCheckup, setNextCheckup] = useState('');

  // State for quick vitals log
  const [isLoggingVitals, setIsLoggingVitals] = useState(false);
  const [newWeight, setNewWeight] = useState<number>(70);
  const [newGlucose, setNewGlucose] = useState<string>('');
  const [newBp, setNewBp] = useState<string>('');
  const [vitalsNote, setVitalsNote] = useState('');

  // Security Management State
  const [isEditingAdminPassword, setIsEditingAdminPassword] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState(securitySettings?.adminPassword || 'admin123');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [isEditingPatientPassword, setIsEditingPatientPassword] = useState(false);
  const [patientPasswordInput, setPatientPasswordInput] = useState('');
  const [showPatientPassword, setShowPatientPassword] = useState(false);

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  // Filtering
  const filteredPatients = patients.filter(p => {
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    const matchesSearch = 
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Category counts
  const totalCount = patients.length;
  const diabetesCount = patients.filter(p => p.category === 'kisukari').length;
  const weightLossCount = patients.filter(p => p.category === 'kupunguza_uzito').length;
  const childrenCount = patients.filter(p => p.category === 'watoto_lishe' || p.age < 18).length;
  const bpCount = patients.filter(p => p.category === 'shinikizo_la_damu').length;
  const generalCount = patients.filter(p => p.category === 'lishe_jumla').length;

  const calculateBmi = (weightKg: number, heightCm: number) => {
    const m = heightCm / 100;
    return m > 0 ? Number((weightKg / (m * m)).toFixed(1)) : 0;
  };

  const getBmiBadge = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Uzito Mdogo', color: 'bg-amber-100 text-amber-800' };
    if (bmi <= 24.9) return { label: 'Uzito Bora', color: 'bg-emerald-100 text-emerald-800' };
    if (bmi <= 29.9) return { label: 'Uzito Uliozidi', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Unene Uliopitiliza', color: 'bg-rose-100 text-rose-800' };
  };

  // Add Prescription Handler
  const handleSavePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const newRx: NutritionistPrescription = {
      id: 'rx-' + Date.now(),
      date: new Date().toISOString(),
      nutritionistName: 'Dkt. Mtaalamu wa Lishe (AfyaLishe Clinic)',
      clinicalAssessment: assessmentText.trim() || 'Tathmini ya kawaida ya maendeleo ya kilishe na afya ya mteja.',
      recommendedDailyCalories: Number(targetCalories) || 1800,
      recommendedDailyCarbsGrams: Number(targetCarbs) || 120,
      recommendedDailyProteinGrams: Number(targetProtein) || 75,
      recommendedDailyFiberGrams: Number(targetFiber) || 30,
      dietaryInstructions: dietaryInstructions.trim() || 'Kuzingatia upishi wa asili bila kukaanga kwa mafuta mengi, na kunywa maji ya kutosha.',
      foodsToEmphasize: emphasizeFoods.trim() ? emphasizeFoods.split(',').map(s => s.trim()) : ['Mboga za majani', 'Samaki', 'Dona'],
      foodsToStrictlyAvoid: avoidFoods.trim() ? avoidFoods.split(',').map(s => s.trim()) : ['Sukari nyeupe', 'Soda', 'Sembe nyingi'],
      mealPlanSummary: {
        breakfast: breakfastPlan.trim() || 'Uji wa ulezi / chai ya viungo + yai au parachichi',
        lunch: lunchPlan.trim() || 'Ugali wa dona (ngumi 1) + mboga nyingi + samaki/maharage',
        dinner: dinnerPlan.trim() || 'Supu ya kuku/mboga mchanganyiko + saladi safi',
        snacks: snacksPlan.trim() || 'Tango au matunda yenye sukari kidogo + maji',
      },
      nextCheckupDate: nextCheckup || undefined,
    };

    const updatedPatient: RegisteredPatient = {
      ...selectedPatient,
      prescriptions: [newRx, ...(selectedPatient.prescriptions || [])],
    };

    onUpdatePatient(updatedPatient);
    setIsAddingPrescription(false);
    // Reset form
    setAssessmentText('');
    setBreakfastPlan('');
    setLunchPlan('');
    setDinnerPlan('');
    setSnacksPlan('');
    setEmphasizeFoods('');
    setAvoidFoods('');
    setDietaryInstructions('');
  };

  // Quick Vitals Handler
  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const updatedLogs = [
      ...(selectedPatient.weightLogs || []),
      {
        id: 'w-' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        weightKg: Number(newWeight) || selectedPatient.currentWeightKg,
        notes: vitalsNote.trim() || 'Ukaguzi wa mara kwa mara wa kliniki',
      },
    ];

    const updatedPatient: RegisteredPatient = {
      ...selectedPatient,
      currentWeightKg: Number(newWeight) || selectedPatient.currentWeightKg,
      currentGlucoseMgDl: newGlucose ? Number(newGlucose) : selectedPatient.currentGlucoseMgDl,
      bloodPressure: newBp.trim() || selectedPatient.bloodPressure,
      weightLogs: updatedLogs,
    };

    onUpdatePatient(updatedPatient);
    setIsLoggingVitals(false);
    setVitalsNote('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner: Nutritionist Clinical Workspace */}
      <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-teal-800/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Kituo Kikuu cha Mtaalam wa Lishe (Clinical Nutritionist Desk)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Usimamizi wa Wagonjwa na Wateja wa Kliniki
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl">
            Sajili wagonjwa wapya, fuatilia maendeleo ya sukari na uzito, weka mipango maalum ya chakula, na toa ushauri wa kitaalamu kwa kila mgonjwa.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {onOpenInstallerModal && (
            <button
              onClick={onOpenInstallerModal}
              className="flex-1 md:flex-initial px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-md border border-emerald-400/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
              title="Sakinisha Mfumo kwenye Kifaa hiki (Kompyuta au Simu ya Kliniki)"
            >
              <Download className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>📲 Sakinisha App</span>
            </button>
          )}

          {onOpenSecuritySettings && (
            <button
              type="button"
              onClick={onOpenSecuritySettings}
              className="flex-1 md:flex-initial px-4 py-3 rounded-2xl bg-teal-800 hover:bg-teal-700 text-teal-100 font-extrabold text-sm shadow-md border border-teal-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
              title="Fungua Mipangilio ya Kitaalamu, Viwango vya Kliniki na Ulinzi wa Taarifa"
            >
              <ShieldCheck className="w-4 h-4 text-teal-300" />
              <span>⚙️ Mipangilio ya Ulinzi</span>
            </button>
          )}

          {onOpenAdminBackupModal && (
            <button
              onClick={onOpenAdminBackupModal}
              className="flex-1 md:flex-initial px-4 py-3 rounded-2xl bg-purple-700 hover:bg-purple-600 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              title="Pakua na Pakia Data za Mfumo (Backup / Restore)"
            >
              <Database className="w-4 h-4" />
              <span>💾 Pakua & Pakia Data</span>
            </button>
          )}

          {onOpenAdminPractitionersModal && (
            <button
              onClick={onOpenAdminPractitionersModal}
              className="flex-1 md:flex-initial px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              title="Wasajili na kuwasimamia madaktari na wataalamu wa lishe"
            >
              <Users className="w-4 h-4" />
              <span>🩺 Wasajili Madaktari & Wataalamu</span>
            </button>
          )}

          <button
            onClick={() => onOpenRegisterModal('kisukari')}
            className="flex-1 md:flex-initial px-4 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Sajili Mgonjwa Mpya</span>
          </button>
        </div>
      </div>

      {/* ADMIN SECURITY & ACCESS CONTROL PANEL */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-400/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white">Dawati la Udhibiti wa Ulinzi & Ruhusa (Security Control)</h3>
                <span className="text-[10px] uppercase font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30 px-2 py-0.5 rounded-full">
                  Admin Master
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Dhibiti nenosiri la Admin, ruhusa za ku-print ripoti kwa wagonjwa, na faragha ya data.
              </p>
            </div>
          </div>

          {/* Global Print Permission Switch */}
          {securitySettings && onUpdateSecuritySettings && (
            <button
              type="button"
              id="btn-global-toggle-printing"
              onClick={() => {
                onUpdateSecuritySettings({
                  ...securitySettings,
                  allowPatientPrinting: !securitySettings.allowPatientPrinting,
                });
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm border ${
                securitySettings.allowPatientPrinting
                  ? 'bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border-emerald-500/50'
                  : 'bg-rose-600/30 hover:bg-rose-600/40 text-rose-300 border-rose-500/50'
              }`}
              title="Bofya kubadili ruhusa ya uchapishaji kwa wagonjwa wote"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>
                Uchapishaji wa Ripoti: {securitySettings.allowPatientPrinting ? 'Umeruhusiwa Wote' : 'Umefungwa (Locked)'}
              </span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Admin Master Password Control */}
          <div className="bg-slate-800/80 rounded-2xl p-3.5 border border-slate-700/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-teal-400" />
                <span>Nenosiri la Mtaalam (Admin PIN)</span>
              </span>
              <button
                type="button"
                onClick={() => setShowAdminPassword(!showAdminPassword)}
                className="text-slate-400 hover:text-slate-200 text-[11px] flex items-center gap-1"
              >
                {showAdminPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showAdminPassword ? 'Ficha' : 'Onyesha'}</span>
              </button>
            </div>

            {isEditingAdminPassword ? (
              <div className="flex items-center gap-1.5 mt-1">
                <input
                  type="text"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-teal-500 text-white font-mono text-xs focus:outline-none"
                  placeholder="Nenosiri jipya..."
                />
                <button
                  type="button"
                  onClick={() => {
                    if (securitySettings && onUpdateSecuritySettings && adminPasswordInput.trim()) {
                      onUpdateSecuritySettings({
                        ...securitySettings,
                        adminPassword: adminPasswordInput.trim(),
                      });
                      setIsEditingAdminPassword(false);
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400"
                >
                  Hifadhi
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingAdminPassword(false)}
                  className="px-2 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-xs hover:bg-slate-600"
                >
                  X
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-black text-teal-300 tracking-wider">
                  {showAdminPassword ? (securitySettings?.adminPassword || 'admin123') : '••••••••'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAdminPasswordInput(securitySettings?.adminPassword || 'admin123');
                    setIsEditingAdminPassword(true);
                  }}
                  className="text-xs text-teal-400 hover:text-teal-300 font-bold underline"
                >
                  Badili Nenosiri
                </button>
              </div>
            )}
          </div>

          {/* User Data Isolation Status */}
          <div className="bg-slate-800/80 rounded-2xl p-3.5 border border-slate-700/70 space-y-1">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Faragha ya Data (User Isolation)</span>
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Kila mteja / mgonjwa anaona milo yake, vipimo vya sukari na uzito wake tu. Hakuna anayeweza kuona faili la mgonjwa mwingine isipokuwa Admin.
            </p>
          </div>

          {/* Direct Print Lock Control */}
          <div className="bg-slate-800/80 rounded-2xl p-3.5 border border-slate-700/70 space-y-1">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Printer className="w-3.5 h-3.5 text-indigo-400" />
              <span>Udhibiti wa Uchapishaji (Print Gate)</span>
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Mgonjwa akijaribu ku-print au kupakua PDF bila ruhusa, mfumo utamtaka aweke nenosiri la Mtaalam (Admin) kuidhinisha.
            </p>
          </div>
        </div>
      </div>

      {/* Metric Counters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div 
          onClick={() => setFilterCategory('all')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            filterCategory === 'all' 
              ? 'bg-white border-teal-500 shadow-md ring-2 ring-teal-500/20' 
              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Jumla</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalCount}</p>
          <span className="text-[10px] font-semibold text-teal-700">Wagonjwa Wote</span>
        </div>

        <div 
          onClick={() => setFilterCategory('kisukari')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            filterCategory === 'kisukari' 
              ? 'bg-rose-50/70 border-rose-500 shadow-md ring-2 ring-rose-500/20' 
              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-rose-600 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Kisukari</span>
            <HeartPulse className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{diabetesCount}</p>
          <span className="text-[10px] font-semibold text-rose-700">Sukari & Wanga</span>
        </div>

        <div 
          onClick={() => setFilterCategory('shinikizo_la_damu')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            filterCategory === 'shinikizo_la_damu' 
              ? 'bg-rose-50/70 border-rose-600 shadow-md ring-2 ring-rose-600/20' 
              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-rose-700 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Presha (BP)</span>
            <Activity className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{bpCount}</p>
          <span className="text-[10px] font-semibold text-rose-700">Shinikizo la Damu</span>
        </div>

        <div 
          onClick={() => setFilterCategory('kupunguza_uzito')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            filterCategory === 'kupunguza_uzito' 
              ? 'bg-emerald-50/70 border-emerald-500 shadow-md ring-2 ring-emerald-500/20' 
              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-600 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Uzito</span>
            <Scale className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{weightLossCount}</p>
          <span className="text-[10px] font-semibold text-emerald-700">Kupunguza Uzito</span>
        </div>

        <div 
          onClick={() => setFilterCategory('watoto_lishe')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            filterCategory === 'watoto_lishe' 
              ? 'bg-amber-50/70 border-amber-500 shadow-md ring-2 ring-amber-500/20' 
              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Watoto</span>
            <Baby className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{childrenCount}</p>
          <span className="text-[10px] font-semibold text-amber-700">Ulaji & Lishe</span>
        </div>

        <div 
          onClick={() => setFilterCategory('lishe_jumla')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            filterCategory === 'lishe_jumla' 
              ? 'bg-teal-50/70 border-teal-500 shadow-md ring-2 ring-teal-500/20' 
              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-teal-600 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Lishe Jumla</span>
            <Activity className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{generalCount}</p>
          <span className="text-[10px] font-semibold text-teal-700">Ushauri wa Jumla</span>
        </div>
      </div>

      {/* Main Workspace Layout: Patients Directory (Left) + Selected Patient File (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Patient List (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-700" />
                <span>Orodha ya Wateja ({filteredPatients.length})</span>
              </h3>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Tafuta kwa jina, simu, makazi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors ${
                  filterCategory === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Wote ({totalCount})
              </button>
              <button
                onClick={() => setFilterCategory('kisukari')}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors ${
                  filterCategory === 'kisukari'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                Kisukari ({diabetesCount})
              </button>
              <button
                onClick={() => setFilterCategory('kupunguza_uzito')}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors ${
                  filterCategory === 'kupunguza_uzito'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                Uzito ({weightLossCount})
              </button>
              <button
                onClick={() => setFilterCategory('watoto_lishe')}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors ${
                  filterCategory === 'watoto_lishe'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                Watoto ({childrenCount})
              </button>
            </div>

            {/* Scrollable Patient Cards */}
            <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
              {filteredPatients.length === 0 ? (
                <div className="p-6 text-center text-slate-500 space-y-2">
                  <p className="text-xs">Hakuna mteja aliyepatikana kwa kigezo hiki.</p>
                  <button
                    onClick={() => onOpenRegisterModal()}
                    className="text-xs font-bold text-teal-700 hover:underline"
                  >
                    + Sajili Mgonjwa Mpya Sasa
                  </button>
                </div>
              ) : (
                filteredPatients.map((patient) => {
                  const isSelected = selectedPatient?.id === patient.id;
                  const patientBmi = calculateBmi(patient.currentWeightKg, patient.heightCm);
                  const isDiabetes = patient.category === 'kisukari';
                  const isWeightLoss = patient.category === 'kupunguza_uzito';
                  const isChild = patient.category === 'watoto_lishe' || patient.age < 18;

                  return (
                    <div
                      key={patient.id}
                      onClick={() => setSelectedPatientId(patient.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                            {patient.fullName}
                          </p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span className="truncate">{patient.location}</span>
                            <span>•</span>
                            <span>{patient.age} yrs</span>
                          </p>
                        </div>

                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md whitespace-nowrap uppercase tracking-wide ${
                          isChild ? 'bg-amber-100 text-amber-800' :
                          isDiabetes ? 'bg-rose-100 text-rose-800' :
                          isWeightLoss ? 'bg-emerald-100 text-emerald-800' :
                          'bg-teal-100 text-teal-800'
                        }`}>
                          {isChild ? 'Watoto & Ulaji' : isDiabetes ? 'Kisukari' : isWeightLoss ? 'Kupunguza Uzito' : 'Lishe Jumla'}
                        </span>
                      </div>

                      {/* Vitals summary preview */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-600">
                        <span>Uzito: <strong className="text-slate-900">{patient.currentWeightKg} kg</strong></span>
                        {patient.currentGlucoseMgDl && (
                          <span>Sukari: <strong className="text-rose-700">{patient.currentGlucoseMgDl} mg/dL</strong></span>
                        )}
                        <span>BMI: <strong className="text-teal-800">{patientBmi}</strong></span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Patient Dossier (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {selectedPatient ? (
            <div className="space-y-5">
              
              {/* Patient Profile Header Card */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-700 to-emerald-600 text-white font-black text-xl flex items-center justify-center shadow-sm">
                      {selectedPatient.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg sm:text-xl font-black text-slate-900">
                          {selectedPatient.fullName}
                        </h3>
                        <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                          {selectedPatient.gender === 'female' ? 'Mwanamke' : 'Mwanaume'}, {selectedPatient.age} Miaka
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                        <span>Simu: <strong>{selectedPatient.phone}</strong></span>
                        <span>•</span>
                        <span>Makazi: <strong>{selectedPatient.location}</strong></span>
                        <span>•</span>
                        <span>Usajili: <strong>{selectedPatient.registeredDate}</strong></span>
                      </p>
                    </div>
                  </div>

                  {/* Actions for this patient */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* AI Analysis Button */}
                    <button
                      onClick={() => setIsAIAnalysisModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 active:scale-95 text-white text-xs font-black shadow-md shadow-teal-700/20 transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Uchambuzi wa AI (Gemini): Chambua mwenendo wa vipimo na kutoa mapendekezo ya lishe na tahadhari"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Uchambuzi wa AI</span>
                    </button>

                    {/* Patient Referral Button */}
                    <button
                      onClick={() => setIsReferralModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Andika au tazama barua ya rufaa kwa daktari bingwa"
                    >
                      <Send className="w-3.5 h-3.5 text-blue-600" />
                      <span>Rufaa ({selectedPatient.referrals?.length || 0})</span>
                    </button>

                    {/* Edit Patient Info Button */}
                    <button
                      onClick={() => setIsEditingPatientModalOpen(true)}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Rekebisha taarifa za mgonjwa huyu"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                      <span>Rekebisha</span>
                    </button>

                    {/* Delete Patient Button */}
                    <button
                      onClick={() => setIsDeleteConfirmOpen(true)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-colors flex items-center justify-center cursor-pointer"
                      title="Ondoa mgonjwa huyu kwenye orodha ya kliniki"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onSelectActivePatientForView(selectedPatient)}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Tazama dashibodi ya mteja kama anavyoiona yeye"
                    >
                      <span>Tazama kama Mgonjwa Huyu</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onOpenPrintReport(selectedPatient.currentGlucoseMgDl || 120)}
                      className="px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Chapisha Kadi au Ripoti ya Mgonjwa"
                    >
                      <Printer className="w-3.5 h-3.5 text-teal-700" />
                      <span>Ripoti ya Kliniki</span>
                    </button>
                  </div>
                </div>

                {/* Vitals Summary Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">Uzito wa Sasa</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl font-black text-slate-900">{selectedPatient.currentWeightKg}</span>
                      <span className="text-xs text-slate-500">kg</span>
                    </div>
                    {selectedPatient.initialWeightKg !== selectedPatient.currentWeightKg && (
                      <span className="text-[10px] font-extrabold text-emerald-700 block">
                        {selectedPatient.initialWeightKg > selectedPatient.currentWeightKg ? '▼' : '▲'} {Math.abs(selectedPatient.initialWeightKg - selectedPatient.currentWeightKg).toFixed(1)} kg tangu mwanzo
                      </span>
                    )}
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">Lengo la Uzito</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl font-black text-teal-900">{selectedPatient.targetWeightKg || selectedPatient.currentWeightKg}</span>
                      <span className="text-xs text-slate-500">kg</span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 block">
                      Zimebaki: {Math.max(0, Number((selectedPatient.currentWeightKg - selectedPatient.targetWeightKg).toFixed(1)))} kg
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">Kiwango cha BMI</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl font-black text-slate-900">
                        {calculateBmi(selectedPatient.currentWeightKg, selectedPatient.heightCm)}
                      </span>
                    </div>
                    <span className={`text-[10px] font-black px-1.5 py-0.2 rounded ${getBmiBadge(calculateBmi(selectedPatient.currentWeightKg, selectedPatient.heightCm)).color}`}>
                      {getBmiBadge(calculateBmi(selectedPatient.currentWeightKg, selectedPatient.heightCm)).label}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">Sukari & BP</span>
                    <div className="mt-0.5 space-y-0.5">
                      <p className="text-xs font-bold text-rose-700">
                        {selectedPatient.currentGlucoseMgDl ? `${selectedPatient.currentGlucoseMgDl} mg/dL` : 'Haikupimwa'}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-600">
                        BP: {selectedPatient.bloodPressure || '120/80'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Patient Goals & Clinical Info Box */}
                <div className="bg-teal-50/60 rounded-2xl p-4 border border-teal-200/60 space-y-2">
                  <div className="flex items-center gap-2 text-teal-900 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-teal-700" />
                    <span>Lengo Kuu la Mteja & Historia ya Matibabu</span>
                  </div>
                  <p className="text-xs sm:text-sm text-teal-950 font-medium leading-relaxed">
                    "{selectedPatient.primaryGoal}"
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-teal-200/40 text-xs text-teal-900">
                    <div>
                      <strong>Magonjwa / Hali:</strong> {selectedPatient.medicalConditions || 'Hakuna'}
                    </div>
                    <div>
                      <strong>Dawa:</strong> {selectedPatient.currentMedications || 'Hatumii dawa'}
                    </div>
                    <div>
                      <strong>Mizio (Allergies):</strong> {selectedPatient.allergies?.join(', ') || 'Hakuna mizio'}
                    </div>
                    <div>
                      <strong>Mapendeleo ya Chakula:</strong> {selectedPatient.foodPreferences || 'Kawaida'}
                    </div>
                  </div>
                </div>

                {/* Patient-Level Security, Password & Print Control Card */}
                <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-teal-400" />
                      <h4 className="text-xs sm:text-sm font-black text-white">
                        Usalama, Nenosiri & Ruhusa ya Kuprint: {selectedPatient.fullName}
                      </h4>
                    </div>
                    <span className="text-[10px] uppercase font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30 px-2 py-0.5 rounded-full">
                      Faragha Imelindwa
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Username and Password Box */}
                    <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-2">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Akaunti ya Mteja (Login Info):</span>
                        <button
                          type="button"
                          onClick={() => setShowPatientPassword(!showPatientPassword)}
                          className="text-[11px] text-teal-400 hover:underline flex items-center gap-1"
                        >
                          {showPatientPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{showPatientPassword ? 'Ficha' : 'Onyesha PIN'}</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Username:</span>
                        <strong className="text-white font-mono">{selectedPatient.username || selectedPatient.phone}</strong>
                      </div>

                      {isEditingPatientPassword ? (
                        <div className="flex items-center gap-1 pt-1 border-t border-slate-700">
                          <input
                            type="text"
                            value={patientPasswordInput}
                            onChange={(e) => setPatientPasswordInput(e.target.value)}
                            placeholder="Nenosiri jipya..."
                            className="flex-1 px-2 py-1 rounded bg-slate-900 border border-teal-500 text-white font-mono text-xs focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (patientPasswordInput.trim()) {
                                onUpdatePatient({
                                  ...selectedPatient,
                                  password: patientPasswordInput.trim(),
                                });
                                setIsEditingPatientPassword(false);
                              }
                            }}
                            className="px-2 py-1 rounded bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400"
                          >
                            Hifadhi
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditingPatientPassword(false)}
                            className="px-1.5 py-1 rounded bg-slate-700 text-slate-300 text-xs"
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between pt-1 border-t border-slate-700">
                          <span className="text-slate-300">Nenosiri / PIN:</span>
                          <div className="flex items-center gap-2">
                            <strong className="text-teal-300 font-mono">
                              {showPatientPassword ? (selectedPatient.password || '123') : '••••'}
                            </strong>
                            <button
                              type="button"
                              onClick={() => {
                                setPatientPasswordInput(selectedPatient.password || '123');
                                setIsEditingPatientPassword(true);
                              }}
                              className="text-[11px] text-teal-400 hover:text-teal-300 underline font-semibold"
                            >
                              Badili
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Print Permission Toggle Box */}
                    <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300 font-bold flex items-center gap-1.5">
                            <Printer className="w-3.5 h-3.5 text-teal-400" />
                            <span>Ruhusa ya Kuprint Ripoti</span>
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            selectedPatient.canPrintReports 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {selectedPatient.canPrintReports ? 'Imeruhusiwa' : 'Imefungwa'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          {selectedPatient.canPrintReports
                            ? 'Mteja anaweza kuchapisha na kupakua ripoti yake ya lishe kama PDF au picha bila kikwazo.'
                            : 'Mteja hawezi kuchapisha au kupakua ripoti mpaka Mtaalam wa Lishe (Admin) aidhinishe.'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onUpdatePatient({
                            ...selectedPatient,
                            canPrintReports: !selectedPatient.canPrintReports,
                          });
                        }}
                        className={`w-full py-1.5 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                          selectedPatient.canPrintReports
                            ? 'bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>
                          {selectedPatient.canPrintReports ? 'Funga Ruhusa ya Kuprint' : 'Ruhusu Mgonjwa Huyu Kuprint'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Log Vitals Trigger */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-500 font-medium">
                    Historia ya vipimo vya uzito ({selectedPatient.weightLogs?.length || 1} vipimo)
                  </span>
                  <button
                    onClick={() => setIsLoggingVitals(!isLoggingVitals)}
                    className="text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{isLoggingVitals ? 'Funga Fomu' : 'Rekodi Kipimo Kipya cha Mteja'}</span>
                  </button>
                </div>

                {/* Quick Vitals Log Form */}
                {isLoggingVitals && (
                  <form onSubmit={handleSaveVitals} className="bg-slate-100 p-4 rounded-2xl border border-slate-300 space-y-3 animate-in fade-in duration-150">
                    <h5 className="text-xs font-bold text-slate-800 uppercase">Weka Vipimo Vipya vya Leo:</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block">Uzito Mpya (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          value={newWeight}
                          onChange={(e) => setNewWeight(Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block">Sukari ya Damu (mg/dL)</label>
                        <input
                          type="number"
                          placeholder="Mfano: 125"
                          value={newGlucose}
                          onChange={(e) => setNewGlucose(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block">Shinikizo la Damu (BP)</label>
                        <input
                          type="text"
                          placeholder="Mfano: 120/80"
                          value={newBp}
                          onChange={(e) => setNewBp(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block">Maelezo / Maoni ya Kipimo</label>
                      <input
                        type="text"
                        placeholder="Mfano: Baada ya wiki 2 za kufuata mpango wa mlo"
                        value={vitalsNote}
                        onChange={(e) => setVitalsNote(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsLoggingVitals(false)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 font-semibold cursor-pointer"
                      >
                        Ghairi
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-teal-700 text-white text-xs font-bold shadow-xs hover:bg-teal-600 cursor-pointer"
                      >
                        Hifadhi Kipimo
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Sub-tabs Navigation for Selected Patient */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPatientSubTab('prescriptions')}
                  className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                    patientSubTab === 'prescriptions'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Mpango wa Chakula & Ushauri ({selectedPatient.prescriptions?.length || 0})</span>
                </button>

                {(selectedPatient.category === 'watoto_lishe' || selectedPatient.age < 18 || selectedPatient.childProfile) && (
                  <button
                    type="button"
                    onClick={() => setPatientSubTab('pediatric')}
                    className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                      patientSubTab === 'pediatric'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    <Baby className="w-4 h-4 text-amber-500" />
                    <span>Ufuatiliaji wa Mtoto & Ulaji</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setPatientSubTab('referrals')}
                  className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                    patientSubTab === 'referrals'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>Rufaa za Kliniki ({selectedPatient.referrals?.length || 0})</span>
                </button>
              </div>

              {/* Sub-tab 1: Pediatric Tracker */}
              {patientSubTab === 'pediatric' && (
                <ChildNutritionTrackerView
                  patient={selectedPatient}
                  onUpdatePatient={onUpdatePatient}
                />
              )}

              {/* Sub-tab 2: Referrals Overview */}
              {patientSubTab === 'referrals' && (
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <Send className="w-5 h-5 text-blue-600" />
                        <span>Kumbukumbu ya Rufaa za Mgonjwa: {selectedPatient.fullName}</span>
                      </h4>
                      <p className="text-xs text-slate-500">
                        Orodha ya rufaa zilizotolewa kwa madaktari bingwa au vituo vingine vya afya
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsReferralModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Andika Barua Mpya ya Rufaa</span>
                    </button>
                  </div>

                  {(!selectedPatient.referrals || selectedPatient.referrals.length === 0) ? (
                    <div className="text-center py-10 text-slate-500 space-y-3">
                      <p className="text-xs">Mgonjwa huyu bado hajapewa rufaa yoyote ya kliniki.</p>
                      <button
                        type="button"
                        onClick={() => setIsReferralModalOpen(true)}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        + Andika Rufaa ya Kwanza
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedPatient.referrals.map((ref) => (
                        <div key={ref.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                ref.priority === 'dharura' ? 'bg-rose-100 text-rose-800' :
                                ref.priority === 'ya_haraka' ? 'bg-amber-100 text-amber-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {ref.priority === 'dharura' ? 'DHARURA' : ref.priority === 'ya_haraka' ? 'HARAKA' : 'KAWAIDA'}
                              </span>
                              <span className="text-xs font-black text-slate-900">
                                {ref.targetFacility} ({ref.targetDepartment})
                              </span>
                              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                                {ref.referralNumber}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-semibold">{ref.date}</span>
                          </div>

                          <div className="text-xs text-slate-700 space-y-1">
                            <p><strong>Utambuzi wa Msingi:</strong> {ref.primaryDiagnosis}</p>
                            <p><strong>Sababu ya Rufaa:</strong> {ref.reasonForReferral}</p>
                            <p className="text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                              <strong>Muhtasari wa Kliniki:</strong> {ref.clinicalSummary}
                            </p>
                            {ref.notesToSpecialist && (
                              <p className="text-blue-900 bg-blue-50 p-2 rounded-xl">
                                <strong>Ujumbe kwa Daktari Bingwa:</strong> {ref.notesToSpecialist}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sub-tab 3: Nutritionist Prescriptions & Meal Plan Section */}
              {patientSubTab === 'prescriptions' && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-teal-700" />
                      <span>Mpango Maalum wa Chakula na Ushauri wa Mtaalam (Clinical Prescriptions)</span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Miongozo ya milo na maelekezo ya moja kwa moja kwa ajili ya mgonjwa huyu
                    </p>
                  </div>

                  <button
                    onClick={() => setIsAddingPrescription(!isAddingPrescription)}
                    className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{isAddingPrescription ? 'Funga Fomu' : 'Andika Ushauri / Mpango Mpya'}</span>
                  </button>
                </div>

                {/* Form to Add New Prescription */}
                {isAddingPrescription && (
                  <form onSubmit={handleSavePrescription} className="bg-slate-50 p-5 rounded-2xl border border-teal-200 space-y-4 animate-in fade-in duration-200">
                    <h5 className="text-xs font-black uppercase text-teal-900 tracking-wider">
                      Ushauri Mpya wa Kilishe & Mpango wa Mlo (Prescription Form)
                    </h5>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Tathmini ya Kitaalamu (Clinical Assessment) *</label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Eleza hali ya sasa ya mgonjwa, maendeleo ya sukari au uzito, na mwenendo wake..."
                        value={assessmentText}
                        onChange={(e) => setAssessmentText(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>

                    {/* Macro Targets */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Lengo la Kalori/Siku</label>
                        <input
                          type="number"
                          value={targetCalories}
                          onChange={(e) => setTargetCalories(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Kikomo cha Wanga (g)</label>
                        <input
                          type="number"
                          value={targetCarbs}
                          onChange={(e) => setTargetCarbs(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Protini ya Siku (g)</label>
                        <input
                          type="number"
                          value={targetProtein}
                          onChange={(e) => setTargetProtein(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Nyuzinyuzi (Fiber g)</label>
                        <input
                          type="number"
                          value={targetFiber}
                          onChange={(e) => setTargetFiber(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-bold"
                        />
                      </div>
                    </div>

                    {/* Meal Plan Breakdown */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <label className="text-xs font-black uppercase text-slate-700 block">
                        Ratiba ya Milo ya Siku (Prescribed Meal Plan):
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-emerald-800">1. Kifungua Kinywa (Breakfast)</span>
                          <input
                            type="text"
                            placeholder="Uji wa ulezi bila sukari + yai 1 au parachichi"
                            value={breakfastPlan}
                            onChange={(e) => setBreakfastPlan(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-teal-800">2. Chakula cha Mchana (Lunch)</span>
                          <input
                            type="text"
                            placeholder="Ugali wa dona (ngumi 1) + Samaki wa mchuzi + Mchicha"
                            value={lunchPlan}
                            onChange={(e) => setLunchPlan(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-indigo-800">3. Chakula cha Usiku (Dinner)</span>
                          <input
                            type="text"
                            placeholder="Supu ya kuku wa kienyeji na mboga nyingi bila viazi"
                            value={dinnerPlan}
                            onChange={(e) => setDinnerPlan(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-amber-800">4. Vitafunwa Salama (Snacks)</span>
                          <input
                            type="text"
                            placeholder="Tango, matunda yenye nyuzinyuzi au maji mengi"
                            value={snacksPlan}
                            onChange={(e) => setSnacksPlan(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Emphasize and Avoid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-emerald-800">Vyakula vya Kusisitiza (Tenganisha kwa koma)</label>
                        <input
                          type="text"
                          placeholder="Mchicha, Samaki wa mvuke, Ugali wa dona, Parachichi"
                          value={emphasizeFoods}
                          onChange={(e) => setEmphasizeFoods(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-rose-800">Vyakula vya Kuepuka Kabisa (Tenganisha kwa koma)</label>
                        <input
                          type="text"
                          placeholder="Soda, Sembe nyingi, Sukari, Vyakula vya kukaangwa"
                          value={avoidFoods}
                          onChange={(e) => setAvoidFoods(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Maelekezo Maalum ya Kilishe & Mazoezi</label>
                        <input
                          type="text"
                          placeholder="Tembea dakika 30 kila siku, kunywa maji lita 3"
                          value={dietaryInstructions}
                          onChange={(e) => setDietaryInstructions(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Tarehe ya Ukaguzi Unaofuata (Checkup)</label>
                        <input
                          type="date"
                          value={nextCheckup}
                          onChange={(e) => setNextCheckup(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setIsAddingPrescription(false)}
                        className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 cursor-pointer"
                      >
                        Ghairi
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Hifadhi Ushauri Kwenye Faili</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Existing Prescriptions List */}
                <div className="space-y-4">
                  {!selectedPatient.prescriptions || selectedPatient.prescriptions.length === 0 ? (
                    <div className="bg-slate-50 p-6 rounded-2xl text-center text-slate-500 space-y-2 border border-dashed border-slate-300">
                      <FileText className="w-8 h-8 mx-auto text-slate-400 opacity-60" />
                      <p className="text-xs sm:text-sm font-semibold">
                        Bado hakuna ushauri au mpango wa chakula ulioandikwa kwa mgonjwa huyu.
                      </p>
                      <button
                        onClick={() => setIsAddingPrescription(true)}
                        className="text-xs font-bold text-teal-700 hover:underline"
                      >
                        + Andika Ushauri wa Kwanza Sasa
                      </button>
                    </div>
                  ) : (
                    selectedPatient.prescriptions.map((rx, idx) => (
                      <div key={rx.id || idx} className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                            <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                              Ushauri wa Kilishe #{selectedPatient.prescriptions.length - idx}
                            </span>
                            <span className="text-xs text-slate-500">
                              ({new Date(rx.date).toLocaleDateString('sw-TZ', { day: 'numeric', month: 'short', year: 'numeric' })})
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-teal-800 bg-teal-100/80 px-2.5 py-0.5 rounded-full">
                            Mtaalam: {rx.nutritionistName}
                          </span>
                        </div>

                        {/* Assessment */}
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                          {rx.clinicalAssessment}
                        </p>

                        {/* Macro Targets Bar */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                          <div className="bg-white p-2 rounded-xl border border-slate-200">
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">Kalori</span>
                            <strong className="text-slate-900 text-sm">{rx.recommendedDailyCalories} kcal</strong>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-slate-200">
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">Wanga</span>
                            <strong className="text-amber-700 text-sm">{rx.recommendedDailyCarbsGrams}g</strong>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-slate-200">
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">Protini</span>
                            <strong className="text-emerald-700 text-sm">{rx.recommendedDailyProteinGrams}g</strong>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-slate-200">
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">Nyuzinyuzi</span>
                            <strong className="text-teal-700 text-sm">{rx.recommendedDailyFiberGrams}g</strong>
                          </div>
                        </div>

                        {/* Meal Plan Box */}
                        {rx.mealPlanSummary && (
                          <div className="bg-white rounded-xl p-3.5 border border-slate-200 space-y-2 text-xs">
                            <span className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wider block">
                              Mlo Uliopendekezwa na Daktari / Mtaalam:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                              <p><strong>Asubuhi:</strong> {rx.mealPlanSummary.breakfast}</p>
                              <p><strong>Mchana:</strong> {rx.mealPlanSummary.lunch}</p>
                              <p><strong>Usiku:</strong> {rx.mealPlanSummary.dinner}</p>
                              <p><strong>Vitafunwa:</strong> {rx.mealPlanSummary.snacks}</p>
                            </div>
                          </div>
                        )}

                        {/* Foods to prioritize and avoid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {rx.foodsToEmphasize?.length > 0 && (
                            <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                              <span className="font-bold text-emerald-900 block mb-1">Vyakula vya Kula Mara kwa Mara:</span>
                              <div className="flex flex-wrap gap-1">
                                {rx.foodsToEmphasize.map((f, i) => (
                                  <span key={i} className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-semibold">
                                    ✓ {f}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {rx.foodsToStrictlyAvoid?.length > 0 && (
                            <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-200">
                              <span className="font-bold text-rose-900 block mb-1">Vyakula vya Kuepuka Kabisa:</span>
                              <div className="flex flex-wrap gap-1">
                                {rx.foodsToStrictlyAvoid.map((f, i) => (
                                  <span key={i} className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded text-[11px] font-semibold">
                                    ✕ {f}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {rx.nextCheckupDate && (
                          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 pt-1">
                            <Clock className="w-3.5 h-3.5 text-teal-600" />
                            <span>Tarehe ya Ukaguzi wa Mgonjwa: <strong className="text-teal-900">{rx.nextCheckupDate}</strong></span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
              )}

            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200 space-y-3">
              <Users className="w-12 h-12 mx-auto text-slate-300" />
              <h4 className="text-base font-bold text-slate-700">Chagua mteja kwenye orodha upande wa kushoto</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Kutazama faili lake kamili, vipimo, historia ya uzito, au kuandika ushauri mpya wa kilishe.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Edit Patient Modal */}
      {selectedPatient && (
        <EditPatientModal
          isOpen={isEditingPatientModalOpen}
          onClose={() => setIsEditingPatientModalOpen(false)}
          patient={selectedPatient}
          onSave={(updated) => {
            onUpdatePatient(updated);
            setIsEditingPatientModalOpen(false);
          }}
        />
      )}

      {/* Patient Referral Modal */}
      {selectedPatient && (
        <PatientReferralModal
          isOpen={isReferralModalOpen}
          onClose={() => setIsReferralModalOpen(false)}
          patient={selectedPatient}
          onSaveReferral={(newRef) => {
            const updatedRefs = [newRef, ...(selectedPatient.referrals || [])];
            onUpdatePatient({
              ...selectedPatient,
              referrals: updatedRefs,
            });
            setIsReferralModalOpen(false);
            setPatientSubTab('referrals');
          }}
        />
      )}

      {/* Patient AI Analysis Modal */}
      {selectedPatient && (
        <PatientAIAnalysisModal
          isOpen={isAIAnalysisModalOpen}
          onClose={() => setIsAIAnalysisModalOpen(false)}
          patient={selectedPatient}
          glucoseLogs={glucoseLogs}
          mealLogs={mealLogs}
          onApplyRecommendations={(instructions, targets) => {
            setDietaryInstructions(instructions);
            if (targets?.calories) setTargetCalories(targets.calories);
            if (targets?.carbs) setTargetCarbs(targets.carbs);
            if (targets?.protein) setTargetProtein(targets.protein);
            if (targets?.fiber) setTargetFiber(targets.fiber);
            setPatientSubTab('prescriptions');
            setIsAddingPrescription(true);
          }}
        />
      )}

      {/* Delete Patient Confirmation Modal */}
      {isDeleteConfirmOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-black text-slate-900">
                Ondoa Taarifa za {selectedPatient.fullName}?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kitendo hiki kitaondoa faili la mgonjwa huyu kwenye orodha ya kliniki pamoja na historia yake ya uzito na maelekezo ya lishe.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Ghairi
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeletePatient) {
                    onDeletePatient(selectedPatient.id);
                  }
                  setIsDeleteConfirmOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                Ndio, Ondoa Mgonjwa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
