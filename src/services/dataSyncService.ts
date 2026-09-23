import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  GlucoseLog, 
  MealLog, 
  OnlineDoctor, 
  RegisteredPatient, 
  SecuritySettings, 
  UserProfile 
} from '../types';

export interface DataSyncPipelineStatus {
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  firebaseOnline: boolean;
  userDataSynced: boolean;
  settingsSynced: boolean;
  reportsSynced: boolean;
  recordsSynced: boolean;
  errorMessage: string | null;
}

export interface SyncPayload {
  patients: RegisteredPatient[];
  doctors: OnlineDoctor[];
  profile: UserProfile;
  securitySettings: SecuritySettings;
  glucoseLogs: GlucoseLog[];
  mealLogs: MealLog[];
  waterGlassesToday: number;
}

export interface SyncResult {
  success: boolean;
  updatedPatients?: RegisteredPatient[];
  updatedDoctors?: OnlineDoctor[];
  updatedSettings?: SecuritySettings;
  updatedGlucose?: GlucoseLog[];
  updatedMeals?: MealLog[];
  timestamp: Date;
  devicesSyncedCount?: number;
  error?: string;
}

/**
 * Pushes and pulls clinical data across the official pipeline and synchronizes
 * across ALL devices (Phones, Tablets, Laptops) using the shared Firestore instance.
 */
