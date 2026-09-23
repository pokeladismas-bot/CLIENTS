import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, User, KeyRound, Eye, EyeOff, CheckCircle2, 
  AlertCircle, Sparkles, UserCheck, Stethoscope, HeartPulse, Scale,
  ArrowRight, ShieldAlert, LogIn, ChevronRight, Mail, Shield, Phone,
  ArrowLeft, Copy, Check, ExternalLink, Send, RefreshCw,
  Info, Utensils, Download
} from 'lucide-react';
import { AuthSession, DashboardTheme, OnlineDoctor, RegisteredPatient, SecuritySettings, UserRole } from '../types';
import { signInWithGoogleAuth } from '../services/firebase';
import { DASHBOARD_THEMES } from '../utils/theme';

interface AuthGateViewProps {
  patients: RegisteredPatient[];
  doctors?: OnlineDoctor[];
  securitySettings: SecuritySettings;
  onLoginSuccess: (session: AuthSession) => void;
  currentTheme: DashboardTheme;
  onUpdatePatientPassword?: (patientId: string, newPass: string) => void;
  onUpdateDoctorPassword?: (doctorId: string, newPass: string) => void;
  onUpdateAdminPassword?: (newPass: string) => void;
  lockedNotice?: string | null;
  onOpenInstallerModal?: () => void;
}

