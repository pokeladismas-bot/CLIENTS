import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, Upload, X, AlertCircle, CheckCircle2, RefreshCw, 
  Sparkles, ArrowRight, ShieldCheck, Flame, Scale, ChevronDown, 
  ChevronUp, Info, HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FoodAnalysisResult, MealLog, MealType, UserProfile } from '../types';

interface FoodScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMeal: (meal: MealLog) => void;
  profile: UserProfile;
  latestGlucose?: number;
}

// Preset meal sample images & descriptions for 1-click testing
const SAMPLE_MEALS = [
  {
    title: 'Ugali wa Dona & Samaki na Mchicha',
    desc: 'Sahani ya kawaida ya Afrika Mashariki yenye ugali wa dona, samaki sato wa kuoka na mchicha wa kukaanga kiasi.',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Wali Mweupe na Maharage ya Nazi',
    desc: 'Sahani ya wali mweupe kikombe kimoja na nusu na maharage mekundu ya nazi.',
    url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Chapati 2 na Chai ya Maziwa',
    desc: 'Chapati mbili za ngano nyeupe na kikombe cha chai ya maziwa yenye sukari.',
    url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Ndizi Mbichi (Machalari) & Nyama Konda',
    desc: 'Ndizi mbichi 2 za kuchemsha pamoja na supu ya nyama ya ng\'ombe konda na mboga za majani.',
    url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Saladi ya Parachichi, Mayai na Mboga',
    desc: 'Saladi safi ya mchicha, parachichi nusu, tango, nyanya na mayai 2 ya kuchemsha.',
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
  },
];