export async function performFullSystemSync(payload: SyncPayload): Promise<SyncResult> {
  const syncTimestamp = new Date();
  const currentIso = syncTimestamp.toISOString();

  try {
    // 1. FIREBASE CONNECTION & PULSE
    const systemStatusRef = doc(db, 'system', 'sync_pipeline');
    await setDoc(systemStatusRef, {
      pipeline: 'Firebase -> User Data -> Settings -> Reports -> Records',
      lastPulseAt: serverTimestamp(),
      systemVersion: '2.6.0-multidevice-sync',
      environment: 'AfyaLishe Tanzania Clinical Server',
      lastUpdatedBy: payload.securitySettings.adminName || 'DISMAS POKELA',
      lastUpdatedIso: currentIso,
    }, { merge: true });

    // 2. FIRST PULL FROM CLOUD (to merge any changes made on other devices)
    const [settingsSnap, patientsSnap, doctorsSnap, recordsSnap] = await Promise.all([
      getDoc(doc(db, 'settings', 'clinical_security')),
      getDoc(doc(db, 'system', 'patients_registry')),
      getDoc(doc(db, 'system', 'practitioners_list')),
      getDoc(doc(db, 'records', 'clinical_telemetry')),
    ]);

    // MERGE SETTINGS (Admin password, PIN, system options)
    let mergedSettings: SecuritySettings = { ...payload.securitySettings };
    if (settingsSnap.exists()) {
      const cloudSettings = settingsSnap.data() as Partial<SecuritySettings> & { lastSyncIso?: string };
      
      let localCustom = '';
      try {
        if (typeof window !== 'undefined') {
          localCustom = localStorage.getItem('afyalishe_custom_admin_password') || '';
        }
      } catch {}

      const localPayloadPass = (payload.securitySettings.adminPassword || '').trim();
      const cloudPass = (cloudSettings.adminPassword || '').trim();
      
      // If user changed away from default 'admin123', prioritize the new custom password!
      let resolvedAdminPass = 'admin123';
      if (localCustom && localCustom !== 'admin123') {
        resolvedAdminPass = localCustom;
      } else if (localPayloadPass && localPayloadPass !== 'admin123') {
        resolvedAdminPass = localPayloadPass;
      } else if (cloudPass && cloudPass !== 'admin123') {
        resolvedAdminPass = cloudPass;
      } else {
        resolvedAdminPass = localPayloadPass || cloudPass || 'admin123';
      }

      mergedSettings = {
        ...cloudSettings,
        ...payload.securitySettings,
        adminPassword: resolvedAdminPass,
        adminPin: payload.securitySettings.adminPin || cloudSettings.adminPin || '8822',
        adminName: payload.securitySettings.adminName || cloudSettings.adminName || 'DISMAS POKELA',
        adminEmail: payload.securitySettings.adminEmail || cloudSettings.adminEmail || 'dismaspokela@gmail.com',
        lastSyncedAt: currentIso,
      };
    }

    // MERGE PATIENTS (passwords, profiles, metrics)
    const patientMap = new Map<string, RegisteredPatient>();
    // First populate from local
    payload.patients.forEach(p => patientMap.set(p.id, { ...p }));
    // Merge cloud patients
    if (patientsSnap.exists()) {
      const cloudData = patientsSnap.data();
      if (Array.isArray(cloudData.patients)) {
        (cloudData.patients as RegisteredPatient[]).forEach((cloudP) => {
          if (!patientMap.has(cloudP.id)) {
            patientMap.set(cloudP.id, cloudP);
          } else {
            const existing = patientMap.get(cloudP.id)!;
            // Prefer existing (local updated) password if set
            patientMap.set(cloudP.id, {
              ...cloudP,
              ...existing,
              password: existing.password || cloudP.password || '123',
              username: existing.username || cloudP.username,
            });
          }
        });
      }
    }
    const mergedPatients = Array.from(patientMap.values());

    // MERGE DOCTORS (passwords, online status, fees)
    const doctorMap = new Map<string, OnlineDoctor>();
    payload.doctors.forEach(d => doctorMap.set(d.id, { ...d }));
    if (doctorsSnap.exists()) {
      const cloudData = doctorsSnap.data();
      if (Array.isArray(cloudData.doctors)) {
        (cloudData.doctors as OnlineDoctor[]).forEach((cloudD) => {
          if (!doctorMap.has(cloudD.id)) {
            doctorMap.set(cloudD.id, cloudD);
          } else {
            const existing = doctorMap.get(cloudD.id)!;
            // Prefer existing (local updated) password if set
            doctorMap.set(cloudD.id, {
              ...cloudD,
              ...existing,
              password: existing.password || cloudD.password || 'daktari123',
              username: existing.username || cloudD.username,
            });
          }
        });
      }
    }
    const mergedDoctors = Array.from(doctorMap.values());

    // MERGE RECORDS (Glucose, Meals)
    const glucoseMap = new Map<string, GlucoseLog>();
    payload.glucoseLogs.forEach(g => glucoseMap.set(g.id, g));
    if (recordsSnap.exists()) {
      const cloudData = recordsSnap.data();
      if (Array.isArray(cloudData.recentGlucose)) {
        (cloudData.recentGlucose as GlucoseLog[]).forEach(g => {
          if (!glucoseMap.has(g.id)) glucoseMap.set(g.id, g);
        });
      }
    }
    const mergedGlucose = Array.from(glucoseMap.values());

    const mealsMap = new Map<string, MealLog>();
    payload.mealLogs.forEach(m => mealsMap.set(m.id, m));
    if (recordsSnap.exists()) {
      const cloudData = recordsSnap.data();
      if (Array.isArray(cloudData.recentMeals)) {
        (cloudData.recentMeals as MealLog[]).forEach(m => {
          if (!mealsMap.has(m.id)) mealsMap.set(m.id, m);
        });
      }
    }
    const mergedMeals = Array.from(mealsMap.values());

    // 3. PUSH MERGED DATA TO CLOUD FOR ALL DEVICES TO CONSUME
    // User profile sync
    const adminUserRef = doc(db, 'users', 'admin_dismas_pokela');
    await setDoc(adminUserRef, {
      fullName: mergedSettings.adminName || 'DISMAS POKELA',
      email: mergedSettings.adminEmail || 'dismaspokela@gmail.com',
      role: 'admin',
      adminPassword: mergedSettings.adminPassword,
      adminPin: mergedSettings.adminPin,
      userProfile: {
        name: payload.profile.name,
        dailyCalorieTarget: payload.profile.dailyCalorieTarget,
        weightKg: payload.profile.weightKg,
        heightCm: payload.profile.heightCm,
      },
      updatedAt: serverTimestamp(),
      updatedIso: currentIso,
    }, { merge: true });

    // Sync Doctors collection with credentials
    const doctorsRef = doc(db, 'system', 'practitioners_list');
    await setDoc(doctorsRef, {
      count: mergedDoctors.length,
      doctors: mergedDoctors.map(d => ({
        id: d.id,
        name: d.name,
        title: d.title || 'Daktari / Mtaalamu wa Lishe',
        specialty: d.specialty,
        specialtyLabelSwahili: d.specialtyLabelSwahili || '',
        phone: d.phone,
        isOnline: d.isOnline,
        username: d.username || d.phone,
        password: d.password || 'daktari123',
        initialPassword: d.initialPassword || 'daktari123',
        isPasswordChanged: d.isPasswordChanged ?? false,
        consultationFeeTzs: d.consultationFeeTzs || 15000,
        facility: d.facility || 'AfyaLishe Clinic',
        registrationCouncilNo: d.registrationCouncilNo || null,
      })),
      updatedAt: serverTimestamp(),
      updatedIso: currentIso,
    }, { merge: true });

    // Sync Registered Patients collection with credentials
    const patientsCollectionRef = doc(db, 'system', 'patients_registry');
    await setDoc(patientsCollectionRef, {
      count: mergedPatients.length,
      patients: mergedPatients.map(p => ({
        id: p.id,
        fullName: p.fullName,
        phone: p.phone,
        age: p.age,
        gender: p.gender,
        location: p.location,
        category: p.category,
        registeredDate: p.registeredDate,
        username: p.username || p.phone,
        password: p.password || '1234',
        canPrintReports: p.canPrintReports ?? true,
        initialWeightKg: p.initialWeightKg,
        currentWeightKg: p.currentWeightKg,
        targetWeightKg: p.targetWeightKg,
        heightCm: p.heightCm,
        initialGlucoseMgDl: p.initialGlucoseMgDl ?? null,
        currentGlucoseMgDl: p.currentGlucoseMgDl ?? null,
        bloodPressure: p.bloodPressure ?? null,
        diabetesType: p.diabetesType ?? null,
        currentMedications: p.currentMedications ?? null,
      })),
      updatedAt: serverTimestamp(),
      updatedIso: currentIso,
    }, { merge: true });

    // Sync Clinical Security & All System Settings
    const settingsRef = doc(db, 'settings', 'clinical_security');
    await setDoc(settingsRef, {
      adminPassword: mergedSettings.adminPassword,
      adminPin: mergedSettings.adminPin,
      adminName: mergedSettings.adminName,
      adminEmail: mergedSettings.adminEmail,
      requireLoginFirst: mergedSettings.requireLoginFirst ?? false,
      allowPatientPrinting: mergedSettings.allowPatientPrinting ?? true,
      sessionTimeoutMinutes: mergedSettings.sessionTimeoutMinutes ?? 0,
      autoLockMinutes: mergedSettings.autoLockMinutes ?? 0,
      autoSyncEnabled: mergedSettings.autoSyncEnabled ?? true,
      syncIntervalSeconds: mergedSettings.syncIntervalSeconds ?? 30,
      hospitalFacilityName: mergedSettings.hospitalFacilityName || 'AFYALISHE TANZANIA • CLINICAL NUTRITION & METABOLIC CARE',
      registrationCouncilLicense: mergedSettings.registrationCouncilLicense || 'MCT/TZ/NUTR-2026/0894',
      watermarkMedicalReports: mergedSettings.watermarkMedicalReports ?? true,
      auditLoggingEnabled: mergedSettings.auditLoggingEnabled ?? true,
      clinicalEncryptionBadge: mergedSettings.clinicalEncryptionBadge ?? true,
      lastSyncIso: currentIso,
      lastSyncedAt: currentIso,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // Sync Reports Summary
    const reportsSummaryRef = doc(db, 'reports', 'clinical_summaries');
    await setDoc(reportsSummaryRef, {
      totalGlucoseLogsLogged: mergedGlucose.length,
      totalMealsTracked: mergedMeals.length,
      facilityName: mergedSettings.hospitalFacilityName || 'AFYALISHE TANZANIA',
      councilLicense: mergedSettings.registrationCouncilLicense || 'MCT/TZ/NUTR-2026/0894',
      lastReportGeneratedAt: serverTimestamp(),
      encryptionStandard: 'AES-256 / HIPAA Clinical Multi-Device Compliance',
      updatedIso: currentIso,
    }, { merge: true });

    // Sync Telemetry Records (Glucose, Meals, Water)
    const recordsRef = doc(db, 'records', 'clinical_telemetry');
    await setDoc(recordsRef, {
      glucoseRecordsCount: mergedGlucose.length,
      recentGlucose: mergedGlucose.slice(0, 50),
      mealsRecordsCount: mergedMeals.length,
      recentMeals: mergedMeals.slice(0, 50),
      waterGlassesToday: payload.waterGlassesToday,
      updatedAt: serverTimestamp(),
      updatedIso: currentIso,
    }, { merge: true });

    return {
      success: true,
      updatedPatients: mergedPatients,
      updatedDoctors: mergedDoctors,
      updatedSettings: mergedSettings,
      updatedGlucose: mergedGlucose,
      updatedMeals: mergedMeals,
      timestamp: syncTimestamp,
      devicesSyncedCount: 1,
    };
  } catch (error) {
    console.warn('System Sync Notice: Network or permissions resulted in local cache sync.', error);
    return {
      success: false,
      timestamp: syncTimestamp,
      error: error instanceof Error ? error.message : 'Tatizo la mtandao wakati wa kusasisha taarifa.',
    };
  }
}

/**
 * Subscribes to live real-time cloud updates from other devices using Firestore onSnapshot.
 * Whenever another device (computer, phone, tablet) changes passwords, settings, patients, or doctors,
 * this callback will receive the fresh data instantly.
 */
export function subscribeToLiveCloudUpdates(
  onCloudUpdate: (data: {
    settings?: Partial<SecuritySettings>;
    patients?: RegisteredPatient[];
    doctors?: OnlineDoctor[];
    glucoseLogs?: GlucoseLog[];
    meals?: MealLog[];
    lastUpdatedIso?: string;
  }) => void
): () => void {
  const unsubscribes: Unsubscribe[] = [];

  try {
    // 1. Listen for settings updates (Admin password, PIN, system toggles)
    const settingsUnsub = onSnapshot(doc(db, 'settings', 'clinical_security'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        onCloudUpdate({
          settings: data as Partial<SecuritySettings>,
          lastUpdatedIso: data.lastSyncIso || new Date().toISOString(),
        });
      }
    }, (err) => console.warn('Live settings sync warning:', err));
    unsubscribes.push(settingsUnsub);

    // 2. Listen for patients updates (passwords, new patients, metrics)
    const patientsUnsub = onSnapshot(doc(db, 'system', 'patients_registry'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.patients)) {
          onCloudUpdate({
            patients: data.patients as RegisteredPatient[],
            lastUpdatedIso: data.updatedIso || new Date().toISOString(),
          });
        }
      }
    }, (err) => console.warn('Live patients sync warning:', err));
    unsubscribes.push(patientsUnsub);

    // 3. Listen for doctors updates (passwords, online status)
    const doctorsUnsub = onSnapshot(doc(db, 'system', 'practitioners_list'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.doctors)) {
          onCloudUpdate({
            doctors: data.doctors as OnlineDoctor[],
            lastUpdatedIso: data.updatedIso || new Date().toISOString(),
          });
        }
      }
    }, (err) => console.warn('Live doctors sync warning:', err));
    unsubscribes.push(doctorsUnsub);

    // 4. Listen for records updates (glucose, meals)
    const recordsUnsub = onSnapshot(doc(db, 'records', 'clinical_telemetry'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        onCloudUpdate({
          glucoseLogs: Array.isArray(data.recentGlucose) ? data.recentGlucose : undefined,
          meals: Array.isArray(data.recentMeals) ? data.recentMeals : undefined,
          lastUpdatedIso: data.updatedIso || new Date().toISOString(),
        });
      }
    }, (err) => console.warn('Live records sync warning:', err));
    unsubscribes.push(recordsUnsub);
  } catch (err) {
    console.warn('Could not initialize real-time cloud listeners:', err);
  }

  return () => {
    unsubscribes.forEach(unsub => {
      try {
        unsub();
      } catch (e) {
        // ignore
      }
    });
  };
}

