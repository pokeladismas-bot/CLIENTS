import React, { useState } from 'react';
import { 
  X, FileText, Printer, Plus, AlertCircle, CheckCircle2, 
  Send, Building2, User, Calendar, Stethoscope, ChevronRight,
  Clock, ShieldAlert, ArrowUpRight
} from 'lucide-react';
import { RegisteredPatient, PatientReferral } from '../types';

interface PatientReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: RegisteredPatient;
  onSaveReferral: (newReferral: PatientReferral) => void;
}

export const PatientReferralModal: React.FC<PatientReferralModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSaveReferral,
}) => {
  const [activeView, setActiveView] = useState<'list' | 'create' | 'letter'>('list');
  const [selectedReferral, setSelectedReferral] = useState<PatientReferral | null>(
    patient.referrals && patient.referrals.length > 0 ? patient.referrals[0] : null
  );

  // Form State for creating a referral
  const [targetFacility, setTargetFacility] = useState('Hospitali ya Taifa Muhimbili');
  const [targetDepartment, setTargetDepartment] = useState('Idara ya Kisukari & Tezi (Endocrinology)');
  const [priority, setPriority] = useState<'kawaida' | 'ya_haraka' | 'dharura'>('kawaida');
  const [referringDoctor, setReferringDoctor] = useState('Dkt. Grace Kimaro (Mtaalamu wa Lishe)');
  const [referringFacility, setReferringFacility] = useState('Kliniki ya AfyaLishe & Lishe ya Kliniki');
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState(
    patient.category === 'watoto_lishe'
      ? 'Utapiamlo wa Wastani na Changamoto za Ulaji (Pediatric Malnutrition & Feeding Difficulty)'
      : `Kisukari ${patient.diabetesType === 'type1' ? 'Aina ya 1' : 'Aina ya 2'} na Uhitaji wa Tathmini ya Kimatibabu`
  );
  const [reasonForReferral, setReasonForReferral] = useState(
    patient.category === 'watoto_lishe'
      ? 'Uchunguzi wa kina wa damu (CBC, Ferritin) na miongozo ya matibabu ya mzio wa maziwa.'
      : 'Uchunguzi wa mara kwa mara wa macho (Fundoscopy), kipimo cha HbA1c, na tathmini ya utendaji wa figo (eGFR).'
  );
  const [clinicalSummary, setClinicalSummary] = useState(
    `Mgonjwa ${patient.fullName} (Umri ${patient.age}) anafuatiliwa katika kliniki yetu. Uzito: ${patient.currentWeightKg} kg, BMI: ${(patient.currentWeightKg / ((patient.heightCm/100) ** 2)).toFixed(1)}, Shinikizo la damu: ${patient.bloodPressure || '120/80'}. Sukari yake ya sasa: ${patient.currentGlucoseMgDl || 120} mg/dL. Dawa: ${patient.currentMedications || 'Hana dawa maalum'}.`
  );
  const [specificInvestigationRequested, setSpecificInvestigationRequested] = useState(
    '1. HbA1c & Fasting Lipid Profile\n2. Serum Creatinine & eGFR\n3. Uchunguzi wa miguu (Diabetic Foot Examination)'
  );
  const [notesToSpecialist, setNotesToSpecialist] = useState(
    'Tunaomba ushirikiano katika usimamizi wa mgonjwa huyu na kurejesha taarifa za maamuzi ili tuendelee kumpa mwongozo wa lishe kulingana na dawa mpya zitakazopendekezwa.'
  );

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const bmi = Number((patient.currentWeightKg / ((patient.heightCm / 100) ** 2)).toFixed(1));

    const newRef: PatientReferral = {
      id: 'ref-' + Date.now(),
      patientId: patient.id,
      date: new Date().toISOString().split('T')[0],
      referralNumber: `RUFAA-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      referringDoctor,
      referringFacility,
      targetFacility,
      targetDepartment,
      priority,
      status: 'inasubiri',
      primaryDiagnosis,
      reasonForReferral,
      clinicalSummary,
      latestVitals: {
        glucoseMgDl: patient.currentGlucoseMgDl,
        bloodPressure: patient.bloodPressure,
        weightKg: patient.currentWeightKg,
        heightCm: patient.heightCm,
        bmi,
        muacCm: patient.childProfile?.muacCm,
      },
      currentMedications: patient.currentMedications,
      specificInvestigationRequested,
      notesToSpecialist,
    };

    onSaveReferral(newRef);
    setSelectedReferral(newRef);
    setActiveView('letter');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">
                  Kipengele cha Rufaa ya Mgonjwa (Clinical Referral)
                </h2>
                <span className="text-[10px] bg-blue-800 text-blue-200 px-2 py-0.5 rounded-full font-bold">
                  {patient.fullName}
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Andika na ufuatilie rufaa za kitaalamu kwenda hospitali za rufaa au madaktari bingwa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Toggle Tabs */}
        <div className="bg-slate-100 px-6 py-2 border-b border-slate-200 flex items-center gap-2">
          <button
            onClick={() => setActiveView('list')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeView === 'list'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Orodha ya Rufaa ({patient.referrals?.length || 0})
          </button>

          <button
            onClick={() => setActiveView('create')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'create'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Andika Rufaa Mpya</span>
          </button>

          {selectedReferral && (
            <button
              onClick={() => setActiveView('letter')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ml-auto ${
                activeView === 'letter'
                  ? 'bg-white text-indigo-900 shadow-xs border border-indigo-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Printer className="w-3.5 h-3.5 text-indigo-600" />
              <span>Tazama Barua ya Rufaa</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* VIEW 1: Referral List */}
          {activeView === 'list' && (
            <div className="space-y-4">
              {(!patient.referrals || patient.referrals.length === 0) ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-8">
                  <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-slate-800 mb-1">
                    Hakuna rufaa iliyorekodiwa bado kwa {patient.fullName}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                    Kama mgonjwa anahitaji uchunguzi wa daktari bingwa, vipimo vya juu vya maabara, au huduma ya dharura, unaweza kuandika rufaa rasmi hapa.
                  </p>
                  <button
                    onClick={() => setActiveView('create')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Andika Rufaa ya Kwanza</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {patient.referrals.map((ref) => {
                    const isPriorityUrgent = ref.priority === 'ya_haraka' || ref.priority === 'dharura';
                    return (
                      <div
                        key={ref.id}
                        className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                              {ref.referralNumber}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              ref.priority === 'dharura' ? 'bg-rose-100 text-rose-800' :
                              ref.priority === 'ya_haraka' ? 'bg-amber-100 text-amber-800' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              Kipaumbele: {ref.priority === 'dharura' ? 'Dharura' : ref.priority === 'ya_haraka' ? 'Ya Haraka' : 'Kawaida'}
                            </span>
                            <span className="text-xs text-slate-400">Tarehe: {ref.date}</span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>{ref.targetFacility}</span>
                            <span className="text-xs font-normal text-slate-500">({ref.targetDepartment})</span>
                          </h4>

                          <p className="text-xs text-slate-600 line-clamp-2">
                            <span className="font-semibold text-slate-800">Utambuzi:</span> {ref.primaryDiagnosis}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              setSelectedReferral(ref);
                              setActiveView('letter');
                            }}
                            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold rounded-xl border border-blue-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-700" />
                            <span>Tazama Barua</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: Create New Referral Form */}
          {activeView === 'create' && (
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="bg-blue-50/70 p-3 rounded-2xl border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Barua hii ya rufaa itatengenezwa kulingana na viwango vya Wizara ya Afya (Ministry of Health Referral Formats).
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kituo Kinachotoa Rufaa
                  </label>
                  <input
                    type="text"
                    required
                    value={referringFacility}
                    onChange={e => setReferringFacility(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mtaalamu / Daktari Anayerejelea
                  </label>
                  <input
                    type="text"
                    required
                    value={referringDoctor}
                    onChange={e => setReferringDoctor(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hospitali / Kituo Kinachopewa Rufaa
                  </label>
                  <input
                    type="text"
                    required
                    value={targetFacility}
                    onChange={e => setTargetFacility(e.target.value)}
                    placeholder="Mf. Hospitali ya Taifa Muhimbili / Amana / Bugando"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Idara / Kliniki Maalum
                  </label>
                  <input
                    type="text"
                    required
                    value={targetDepartment}
                    onChange={e => setTargetDepartment(e.target.value)}
                    placeholder="Mf. Idara ya Kisukari & Tezi / Idara ya Watoto & Lishe"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kiwango cha Kipaumbele (Priority)
                  </label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="kawaida">Kawaida (Routine Consultation)</option>
                    <option value="ya_haraka">Ya Haraka (Urgent / Ndani ya masaa 24-48)</option>
                    <option value="dharura">Dharura (Emergency / Mara Moja)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Utambuzi wa Awali (Primary Diagnosis)
                  </label>
                  <input
                    type="text"
                    required
                    value={primaryDiagnosis}
                    onChange={e => setPrimaryDiagnosis(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sababu Kuu ya Rufaa (Reason for Referral)
                </label>
                <textarea
                  rows={2}
                  required
                  value={reasonForReferral}
                  onChange={e => setReasonForReferral(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Muhtasari wa Kliniki na Vipimo (Clinical Summary)
                </label>
                <textarea
                  rows={3}
                  required
                  value={clinicalSummary}
                  onChange={e => setClinicalSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Vipimo Vinavyoombwa Kufanywa (Investigations Requested)
                </label>
                <textarea
                  rows={2}
                  value={specificInvestigationRequested}
                  onChange={e => setSpecificInvestigationRequested(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ujumbe / Maoni kwa Daktari Bingwa (Notes to Specialist)
                </label>
                <textarea
                  rows={2}
                  value={notesToSpecialist}
                  onChange={e => setNotesToSpecialist(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveView('list')}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kamilisha & Tengeneza Barua</span>
                </button>
              </div>
            </form>
          )}

          {/* VIEW 3: Official Referral Letter View & Printable Document */}
          {activeView === 'letter' && selectedReferral && (
            <div className="space-y-4">
              <div className="flex items-center justify-between no-print">
                <button
                  onClick={() => setActiveView('list')}
                  className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                >
                  &larr; Rudi kwenye orodha
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Chapisha Barua ya Rufaa (Print Letter)</span>
                </button>
              </div>

              {/* Printable Sheet */}
              <div className="bg-white p-8 rounded-2xl border border-slate-300 shadow-md text-slate-900 font-sans print:border-none print:shadow-none print:p-0">
                
                {/* Official Letterhead */}
                <div className="border-b-2 border-slate-800 pb-4 mb-6 flex items-center justify-between">
                  <div>
                    <div className="text-xl font-black uppercase tracking-wider text-slate-900">
                      {selectedReferral.referringFacility}
                    </div>
                    <p className="text-xs text-slate-600">
                      Kliniki ya Magonjwa ya Kimetaboliki, Kisukari & Lishe ya Kliniki
                    </p>
                    <p className="text-xs text-slate-500">
                      Simu: +255 700 000 000 | Barua Pepe: info@afyalishe.co.tz
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black uppercase bg-slate-900 text-white px-3 py-1 rounded-md inline-block">
                      BARUA YA RUFAA YA KIMATIBABU
                    </div>
                    <p className="text-xs font-mono font-bold text-slate-800 mt-1">
                      Nambari: {selectedReferral.referralNumber}
                    </p>
                    <p className="text-xs text-slate-600">Tarehe: {selectedReferral.date}</p>
                  </div>
                </div>

                {/* Recipient & Priority */}
                <div className="grid grid-cols-2 gap-4 mb-6 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-500 block uppercase text-[10px]">KWA:</span>
                    <p className="font-bold text-slate-900 text-sm">{selectedReferral.targetFacility}</p>
                    <p className="text-slate-700 font-semibold">{selectedReferral.targetDepartment}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-500 block uppercase text-[10px]">KIPAUMBELE:</span>
                    <span className={`inline-block font-black uppercase px-2 py-1 rounded-md text-xs mt-0.5 ${
                      selectedReferral.priority === 'dharura' ? 'bg-rose-600 text-white' :
                      selectedReferral.priority === 'ya_haraka' ? 'bg-amber-500 text-white' :
                      'bg-slate-700 text-white'
                    }`}>
                      {selectedReferral.priority === 'dharura' ? 'DHARURA (EMERGENCY)' :
                       selectedReferral.priority === 'ya_haraka' ? 'YA HARAKA (URGENT)' : 'KAWAIDA (ROUTINE)'}
                    </span>
                  </div>
                </div>

                {/* Patient Information Table */}
                <div className="mb-6">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-300 pb-1 mb-2">
                    1. Taarifa za Mgonjwa (Patient Demographics & Vitals)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-slate-500 block text-[10px]">Jina Kamili:</span>
                      <span className="font-bold text-slate-900">{patient.fullName}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-slate-500 block text-[10px]">Umri / Jinsia:</span>
                      <span className="font-bold text-slate-900">
                        {patient.age} miaka ({patient.gender === 'male' ? 'Mwanaume' : 'Mwanamke'})
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-slate-500 block text-[10px]">Uzito / Urefu / BMI:</span>
                      <span className="font-bold text-slate-900">
                        {patient.currentWeightKg}kg / {patient.heightCm}cm (BMI {selectedReferral.latestVitals?.bmi || '-'})
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-slate-500 block text-[10px]">Sukari / BP:</span>
                      <span className="font-bold text-slate-900">
                        {selectedReferral.latestVitals?.glucoseMgDl || patient.currentGlucoseMgDl || 120} mg/dL | {patient.bloodPressure || '120/80'}
                      </span>
                    </div>
                  </div>

                  {patient.childProfile && (
                    <div className="mt-2 p-2 bg-amber-50 rounded-lg text-xs border border-amber-200">
                      <span className="font-bold text-amber-900">Mlezi / Mzazi: </span>
                      <span className="text-amber-950">
                        {patient.childProfile.guardianName} ({patient.childProfile.guardianRelation}), Simu: {patient.childProfile.guardianPhone}
                      </span>
                      {patient.childProfile.muacCm && (
                        <span className="ml-4 font-bold text-amber-900">
                          MUAC: {patient.childProfile.muacCm} cm ({patient.childProfile.muacStatus})
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Clinical Referral Content */}
                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="font-black uppercase tracking-wider text-slate-700 border-b border-slate-300 pb-1 mb-1">
                      2. Utambuzi wa Awali & Sababu ya Rufaa
                    </h4>
                    <p className="font-bold text-slate-900 mb-1">
                      Utambuzi: <span className="font-normal">{selectedReferral.primaryDiagnosis}</span>
                    </p>
                    <p className="text-slate-700">
                      <span className="font-bold text-slate-900">Sababu:</span> {selectedReferral.reasonForReferral}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-black uppercase tracking-wider text-slate-700 border-b border-slate-300 pb-1 mb-1">
                      3. Muhtasari wa Kliniki (Clinical Summary & Medication)
                    </h4>
                    <p className="text-slate-800 leading-relaxed whitespace-pre-line mb-1">
                      {selectedReferral.clinicalSummary}
                    </p>
                    {selectedReferral.currentMedications && (
                      <p className="text-slate-700">
                        <span className="font-bold">Dawa za sasa:</span> {selectedReferral.currentMedications}
                      </p>
                    )}
                  </div>

                  {selectedReferral.specificInvestigationRequested && (
                    <div>
                      <h4 className="font-black uppercase tracking-wider text-slate-700 border-b border-slate-300 pb-1 mb-1">
                        4. Vipimo Maalum Vinavyoombwa (Specific Investigations)
                      </h4>
                      <p className="text-slate-800 leading-relaxed whitespace-pre-line bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        {selectedReferral.specificInvestigationRequested}
                      </p>
                    </div>
                  )}

                  {selectedReferral.notesToSpecialist && (
                    <div>
                      <h4 className="font-black uppercase tracking-wider text-slate-700 border-b border-slate-300 pb-1 mb-1">
                        5. Maoni kwa Daktari Bingwa (Notes to Specialist)
                      </h4>
                      <p className="text-slate-700 italic">
                        "{selectedReferral.notesToSpecialist}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Doctor Sign-off Block */}
                <div className="mt-12 pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs">
                  <div>
                    <p className="font-bold text-slate-900 mb-8">
                      Mtaalamu Anayerejelea: {selectedReferral.referringDoctor}
                    </p>
                    <div className="border-b border-slate-400 w-48"></div>
                    <p className="text-[10px] text-slate-500 mt-1">Sahihi & Tarehe</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 mb-8">Muhuri Rasmi wa Kliniki (Official Stamp):</p>
                    <div className="inline-block border-2 border-dashed border-slate-300 w-40 h-16 rounded-xl"></div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
