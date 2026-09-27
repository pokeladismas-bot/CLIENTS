import React from 'react';
import { 
  Activity, Camera, PlusCircle, Sparkles, User, Utensils, HeartPulse, 
  BookOpen, MessageSquareText, Scale, Megaphone, Stethoscope, UserCheck, 
  UserPlus, ShieldAlert, Apple, Lock, KeyRound, ShieldCheck, LogOut, LogIn,
  UploadCloud, GitBranch, Printer, Bell, PieChart, Droplets, Database, Palette,
  Download, Settings, Sliders
} from 'lucide-react';
import { AuthSession, DashboardTheme, GlucoseLog, PortalMode, RegisteredPatient, SecuritySettings, UserProfile, UserRole } from '../types';

export type NavTabType = 
  | 'dashboard' 
  | 'scanner' 
  | 'glucose' 
  | 'recommendations' 
  | 'food_db' 
  | 'bmi' 
  | 'announcements' 
  | 'chat'
  | 'nutritionist'
  | 'weight_loss'
  | 'general_nutrition'
  | 'blood_pressure'
  | 'pediatric'
  | 'food_plate'
  | 'online_doctors';

interface NavbarProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  portalMode: PortalMode;
  onTogglePortalMode: (mode: PortalMode) => void;
  onOpenRegisterPatientModal: () => void;
  onOpenScanner: () => void;
  onOpenGlucoseModal: () => void;
  onOpenProfile: () => void;
  onOpenPrintEatingPlan?: () => void;
  onOpenRemindersModal?: () => void;
  latestGlucose?: GlucoseLog;
  profile: UserProfile;
  announcementsCount?: number;
  registeredPatientsCount?: number;
  authSession?: AuthSession | null;
  securitySettings?: SecuritySettings;
  onOpenAuthModal?: (role?: UserRole) => void;
  onLogout?: () => void;
  onToggleGlobalPrinting?: () => void;
  onOpenGitHubModal?: () => void;
  onToggleRequireLoginFirst?: () => void;
  selectedPatient?: RegisteredPatient;
  patients?: RegisteredPatient[];
  onSelectPatientId?: (patientId: string) => void;
  onOpenAdminDoctorModal?: () => void;
  onOpenAdminBackupModal?: () => void;
  onOpenChangePasswordModal?: () => void;
  currentTheme?: DashboardTheme;
  onOpenThemeModal?: () => void;
  onOpenInstallerModal?: () => void;
  onOpenSecuritySettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  portalMode,
  onTogglePortalMode,
  onOpenRegisterPatientModal,
  onOpenScanner,
  onOpenGlucoseModal,
  onOpenProfile,
  onOpenPrintEatingPlan,
  onOpenRemindersModal,
  latestGlucose,
  profile,
  announcementsCount,
  registeredPatientsCount = 0,
  authSession = null,
  securitySettings,
  onOpenAuthModal = (_role?: UserRole) => {},
  onLogout = () => {},
  onToggleGlobalPrinting = () => {},
  onOpenGitHubModal = () => {},
  onToggleRequireLoginFirst = () => {},
  selectedPatient,
  patients = [],
  onSelectPatientId,
  onOpenAdminDoctorModal,
  onOpenAdminBackupModal,
  onOpenChangePasswordModal,
  currentTheme = 'emerald',
  onOpenThemeModal,
  onOpenInstallerModal,
  onOpenSecuritySettings,
}) => {
  const getGlucoseBadge = () => {
    if (!latestGlucose) {
      return (
        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
          Hakuna kipimo cha leo
        </span>
      );
    }
    const val = latestGlucose.value;
    let bg = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    let label = 'Kawaida';

    if (val < 70) {
      bg = 'bg-amber-100 text-amber-800 border-amber-300';
      label = 'Chini';
    } else if (val > 180) {
      bg = 'bg-rose-100 text-rose-800 border-rose-300';
      label = val > 250 ? 'Hatari (Juu)' : 'Juu';
    }

    return (
      <div 
        onClick={onOpenGlucoseModal}
        className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${bg} transition-all hover:scale-105`}
        title="Bofya kurekodi au kutazama sukari"
      >
        <HeartPulse className="w-3.5 h-3.5" />
        <span>Sukari: {val} {profile.unit} ({label})</span>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      
      {/* Top Clinical Bar: Role/Face Switcher (Dual Portal Mode) & Auth Status */}
      <div className="bg-slate-900 text-white text-xs px-3 sm:px-6 py-1.5 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-bold hidden sm:inline">Face ya Mfumo:</span>
            
            {authSession?.role === 'patient' ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/90 border border-emerald-700/70 text-xs">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-200 font-extrabold">Akaunti ya Mgonjwa: {authSession.name}</span>
              </div>
            ) : (
              <div className="inline-flex rounded-xl bg-slate-800 p-0.5 border border-slate-700">
                <button
                  onClick={() => {
                    onTogglePortalMode('nutritionist');
                    setActiveTab('nutritionist');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    portalMode === 'nutritionist'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Badili kwenda kwenye dawati la Mtaalam wa Lishe"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-teal-300" />
                  <span>Dawati la Mtaalam & Kliniki</span>
                  {registeredPatientsCount > 0 && (
                    <span className="bg-teal-900 text-teal-200 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                      {registeredPatientsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    onTogglePortalMode('patient');
                    if (activeTab === 'nutritionist') setActiveTab('dashboard');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    portalMode === 'patient'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Badili kwenda kwenye mtazamo wa Mgonjwa / Mteja"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Mtazamo wa Mgonjwa</span>
                </button>
              </div>
            )}

            {/* In Patient Mode: show category badge without public names dropdown */}
            {portalMode === 'patient' && (
              <div className="flex items-center gap-1.5 bg-emerald-950/90 border border-emerald-700/70 px-2.5 py-1 rounded-xl text-xs">
                <span className="text-emerald-300 font-bold">Kliniki:</span>
                <span className="text-emerald-200 font-extrabold">
                  {selectedPatient?.category === 'shinikizo_la_damu' ? 'Shinikizo la Damu (Presha)' :
                   selectedPatient?.category === 'kupunguza_uzito' ? 'Kupunguza Uzito' :
                   selectedPatient?.category === 'watoto_lishe' ? 'Lishe ya Watoto' :
                   selectedPatient?.category === 'lishe_jumla' ? 'Lishe Bora' : 'Kisukari'}
                </span>
              </div>
            )}

            {/* Print status pill for quick glance */}
            {authSession?.role === 'patient' ? (
              <span className={`hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                authSession.canPrintReports 
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                  : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}>
                <Lock className="w-3 h-3" />
                <span>Print: {authSession.canPrintReports ? 'Umeruhusiwa' : 'Imefungwa na Admin'}</span>
              </span>
            ) : securitySettings && onToggleGlobalPrinting ? (
              <button
                type="button"
                onClick={onToggleGlobalPrinting}
                className={`hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                  securitySettings.allowPatientPrinting
                    ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border-emerald-800'
                    : 'bg-rose-950 hover:bg-rose-900 text-rose-300 border-rose-800'
                }`}
                title="Bofya kubadili ruhusa ya uchapishaji wa wagonjwa"
              >
                <Lock className="w-3 h-3" />
                <span>Print Wagonjwa: {securitySettings.allowPatientPrinting ? 'Ruhusu' : 'Funga'}</span>
              </button>
            ) : null}
          </div>

          {/* Right Section: User Session & Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {authSession ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
                  {authSession.role === 'admin' ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  ) : authSession.role === 'practitioner' ? (
                    <Stethoscope className="w-3.5 h-3.5 text-blue-400" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span className="font-extrabold text-slate-200 max-w-[140px] truncate">
                    {authSession.name}
                  </span>
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                    authSession.role === 'admin' 
                      ? 'bg-amber-900 text-amber-300' 
                      : authSession.role === 'practitioner'
                      ? 'bg-blue-900 text-blue-300'
                      : 'bg-emerald-900 text-emerald-300'
                  }`}>
                    {authSession.role === 'admin' ? 'Admin' : authSession.role === 'practitioner' ? 'Mtaalamu' : 'Mgonjwa'}
                  </span>
                </div>

                {/* ADMIN ACTIONS: DISMAS POKELA */}
                {authSession.role === 'admin' && (
                  <>
                    {onOpenSecuritySettings && (
                      <button
                        type="button"
                        onClick={onOpenSecuritySettings}
                        className="px-3 py-1 rounded-lg bg-teal-700 hover:bg-teal-600 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors border border-teal-500/50"
                        title="Mipangilio ya Msimamizi Mkuu, PIN, Usalama na Mfumo"
                        id="btn-admin-topbar-settings"
                      >
                        <Settings className="w-3.5 h-3.5 text-teal-200" />
                        <span>⚙️ Mipangilio ya Admin</span>
                      </button>
                    )}

                    {onOpenChangePasswordModal && (
                      <button
                        type="button"
                        onClick={onOpenChangePasswordModal}
                        className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors border border-emerald-500/50"
                        title="Badilisha Nenosiri la Admin (Admin Password)"
                        id="btn-admin-topbar-password"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-emerald-200" />
                        <span>🔑 Badilisha Nenosiri</span>
                      </button>
                    )}

                    <button
                      onClick={onOpenRegisterPatientModal}
                      className="px-3 py-1 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      title="Sajili Mgonjwa Mpya au Mteja wa Kliniki"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">+ Usajili wa Wagonjwa</span>
                      <span className="sm:hidden">+ Sajili</span>
                    </button>

                    {onOpenAdminDoctorModal && (
                      <button
                        onClick={onOpenAdminDoctorModal}
                        className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        title="Wasajili na Kuwasimamia Madaktari na Wataalamu wa Lishe"
                      >
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">🩺 Wasajili Madaktari</span>
                        <span className="sm:hidden">Madaktari</span>
                      </button>
                    )}

                    {onOpenAdminBackupModal && (
                      <button
                        onClick={onOpenAdminBackupModal}
                        className="px-3 py-1 rounded-lg bg-purple-700 hover:bg-purple-600 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        title="Pakua na Pakia Data za Mfumo (Backup / Restore)"
                      >
                        <Database className="w-3.5 h-3.5 text-purple-200" />
                        <span className="hidden sm:inline">💾 Pakua & Pakia Data</span>
                        <span className="sm:hidden">Backup</span>
                      </button>
                    )}
                  </>
                )}

                {/* PRACTITIONER ACTIONS: DOCTOR OR NUTRITIONIST */}
                {authSession.role === 'practitioner' && onOpenChangePasswordModal && (
                  <button
                    onClick={onOpenChangePasswordModal}
                    className="px-2.5 py-1 rounded-lg bg-blue-900/70 hover:bg-blue-800 text-blue-200 border border-blue-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Badilisha Nenosiri Lako la Kuingilia"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-blue-300" />
                    <span className="hidden sm:inline">Badili Nenosiri</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onOpenAuthModal?.()}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors border border-slate-700"
                  title="Badili Akaunti au Ingia Upya"
                >
                  <KeyRound className="w-3 h-3 text-teal-400" />
                  <span className="hidden sm:inline">Badili Mtumiaji</span>
                </button>

                {/* Explicit Funga Mfumo / Logout button */}
                <button
                  type="button"
                  onClick={() => onLogout?.()}
                  className="px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-700/60 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  title="Funga Mfumo mara moja na toka kwenye akaunti"
                >
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                  <span>Funga Mfumo</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuthModal?.()}
                className="px-3 py-1 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Ingia kwenye Mfumo</span>
              </button>
            )}

            {/* Role-Protected Session Indicator */}
            <div className="px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 bg-emerald-950/70 border border-emerald-500/40 text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xl:inline">
                Mfumo Umelindwa: Uthibitisho wa Nenosiri Umewashwa
              </span>
              <span className="xl:hidden">
                Ulinzi: Imethibitishwa
              </span>
            </div>

            {/* Theme Switcher Button */}
            {onOpenThemeModal && (
              <button
                type="button"
                onClick={onOpenThemeModal}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors border border-slate-700 hover:border-amber-400/50"
                title="Badilisha Mandhari ya Dashibodi (Themes)"
              >
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Mandhari ({currentTheme})</span>
              </button>
            )}

            {/* GitHub Sync Button */}
            <button
              type="button"
              onClick={onOpenGitHubModal}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors border border-slate-700 hover:border-slate-500"
              title="Wasilisha Msimbo Kwenye GitHub"
            >
              <UploadCloud className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">GitHub</span>
            </button>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setActiveTab(portalMode === 'nutritionist' ? 'nutritionist' : 'dashboard')} 
              className="cursor-pointer flex items-center gap-2.5"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg text-slate-900 tracking-tight">AfyaLishe</span>
                  <span className={`text-[10px] uppercase font-black px-1.5 py-0.5 rounded tracking-wide ${
                    portalMode === 'nutritionist' 
                      ? 'bg-teal-100 text-teal-800' 
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {portalMode === 'nutritionist' ? 'Clinical Portal' : 'Patient Portal'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">
                  {portalMode === 'nutritionist'
                    ? 'Mfumo wa Mtaalam wa Lishe, Kliniki ya Uzito & Kisukari'
                    : 'Ufuatiliaji wa Wanga, Sukari & Mpango wa Chakula'}
                </p>
              </div>
            </div>
          </div>

          {/* Center: Latest glucose status */}
          <div className="hidden md:flex items-center">
            {getGlucoseBadge()}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {onOpenPrintEatingPlan && (
              <button
                type="button"
                onClick={onOpenPrintEatingPlan}
                className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                title="Chapisha au pakua mpango wa chakula kwa wasio na simu"
                id="btn-print-plan-navbar"
              >
                <Printer className="w-3.5 h-3.5 text-slate-700" />
                <span>Chapisha Ratiba</span>
              </button>
            )}

            {onOpenRemindersModal && (
              <button
                type="button"
                onClick={onOpenRemindersModal}
                className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-semibold border border-sky-200 transition-colors cursor-pointer"
                title="Vikumbusho vya Kula na Kunywa Maji"
                id="btn-reminders-navbar"
              >
                <Bell className="w-3.5 h-3.5 text-sky-600" />
                <span className="hidden sm:inline">Vikumbusho</span>
              </button>
            )}

            <button
              onClick={onOpenScanner}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all hover:shadow cursor-pointer"
              id="btn-scan-food-navbar"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden xs:inline">Piga Picha ya Chakula</span>
              <span className="xs:hidden">Piga Picha</span>
            </button>

            <button
              onClick={onOpenGlucoseModal}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium border border-slate-200 transition-colors cursor-pointer"
              id="btn-log-glucose-navbar"
              title="Rekodi Sukari"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Rekodi Sukari</span>
            </button>

            {/* Badilisha Nenosiri - Inapatikana mara baada ya kuingia kwenye mfumo */}
            {authSession && onOpenChangePasswordModal && (
              <button
                type="button"
                onClick={onOpenChangePasswordModal}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 shadow-2xs transition-colors cursor-pointer"
                title="Badilisha Nenosiri Lako la Kuingilia Mfumo"
                id="btn-change-password-header"
              >
                <KeyRound className="w-4 h-4 text-amber-600" />
                <span className="hidden md:inline">Badilisha Nenosiri</span>
              </button>
            )}

            <button
              onClick={onOpenProfile}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              title="Wasifu & Mipangilio ya Mtumiaji"
              id="btn-user-profile"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar text-xs sm:text-sm font-medium">
          
          {portalMode === 'patient' ? (
            /* PATIENT MODE: Strict Condition-Based Dashboard (Patient ONLY sees the dashboard of their registered disease) */
            <>
              {/* If Kisukari */}
              {(!selectedPatient || selectedPatient.category === 'kisukari') && (
                <>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                      activeTab === 'dashboard'
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    id="tab-dashboard"
                  >
                    <Activity className="w-4 h-4" />
                    <span>Dashibodi Yangu ya Kisukari</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('glucose')}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                      activeTab === 'glucose'
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    id="tab-glucose"
                  >
                    <HeartPulse className="w-4 h-4 text-rose-500" />
                    <span>Sukari & Grafu</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('recommendations')}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                      activeTab === 'recommendations'
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    id="tab-recommendations"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Mapendekezo ya Sukari</span>
                  </button>
                </>
              )}

              {/* If Shinikizo la Damu (Presha) */}
              {selectedPatient?.category === 'shinikizo_la_damu' && (
                <button
                  onClick={() => setActiveTab('blood_pressure')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'blood_pressure'
                      ? 'bg-rose-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  id="tab-blood-pressure"
                >
                  <HeartPulse className="w-4 h-4 text-rose-500" />
                  <span>Dashibodi Yangu ya Presha (BP Clinic)</span>
                </button>
              )}

              {/* If Kupunguza Uzito */}
              {selectedPatient?.category === 'kupunguza_uzito' && (
                <>
                  <button
                    onClick={() => setActiveTab('weight_loss')}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                      activeTab === 'weight_loss'
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    id="tab-weight-loss"
                  >
                    <Scale className="w-4 h-4 text-emerald-600" />
                    <span>Dashibodi ya Kupunguza Uzito & Kalori</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('bmi')}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                      activeTab === 'bmi'
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    id="tab-bmi"
                  >
                    <Scale className="w-4 h-4 text-teal-600" />
                    <span>Kikokotoo cha BMI</span>
                  </button>
                </>
              )}

              {/* If Watoto Lishe */}
              {selectedPatient?.category === 'watoto_lishe' && (
                <button
                  onClick={() => setActiveTab('pediatric')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'pediatric'
                      ? 'bg-teal-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  id="tab-pediatric"
                >
                  <Sparkles className="w-4 h-4 text-teal-500" />
                  <span>Dashibodi ya Lishe ya Watoto & Ukuaji</span>
                </button>
              )}

              {/* If Lishe ya Jumla */}
              {selectedPatient?.category === 'lishe_jumla' && (
                <button
                  onClick={() => setActiveTab('general_nutrition')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'general_nutrition'
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  id="tab-general-nutrition"
                >
                  <Apple className="w-4 h-4 text-teal-600" />
                  <span>Dashibodi ya Ushauri wa Lishe ya Jumla</span>
                </button>
              )}

              {/* Condition-Tailored Food Plate & Dietary Guide */}
              <button
                onClick={() => setActiveTab('food_plate')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'food_plate'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                id="tab-food-plate"
              >
                <PieChart className="w-4 h-4 text-emerald-500" />
                <span>Mwongozo wa Chakula & Mifano</span>
              </button>

              {/* Online Doctor with Direct Call & WhatsApp */}
              <button
                onClick={() => setActiveTab('online_doctors')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'online_doctors'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                id="tab-online-doctors"
              >
                <Stethoscope className="w-4 h-4 text-blue-500" />
                <span className="flex items-center gap-1">
                  <span>Daktari Hewani (Call & WA)</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </span>
              </button>

              {/* AI Direct Chat */}
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'chat'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                id="tab-chat"
              >
                <MessageSquareText className="w-4 h-4 text-indigo-500" />
                <span>Mshauri wa Lishe (AI)</span>
              </button>
            </>
          ) : (
            /* ADMIN / NUTRITIONIST MODE: Full clinical dashboards and practitioner management */
            <>
              <button
                onClick={() => setActiveTab('nutritionist')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'nutritionist'
                    ? 'bg-teal-700 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                id="tab-nutritionist"
              >
                <Stethoscope className="w-4 h-4 text-teal-500" />
                <span>Dawati la Mtaalam & Wasajili</span>
              </button>

              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                id="tab-dashboard"
              >
                <Activity className="w-4 h-4" />
                <span>Kliniki ya Kisukari</span>
              </button>

              <button
                onClick={() => setActiveTab('blood_pressure')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'blood_pressure'
                    ? 'bg-rose-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                id="tab-blood-pressure"
              >
                <HeartPulse className="w-4 h-4 text-rose-500" />
                <span>Kliniki ya Presha (BP)</span>
              </button>

              <button
                onClick={() => setActiveTab('weight_loss')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'weight_loss'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                id="tab-weight-loss"
              >
                <Scale className="w-4 h-4 text-emerald-600" />
                <span>Kliniki ya Kupunguza Uzito</span>
              </button>

              <button
                onClick={() => setActiveTab('pediatric')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'pediatric'
                    ? 'bg-teal-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                id="tab-pediatric-admin"
              >
                <Sparkles className="w-4 h-4 text-teal-500" />
                <span>Kliniki ya Watoto</span>
              </button>

              <button
                onClick={() => setActiveTab('food_plate')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'food_plate'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                id="tab-food-plate"
              >
                <PieChart className="w-4 h-4 text-emerald-500" />
                <span>Mwongozo wa Chakula (TFNC)</span>
              </button>

              <button
                onClick={() => setActiveTab('online_doctors')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'online_doctors'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                id="tab-online-doctors"
              >
                <Stethoscope className="w-4 h-4 text-blue-500" />
                <span>Madaktari Walio Hewani</span>
              </button>

              <button
                onClick={() => setActiveTab('scanner')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'scanner'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                id="tab-scanner"
              >
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>Kikokotoo cha Wanga</span>
              </button>

              <button
                onClick={() => setActiveTab('general_nutrition')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'general_nutrition'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                id="tab-general-nutrition"
              >
                <Apple className="w-4 h-4 text-teal-600" />
                <span>Ushauri wa Lishe Jumla</span>
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'chat'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                id="tab-chat"
              >
                <MessageSquareText className="w-4 h-4 text-indigo-500" />
                <span>Mshauri wa Lishe (AI)</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

