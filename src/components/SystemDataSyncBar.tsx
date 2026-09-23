import React, { useState } from 'react';
import { 
  RefreshCw, ShieldCheck, Database, CheckCircle2, Lock, 
  ArrowRight, Flame, Layers, Clock, Radio, ChevronDown, ChevronUp,
  KeyRound
} from 'lucide-react';

interface SystemDataSyncBarProps {
  isSyncing: boolean;
  lastSyncedTime: string;
  autoSyncEnabled: boolean;
  syncIntervalSeconds: number;
  autoLockMinutes: number;
  onManualSync: () => void;
  onLockSystem: () => void;
  onOpenSecuritySettings?: () => void;
}

export const SystemDataSyncBar: React.FC<SystemDataSyncBarProps> = ({
  isSyncing,
  lastSyncedTime,
  autoSyncEnabled,
  syncIntervalSeconds,
  autoLockMinutes,
  onManualSync,
  onLockSystem,
  onOpenSecuritySettings,
}) => {
  const [showPipelineDetails, setShowPipelineDetails] = useState(false);

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-b border-slate-800 text-slate-200 text-xs py-2 px-3 sm:px-6 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
        
        {/* Left: Official Sync Pipeline Flow */}
        <div className="flex items-center gap-2 flex-wrap text-[11px]">
          <div className="flex items-center gap-1.5 font-black text-teal-400 bg-teal-950/70 border border-teal-800/80 px-2 py-0.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping inline-block" />
            <Radio className="w-3 h-3 text-teal-300" />
            <span>Usawazishaji wa Vifaa Vyote (Multi-Device Live Sync)</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 font-bold text-[10px]">
            <span>📱 Simu</span>
            <span>•</span>
            <span>💻 Kompyuta</span>
            <span>•</span>
            <span>📟 Tablet</span>
          </div>

          <div className="hidden lg:flex items-center gap-1 font-mono text-[11px] text-slate-300 bg-slate-800/60 px-2.5 py-0.5 rounded-lg border border-slate-700/60">
            <span className="text-amber-400 font-bold">Firebase</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span className="text-emerald-400 font-bold">User Data</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span className="text-blue-400 font-bold">Settings</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span className="text-purple-400 font-bold">Reports</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span className="text-cyan-400 font-bold">Records</span>
          </div>

          <button
            type="button"
            onClick={() => setShowPipelineDetails(!showPipelineDetails)}
            className="text-[10px] text-slate-400 hover:text-teal-300 font-semibold flex items-center gap-0.5 underline cursor-pointer"
          >
            <span>{showPipelineDetails ? 'Funga Maelezo' : 'Tazama Mtiririko'}</span>
            {showPipelineDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Right: Sync Status & Controls */}
        <div className="flex items-center gap-2.5 flex-wrap justify-end">
          {/* Timestamp Indicator */}
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Clock className="w-3 h-3 text-teal-400" />
            <span>Imesasishwa:</span>
            <strong className="text-slate-200 font-mono">
              {lastSyncedTime || 'Sasa hivi'}
            </strong>
          </div>

          {/* Auto-Lock Indicator */}
          {autoLockMinutes > 0 && (
            <div 
              className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-md"
              title={`Mfumo utajifunga wenyewe baada ya kutotumika kwa dakika ${autoLockMinutes}`}
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Auto-Lock: Dk {autoLockMinutes}</span>
            </div>
          )}

          {/* Manual Sync Button */}
          <button
            type="button"
            onClick={onManualSync}
            disabled={isSyncing}
            className="px-2.5 py-1 rounded-lg bg-teal-500 hover:bg-teal-400 disabled:bg-slate-700 text-slate-950 font-black text-[11px] flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            title="Bofya kusasisha taarifa zote kutoka Firebase kwenda kwenye vifaa vyote vinavyotumia mfumo"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-slate-950' : 'text-slate-950'}`} />
            <span>{isSyncing ? 'Inasasisha...' : '🔄 Sasisha Vifaa Vyote'}</span>
          </button>

          {/* Quick Lock Screen Button */}
          <button
            type="button"
            onClick={onLockSystem}
            className="px-2.5 py-1 rounded-lg bg-rose-950/90 hover:bg-rose-900 text-rose-200 border border-rose-700/70 font-black text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Funga Mfumo sasa hivi kwa ajili ya usalama wa taarifa (Unahitaji nenosiri kufungua)"
          >
            <Lock className="w-3 h-3 text-rose-300" />
            <span>🔒 Funga Mfumo</span>
          </button>
        </div>
      </div>

      {/* Expanded Pipeline Details View */}
      {showPipelineDetails && (
        <div className="mt-2.5 pt-2.5 border-t border-slate-800 max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11px] animate-in fade-in duration-150">
          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
            <div className="font-black text-amber-400 flex items-center gap-1 mb-1">
              <Database className="w-3.5 h-3.5" />
              <span>1. Firebase</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Hifadhidata ya wingu ya Firestore yenye ulinzi thabiti wa kiwango cha hospitali.
            </p>
          </div>

          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
            <div className="font-black text-emerald-400 flex items-center gap-1 mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>2. User Data</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Taarifa za Admin (DISMAS POKELA), Madaktari, na Wagonjwa waliosajiliwa.
            </p>
          </div>

          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
            <div className="font-black text-blue-400 flex items-center gap-1 mb-1">
              <Lock className="w-3.5 h-3.5" />
              <span>3. Settings</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Ulinzi wa nenosiri, Auto-Lock, ruhusa za uchapishaji, na leseni ya kituo.
            </p>
          </div>

          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
            <div className="font-black text-purple-400 flex items-center gap-1 mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>4. Reports</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Ripoti za kitaalamu za lishe, mihuri ya daktari, na miongozo ya sukari.
            </p>
          </div>

          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
            <div className="font-black text-cyan-400 flex items-center gap-1 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>5. Records</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Vipimo vya sukari, kumbukumbu za chakula, maji, na presha ya damu.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
