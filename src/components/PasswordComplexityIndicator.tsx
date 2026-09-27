import React from 'react';
import { Check, X, ShieldCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { validatePasswordComplexity } from '../utils/passwordValidator';

interface PasswordComplexityIndicatorProps {
  password: string;
  className?: string;
  showAlways?: boolean;
}

export const PasswordComplexityIndicator: React.FC<PasswordComplexityIndicatorProps> = ({
  password,
  className = '',
  showAlways = false,
}) => {
  const result = validatePasswordComplexity(password);
  const isDirty = password.length > 0;

  if (!isDirty && !showAlways) {
    return null;
  }

  // Bar colors
  const getStrengthBarColor = () => {
    switch (result.strength) {
      case 'weak':
        return 'bg-rose-500';
      case 'medium':
        return 'bg-amber-500';
      case 'strong':
        return 'bg-emerald-600';
      default:
        return 'bg-slate-200';
    }
  };

  const getStrengthBadgeClass = () => {
    switch (result.strength) {
      case 'weak':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'strong':
        return 'bg-emerald-100 text-emerald-850 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div
      className={`p-3 rounded-2xl border transition-all duration-200 ${
        result.isValid
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          : isDirty
          ? 'bg-slate-50 border-slate-200 text-slate-800'
          : 'bg-slate-50/50 border-slate-200/60 text-slate-700'
      } ${className}`}
    >
      {/* Header: Strength Meter & Label */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {result.isValid ? (
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0" />
          )}
          <span className="text-[11px] font-extrabold text-slate-700">
            Uthabiti wa Nenosiri (Password Strength):
          </span>
        </div>
        <span
          className={`text-[10px] font-black px-2 py-0.5 rounded-full border flex items-center gap-1 ${getStrengthBadgeClass()}`}
        >
          {result.isValid && <Sparkles className="w-2.5 h-2.5" />}
          <span>{result.strengthLabelSwahili}</span>
          <span className="opacity-60 text-[9px]">({result.passedCount}/{result.totalRequirements})</span>
        </span>
      </div>

      {/* Progress / Strength Bar */}
      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2.5 flex gap-1">
        <div
          className={`h-full flex-1 rounded-full transition-all duration-300 ${
            result.passedCount >= 1 ? getStrengthBarColor() : 'bg-slate-200'
          }`}
        />
        <div
          className={`h-full flex-1 rounded-full transition-all duration-300 ${
            result.passedCount >= 2 ? getStrengthBarColor() : 'bg-slate-200'
          }`}
        />
        <div
          className={`h-full flex-1 rounded-full transition-all duration-300 ${
            result.passedCount >= 3 ? getStrengthBarColor() : 'bg-slate-200'
          }`}
        />
      </div>

      {/* Checklist of 3 requirements */}
      <div className="space-y-1.5">
        {result.requirements.map((req) => (
          <div
            key={req.id}
            className={`flex items-center gap-2 text-xs transition-colors duration-150 ${
              req.isMet
                ? 'text-emerald-700 font-bold'
                : isDirty
                ? 'text-slate-600 font-medium'
                : 'text-slate-400 font-normal'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] transition-all duration-200 ${
                req.isMet
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : isDirty
                  ? 'bg-slate-200 text-slate-500'
                  : 'border border-slate-300 bg-white text-transparent'
              }`}
            >
              {req.isMet ? (
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              ) : isDirty ? (
                <X className="w-2.5 h-2.5 stroke-[2.5]" />
              ) : null}
            </div>
            <span className="text-[11px] leading-tight select-none">
              {req.labelSwahili}
            </span>
          </div>
        ))}
      </div>

      {/* Status helper text */}
      {result.isValid ? (
        <div className="mt-2 pt-1.5 border-t border-emerald-200/60 flex items-center gap-1.5 text-[11px] text-emerald-800 font-bold">
          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Nenosiri limekamilika na limekidhi vigezo vyote vya kiusalama!</span>
        </div>
      ) : isDirty ? (
        <div className="mt-2 pt-1.5 border-t border-slate-200 flex items-center gap-1.5 text-[10px] text-amber-700 font-medium">
          <span>Kamilisha vigezo vyote vilivyobaki ili kuendelea.</span>
        </div>
      ) : null}
    </div>
  );
};
