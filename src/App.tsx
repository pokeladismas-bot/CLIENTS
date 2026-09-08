/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, NavTabType } from './components/Navbar';
import { NutritionDashboardView } from './components/NutritionDashboardView';
import { DietaryRecommendationsView } from './components/DietaryRecommendationsView';
import { GlucoseTrackerView } from './components/GlucoseTrackerView';
import { FoodDatabaseView } from './components/FoodDatabaseView';
import { NutritionistChatView } from './components/NutritionistChatView';
import { BmiCalculatorView } from './components/BmiCalculatorView';
import { AnnouncementsView } from './components/AnnouncementsView';
import { NutritionistPortalView } from './components/NutritionistPortalView';
import { WeightLossClinicView } from './components/WeightLossClinicView';
import { GeneralNutritionGuideView } from './components/GeneralNutritionGuideView';
import { PatientRegistrationModal } from './components/PatientRegistrationModal';
import { FoodScannerModal } from './components/FoodScannerModal';
import { GlucoseLogModal } from './components/GlucoseLogModal';
import { ProfileModal } from './components/ProfileModal';
import { PrintDietaryReportModal } from './components/PrintDietaryReportModal';
import { AuthModal } from './components/AuthModal';
import { 
  INITIAL_ANNOUNCEMENTS,
  INITIAL_GLUCOSE_LOGS, 
  INITIAL_MEAL_LOGS, 
  INITIAL_REGISTERED_PATIENTS,
  INITIAL_USER_PROFILE 
} from './data/sampleData';
import { 
  AuthSession,
  ClientCategory, 
  GlucoseLog, 
  MealLog, 
  NutritionAnnouncement, 
  PortalMode, 
  RegisteredPatient, 
  SecuritySettings,
  UserProfile,
  UserRole
} from './types';
import { Bell, HeartPulse, X, ChevronRight } from 'lucide-react';
import { playReminderChime } from './utils/reminderSound';

const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  adminPassword: 'admin123',
  allowPatientPrinting: true,
  requireAdminApprovalForExport: false,
};

