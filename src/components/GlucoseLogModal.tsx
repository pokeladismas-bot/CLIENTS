import React, { useState } from 'react';
import { HeartPulse, X, AlertTriangle, CheckCircle2, Info, Clock, Printer, FileDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GlucoseLog, MeasurementTiming, UserProfile } from '../types';

interface GlucoseLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveGlucose: (log: GlucoseLog) => void;
  onSaveAndPrint?: (log: GlucoseLog) => void;
  profile: UserProfile;
}

export const GlucoseLogModal: React.FC<GlucoseLogModalProps> = ({
  isOpen,
  onClose,
  onSaveGlucose,
  onSaveAndPrint,
  profile,
}) => {
  const [valueStr, setValueStr] = useState<string>('');
  const [timing, setTiming] = useState<MeasurementTiming>('fasting');
  const [notes, setNotes] = useState<string>('');
  const [unit, setUnit] = useState<'mg/dL' | 'mmol/L'>(profile.unit);

  if (!isOpen) return null;

  const numVal = parseFloat(valueStr);
  const mgDlVal = isNaN(numVal) ? null : unit === 'mmol/L' ? Math.round(numVal * 18) : Math.round(numVal);

  const getStatus = (val: number | null, t: MeasurementTiming): {
    status: 'chini' | 'kawaida' | 'juu' | 'hatari';
    label: string;
    color: string;
    bg: string;
    advice: string;
  } => {
    if (val === null) {
      return {
        status: 'kawaida',
        label: 'Weka namba kupata tathmini',
        color: 'text-slate-500',
        bg: 'bg-slate-50 border-slate-200',
        advice: 'Pima sukari kwa kutumia kipimo chako cha glukometa.',
      };
    }

    const isPostMeal = t.startsWith('post_');

    if (val < 70) {
      return {
        status: 'chini',
        label: 'Chini Sana (Hypoglycemia)',
        color: 'text-amber-800',
        bg: 'bg-amber-50 border-amber-300',
        advice: 'Tahadhari ya Sukari Kushuka! Tumia Kanuni ya 15: Kunywa nusu glasi ya juisi au vijiko 3 vya sukari/asali, kisha pima tena baada ya dakika 15.',
      };
    }

    if (isPostMeal) {
      if (val <= 180) {
        return {
          status: 'kawaida',
          label: 'Kiwango Kizuri cha Baada ya Kula',
          color: 'text-emerald-800',
          bg: 'bg-emerald-50 border-emerald-300',
          advice: 'Hongera! Sukari yako iko ndani ya lengo la chini ya 180 mg/dL masaa 2 baada ya mlo.',
        };
      } else if (val <= 250) {
        return {
          status: 'juu',
          label: 'Kiwango cha Juu (Hyperglycemia)',
          color: 'text-rose-800',
          bg: 'bg-rose-50 border-rose-300',
          advice: 'Sukari imepanda. Kunywa maji mengi safi, fanya matembezi mepesi ya dakika 15-20, na epuka wanga katika mlo unaofuata.',
        };
      } else {
        return {
          status: 'hatari',
          label: 'Juu Sana (Tahadhari ya Kitatibu)',
          color: 'text-rose-900',
          bg: 'bg-rose-100 border-rose-400',
          advice: 'Kiwango kiko juu sana. Angalia ketones (kama una Type 1), kunywa maji ya kutosha, fuata mwongozo wa daktari wako wa dozi ya insulini au wasiliana na kituo cha afya.',
        };
      }
    } else {
      // Fasting or pre-meal
      if (val >= 70 && val <= 130) {
        return {
          status: 'kawaida',
          label: 'Kiwango Bora cha Kawaida (Target)',
          color: 'text-emerald-800',
          bg: 'bg-emerald-50 border-emerald-300',
          advice: 'Kiwango kiko safi sana (Target: 70 - 130 mg/dL kabla ya chakula). Dumisha ulaji wenye nyuzi na mboga nyingi.',
        };
      } else if (val <= 180) {
        return {
          status: 'juu',
          label: 'Iko Juu Kiasi',
          color: 'text-amber-800',
          bg: 'bg-amber-50 border-amber-300',
          advice: 'Kabla ya kula, kiwango hiki kiko juu ya lengo. Panga mlo wenye wanga kidogo sana (low-carb).',
        };
      } else {
        return {
          status: 'hatari',
          label: 'Juu Sana (Hyperglycemia)',
          color: 'text-rose-900',
          bg: 'bg-rose-100 border-rose-400',
          advice: 'Kiwango cha juu cha asubuhi/kabla ya chakula. Epuka wanga kabisa, kunywa maji mengi na fuata maagizo ya daktari.',
        };
      }
    }
  };

  const currentStatus = getStatus(mgDlVal, timing);

  const createLogObject = (): GlucoseLog | null => {
    if (mgDlVal === null || mgDlVal <= 0) return null;
    return {
      id: 'gluc-' + Date.now(),
      timestamp: new Date().toISOString(),
      value: mgDlVal,
      unit: profile.unit,
      timing,
      notes: notes.trim() || undefined,
      status: currentStatus.status,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog = createLogObject();
    if (!newLog) return;

    onSaveGlucose(newLog);
    if (currentStatus.status === 'kawaida') {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    }
    onClose();
  };

  const handleSaveAndPrintClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const newLog = createLogObject();
    if (!newLog) return;

    onSaveGlucose(newLog);
    if (currentStatus.status === 'kawaida') {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    }
    onClose();
    if (onSaveAndPrint) {
      onSaveAndPrint(newLog);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-rose-50/70 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">Rekodi Kiwango cha Sukari</h3>
              <p className="text-xs text-slate-500">Ingiza kipimo cha sasa cha glukometa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {/* Unit Toggle & Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Kipimo cha Sukari:</label>
              <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setUnit('mg/dL')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    unit === 'mg/dL' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  mg/dL
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('mmol/L')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    unit === 'mmol/L' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  mmol/L
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type="number"
                step={unit === 'mmol/L' ? '0.1' : '1'}
                min="20"
                max="600"
                required
                autoFocus
                placeholder={unit === 'mg/dL' ? 'Mfano: 115' : 'Mfano: 6.4'}
                value={valueStr}
                onChange={(e) => setValueStr(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xl sm:text-2xl font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                {unit}
              </span>
            </div>
          </div>

          {/* Timing Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Wakati wa Kipimo:</span>
            </label>
            <select
              value={timing}
              onChange={(e) => setTiming(e.target.value as MeasurementTiming)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="fasting">Asubuhi kabla ya Kula (Fasting: Lengo 70-130 mg/dL)</option>
              <option value="pre_breakfast">Kabla ya Kifungua Kinywa</option>
              <option value="post_breakfast">Masaa 2 Baada ya Kifungua Kinywa (Lengo &lt;180 mg/dL)</option>
              <option value="pre_lunch">Kabla ya Chakula cha Mchana</option>
              <option value="post_lunch">Masaa 2 Baada ya Chakula cha Mchana (Lengo &lt;180 mg/dL)</option>
              <option value="pre_dinner">Kabla ya Chakula cha Usiku</option>
              <option value="post_dinner">Masaa 2 Baada ya Chakula cha Usiku (Lengo &lt;180 mg/dL)</option>
              <option value="bedtime">Kabla ya Kulala (Lengo 100-140 mg/dL)</option>
              <option value="random">Kipimo cha Ghafla / Wakati Wowote</option>
            </select>
          </div>

          {/* Dynamic Status Feedback Box */}
          <div className={`p-4 rounded-xl border transition-all ${currentStatus.bg}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-xs font-bold uppercase tracking-wider ${currentStatus.color}`}>
                Tathmini ya Sasa
              </span>
              <span className={`text-xs font-extrabold ${currentStatus.color}`}>
                {currentStatus.label}
              </span>
            </div>
            <p className={`text-xs leading-relaxed ${currentStatus.color}`}>
              {currentStatus.advice}
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Maelezo ya Ziada (Hiari):</label>
            <input
              type="text"
              placeholder="Mfano: Nilitembea dakika 20, au nilikula embe dogo..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleSaveAndPrintClick}
              disabled={!valueStr || isNaN(Number(valueStr))}
              className="w-full py-3 px-4 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 active:scale-[0.99] text-white rounded-xl font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-5 h-5" />
              <span>Hifadhi & Chapisha Ushauri wa Lishe (PDF/Picha/Print)</span>
            </button>

            <button
              type="submit"
              disabled={!valueStr || isNaN(Number(valueStr))}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 active:scale-[0.99] text-slate-800 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Hifadhi Kipimo Tu Kwenye Rekodi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
