import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, KeyRound, Clock, FileCheck2, UserCheck, 
  Eye, EyeOff, Save, CheckCircle2, AlertTriangle, Building2, 
  Award, RefreshCw, X, Sliders, ShieldAlert, Cpu, Database,
  Smartphone, Laptop, Users, Stethoscope, Search, Check, Radio
} from 'lucide-react';
import { SecuritySettings, RegisteredPatient, OnlineDoctor } from '../types';
import { updateAdminPinCloud, updateAdminPasswordCloud } from '../services/dataSyncService';
import { PasswordComplexityIndicator } from './PasswordComplexityIndicator';
import { validatePasswordComplexity } from '../utils/passwordValidator';

interface ClinicalSecuritySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  securitySettings: SecuritySettings;
  onUpdateSecuritySettings: (settings: SecuritySettings) => void;
  patients?: RegisteredPatient[];
  doctors?: OnlineDoctor[];
  onUpdatePatientPassword?: (patientId: string, newPass: string) => void;
  onUpdateDoctorPassword?: (doctorId: string, newPass: string) => void;
  onTriggerCloudSync?: () => Promise<void>;
  isSyncing?: boolean;
  lastSyncedTime?: string;
}

export const ClinicalSecuritySettingsModal: React.FC<ClinicalSecuritySettingsModalProps> = ({
  isOpen,
  onClose,
  securitySettings,
  onUpdateSecuritySettings,
  patients = [],
  doctors = [],
  onUpdatePatientPassword,
  onUpdateDoctorPassword,
  onTriggerCloudSync,
  isSyncing = false,
  lastSyncedTime = '',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'access' | 'all_passwords' | 'sync' | 'clinical' | 'records'>('access');

  // Form states initialized from props
  const [adminName, setAdminName] = useState(securitySettings.adminName || 'DISMAS POKELA');
  const [adminEmail, setAdminEmail] = useState(securitySettings.adminEmail || 'dismaspokela@gmail.com');
  const [adminPassword, setAdminPassword] = useState(securitySettings.adminPassword || 'admin123');
  const [adminPin, setAdminPin] = useState(securitySettings.adminPin || '8822');
  const [showPassword, setShowPassword] = useState(false);

  // Security Toggles
  const [requireLoginFirst, setRequireLoginFirst] = useState(securitySettings.requireLoginFirst ?? true);
  const [allowPatientPrinting, setAllowPatientPrinting] = useState(securitySettings.allowPatientPrinting ?? true);
  const [twoFactorAuthEnabled, setTwoFactorAuthEnabled] = useState(securitySettings.twoFactorAuthEnabled ?? true);
  const [twoFactorPin, setTwoFactorPin] = useState(securitySettings.twoFactorPin || '8822');
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState<number>(securitySettings.sessionTimeoutMinutes ?? 15);
  const [autoLockMinutes, setAutoLockMinutes] = useState<number>(securitySettings.autoLockMinutes ?? 10);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(securitySettings.autoSyncEnabled ?? true);
  const [syncIntervalSeconds, setSyncIntervalSeconds] = useState<number>(securitySettings.syncIntervalSeconds ?? 30);
  
  // Clinical Governance & Compliance
  const [hospitalFacilityName, setHospitalFacilityName] = useState(securitySettings.hospitalFacilityName || 'AFYALISHE TANZANIA • CLINICAL NUTRITION & METABOLIC CARE');
  const [registrationCouncilLicense, setRegistrationCouncilLicense] = useState(securitySettings.registrationCouncilLicense || 'MCT/TZ/NUTR-2026/0894');
  const [watermarkMedicalReports, setWatermarkMedicalReports] = useState(securitySettings.watermarkMedicalReports ?? true);
  const [strictDoctorVerification, setStrictDoctorVerification] = useState(securitySettings.strictDoctorVerification ?? true);
  const [auditLoggingEnabled, setAuditLoggingEnabled] = useState(securitySettings.auditLoggingEnabled ?? true);
  const [clinicalEncryptionBadge, setClinicalEncryptionBadge] = useState(securitySettings.clinicalEncryptionBadge ?? true);

  // Password Management States
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
  const [editingPatientPasswords, setEditingPatientPasswords] = useState<Record<string, string>>({});
  const [editingDoctorPasswords, setEditingDoctorPasswords] = useState<Record<string, string>>({});
  const [passwordSuccessToast, setPasswordSuccessToast] = useState<string | null>(null);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [cloudSyncSuccess, setCloudSyncSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAdminName(securitySettings.adminName || 'DISMAS POKELA');
      setAdminEmail(securitySettings.adminEmail || 'dismaspokela@gmail.com');
      setAdminPassword(securitySettings.adminPassword || 'admin123');
      setAdminPin(securitySettings.adminPin || '8822');
      setRequireLoginFirst(securitySettings.requireLoginFirst ?? true);
      setAllowPatientPrinting(securitySettings.allowPatientPrinting ?? true);
      setTwoFactorAuthEnabled(securitySettings.twoFactorAuthEnabled ?? true);
      setTwoFactorPin(securitySettings.twoFactorPin || '8822');
      setSessionTimeoutMinutes(securitySettings.sessionTimeoutMinutes ?? 15);
      setAutoLockMinutes(securitySettings.autoLockMinutes ?? 10);
      setAutoSyncEnabled(securitySettings.autoSyncEnabled ?? true);
      setSyncIntervalSeconds(securitySettings.syncIntervalSeconds ?? 30);
      setHospitalFacilityName(securitySettings.hospitalFacilityName || 'AFYALISHE TANZANIA • CLINICAL NUTRITION & METABOLIC CARE');
      setRegistrationCouncilLicense(securitySettings.registrationCouncilLicense || 'MCT/TZ/NUTR-2026/0894');
      setWatermarkMedicalReports(securitySettings.watermarkMedicalReports ?? true);
      setStrictDoctorVerification(securitySettings.strictDoctorVerification ?? true);
      setAuditLoggingEnabled(securitySettings.auditLoggingEnabled ?? true);
      setClinicalEncryptionBadge(securitySettings.clinicalEncryptionBadge ?? true);

      // Initialize doctor password state
      const dPasses: Record<string, string> = {};
      doctors.forEach((d) => {
        dPasses[d.id] = d.password || d.initialPassword || 'daktari123';
      });
      setEditingDoctorPasswords(dPasses);

      // Initialize patient password state
      const pPasses: Record<string, string> = {};
      patients.forEach((p) => {
        pPasses[p.id] = p.password || '1234';
      });
      setEditingPatientPasswords(pPasses);
    }
  }, [isOpen, securitySettings, doctors, patients]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: SecuritySettings = {
      ...securitySettings,
      adminName,
      adminEmail,
      adminPassword,
      adminPin,
      requireLoginFirst,
      allowPatientPrinting,
      twoFactorAuthEnabled,
      twoFactorPin,
      sessionTimeoutMinutes: Number(sessionTimeoutMinutes),
      autoLockMinutes: Number(autoLockMinutes),
      autoSyncEnabled,
      syncIntervalSeconds: Number(syncIntervalSeconds),
      hospitalFacilityName,
      registrationCouncilLicense,
      watermarkMedicalReports,
      strictDoctorVerification,
      auditLoggingEnabled,
      clinicalEncryptionBadge,
    };

    if (adminPassword.trim() && adminPassword.trim() !== 'admin123') {
      const comp = validatePasswordComplexity(adminPassword.trim());
      if (!comp.isValid) {
        alert(comp.errorMessage || 'Nenosiri la Admin lazima liwe na angalau herufi 8, namba moja (0-9), na herufi kubwa moja (A-Z).');
        return;
      }
      try {
        localStorage.setItem('afyalishe_custom_admin_password', adminPassword.trim());
      } catch {}
      updateAdminPasswordCloud(adminPassword.trim()).catch(() => {});
    }

    onUpdateSecuritySettings(updated);
    localStorage.setItem('afyalishe_security_settings', JSON.stringify(updated));
    setSavedSuccess(true);

    // Also trigger cloud sync so other devices get updated immediately
    if (onTriggerCloudSync) {
      onTriggerCloudSync().catch((err) => console.warn('Sync on save warning:', err));
    }

    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleSaveSingleDoctorPassword = (doctorId: string, doctorName: string) => {
    const newPass = editingDoctorPasswords[doctorId];
    if (!newPass || !newPass.trim()) {
      alert('Tafadhali weka nenosiri halali.');
      return;
    }
    if (onUpdateDoctorPassword) {
      onUpdateDoctorPassword(doctorId, newPass.trim());
      if (onTriggerCloudSync) {
        onTriggerCloudSync();
      }
      setPasswordSuccessToast(`Nenosiri la ${doctorName} limebadilishwa kuwa: "${newPass.trim()}" na kusawazishwa wingu!`);
      setTimeout(() => setPasswordSuccessToast(null), 4000);
    }
  };

  const handleSaveSinglePatientPassword = (patientId: string, patientName: string) => {
    const newPass = editingPatientPasswords[patientId];
    if (!newPass || !newPass.trim()) {
      alert('Tafadhali weka nenosiri au PIN halali.');
      return;
    }
    if (onUpdatePatientPassword) {
      onUpdatePatientPassword(patientId, newPass.trim());
      if (onTriggerCloudSync) {
        onTriggerCloudSync();
      }
      setPasswordSuccessToast(`Nenosiri la ${patientName} limebadilishwa kuwa: "${newPass.trim()}" na kusawazishwa kwa vifaa vyote!`);
      setTimeout(() => setPasswordSuccessToast(null), 4000);
    }
  };

  const handleManualSyncClick = async () => {
    if (onTriggerCloudSync) {
      await onTriggerCloudSync();
      setCloudSyncSuccess(true);
      setTimeout(() => setCloudSyncSuccess(false), 3000);
    }
  };

  // Filtered lists
  const filteredPatients = patients.filter((p) => 
    p.fullName.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
    p.phone.includes(patientSearchTerm) ||
    (p.username && p.username.toLowerCase().includes(patientSearchTerm.toLowerCase()))
  );

  const filteredDoctors = doctors.filter((d) => 
    d.name.toLowerCase().includes(doctorSearchTerm.toLowerCase()) ||
    d.phone.includes(doctorSearchTerm) ||
    (d.specialtyLabelSwahili && d.specialtyLabelSwahili.toLowerCase().includes(doctorSearchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-5 sm:p-6 text-white relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-black mb-2.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Mfumo wa Usimamizi wa Admin • Viwango vya Usalama na Usawazishaji wa Wingu</span>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Mipangilio ya Msimamizi Mkuu & Usawazishaji Vifaa Vyote
              </h2>
              <p className="text-xs text-teal-200/80 mt-0.5">
                Badili nenosiri la Admin na la mtumiaji yeyote kwenye mfumo, na weka mipangilio ya usawazishaji wa kiotomatiki kwa kifaa chochote.
              </p>
            </div>
          </div>

          {/* Subtabs Bar */}
          <div className="flex items-center gap-1 mt-4 bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 text-xs font-bold overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveSubTab('access')}
              className={`py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeSubTab === 'access'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Nenosiri ya Admin</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('all_passwords')}
              className={`py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeSubTab === 'all_passwords'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-200 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>🔑 Nenosiri Zote za Mfumo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('sync')}
              className={`py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeSubTab === 'sync'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-cyan-200 hover:text-white'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>🔄 Usawazishaji Vifaa Vyote</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('clinical')}
              className={`py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeSubTab === 'clinical'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Viwango vya Kliniki</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('records')}
              className={`py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeSubTab === 'records'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Ukaguzi & Ripoti</span>
            </button>
          </div>
        </div>

        {/* Global Toast Notification */}
        {passwordSuccessToast && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between gap-2 animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{passwordSuccessToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setPasswordSuccessToast(null)}
              className="text-white/80 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: Nenosiri & Ufikiaji wa Admin */}
          {activeSubTab === 'access' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Admin Profile & Password Box */}
              <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-teal-950 text-sm">
                    <KeyRound className="w-4 h-4 text-teal-700" />
                    <span>Nenosiri na PIN Kuu ya Admin (Msimamizi Mkuu)</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-600 text-white">
                    DISMAS POKELA
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Jina la Msimamizi Mkuu:
                    </label>
                    <input
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-teal-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Barua Pepe ya Msimamizi:
                    </label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-teal-600 bg-white"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        Nenosiri Kuu la Admin (Master Password):
                      </label>
                      <button
                        type="button"
                        onClick={async () => {
                          const clean = adminPassword.trim();
                          const comp = validatePasswordComplexity(clean);
                          if (!comp.isValid) {
                            alert(comp.errorMessage || 'Nenosiri lazima liwe na angalau herufi 8, namba moja (0-9), na herufi kubwa moja (A-Z).');
                            return;
                          }
                          try {
                            localStorage.setItem('afyalishe_custom_admin_password', clean);
                          } catch {}
                          await updateAdminPasswordCloud(clean);
                          onUpdateSecuritySettings({
                            ...securitySettings,
                            adminPassword: clean,
                          });
                          setPasswordSuccessToast(`✅ Nenosiri Kuu la Admin limesasishwa kikamilifu na kusawazishwa kwa vifaa vyote!`);
                          setTimeout(() => setPasswordSuccessToast(null), 4000);
                        }}
                        className="text-[10px] font-bold text-teal-800 hover:text-teal-950 bg-teal-100 hover:bg-teal-200 px-2 py-0.5 rounded-md cursor-pointer transition-colors border border-teal-300"
                        title="Hifadhi na Sawazisha Nenosiri hili sasa bila kusubiri fomu yote"
                      >
                        💾 Hifadhi Nenosiri Sasa
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 pr-10 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-teal-600 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {adminPassword.length > 0 && (
                      <PasswordComplexityIndicator password={adminPassword} className="mt-2" />
                    )}
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Badilisha nenosiri hapa; litasasishwa mara moja kwenye wingu (chaguo-msingi: admin123).
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        PIN ya Kuingia ya Haraka ya Admin (Admin PIN):
                      </label>
                      <button
                        type="button"
                        onClick={async () => {
                          const clean = adminPin.trim();
                          if (!clean || clean.length < 4) {
                            alert('PIN ya Admin lazima iwe na angalau tarakimu 4.');
                            return;
                          }
                          await updateAdminPinCloud(clean);
                          onUpdateSecuritySettings({
                            ...securitySettings,
                            adminPin: clean,
                          });
                          setPasswordSuccessToast(`✅ PIN ya Haraka ya Admin imebadilishwa kuwa: "${clean}" na kusawazishwa kwa vifaa vyote!`);
                          setTimeout(() => setPasswordSuccessToast(null), 4000);
                        }}
                        className="text-[10px] font-bold text-teal-800 hover:text-teal-950 bg-teal-100 hover:bg-teal-200 px-2 py-0.5 rounded-md cursor-pointer transition-colors border border-teal-300"
                        title="Hifadhi na Sawazisha PIN hii sasa bila kusubiri fomu yote"
                      >
                        Hifadhi PIN Sasa
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={8}
                      value={adminPin}
                      onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="8822"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-teal-900 focus:outline-teal-600 bg-white"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      PIN ya tarakimu ya haraka (chaguo-msingi: 8822). Inatumika kufungua mfumo na Mipangilio kwenye vifaa vyote.
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Toggles Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                  Udhibiti wa Ufikiaji na Vizuizi (Access Control)
                </h4>

                {/* Require Login Gate */}
                <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 flex items-center justify-between gap-3 transition-all">
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-teal-700" />
                      <span>Ulinzi wa Nenosiri wa Mfumo Mzima (Ulinzi wa Kudumu)</span>
                    </div>
                    <p className="text-[11px] text-teal-900">
                      Mfumo hautafunguka bila nenosiri na mtu yeyote hawezi kuingia wala kuona taarifa za kliniki bila kuweka nenosiri au PIN.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-700 text-white text-[10px] font-bold shrink-0">
                    <Check className="w-3 h-3 text-teal-200" />
                    <span>Inalazimishwa Daima</span>
                  </div>
                </div>

                {/* Auto Lock Control */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2 hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Kujifunga Kiotomatiki Mfumo Usipotumika (Auto-Lock Timeout)</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Mfumo utajifunga wenyewe na kuhitaji PIN ya Admin au nenosiri baada ya muda huu.
                      </p>
                    </div>
                    <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                      Dakika {autoLockMinutes}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
                    {[0, 1, 3, 5, 10, 15, 30].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setAutoLockMinutes(mins)}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                          autoLockMinutes === mins
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {mins === 0 ? 'Bila Kufunga' : `${mins} dk`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Patient Printing Control */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 hover:border-slate-300 transition-all">
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Ruhusu Wagonjwa Kuchapisha/Kupakua Ripoti (Patient Printing Permission)</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Admin anadhibiti ikiwa watumiaji wa kawaida wanaweza kupakua PDF ya ripoti ya lishe.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowPatientPrinting}
                    onChange={(e) => setAllowPatientPrinting(e.target.checked)}
                    className="w-5 h-5 accent-teal-600 cursor-pointer rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NENOSIRI ZOTE KWENYE MFUMO (ADMIN, MADAKTARI, WAGONJWA) */}
          {activeSubTab === 'all_passwords' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Info banner */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-amber-950 text-sm">
                    Usimamizi Kamili wa Nenosiri na PIN Zote za Mfumo
                  </h4>
                  <p className="text-amber-800 mt-1 leading-relaxed">
                    Kama Msimamizi Mkuu (Admin), una mamlaka ya kubadili, kuweka upya, na kusasisha nenosiri au PIN ya mtumiaji yeyote (Madaktari na Wagonjwa) moja kwa moja. Mabadiliko yatasawazishwa kwenye vifaa vyote vinavyotumia mfumo huu mara moja.
                  </p>
                </div>
              </div>

              {/* SEHEMU YA 1: MADAKTARI & WATAALAM WA LISHE */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">
                        Nenosiri za Madaktari na Wataalam wa Lishe ({doctors.length})
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        Badili nenosiri la daktari yeyote ili aweze kuingia kwenye mfumo
                      </span>
                    </div>
                  </div>

                  {/* Doctor Search input */}
                  <div className="relative w-full sm:w-56">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={doctorSearchTerm}
                      onChange={(e) => setDoctorSearchTerm(e.target.value)}
                      placeholder="Tafuta daktari..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-teal-600 bg-slate-50"
                    />
                  </div>
                </div>

                {/* Doctor List */}
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {filteredDoctors.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-xs">
                      Hakuna daktari aliyepatikana kwa jina hilo.
                    </div>
                  ) : (
                    filteredDoctors.map((doc) => (
                      <div 
                        key={doc.id}
                        className="p-3 rounded-xl bg-slate-50 hover:bg-teal-50/40 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {doc.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-teal-100 text-teal-800 font-bold">
                              {doc.specialtyLabelSwahili || doc.specialty}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            Username / Simu: <strong>{doc.username || doc.phone}</strong>
                          </div>
                        </div>

                        {/* Password input & Save Button */}
                        <div className="flex items-center gap-2 shrink-0">
                          <input
                            type="text"
                            value={editingDoctorPasswords[doc.id] || ''}
                            onChange={(e) => 
                              setEditingDoctorPasswords((prev) => ({
                                ...prev,
                                [doc.id]: e.target.value,
                              }))
                            }
                            placeholder="Weka Nenosiri jipya"
                            className="w-36 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 bg-white focus:outline-teal-600"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveSingleDoctorPassword(doc.id, doc.name)}
                            className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Hifadhi</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* SEHEMU YA 2: WAGONJWA WOTE (PATIENTS REGISTRY) */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">
                        Nenosiri na PIN za Wagonjwa Wote ({patients.length})
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        Badili au weka upya nenosiri la mgonjwa yeyote kwenye sajili
                      </span>
                    </div>
                  </div>

                  {/* Patient Search input */}
                  <div className="relative w-full sm:w-56">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={patientSearchTerm}
                      onChange={(e) => setPatientSearchTerm(e.target.value)}
                      placeholder="Tafuta mgonjwa kwa jina au simu..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-amber-600 bg-slate-50"
                    />
                  </div>
                </div>

                {/* Patient List */}
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {filteredPatients.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-xs">
                      Hakuna mgonjwa aliyepatikana kwa utafutaji huo.
                    </div>
                  ) : (
                    filteredPatients.map((pat) => (
                      <div 
                        key={pat.id}
                        className="p-3 rounded-xl bg-slate-50 hover:bg-amber-50/40 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-slate-900">
                              {pat.fullName}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold uppercase">
                              {pat.category}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            Simu: {pat.phone} | Username: <strong>{pat.username || pat.phone}</strong>
                          </div>
                        </div>

                        {/* Password input & Save Button */}
                        <div className="flex items-center gap-2 shrink-0">
                          <input
                            type="text"
                            value={editingPatientPasswords[pat.id] || ''}
                            onChange={(e) => 
                              setEditingPatientPasswords((prev) => ({
                                ...prev,
                                [pat.id]: e.target.value,
                              }))
                            }
                            placeholder="PIN/Nenosiri"
                            className="w-32 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 bg-white focus:outline-amber-600"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveSinglePatientPassword(pat.id, pat.fullName)}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Hifadhi</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: USAWAZISHAJI WA VIFAA VYOTE (MULTI-DEVICE CLOUD SYNC) */}
          {activeSubTab === 'sync' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Cloud Sync Status Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950 via-slate-900 to-teal-950 text-white border border-cyan-800/60 shadow-lg space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
                      <RefreshCw className={`w-6 h-6 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                        <h4 className="font-black text-base text-white">
                          Usawazishaji wa Wingu kwa Vifaa Vyote (Live Cloud Sync)
                        </h4>
                      </div>
                      <p className="text-xs text-cyan-200/80 mt-1">
                        Mfumo unasawazisha data na database ya Firebase: <code className="text-cyan-300 font-mono">ai-studio-afyalishe...</code>
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold shrink-0">
                    Wingu Lipo Mtandaoni
                  </span>
                </div>

                {/* Device sync explanation */}
                <div className="p-3.5 rounded-xl bg-cyan-900/30 border border-cyan-700/40 text-xs text-cyan-100 leading-relaxed flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-cyan-300 shrink-0">
                    <Smartphone className="w-4 h-4" />
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <strong>Kazi ya Usawazishaji:</strong> Kila mara unapoingiza mgonjwa mpya, unaporekodi chakula au sukari, au unapobadili nenosiri, taarifa zote zinasasishwa mara moja kwenye simu, kompyuta au kifaa chochote kinachotumia mfumo huu bila kupoteza data.
                  </div>
                </div>

                {/* Sync Actions & Timestamp */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-slate-300 font-mono flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>Muda wa Mwisho Kusawazishwa:</span>
                    <strong className="text-white font-bold">{lastSyncedTime || 'Sasa hivi'}</strong>
                  </div>

                  <button
                    type="button"
                    onClick={handleManualSyncClick}
                    disabled={isSyncing}
                    className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 text-slate-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Inasasisha Vifaa Vyote...' : '🔄 Sawazisha Vifaa Vyote Sasa'}</span>
                  </button>
                </div>

                {cloudSyncSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Taarifa zote zimesawazishwa kikamilifu na kupakuliwa kutoka kwenye wingu!</span>
                  </div>
                )}
              </div>

              {/* Sync Configuration Controls */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                  Mipangilio ya Mzunguko wa Usawazishaji (Sync Intervals & Automation)
                </h4>

                {/* Toggle Auto Sync */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Radio className="w-4 h-4 text-cyan-600" />
                      <span>Sasisha Kiotomatiki Mara kwa Mara (Background Auto-Sync)</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Ikiwashwa, mfumo utakuwa unavuta na kutuma taarifa mpya kwenye vifaa vyote bila kuhitaji kubofya chochote.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoSyncEnabled}
                    onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                    className="w-5 h-5 accent-cyan-600 cursor-pointer rounded"
                  />
                </div>

                {/* Interval Buttons */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Mzunguko wa Kisasisho (Seconds Interval):
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[15, 30, 60, 120].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setSyncIntervalSeconds(sec)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          syncIntervalSeconds === sec
                            ? 'bg-cyan-700 text-white border-cyan-700 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Kila Sekunde {sec}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Information Checklist */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Data Zinazosasishwa Pande Zote Mbili (Two-Way Synced Modules):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-teal-600" />
                      <span>Akaunti na Nenosiri za Admin</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-teal-600" />
                      <span>Sajili ya Wagonjwa & Nenosiri Zao</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-teal-600" />
                      <span>Madaktari & Nenosiri Zao</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-teal-600" />
                      <span>Vipimo vya Sukari na Milo</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-teal-600" />
                      <span>Vipimo vya Shinikizo la Damu</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-teal-600" />
                      <span>Viwango na Leseni ya Hospitali</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VIWANGO VYA KLINIKI */}
          {activeSubTab === 'clinical' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3.5">
                <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  <span>Taarifa za Kituo cha Matibabu (Medical Facility Information)</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jina Rasmi la Kliniki / Hospitali:
                  </label>
                  <input
                    type="text"
                    value={hospitalFacilityName}
                    onChange={(e) => setHospitalFacilityName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-teal-600 bg-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Hili jina litaonekana kwenye vichwa vyote vya ripoti za PDF na rufaa za matibabu.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nambari ya Leseni ya Baraza la Tiba / Wizara ya Afya (Registration License):
                  </label>
                  <input
                    type="text"
                    value={registrationCouncilLicense}
                    onChange={(e) => setRegistrationCouncilLicense(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-800 focus:outline-teal-600 bg-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Mfano: MCT/TZ/NUTR-2026/0894
                  </span>
                </div>
              </div>

              {/* Compliance toggles */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-teal-600" />
                      <span>Uhakiki Madhubuti wa Nambari ya Leseni ya Daktari (Doctor Verification)</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Madaktari lazima wawe na nambari halali ya MCT/Baraza ili kufanya ushauri.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={strictDoctorVerification}
                    onChange={(e) => setStrictDoctorVerification(e.target.checked)}
                    className="w-5 h-5 accent-teal-600 cursor-pointer rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: UKAGUZI & RIPOTI */}
          {activeSubTab === 'records' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <FileCheck2 className="w-3.5 h-3.5 text-teal-600" />
                      <span>Watermark ya Usalama Kwenye Ripoti za PDF (Medical Watermark)</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Weka alama salama ya maji ya 'AFYALISHE TANZANIA' kuzuia wizi au kughushi nyaraka.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={watermarkMedicalReports}
                    onChange={(e) => setWatermarkMedicalReports(e.target.checked)}
                    className="w-5 h-5 accent-teal-600 cursor-pointer rounded"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                      <span>Kurekodi Ukaguzi wa Mfumo (Clinical Audit Logging)</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Kila tendo la kubadili nenosiri, kupakua data, au kusasisha vipimo linarekodiwa salama.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={auditLoggingEnabled}
                    onChange={(e) => setAuditLoggingEnabled(e.target.checked)}
                    className="w-5 h-5 accent-teal-600 cursor-pointer rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Mabadiliko yatahifadhiwa na kusasishwa kwa vifaa vyote mara moja.</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
              >
                Funga
              </button>

              <button
                type="submit"
                disabled={savedSuccess}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-emerald-600 active:scale-95"
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white animate-bounce" />
                    <span>Imehifadhiwa & Imesasishwa!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-white" />
                    <span>Hifadhi Mipangilio Yote</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
