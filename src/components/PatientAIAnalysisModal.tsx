import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, 
  Activity, ArrowRight, Printer, RefreshCw, FileText, Send, Baby, 
  ShieldAlert, Stethoscope, HeartPulse, Scale, Check
} from 'lucide-react';
import { 
  RegisteredPatient, PatientAIAnalysisResult, GlucoseLog, 
  MealLog, WeightLog 
} from '../types';

interface PatientAIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: RegisteredPatient;
  glucoseLogs?: GlucoseLog[];
  mealLogs?: MealLog[];
  onOpenReferral?: () => void;
}

export const PatientAIAnalysisModal: React.FC<PatientAIAnalysisModalProps> = ({
  isOpen,
  onClose,
  patient,
  glucoseLogs = [],
  mealLogs = [],
  onOpenReferral,
}) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<PatientAIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/nutritionist/analyze-patient-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient,
          glucoseLogs,
          mealLogs,
          weightLogs: patient.weightLogs || [],
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Hitilafu ya kupata uchambuzi kutoka Gemini AI.');
      }

      const resData = await response.json();
      if (resData.data) {
        setAnalysis(resData.data);
      } else {
        throw new Error('Hakuna matokeo yaliyorejeshwa.');
      }
    } catch (err: any) {
      console.error('AI Analysis failed:', err);
      setError(err.message || 'Hitilafu ya muunganisho wa Gemini AI. Tafadhali jaribu tena.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runAnalysis();
    } else {
      setAnalysis(null);
      setError(null);
    }
  }, [isOpen, patient.id]);

  if (!isOpen) return null;

  const getTrendBadge = (trend?: string) => {
    switch (trend) {
      case 'inaboreka':
        return {
          label: 'Hali Inaboreka Vizuri (Improving)',
          className: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: TrendingUp,
        };
      case 'thabiti':
        return {
          label: 'Hali Iko Thabiti (Stable)',
          className: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: Activity,
        };
      case 'inazidi_kushuka':
        return {
          label: 'Hali Inazidi Kuzorota (Deteriorating)',
          className: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: TrendingDown,
        };
      case 'inahitaji_uangalizi_wa_haraka':
      default:
        return {
          label: 'Inahitaji Uangalizi wa Haraka (High Risk)',
          className: 'bg-rose-100 text-rose-800 border-rose-300',
          icon: ShieldAlert,
        };
    }
  };

  const trendBadge = getTrendBadge(analysis?.overallHealthTrend);
  const TrendIcon = trendBadge.icon;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-400/20 border border-teal-300/30 flex items-center justify-center text-teal-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">
                  Uchambuzi wa AI wa Historia ya Mgonjwa (Gemini)
                </h2>
                <span className="text-[10px] bg-teal-900/80 text-teal-200 px-2 py-0.5 rounded-full font-bold">
                  {patient.fullName}
                </span>
              </div>
              <p className="text-xs text-teal-200">
                Uchambuzi wa kina wa mwenendo wa sukari, uzito, lishe na tahadhari za kliniki
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

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin"></div>
                <Sparkles className="w-6 h-6 text-teal-600 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">
                  Gemini AI inachambua historia na mwenendo wa {patient.fullName}...
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Inachambua rekodi za sukari ({glucoseLogs.length}), milo ({mealLogs.length}), uzito na viashiria vya kilishe kutoa ushauri wa kitaalamu.
                </p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3">
              <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" />
              <h3 className="text-sm font-bold text-rose-900">Hitilafu ya Uchambuzi wa AI</h3>
              <p className="text-xs text-rose-700 max-w-md mx-auto">{error}</p>
              <button
                onClick={runAnalysis}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Jaribu Tena</span>
              </button>
            </div>
          )}

          {analysis && !loading && (
            <div className="space-y-6">
              
              {/* Top Banner: Status & Summary */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border flex items-center gap-1.5 shadow-2xs ${trendBadge.className}`}>
                      <TrendIcon className="w-3.5 h-3.5" />
                      <span>{trendBadge.label}</span>
                    </span>
                    <span className="text-xs text-slate-500">Tarehe ya Uchambuzi: {analysis.analyzedDate || new Date().toISOString().split('T')[0]}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span>Chapisha Ripoti</span>
                    </button>
                    <button
                      onClick={runAnalysis}
                      className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 cursor-pointer"
                      title="Sasisha Uchambuzi"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="pt-1">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Muhtasari Mkuu wa Kliniki (Executive Summary)
                  </h4>
                  <p className="text-sm font-medium text-slate-800 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
                    {analysis.executiveSummary}
                  </p>
                </div>
              </div>

              {/* Critical Alerts / Tahadhari za Haraka */}
              {analysis.criticalAlerts && analysis.criticalAlerts.length > 0 && (
                <div className="bg-rose-50/80 p-5 rounded-2xl border border-rose-200 space-y-2.5">
                  <h4 className="text-xs font-black text-rose-900 uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>Tahadhari Muhimu za Kliniki & Viashiria vya Hatari</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {analysis.criticalAlerts.map((alert, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded-xl border border-rose-200 text-xs text-rose-950 font-medium flex items-start gap-2 shadow-2xs"
                      >
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>{alert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Glucose Trend Analysis */}
              {analysis.glucoseTrendAnalysis && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-teal-600" />
                    <span>Uchambuzi wa Mwenendo wa Vipimo vya Sukari</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-teal-50/60 p-3.5 rounded-xl border border-teal-200">
                      <span className="text-[11px] font-bold text-teal-800 block">Wastani wa Sukari</span>
                      <div className="text-xl font-black text-teal-950 mt-0.5">
                        {analysis.glucoseTrendAnalysis.averageGlucose || 120} <span className="text-xs font-semibold">mg/dL</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-600 block">Kabla ya Kula (Fasting)</span>
                      <p className="text-xs text-slate-800 font-semibold mt-1">
                        {analysis.glucoseTrendAnalysis.fastingTrend}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-600 block">Baada ya Kula (Post-Meal)</span>
                      <p className="text-xs text-slate-800 font-semibold mt-1">
                        {analysis.glucoseTrendAnalysis.postMealTrend}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-700 block mb-1">
                        Mikurupuko / Mienendo ya Kushuka au Kupanda (Spikes/Drops):
                      </span>
                      <p className="text-slate-600 leading-relaxed">
                        {analysis.glucoseTrendAnalysis.spikesOrDropsPattern}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-700 block mb-1">
                        Mtawanyiko wa Sukari (Glycemic Variability):
                      </span>
                      <p className="text-slate-600 leading-relaxed">
                        {analysis.glucoseTrendAnalysis.glycemicVariability}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Clinical Dietary Recommendations */}
              {analysis.clinicalDietaryRecommendations && (
                <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200 space-y-3">
                  <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Mapendekezo Maalum ya Mlo & Lishe ya Afrika Mashariki</span>
                  </h4>
                  <div className="space-y-2">
                    {analysis.clinicalDietaryRecommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded-xl border border-emerald-200/80 text-xs font-medium text-slate-800 flex items-start gap-2.5 shadow-2xs"
                      >
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <span className="leading-relaxed">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Items for Nutritionist */}
              {analysis.suggestedActionItemsForNutritionist && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-indigo-600" />
                    <span>Hatua za Vitendo kwa Mtaalamu wa Lishe (Clinical Action Items)</span>
                  </h4>
                  <div className="space-y-2">
                    {analysis.suggestedActionItemsForNutritionist.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 flex items-start gap-2.5"
                      >
                        <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pediatric Insights if applicable */}
              {analysis.pediatricInsights && (
                <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 space-y-2">
                  <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-2">
                    <Baby className="w-4 h-4 text-amber-700" />
                    <span>Tathmini Maalum ya Mtoto na Ulaji (Pediatric Nutrition Insights)</span>
                  </h4>
                  <p className="text-xs font-medium text-amber-950 bg-white p-3.5 rounded-xl border border-amber-200 leading-relaxed">
                    {analysis.pediatricInsights}
                  </p>
                </div>
              )}

              {/* Referral Recommendation Card */}
              {analysis.referralRecommendation && (
                <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  analysis.referralRecommendation.isRecommended
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300'
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        analysis.referralRecommendation.isRecommended
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {analysis.referralRecommendation.isRecommended ? 'RUFAA INAPENDEKEZWA' : 'Hana Uhitaji wa Rufaa Sasa'}
                      </span>
                      {analysis.referralRecommendation.recommendedDepartment && (
                        <span className="text-xs font-bold text-blue-900">
                          {analysis.referralRecommendation.recommendedDepartment}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 font-medium">
                      {analysis.referralRecommendation.clinicalJustification}
                    </p>
                  </div>

                  {analysis.referralRecommendation.isRecommended && onOpenReferral && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenReferral();
                      }}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 shrink-0 cursor-pointer transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Andika Rufaa Hii Sasa</span>
                    </button>
                  )}
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Inaendeshwa na Gemini 3.8 Flash & Google AI</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Funga
          </button>
        </div>

      </div>
    </div>
  );
};
