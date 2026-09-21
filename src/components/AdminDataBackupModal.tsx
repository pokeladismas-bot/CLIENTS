import React, { useState, useRef } from 'react';
import { 
  X, Download, Upload, Database, FileSpreadsheet, ShieldAlert, 
  CheckCircle2, AlertCircle, FileJson, RefreshCw, HardDrive, Clock, UserCheck, Stethoscope
} from 'lucide-react';
import { 
  BloodPressureLog, GlucoseLog, MealLog, NutritionAnnouncement, 
  OnlineDoctor, RegisteredPatient, SecuritySettings 
} from '../types';

interface AdminDataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: RegisteredPatient[];
  doctors: OnlineDoctor[];
  glucoseLogs: GlucoseLog[];
  bloodPressureLogs: BloodPressureLog[];
  mealLogs: MealLog[];
  announcements: NutritionAnnouncement[];
  securitySettings: SecuritySettings;
  onRestoreData: (backupData: {
    patients?: RegisteredPatient[];
    doctors?: OnlineDoctor[];
    glucoseLogs?: GlucoseLog[];
    bloodPressureLogs?: BloodPressureLog[];
    mealLogs?: MealLog[];
    announcements?: NutritionAnnouncement[];
    securitySettings?: SecuritySettings;
  }) => void;
}

