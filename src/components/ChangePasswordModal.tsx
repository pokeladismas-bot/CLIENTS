import React, { useState } from 'react';
import { X, KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff, ShieldCheck, Lock, Check } from 'lucide-react';
import { AuthSession, OnlineDoctor, RegisteredPatient, SecuritySettings } from '../types';
import { updateAdminPasswordCloud, updateDoctorPasswordCloud, updatePatientPasswordCloud } from '../services/dataSyncService';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  authSession: AuthSession | null;
  securitySettings: SecuritySettings;
  doctors?: OnlineDoctor[];
  patients?: RegisteredPatient[];
  onUpdateAdminPassword: (newPassword: string) => void;
  onUpdateDoctorPassword?: (doctorId: string, newPassword: string) => void;
  onUpdatePatientPassword?: (patientId: string, newPassword: string) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  authSession,
  securitySettings,
  doctors = [],
  patients = [],
  onUpdateAdminPassword,
  onUpdateDoctorPassword,
  onUpdatePatientPassword,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !authSession) return null;

  const role = authSession.role;
  const isTargetAdmin = role === 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cur = currentPassword.trim();
    const next = newPassword.trim();
    const conf = confirmPassword.trim();

    if (!next) {
      setErrorMessage('Tafadhali weka nenosiri jipya unalotaka kutumia.');
      return;
    }

    if (next.length < 3) {
      setErrorMessage('Nenosiri jipya lazima liwe na angalau herufi au tarakimu 3.');
      return;
    }

    if (next !== conf) {
      setErrorMessage('Nenosiri jipya na nenosiri la uthibitisho hayalingani.');
      return;
    }

    setIsSaving(true);

    try {
      if (isTargetAdmin) {
        // Apply update immediately to state, localStorage and Firestore
        onUpdateAdminPassword(next);
        await updateAdminPasswordCloud(next);

        setSuccessMessage('✅ Nenosiri la Admin limebadilishwa na kukubaliwa kikamilifu! Mabadiliko yamehifadhiwa kwenye mfumo na wingu (Firebase).');
      } else if (role === 'practitioner') {
        const doc = doctors.find((d) => d.username === authSession.username || d.email === authSession.username);
        if (doc) {
          onUpdateDoctorPassword?.(doc.id, next);
          await updateDoctorPasswordCloud(doc.id, next, doctors);
          setSuccessMessage('✅ Nenosiri la Mtaalamu limebadilishwa na kukubaliwa kikamilifu!');
        } else {
          onUpdateAdminPassword(next);
          await updateAdminPasswordCloud(next);
          setSuccessMessage('✅ Nenosiri limebadilishwa kikamilifu!');
        }
      } else if (role === 'patient' && authSession.patientId) {
        const pat = patients.find((p) => p.id === authSession.patientId);
        if (pat) {
          onUpdatePatientPassword?.(pat.id, next);
          await updatePatientPasswordCloud(pat.id, next, patients);
          setSuccessMessage('✅ Nenosiri/PIN yako imebadilishwa na kukubaliwa kikamilifu!');
        }
      } else {
        onUpdateAdminPassword(next);
        await updateAdminPasswordCloud(next);
        setSuccessMessage('✅ Nenosiri limesasishwa kikamilifu!');
      }

      setTimeout(() => {
        setIsSaving(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSuccessMessage(null);
        onClose();
      }, 1600);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Hitilafu imetokea wakati wa kubadilisha nenosiri. Tafadhali jaribu tena.');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#03342d] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg">Badilisha Nenosiri Lako</h3>
              <p className="text-xs text-teal-200/80">
                {authSession.name || authSession.username} ({isTargetAdmin ? 'Admin DISMAS POKELA' : role})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-teal-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-950 text-xs flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0" />
            <div className="space-y-0.5">
              <span className="font-bold block text-teal-900">Ruhusa ya Kubadili Nenosiri:</span>
              <span className="text-teal-800 leading-relaxed text-[11px]">
                {isTargetAdmin
                  ? 'Weka nenosiri lako jipya hapa chini kisha bofya "Kubali & Hifadhi". Litafanya kazi mara moja kwenye vifaa vyote.'
                  : 'Weka nenosiri jipya na uthibitishe kulibadilisha mara moja.'}
              </span>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Current Password (Optional for logged in user) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-teal-600" />
                <span>Nenosiri la Sasa:</span>
              </label>
              <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-md">
                Hiari (Uko ndani ya mfumo)
              </span>
            </div>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={isTargetAdmin ? `Nenosiri la sasa (chaguo-msingi: ${securitySettings.adminPassword || 'admin123'})` : 'Nenosiri la sasa (kama unalikumbuka)...'}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 text-xs text-slate-900 font-mono font-medium bg-white"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-teal-600" />
              <span>Nenosiri Jipya:</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Weka nenosiri jipya..."
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 text-xs text-slate-900 font-mono font-medium bg-white"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[10px] text-slate-500 block">
              Angalau herufi au tarakimu 3.
            </span>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-teal-600" />
              <span>Thibitisha Nenosiri Jipya:</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Rudia nenosiri jipya..."
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 text-xs text-slate-900 font-mono font-medium bg-white"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
            <Check className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="text-[11px] text-slate-600">
              Mabadiliko ya nenosiri yatakubaliwa moja kwa moja na kusasisha ufikiaji kwenye wingu (Firestore).
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Ghairi
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 text-xs font-black text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Inahifadhi...' : 'Kubali & Hifadhi Nenosiri Jipya'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
