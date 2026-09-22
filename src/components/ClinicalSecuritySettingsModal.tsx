import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, KeyRound, Clock, FileCheck2, UserCheck, 
  Eye, EyeOff, Save, CheckCircle2, AlertTriangle, Building2, 
  Award, RefreshCw, X, Sliders, ShieldAlert, Cpu, Database
} from 'lucide-react';
import { SecuritySettings } from '../types';

interface ClinicalSecuritySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  securitySettings: SecuritySettings;
  onUpdateSecuritySettings: (settings: SecuritySettings) => void;
}

export const ClinicalSecuritySettingsModal: React.FC<ClinicalSecuritySettingsModalProps> = ({
  isOpen,
  onClose,
  securitySettings,
  onUpdateSecuritySettings,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'access' | 'clinical' | 'records'>('access');

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

  const [savedSuccess, setSavedSuccess] = useState(false);

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
    }
  }, [isOpen, securitySettings]);

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

    onUpdateSecuritySettings(updated);
    localStorage.setItem('afyalishe_security_settings', JSON.stringify(updated));
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-black mb-3">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Mfumo wa Kitaalamu & Ulinzi Zaidi (Clinical Governance & Security)</span>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Mipangilio ya Ulinzi na Viwango vya Kliniki
              </h2>
              <p className="text-xs text-teal-200/80 mt-1">
                Udhibiti wa ulinzi wa data za wagonjwa, vigezo vya matibabu, nenosiri la Msimamizi, na usalama wa ripoti za kliniki.
              </p>
            </div>
          </div>

          {/* Subtabs */}
          <div className="flex items-center gap-1.5 mt-5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveSubTab('access')}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeSubTab === 'access'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Ulinzi & Kuingia</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('clinical')}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
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
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
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

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: Ulinzi & Kuingia */}
          {activeSubTab === 'access' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Admin Profile & Password Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                  <KeyRound className="w-4 h-4 text-teal-600" />
                  <span>Akaunti ya Msimamizi Mkuu (Admin Credentials)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Jina la Msimamizi:
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nenosiri Kuu la Admin (Master Password):
                    </label>
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
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Nenosiri la herufi/namba (chaguo-msingi: admin123).
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      PIN ya Kuingia ya Haraka ya Admin (Admin PIN):
                    </label>
                    <input
                      type="text"
                      maxLength={8}
                      value={adminPin}
                      onChange={(e) => setAdminPin(e.target.value)}
                      placeholder="8822"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-teal-600 bg-white"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      PIN ya tarakimu (chaguo-msingi: 8822). Inatumika kuingia haraka na kufungua Mipangilio.
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
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 hover:border-slate-300 transition-all">
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-teal-600" />
                      <span>Lazimisha Kuingia kwa Nenosiri (Mandatory Login Gate)</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Watumiaji lazima waweke nenosiri/PIN kabla ya kuona data yoyote ya mgonjwa.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={requireLoginFirst}
                    onChange={(e) => setRequireLoginFirst(e.target.checked)}
                    className="w-5 h-5 accent-teal-600 cursor-pointer rounded"
                  />
                </div>

                {/* 2FA PIN */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-3 hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                        <span>Uthibitishaji wa Hatua Mbili (Two-Factor PIN)</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Inaongeza ulinzi kwa kuhitaji PIN ya dharura wakati wa mabadiliko nyeti.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={twoFactorAuthEnabled}
                      onChange={(e) => setTwoFactorAuthEnabled(e.target.checked)}
                      className="w-5 h-5 accent-teal-600 cursor-pointer rounded"
                    />
                  </div>

                  {twoFactorAuthEnabled && (
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
                      <label className="text-xs font-bold text-slate-700 whitespace-nowrap">PIN ya Pili (2FA PIN):</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={twoFactorPin}
                        onChange={(e) => setTwoFactorPin(e.target.value)}
                        className="w-28 px-3 py-1 rounded-lg border border-slate-300 text-xs font-mono font-black text-center text-teal-800"
                        placeholder="8822"
                      />
                    </div>
                  )}
                </div>

                {/* Automatic Lock Timeout */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>Kufunga Mfumo Kiotomatiki (Automatic Inactivity Lock)</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Mfumo utafunga skrini na kuhitaji nenosiri mtumiaji akikaa bila kufanya chochote.
                    </p>
                  </div>
                  <select
                    value={autoLockMinutes}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setAutoLockMinutes(val);
                      setSessionTimeoutMinutes(val);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white"
                  >
                    <option value={1}>Dakika 1 (Haraka)</option>
                    <option value={2}>Dakika 2</option>
                    <option value={5}>Dakika 5 (Inashauriwa)</option>
                    <option value={10}>Dakika 10</option>
                    <option value={15}>Dakika 15</option>
                    <option value={30}>Dakika 30</option>
                    <option value={0}>Kamwe (Usifunge Kiotomatiki)</option>
                  </select>
                </div>

                {/* Periodic Updation / Auto-Sync */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
                        <span>Usasishaji wa Mara kwa Mara wa Taarifa (Continuous Pipeline Auto-Update)</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Inasasisha taarifa zote mfululizo kwa mtiririko rasmi:
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoSyncEnabled}
                      onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                      className="w-5 h-5 accent-teal-600 cursor-pointer rounded"
                    />
                  </div>

                  {/* Visual Pipeline flow */}
                  <div className="p-2.5 rounded-xl bg-slate-900 text-slate-200 text-[11px] font-mono flex flex-wrap items-center gap-1.5 justify-center border border-slate-800">
                    <span className="text-amber-400 font-bold">Firebase</span>
                    <span className="text-slate-500">↓</span>
                    <span className="text-emerald-400 font-bold">User Data</span>
                    <span className="text-slate-500">↓</span>
                    <span className="text-blue-400 font-bold">Settings</span>
                    <span className="text-slate-500">↓</span>
                    <span className="text-purple-400 font-bold">Reports</span>
                    <span className="text-slate-500">↓</span>
                    <span className="text-cyan-400 font-bold">Records</span>
                  </div>

                  {autoSyncEnabled && (
                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                      <label className="text-xs font-bold text-slate-700">Muda wa Mzunguko wa Kusasisha (Interval):</label>
                      <select
                        value={syncIntervalSeconds}
                        onChange={(e) => setSyncIntervalSeconds(Number(e.target.value))}
                        className="px-3 py-1 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-white"
                      >
                        <option value={15}>Kila sekunde 15 (Live)</option>
                        <option value={30}>Kila sekunde 30 (Kawaida)</option>
                        <option value={60}>Kila dakika 1</option>
                        <option value={300}>Kila dakika 5</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Viwango vya Kliniki */}
          {activeSubTab === 'clinical' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-4">
                <div className="flex items-center gap-2 font-black text-teal-950 text-sm">
                  <Building2 className="w-4 h-4 text-teal-700" />
                  <span>Usajili wa Kituo cha Matibabu & Leseni (Facility Licensing)</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Jina Rasmi la Kituo / Kliniki (Litaonekana kwenye Ripoti zote):
                    </label>
                    <input
                      type="text"
                      value={hospitalFacilityName}
                      onChange={(e) => setHospitalFacilityName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:outline-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nambari ya Leseni ya Baraza la Madaktari / Wizara ya Afya:
                    </label>
                    <input
                      type="text"
                      value={registrationCouncilLicense}
                      onChange={(e) => setRegistrationCouncilLicense(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-800 bg-white focus:outline-teal-600"
                    />
                  </div>
                </div>
              </div>

              {/* Strict Medical Compliance Toggles */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                  Uthibitisho wa Wataalamu na Usalama wa Mgonjwa
                </h4>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Uhakiki Mkali wa Madaktari (Strict License Verification)</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Inazuia wataalamu wasio na namba ya usajili ya MCT kuandika rufaa au dawa.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={strictDoctorVerification}
                    onChange={(e) => setStrictDoctorVerification(e.target.checked)}
                    className="w-5 h-5 accent-teal-600 cursor-pointer rounded"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-teal-600" />
                      <span>Alama ya Viwango vya Usalama wa Afya (Compliance Badge)</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Onyesha mihuri rasmi ya ulinzi wa taarifa na viwango vya Wizara ya Afya Tanzania.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={clinicalEncryptionBadge}
                    onChange={(e) => setClinicalEncryptionBadge(e.target.checked)}
                    className="w-5 h-5 accent-teal-600 cursor-pointer rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Ukaguzi & Ripoti */}
          {activeSubTab === 'records' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                  <FileCheck2 className="w-4 h-4 text-blue-600" />
                  <span>Ulinzi wa Nyaraka na Ripoti za Wagonjwa</span>
                </div>

                {/* Patient Printing Toggle */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-slate-900">
                      Ruhusu Wagonjwa Kuchapisha na Kupakua Ripoti (Patient Printing)
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Ikiwa imezimwa, wagonjwa hawawezi kupakua PDF ya ripoti bila kibali cha kliniki.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowPatientPrinting}
                    onChange={(e) => setAllowPatientPrinting(e.target.checked)}
                    className="w-5 h-5 accent-teal-600 cursor-pointer rounded"
                  />
                </div>

                {/* Watermark Medical Reports */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-slate-900">
                      Weka Watermark ya Uthibitisho wa Kliniki kwenye Ripoti Zote
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Huweka muhuri wa kidijitali wa "AFYALISHE CLINICAL VERIFIED" kuzuia ughushi.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={watermarkMedicalReports}
                    onChange={(e) => setWatermarkMedicalReports(e.target.checked)}
                    className="w-5 h-5 accent-teal-600 cursor-pointer rounded"
                  />
                </div>

                {/* Audit Logging */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-slate-900">
                      Rekodi za Ukaguzi wa Kimatibabu (Clinical Audit Logs)
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Rekodi kila wakati daktari au mtaalamu anapobadilisha dozi, sukari, au uzito wa mgonjwa.
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

          {/* Footer Save Area */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              {savedSuccess ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Mipangilio ya Ulinzi Imehifadhiwa Kikamilifu!
                </span>
              ) : (
                <span>Mabadiliko yatalindwa na kusimamiwa na Admin DISMAS POKELA.</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Ghairi
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-600 hover:to-emerald-600 text-white text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Hifadhi Mipangilio ya Ulinzi</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