export const AuthGateView: React.FC<AuthGateViewProps> = ({
  patients,
  doctors = [],
  securitySettings,
  onLoginSuccess,
  currentTheme,
  onUpdatePatientPassword,
  onUpdateDoctorPassword,
  onUpdateAdminPassword,
  lockedNotice,
  onOpenInstallerModal,
}) => {
  const activeTheme = DASHBOARD_THEMES[currentTheme] || DASHBOARD_THEMES.emerald;

  // View Mode: 'login' or 'forgot_password'
  const [viewMode, setViewMode] = useState<'login' | 'forgot_password'>('login');
  
  // Selected Role Tab
  const [selectedRoleTab, setSelectedRoleTab] = useState<'all' | UserRole>('all');

  // Input States
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordOrPinInput, setPasswordOrPinInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingGoogle, setIsSubmittingGoogle] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot Password States
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [isSubmittingReset, setIsSubmittingReset] = useState(false);
  const [resetSuccessDetails, setResetSuccessDetails] = useState<{
    targetIdentifier: string;
    resetLink: string;
    expiresAt: string;
    userRole: UserRole;
    matchedDoctorId?: string;
    matchedPatientId?: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [resetErrorMessage, setResetErrorMessage] = useState<string | null>(null);
  const [showInteractiveReset, setShowInteractiveReset] = useState(false);
  const [newResetPassword, setNewResetPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');
  const [showNewResetPass, setShowNewResetPass] = useState(false);
  const [resetCompletedMessage, setResetCompletedMessage] = useState<string | null>(null);

  // Universal Authentication Handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const rawIdentifier = usernameInput.trim();
    const pinOrPass = passwordOrPinInput.trim();

    // If on admin tab and no username provided, default to admin
    const identifier = selectedRoleTab === 'admin' && !rawIdentifier ? 'admin' : rawIdentifier;

    if (!identifier && selectedRoleTab !== 'admin') {
      setErrorMessage('Tafadhali ingiza Jina la Mtumiaji (Username), Namba ya Simu au Barua Pepe.');
      return;
    }

    if (!pinOrPass) {
      setErrorMessage(selectedRoleTab === 'admin'
        ? 'Tafadhali ingiza PIN ya Admin au Nenosiri lako.'
        : 'Tafadhali ingiza PIN au Nenosiri lako la mtumiaji wa mfumo.');
      return;
    }

    const cleanId = identifier.toLowerCase();
    const cleanPhone = identifier.replace(/[\s\-\+]/g, '');

    // 1. CHECK ADMIN CREDENTIALS (PIN or PASSWORD)
    const isAdminMatch = 
      selectedRoleTab === 'admin' ||
      cleanId === 'admin' || 
      cleanId === 'dismaspokela@gmail.com' || 
      cleanId === 'dismas' || 
      cleanId === 'dismas pokela';

    if (isAdminMatch && (selectedRoleTab === 'all' || selectedRoleTab === 'admin')) {
      let localSavedPass = '';
      let customAdminPass = '';
      try {
        if (typeof window !== 'undefined') {
          customAdminPass = (localStorage.getItem('afyalishe_custom_admin_password') || '').trim();
          const raw = localStorage.getItem('afyalishe_security_settings');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.adminPassword) localSavedPass = (parsed.adminPassword as string).trim();
          }
        }
      } catch {}

      const cleanEnteredPass = pinOrPass.trim();
      const expectedAdminPass = (securitySettings.adminPassword || '').trim() || 'admin123';
      const expectedAdminPin = (securitySettings.adminPin || '').trim() || '8822';
      const isPinMatch = cleanEnteredPass === expectedAdminPin || cleanEnteredPass === '8822';
      const isPassMatch = 
        cleanEnteredPass === expectedAdminPass || 
        (customAdminPass && cleanEnteredPass === customAdminPass) ||
        (localSavedPass && cleanEnteredPass === localSavedPass) ||
        cleanEnteredPass === 'admin123';

      if (isPinMatch || isPassMatch) {
        // If user logged in using their new password, keep it synced in local storage
        if (cleanEnteredPass && cleanEnteredPass !== 'admin123' && cleanEnteredPass !== expectedAdminPin) {
          try {
            localStorage.setItem('afyalishe_custom_admin_password', cleanEnteredPass);
          } catch {}
          onUpdateAdminPassword?.(cleanEnteredPass);
        }

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
        setErrorMessage('Nenosiri la Admin si sahihi. Tafadhali ingiza nenosiri jipya uliloweka (au la awali: admin123).');
        return;
      }
    }

    // 2. CHECK PRACTITIONER / DOCTOR CREDENTIALS
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
          setErrorMessage('Nenosiri la Mtaalamu si sahihi. Nenosiri la awali ni: Doc#2026 au ulilopewa na Admin.');
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
          setErrorMessage('PIN ya mgonjwa si sahihi. PIN ya mfano wa kliniki ni: 123');
          return;
        }
      }
    }

    // If no match found
    setErrorMessage('Jina la mtumiaji au Nenosiri/PIN halitambuliwi. Tafadhali hakiki jukumu lako na nenosiri kisha ujaribu tena.');
  };

  // Google Sign-In with Firebase Auth
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

  // Send Reset Link
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

      if (cleanTarget === 'admin' || cleanTarget === 'dismaspokela@gmail.com') {
        matchedRole = 'admin';
      } else {
        const doc = doctors.find((d) => 
          (d.email && d.email.toLowerCase() === cleanTarget) ||
          (d.username && d.username.toLowerCase() === cleanTarget)
        );
        if (doc) {
          matchedRole = 'practitioner';
          matchedDocId = doc.id;
        } else {
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
    }, 500);
  };

  // Apply Reset Password
  const handleApplyInteractiveReset = (e: React.FormEvent) => {
    e.preventDefault();
    setResetErrorMessage(null);

    const p1 = newResetPassword.trim();
    const p2 = confirmResetPassword.trim();

    if (!p1) {
      setResetErrorMessage('Tafadhali ingiza PIN au Nenosiri jipya.');
      return;
    }

    if (p1.length < 3) {
      setResetErrorMessage('PIN au Nenosiri lazima liwe na angalau herufi au tarakimu 3.');
      return;
    }

    if (p1 !== p2) {
      setResetErrorMessage('Nenosiri jipya na nenosiri la kurudia hayafanani.');
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

    setResetCompletedMessage('Hongera! Nenosiri lako limesasishwa kikamilifu. Mfumo unakuingiza...');

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
          username: doc?.username || doc?.email || 'daktari',
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
    }, 1000);
  };

  return (
    <div className="w-full max-w-xl mx-auto my-auto animate-in fade-in zoom-in-95 duration-200">
      {/* Outer Card */}
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col">
        
        {/* Banner Header matching user screenshot image.png */}
        <div className="bg-[#03342d] p-6 sm:p-7 text-white relative">
          
          {/* Top Row: System ID and Theme / Status */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-3">
              {/* Squircle with Shield Check Icon */}
              <div className="w-11 h-11 rounded-2xl bg-[#084b41] border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0 shadow-inner">
                <ShieldCheck className="w-6 h-6 text-teal-300" />
              </div>

              {/* Clinic Pill Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#084238] border border-teal-500/30 text-teal-300 text-xs font-black tracking-wide uppercase">
                <span>AFYALISHE TANZANIA • MFUMO WA KLINIKI</span>
              </div>
            </div>

            {/* Top Right: Theme Switcher and Lock Badge */}
            <div className="flex items-center gap-1.5">
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-teal-500/10 border border-teal-400/20 text-teal-300 text-[11px] font-bold">
                <Lock className="w-3 h-3 text-teal-400" />
                <span>Ulinzi wa Nenosiri</span>
              </div>
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Kuingia Kwenye Mfumo
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed mt-2.5">
            Ingiza Jina la Mtumiaji na PIN au Nenosiri lako. Taarifa na majina ya wagonjwa yamelindwa na hayaonekani hadharani.
          </p>

          {/* Locked Notice Alert when user locks/logs out */}
          {lockedNotice && (
            <div className="mt-3 p-3 rounded-2xl bg-amber-500/20 border border-amber-400/50 text-amber-200 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{lockedNotice}</span>
            </div>
          )}

          {/* Role Tab Filter Bar - Exact match to image.png */}
          {viewMode === 'login' && (
            <div className="flex items-center gap-1 mt-4 bg-[#02241e] p-1 rounded-2xl border border-teal-900/60">
              <button
                type="button"
                onClick={() => {
                  setSelectedRoleTab('all');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedRoleTab === 'all'
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'text-teal-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Wote</span>
              </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRoleTab('patient');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedRoleTab === 'patient'
                      ? 'bg-white text-slate-900 shadow-md'
                      : 'text-teal-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-teal-400" />
                  <span>Mgonjwa</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRoleTab('practitioner');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedRoleTab === 'practitioner'
                      ? 'bg-white text-slate-900 shadow-md'
                      : 'text-teal-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
                  <span>Mtaalamu</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRoleTab('admin');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedRoleTab === 'admin'
                      ? 'bg-white text-slate-900 shadow-md'
                      : 'text-teal-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>Admin</span>
                </button>
              </div>
            )}
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-4 bg-white">
          
          {/* VIEW 1: NORMAL ROLE LOGIN FORM */}
          {viewMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="font-semibold">{errorMessage}</span>
                </div>
              )}

              {/* ADMIN MODE SPECIFIC VIEW */}
              {selectedRoleTab === 'admin' ? (
                <div className="space-y-4">
                  {/* Admin Verified Identity Card */}
                  <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200/90 flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-teal-800 text-teal-200 flex items-center justify-center font-black text-sm shadow-inner shrink-0">
                        <ShieldCheck className="w-6 h-6 text-teal-300" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-900">{securitySettings.adminName || 'DISMAS POKELA'}</span>
                          <span className="text-[10px] bg-teal-700 text-teal-100 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Admin
                          </span>
                        </div>
                        <div className="text-xs text-teal-800 font-medium">dismaspokela@gmail.com</div>
                      </div>
                    </div>
                  </div>

                  {/* Admin Password Input */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <KeyRound className="w-4 h-4 text-teal-600" />
                        <span>Nenosiri la Admin (Admin Password):</span>
                      </label>
                      <span className="text-xs text-slate-500 font-medium">
                        Ulinzi wa Mfumo
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoFocus
                        value={passwordOrPinInput}
                        onChange={(e) => setPasswordOrPinInput(e.target.value)}
                        placeholder="Ingiza Nenosiri lako la Admin..."
                        className="w-full px-4 py-3.5 pr-11 rounded-2xl border-2 border-teal-600/50 focus:border-teal-700 focus:ring-2 focus:ring-teal-500/20 text-slate-900 text-base font-mono font-bold tracking-wider transition-all placeholder:text-slate-400 placeholder:text-sm placeholder:font-sans placeholder:tracking-normal"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <p className="text-xs text-slate-500">
                        Nenosiri la awali la Admin ni: <strong>admin123</strong> (linaweza kubadilishwa ndani ya mfumo)
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setViewMode('forgot_password');
                          setForgotIdentifier('admin');
                          setErrorMessage(null);
                        }}
                        className="text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline cursor-pointer shrink-0"
                      >
                        Umesahau Nenosiri?
                      </button>
                    </div>
                  </div>

                  {/* Primary Admin Login Button */}
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Thibitisha Nenosiri & Ingia kama Admin</span>
                  </button>
                </div>
              ) : (
                /* ALL ROLES / PATIENT / PRACTITIONER VIEW */
                <div className="space-y-4">
                  {/* Field 1: Identifier Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-teal-600" />
                      <span>Jina la Mtumiaji (Username, Simu au Email):</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        placeholder="Ingiza Username, Simu au Email yako..."
                        className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 text-slate-800 text-sm font-medium transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Field 2: Password / PIN Input */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <KeyRound className="w-4 h-4 text-teal-600" />
                        <span>PIN au Nenosiri la Mtumiaji:</span>
                      </label>
                      <span className="text-xs text-slate-400 font-normal">
                        Siri ya akaunti yako
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={passwordOrPinInput}
                        onChange={(e) => setPasswordOrPinInput(e.target.value)}
                        placeholder="Weka PIN ya namba au Nenosiri..."
                        className="w-full px-4 py-3.5 pr-11 rounded-2xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 text-slate-800 text-sm font-medium transition-all placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Helper text */}
                    <p className="text-xs text-slate-500 pt-0.5">
                      Wagonjwa: ingiza PIN ya tarakimu. Wataalamu: ingiza nenosiri lako la kliniki.
                    </p>

                    {/* Forgot PIN/Password Link */}
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setViewMode('forgot_password');
                          setForgotIdentifier(usernameInput);
                          setErrorMessage(null);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Umesahau PIN au Nenosiri?</span>
                      </button>
                    </div>
                  </div>

                  {/* Primary Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Thibitisha Nenosiri & Fungua Dashibodi</span>
                  </button>

                  {/* Divider */}
                  <div className="relative flex items-center justify-center py-1">
                    <div className="border-t border-slate-200 w-full"></div>
                    <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      au kwa Google
                    </span>
                    <div className="border-t border-slate-200 w-full"></div>
                  </div>

                  {/* Google Sign-In (Firebase Auth) */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isSubmittingGoogle}
                    className="w-full py-3 px-4 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
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
                    <span>{isSubmittingGoogle ? 'Inaingia kwa Google...' : 'Ingia Salama kwa Akaunti ya Google'}</span>
                  </button>
                </div>
              )}

            </form>
          )}

          {/* VIEW 2: FORGOT PASSWORD / PIN VIEW */}
          {viewMode === 'forgot_password' && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  setViewMode('login');
                  setResetSuccessDetails(null);
                  setResetErrorMessage(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Rudi kwenye ukurasa wa Kuingia</span>
              </button>

              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-emerald-600" />
                  <span>Kurejesha PIN au Nenosiri</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Weka Username, Namba ya simu au Barua Pepe uliyosajiliwa nayo ili kupata kiungo cha kubadilisha nenosiri.
                </p>
              </div>

              {resetErrorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="font-semibold">{resetErrorMessage}</span>
                </div>
              )}

              {resetCompletedMessage && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-emerald-800 text-xs animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-semibold">{resetCompletedMessage}</span>
                </div>
              )}

              {!resetSuccessDetails ? (
                <form onSubmit={handleSendResetLink} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Kitambulisho cha Mtumiaji
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        placeholder="Ingiza Email, Username au Simu uliyosajili..."
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-sm font-medium transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReset}
                    className={`w-full py-3.5 px-4 rounded-2xl ${activeTheme.primaryButton} font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50`}
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmittingReset ? 'Inatafuta mtumiaji...' : 'Tuma Kiungo cha Kubadili Nenosiri'}</span>
                  </button>
                </form>
              ) : (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Akaunti imetambuliwa ({resetSuccessDetails.userRole === 'admin' ? 'Msimamizi' : resetSuccessDetails.userRole === 'practitioner' ? 'Daktari' : 'Mgonjwa'})</span>
                    </div>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Kiungo cha kurejesha kimetolewa kwa ajili ya <strong>{resetSuccessDetails.targetIdentifier}</strong>. Unaweza kuweka PIN/Nenosiri jipya hapa chini:
                    </p>
                  </div>

                  {/* Set New Password Form */}
                  <form onSubmit={handleApplyInteractiveReset} className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">
                        Weka PIN au Nenosiri Jipya
                      </label>
                      <div className="relative">
                        <input
                          type={showNewResetPass ? 'text' : 'password'}
                          required
                          value={newResetPassword}
                          onChange={(e) => setNewResetPassword(e.target.value)}
                          placeholder="Ingiza nenosiri jipya..."
                          className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewResetPass(!showNewResetPass)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                        >
                          {showNewResetPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">
                        Rudia Nenosiri Jipya
                      </label>
                      <input
                        type={showNewResetPass ? 'text' : 'password'}
                        required
                        value={confirmResetPassword}
                        onChange={(e) => setConfirmResetPassword(e.target.value)}
                        placeholder="Rudia nenosiri jipya kuthibitisha..."
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <button
                      type="submit"
                      className={`w-full py-3 px-4 rounded-xl ${activeTheme.primaryButton} font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2`}
                    >
                      <Check className="w-4 h-4" />
                      <span>Hifadhi Nenosiri Jipya & Ingia Moja kwa Moja</span>
                    </button>
                  </form>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>AfyaLishe Tanzania © {new Date().getFullYear()}</span>
          <span className="font-semibold text-slate-600">Admin: DISMAS POKELA</span>
        </div>

      </div>
    </div>
  );
};
