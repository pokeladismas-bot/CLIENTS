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
import { GitHubSyncModal } from './components/GitHubSyncModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { BloodPressureClinicView } from './components/BloodPressureClinicView';
import { FoodPlateGuideView } from './components/FoodPlateGuideView';
import { NearbyOnlineDoctorView } from './components/NearbyOnlineDoctorView';
import { OfflinePrintableEatingPlanModal } from './components/OfflinePrintableEatingPlanModal';
import { MealAndWaterReminderModal } from './components/MealAndWaterReminderModal';
import { AdminPractitionersModal } from './components/AdminPractitionersModal';
import { ChildNutritionTrackerView } from './components/ChildNutritionTrackerView';
import { ThemeSwitcherModal } from './components/ThemeSwitcherModal';
import { AuthGateView } from './components/AuthGateView';
import { AppInstallerModal } from './components/AppInstallerModal';
import { ClinicalSecuritySettingsModal } from './components/ClinicalSecuritySettingsModal';
import { SystemDataSyncBar } from './components/SystemDataSyncBar';
import { performFullSystemSync } from './services/dataSyncService';
import { DASHBOARD_THEMES, getSavedTheme, saveTheme } from './utils/theme';
import { testFirestoreConnection } from './services/firebase';
import { 
  INITIAL_ANNOUNCEMENTS,
  INITIAL_BLOOD_PRESSURE_LOGS,
  INITIAL_GLUCOSE_LOGS, 
  INITIAL_MEAL_LOGS, 
  INITIAL_REGISTERED_PATIENTS,
  INITIAL_USER_PROFILE,
  SAMPLE_ONLINE_DOCTORS
} from './data/sampleData';
import { 
  AuthSession,
  BloodPressureLog,
  ClientCategory, 
  GlucoseLog, 
  MealLog, 
  NutritionAnnouncement, 
  OnlineDoctor,
  PortalMode, 
  RegisteredPatient, 
  SecuritySettings,
  UserProfile,
  UserRole,
  DashboardTheme
} from './types';
import { Bell, HeartPulse, X, ChevronRight, HardDrive, UploadCloud } from 'lucide-react';
import { playReminderChime } from './utils/reminderSound';

