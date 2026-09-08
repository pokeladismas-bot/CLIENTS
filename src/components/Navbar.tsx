import React from 'react';
import { 
  Activity, Camera, PlusCircle, Sparkles, User, Utensils, HeartPulse, 
  BookOpen, MessageSquareText, Scale, Megaphone, Stethoscope, UserCheck, 
  UserPlus, ShieldAlert, Apple, Lock, KeyRound, ShieldCheck, LogOut, LogIn
} from 'lucide-react';
import { AuthSession, GlucoseLog, PortalMode, SecuritySettings, UserProfile, UserRole } from '../types';

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
  | 'general_nutrition';

interface NavbarProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  portalMode: PortalMode;
  onTogglePortalMode: (mode: PortalMode) => void;
  onOpenRegisterPatientModal: () => void;
  onOpenScanner: () => void;
  onOpenGlucoseModal: () => void;
  onOpenProfile: () => void;
  latestGlucose?: GlucoseLog;
  profile: UserProfile;
  announcementsCount?: number;
  registeredPatientsCount?: number;
  authSession?: AuthSession | null;
  securitySettings?: SecuritySettings;
  onOpenAuthModal?: (role?: UserRole) => void;
  onLogout?: () => void;
  onToggleGlobalPrinting?: () => void;
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
  latestGlucose,
  profile,
  announcementsCount,
  registeredPatientsCount = 0,
  authSession = null,
  securitySettings,
  onOpenAuthModal = (_role?: UserRole) => {},
  onLogout = () => {},
  onToggleGlobalPrinting = () => {},
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
            
            <div className="inline-flex rounded-xl bg-slate-800 p-0.5 border border-slate-700">
              <button
                onClick={() => {
                  if (authSession?.role === 'patient') {
                    // Patient attempting to enter admin portal: trigger password check
                    onOpenAuthModal?.('admin');
                  } else {
                    onTogglePortalMode('nutritionist');
                    setActiveTab('nutritionist');
                  }
                }}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  portalMode === 'nutritionist'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title={authSession?.role === 'patient' ? 'Inahitaji nenosiri la Mtaalam wa Lishe (Admin)' : 'Badili kwenda kwenye dawati la Mtaalam wa Lishe'}
              >
                <Stethoscope className="w-3.5 h-3.5 text-teal-300" />
                <span>Mtaalam wa Lishe</span>
                {authSession?.role === 'patient' && <Lock className="w-2.5 h-2.5 text-amber-300 ml-0.5" />}
                {registeredPatientsCount > 0 && authSession?.role !== 'patient' && (
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
                <span>Mgonjwa / Mteja wa Kliniki</span>
              </button>
            </div>

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
                  ) : (
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span className="font-extrabold text-slate-200 max-w-[140px] truncate">
                    {authSession.name}
                  </span>
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                    authSession.role === 'admin' ? 'bg-teal-900 text-teal-300' : 'bg-emerald-900 text-emerald-300'
                  }`}>
                    {authSession.role === 'admin' ? 'Admin' : 'Mgonjwa'}
                  </span>
                </div>

                {authSession.role === 'admin' && (
                  <button
                    onClick={onOpenRegisterPatientModal}
                    className="px-3 py-1 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    title="Sajili Mgonjwa Mpya au Mteja wa Kliniki"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">+ Usajili wa Wagonjwa</span>
                    <span className="sm:hidden">+ Sajili</span>
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

                <button
                  type="button"
                  onClick={() => onLogout?.()}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Toka kwenye mfumo (Logout)"
                >
                  <LogOut className="w-3.5 h-3.5" />
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

            <button
              onClick={onOpenProfile}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              title="Wasifu & Mipangilio"
              id="btn-user-profile"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar text-xs sm:text-sm font-medium">
          
          {/* Nutritionist Portal Specific Tab */}
          <button
            onClick={() => {
              onTogglePortalMode('nutritionist');
              setActiveTab('nutritionist');
            }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'nutritionist'
                ? 'bg-teal-700 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            id="tab-nutritionist"
          >
            <Stethoscope className="w-4 h-4 text-teal-500" />
            <span>Dawati la Mtaalam wa Lishe</span>
          </button>

          {/* Patient Dashboard Tab */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            id="tab-dashboard"
          >
            <Activity className="w-4 h-4" />
            <span>Dashibodi ya Mgonjwa</span>
          </button>

          {/* Weight Loss Clinic Tab */}
          <button
            onClick={() => setActiveTab('weight_loss')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'weight_loss'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            id="tab-weight-loss"
          >
            <Scale className="w-4 h-4 text-emerald-600" />
            <span>Kliniki ya Kupunguza Uzito</span>
          </button>

          {/* General Nutrition Guide Tab */}
          <button
            onClick={() => setActiveTab('general_nutrition')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'general_nutrition'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            id="tab-general-nutrition"
          >
            <Apple className="w-4 h-4 text-teal-600" />
            <span>Ushauri wa Kilishe kwa Ujumla</span>
          </button>

          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'scanner'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            id="tab-scanner"
          >
            <Camera className="w-4 h-4 text-emerald-600" />
            <span>Kikokotoo cha Wanga (AI)</span>
          </button>

          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'recommendations'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            id="tab-recommendations"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Mapendekezo ya Sukari</span>
          </button>

          <button
            onClick={() => setActiveTab('glucose')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors ${
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
            onClick={() => setActiveTab('food_db')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'food_db'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            id="tab-food-db"
          >
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span>Kamusi ya Vyakula</span>
          </button>

          <button
            onClick={() => setActiveTab('bmi')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'bmi'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            id="tab-bmi"
          >
            <Scale className="w-4 h-4 text-teal-600" />
            <span>BMI & Kalori</span>
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors relative ${
              activeTab === 'announcements'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            id="tab-announcements"
          >
            <Megaphone className="w-4 h-4 text-amber-600" />
            <span>Matangazo & Updates</span>
            {announcementsCount && announcementsCount > 0 ? (
              <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full ml-0.5">
                {announcementsCount}
              </span>
            ) : null}
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'chat'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            id="tab-chat"
          >
            <MessageSquareText className="w-4 h-4 text-indigo-500" />
            <span>Mshauri wa Lishe (AI)</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

