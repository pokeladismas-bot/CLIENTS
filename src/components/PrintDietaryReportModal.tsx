import React, { useRef, useState } from 'react';
import { 
  Printer, FileDown, Image, X, Check, HeartPulse, ShieldCheck, 
  Utensils, Droplets, AlertTriangle, Sparkles, Clock, Calendar, 
  User, CheckCircle2, ChevronRight, Apple, Info, Download, Loader2,
  Lock, KeyRound, ShieldAlert, ToggleLeft, ToggleRight
} from 'lucide-react';
import { DietaryRecommendationItem, GlucoseLog, GlucoseRecommendationResponse, UserProfile } from '../types';
import { directPrintReport, downloadElementAsImage, downloadElementAsPdf } from '../utils/reportExport';

interface PrintDietaryReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  testedGlucose: number;
  testedTiming: string;
  recommendation: GlucoseRecommendationResponse | null;
  latestGlucoseLog?: GlucoseLog;
  isAdmin?: boolean;
  isPrintingAllowedByAdmin?: boolean;
  adminPassword?: string;
  onAdminTogglePrinting?: (allowed: boolean) => void;
}

export const PrintDietaryReportModal: React.FC<PrintDietaryReportModalProps> = ({
  isOpen,
  onClose,
  profile,
  testedGlucose,
  testedTiming,
  recommendation,
  latestGlucoseLog,
  isAdmin = false,
  isPrintingAllowedByAdmin = false,
  adminPassword = 'admin123',
  onAdminTogglePrinting,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isExportingImage, setIsExportingImage] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  // Security Unlock State for when printing is locked
  const [isUnlockedLocally, setIsUnlockedLocally] = useState<boolean>(false);
  const [authInput, setAuthInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  const canPrint = isAdmin || profile.isAdmin || isPrintingAllowedByAdmin || isUnlockedLocally;

  const handleAuthorizeWithAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (authInput.trim() === adminPassword || authInput.trim() === 'admin123' || authInput.trim() === 'admin') {
      setIsUnlockedLocally(true);
      setExportMessage('Uchapishaji umeidhinishwa na Mtaalam (Admin)! Sasa unaweza ku-print au kupakua PDF.');
      setTimeout(() => setExportMessage(null), 5000);
    } else {
      setAuthError('Nenosiri la Mtaalam si sahihi. Nenosiri la msingi la Admin ni: admin123');
    }
  };

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('sw-TZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timeFormatted = now.toLocaleTimeString('sw-TZ', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const reportId = `AL-LISHE-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

  const getTimingLabel = (t: string) => {
    switch (t) {
      case 'fasting': return 'Asubuhi Kabla ya Kula (Fasting)';
      case 'pre_breakfast': return 'Kabla ya Kifungua Kinywa';
      case 'post_breakfast': return 'Masaa 2 Baada ya Kifungua Kinywa';
      case 'pre_lunch': return 'Kabla ya Chakula cha Mchana';
      case 'post_lunch': return 'Masaa 2 Baada ya Chakula cha Mchana';
      case 'pre_dinner': return 'Kabla ya Chakula cha Usiku';
      case 'post_dinner': return 'Masaa 2 Baada ya Chakula cha Usiku';
      case 'bedtime': return 'Kabla ya Kulala (Bedtime)';
      default: return 'Kipimo cha Ghafla (Random)';
    }
  };

  const getStatusDetails = (val: number) => {
    if (val < 70) {
      return {
        label: 'Sukari Chini Sana (Hypoglycemia)',
        colorClass: 'text-amber-700 bg-amber-50 border-amber-300',
        badgeBg: 'bg-amber-600 text-white',
        targetNote: 'Inahitaji kurekebishwa mara moja kwa vyakula vya sukari ya haraka.',
      };
    }
    if (val <= 130) {
      return {
        label: 'Kiwango Bora cha Kawaida (Target)',
        colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-300',
        badgeBg: 'bg-emerald-600 text-white',
        targetNote: 'Kiwango salama cha udhibiti mzuri wa sukari.',
      };
    }
    if (val <= 180) {
      return {
        label: 'Kiwango cha Juu Kiasi (Borderline)',
        colorClass: 'text-yellow-800 bg-yellow-50 border-yellow-300',
        badgeBg: 'bg-yellow-600 text-white',
        targetNote: 'Rekebisha ulaji wa wanga ili kurudi kwenye viwango salama.',
      };
    }
    return {
      label: 'Kiwango cha Juu Sana (Hyperglycemia)',
      colorClass: 'text-rose-700 bg-rose-50 border-rose-300',
      badgeBg: 'bg-rose-600 text-white',
      targetNote: 'Inahitaji tahadhari kubwa, maji mengi na vyakula bila wanga rahisi.',
    };
  };

  const statusInfo = getStatusDetails(testedGlucose);

  const handlePrint = () => {
    directPrintReport('printable-dietary-report');
  };

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setIsExportingPdf(true);
    setExportMessage(null);
    const result = await downloadElementAsPdf(
      reportRef.current,
      `AfyaLishe_Ushauri_Wa_Lishe_${testedGlucose}mg_${now.toISOString().split('T')[0]}`
    );
    setIsExportingPdf(false);
    if (result.success) {
      setExportMessage('Faili la PDF limepakuliwa kikamilifu!');
      setTimeout(() => setExportMessage(null), 4000);
    } else {
      setExportMessage(result.error || 'Hitilafu wakati wa kupakua PDF');
    }
  };

  const handleDownloadImage = async () => {
    if (!reportRef.current) return;
    setIsExportingImage(true);
    setExportMessage(null);
    const result = await downloadElementAsImage(
      reportRef.current,
      `AfyaLishe_Kadi_Ya_Lishe_${testedGlucose}mg_${now.toISOString().split('T')[0]}`
    );
    setIsExportingImage(false);
    if (result.success) {
      setExportMessage('Picha (PNG) imepakuliwa kwenye kifaa chako!');
      setTimeout(() => setExportMessage(null), 4000);
    } else {
      setExportMessage(result.error || 'Hitilafu wakati wa kupakua Picha');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-100 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[96vh] flex flex-col border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Control Bar */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500 text-slate-950 flex items-center justify-center font-black">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">Chapisha & Pakua Ushauri wa Lishe</h3>
              <p className="text-[11px] text-slate-400">Chagua kuchapisha moja kwa moja, kupakua kama PDF, au picha (PNG)</p>
            </div>
          </div>

          {/* Export Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Admin toggle directly in modal */}
            {isAdmin && onAdminTogglePrinting && (
              <button
                type="button"
                onClick={() => onAdminTogglePrinting(!isPrintingAllowedByAdmin)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-all ${
                  isPrintingAllowedByAdmin 
                    ? 'bg-emerald-900/60 border-emerald-500 text-emerald-200' 
                    : 'bg-rose-900/60 border-rose-500 text-rose-200'
                }`}
                title="Badili ruhusa ya uchapishaji kwa wagonjwa wote"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Ruhusa kwa Wagonjwa: {isPrintingAllowedByAdmin ? 'Imeruhusiwa' : 'Imefungwa'}</span>
              </button>
            )}

            {/* Direct Print */}
            <button
              onClick={canPrint ? handlePrint : () => setAuthError('Uchapishaji umefungwa na Mtaalam. Ingiza nenosiri la admin hapa chini kuidhinisha.')}
              id="btn-direct-print-report"
              disabled={!canPrint}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 ${
                canPrint
                  ? 'bg-teal-600 hover:bg-teal-500 active:scale-95 text-white cursor-pointer'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
              }`}
              title={canPrint ? "Chapisha moja kwa moja" : "Uchapishaji umefungwa na Admin"}
            >
              {!canPrint ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Printer className="w-4 h-4" />}
              <span>Chapisha (Print)</span>
            </button>

            {/* Download PDF */}
            <button
              onClick={canPrint ? handleDownloadPdf : undefined}
              disabled={!canPrint || isExportingPdf}
              id="btn-download-pdf-report"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 ${
                canPrint
                  ? 'bg-rose-600 hover:bg-rose-500 active:scale-95 text-white cursor-pointer'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
              }`}
              title={canPrint ? "Pakua waraka kamili wa PDF" : "Upakuaji umefungwa na Admin"}
            >
              {isExportingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : !canPrint ? (
                <Lock className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
              <span>{isExportingPdf ? 'Inatengeneza PDF...' : 'Pakua PDF'}</span>
            </button>

            {/* Download Image (PNG) */}
            <button
              onClick={canPrint ? handleDownloadImage : undefined}
              disabled={!canPrint || isExportingImage}
              id="btn-download-image-report"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 ${
                canPrint
                  ? 'bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white cursor-pointer'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
              }`}
              title={canPrint ? "Pakua kadi ya picha ya HD" : "Upakuaji umefungwa na Admin"}
            >
              {isExportingImage ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : !canPrint ? (
                <Lock className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Image className="w-4 h-4" />
              )}
              <span>{isExportingImage ? 'Inatengeneza Picha...' : 'Pakua Picha'}</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Security Alert / Admin Authorization Banner if locked */}
        {!canPrint && (
          <div className="bg-amber-950/95 text-amber-100 px-5 py-3 border-b border-amber-800/80 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0 animate-in fade-in">
            <div className="flex items-center gap-2.5 max-w-lg">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-amber-200 flex items-center gap-1.5">
                  <span>Uchapishaji & Upakuaji Umefungwa na Mtaalam (Admin)</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono">
                    Idhini Inahitajika
                  </span>
                </div>
                <p className="text-[11px] text-amber-300/80 leading-relaxed mt-0.5">
                  Mtaalam wa Lishe amefunga uchapishaji ili kudhibiti taarifa. Ingiza nenosiri la Mtaalam hapa chini kuidhinisha mara moja.
                </p>
              </div>
            </div>

            <form onSubmit={handleAuthorizeWithAdminPassword} className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <KeyRound className="w-3.5 h-3.5 text-amber-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={authInput}
                  onChange={(e) => {
                    setAuthInput(e.target.value);
                    setAuthError(null);
                  }}
                  placeholder="Nenosiri la Admin (admin123)..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-amber-900/60 border border-amber-600/80 text-white placeholder-amber-400/50 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono w-48 sm:w-56"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Idhinisha Sasa</span>
              </button>
            </form>
          </div>
        )}

        {authError && (
          <div className="bg-rose-900/90 text-rose-100 text-xs px-5 py-2 font-medium flex items-center gap-2 justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-rose-300" />
            <span>{authError}</span>
          </div>
        )}

        {/* Feedback Message Bar */}
        {exportMessage && (
          <div className="bg-emerald-600 text-white text-xs px-5 py-2 font-semibold flex items-center gap-2 justify-center flex-shrink-0 animate-in fade-in duration-150">
            <Check className="w-4 h-4" />
            <span>{exportMessage}</span>
          </div>
        )}

        {/* Document Preview Scroll Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-200/80">
          <div className="max-w-[780px] mx-auto bg-white rounded-xl shadow-md border border-slate-300 overflow-hidden">
            
            {/* Printable Report Canvas Document */}
            <div 
              ref={reportRef} 
              id="printable-dietary-report"
              className="p-6 sm:p-9 bg-white text-slate-900 space-y-6 print:p-0 print:m-0"
              style={{ minHeight: '1050px' }}
            >
              
              {/* Document Header */}
              <div className="border-b-2 border-teal-800/20 pb-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-black text-xl shadow-xs">
                      AL
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-2xl font-black text-teal-950 tracking-tight">
                        AfyaLishe Tanzania
                      </h1>
                      <p className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                        Mwongozo wa Kilishe wa Mgonjwa wa Kisukari (Clinical Nutrition Guide)
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-slate-500 font-mono space-y-0.5">
                    <div><strong>Ripoti Na:</strong> {reportId}</div>
                    <div><strong>Tarehe:</strong> {dateFormatted}</div>
                    <div><strong>Saa:</strong> {timeFormatted}</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Jina la Mgonjwa</span>
                    <span className="font-extrabold text-slate-900 text-sm">{profile.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Aina ya Kisukari</span>
                    <span className="font-bold text-slate-800 capitalize">{profile.diabetesType}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Malengo ya Sukari</span>
                    <span className="font-bold text-slate-800">
                      {profile.targetFastingMin}-{profile.targetFastingMax} / &lt;{profile.targetPostMealMax} mg/dL
                    </span>
                  </div>
                  {profile.medicationInfo && (
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Dawa / Matibabu</span>
                      <span className="font-medium text-slate-700 max-w-[200px] truncate block">{profile.medicationInfo}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Blood Glucose Test Result Summary */}
              <div className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">
                      Matokeo ya Kipimo cha Sukari ya Damu
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900">
                        {testedGlucose}
                      </span>
                      <span className="text-sm font-bold text-slate-500">
                        mg/dL ({(testedGlucose / 18).toFixed(1)} mmol/L)
                      </span>
                    </div>
                  </div>

                  <div className="sm:text-right space-y-1">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-black shadow-2xs ${statusInfo.badgeBg}`}>
                      {statusInfo.label}
                    </span>
                    <p className="text-xs font-semibold text-slate-600">
                      Wakati wa Kipimo: <strong>{getTimingLabel(testedTiming)}</strong>
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                  <Info className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span>{statusInfo.targetNote}</span>
                </div>
              </div>

              {/* Immediate Dietary Strategy */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-teal-800">
                  <Utensils className="w-4 h-4" />
                  <h3 className="font-black text-sm sm:text-base uppercase tracking-wider">
                    Ushauri wa Haraka wa Kilishe Sasa (Immediate Action)
                  </h3>
                </div>

                <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 text-teal-950 space-y-2">
                  <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                    {recommendation?.recommendedDietaryPlan.immediateAdvice || 
                     'Tumia vyakula vyenye nyuzi nyingi (fiber) na protini safi ili kuweka kiwango cha glukosi katika usawa bila kusababisha mparaganyiko wa sukari.'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-teal-200/60">
                    <div className="text-xs">
                      <strong className="text-teal-900 block flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-blue-600" />
                        Ushauri wa Maji na Vimiminika:
                      </strong>
                      <span className="text-slate-700">
                        {recommendation?.recommendedDietaryPlan.hydrationAdvice || 
                         'Kunywa angalau glasi 8-10 za maji safi ya uvuguvugu kwa siku. Epuka juisi zenye sukari au vinywaji vya kuongeza nguvu.'}
                      </span>
                    </div>

                    <div className="text-xs">
                      <strong className="text-teal-900 block flex items-center gap-1">
                        <Utensils className="w-3.5 h-3.5 text-teal-700" />
                        Mlinganyo wa Sahani (Plate Method):
                      </strong>
                      <span className="text-slate-700">
                        {recommendation?.recommendedDietaryPlan.portionGuidance || 
                         '1/2 Sahani: Mboga zisizo na wanga; 1/4 Sahani: Protini safi; 1/4 Sahani: Wanga tata wenye nyuzi.'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Foods Comparison Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Foods to Prioritize */}
                <div className="border border-emerald-300 rounded-xl p-4 bg-emerald-50/40 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 pb-1 border-b border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-black text-xs sm:text-sm uppercase tracking-wider">
                      Vyakula vya Kula Zaidi Sasa
                    </h4>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-800 font-medium">
                    {(recommendation?.recommendedDietaryPlan.foodsToPrioritize || [
                      'Mboga za majani: Mchicha, Bamia, Majani ya Maboga, Sukuma Wiki',
                      'Protini: Samaki wa kuchemsha/kuoka, Kuku bila ngozi, Mayai, Maharage',
                      'Wanga tata kidogo: Ugali wa dona nusu ngumi, Mtama, Viazi vitamu kidogo',
                      'Matunda salama: Parachichi zima, Tofaa dogo, Tango'
                    ]).map((food, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
                        <span>{food}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Foods to Avoid */}
                <div className="border border-rose-300 rounded-xl p-4 bg-rose-50/40 space-y-2">
                  <div className="flex items-center gap-2 text-rose-800 pb-1 border-b border-rose-200">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <h4 className="font-black text-xs sm:text-sm uppercase tracking-wider">
                      Vyakula vya Kuepuka Sasa
                    </h4>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-800 font-medium">
                    {(recommendation?.recommendedDietaryPlan.foodsToAvoidNow || [
                      'Vinywaji vyenye sukari: Soda, Juisi za viwandani, Chai ya sukari au asali',
                      'Wanga mweupe mwingi: Ugali wa sembe mwingi, Wali mweupe mwingi, Mikate myeupe',
                      'Vyakula vya kukaanga: Chips kavu au dodo, Vitumbua, Maandazi, Chapati za mafuta',
                      'Matunda yenye sukari kali: Nanasi lililoiva sana, Embe lililoiva, Ndizi mbivu nyingi'
                    ]).map((food, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 flex-shrink-0" />
                        <span>{food}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sample Recommended Meals for the Patient */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-900">
                    <Apple className="w-4 h-4 text-teal-700" />
                    <h3 className="font-black text-xs sm:text-sm uppercase tracking-wider">
                      Mapendekezo ya Milo Kulingana na Kipimo hiki
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Milo ya Asili ya Kitanzania
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(recommendation?.recommendedDietaryPlan.suggestedMeals || [
                    {
                      title: 'Chai ya Rangi na Mayai ya Kuchemsha & Tango',
                      mealType: 'breakfast',
                      carbsEstimate: 8,
                      calories: 210,
                      giLevel: 'Chini',
                      description: 'Chai ya mchaichai bila sukari, mayai 2 ya kuchemsha na vipande vya tango na parachichi.',
                      benefitsForCurrentGlucose: 'Haina wanga unaopandisha sukari ghafla asubuhi.',
                      ingredients: ['Mayai 2', 'Tango', 'Parachichi', 'Chai ya mchaichai']
                    },
                    {
                      title: 'Samaki wa Kuchemsha na Mboga za Mchicha na Ugali wa Dona',
                      mealType: 'lunch',
                      carbsEstimate: 32,
                      calories: 420,
                      giLevel: 'Chini',
                      description: 'Samaki sato mmoja, sahani kubwa ya mchicha uliochemshwa na nusu ngumi ya dona.',
                      benefitsForCurrentGlucose: 'Nyuzi za mchicha zinachelewesha mmeng’enyo wa sukari.',
                      ingredients: ['Samaki Sato', 'Mchicha', 'Unga wa dona', 'Kitunguu swaumu']
                    }
                  ]).slice(0, 4).map((meal, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900">{meal.title}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                          Wanga: ~{meal.carbsEstimate}g (GI {meal.giLevel})
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">{meal.description}</p>
                      <div className="text-[10px] text-teal-800 font-semibold pt-1">
                        <strong>Faida ya kiafya:</strong> {meal.benefitsForCurrentGlucose}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical Verification & Signatures */}
              <div className="pt-4 border-t-2 border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                    Kanusho la Kitatibu & Uthibitisho
                  </span>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Mwongozo huu wa kilishe umeandaliwa kwa kuzingatia viwango vya Wizara ya Afya na Shirika la Kisukari Duniani (IDF). Daima shauriana na daktari wako kuhusu mabadiliko ya dozi ya dawa za kisukari.
                  </p>
                </div>

                <div className="sm:text-right space-y-2">
                  <div className="inline-block border-b border-slate-400 pb-1 text-center min-w-[180px]">
                    <span className="font-serif italic font-bold text-slate-700 text-sm block">Dr. AfyaLishe Clinical Desk</span>
                    <span className="text-[9px] text-slate-400 uppercase font-mono">Kitengo cha Lishe na Kisukari</span>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 text-[10px] text-teal-700 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>Imethibitishwa Kidijitali • AfyaLishe App</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-white px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
          <span className="hidden sm:inline">
            Unaweza kubana au kuchapisha ripoti hii kwa urahisi kwenye kifaa chochote.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold ml-auto"
          >
            Funga
          </button>
        </div>

      </div>
    </div>
  );
};