const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  adminPassword: 'admin123',
  adminPin: '8822',
  adminName: 'DISMAS POKELA',
  adminEmail: 'dismaspokela@gmail.com',
  allowPatientPrinting: true,
  requireAdminApprovalForExport: false,
  requireLoginFirst: true,
  autoLockMinutes: 10,
  autoSyncEnabled: true,
  syncIntervalSeconds: 30,
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
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState<boolean>(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState<boolean>(false);
  const [isOfflinePlanModalOpen, setIsOfflinePlanModalOpen] = useState<boolean>(false);
  const [isRemindersModalOpen, setIsRemindersModalOpen] = useState<boolean>(false);

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

  const [bloodPressureLogs, setBloodPressureLogs] = useState<BloodPressureLog[]>(() => {
    const saved = localStorage.getItem('afyalishe_bp_logs');
    return saved ? JSON.parse(saved) : INITIAL_BLOOD_PRESSURE_LOGS;
  });

  const [waterGlassesToday, setWaterGlassesToday] = useState<number>(() => {
    const saved = localStorage.getItem('afyalishe_water_today');
    return saved ? Number(saved) : 4;
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
    // If requireLoginFirst is enabled, require password by starting unauthenticated
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalRole, setAuthModalRole] = useState<UserRole>('patient');

  // Dashboard Theme State
  const [currentTheme, setCurrentTheme] = useState<DashboardTheme>(getSavedTheme);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);

  // PWA App Installer Modal State (Admin & Practitioner installation system)
  const [isInstallerModalOpen, setIsInstallerModalOpen] = useState<boolean>(false);
  const [isSecuritySettingsModalOpen, setIsSecuritySettingsModalOpen] = useState<boolean>(false);
  const [systemLockNotice, setSystemLockNotice] = useState<string | null>(null);

  const handleSelectTheme = (theme: DashboardTheme) => {
    setCurrentTheme(theme);
    saveTheme(theme);
  };

  useEffect(() => {
    saveTheme(currentTheme);
    testFirestoreConnection();
  }, [currentTheme]);

  // Practitioners & Doctors Management (Admin Portal)
  const [doctors, setDoctors] = useState<OnlineDoctor[]>(() => {
    const saved = localStorage.getItem('afyalishe_online_doctors');
    return saved ? JSON.parse(saved) : SAMPLE_ONLINE_DOCTORS;
  });

  const [isAdminPractitionersModalOpen, setIsAdminPractitionersModalOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('afyalishe_online_doctors', JSON.stringify(doctors));
  }, [doctors]);

  const handleSaveDoctor = (doc: OnlineDoctor) => {
    setDoctors((prev) => {
      const exists = prev.some((d) => d.id === doc.id);
      if (exists) {
        return prev.map((d) => (d.id === doc.id ? doc : d));
      }
      return [doc, ...prev];
    });
  };

  const handleDeleteDoctor = (docId: string) => {
    setDoctors((prev) => prev.filter((d) => d.id !== docId));
  };

  const handleToggleDoctorOnline = (docId: string) => {
    setDoctors((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, isOnline: !d.isOnline } : d))
    );
  };

  const handleUpdateDoctorPassword = (doctorId: string, newPassword: string) => {
    setDoctors((prev) =>
      prev.map((d) =>
        d.id === doctorId
          ? { ...d, password: newPassword, isPasswordChanged: true }
          : d
      )
    );
  };

  const handleUpdatePatientPassword = (patientId: string, newPassword: string) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, password: newPassword } : p))
    );
  };

  const handleUpdateAdminPassword = (newPassword: string) => {
    setSecuritySettings((prev) => ({ ...prev, adminPassword: newPassword }));
  };

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
    localStorage.setItem('afyalishe_bp_logs', JSON.stringify(bloodPressureLogs));
  }, [bloodPressureLogs]);

  useEffect(() => {
    localStorage.setItem('afyalishe_water_today', String(waterGlassesToday));
  }, [waterGlassesToday]);

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

  const handleDeletePatient = (patientId: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== patientId));
    if (selectedPatientId === patientId) {
      const remaining = patients.filter((p) => p.id !== patientId);
      if (remaining.length > 0) {
        setSelectedPatientId(remaining[0].id);
      }
    }
  };

  const handleSelectActivePatientById = (patId: string) => {
    const p = patients.find((pat) => pat.id === patId);
    if (p) {
      handleSelectActivePatientForView(p);
    }
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

    // Automatically navigate to the specific dashboard of the condition they are registered for
    if (patient.category === 'shinikizo_la_damu') {
      setActiveTab('blood_pressure');
    } else if (patient.category === 'kupunguza_uzito') {
      setActiveTab('weight_loss');
    } else if (patient.category === 'watoto_lishe') {
      setActiveTab('pediatric');
    } else if (patient.category === 'lishe_jumla') {
      setActiveTab('general_nutrition');
    } else {
      setActiveTab('dashboard');
    }
  };

  // Enforce disease-specific dashboard restriction when in patient portal
  useEffect(() => {
    if (portalMode === 'patient') {
      const activePat = patients.find((p) => p.id === selectedPatientId) || patients[0];
      if (activePat) {
        const cat = activePat.category;
        const allowedTabsMap: Record<ClientCategory, NavTabType[]> = {
          kisukari: ['dashboard', 'glucose', 'recommendations', 'food_plate', 'online_doctors', 'chat'],
          shinikizo_la_damu: ['blood_pressure', 'food_plate', 'online_doctors', 'chat'],
          kupunguza_uzito: ['weight_loss', 'bmi', 'food_plate', 'online_doctors', 'chat'],
          watoto_lishe: ['pediatric', 'food_plate', 'online_doctors', 'chat'],
          lishe_jumla: ['general_nutrition', 'food_plate', 'online_doctors', 'chat'],
        };

        const allowed = allowedTabsMap[cat] || ['dashboard', 'food_plate', 'online_doctors', 'chat'];
        if (!allowed.includes(activeTab)) {
          const defaultTabMap: Record<ClientCategory, NavTabType> = {
            kisukari: 'dashboard',
            shinikizo_la_damu: 'blood_pressure',
            kupunguza_uzito: 'weight_loss',
            watoto_lishe: 'pediatric',
            lishe_jumla: 'general_nutrition',
          };
          setActiveTab(defaultTabMap[cat] || 'dashboard');
        }
      }
    }
  }, [portalMode, selectedPatientId, patients, activeTab]);

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

  const handleSaveBpLog = (newLog: BloodPressureLog) => {
    setBloodPressureLogs((prev) => [newLog, ...prev]);
  };

  const handleDeleteBpLog = (id: string) => {
    setBloodPressureLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const handleLogWaterGlass = (amount: number) => {
    setWaterGlassesToday((prev) => Math.max(0, prev + amount));
  };

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];
  const latestGlucose = glucoseLogs.length > 0 ? glucoseLogs[glucoseLogs.length - 1] : undefined;

  // Auth & Security Handlers
  const handleLoginSuccess = (session: AuthSession) => {
    setAuthSession(session);
    localStorage.setItem('afyalishe_auth_session', JSON.stringify(session));
    setIsAuthModalOpen(false);
    setSystemLockNotice(null);

    if (session.role === 'patient' && session.patientId) {
      const patient = patients.find((p) => p.id === session.patientId);
      if (patient) {
        handleSelectActivePatientForView(patient);
      }
      setPortalMode('patient');
      setActiveTab('dashboard');
    } else if (session.role === 'practitioner') {
      setPortalMode('nutritionist');
      setActiveTab('nutritionist');
    } else if (session.role === 'admin') {
      setPortalMode('nutritionist');
      setActiveTab('nutritionist');
    }
  };

  const handleLogout = () => {
    setAuthSession(null);
    localStorage.removeItem('afyalishe_auth_session');
    setIsAuthModalOpen(false);
    setSystemLockNotice('Mfumo umefungwa salama. Weka nenosiri lako la mtumiaji kufungua tena mfumo.');
  };

  // --- AUTOMATIC INACTIVITY LOCK ---
  const autoLockMinutes = securitySettings.autoLockMinutes ?? securitySettings.sessionTimeoutMinutes ?? 10;

  const handleLockSystem = (reason?: string) => {
    setAuthSession(null);
    localStorage.removeItem('afyalishe_auth_session');
    setIsAuthModalOpen(false);
    setSystemLockNotice(
      reason || `🔒 Mfumo umefungwa kiotomatiki kwa sababu ya kutotumika kwa dakika ${autoLockMinutes}. Tafadhali weka nenosiri au PIN yako ili kufungua tena.`
    );
  };

  useEffect(() => {
    if (!authSession) return;
    if (!autoLockMinutes || autoLockMinutes <= 0) return;

    const timeoutMs = autoLockMinutes * 60 * 1000;
    let timerId: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timerId);
      timerId = setTimeout(() => {
        handleLockSystem(`🔒 Mfumo umefungwa kiotomatiki kwa usalama baada ya kutotumika kwa dakika ${autoLockMinutes}. Weka nenosiri au PIN kufungua.`);
      }, timeoutMs);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));

    resetTimer();

    return () => {
      clearTimeout(timerId);
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [authSession, autoLockMinutes]);

  // --- PERIODIC DATA PIPELINE UPDATION ---
  // Mtiririko: Firebase -> User Data -> Settings -> Reports -> Records
  const [isSystemSyncing, setIsSystemSyncing] = useState<boolean>(false);
  const [lastSyncedTimeStr, setLastSyncedTimeStr] = useState<string>(() => {
    const d = new Date();
    return d.toLocaleTimeString('sw-TZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });

  const performDataSync = async (silent = false) => {
    if (isSystemSyncing) return;
    setIsSystemSyncing(true);
    try {
      const result = await performFullSystemSync({
        patients,
        doctors,
        profile,
        securitySettings,
        glucoseLogs,
        mealLogs: meals,
        waterGlassesToday,
      });

      const formattedTime = result.timestamp.toLocaleTimeString('sw-TZ', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setLastSyncedTimeStr(formattedTime);

      setSecuritySettings((prev) => {
        const next = { ...prev, lastSyncedAt: formattedTime };
        localStorage.setItem('afyalishe_security_settings', JSON.stringify(next));
        return next;
      });
    } catch (err) {
      console.warn('Periodic sync notice:', err);
    } finally {
      setIsSystemSyncing(false);
    }
  };

  // Periodic timer for continuous update
  useEffect(() => {
    const isAutoSync = securitySettings.autoSyncEnabled ?? true;
    if (!isAutoSync) return;

    const intervalSeconds = securitySettings.syncIntervalSeconds || 30;
    const intervalMs = Math.max(10, intervalSeconds) * 1000;

    // Trigger initial background sync
    const initialTimer = setTimeout(() => {
      performDataSync(true);
    }, 2000);

    const intervalId = setInterval(() => {
      performDataSync(true);
    }, intervalMs);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalId);
    };
  }, [
    securitySettings.autoSyncEnabled,
    securitySettings.syncIntervalSeconds,
    patients,
    doctors,
    securitySettings,
    glucoseLogs,
    meals,
    waterGlassesToday,
  ]);

  const handleToggleRequireLoginFirst = () => {
    setSecuritySettings((prev) => {
      const updated = {
        ...prev,
        requireLoginFirst: !prev.requireLoginFirst,
      };
      localStorage.setItem('afyalishe_security_settings', JSON.stringify(updated));
      return updated;
    });
  };

  const handleOpenAuthModal = (role?: UserRole) => {
    setAuthModalRole(role || 'patient');
    setIsAuthModalOpen(true);
  };

  const activeTheme = DASHBOARD_THEMES[currentTheme] || DASHBOARD_THEMES.emerald;

  // STRICT MANDATORY ROLE AUTHENTICATION GATE
  // If user is not authenticated with a valid role password, the dashboard CANNOT be accessed!
  if (!authSession) {
    return (
      <div className={`min-h-screen ${activeTheme.pageBg} flex flex-col justify-center items-center p-4 sm:p-6 transition-colors duration-200 font-sans selection:bg-emerald-500 selection:text-white`}>
        <AuthGateView
          patients={patients}
          doctors={doctors}
          securitySettings={securitySettings}
          onLoginSuccess={handleLoginSuccess}
          currentTheme={currentTheme}
          onOpenThemeModal={() => setIsThemeModalOpen(true)}
          onOpenSecuritySettings={() => setIsSecuritySettingsModalOpen(true)}
          onUpdatePatientPassword={handleUpdatePatientPassword}
          onUpdateDoctorPassword={handleUpdateDoctorPassword}
          onUpdateAdminPassword={handleUpdateAdminPassword}
          lockedNotice={systemLockNotice}
        />

        {/* Theme Switcher Modal Accessible on Gate */}
        <ThemeSwitcherModal
          isOpen={isThemeModalOpen}
          onClose={() => setIsThemeModalOpen(false)}
          currentTheme={currentTheme}
          onSelectTheme={handleSelectTheme}
        />

        {/* Clinical Security Settings Modal Accessible by Admin */}
        <ClinicalSecuritySettingsModal
          isOpen={isSecuritySettingsModalOpen}
          onClose={() => setIsSecuritySettingsModalOpen(false)}
          securitySettings={securitySettings}
          onUpdateSecuritySettings={setSecuritySettings}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${activeTheme.pageBg} flex flex-col font-sans transition-colors duration-200 selection:bg-emerald-500 selection:text-white`}>
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
        selectedPatient={selectedPatient}
        patients={patients}
        onSelectPatientId={handleSelectActivePatientById}
        onOpenAdminDoctorModal={() => setIsAdminPractitionersModalOpen(true)}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenGlucoseModal={() => setIsGlucoseModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenPrintEatingPlan={() => setIsOfflinePlanModalOpen(true)}
        onOpenRemindersModal={() => setIsRemindersModalOpen(true)}
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
        onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
        onToggleRequireLoginFirst={handleToggleRequireLoginFirst}
        currentTheme={currentTheme}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onOpenInstallerModal={() => setIsInstallerModalOpen(true)}
        onOpenSecuritySettings={() => setIsSecuritySettingsModalOpen(true)}
        onOpenAdminBackupModal={() => setIsDriveModalOpen(true)}
      />

      {/* Live Pipeline Updation Bar: Firebase -> User Data -> Settings -> Reports -> Records */}
      <SystemDataSyncBar
        isSyncing={isSystemSyncing}
        lastSyncedTime={lastSyncedTimeStr}
        autoSyncEnabled={securitySettings.autoSyncEnabled ?? true}
        syncIntervalSeconds={securitySettings.syncIntervalSeconds || 30}
        autoLockMinutes={autoLockMinutes}
        onManualSync={() => performDataSync(false)}
        onLockSystem={() => handleLockSystem('🔒 Mfumo umefungwa. Weka nenosiri au PIN yako kufungua tena.')}
        onOpenSecuritySettings={() => setIsSecuritySettingsModalOpen(true)}
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
            onDeletePatient={handleDeletePatient}
            onSelectActivePatientForView={handleSelectActivePatientForView}
            securitySettings={securitySettings}
            onUpdateSecuritySettings={setSecuritySettings}
            glucoseLogs={glucoseLogs}
            mealLogs={meals}
            onOpenAdminPractitionersModal={() => setIsAdminPractitionersModalOpen(true)}
            onOpenInstallerModal={() => setIsInstallerModalOpen(true)}
            onOpenSecuritySettings={() => setIsSecuritySettingsModalOpen(true)}
            onOpenAdminBackupModal={() => setIsDriveModalOpen(true)}
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

        {/* Kliniki ya Lishe ya Watoto (Pediatric Nutrition Clinic) */}
        {activeTab === 'pediatric' && (
          <ChildNutritionTrackerView
            patient={
              patients.find((p) => p.id === selectedPatientId && p.category === 'watoto_lishe') ||
              patients.find((p) => p.category === 'watoto_lishe') ||
              selectedPatient ||
              patients[0]
            }
            onUpdatePatient={handleUpdatePatient}
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
            onOpenDriveModal={() => setIsDriveModalOpen(true)}
            onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
            currentTheme={currentTheme}
            onOpenThemeModal={() => setIsThemeModalOpen(true)}
            authSession={authSession}
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

        {/* Kliniki ya Shinikizo la Damu (Presha - Hypertension Clinic) */}
        {activeTab === 'blood_pressure' && (
          <BloodPressureClinicView
            profile={profile}
            onUpdateProfile={setProfile}
            logs={bloodPressureLogs}
            onSaveLog={handleSaveBpLog}
            onDeleteLog={handleDeleteBpLog}
            activePatient={selectedPatient}
            onOpenDoctorConsultation={() => setActiveTab('online_doctors')}
            onOpenChatConsultation={() => setActiveTab('online_doctors')}
            onOpenPrintPlan={() => setIsOfflinePlanModalOpen(true)}
          />
        )}

        {/* Mwongozo wa Chakula & Sahani ya TFNC (Food Plate Guide) */}
        {activeTab === 'food_plate' && (
          <FoodPlateGuideView
            onOpenPrintPlan={() => setIsOfflinePlanModalOpen(true)}
            registeredCondition={selectedPatient?.category}
            activePatientName={selectedPatient?.fullName}
          />
        )}

        {/* Sehemu ya Kuwasiliana na Daktari Aliye Online & Karibu */}
        {activeTab === 'online_doctors' && (
          <NearbyOnlineDoctorView
            profile={profile}
            registeredPatients={patients}
            onOpenRegisterModal={() => {
              setRegisterInitialCategory('shinikizo_la_damu');
              setIsRegisterModalOpen(true);
            }}
            onSwitchToPatient={handleSelectActivePatientForView}
            doctors={doctors}
            onSaveDoctor={handleSaveDoctor}
            onDeleteDoctor={handleDeleteDoctor}
            onToggleDoctorOnline={handleToggleDoctorOnline}
            isAdmin={authSession?.role === 'admin'}
            onOpenAdminModal={() => setIsAdminPractitionersModalOpen(true)}
          />
        )}
      </main>

      {/* Modals */}
      <AdminPractitionersModal
        isOpen={isAdminPractitionersModalOpen}
        onClose={() => setIsAdminPractitionersModalOpen(false)}
        doctors={doctors}
        onSaveDoctor={handleSaveDoctor}
        onDeleteDoctor={handleDeleteDoctor}
        onToggleDoctorOnline={handleToggleDoctorOnline}
        onOpenInstallerModal={() => setIsInstallerModalOpen(true)}
      />

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
        authSession={authSession}
        securitySettings={securitySettings}
        onOpenSecuritySettings={() => {
          setIsProfileModalOpen(false);
          setIsSecuritySettingsModalOpen(true);
        }}
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
        isOpen={isAuthModalOpen || (!authSession && securitySettings.requireLoginFirst)}
        onClose={() => {
          if (!authSession && securitySettings.requireLoginFirst) return;
          setIsAuthModalOpen(false);
        }}
        isMandatory={!authSession && securitySettings.requireLoginFirst}
        patients={patients}
        doctors={doctors}
        securitySettings={securitySettings}
        currentSession={authSession}
        onLoginSuccess={(session) => {
          handleLoginSuccess(session);
          setIsAuthModalOpen(false);
        }}
        initialRole={authModalRole}
        onUpdatePatientPassword={handleUpdatePatientPassword}
        onUpdateDoctorPassword={handleUpdateDoctorPassword}
        onUpdateAdminPassword={handleUpdateAdminPassword}
      />

      {/* Theme Switcher Modal */}
      <ThemeSwitcherModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
      />

      {/* GitHub Sync Modal */}
      <GitHubSyncModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
      />

      {/* Google Drive Integration Modal */}
      <GoogleDriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        profile={profile}
        meals={meals}
        glucoseLogs={glucoseLogs}
      />

      {/* Offline Printable / Downloadable Eating Plan Modal */}
      <OfflinePrintableEatingPlanModal
        isOpen={isOfflinePlanModalOpen}
        onClose={() => setIsOfflinePlanModalOpen(false)}
        currentProfile={profile}
        registeredPatients={patients}
      />

      {/* Meal Timing & Hydration Reminders Modal */}
      <MealAndWaterReminderModal
        isOpen={isRemindersModalOpen}
        onClose={() => setIsRemindersModalOpen(false)}
        profile={profile}
        onUpdateProfile={setProfile}
        waterGlassesToday={waterGlassesToday}
        onLogWaterGlass={handleLogWaterGlass}
      />

      {/* PWA App Installer Modal for Admin / Practitioner */}
      <AppInstallerModal
        isOpen={isInstallerModalOpen}
        onClose={() => setIsInstallerModalOpen(false)}
        userRole={authSession?.role || 'practitioner'}
        userName={authSession?.name}
      />

      {/* Clinical & Academic Security Governance Modal */}
      <ClinicalSecuritySettingsModal
        isOpen={isSecuritySettingsModalOpen}
        onClose={() => setIsSecuritySettingsModalOpen(false)}
        securitySettings={securitySettings}
        onUpdateSecuritySettings={(updated) => setSecuritySettings(updated)}
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
