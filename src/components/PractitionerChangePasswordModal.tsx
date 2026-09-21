import React, { useState } from 'react';
import { X, KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import { OnlineDoctor } from '../types';

interface PractitionerChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: OnlineDoctor;
  onUpdatePassword: (doctorId: string, newPassword: string) => void;
}

export const PractitionerChangePasswordModal: React.FC<PractitionerChangePasswordModalProps> = ({
  isOpen,
  onClose,
  doctor,
  onUpdatePassword,
}) => {
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate current password if existing
    const actualCurrentPassword = doctor.password || doctor.initialPassword || '1234';
    if (currentPasswordInput.trim() !== actualCurrentPassword.trim()) {
      setErrorMessage('Nenosiri la sasa uliloweka si sahihi. Tafadhali hakiki tena au wasiliana na Admin DISMAS POKELA.');
      return;
    }

    if (newPassword.trim().length < 4) {
      setErrorMessage('Nenosiri jipya lazima liwe na angalau herufi au namba 4.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Nenosiri jipya na uthibitisho havilingani. Tafadhali hakiki.');
      return;
    }

    onUpdatePassword(doctor.id, newPassword.trim());
    setSuccessMessage('Nenosiri lako limebadilishwa kikamilifu! Mfumo umesasisha taarifa zako.');
    setTimeout(() => {
      onClose();
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm" id="change-practitioner-password-modal">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg">Badilisha Nenosiri Lako</h3>
              <p className="text-xs text-teal-200/80">{doctor.name}</p>
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
          
          <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-teal-950 text-xs flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
            <span>
              Kama mtaalamu, unaweza kubadilisha nenosiri la kuanzia ulilopewa na Admin wakati wowote.
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Current password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Nenosiri la Sasa</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPasswordInput}
                onChange={(e) => setCurrentPasswordInput(e.target.value)}
                placeholder="Weka nenosiri la sasa au la awali..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Nenosiri Jipya</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Weka nenosiri jipya salama..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm new password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Thibitisha Nenosiri Jipya</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Rudia nenosiri jipya..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-[0.99] text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Hifadhi Nenosiri Jipya</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
