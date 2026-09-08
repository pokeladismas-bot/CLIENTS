import React, { useState } from 'react';
import { 
  HeartPulse, Plus, TrendingUp, Calendar, Trash2, ShieldCheck, 
  AlertTriangle, Filter, CheckCircle2, Clock, Utensils, Info, Printer, FileDown, Image
} from 'lucide-react';
import { GlucoseLog, GlucoseUnit, MealLog, UserProfile } from '../types';
import { GlucoseReminderCard } from './GlucoseReminderCard';
import { PrintDietaryReportModal } from './PrintDietaryReportModal';

interface GlucoseTrackerViewProps {
  glucoseLogs: GlucoseLog[];
  meals: MealLog[];
  profile: UserProfile;
  onOpenGlucoseModal: () => void;
  onDeleteLog: (id: string) => void;
  onUpdateProfile: (updated: UserProfile) => void;
}

export const GlucoseTrackerView: React.FC<GlucoseTrackerViewProps> = ({
  glucoseLogs,
  meals,
  profile,
  onOpenGlucoseModal,
  onDeleteLog,
  onUpdateProfile,
}) => {
  const [filterTiming, setFilterTiming] = useState<string>('all');
  const [selectedLogForPrint, setSelectedLogForPrint] = useState<GlucoseLog | null>(null);

  // Sorted logs
  const sortedLogs = [...glucoseLogs].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Filtered
  const displayLogs = sortedLogs.filter((l) => {
    if (filterTiming === 'all') return true;
    return l.timing === filterTiming;
  });

  // Calculate Metrics
  const totalCount = glucoseLogs.length;
  const values = glucoseLogs.map((l) => l.value);
  const avgGlucose = totalCount > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / totalCount) : 0;
  const inRangeCount = glucoseLogs.filter((l) => l.value >= 70 && l.value <= 180).length;
  const inRangePercent = totalCount > 0 ? Math.round((inRangeCount / totalCount) * 100) : 0;
  const minGlucose = totalCount > 0 ? Math.min(...values) : 0;
  const maxGlucose = totalCount > 0 ? Math.max(...values) : 0;
  // Estimated A1c formula: (Average Glucose + 46.7) / 28.7
  const estimatedA1c = avgGlucose > 0 ? ((avgGlucose + 46.7) / 28.7).toFixed(1) : '-';

  // SVG Chart Dimensions
  const chartHeight = 220;
  const chartWidth = 700;
  const paddingX = 40;
  const paddingY = 25;

  const minPlotVal = 40;
  const maxPlotVal = 300;

  const getY = (val: number) => {
    const clamped = Math.max(minPlotVal, Math.min(maxPlotVal, val));
    const range = maxPlotVal - minPlotVal;
    return chartHeight - paddingY - ((clamped - minPlotVal) / range) * (chartHeight - paddingY * 2);
  };

  const getX = (idx: number, total: number) => {
    if (total <= 1) return paddingX + (chartWidth - paddingX * 2) / 2;
    return paddingX + (idx / (total - 1)) * (chartWidth - paddingX * 2);
  };

  // Generate SVG path for points
  const points = displayLogs.map((log, idx) => ({
    x: getX(idx, displayLogs.length),
    y: getY(log.value),
    log,
  }));

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  // Green target zone coordinates (70 to 140/180)
  const targetTopY = getY(140);
  const targetBottomY = getY(70);

  const getTimingLabel = (t: string) => {
    switch (t) {
      case 'fasting': return 'Asubuhi (Fasting)';
      case 'pre_breakfast': return 'Kabla ya Kifungua Kinywa';
      case 'post_breakfast': return 'Baada ya Kifungua Kinywa';
      case 'pre_lunch': return 'Kabla ya Mchana';
      case 'post_lunch': return 'Baada ya Mchana';
      case 'pre_dinner': return 'Kabla ya Usiku';
      case 'post_dinner': return 'Baada ya Usiku';
      case 'bedtime': return 'Kabla ya Kulala';
      default: return 'Kawaida';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-rose-600" />
            <span>Kumbukumbu na Grafu ya Sukari ya Damu</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Fuatilia viwango vyako vya glukosi na utambue jinsi milo tofauti inavyoathiri sukari yako
          </p>
        </div>

        <div className="flex items-center gap-2">
          {glucoseLogs.length > 0 && (
            <button
              onClick={() => setSelectedLogForPrint(glucoseLogs[glucoseLogs.length - 1])}
              className="px-3.5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              title="Chapisha ripoti ya lishe ya kipimo cha hivi karibuni (PDF, Picha, Print)"
            >
              <Printer className="w-4 h-4" />
              <span>Chapisha Ushauri wa Lishe</span>
            </button>
          )}

          <button
            onClick={onOpenGlucoseModal}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Rekodi Sukari Sasa</span>
          </button>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Wastani wa Sukari
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 my-1">
            {avgGlucose || '-'}
            <span className="text-xs font-normal text-slate-500 ml-1">{profile.unit}</span>
          </div>
          <p className="text-[10px] text-emerald-600 font-medium">Lengo: 70-130 kabla ya kula</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Ndani ya Lengo (TIR)
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 my-1">
            {inRangePercent}%
          </div>
          <p className="text-[10px] text-slate-500">{inRangeCount} kati ya {totalCount} vipimo</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Makadirio ya HbA1c
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-700 my-1">
            {estimatedA1c}%
          </div>
          <p className="text-[10px] text-blue-600 font-medium">Lengo la Kisukari: &lt;7.0%</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Chini / Juu Kabisa
          </span>
          <div className="text-xl sm:text-2xl font-bold text-slate-800 my-1">
            <span className="text-amber-600">{minGlucose || '-'}</span> / <span className="text-rose-600">{maxGlucose || '-'}</span>
          </div>
          <p className="text-[10px] text-slate-500">Kiwango cha masafa</p>
        </div>
      </div>

      {/* Daily Reminder Toggle & Schedule Card */}
      <GlucoseReminderCard
        profile={profile}
        onUpdateProfile={onUpdateProfile}
        onOpenGlucoseModal={onOpenGlucoseModal}
      />

      {/* Visual Chart Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base">Grafu ya Mwenendo wa Sukari (mg/dL)</h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-100 border border-emerald-300 inline-block" />
              <span className="text-slate-600 font-medium">Kiwango Bora (70-140)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span className="text-slate-600 font-medium">Vipimo</span>
            </div>
          </div>
        </div>

        {displayLogs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            Hakuna kumbukumbu za sukari kwa kichujio hiki.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto min-w-[550px] overflow-visible"
            >
              {/* Shaded Target Zone (70 - 140 mg/dL) */}
              <rect
                x={paddingX}
                y={targetTopY}
                width={chartWidth - paddingX * 2}
                height={targetBottomY - targetTopY}
                fill="#10b981"
                fillOpacity="0.1"
                stroke="#10b981"
                strokeOpacity="0.3"
                strokeDasharray="4,4"
              />

              {/* Grid Lines & Labels */}
              {[70, 140, 200, 260].map((val) => {
                const y = getY(val);
                return (
                  <g key={val}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - paddingX}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 6}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="9"
                      fill="#94a3b8"
                      fontWeight="bold"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Curve / Line */}
              {points.length > 1 && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#059669"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Points & Labels */}
              {points.map((p, idx) => {
                const isHypo = p.log.value < 70;
                const isHyper = p.log.value > 180;
                const fillColor = isHypo ? '#d97706' : isHyper ? '#e11d48' : '#059669';

                return (
                  <g key={p.log.id} className="group cursor-pointer">
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="6"
                      fill={fillColor}
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="transition-transform hover:scale-125"
                    />

                    {/* Value text above point */}
                    <text
                      x={p.x}
                      y={p.y - 10}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill={fillColor}
                    >
                      {p.log.value}
                    </text>

                    {/* Date/time below */}
                    <text
                      x={p.x}
                      y={chartHeight - 6}
                      textAnchor="middle"
                      fontSize="8"
                      fill="#64748b"
                    >
                      {new Date(p.log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>

      {/* Detailed History Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-slate-900 text-base">Orodha Kamili ya Vipimo vya Sukari</h3>

          {/* Filter dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterTiming}
              onChange={(e) => setFilterTiming(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Muda Wote (Vipimo Vyote)</option>
              <option value="fasting">Asubuhi kabla ya kula</option>
              <option value="post_breakfast">Baada ya Kifungua Kinywa</option>
              <option value="post_lunch">Baada ya Mchana</option>
              <option value="post_dinner">Baada ya Usiku</option>
              <option value="bedtime">Kabla ya Kulala</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-slate-100 overflow-x-auto">
          {displayLogs.map((log) => (
            <div
              key={log.id}
              className="py-3.5 flex items-center justify-between gap-4 text-xs sm:text-sm hover:bg-slate-50 px-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-sm sm:text-base ${
                  log.status === 'kawaida' ? 'bg-emerald-100 text-emerald-800' :
                  log.status === 'chini' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {log.value}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{getTimingLabel(log.timing)}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      log.status === 'kawaida' ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' :
                      log.status === 'chini' ? 'bg-amber-50 text-amber-700 border border-amber-300' : 'bg-rose-50 text-rose-700 border border-rose-300'
                    }`}>
                      {log.status === 'kawaida' ? 'Kawaida' : log.status === 'chini' ? 'Chini' : 'Juu'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(log.timestamp).toLocaleDateString('sw-TZ', { month: 'short', day: 'numeric' })},{' '}
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {log.notes ? ` • ${log.notes}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedLogForPrint(log)}
                  className="px-2.5 py-1.5 text-xs font-bold text-teal-800 hover:text-white bg-teal-50 hover:bg-teal-700 rounded-lg border border-teal-200 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                  title="Chapisha au pakua ushauri wa lishe wa kipimo hiki (PDF, Picha, Print)"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ushauri wa Lishe</span>
                </button>

                <button
                  onClick={() => onDeleteLog(log.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Futa kipimo hiki"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Print Report Modal for Selected Log */}
      {selectedLogForPrint && (
        <PrintDietaryReportModal
          isOpen={!!selectedLogForPrint}
          onClose={() => setSelectedLogForPrint(null)}
          profile={profile}
          testedGlucose={selectedLogForPrint.value}
          testedTiming={selectedLogForPrint.timing}
          recommendation={null}
          latestGlucoseLog={selectedLogForPrint}
        />
      )}
    </div>
  );
};