export default function App() {
  // Dual-Portal Face State (Nutritionist vs Patient)
  const [portalMode, setPortalMode] = useState<PortalMode>(() => {
    const saved = localStorage.getItem('afyalishe_portal_mode');
    return (saved as PortalMode) || 'patient';
  });

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTabType>('dashboard');

  // Modals state
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isGlucoseModalOpen, setIsGlucoseModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [registerInitialCategory, setRegisterInitialCategory] = useState<ClientCategory>('kisukari');
  const [printReportLog, setPrintReportLog] = useState<GlucoseLog | null>(null);

  // In-app daily reminder toast state
  const [isReminderAlertVisible, setIsReminderAlertVisible] = useState<boolean>(false);
  const [reminderMessage, setReminderMessage] = useState<string>('');

  // App Data with local storage persistence
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('afyalishe_profile');
    return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
  });

  const [patients, setPatients] = useState<RegisteredPatient[]>(() => {
    const saved = localStorage.getItem('afyalishe_patients');
    return saved ? JSON.parse(saved) : INITIAL_REGISTERED_PATIENTS;
  });

  // Active selected patient for clinic view
  const [selectedPatientId, setSelectedPatientId] = useState<string>(() => {
    return patients[0]?.id || '';
  });

  const [meals, setMeals] = useState<MealLog[]>(() => {
    const saved = localStorage.getItem('afyalishe_meals');
    return saved ? JSON.parse(saved) : INITIAL_MEAL_LOGS;
  });

  const [glucoseLogs, setGlucoseLogs] = useState<GlucoseLog[]>(() => {
    const saved = localStorage.getItem('afyalishe_glucose');
    return saved ? JSON.parse(saved) : INITIAL_GLUCOSE_LOGS;
  });

  const [announcements, setAnnouncements] = useState<NutritionAnnouncement[]>(() => {
    const saved = localStorage.getItem('afyalishe_announcements');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  // Security & Authentication State
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(() => {
    const saved = localStorage.getItem('afyalishe_security_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SECURITY_SETTINGS;
  });

  const [authSession, setAuthSession] = useState<AuthSession | null>(() => {
    const saved = localStorage.getItem('afyalishe_auth_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return {
      role: 'admin',
      username: 'admin',
      name: 'Dkt. Grace Kimaro (Mtaalam wa Lishe)',
      loginTime: new Date().toISOString(),
      canPrintReports: true,
    };
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalRole, setAuthModalRole] = useState<UserRole>('patient');

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('afyalishe_portal_mode', portalMode);
  }, [portalMode]);

  useEffect(() => {
    localStorage.setItem('afyalishe_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('afyalishe_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('afyalishe_meals', JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem('afyalishe_glucose', JSON.stringify(glucoseLogs));
  }, [glucoseLogs]);

  useEffect(() => {
    localStorage.setItem('afyalishe_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('afyalishe_security_settings', JSON.stringify(securitySettings));
  }, [securitySettings]);

  useEffect(() => {
    if (authSession) {
      localStorage.setItem('afyalishe_auth_session', JSON.stringify(authSession));
    } else {
      localStorage.removeItem('afyalishe_auth_session');
    }
  }, [authSession]);

  // Periodic Glucose Reminder Check
  useEffect(() => {
    if (!profile.dailyReminders?.enabled) {
      setIsReminderAlertVisible(false);
      return;
    }

    const checkReminders = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      const { morningTime, morningEnabled, afternoonTime, afternoonEnabled, eveningTime, eveningEnabled } = profile.dailyReminders!;

      const today = now.toDateString();
      const hasLoggedToday = glucoseLogs.some(
        (g) => new Date(g.timestamp).toDateString() === today
      );

      // Trigger if current time matches slot or if not logged today
      if (morningEnabled && currentTimeStr === morningTime) {
        setReminderMessage('Kikumbusho cha Asubuhi (Fasting): Ni muda mzuri wa kupima na kurekodi kiwango chako cha sukari kabla ya chai.');
        setIsReminderAlertVisible(true);
        if (profile.dailyReminders?.soundEnabled) playReminderChime();
      } else if (afternoonEnabled && currentTimeStr === afternoonTime) {
        setReminderMessage('Kikumbusho cha Mchana: Pima sukari ya masaa 2 baada ya chakula cha mchana kuona athari ya mlo.');
        setIsReminderAlertVisible(true);
        if (profile.dailyReminders?.soundEnabled) playReminderChime();
      } else if (eveningEnabled && currentTimeStr === eveningTime) {
        setReminderMessage('Kikumbusho cha Usiku (Bedtime): Pima sukari kabla ya kulala ili kuzuia kushuka ghafla kwa sukari usiku.');
        setIsReminderAlertVisible(true);
        if (profile.dailyReminders?.soundEnabled) playReminderChime();
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 45000);
    return () => clearInterval(interval);
  }, [profile.dailyReminders, glucoseLogs]);

  // Handlers
  const handleSaveMeal = (newMeal: MealLog) => {
    setMeals((prev) => [newMeal, ...prev]);
    // Also if glucose before meal was provided, add a glucose log
    if (newMeal.glucoseBefore) {
      const gLog: GlucoseLog = {
        id: 'gluc-' + Date.now(),
        timestamp: newMeal.timestamp,
        value: newMeal.glucoseBefore,
        unit: profile.unit,
        timing: newMeal.mealType === 'breakfast' ? 'pre_breakfast' : newMeal.mealType === 'lunch' ? 'pre_lunch' : 'pre_dinner',
        mealId: newMeal.id,
        status: newMeal.glucoseBefore <= 130 ? 'kawaida' : 'juu',
        notes: `Kabla ya ${newMeal.title}`,
      };
      setGlucoseLogs((prev) => [gLog, ...prev]);
    }
  };

  const handleSaveGlucose = (newLog: GlucoseLog) => {
    setGlucoseLogs((prev) => [...prev, newLog]);
  };

  const handleDeleteMeal = (mealId: string) => {
    setMeals((prev) => prev.filter((m) => m.id !== mealId));
  };

  const handleDeleteGlucose = (logId: string) => {
    setGlucoseLogs((prev) => prev.filter((l) => l.id !== logId));
  };

  // Announcement Handlers
  const handleAddAnnouncement = (newAnn: NutritionAnnouncement) => {
    setAnnouncements((prev) => [newAnn, ...prev]);
  };

  const handleUpdateAnnouncement = (updatedAnn: NutritionAnnouncement) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === updatedAnn.id ? updatedAnn : a))
    );
  };

  const handleDeleteAnnouncement = (annId: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== annId));
  };

  // Patient Management Handlers
  const handleRegisterPatient = (newPatient: RegisteredPatient) => {
    setPatients((prev) => [newPatient, ...prev]);
    setSelectedPatientId(newPatient.id);
    setIsRegisterModalOpen(false);
  };

  const handleUpdatePatient = (updatedPatient: RegisteredPatient) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
    );
  };

  const handleSelectActivePatientForView = (patient: RegisteredPatient) => {
    setSelectedPatientId(patient.id);
    // Sync patient info to current active profile view
    setProfile((prev) => ({
      ...prev,
      name: patient.fullName,
      weightKg: patient.currentWeightKg,
      heightCm: patient.heightCm,
      age: patient.age,
      gender: patient.gender,
      diabetesType: patient.diabetesType || 'type2',
      medicationInfo: patient.currentMedications || prev.medicationInfo,
    }));
    setPortalMode('patient');
    setActiveTab('dashboard');
  };

  const handleUpdatePatientWeight = (weightKg: number, notes?: string) => {
    const currentPat = patients.find(p => p.id === selectedPatientId) || patients[0];
    if (currentPat) {
      const updatedLogs = [
        ...(currentPat.weightLogs || []),
        {
          id: 'w-' + Date.now(),
          date: new Date().toLocaleDateString('sw-TZ'),
          weightKg,
          notes: notes || 'Kipimo kipya cha uzito wa leo',
        },
      ];
      const updated = {
        ...currentPat,
        currentWeightKg: weightKg,
        weightLogs: updatedLogs,
      };
      handleUpdatePatient(updated);
    }
    setProfile((prev) => ({ ...prev, weightKg }));
  };

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];
  const latestGlucose = glucoseLogs.length > 0 ? glucoseLogs[glucoseLogs.length - 1] : undefined;

  // Auth & Security Handlers
  const handleLoginSuccess = (session: AuthSession) => {
    setAuthSession(session);
    setIsAuthModalOpen(false);

    if (session.role === 'patient' && session.patientId) {
      const patient = patients.find((p) => p.id === session.patientId);
      if (patient) {
        handleSelectActivePatientForView(patient);
      }
      setPortalMode('patient');
      setActiveTab('dashboard');
    } else if (session.role === 'admin') {
      setPortalMode('nutritionist');
      setActiveTab('nutritionist');
    }
  };

  const handleLogout = () => {
    setAuthSession(null);
    localStorage.removeItem('afyalishe_auth_session');
  };

  const handleOpenAuthModal = (role?: UserRole) => {
    setAuthModalRole(role || 'patient');
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'scanner') {
            setIsScannerOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        portalMode={portalMode}
        onTogglePortalMode={(mode) => setPortalMode(mode)}
        onOpenRegisterPatientModal={() => {
          setRegisterInitialCategory('kisukari');
          setIsRegisterModalOpen(true);
        }}
        registeredPatientsCount={patients.length}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenGlucoseModal={() => setIsGlucoseModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        latestGlucose={latestGlucose}
        profile={profile}
        announcementsCount={announcements.length}
        authSession={authSession}
        securitySettings={securitySettings}
        onOpenAuthModal={handleOpenAuthModal}
        onLogout={handleLogout}
        onToggleGlobalPrinting={() => {
          setSecuritySettings((prev) => ({
            ...prev,
            allowPatientPrinting: !prev.allowPatientPrinting,
          }));
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Face 1: Dawati la Mtaalam wa Lishe */}
        {activeTab === 'nutritionist' && (
          <NutritionistPortalView
            patients={patients}
            onOpenRegisterModal={(category) => {
              setRegisterInitialCategory(category || 'kisukari');
              setIsRegisterModalOpen(true);
            }}
            onUpdatePatient={handleUpdatePatient}
            onSelectActivePatientForView={handleSelectActivePatientForView}
            securitySettings={securitySettings}
            onUpdateSecuritySettings={setSecuritySettings}
            onOpenPrintReport={(glucoseVal) => {
              const fakeLog: GlucoseLog = {
                id: 'report-' + Date.now(),
                timestamp: new Date().toISOString(),
                value: glucoseVal || 120,
                unit: profile.unit,
                timing: 'fasting',
                status: 'kawaida',
                notes: `Ripoti ya kliniki: ${selectedPatient?.fullName || profile.name}`,
              };
              setPrintReportLog(fakeLog);
            }}
          />
        )}

        {/* Kliniki ya Kupunguza Uzito (Weight Loss Clinic) */}
        {activeTab === 'weight_loss' && (
          <WeightLossClinicView
            patient={selectedPatient}
            onUpdatePatientWeight={handleUpdatePatientWeight}
            onOpenConsultation={() => setActiveTab('chat')}
          />
        )}

        {/* Ushauri wa Kilishe kwa Ujumla (General Nutrition Guide) */}
        {activeTab === 'general_nutrition' && (
          <GeneralNutritionGuideView />
        )}

        {activeTab === 'dashboard' && (
          <NutritionDashboardView
            meals={meals}
            glucoseLogs={glucoseLogs}
            profile={profile}
            announcements={announcements}
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenGlucoseModal={() => setIsGlucoseModalOpen(true)}
            onSelectTab={(tab) => setActiveTab(tab)}
            onDeleteMeal={handleDeleteMeal}
          />
        )}

        {activeTab === 'recommendations' && (
          <DietaryRecommendationsView
            latestGlucose={latestGlucose}
            profile={profile}
            recentMeals={meals}
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenGlucoseModal={() => setIsGlucoseModalOpen(true)}
          />
        )}

        {activeTab === 'glucose' && (
          <GlucoseTrackerView
            glucoseLogs={glucoseLogs}
            meals={meals}
            profile={profile}
            onOpenGlucoseModal={() => setIsGlucoseModalOpen(true)}
            onDeleteLog={handleDeleteGlucose}
            onUpdateProfile={setProfile}
          />
        )}

        {activeTab === 'food_db' && (
          <FoodDatabaseView />
        )}

        {activeTab === 'bmi' && (
          <BmiCalculatorView
            profile={profile}
            latestGlucose={latestGlucose}
            onUpdateProfile={setProfile}
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenGlucoseModal={() => setIsGlucoseModalOpen(true)}
          />
        )}

        {activeTab === 'announcements' && (
          <AnnouncementsView
            announcements={announcements}
            profile={profile}
            onAddAnnouncement={handleAddAnnouncement}
            onUpdateAnnouncement={handleUpdateAnnouncement}
            onDeleteAnnouncement={handleDeleteAnnouncement}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'chat' && (
          <NutritionistChatView
            profile={profile}
            latestGlucose={latestGlucose}
            recentMeals={meals}
          />
        )}
      </main>

      {/* Modals */}
      <PatientRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegisterPatient={handleRegisterPatient}
        initialCategory={registerInitialCategory}
      />

      <FoodScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSaveMeal={handleSaveMeal}
        profile={profile}
        latestGlucose={latestGlucose?.value}
      />

      <GlucoseLogModal
        isOpen={isGlucoseModalOpen}
        onClose={() => setIsGlucoseModalOpen(false)}
        onSaveGlucose={handleSaveGlucose}
        onSaveAndPrint={(log) => {
          setPrintReportLog(log);
        }}
        profile={profile}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSaveProfile={setProfile}
      />

      {/* Print / Export Report Modal */}
      {printReportLog && (
        <PrintDietaryReportModal
          isOpen={!!printReportLog}
          onClose={() => setPrintReportLog(null)}
          profile={profile}
          testedGlucose={printReportLog.value}
          testedTiming={printReportLog.timing}
          recommendation={null}
          latestGlucoseLog={printReportLog}
          isAdmin={authSession?.role === 'admin'}
          isPrintingAllowedByAdmin={
            authSession?.role === 'admin' ||
            (securitySettings.allowPatientPrinting && (selectedPatient?.canPrintReports ?? true))
          }
          adminPassword={securitySettings.adminPassword}
          onAdminTogglePrinting={(allowed) => {
            setSecuritySettings((prev) => ({ ...prev, allowPatientPrinting: allowed }));
          }}
        />
      )}

      {/* Authentication & User Switching Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        patients={patients}
        securitySettings={securitySettings}
        currentSession={authSession}
        onLoginSuccess={handleLoginSuccess}
        initialRole={authModalRole}
      />


      {/* In-App Active Reminder Alert Toast */}
      {isReminderAlertVisible && (
        <div className="fixed bottom-6 right-4 sm:right-6 max-w-md w-[calc(100%-2rem)] sm:w-auto z-40 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-rose-500/40 flex items-start gap-3.5 backdrop-blur-md">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 animate-bounce">
              <Bell className="w-5 h-5" />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-rose-300 uppercase tracking-wider">
                  Kikumbusho cha Sukari ya Damu
                </span>
                <button
                  onClick={() => setIsReminderAlertVisible(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {reminderMessage || 'Ni muda wa kupima na kurekodi kiwango chako cha sukari ya damu.'}
              </p>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    setIsReminderAlertVisible(false);
                    setIsGlucoseModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <HeartPulse className="w-3.5 h-3.5" />
                  <span>Rekodi Sasa</span>
                </button>

                <button
                  onClick={() => setIsReminderAlertVisible(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
                >
                  Nishapima / Baadaye
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700">AfyaLishe — Mfumo wa Ufuatiliaji wa Lishe na Sukari kwa Wagonjwa wa Kisukari</p>
          <p className="text-[11px] text-slate-400">
            Kumbuka: Mfumo huu ni zana ya kukusaidia katika lishe na hesabu ya wanga. Daima wasiliana na daktari au mtaalamu wa afya kabla ya kubadilisha dozi za dawa au mpango wako wa matibabu.
          </p>
        </div>
      </footer>
    </div>
  );
}