export const AdminDataBackupModal: React.FC<AdminDataBackupModalProps> = ({
  isOpen,
  onClose,
  patients,
  doctors,
  glucoseLogs,
  bloodPressureLogs,
  mealLogs,
  announcements,
  securitySettings,
  onRestoreData,
}) => {
  const [activeTab, setActiveTab] = useState<'download' | 'upload'>('download');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'analyzing' | 'ready' | 'success' | 'error'>('idle');
  const [parsedBackup, setParsedBackup] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [replaceMode, setReplaceMode] = useState<'overwrite' | 'merge'>('overwrite');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // 1. Download Full JSON Backup
  const handleDownloadFullBackup = () => {
    const backupPayload = {
      system: 'AfyaLishe Tanzania Clinical Portal',
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      adminInCharge: 'DISMAS POKELA',
      adminEmail: 'dismaspokela@gmail.com',
      summary: {
        totalPatients: patients.length,
        totalPractitioners: doctors.length,
        totalGlucoseLogs: glucoseLogs.length,
        totalBpLogs: bloodPressureLogs.length,
        totalMealLogs: mealLogs.length,
        totalAnnouncements: announcements.length,
      },
      data: {
        patients,
        doctors,
        glucoseLogs,
        bloodPressureLogs,
        mealLogs,
        announcements,
        securitySettings,
      },
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `afyalishe_system_backup_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setSuccessMessage('Nakala kamili ya mfumo (JSON Backup) imepakuliwa salama kwenye kifaa chako!');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // 2. Download Patients CSV
  const handleDownloadPatientsCsv = () => {
    const headers = ['ID', 'Jina Kamili', 'Simu', 'Kundi / Ugonjwa', 'Umri', 'Jinsia', 'Sukari ya Msingi', 'Presha', 'Uzito wa Sasa', 'Tarehe ya Usajili'];
    const rows = patients.map((p) => [
      p.id,
      `"${p.fullName}"`,
      `"${p.phone}"`,
      `"${p.category || 'kisukari'}"`,
      p.age,
      p.gender,
      p.baselineGlucoseMgDl || 'N/A',
      `"${p.bloodPressure || 'N/A'}"`,
      p.currentWeightKg || p.initialWeightKg || 'N/A',
      `"${p.registeredDate || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `orodha_ya_wagonjwa_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    setSuccessMessage('Orodha ya wagonjwa imepakuliwa kama CSV/Excel!');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // 3. Download Doctors CSV
  const handleDownloadDoctorsCsv = () => {
    const headers = ['ID', 'Jina la Daktari', 'Cheo', 'Kada', 'Simu', 'WhatsApp', 'Email', 'Ada ya Ushauri (TZS)', 'Lipa Namba', 'Hali Hewani'];
    const rows = doctors.map((d) => [
      d.id,
      `"${d.name}"`,
      `"${d.title}"`,
      `"${d.roleType || 'doctor'}"`,
      `"${d.phone}"`,
      `"${d.whatsappNumber || ''}"`,
      `"${d.email || ''}"`,
      d.consultationFeeTzs || 10000,
      `"${d.paymentDetails?.lipaNamba || ''}"`,
      d.isOnline ? 'Online' : 'Offline',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `orodha_ya_madaktari_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    setSuccessMessage('Orodha ya madaktari na ada zao imepakuliwa kama CSV!');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // 4. Handle File Upload / Inspection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setUploadStatus('analyzing');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const json = JSON.parse(text);

        // Validate payload structure
        const data = json.data || json;
        if (!data.patients && !data.doctors && !data.glucoseLogs) {
          throw new Error('Faili hili halina muundo sahihi wa nakala ya mfumo wa AfyaLishe.');
        }

        setParsedBackup(data);
        setUploadStatus('ready');
      } catch (err: any) {
        setErrorMessage(err?.message || 'Hitilafu ya kusoma faili la JSON. Hakikisha ni faili sahihi.');
        setUploadStatus('error');
      }
    };
    reader.onerror = () => {
      setErrorMessage('Hitilafu wakati wa kupakia faili kutoka kwenye kifaa chako.');
      setUploadStatus('error');
    };
    reader.readAsText(file);
  };

  // 5. Execute Restore
  const handleExecuteRestore = () => {
    if (!parsedBackup) return;

    try {
      if (replaceMode === 'overwrite') {
        onRestoreData({
          patients: parsedBackup.patients || [],
          doctors: parsedBackup.doctors || [],
          glucoseLogs: parsedBackup.glucoseLogs || [],
          bloodPressureLogs: parsedBackup.bloodPressureLogs || [],
          mealLogs: parsedBackup.mealLogs || [],
          announcements: parsedBackup.announcements || [],
          securitySettings: parsedBackup.securitySettings || securitySettings,
        });
      } else {
        // Merge mode
        const mergedPatients = [...(parsedBackup.patients || [])];
        patients.forEach((p) => {
          if (!mergedPatients.some((mp) => mp.id === p.id)) {
            mergedPatients.push(p);
          }
        });

        const mergedDoctors = [...(parsedBackup.doctors || [])];
        doctors.forEach((d) => {
          if (!mergedDoctors.some((md) => md.id === d.id)) {
            mergedDoctors.push(d);
          }
        });

        onRestoreData({
          patients: mergedPatients,
          doctors: mergedDoctors,
          glucoseLogs: [...(parsedBackup.glucoseLogs || []), ...glucoseLogs],
          bloodPressureLogs: [...(parsedBackup.bloodPressureLogs || []), ...bloodPressureLogs],
          mealLogs: [...(parsedBackup.mealLogs || []), ...mealLogs],
          announcements: parsedBackup.announcements || announcements,
        });
      }

      setUploadStatus('success');
      setSuccessMessage('Data zote za mfumo zimerejeshwa na kusawazishwa kikamilifu!');
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMessage('Hitilafu wakati wa kurejesha data: ' + err?.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm" id="admin-backup-restore-modal">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-black uppercase tracking-wider mb-0.5">
                Msimamizi wa Mfumo: DISMAS POKELA
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Kituo cha Kuhifadhi & Kurejesha Data (Backup & Restore)
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            id="btn-close-admin-backup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 pt-4 bg-slate-100 border-b border-slate-200 flex items-center gap-3">
          <button
            onClick={() => {
              setActiveTab('download');
              setErrorMessage(null);
            }}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'download'
                ? 'border-teal-600 text-teal-900 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Pakua Data (Download Backup)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('upload');
              setErrorMessage(null);
            }}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'border-teal-600 text-teal-900 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Pakia & Rejesha Data (Restore)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">

          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-bold flex items-center gap-3 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm font-bold flex items-center gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: DOWNLOAD / EXPORT */}
          {activeTab === 'download' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 text-teal-950 text-xs leading-relaxed">
                <p className="font-extrabold mb-1">👑 Muhtasari wa Data Zilizopo Sasa Kwenye Mfumo:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 font-bold text-slate-700">
                  <div className="bg-white p-2.5 rounded-xl border border-teal-100 shadow-xs">
                    <span className="text-teal-700 block text-lg font-black">{patients.length}</span>
                    <span className="text-[11px] text-slate-500">Wagonjwa Waliosajiliwa</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-teal-100 shadow-xs">
                    <span className="text-teal-700 block text-lg font-black">{doctors.length}</span>
                    <span className="text-[11px] text-slate-500">Madaktari & Wataalamu</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-teal-100 shadow-xs">
                    <span className="text-teal-700 block text-lg font-black">{glucoseLogs.length}</span>
                    <span className="text-[11px] text-slate-500">Kumbukumbu za Sukari</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-teal-100 shadow-xs">
                    <span className="text-teal-700 block text-lg font-black">{bloodPressureLogs.length}</span>
                    <span className="text-[11px] text-slate-500">Vipimo vya Presha</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-teal-100 shadow-xs">
                    <span className="text-teal-700 block text-lg font-black">{mealLogs.length}</span>
                    <span className="text-[11px] text-slate-500">Kumbukumbu za Milo</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-teal-100 shadow-xs">
                    <span className="text-teal-700 block text-lg font-black">{announcements.length}</span>
                    <span className="text-[11px] text-slate-500">Matangazo ya Kliniki</span>
                  </div>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleDownloadFullBackup}
                  className="w-full p-4 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-sm flex items-center justify-between shadow-lg shadow-teal-700/20 transition-all cursor-pointer"
                  id="btn-download-full-json"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <FileJson className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-black text-sm">Pakua Nakala Kamili ya Mfumo (.JSON)</div>
                      <div className="text-[11px] text-teal-100 font-normal">
                        Hujumuisha wagonjwa, madaktari, ada zao, vipimo, milo na mipangilio yote ya admin
                      </div>
                    </div>
                  </div>
                  <Download className="w-5 h-5 shrink-0 ml-2" />
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleDownloadPatientsCsv}
                    className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs flex items-center justify-between transition-all cursor-pointer shadow-xs"
                    id="btn-download-patients-csv"
                  >
                    <div className="flex items-center gap-2.5 text-left">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                      <div>
                        <div>Pakua Orodha ya Wagonjwa</div>
                        <div className="text-[10px] text-slate-400 font-normal">Excel / CSV Format</div>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={handleDownloadDoctorsCsv}
                    className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs flex items-center justify-between transition-all cursor-pointer shadow-xs"
                    id="btn-download-doctors-csv"
                  >
                    <div className="flex items-center gap-2.5 text-left">
                      <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                      <div>
                        <div>Pakua Orodha ya Madaktari & Ada</div>
                        <div className="text-[10px] text-slate-400 font-normal">Excel / CSV Format</div>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD / RESTORE */}
          {activeTab === 'upload' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold block">Tahadhari ya Kurejesha Data:</span>
                  <span>
                    Kupakia faili la JSON kutarudisha taarifa zote zilizohifadhiwa. Chagua kama unataka kufuta zilizopo (Overwrite) au kuunganisha bila kufuta (Merge).
                  </span>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/40 hover:bg-teal-50/70 p-8 rounded-3xl text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="font-extrabold text-sm text-slate-800">
                  Bonyeza hapa kuchagua faili la nakala (.JSON)
                </div>
                <div className="text-xs text-slate-500">
                  Faili zilizopakuliwa kutoka kwenye kitufe cha "Pakua Nakala Kamili ya Mfumo"
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Inspected Content Preview */}
              {parsedBackup && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-300 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="font-black text-sm text-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Data Zilizogunduliwa Kwenye Faili:</span>
                    </div>
                    <span className="text-xs font-bold text-teal-700 bg-teal-100 px-2.5 py-0.5 rounded-full">
                      Faili Sahihi
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-bold text-slate-700">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-900 block font-black text-base">
                        {parsedBackup.patients?.length || 0}
                      </span>
                      <span className="text-[11px] text-slate-500">Wagonjwa</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-900 block font-black text-base">
                        {parsedBackup.doctors?.length || 0}
                      </span>
                      <span className="text-[11px] text-slate-500">Madaktari & Wataalamu</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-900 block font-black text-base">
                        {parsedBackup.glucoseLogs?.length || 0}
                      </span>
                      <span className="text-[11px] text-slate-500">Kumbukumbu za Sukari</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-900 block font-black text-base">
                        {parsedBackup.bloodPressureLogs?.length || 0}
                      </span>
                      <span className="text-[11px] text-slate-500">Vipimo vya Presha</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-900 block font-black text-base">
                        {parsedBackup.mealLogs?.length || 0}
                      </span>
                      <span className="text-[11px] text-slate-500">Milo</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-900 block font-black text-base">
                        {parsedBackup.announcements?.length || 0}
                      </span>
                      <span className="text-[11px] text-slate-500">Matangazo</span>
                    </div>
                  </div>

                  {/* Mode Selector */}
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="text-xs font-bold text-slate-800">Mfumo wa Kurejesha (Restore Mode):</div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setReplaceMode('overwrite')}
                        className={`p-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                          replaceMode === 'overwrite'
                            ? 'bg-teal-900 text-white border-teal-900 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Futa & Weka Mpya (Overwrite)
                      </button>
                      <button
                        type="button"
                        onClick={() => setReplaceMode('merge')}
                        className={`p-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                          replaceMode === 'merge'
                            ? 'bg-teal-900 text-white border-teal-900 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Unganisha (Merge)
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleExecuteRestore}
                    className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-[0.99] text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    id="btn-confirm-restore"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Thibitisha Kurejesha Data Zote Sasa</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>AfyaLishe Security & Backup Module</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors cursor-pointer"
          >
            Funga
          </button>
        </div>

      </div>
    </div>
  );
};
