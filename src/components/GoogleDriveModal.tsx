import React, { useState, useEffect } from 'react';
import { 
  Cloud, HardDrive, CheckCircle2, AlertCircle, ExternalLink, 
  Trash2, RefreshCw, UploadCloud, FileText, Check, ShieldCheck, 
  X, Sparkles, LogOut, ArrowRight
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  signInWithGoogleDrive, 
  signOutGoogleDrive, 
  listAfyaLisheDriveFiles, 
  uploadReportToGoogleDrive, 
  deleteFileFromDrive, 
  DriveFileItem,
  getCachedDriveToken,
  auth
} from '../services/googleDriveService';
import { GlucoseLog, MealLog, UserProfile } from '../types';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  meals: MealLog[];
  glucoseLogs: GlucoseLog[];
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  profile,
  meals,
  glucoseLogs,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Destructive deletion confirmation state
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const cleanPatientName = (profile.name || '')
    .replace(/Mgonjwa wa Kisukari\s*\(?/gi, '')
    .replace(/\)/g, '')
    .trim() || 'Mteja';

  const loadFiles = async () => {
    if (!getCachedDriveToken()) return;
    setIsLoadingFiles(true);
    try {
      const driveFiles = await listAfyaLisheDriveFiles();
      setFiles(driveFiles);
    } catch (err: any) {
      console.error('Failed to load drive files:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentUser(auth.currentUser);
      if (getCachedDriveToken()) {
        loadFiles();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setFeedback(null);
    try {
      const res = await signInWithGoogleDrive();
      setCurrentUser(res.user);
      setFeedback({
        type: 'success',
        message: `Umeunganishwa kikamilifu na Google Drive (${res.user.email})!`,
      });
      await loadFiles();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Haikuweza kuunganisha na Google Drive. Jaribu tena.',
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await signOutGoogleDrive();
      setCurrentUser(null);
      setFiles([]);
      setFeedback({
        type: 'success',
        message: 'Umejitenga (logged out) kutoka kwenye Google Drive.',
      });
    } catch (err: any) {
      console.error('Sign out error:', err);
    }
  };

  const handleUploadTodayReport = async () => {
    if (!getCachedDriveToken()) {
      setFeedback({
        type: 'error',
        message: 'Tafadhali unganisha Google Drive kwanza.',
      });
      return;
    }

    setIsUploading(true);
    setFeedback(null);

    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `AfyaLishe_Ripoti_${cleanPatientName.replace(/\s+/g, '_')}_${dateStr}.json`;

      const reportPayload = {
        title: 'AfyaLishe - Ripoti ya Lishe na Sukari',
        tarehe: new Date().toLocaleString('sw-TZ'),
        mgonjwa: {
          jina: cleanPatientName,
          aina_ya_kisukari: profile.diabetesType,
          uzito_kg: profile.weightKg,
          urefu_cm: profile.heightCm,
          lenggo_la_wanga_gram: profile.targetDailyCarbs,
        },
        vipimo_vya_sukari_vya_leo: glucoseLogs.slice(0, 5),
        milo_ya_leo: meals.slice(0, 5),
        muhtasari_wa_kilishe: 'Faili hili limehifadhiwa kiotomatiki kutoka kwenye mfumo wa AfyaLishe kuweka kumbukumbu zako salama kwenye wingu la Google Drive.',
      };

      const uploaded = await uploadReportToGoogleDrive(
        fileName,
        JSON.stringify(reportPayload, null, 2),
        'application/json',
        `Ripoti ya Lishe ya ${cleanPatientName} ya tarehe ${dateStr}`
      );

      setFeedback({
        type: 'success',
        message: `Ripoti "${uploaded.name}" imehifadhiwa salama kwenye Google Drive yako!`,
      });

      await loadFiles();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Hitilafu ya kupakia ripoti kwenye Google Drive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    try {
      await deleteFileFromDrive(fileToDelete.id);
      setFeedback({
        type: 'success',
        message: `Faili "${fileToDelete.name}" limefutwa kutoka Google Drive.`,
      });
      setFileToDelete(null);
      await loadFiles();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Hitilafu ya kufuta faili',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const isConnected = !!currentUser && !!getCachedDriveToken();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
              <HardDrive className="w-6 h-6 text-sky-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black tracking-tight">Hifadhi Kwenye Google Drive</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Cloud Backup
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Hifadhi na dhibiti ripoti za lishe, milo na sukari moja kwa moja kwenye Google Drive yako
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          
          {/* Feedback message */}
          {feedback && (
            <div
              className={`p-4 rounded-2xl text-xs flex items-start gap-2.5 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border border-rose-200 text-rose-900'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-medium">{feedback.message}</div>
            </div>
          )}

          {/* Authentication State Card */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {isConnected ? (
              <div className="flex items-center gap-3">
                {currentUser?.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Google User'}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-full border-2 border-sky-400"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center">
                    {currentUser?.email?.charAt(0).toUpperCase() || 'G'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {currentUser?.displayName || 'Akaunti ya Google'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-300">
                      Imeunganishwa
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 block truncate max-w-xs">
                    {currentUser?.email}
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">Akaunti ya Google Haijaunganishwa</h4>
                <p className="text-xs text-slate-500 max-w-sm mt-0.5">
                  Unganisha akaunti yako ya Google ili kuweka nakala salama ya ripoti zako kwenye Google Drive.
                </p>
              </div>
            )}

            <div>
              {isConnected ? (
                <button
                  type="button"
                  onClick={handleGoogleSignOut}
                  className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Ondoka (Sign Out)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs shadow-xs transition-all flex items-center gap-2.5 cursor-pointer disabled:opacity-60 active:scale-98"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{isSigningIn ? 'Inafungua Google...' : 'Ingia kwa Google Drive'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Action: Save current report */}
          <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-sky-950 font-bold text-sm">
                <FileText className="w-4 h-4 text-sky-700" />
                <span>Hifadhi Ripoti ya Lishe & Sukari ya Leo</span>
              </div>
              <p className="text-xs text-sky-800 leading-relaxed max-w-md">
                Inajumuisha vipimo {glucoseLogs.length} vya sukari, milo {meals.length} ya leo, na hesabu ya wanga ya {cleanPatientName}.
              </p>
            </div>

            <button
              type="button"
              onClick={handleUploadTodayReport}
              disabled={!isConnected || isUploading}
              className="py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs transition-all shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 whitespace-nowrap active:scale-98"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Inapakia kwenye Drive...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Hifadhi Sasa Kwenye Drive</span>
                </>
              )}
            </button>
          </div>

          {/* Files List in Google Drive */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-slate-700" />
                <h4 className="font-extrabold text-slate-900 text-sm">Faili Zilizohifadhiwa Kwenye Google Drive</h4>
                <span className="text-xs text-slate-500 font-bold">({files.length})</span>
              </div>
              {isConnected && (
                <button
                  type="button"
                  onClick={loadFiles}
                  disabled={isLoadingFiles}
                  className="text-xs text-sky-700 hover:text-sky-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                  <span>Sasisha Orodha</span>
                </button>
              )}
            </div>

            {!isConnected ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 text-xs text-slate-500">
                Tafadhali unganisha Google Drive hapo juu ili kuona ripoti zako zote zilizohifadhiwa.
              </div>
            ) : isLoadingFiles ? (
              <div className="p-8 text-center rounded-2xl border border-slate-200 text-xs text-slate-500 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-sky-600" />
                <span>Inatafuta faili zako za AfyaLishe kwenye Google Drive...</span>
              </div>
            ) : files.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 text-xs text-slate-500 space-y-1">
                <p className="font-bold text-slate-700">Hakuna faili za AfyaLishe zilizopatikana kwenye Drive yako bado.</p>
                <p>Bofya "Hifadhi Sasa Kwenye Drive" ili kuweka ripoti yako ya kwanza.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                {files.map((file) => (
                  <div key={file.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 text-xs block truncate" title={file.name}>
                          {file.name}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          {file.createdTime ? new Date(file.createdTime).toLocaleDateString('sw-TZ', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Google Drive'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="py-1.5 px-3 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>Fungua</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setFileToDelete(file)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Futa kutoka Google Drive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Usalama wa HIPAA & Google Cloud unaolinda taarifa zako za afya.</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors cursor-pointer"
          >
            Funga
          </button>
        </div>
      </div>

      {/* Explicit User Confirmation Dialog for Deleting Google Drive files (Mandatory per SKILL) */}
      {fileToDelete && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-rose-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-base text-slate-900">Thibitisha Kufuta Faili Kwenye Drive?</h4>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Je, una uhakika unataka kufuta faili hili kutoka kwenye akaunti yako ya Google Drive? Hatua hii haiwezi kutenduliwa mara baada ya kufuta.
            </p>

            <div className="p-3 bg-slate-100 rounded-xl font-mono text-xs text-slate-800 break-all font-semibold">
              {fileToDelete.name}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setFileToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Ghairi (Cancel)
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteFile}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Inafuta...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ndio, Futa Faili</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
