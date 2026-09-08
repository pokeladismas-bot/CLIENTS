import React, { useState, useEffect } from 'react';
import { 
  Droplets, Droplet, Plus, Minus, RotateCcw, Sparkles, 
  AlertCircle, CheckCircle2, HeartPulse, Info, Trophy, ChevronDown
} from 'lucide-react';
import { GlucoseLog, WaterLogEntry } from '../types';

interface WaterIntakeTrackerProps {
  patientId?: string;
  patientName?: string;
  latestGlucose?: GlucoseLog;
  dailyTargetGlasses?: number;
}

export const WaterIntakeTracker: React.FC<WaterIntakeTrackerProps> = ({
  patientId = 'default',
  patientName = 'Mgonjwa',
  latestGlucose,
  dailyTargetGlasses = 8,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const storageKey = `afyalishe_water_intake_${todayStr}_${patientId}`;
  const targetKey = `afyalishe_water_target_${patientId}`;

  const [targetGlasses, setTargetGlasses] = useState<number>(() => {
    const savedTarget = localStorage.getItem(targetKey);
    return savedTarget ? parseInt(savedTarget, 10) : dailyTargetGlasses;
  });

  const [waterLogs, setWaterLogs] = useState<WaterLogEntry[]>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [showTargetOptions, setShowTargetOptions] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState(false);

  // Save logs to localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(waterLogs));
  }, [waterLogs, storageKey]);

  // Save target to localStorage
  useEffect(() => {
    localStorage.setItem(targetKey, targetGlasses.toString());
  }, [targetGlasses, targetKey]);

  // Total glasses drank today
  const glassesDrunk = waterLogs.reduce((acc, curr) => acc + curr.glasses, 0);
  const currentMl = glassesDrunk * 250;
  const targetMl = targetGlasses * 250;
  const percentage = Math.min(Math.round((glassesDrunk / targetGlasses) * 100), 100);
  const isGoalReached = glassesDrunk >= targetGlasses;

  // Add glasses
  const handleAddWater = (numGlasses: number) => {
    const newEntry: WaterLogEntry = {
      id: 'water-' + Date.now(),
      timestamp: new Date().toISOString(),
      glasses: numGlasses,
      amountMl: numGlasses * 250,
    };
    const updated = [...waterLogs, newEntry];
    setWaterLogs(updated);

    if (glassesDrunk + numGlasses >= targetGlasses) {
      setSuccessAnimation(true);
      setTimeout(() => setSuccessAnimation(false), 3000);
    }
  };

  // Remove last entry or reduce
  const handleRemoveWater = () => {
    if (waterLogs.length === 0) return;
    const updated = [...waterLogs];
    const lastEntry = updated[updated.length - 1];
    if (lastEntry.glasses > 1) {
      updated[updated.length - 1] = {
        ...lastEntry,
        glasses: lastEntry.glasses - 1,
        amountMl: (lastEntry.glasses - 1) * 250,
      };
    } else {
      updated.pop();
    }
    setWaterLogs(updated);
  };

  // Reset today
  const handleReset = () => {
    if (window.confirm('Una uhakika unataka kuweka upya (reset) kumbukumbu ya maji ya leo?')) {
      setWaterLogs([]);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6 relative overflow-hidden">
      {/* Background soft glow decoration */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-sky-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-teal-100 rounded-full blur-3xl opacity-60 pointer-events-none" />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-500 text-white flex items-center justify-center shadow-md shadow-sky-500/20 flex-shrink-0">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                Ufuatiliaji wa Maji ya Kunywa
              </h3>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                Hydration Tracker
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Kunywa maji ya kutosha husaidia figo kutoa sukari ya ziada na kuzuia kuongezeka kwa shinikizo la damu.
            </p>
          </div>
        </div>

        {/* Target Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTargetOptions(!showTargetOptions)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200"
          >
            <span>Lengo: {targetGlasses} Glasi ({targetMl}ml)</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {showTargetOptions && (
            <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-30 text-xs space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400">
                Chagua Lengo la Kila Siku:
              </div>
              {[6, 8, 10, 12].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    setTargetGlasses(g);
                    setShowTargetOptions(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl font-semibold flex items-center justify-between transition-colors ${
                    targetGlasses === g ? 'bg-sky-500 text-white' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span>{g} Glasi ({g * 250} ml)</span>
                  {targetGlasses === g && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Glucose Alert Contextual Banner if Glucose is elevated */}
      {latestGlucose && latestGlucose.value > 140 && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-950">
          <HeartPulse className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-rose-800">
              Tahadhari ya Sukari ({latestGlucose.value} {latestGlucose.unit || 'mg/dL'}):
            </strong>{' '}
            Wakati sukari ipo juu ya kiwango cha kawaida, figo zako zinahitaji maji zaidi ili kuchuja sukari ya ziada kupitia mkojo bila kuweka mkazo (strain) kwenye figo. Kunywa glasi 1 au 2 za maji sasa!
          </div>
        </div>
      )}

      {/* Main Hydration Progress Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Progress & Stats (Col 5) */}
        <div className="md:col-span-5 bg-gradient-to-br from-sky-50 via-teal-50/50 to-slate-50 p-5 rounded-2xl border border-sky-200/80 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Unywaji wa Leo
            </span>
            <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
              isGoalReached 
                ? 'bg-emerald-500 text-white shadow-xs' 
                : 'bg-sky-200 text-sky-800'
            }`}>
              {percentage}% ya Lengo
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              {glassesDrunk}
            </span>
            <span className="text-lg font-bold text-slate-500">
              / {targetGlasses} Glasi
            </span>
            <span className="text-xs font-semibold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-lg ml-auto">
              {currentMl} ml / {targetMl} ml
            </span>
          </div>

          {/* Visual Progress Bar */}
          <div className="space-y-1.5">
            <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden relative">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  isGoalReached 
                    ? 'bg-gradient-to-r from-teal-400 to-emerald-500' 
                    : 'bg-gradient-to-r from-sky-400 to-teal-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <span>0 ml</span>
              <span>{Math.round(targetMl / 2)} ml</span>
              <span>{targetMl} ml ({targetGlasses} glasi)</span>
            </div>
          </div>

          {isGoalReached ? (
            <div className="flex items-center gap-2 text-emerald-800 bg-emerald-100/80 p-2.5 rounded-xl text-xs font-bold border border-emerald-300">
              <Trophy className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Hongera! Umefikisha lengo lako la glasi {targetGlasses} kwa siku ya leo!</span>
            </div>
          ) : (
            <div className="text-xs text-slate-600">
              Zimebaki <strong className="text-sky-700 font-bold">{targetGlasses - glassesDrunk} glasi</strong> ({Math.max(targetMl - currentMl, 0)} ml) kufikia lengo lako la siku.
            </div>
          )}
        </div>

        {/* Interactive Glasses Grid & Quick Controls (Col 7) */}
        <div className="md:col-span-7 space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
              <span>Glasi Zako (Bofya kuashiria ulipokunywa):</span>
              <span className="text-[11px] text-slate-400">1 Glasi = 250ml</span>
            </div>

            {/* Visual Glass Array */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {Array.from({ length: targetGlasses }).map((_, idx) => {
                const isFilled = idx < glassesDrunk;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (idx < glassesDrunk) {
                        // reduce to this level
                        const countToRemove = glassesDrunk - idx;
                        for (let i = 0; i < countToRemove; i++) {
                          handleRemoveWater();
                        }
                      } else {
                        // add up to this level
                        const countToAdd = idx + 1 - glassesDrunk;
                        handleAddWater(countToAdd);
                      }
                    }}
                    title={`Glasi ya ${idx + 1} (${(idx + 1) * 250} ml)`}
                    className={`h-16 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer relative group ${
                      isFilled
                        ? 'bg-gradient-to-b from-sky-400 to-teal-500 text-white shadow-md shadow-sky-500/20 scale-100 hover:scale-105'
                        : 'bg-slate-100 text-slate-400 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-300 border border-slate-200'
                    }`}
                  >
                    <Droplet className={`w-5 h-5 ${isFilled ? 'fill-white text-white animate-pulse' : ''}`} />
                    <span className="text-[10px] font-bold mt-1">
                      {idx + 1}
                    </span>
                    {isFilled && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[9px] text-white shadow-xs">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              id="btn-add-1-glass"
              onClick={() => handleAddWater(1)}
              className="flex-1 py-2.5 px-3.5 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-sky-500/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+1 Glasi (250ml)</span>
            </button>

            <button
              type="button"
              id="btn-add-2-glasses"
              onClick={() => handleAddWater(2)}
              className="flex-1 py-2.5 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-teal-600/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+2 Glasi (500ml Chupa)</span>
            </button>

            {glassesDrunk > 0 && (
              <button
                type="button"
                onClick={handleRemoveWater}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer border border-slate-200"
                title="Punguza glasi 1 uliyokosea"
              >
                <Minus className="w-3.5 h-3.5" />
                <span>Punguza</span>
              </button>
            )}

            {glassesDrunk > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer border border-slate-200"
                title="Weka upya kumbukumbu ya maji ya leo"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Clinical Hydration Tips for Diabetes & Glucose */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
        <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 space-y-1">
          <span className="font-bold text-sky-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            1. Punguza Uzito wa Damu
          </span>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Mwili ukipungukiwa maji, damu inakauka kidogo na msongamano wa sukari (concentration) huongezeka hata kama hujala chakula.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-100 space-y-1">
          <span className="font-bold text-teal-900 flex items-center gap-1.5">
            <HeartPulse className="w-3.5 h-3.5 text-teal-600" />
            2. Kinga Figo Zako
          </span>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Figo hutumia maji kuchuja sukari ya ziada kupitia mkojo. Maji ya kutosha huzuia mawe ya figo na maambukizi ya njia ya mkojo (UTI).
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
          <span className="font-bold text-emerald-900 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            3. Zuia Njaa ya Uwongo
          </span>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Ubongo mara nyingi huchanganya hisia za kiu na njaa. Kunywa glasi 1 ya maji dakika 20 kabla ya kula huzuia kula wanga kupita kiasi.
          </p>
        </div>
      </div>

      {/* Recent hydration timeline (if any logs exist) */}
      {waterLogs.length > 0 && (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>
            Glasi ya mwisho ilirekodiwa saa{' '}
            <strong className="text-slate-700">
              {new Date(waterLogs[waterLogs.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </strong>
          </span>
          <span>Kumbukumbu {waterLogs.length} za leo</span>
        </div>
      )}
    </div>
  );
};