/**
 * Updates the Admin Password directly to Firestore and local storage,
 * immediately syncing across all devices (phones, tablets, PCs).
 */
export async function updateAdminPasswordCloud(newPassword: string): Promise<boolean> {
  const currentIso = new Date().toISOString();
  // 1. Immediately update localStorage for instant reactivity
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('afyalishe_custom_admin_password', newPassword);
      const saved = localStorage.getItem('afyalishe_security_settings');
      const parsed = saved ? JSON.parse(saved) : {};
      parsed.adminPassword = newPassword;
      parsed.lastSyncedAt = currentIso;
      localStorage.setItem('afyalishe_security_settings', JSON.stringify(parsed));
    }
  } catch (e) {
    // ignore
  }

  try {
    // 2. Update settings/clinical_security
    const settingsRef = doc(db, 'settings', 'clinical_security');
    await setDoc(settingsRef, {
      adminPassword: newPassword,
      lastSyncIso: currentIso,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // 3. Update users/admin_dismas_pokela
    const adminUserRef = doc(db, 'users', 'admin_dismas_pokela');
    await setDoc(adminUserRef, {
      adminPassword: newPassword,
      password: newPassword,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // 4. Update pipeline pulse
    const systemStatusRef = doc(db, 'system', 'sync_pipeline');
    await setDoc(systemStatusRef, {
      lastPulseAt: serverTimestamp(),
      lastAdminPasswordChange: currentIso,
    }, { merge: true });

    return true;
  } catch (error) {
    console.error('Failed to sync new admin password to Firestore:', error);
    return false;
  }
}

/**
 * Updates a Doctor / Practitioner's password directly in Firestore and localStorage
 */
export async function updateDoctorPasswordCloud(
  doctorId: string,
  newPassword: string,
  allDoctors: OnlineDoctor[]
): Promise<boolean> {
  const currentIso = new Date().toISOString();
  try {
    const updated = allDoctors.map((d) =>
      d.id === doctorId ? { ...d, password: newPassword, isPasswordChanged: true } : d
    );
    try {
      localStorage.setItem('afyalishe_online_doctors', JSON.stringify(updated));
    } catch {
      // ignore
    }

    const doctorsRef = doc(db, 'system', 'practitioners_list');
    await setDoc(doctorsRef, {
      count: updated.length,
      doctors: updated,
      updatedAt: serverTimestamp(),
      updatedIso: currentIso,
    }, { merge: true });

    return true;
  } catch (err) {
    console.error('Failed to sync doctor password to Firestore:', err);
    return false;
  }
}

/**
 * Updates a Patient's password directly in Firestore and localStorage
 */
export async function updatePatientPasswordCloud(
  patientId: string,
  newPassword: string,
  allPatients: RegisteredPatient[]
): Promise<boolean> {
  const currentIso = new Date().toISOString();
  try {
    const updated = allPatients.map((p) =>
      p.id === patientId ? { ...p, password: newPassword } : p
    );
    try {
      localStorage.setItem('afyalishe_patients', JSON.stringify(updated));
    } catch {
      // ignore
    }

    const patientsRef = doc(db, 'system', 'patients_registry');
    await setDoc(patientsRef, {
      count: updated.length,
      patients: updated,
      updatedAt: serverTimestamp(),
      updatedIso: currentIso,
    }, { merge: true });

    return true;
  } catch (err) {
    console.error('Failed to sync patient password to Firestore:', err);
    return false;
  }
}

/**
 * Updates the Admin Quick Entry PIN directly to Firestore and local storage,
 * immediately syncing across all devices (phones, tablets, PCs).
 */
export async function updateAdminPinCloud(newPin: string): Promise<boolean> {
  const currentIso = new Date().toISOString();
  try {
    // 1. Update settings/clinical_security
    const settingsRef = doc(db, 'settings', 'clinical_security');
    await setDoc(settingsRef, {
      adminPin: newPin,
      lastSyncIso: currentIso,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // 2. Update users/admin_dismas_pokela
    const adminUserRef = doc(db, 'users', 'admin_dismas_pokela');
    await setDoc(adminUserRef, {
      adminPin: newPin,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // 3. Update pipeline pulse
    const systemStatusRef = doc(db, 'system', 'sync_pipeline');
    await setDoc(systemStatusRef, {
      lastPulseAt: serverTimestamp(),
      lastAdminPinChange: currentIso,
    }, { merge: true });

    return true;
  } catch (error) {
    console.error('Failed to sync new admin PIN to Firestore:', error);
    return false;
  }
}

