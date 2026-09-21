import React, { useState } from 'react';
import { 
  HeartPulse, AlertTriangle, CheckCircle2, Info, Plus, Trash2, 
  Activity, ArrowUpRight, ArrowDownRight, ShieldCheck, Stethoscope, 
  Sparkles, Clock, Calendar, HelpCircle, ChevronRight, Apple, Droplets,
  AlertCircle, PhoneCall, Pill, Zap, Flame, Award
} from 'lucide-react';
import { BloodPressureLog, BloodPressureStatus, UserProfile, RegisteredPatient } from '../types';
import { INITIAL_BLOOD_PRESSURE_LOGS } from '../data/sampleData';

interface BloodPressureClinicViewProps {
  profile?: UserProfile;
  onUpdateProfile?: (updated: UserProfile) => void;
  logs?: BloodPressureLog[];
  onSaveLog?: (log: BloodPressureLog) => void;
  onDeleteLog?: (id: string) => void;
  activePatient?: RegisteredPatient;
  onOpenDoctorConsultation?: () => void;
  onOpenChatConsultation?: () => void;
  onOpenPrintPlan?: () => void;
}

export const BloodPressureClinicView: React.FC<BloodPressureClinicViewProps> = ({
  profile,
  onUpdateProfile,
  logs,
  onSaveLog,
  onDeleteLog,
  activePatient,
  onOpenDoctorConsultation,
  onOpenChatConsultation,
  onOpenPrintPlan,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'tracker' | 'hypertension' | 'hypotension' | 'dash_diet'>('tracker');
  
  // Safe logs state from props, profile, activePatient, or initial sample
  const bpLogs: BloodPressureLog[] = 
    logs || 
    profile?.bloodPressureLogs || 
    activePatient?.bloodPressureLogs || 
    INITIAL_BLOOD_PRESSURE_LOGS || [
    {
      id: 'bp-1',
      timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      systolic: 142,
      diastolic: 90,
      pulse: 76,
      status: 'hatua_2',
      arm: 'kushoto',
      position: 'kukaa',
      notes: 'Asubuhi kabla ya dawa.',
    },
    {
      id: 'bp-2',
      timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      systolic: 134,
      diastolic: 86,
      pulse: 72,
      status: 'hatua_1',
      arm: 'kushoto',
      position: 'kukaa',
      notes: 'Jioni baada ya kutembea dakika 30.',
    },
    {
      id: 'bp-3',
      timestamp: new Date().toISOString(),
      systolic: 124,
      diastolic: 80,
      pulse: 70,
      status: 'iliyoinuka',
      arm: 'kushoto',
      position: 'kukaa',
      notes: 'Kufuata mlo wa DASH na kupunguza chumvi kumeleta utulivu.',
    },
  ];

  // New log form inputs
  const [systolicInput, setSystolicInput] = useState<string>('120');
  const [diastolicInput, setDiastolicInput] = useState<string>('80');
  const [pulseInput, setPulseInput] = useState<string>('72');
  const [armInput, setArmInput] = useState<'kushoto' | 'kulia'>('kushoto');
  const [positionInput, setPositionInput] = useState<'kukaa' | 'kusimama' | 'kulala'>('kukaa');
  const [notesInput, setNotesInput] = useState<string>('');
  const [isAddingLog, setIsAddingLog] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Classify blood pressure based on AHA/WHO standards
  const classifyBp = (sys: number, dia: number): BloodPressureStatus => {
    if (sys < 90 || dia < 60) return 'chini';
    if (sys > 180 || dia > 120) return 'dharura';
    if (sys >= 140 || dia >= 90) return 'hatua_2';
    if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) return 'hatua_1';
    if (sys >= 120 && sys <= 129 && dia < 80) return 'iliyoinuka';
    return 'kawaida';
  };

  const getStatusBadge = (status: BloodPressureStatus) => {
    switch (status) {
      case 'chini':
        return {
          title: 'Presha ya Chini (Hypotension)',
          bg: 'bg-sky-100 text-sky-800 border-sky-300',
          dot: 'bg-sky-500',
          desc: 'Kiwango kiko chini ya 90/60 mmHg. Inahitaji maji mengi, chumvi kidogo na kupumzika.',
        };
      case 'kawaida':
        return {
          title: 'Kiwango Bora (Normal BP)',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-500',
          desc: 'Chini ya 120/80 mmHg. Afya nzuri ya mishipa ya damu na moyo.',
        };
      case 'iliyoinuka':
        return {
          title: 'Iliyoinuka Kidogo (Elevated)',
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
          dot: 'bg-amber-500',
          desc: 'Systolic 120-129 na Diastolic < 80. Dhibiti chumvi na anza mazoezi.',
        };
      case 'hatua_1':
        return {
          title: 'Presha ya Juu: Hatua ya 1 (Stage 1)',
          bg: 'bg-orange-100 text-orange-800 border-orange-300',
          dot: 'bg-orange-500',
          desc: '130-139 / 80-89 mmHg. Inahitaji mpango madhubuti wa chakula cha DASH na ushauri wa daktari.',
        };
      case 'hatua_2':
        return {
          title: 'Presha ya Juu: Hatua ya 2 (Stage 2)',
          bg: 'bg-rose-100 text-rose-800 border-rose-300',
          dot: 'bg-rose-500',
          desc: 'Kuanzia 140/90 mmHg na kuendelea. Inahitaji dawa za presha za kila siku na udhibiti wa chakula.',
        };
      case 'dharura':
        return {
          title: 'DHARURA YA PRESHA (Crisis)',
          bg: 'bg-red-600 text-white border-red-700 animate-pulse',
          dot: 'bg-white',
          desc: 'Juu ya 180/120 mmHg! Nenda hospitali au kituo cha dharura mara moja!',
        };
    }
  };

  const handleSaveBpLog = (e: React.FormEvent) => {
    e.preventDefault();
    const sys = parseInt(systolicInput, 10);
    const dia = parseInt(diastolicInput, 10);
    const pul = pulseInput ? parseInt(pulseInput, 10) : undefined;

    if (isNaN(sys) || isNaN(dia)) return;

    const status = classifyBp(sys, dia);
    const newLog: BloodPressureLog = {
      id: 'bp-' + Date.now(),
      timestamp: new Date().toISOString(),
      systolic: sys,
      diastolic: dia,
      pulse: pul,
      status,
      arm: armInput,
      position: positionInput,
      notes: notesInput.trim() || undefined,
    };

    if (onSaveLog) {
      onSaveLog(newLog);
    }

    const updatedLogs = [newLog, ...bpLogs];
    if (onUpdateProfile && profile) {
      const updatedProfile: UserProfile = {
        ...profile,
        bloodPressure: `${sys}/${dia}`,
        bloodPressureLogs: updatedLogs,
      };
      onUpdateProfile(updatedProfile);
    }

    setIsAddingLog(false);
    setNotesInput('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const handleDeleteLog = (id: string) => {
    if (onDeleteLog) {
      onDeleteLog(id);
    }
    const updatedLogs = bpLogs.filter(l => l.id !== id);
    const latest = updatedLogs[0];
    if (onUpdateProfile && profile) {
      const updatedProfile: UserProfile = {
        ...profile,
        bloodPressure: latest ? `${latest.systolic}/${latest.diastolic}` : profile.bloodPressure,
        bloodPressureLogs: updatedLogs,
      };
      onUpdateProfile(updatedProfile);
    }
  };

  const handleConsultation = onOpenDoctorConsultation || onOpenChatConsultation;
  const latestLog = bpLogs[0];
  const currentClassification = latestLog ? getStatusBadge(latestLog.status) : null;

  return (
    <div className="space-y-6" id="blood-pressure-clinic-view">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-200 text-xs font-bold mb-3">
              <HeartPulse className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>Idara ya Shinikizo la Damu & Magonjwa ya Moyo</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
              Kliniki ya Shinikizo la Damu (Presha ya Kupanda & Kushuka)
            </h1>
            <p className="text-sm text-rose-100/85 leading-relaxed">
              Mwongozo thabiti wa kitabibu na kilishe wa kudhibiti presha ya kupanda (Hypertension) kupitia mlo wa DASH na chumvi kidogo, na kurekebisha presha ya kushuka (Hypotension) kupitia unywaji maji na elektroliti.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setIsAddingLog(true)}
              className="px-4 py-3 rounded-2xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
              id="btn-add-bp-log-header"
            >
              <Plus className="w-4 h-4" />
              <span>Rekodi Kipimo cha Presha</span>
            </button>
            {handleConsultation && (
              <button
                onClick={handleConsultation}
                className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex items-center justify-center gap-2 border border-white/20 transition-all cursor-pointer"
                id="btn-consult-doctor-bp"
              >
                <Stethoscope className="w-4 h-4 text-rose-300" />
                <span>Ongea na Daktari</span>
              </button>
            )}
          </div>
        </div>

        {/* Current BP Status Card Overlay */}
        {latestLog && (
          <div className="mt-6 pt-6 border-t border-rose-700/50 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15">
                <span className="text-[11px] text-rose-200 block font-semibold uppercase tracking-wider">Kipimo cha Mwisho</span>
                <span className="text-2xl font-black text-white">{latestLog.systolic}/{latestLog.diastolic} <span className="text-xs font-normal text-rose-200">mmHg</span></span>
              </div>
              {latestLog.pulse && (
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15">
                  <span className="text-[11px] text-rose-200 block font-semibold uppercase tracking-wider">Mapigo ya Moyo</span>
                  <span className="text-2xl font-black text-white">{latestLog.pulse} <span className="text-xs font-normal text-rose-200">bpm</span></span>
                </div>
              )}
            </div>

            {currentClassification && (
              <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2.5 font-bold text-xs ${currentClassification.bg}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${currentClassification.dot}`} />
                <span>{currentClassification.title}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('tracker')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'tracker'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
          id="tab-bp-tracker"
        >
          <Activity className="w-4 h-4" />
          <span>Kifuatiliaji cha Vipimo (BP Log)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('hypertension')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'hypertension'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
          id="tab-bp-hypertension"
        >
          <ArrowUpRight className="w-4 h-4 text-rose-400" />
          <span>Kupanda kwa Presha (Matibabu & Dawa)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('hypotension')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'hypotension'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
          id="tab-bp-hypotension"
        >
          <ArrowDownRight className="w-4 h-4 text-sky-500" />
          <span>Kushuka kwa Presha (Mbinu za Haraka)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('dash_diet')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'dash_diet'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
          id="tab-bp-dash"
        >
          <Apple className="w-4 h-4 text-emerald-500" />
          <span>Mlo wa DASH & Udhibiti wa Chumvi</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-semibold">Kipimo cha shinikizo la damu kimehifadhiwa kikamilifu kwenye wasifu wako!</p>
        </div>
      )}

      {/* Tab 1: BP Tracker & History */}
      {activeSubTab === 'tracker' && (
        <div className="space-y-6">
          
          {/* Modal / Inline Add Form */}
          {isAddingLog && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-rose-200 shadow-xl space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Rekodi Kipimo Kipya cha Shinikizo la Damu</h3>
                    <p className="text-xs text-slate-500">Pima ukiwa umetulia kwa angalau dakika 5 bila kuongea au kunywa kahawa/chai.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingLog(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-700 p-1.5 rounded-lg"
                >
                  Funga
                </button>
              </div>

              <form onSubmit={handleSaveBpLog} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Systolic (Nambari ya Juu) <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="50"
                        max="260"
                        required
                        value={systolicInput}
                        onChange={(e) => setSystolicInput(e.target.value)}
                        placeholder="mf. 120"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-black text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">mmHg</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Kiwango bora: Chini ya 120</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Diastolic (Nambari ya Chini) <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="30"
                        max="160"
                        required
                        value={diastolicInput}
                        onChange={(e) => setDiastolicInput(e.target.value)}
                        placeholder="mf. 80"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-black text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">mmHg</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Kiwango bora: Chini ya 80</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Mapigo ya Moyo (Pulse Rate)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="40"
                        max="200"
                        value={pulseInput}
                        onChange={(e) => setPulseInput(e.target.value)}
                        placeholder="mf. 72"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-black text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">bpm</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Kawaida: 60 - 100 bpm</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Mkono Uliopimiwa</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setArmInput('kushoto')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border text-center transition-colors cursor-pointer ${
                          armInput === 'kushoto' ? 'bg-rose-50 border-rose-500 text-rose-700' : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        Mkono wa Kushoto
                      </button>
                      <button
                        type="button"
                        onClick={() => setArmInput('kulia')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border text-center transition-colors cursor-pointer ${
                          armInput === 'kulia' ? 'bg-rose-50 border-rose-500 text-rose-700' : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        Mkono wa Kulia
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Mkao Wakati wa Kupima</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['kukaa', 'kusimama', 'kulala'] as const).map((pos) => (
                        <button
                          key={pos}
                          type="button"
                          onClick={() => setPositionInput(pos)}
                          className={`py-2 px-2 rounded-xl text-xs font-bold capitalize border text-center transition-colors cursor-pointer ${
                            positionInput === pos ? 'bg-rose-50 border-rose-500 text-rose-700' : 'border-slate-200 text-slate-600'
                          }`}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Maelezo ya Ziada (Notes / Hali ya mwili)</label>
                  <input
                    type="text"
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="mf. Baada ya kumeza dawa ya asubuhi, maumivu ya kichwa yamepungua..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingLog(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Ghairi
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-sm cursor-pointer"
                    id="btn-submit-bp-log"
                  >
                    Hifadhi Kipimo
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Reference Scale Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" />
              <span>Mwongozo wa Viwango Rasmi vya Shinikizo la Damu (AHA / WHO)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200">
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-sky-200 text-sky-800">Chini (Hypo)</span>
                <p className="text-base font-black text-sky-900 mt-2">&lt; 90 / &lt; 60</p>
                <p className="text-[11px] text-sky-700 mt-1 leading-tight">Presha ya chini. Kizunguzungu au uchovu.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-emerald-200 text-emerald-800">Bora (Normal)</span>
                <p className="text-base font-black text-emerald-900 mt-2">&lt; 120 / &lt; 80</p>
                <p className="text-[11px] text-emerald-700 mt-1 leading-tight">Afya bora ya mishipa ya damu na moyo.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-amber-200 text-amber-800">Iliyoinuka</span>
                <p className="text-base font-black text-amber-900 mt-2">120-129 / &lt; 80</p>
                <p className="text-[11px] text-amber-700 mt-1 leading-tight">Punguza chumvi na ongeza mazoezi.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200">
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-orange-200 text-orange-800">Hatua 1 (Stage 1)</span>
                <p className="text-base font-black text-orange-900 mt-2">130-139 / 80-89</p>
                <p className="text-[11px] text-orange-700 mt-1 leading-tight">Presha ya juu. Fuata mlo wa DASH.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-rose-200 text-rose-800">Hatua 2 (Stage 2)</span>
                <p className="text-base font-black text-rose-900 mt-2">≥ 140 / ≥ 90</p>
                <p className="text-[11px] text-rose-700 mt-1 leading-tight">Inahitaji dawa na ufuatiliaji wa daktari.</p>
              </div>
            </div>
          </div>

          {/* Logs History Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Historia ya Vipimo vya Shinikizo la Damu</h3>
                <p className="text-xs text-slate-500">Rekodi za mwenendo wa presha yako kwa siku na wiki zilizopita.</p>
              </div>
              <button
                onClick={() => setIsAddingLog(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Kipimo Kipya</span>
              </button>
            </div>

            {bpLogs.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <HeartPulse className="w-12 h-12 mx-auto mb-3 opacity-30 text-rose-500" />
                <p className="text-sm font-semibold">Bado haujarekodi kipimo chochote cha shinikizo la damu.</p>
                <button
                  onClick={() => setIsAddingLog(true)}
                  className="mt-3 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
                >
                  Anza Kurekodi Sasa
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-x-auto">
                {bpLogs.map((log) => {
                  const badge = getStatusBadge(log.status);
                  const date = new Date(log.timestamp);
                  const dateStr = date.toLocaleDateString('sw-TZ', { day: 'numeric', month: 'short', year: 'numeric' });
                  const timeStr = date.toLocaleTimeString('sw-TZ', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div key={log.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="text-center w-16 sm:w-20 shrink-0">
                          <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-tight">
                            {log.systolic}/{log.diastolic}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">mmHg</span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${badge.bg}`}>
                              {badge.title}
                            </span>
                            {log.pulse && (
                              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                <HeartPulse className="w-3 h-3 text-rose-500" />
                                {log.pulse} bpm
                              </span>
                            )}
                            {log.arm && (
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                                Mkono: {log.arm}
                              </span>
                            )}
                          </div>
                          {log.notes && (
                            <p className="text-xs text-slate-600 italic">"{log.notes}"</p>
                          )}
                          <p className="text-[11px] text-slate-400">
                            {dateStr} saa {timeStr}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Futa kipimo hiki"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Hypertension (Kupanda kwa Presha) */}
      {activeSubTab === 'hypertension' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Main Clinical Guide */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-700">
                    <ArrowUpRight className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Matibabu ya Kupanda kwa Shinikizo la Damu (Hypertension)</h2>
                    <p className="text-xs text-slate-500">Miongozo ya kitabibu inayotambulika na Wizara ya Afya na WHO</p>
                  </div>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed">
                  Shinikizo la juu la damu hutokea pale nguvu ya damu inayopita kwenye mishipa ya damu inapokuwa kubwa kupita kiasi (Systolic ≥ 140 au Diastolic ≥ 90 mmHg). Huitwa <strong>"Muuaji wa Kimyakimya" (Silent Killer)</strong> kwa sababu mara nyingi halionyeshi dalili za wazi hadi madhara makubwa yatokee.
                </p>

                {/* Section: Medical Treatments */}
                <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3">
                  <h4 className="font-extrabold text-rose-950 text-sm flex items-center gap-2">
                    <Pill className="w-4 h-4 text-rose-600" />
                    <span>Dawa za Kawaida za Presha (Medical Pharmacotherapy)</span>
                  </h4>
                  <p className="text-xs text-rose-900 leading-relaxed">
                    Dawa za presha zinapaswa kutolewa na daktari na <strong>kumezwa kila siku bila kuacha</strong> hata kama unajisikia vizuri:
                  </p>
                  <ul className="text-xs text-slate-800 space-y-2 pl-4 list-disc">
                    <li><strong>Calcium Channel Blockers (mf. Amlodipine, Nifedipine):</strong> Hulegeza misuli ya kuta za mishipa ya damu na kuruhusu damu kupita kirahisi.</li>
                    <li><strong>ACE Inhibitors & ARBs (mf. Lisinopril, Enalapril, Losartan, Telmisartan):</strong> Huzuia uzalishaji wa homoni inayosinyaisha mishipa ya damu na kulinda figo, hasa kwa wagonjwa wenye kisukari.</li>
                    <li><strong>Diuretics / Dawa za Kutoa Maji (mf. Hydrochlorothiazide, Indapamide):</strong> Husaidia figo kutoa chumvi (sodiamu) na maji ya ziada kupitia mkojo.</li>
                    <li><strong>Beta-Blockers (mf. Atenolol, Carvedilol):</strong> Hupunguza kasi na nguvu ya mapigo ya moyo.</li>
                  </ul>
                  <div className="p-3 rounded-xl bg-rose-200/60 text-rose-950 text-xs font-semibold">
                    ⚠️ Tahadhari: Usiache kumeza dawa ghafla bila ushauri wa daktari; kufanya hivyo kunaweza kusababisha mshtuko wa presha (Rebound Hypertension).
                  </div>
                </div>

                {/* Section: Red Flag Emergency Symptoms */}
                <div className="p-5 rounded-2xl bg-red-100 border-2 border-red-300 text-red-950 space-y-2">
                  <h4 className="font-black text-sm flex items-center gap-2 text-red-900">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Dalili za Hatari (Red Flags) - Nenda Hospitali Mara Moja!</span>
                  </h4>
                  <p className="text-xs leading-relaxed font-medium">
                    Ukipima presha ikawa <strong>zaidi ya 180/120 mmHg</strong> au ukiwa na mojawapo ya dalili hizi, nenda kitengo cha dharura mara moja:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs font-semibold">
                    <div className="flex items-center gap-2">🚨 Maumivu makali ya kichwa (kisogoni)</div>
                    <div className="flex items-center gap-2">🚨 Macho kuona ukungu au cheche</div>
                    <div className="flex items-center gap-2">🚨 Kubana au maumivu kifuani</div>
                    <div className="flex items-center gap-2">🚨 Kupumua kwa shida au kubanwa</div>
                    <div className="flex items-center gap-2">🚨 Ganzi upande mmoja wa uso au mkono</div>
                    <div className="flex items-center gap-2">🚨 Kutokwa na damu puani bila sababu</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Guidelines */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Mambo 5 ya Kufanya Nyumbani</span>
                </h4>
                <div className="space-y-3 text-xs text-slate-700">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <strong className="block text-slate-900 font-bold mb-1">1. Punguza Chumvi Kali</strong>
                    Tumia chini ya nusu kijiko cha chai cha chumvi kwa siku nzima. Ondoa chumvi ya mezani.
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <strong className="block text-slate-900 font-bold mb-1">2. Tembea Dakika 30 Kila Siku</strong>
                    Mazoezi ya wastani ya kutembea kwa haraka huteremsha presha kwa 5 - 8 mmHg.
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <strong className="block text-slate-900 font-bold mb-1">3. Kula Parachichi na Mchicha</strong>
                    Madini ya Potasiamu yaliyopo kwenye vyakula hivi husaidia kutoa sodiamu mwilini.
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <strong className="block text-slate-900 font-bold mb-1">4. Acha Pombe na Sigara</strong>
                    Tumbaku husababisha mishipa ya damu kuwa migumu, na pombe hupandisha shinikizo la damu.
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <strong className="block text-slate-900 font-bold mb-1">5. Pima Presha Wakati Uleule</strong>
                    Pima asubuhi kabla ya dawa na jioni kabla ya chakula ili kuona rekodi sahihi.
                  </div>
                </div>

                {onOpenPrintPlan && (
                  <button
                    onClick={onOpenPrintPlan}
                    className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>Chapisha Ratiba ya Mlo wa Presha</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Hypotension (Kushuka kwa Presha) */}
      {activeSubTab === 'hypotension' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-sky-100 text-sky-700">
                <ArrowDownRight className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Usimamizi na Matibabu ya Kushuka kwa Presha (Hypotension)</h2>
                <p className="text-xs text-slate-500">Miongozo ya kurekebisha presha iliyoshuka chini ya 90/60 mmHg</p>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              Shinikizo la damu hushuka pale msukumo unapokuwa chini ya <strong>90/60 mmHg</strong>. Hii husababisha damu na hewa ya oksijeni kutofika kwa kiasi cha kutosha kwenye ubongo na moyo, na kusababisha kizunguzungu, macho kuwa meusi unapoinuka (Orthostatic Hypotension), uchovu au hata kuzimia.
            </p>

            {/* Immediate First Aid Actions */}
            <div className="p-6 rounded-3xl bg-sky-50 border border-sky-200 space-y-4">
              <h3 className="text-base font-black text-sky-950 flex items-center gap-2">
                <Zap className="w-5 h-5 text-sky-600" />
                <span>Huduma ya Kwanza ya Haraka Presha Inaposhuka Ghafla</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-800">
                <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-1.5">
                  <strong className="text-sky-900 font-extrabold text-sm block">1. Kaa au Lala Chali Mara Moja</strong>
                  <p>Inua miguu yako juu ya usawa wa kifua (tumia mito chini ya miguu). Hii husaidia damu irudi kwa haraka kwenye ubongo na kuzuia kuzimia.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-1.5">
                  <strong className="text-sky-900 font-extrabold text-sm block">2. Kunywa Glasi 2 za Maji au Supu</strong>
                  <p>Ukosefu wa maji mwilini (Dehydration) ndio sababu namba moja ya presha kushuka. Kunywa maji mara moja huongeza ujazo wa damu (blood volume).</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-1.5">
                  <strong className="text-sky-900 font-extrabold text-sm block">3. Tumia Kiasi cha Wastani cha Chumvi</strong>
                  <p>Maji ya uvuguvugu yenye chumvi kidogo ya nusu kijiko na limao, au unga wa ORS, husaidia kuirudisha presha haraka kwenye hali ya kawaida.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-1.5">
                  <strong className="text-sky-900 font-extrabold text-sm block">4. Epuka Kuamka Kitandani Ghafla</strong>
                  <p>Unapoamka asubuhi au baada ya kukaa muda mrefu, kaa kwanza ukingoni mwa kitanda kwa dakika 1-2 kabla ya kusimama.</p>
                </div>
              </div>
            </div>

            {/* Dietary Advice for Low Blood Pressure */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-slate-900 text-sm">Vyakula Vinavyosaidia Wagonjwa wa Presha ya Chini</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-700">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <strong className="font-bold text-slate-900 block mb-1">Maji na Vinywaji vyenye Elektroliti</strong>
                  Kunywa lita 2.5 hadi 3 za maji kila siku. Maji ya dafu na supu ya joto ya mifupa au mboga ni salama sana.
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <strong className="font-bold text-slate-900 block mb-1">Milo Midogo Midogo Mara 4-5</strong>
                  Kula milo mikubwa sana husababisha damu nyingi kwenda kwenye utumbo kumeng\'enya chakula na kushusha presha (Postprandial hypotension).
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <strong className="font-bold text-slate-900 block mb-1">Vyakula vya Vitamini B12 na Chuma</strong>
                  Mayai, samaki na mboga za majani kuzuia upungufu wa damu (Anemia) unaochangia presha kushuka.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: DASH Diet & Salt Management */}
      {activeSubTab === 'dash_diet' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-700">
                <Apple className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Mlo wa DASH (Dietary Approaches to Stop Hypertension)</h2>
                <p className="text-xs text-slate-500">Mlo uliothibitishwa kisayansi kushusha presha ndani ya wiki 2 tu za kuanza</p>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              Mlo wa DASH unasisitiza kula vyakula vyenye madini ya <strong>Potasiamu, Kalsiamu na Magnesiamu</strong> kwa wingi, huku ukipunguza madini ya <strong>Sodiamu (Chumvi)</strong> na mafuta mabaya. Utafiti unaonyesha kuwa kufuata mlo huu kunaweza kushusha systolic kwa 8 hadi 14 mmHg!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Foods to prioritize */}
              <div className="p-5 rounded-3xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-black text-emerald-950 text-sm">Vyakula vya Kutilia Mkazo Kwenye DASH</h4>
                </div>
                <ul className="text-xs text-slate-800 space-y-2 pl-2">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Mchicha, Tembele na Majani ya Maboga:</strong> Tajiri sana wa potasiamu na magnesiamu inayolegeza kuta za mishipa.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Parachichi (Avocado):</strong> Lina potasiamu nyingi kuliko hata ndizi na mafuta mazuri ya kusaidia moyo.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Samaki wa Maji Baridi / Dagaa:</strong> Hutoa Omega-3 inayopunguza uvimbe wa ndani ya mishipa.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Mbegu za Maboga na Karanga Mbichi:</strong> Zina madini ya zinki na magnesiamu bila chumvi.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Nafaka Zisizokobolewa (Ugali wa Dona & Mtama):</strong> Nyuzinyuzi husaidia kuondoa lehemu mbaya.</span>
                  </li>
                </ul>
              </div>

              {/* Foods to strictly avoid */}
              <div className="p-5 rounded-3xl bg-rose-50/70 border border-rose-200 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                  <h4 className="font-black text-rose-950 text-sm">Vyakula vya Kuepuka au Kupunguza Kabisa</h4>
                </div>
                <ul className="text-xs text-slate-800 space-y-2 pl-2">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">✗</span>
                    <span><strong>Chumvi ya Mezani (Table Salt):</strong> Usiongeze chumvi mbichi kwenye chakula kilichokwisha pikwa.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">✗</span>
                    <span><strong>Supu za Viwandani & Michuzi ya MSG:</strong> Viungo vya unga vya viwandani vina kiwango cha juu sana cha sodiamu.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">✗</span>
                    <span><strong>Vyakula vya Kusindikwa (Sausages, Samaki wa Makopo):</strong> Hutumia chumvi nyingi kama kihifadhi.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">✗</span>
                    <span><strong>Nyama Yenye Mafuta Mengi Yaliyoganda:</strong> Huchangia kuziba kwa mishipa ya damu (Atherosclerosis).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">✗</span>
                    <span><strong>Pombe Nyingi & Sigara:</strong> Husababisha mishipa kubana na kupandisha shinikizo la damu mara moja.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Salt Reduction Golden Rule */}
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-3.5">
              <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <strong className="font-extrabold text-sm block text-amber-900">Kanuni ya Dhahabu ya Chumvi kwa Mwenye Presha:</strong>
                <p>
                  Kiwango cha sodiamu kinachopendekezwa hakipaswi kuzidi <strong>1,500 mg hadi 2,300 mg kwa siku</strong>. Hii ni sawa na <strong>nusu kijiko cha chai cha chumvi</strong> kwa milo yote ya siku nzima! Badala ya chumvi nyingi, tumia vitunguu saumu, tangawizi, ndimu, na bizari ya asili kuleta ladha nzuri kwenye chakula.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