export const FoodScannerModal: React.FC<FoodScannerModalProps> = ({
  isOpen,
  onClose,
  onSaveMeal,
  profile,
  latestGlucose,
}) => {
  const [activeMode, setActiveMode] = useState<'camera' | 'upload' | 'samples'>('samples');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [textDescription, setTextDescription] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');
  const [glucoseBeforeMeal, setGlucoseBeforeMeal] = useState<string>(latestGlucose ? String(latestGlucose) : '');
  const [showItemDetails, setShowItemDetails] = useState<boolean>(false);

  // Camera handling
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-start camera when switching to camera mode
  useEffect(() => {
    if (isOpen && activeMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeMode]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
        });
        setCameraStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } else {
        setCameraError('Kamera haipatikani kwenye kivinjari hiki. Tafadhali pakia picha badala yake.');
      }
    } catch (err: any) {
      console.warn('Camera error:', err);
      setCameraError('Kamera haikuweza kufunguka. Tafadhali ruhusu kamera au tumia chaguo la kupakia picha.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setSelectedImage(dataUrl);
      stopCamera();
      analyzeFood(dataUrl, textDescription);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSelectedImage(dataUrl);
      analyzeFood(dataUrl, textDescription);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: typeof SAMPLE_MEALS[0]) => {
    setSelectedImage(sample.url);
    setTextDescription(sample.desc);
    analyzeFood(sample.url, sample.desc);
  };

  const analyzeFood = async (imageUrlOrBase64: string, description: string) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
      let payload: any = {
        description: description,
        currentGlucose: latestGlucose,
        diabetesType: profile.diabetesType,
      };

      if (imageUrlOrBase64.startsWith('data:')) {
        payload.imageBase64 = imageUrlOrBase64;
        payload.mimeType = imageUrlOrBase64.substring(imageUrlOrBase64.indexOf(':') + 1, imageUrlOrBase64.indexOf(';'));
      } else if (imageUrlOrBase64.startsWith('http')) {
        // Fetch image as blob and convert to base64 for Gemini vision
        try {
          const imgRes = await fetch(imageUrlOrBase64);
          const blob = await imgRes.blob();
          const base64: string = await new Promise((resolve) => {
            const r = new FileReader();
            r.onloadend = () => resolve(r.result as string);
            r.readAsDataURL(blob);
          });
          payload.imageBase64 = base64;
          payload.mimeType = blob.type || 'image/jpeg';
        } catch (fetchErr) {
          // If fetch fails (CORS), pass just description
          console.warn('Could not fetch sample image directly, sending description:', fetchErr);
        }
      }

      const res = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Imeshindikana kuchambua picha ya chakula.');
      }

      setAnalysisResult(json.data);
      if (json.data.safetyRating === 'Salama Sana' || json.data.safetyRating === 'Salama kwa Kiasi') {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setAnalysisError(err.message || 'Hitilafu wakati wa kuchambua chakula.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToDiary = () => {
    if (!analysisResult) return;

    const newMeal: MealLog = {
      id: 'meal-' + Date.now(),
      timestamp: new Date().toISOString(),
      mealType: selectedMealType,
      title: analysisResult.foodName,
      imageUrl: selectedImage || undefined,
      totalCarbs: analysisResult.totalCarbs,
      netCarbs: analysisResult.netCarbs,
      fiber: analysisResult.fiber,
      protein: analysisResult.protein,
      fat: analysisResult.fat,
      calories: analysisResult.calories,
      glycemicIndexLevel: analysisResult.glycemicIndexLevel,
      glycemicLoad: analysisResult.glycemicLoad,
      safetyRating: analysisResult.safetyRating,
      itemsBreakdown: analysisResult.itemsBreakdown,
      diabeticTips: analysisResult.diabeticTips,
      glucoseBefore: glucoseBeforeMeal ? Number(glucoseBeforeMeal) : undefined,
      notes: analysisResult.glucoseImpactSummary,
    };

    onSaveMeal(newMeal);
    onClose();
  };

  const resetScanner = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setAnalysisError(null);
    setTextDescription('');
    if (activeMode === 'camera') {
      startCamera();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">Kikokotoo cha Wanga kwa Picha (AI)</h3>
              <p className="text-xs text-slate-500">Piga au pakia picha ya chakula ili kupima wanga na Glycemic Index</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {!analysisResult && !isAnalyzing && (
            <>
              {/* Mode Selection Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs sm:text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => { setActiveMode('samples'); stopCamera(); }}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    activeMode === 'samples' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Mifano ya Milo ya Afrika Mashariki</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveMode('camera'); }}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    activeMode === 'camera' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>Piga Picha Sasa</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveMode('upload'); stopCamera(); }}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    activeMode === 'upload' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Pakia Faili</span>
                </button>
              </div>

              {/* Mode 1: Sample Meals Grid */}
              {activeMode === 'samples' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Chagua sahani yoyote kati ya hizi kufanya jaribio la haraka:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SAMPLE_MEALS.map((sample, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectSample(sample)}
                        className="group cursor-pointer rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md p-3 transition-all bg-white flex gap-3 items-center"
                      >
                        <img
                          src={sample.url}
                          alt={sample.title}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700 truncate">
                            {sample.title}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{sample.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Manual description fallback */}
                  <div className="pt-3 border-t border-slate-200">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Au andika chakula ulichokula:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Mfano: Ugali wa mtama gramu 150, mchicha kikombe 1, samaki kukaangwa..."
                        value={textDescription}
                        onChange={(e) => setTextDescription(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        disabled={!textDescription.trim()}
                        onClick={() => analyzeFood('', textDescription)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-medium transition-colors"
                      >
                        Pima Wanga
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Mode 2: Camera Feed */}
              {activeMode === 'camera' && (
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video sm:aspect-4/3 flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Camera Overlay Guide */}
                    <div className="absolute inset-4 sm:inset-8 border-2 border-dashed border-white/60 rounded-xl pointer-events-none flex items-center justify-center">
                      <span className="bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-xs">
                        Weka sahani yako ya chakula katikati ya fremu
                      </span>
                    </div>

                    {cameraError && (
                      <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center text-white">
                        <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
                        <p className="text-sm font-medium mb-3">{cameraError}</p>
                        <button
                          onClick={() => { setActiveMode('upload'); }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
                        >
                          Pakia Picha kutoka Kwenye Kifaa
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      disabled={!!cameraError}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white rounded-full font-bold shadow-lg transition-all"
                    >
                      <Camera className="w-5 h-5" />
                      <span>Nasa Picha & Kokotoa Wanga</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Mode 3: File Upload */}
              {activeMode === 'upload' && (
                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all bg-slate-50 hover:bg-emerald-50/40"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center mb-3">
                      <Upload className="w-7 h-7" />
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-800 mb-1">
                      Bofya hapa kupakia picha ya chakula
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Inasaidia picha za JPEG, PNG, WEBP. AI itatambua kiotomatiki kila kipengele cha chakula na kupima kiasi cha wanga.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Maelezo ya ziada (Hiari):</label>
                    <input
                      type="text"
                      placeholder="Mfano: Ugali wa Dona na Mchicha usio na mafuta mengi"
                      value={textDescription}
                      onChange={(e) => setTextDescription(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Loading / Analyzing Screen */}
          {isAnalyzing && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-emerald-600">
                  <Sparkles className="w-7 h-7 animate-pulse" />
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-base sm:text-lg">AI Inachambua Chakula na Wanga...</h4>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md">
                  Inatambua vipimo vya vyakula kwenye sahani, inakokotoa jumla ya Wanga, Nyuzinyuzi (Fiber), na Glycemic Index kwa ajili ya kisukari.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {analysisError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1">
                <p className="font-bold mb-1">Hitilafu ya Uchambuzi</p>
                <p>{analysisError}</p>
                <button
                  onClick={resetScanner}
                  className="mt-2.5 px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
                >
                  Jaribu Tena
                </button>
              </div>
            </div>
          )}

          {/* Analysis Results Display */}
          {analysisResult && (
            <div className="space-y-6">
              {/* Top Banner: Food Title & Safety Rating */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl">
                <div className="flex items-center gap-3">
                  {selectedImage && (
                    <img
                      src={selectedImage}
                      alt={analysisResult.foodName}
                      className="w-14 h-14 rounded-xl object-cover border border-emerald-300 flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-base sm:text-lg">{analysisResult.foodName}</h4>
                    </div>
                    <p className="text-xs text-slate-600">Kipimo: {analysisResult.servingSize}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      analysisResult.safetyRating === 'Salama Sana'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : analysisResult.safetyRating === 'Salama kwa Kiasi'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : analysisResult.safetyRating === 'Tumia kwa Tahadhari'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{analysisResult.safetyRating}</span>
                  </span>
                </div>
              </div>

              {/* Primary Macronutrient Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Net Carbs (Crucial for Diabetes) */}
                <div className="bg-emerald-50/70 border-2 border-emerald-500 rounded-xl p-3 text-center relative overflow-hidden">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                    Wanga Halisi (Net Carbs)
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 my-0.5">
                    {analysisResult.netCarbs}g
                  </div>
                  <p className="text-[10px] text-emerald-600">
                    Jumla {analysisResult.totalCarbs}g - Nyuzi {analysisResult.fiber}g
                  </p>
                </div>

                {/* Glycemic Index */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Glycemic Index (GI)
                  </span>
                  <div className="text-xl sm:text-2xl font-bold text-slate-800 my-0.5 flex items-center justify-center gap-1">
                    <span>{analysisResult.glycemicIndexLevel}</span>
                    <span className="text-xs text-slate-400 font-normal">({analysisResult.glycemicIndexValue})</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Mzingo (GL): {analysisResult.glycemicLoad}</p>
                </div>

                {/* Protein & Fat */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Protini & Mafuta
                  </span>
                  <div className="text-xl sm:text-2xl font-bold text-slate-800 my-0.5">
                    {analysisResult.protein}g / {analysisResult.fat}g
                  </div>
                  <p className="text-[10px] text-slate-500">Hupunguza kasi ya wanga</p>
                </div>

                {/* Calories */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Kalori Zote
                  </span>
                  <div className="text-xl sm:text-2xl font-bold text-slate-800 my-0.5 flex items-center justify-center gap-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span>{analysisResult.calories}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">kcal</p>
                </div>
              </div>

              {/* Glucose Impact Analysis */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-500" />
                  <span>Athari ya Mlo Huu kwa Sukari ya Damu</span>
                </h5>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {analysisResult.glucoseImpactSummary}
                </p>
              </div>

              {/* Diabetic Tips & Portion Guidance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-teal-50/60 border border-teal-200 rounded-xl p-3.5 space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>Mbinu za Kula kwa Usalama</span>
                  </h5>
                  <ul className="text-xs text-teal-950 space-y-1.5 list-disc pl-4">
                    {analysisResult.diabeticTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5 space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-amber-600" />
                    <span>Ushauri wa Sehemu za Sahani</span>
                  </h5>
                  <p className="text-xs text-amber-950 leading-relaxed">
                    {analysisResult.portionAdjustmentAdvice}
                  </p>
                </div>
              </div>

              {/* Individual Items Breakdown (Accordion) */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowItemDetails(!showItemDetails)}
                  className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-800 transition-colors"
                >
                  <span>Mchanganuo wa Vyakula kwenye Sahani ({analysisResult.itemsBreakdown.length})</span>
                  {showItemDetails ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>

                {showItemDetails && (
                  <div className="p-3 bg-white divide-y divide-slate-100">
                    {analysisResult.itemsBreakdown.map((item, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-slate-900">{item.name}</span>
                          <span className="text-slate-500 ml-1.5">({item.portion})</span>
                        </div>
                        <div className="flex items-center gap-3 text-right">
                          <span className="text-slate-600">
                            Wanga: <strong className="text-emerald-700">{item.carbs}g</strong> (Nyuzi: {item.fiber}g)
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.glycemicIndex === 'Chini' ? 'bg-emerald-100 text-emerald-800' :
                            item.glycemicIndex === 'Wastani' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            GI {item.glycemicIndex}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Save to Diary Form Controls */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Aina ya Mlo:</label>
                    <select
                      value={selectedMealType}
                      onChange={(e) => setSelectedMealType(e.target.value as MealType)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="breakfast">Kifungua Kinywa (Asubuhi)</option>
                      <option value="lunch">Chakula cha Mchana</option>
                      <option value="dinner">Chakula cha Usiku</option>
                      <option value="snack">Kitafunio / Vitafunwa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kiwango cha Sukari kabla ya kula (mg/dL) - Hiari:
                    </label>
                    <input
                      type="number"
                      placeholder="Mf. 110"
                      value={glucoseBeforeMeal}
                      onChange={(e) => setGlucoseBeforeMeal(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleSaveToDiary}
                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Hifadhi Kwenye Diary ya Lishe ya Leo</span>
                  </button>

                  <button
                    type="button"
                    onClick={resetScanner}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Pima Chakula Kingine</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
