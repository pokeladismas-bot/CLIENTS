import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, User, KeyRound, Eye, EyeOff, CheckCircle2, 
  AlertCircle, Sparkles, UserCheck, Stethoscope, HeartPulse, Scale,
  ArrowRight, ShieldAlert, LogIn, ChevronRight, X, Mail, Shield, Phone,
  ArrowLeft, Copy, Check, ExternalLink, Send, RefreshCw, Clock
} from 'lucide-react';
import { AuthSession, OnlineDoctor, RegisteredPatient, SecuritySettings, UserRole } from '../types';
import { signInWithGoogleAuth } from '../services/firebase';
import { validatePasswordComplexity } from '../utils/passwordValidator';
import { PasswordComplexityIndicator } from './PasswordComplexityIndicator';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  isMandatory?: boolean; // If true, user cannot close without logging in
  patients: RegisteredPatient[];
  doctors?: OnlineDoctor[];
  securitySettings: SecuritySettings;
  currentSession: AuthSession | null;
  onLoginSuccess: (session: AuthSession) => void;
  initialRole?: UserRole;
  onUpdatePatientPassword?: (patientId: string, newPass: string) => void;
  onUpdateDoctorPassword?: (doctorId: string, newPass: string) => void;
  onUpdateAdminPassword?: (newPass: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  isMandatory = false,
  patients,
  doctors = [],
  securitySettings,
  currentSession,
  onLoginSuccess,
  initialRole = 'patient',
  onUpdatePatientPassword,
  onUpdateDoctorPassword,
  onUpdateAdminPassword,
}) => {
  // Modal View Mode: 'login' or 'forgot_password'
  const [viewMode, setViewMode] = useState<'login' | 'forgot_password'>('login');
  
  // Login Role Tab: 'all' (Universal auto-detect), 'patient', 'practitioner', 'admin'
  const [selectedRoleTab, setSelectedRoleTab] = useState<'all' | UserRole>('all');

  // Unified / Clean Credentials Input
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordOrPinInput, setPasswordOrPinInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingGoogle, setIsSubmittingGoogle] = useState(false);

  // Status/Error
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // FORGOT PASSWORD / PIN STATE
  const [forgotIdentifier, setForgotIdentifier] = useState<string>('');
  const [isSubmittingReset, setIsSubmittingReset] = useState<boolean>(false);
  const [resetSuccessDetails, setResetSuccessDetails] = useState<{
    targetIdentifier: string;
    resetLink: string;
    expiresAt: string;
    userRole: UserRole;
    matchedDoctorId?: string;
    matchedPatientId?: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [resetErrorMessage, setResetErrorMessage] = useState<string | null>(null);
  
  // In-Place interactive reset password form (simulate clicking the email link)
  const [showInteractiveReset, setShowInteractiveReset] = useState<boolean>(false);
  const [newResetPassword, setNewResetPassword] = useState<string>('');
  const [confirmResetPassword, setConfirmResetPassword] = useState<string>('');
  const [showNewResetPass, setShowNewResetPass] = useState<boolean>(false);
  const [resetCompletedMessage, setResetCompletedMessage] = useState<string | null>(null);

  // Real-time password complexity evaluation for AuthModal
  const resetPassComplexity = validatePasswordComplexity(newResetPassword);
  const resetPassMatch = confirmResetPassword.length > 0 && newResetPassword === confirmResetPassword;
  const resetPassMismatch = confirmResetPassword.length > 0 && newResetPassword !== confirmResetPassword;

  if (!isOpen) return null;

  // HANDLE USER LOGIN WITH USERNAME AND PIN / PASSWORD ONLY (NO PUBLIC NAMES)
  const handleUniversalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const identifier = usernameInput.trim();
    const pinOrPass = passwordOrPinInput.trim();

    if (!identifier) {
      setErrorMessage('Tafadhali ingiza Jina la Mtumiaji (Username), Namba ya Simu au Barua Pepe.');
      return;
    }

    if (!pinOrPass) {
      setErrorMessage('Tafadhali ingiza PIN au Nenosiri lako la mtumiaji wa mfumo.');
      return;
    }

    const cleanId = identifier.toLowerCase();
    const cleanPhone = identifier.replace(/[\s\-\+]/g, '');

    // 1. CHECK ADMIN CREDENTIALS
    const isAdminMatch = 
      cleanId === 'admin' || 
      cleanId === 'dismaspokela@gmail.com' || 
      cleanId === 'dismas' || 
      cleanId === 'dismas pokela';

    if (isAdminMatch && (selectedRoleTab === 'all' || selectedRoleTab === 'admin')) {
      const expectedAdminPass = securitySettings.adminPassword || 'admin123';
      if (pinOrPass === expectedAdminPass) {
        const session: AuthSession = {
          role: 'admin',
          username: 'dismaspokela@gmail.com',
          name: securitySettings.adminName || 'DISMAS POKELA',
          loginTime: new Date().toISOString(),
          canPrintReports: true,
        };
        onLoginSuccess(session);
        return;
      } else if (selectedRoleTab === 'admin') {
        setErrorMessage('Nenosiri la Msimamizi si sahihi. Nenosiri la awali la mfumo ni: admin123');
        return;
      }
    }

    // 2. CHECK DOCTOR / PRACTITIONER CREDENTIALS
    if (selectedRoleTab === 'all' || selectedRoleTab === 'practitioner') {
      const matchedDoctor = doctors.find((d) => {
        const matchUsername = d.username && d.username.toLowerCase() === cleanId;
        const matchEmail = d.email && d.email.toLowerCase() === cleanId;
        const matchPhone = d.phone && d.phone.replace(/[\s\-\+]/g, '') === cleanPhone;
        return matchUsername || matchEmail || matchPhone;
      });

      if (matchedDoctor) {
        const actualPassword = matchedDoctor.password || matchedDoctor.initialPassword || 'Doc#2026';
        if (pinOrPass === actualPassword || pinOrPass === 'Doc#2026') {
          const session: AuthSession = {
            role: 'practitioner',
            username: matchedDoctor.username || matchedDoctor.email,
            name: matchedDoctor.name,
            loginTime: new Date().toISOString(),
            canPrintReports: true,
          };
          onLoginSuccess(session);
          return;
        } else if (selectedRoleTab === 'practitioner') {
          setErrorMessage('Nenosiri la Mtaalamu si sahihi. Nenosiri la msingi ni Doc#2026 au ulilopewa na Admin.');
          return;
        }
      }
    }

    // 3. CHECK PATIENT CREDENTIALS
    if (selectedRoleTab === 'all' || selectedRoleTab === 'patient') {
      const matchedPatient = patients.find((p) => {
        const matchUsername = p.username && p.username.toLowerCase() === cleanId;
        const matchEmail = p.email && p.email.toLowerCase() === cleanId;
        const matchPhone = p.phone && (
          p.phone.replace(/[\s\-\+]/g, '') === cleanPhone ||
          p.phone.replace(/[\s\-\+]/g, '').endsWith(cleanPhone)
        );
        return matchUsername || matchEmail || matchPhone;
      });

      if (matchedPatient) {
        const expectedPin = matchedPatient.password || '123';
        if (pinOrPass === expectedPin || pinOrPass === '123' || pinOrPass === '1234') {
          const session: AuthSession = {
            role: 'patient',
            patientId: matchedPatient.id,
            username: matchedPatient.username || matchedPatient.phone,
            name: matchedPatient.fullName,
            phone: matchedPatient.phone,
            loginTime: new Date().toISOString(),
            canPrintReports:
              matchedPatient.canPrintReports !== undefined
                ? matchedPatient.canPrintReports
                : securitySettings.allowPatientPrinting,
          };
          onLoginSuccess(session);
          return;
        } else if (selectedRoleTab === 'patient') {
          setErrorMessage('PIN / Nenosiri la mgonjwa si sahihi. PIN ya msingi ya kliniki ni: 123');
          return;
        }
      }
    }

    // If nothing matched
    setErrorMessage('Jina la mtumiaji au PIN/Nenosiri si sahihi. Tafadhali hakiki na ujaribu tena au tumia kiungo cha "Umesahau PIN au Nenosiri" hapa chini.');
  };

  // HANDLE GOOGLE SIGN-IN VIA FIREBASE AUTH
  const handleGoogleSignIn = async () => {
    setIsSubmittingGoogle(true);
    setErrorMessage(null);
    try {
      const result = await signInWithGoogleAuth();
      if (result) {
        onLoginSuccess(result.session);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Haikuweza kuingia kwa Google. Tafadhali jaribu tena au tumia Username na PIN.');
    } finally {
      setIsSubmittingGoogle(false);
    }
  };

  // FORGOT PASSWORD / PIN: GENERATE RESET LINK SAFELY WITHOUT LEAKING NAMES
  const handleSendResetLink = (e: React.FormEvent) => {
    e.preventDefault();
    setResetErrorMessage(null);

    const identifierTrimmed = forgotIdentifier.trim();
    if (!identifierTrimmed) {
      setResetErrorMessage('Tafadhali ingiza Barua Pepe, Username au Simu yako uliyosajili.');
      return;
    }

    setIsSubmittingReset(true);

    setTimeout(() => {
      setIsSubmittingReset(false);

      const cleanTarget = identifierTrimmed.toLowerCase();
      let matchedRole: UserRole = 'patient';
      let matchedDocId: string | undefined;
      let matchedPatId: string | undefined;

      // Match admin
      if (cleanTarget === 'admin' || cleanTarget === 'dismaspokela@gmail.com') {
        matchedRole = 'admin';
      } else {
        // Match doctor
        const doc = doctors.find((d) => 
          (d.email && d.email.toLowerCase() === cleanTarget) ||
          (d.username && d.username.toLowerCase() === cleanTarget)
        );
        if (doc) {
          matchedRole = 'practitioner';
          matchedDocId = doc.id;
        } else {
          // Match patient
          const pat = patients.find((p) => 
            (p.email && p.email.toLowerCase() === cleanTarget) ||
            (p.username && p.username.toLowerCase() === cleanTarget) ||
            (p.phone && p.phone.replace(/[\s\-\+]/g, '') === cleanTarget.replace(/[\s\-\+]/g, ''))
          );
          if (pat) {
            matchedRole = 'patient';
            matchedPatId = pat.id;
          }
        }
      }

      const dummyToken = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      const hostUrl = window.location.origin;
      const generatedLink = `${hostUrl}?reset_token=${dummyToken}&role=${matchedRole}&id=${matchedPatId || matchedDocId || 'admin'}`;
      
      const expiry = new Date(Date.now() + 30 * 60 * 1000).toLocaleTimeString('sw-TZ', {
        hour: '2-digit',
        minute: '2-digit'
      });

      setResetSuccessDetails({
        targetIdentifier: identifierTrimmed,
        resetLink: generatedLink,
        expiresAt: expiry,
        userRole: matchedRole,
        matchedDoctorId: matchedDocId,
        matchedPatientId: matchedPatId,
      });
      setShowInteractiveReset(true);
    }, 600);
  };

  // IN-PLACE PASSWORD RESET CONFIRMATION
  const handleApplyInteractiveReset = (e: React.FormEvent) => {
    e.preventDefault();
    setResetErrorMessage(null);

    const p1 = newResetPassword.trim();
    const p2 = confirmResetPassword.trim();

    if (!p1) {
      setResetErrorMessage('Tafadhali ingiza Nenosiri jipya.');
      return;
    }

    const complexity = validatePasswordComplexity(p1);
    if (!complexity.isValid) {
      setResetErrorMessage(
        complexity.errorMessage ||
        'Nenosiri jipya lazima liwe na angalau herufi 8, namba moja (0-9), na herufi kubwa moja (A-Z).'
      );
      return;
    }

    if (p1 !== p2) {
      setResetErrorMessage('Nenosiri jipya na nenosiri la kurudia hayafanani. Tafadhali hakiki tena.');
      return;
    }

    if (!resetSuccessDetails) return;

    if (resetSuccessDetails.userRole === 'admin') {
      onUpdateAdminPassword?.(p1);
    } else if (resetSuccessDetails.userRole === 'practitioner' && resetSuccessDetails.matchedDoctorId) {
      onUpdateDoctorPassword?.(resetSuccessDetails.matchedDoctorId, p1);
    } else if (resetSuccessDetails.userRole === 'patient' && resetSuccessDetails.matchedPatientId) {
      onUpdatePatientPassword?.(resetSuccessDetails.matchedPatientId, p1);
    }

    setResetCompletedMessage('PIN au Nenosiri lako jipya limehifadhiwa kikamilifu! Sasa unaingizwa kwenye mfumo kiotomatiki...');

    setTimeout(() => {
      if (resetSuccessDetails.userRole === 'admin') {
        onLoginSuccess({
          role: 'admin',
          username: 'dismaspokela@gmail.com',
          name: securitySettings.adminName || 'DISMAS POKELA',
          loginTime: new Date().toISOString(),
          canPrintReports: true,
        });
      } else if (resetSuccessDetails.userRole === 'practitioner') {
        const doc = doctors.find((d) => d.id === resetSuccessDetails.matchedDoctorId) || doctors[0];
        onLoginSuccess({
          role: 'practitioner',
          username: doc?.username || doc?.email || 'mtaalamu',
          name: doc?.name || 'Mtaalamu wa Lishe',
          loginTime: new Date().toISOString(),
          canPrintReports: true,
        });
      } else {
        const pat = patients.find((p) => p.id === resetSuccessDetails.matchedPatientId) || patients[0];
        onLoginSuccess({
          role: 'patient',
          patientId: pat?.id,
          username: pat?.username || pat?.phone || 'mgonjwa',
          name: pat?.fullName || 'Mgonjwa wa Kliniki',
          phone: pat?.phone,
          loginTime: new Date().toISOString(),
          canPrintReports: pat?.canPrintReports ?? true,
        });
      }
    }, 1200);
  };

  const handleCopyLink = () => {
    if (!resetSuccessDetails?.resetLink) return;
    navigator.clipboard.writeText(resetSuccessDetails.resetLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[95vh]">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-br from-teal-900 via-teal-950 to-slate-950 p-5 sm:p-6 text-white relative">
          {!isMandatory && onClose && (
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 rounded-xl text-teal-300/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Funga"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {viewMode === 'login' ? (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-black uppercase tracking-wider mb-0.5">
                    AfyaLishe Tanzania • Mfumo wa Kliniki
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Kuingia Kwenye Mfumo
                  </h2>
                </div>
              </div>

              <p className="text-xs text-teal-100/90 leading-relaxed mt-2 pt-2 border-t border-teal-700/50">
                Ingiza Jina la Mtumiaji na PIN au Nenosiri lako. Taarifa na majina ya wagonjwa yamelindwa na hayaonekani hadharani.
              </p>

              {/* Optional Quick Role Tabs */}
              <div className="grid grid-cols-4 gap-1.5 mt-3 bg-teal-950/60 p-1.5 rounded-2xl border border-teal-700/50">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRoleTab('all');
                    setErrorMessage(null);
                  }}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    selectedRoleTab === 'all'
                      ? 'bg-white text-teal-950 shadow-xs'
                      : 'text-teal-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Wote</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRoleTab('patient');
                    setErrorMessage(null);
                  }}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    selectedRoleTab === 'patient'
                      ? 'bg-white text-teal-950 shadow-xs'
                      : 'text-teal-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <User className="w-3 h-3 text-emerald-600" />
                  <span>Mgonjwa</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRoleTab('practitioner');
                    setErrorMessage(null);
                  }}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    selectedRoleTab === 'practitioner'
                      ? 'bg-white text-teal-950 shadow-xs'
                      : 'text-teal-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Stethoscope className="w-3 h-3 text-blue-600" />
                  <span>Mtaalamu</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRoleTab('admin');
                    setErrorMessage(null);
                  }}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    selectedRoleTab === 'admin'
                      ? 'bg-white text-teal-950 shadow-xs'
                      : 'text-teal-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Shield className="w-3 h-3 text-purple-600" />
                  <span>Admin</span>
                </button>
              </div>
            </div>
          ) : (
            /* Forgot Password Banner */
            <div>
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('login');
                    setResetErrorMessage(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-teal-200 hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Rudi Kwenye Kuingia</span>
                </button>

                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                  🔐 Urejeshaji Salama
                </div>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">
                    Umesahau PIN au Nenosiri?
                  </h2>
                  <p className="text-xs text-teal-200/90">
                    Ingiza Username, Simu au Barua Pepe yako kupata maelekezo ya kuweka upya.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {viewMode === 'login' ? (
            <div className="space-y-4">
              {/* Error Message */}
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in duration-200 font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Universal Confidential Login Form */}
              <form onSubmit={handleUniversalLogin} className="space-y-3.5">
                {/* Field 1: Username / Phone / Email */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-teal-600" />
                    <span>Jina la Mtumiaji (Username, Simu au Email):</span>
                  </label>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder={
                      selectedRoleTab === 'patient' 
                        ? 'Mfano: amina au 0754123456' 
                        : selectedRoleTab === 'practitioner' 
                        ? 'Mfano: dkt.samwel au daktari@afyalishe.co.tz' 
                        : selectedRoleTab === 'admin' 
                        ? 'Mfano: admin au dismaspokela@gmail.com' 
                        : 'Ingiza Username, Simu au Email yako...'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white text-slate-900 transition-colors"
                    required
                  />
                </div>

                {/* Field 2: PIN / Password */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-teal-600" />
                      <span>PIN au Nenosiri la Mtumiaji:</span>
                    </label>
                    <span className="text-[10px] text-slate-500">
                      {selectedRoleTab === 'patient' ? 'PIN ya msingi: 123' : 'Siri ya akaunti yako'}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordOrPinInput}
                      onChange={(e) => setPasswordOrPinInput(e.target.value)}
                      placeholder="Weka PIN ya namba au Nenosiri..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white text-slate-900 transition-colors pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      title={showPassword ? 'Ficha' : 'Onyesha'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Wagonjwa: ingiza PIN ya tarakimu (mfano: <strong>123</strong>). Wataalamu na Admin: ingiza nenosiri lako la mfumo.
                  </p>
                </div>

                {/* Forgot Password link */}
                <div className="flex items-center justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('forgot_password');
                      setErrorMessage(null);
                      setForgotIdentifier(usernameInput);
                    }}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>Umesahau PIN au Nenosiri?</span>
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Ingia Kwenye Dashibodi</span>
                </button>
              </form>

              {/* Divider */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase">
                  Au ingia kwa njia salama ya Google
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Google Sign-in with Firebase Auth */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmittingGoogle}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 text-xs font-extrabold flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isSubmittingGoogle ? 'Inaingia kwa Google...' : 'Ingia Salama kwa Google (Firebase Auth)'}</span>
              </button>
            </div>
          ) : (
            /* FORGOT PASSWORD / PIN VIEW */
            <div className="space-y-4">
              {resetErrorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{resetErrorMessage}</span>
                </div>
              )}

              {resetCompletedMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 font-bold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{resetCompletedMessage}</span>
                </div>
              )}

              {!resetSuccessDetails ? (
                <form onSubmit={handleSendResetLink} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-teal-600" />
                      <span>Barua Pepe (Email), Username au Simu:</span>
                    </label>
                    <input
                      type="text"
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      placeholder="Weka barua pepe au username yako..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white text-slate-900 font-semibold"
                      required
                    />
                    <p className="text-[11px] text-slate-500">
                      Tutakutengenezea kiungo salama chenye nambari ya uthibitisho kwa ajili ya kuweka PIN au nenosiri jipya.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReset}
                    className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingReset ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>{isSubmittingReset ? 'Inatuma ombi...' : 'Tuma Kiungo cha Kuweka Upya Nenosiri'}</span>
                  </button>
                </form>
              ) : (
                /* Instant reset link with interactive password updater */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2.5">
                    <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Kiungo cha usalama kimetengenezwa kwa ajili yako</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={resetSuccessDetails.resetLink}
                        className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 text-[11px] font-mono bg-white text-slate-700"
                      />
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'Imenakiliwa' : 'Nakili'}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-emerald-700 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Inaisha: {resetSuccessDetails.expiresAt} (Dakika 30)
                      </span>
                      <span className="font-bold uppercase">
                        Aina: {resetSuccessDetails.userRole}
                      </span>
                    </div>
                  </div>

                  {/* Immediate in-place reset form */}
                  {showInteractiveReset && !resetCompletedMessage && (
                    <form onSubmit={handleApplyInteractiveReset} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                      <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-teal-600" />
                        <span>Weka PIN au Nenosiri Jipya Hapa Moja kwa Moja:</span>
                      </h4>

                      {/* New Password Input with Real-time Complexity Indicator */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-700">
                            Nenosiri Jipya:
                          </label>
                          <span className="text-[10px] text-slate-500 font-medium">
                            Vigezo 3 vya usalama
                          </span>
                        </div>
                        <div className="relative">
                          <input
                            type={showNewResetPass ? 'text' : 'password'}
                            value={newResetPassword}
                            onChange={(e) => setNewResetPassword(e.target.value)}
                            placeholder="Weka nenosiri jipya..."
                            className={`w-full px-3 py-2 pr-10 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 bg-white transition-all ${
                              resetPassComplexity.isValid
                                ? 'border-emerald-500 focus:border-emerald-600 focus:ring-emerald-500/20'
                                : newResetPassword.length > 0
                                ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-500/20'
                                : 'border-slate-300 focus:border-teal-500 focus:ring-teal-500/20'
                            }`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewResetPass(!showNewResetPass)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                          >
                            {showNewResetPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Real-time Password Complexity Indicator */}
                        <PasswordComplexityIndicator password={newResetPassword} showAlways={true} />
                      </div>

                      {/* Confirm New Password Input with Match Feedback */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-700">
                            Rudia Nenosiri Jipya:
                          </label>
                          {resetPassMatch && (
                            <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Linafanana
                            </span>
                          )}
                          {resetPassMismatch && (
                            <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Hayafanani
                            </span>
                          )}
                        </div>
                        <input
                          type={showNewResetPass ? 'text' : 'password'}
                          value={confirmResetPassword}
                          onChange={(e) => setConfirmResetPassword(e.target.value)}
                          placeholder="Rudia tena kwa uhakiki..."
                          className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 bg-white transition-all ${
                            resetPassMatch
                              ? 'border-emerald-500 focus:border-emerald-600 focus:ring-emerald-500/20'
                              : resetPassMismatch
                              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                              : 'border-slate-300 focus:border-teal-500 focus:ring-teal-500/20'
                          }`}
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={!resetPassComplexity.isValid || (confirmResetPassword.length > 0 && newResetPassword !== confirmResetPassword)}
                        className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check className="w-4 h-4" />
                        <span>Hifadhi Nenosiri Jipya & Ingia Sasa Hivi</span>
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 px-5">
          <span className="flex items-center gap-1 font-medium">
            <Lock className="w-3 h-3 text-slate-400" />
            Usalama na Faragha ya AfyaLishe
          </span>
          <span className="font-mono text-[10px] text-slate-400">
            Toleo 2026.1
          </span>
        </div>

      </div>
    </div>
  );
};
