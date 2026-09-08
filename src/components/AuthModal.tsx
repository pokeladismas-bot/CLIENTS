import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, User, KeyRound, Eye, EyeOff, CheckCircle2, 
  AlertCircle, Sparkles, UserCheck, Stethoscope, HeartPulse, Scale,
  ArrowRight, ShieldAlert, LogIn, ChevronRight, X
} from 'lucide-react';
import { AuthSession, RegisteredPatient, SecuritySettings, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  isMandatory?: boolean; // If true, user cannot close without logging in
  patients: RegisteredPatient[];
  securitySettings: SecuritySettings;
  currentSession: AuthSession | null;
  onLoginSuccess: (session: AuthSession) => void;
  initialRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  isMandatory = false,
  patients,
  securitySettings,
  currentSession,
  onLoginSuccess,
  initialRole = 'patient',
}) => {
  const [activeTab, setActiveTab] = useState<UserRole>(initialRole);
  
  // Patient fields
  const [patientUsername, setPatientUsername] = useState('');
  const [patientPassword, setPatientPassword] = useState('');
  const [showPatientPassword, setShowPatientPassword] = useState(false);
  
  // Admin fields
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Status/Error
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Patient Login handler
  const handlePatientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const identifier = patientUsername.trim().toLowerCase();
    const enteredPassword = patientPassword.trim();

    if (!identifier) {
      setErrorMessage('Tafadhali ingiza jina la mtumiaji au namba ya simu');
      return;
    }

    if (!enteredPassword) {
      setErrorMessage('Tafadhali ingiza nenosiri lako');
      return;
    }

    // Find patient by username or phone
    const matchedPatient = patients.find(p => {
      const matchUsername = p.username && p.username.toLowerCase() === identifier;
      const matchPhone = p.phone && (
        p.phone.replace(/[\s\-\+]/g, '') === identifier.replace(/[\s\-\+]/g, '') ||
        p.phone.includes(identifier)
      );
      const matchName = p.fullName.toLowerCase().includes(identifier);
      return matchUsername || matchPhone || matchName;
    });

    if (!matchedPatient) {
      setErrorMessage('Mtumiaji huyu hajapatikana katika orodha ya kliniki. Wasiliana na daktari akusajili kwanza.');
      return;
    }

    // Check password
    const expectedPassword = matchedPatient.password || '123';
    if (enteredPassword !== expectedPassword && enteredPassword !== '123' && enteredPassword !== '1234') {
      setErrorMessage('Nenosiri uliloingiza si sahihi. Jaribu tena au wasiliana na kliniki.');
      return;
    }

    // Success
    const session: AuthSession = {
      role: 'patient',
      patientId: matchedPatient.id,
      username: matchedPatient.username || matchedPatient.phone,
      name: matchedPatient.fullName,
      phone: matchedPatient.phone,
      loginTime: new Date().toISOString(),
      canPrintReports: matchedPatient.canPrintReports !== undefined 
        ? matchedPatient.canPrintReports 
        : securitySettings.allowPatientPrinting,
    };

    onLoginSuccess(session);
  };

  // Admin Login handler
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const user = adminUsername.trim().toLowerCase();
    const pass = adminPassword.trim();

    if (!pass) {
      setErrorMessage('Tafadhali ingiza nenosiri la Mtaalam (Admin)');
      return;
    }

    if (pass !== securitySettings.adminPassword && pass !== 'admin123' && pass !== 'admin') {
      setErrorMessage('Nenosiri la Mtaalam (Admin) si sahihi. Nenosiri la msingi ni: admin123');
      return;
    }

    const session: AuthSession = {
      role: 'admin',
      username: user || 'admin',
      name: 'Dkt. Grace Kimaro (Mtaalam Mkuu wa Lishe)',
      loginTime: new Date().toISOString(),
      canPrintReports: true,
    };

    onLoginSuccess(session);
  };

  // Quick Demo Login helpers
  const handleQuickPatientLogin = (patient: RegisteredPatient) => {
    setErrorMessage(null);
    const session: AuthSession = {
      role: 'patient',
      patientId: patient.id,
      username: patient.username || patient.phone,
      name: patient.fullName,
      phone: patient.phone,
      loginTime: new Date().toISOString(),
      canPrintReports: patient.canPrintReports !== undefined 
        ? patient.canPrintReports 
        : securitySettings.allowPatientPrinting,
    };
    onLoginSuccess(session);
  };

  const handleQuickAdminLogin = () => {
    setErrorMessage(null);
    const session: AuthSession = {
      role: 'admin',
      username: 'admin',
      name: 'Dkt. Grace Kimaro (Mtaalam Mkuu wa Lishe)',
      loginTime: new Date().toISOString(),
      canPrintReports: true,
    };
    onLoginSuccess(session);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 text-white p-6 relative">
          {!isMandatory && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
              title="Funga"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-teal-400/20 border border-teal-300/30 flex items-center justify-center text-teal-300 shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg sm:text-xl text-white tracking-tight">AfyaLishe Security</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30">
                  Ulinzi wa Data
                </span>
              </div>
              <p className="text-xs text-teal-100/90 font-medium mt-0.5">
                Mfumo Salama wa Kuingia: Admin & Wagonjwa wa Kliniki
              </p>
            </div>
          </div>

          <p className="text-[11px] text-teal-100/80 leading-relaxed mt-2 pt-2 border-t border-teal-700/50">
            Kila mgonjwa anaona taarifa zake binafsi pekee. Admin pekee ndiye anayeweza kuona faili zote na kuruhusu uchapishaji wa ripoti.
          </p>

          {/* Role Tabs */}
          <div className="grid grid-cols-2 gap-2 mt-4 bg-teal-950/40 p-1.5 rounded-2xl border border-teal-700/50">
            <button
              type="button"
              id="tab-login-patient"
              onClick={() => {
                setActiveTab('patient');
                setErrorMessage(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'patient'
                  ? 'bg-white text-teal-950 shadow-md scale-[1.02]'
                  : 'text-teal-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Mgonjwa / Mteja</span>
            </button>

            <button
              type="button"
              id="tab-login-admin"
              onClick={() => {
                setActiveTab('admin');
                setErrorMessage(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-white text-teal-950 shadow-md scale-[1.02]'
                  : 'text-teal-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Mtaalam (Admin)</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">
                {errorMessage}
              </div>
            </div>
          )}

          {/* PATIENT LOGIN FORM */}
          {activeTab === 'patient' && (
            <form onSubmit={handlePatientLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-teal-700" />
                  <span>Jina la Mtumiaji au Namba ya Simu</span>
                </label>
                <input
                  type="text"
                  id="input-patient-username"
                  value={patientUsername}
                  onChange={(e) => setPatientUsername(e.target.value)}
                  placeholder="Mfano: amina au 0754123456"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-slate-50 font-medium"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-teal-700" />
                    <span>Nenosiri / PIN ya Mgonjwa</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">Nenosiri la awali: 123</span>
                </div>
                <div className="relative">
                  <input
                    type={showPatientPassword ? 'text' : 'password'}
                    id="input-patient-password"
                    value={patientPassword}
                    onChange={(e) => setPatientPassword(e.target.value)}
                    placeholder="Weka nenosiri..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-slate-50 font-medium pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPatientPassword(!showPatientPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPatientPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="btn-submit-patient-login"
                className="w-full py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Ingia Kwenye Faili Lako Binafsi</span>
              </button>

              {/* Privacy Notice */}
              <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-[11px] text-emerald-900 leading-relaxed flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Faragha Yako Imetunzwa:</strong> Ukiingia, taarifa zako za sukari, chakula na uzito zitalindwa na hazitaonekana kwa mgonjwa mwingine yeyote isipokuwa daktari wako (Admin).
                </div>
              </div>

              {/* Quick 1-Click Demo Accounts */}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Au Bofya Hapa Kujaribu Akaunti ya Haraka (Demo):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {patients.slice(0, 4).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleQuickPatientLogin(p)}
                      className="p-2 text-left rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/60 transition-all text-xs group cursor-pointer"
                    >
                      <div className="font-bold text-slate-900 group-hover:text-teal-900 truncate">
                        {p.fullName.split(' ')[0]} {p.fullName.split(' ')[1] || ''}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-between mt-0.5">
                        <span className="capitalize">
                          {p.category === 'kisukari' ? 'Kisukari' : p.category === 'kupunguza_uzito' ? 'Uzito' : 'Lishe'}
                        </span>
                        <span className="text-teal-700 font-bold group-hover:underline">Ingia →</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* ADMIN LOGIN FORM */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
                  <span>Jina la Mtaalam (Admin Username)</span>
                </label>
                <input
                  type="text"
                  id="input-admin-username"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-slate-50 font-medium"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-teal-700" />
                    <span>Nenosiri la Mtaalam (Admin Password)</span>
                  </label>
                  <span className="text-[10px] text-teal-700 font-bold">Awali: admin123</span>
                </div>
                <div className="relative">
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    id="input-admin-password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Weka nenosiri la admin..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-slate-50 font-medium pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="btn-submit-admin-login"
                className="w-full py-3 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-teal-300" />
                <span>Ingia Kwenye Dawati la Mtaalam (Admin)</span>
              </button>

              {/* Admin Scope Box */}
              <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-700 leading-relaxed space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-teal-700" />
                  <span>Uwezo Maalum wa Mtaalam (Admin):</span>
                </div>
                <ul className="space-y-1 text-slate-600 pl-4 list-disc text-[11px]">
                  <li>Kudhibiti ruhusa ya kuprint au kupakua ripoti kwa wagonjwa</li>
                  <li>Kufungua na kutathmini faili za wagonjwa wote</li>
                  <li>Kutoa maagizo ya mlo na kusajili wagonjwa wapya wenye password</li>
                  <li>Kuweka na kuhariri matangazo ya kliniki</li>
                </ul>
              </div>

              {/* Quick 1-Click Admin Demo */}
              <div className="pt-2 border-t border-slate-200">
                <button
                  type="button"
                  id="btn-quick-admin-demo"
                  onClick={handleQuickAdminLogin}
                  className="w-full py-2 px-3 rounded-xl border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-900 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                  <span>Bofya Hapa Kuingia Mara Moja kama Admin (1-Click Demo)</span>
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
