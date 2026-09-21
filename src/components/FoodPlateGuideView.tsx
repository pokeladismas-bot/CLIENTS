import React, { useState, useEffect } from 'react';
import { 
  PieChart as PieIcon, Droplets, CheckCircle2, ChevronRight, Apple, 
  Utensils, Info, Sparkles, HeartPulse, ShieldCheck, Printer, 
  Flame, Award, Search, HelpCircle, ArrowRight, Ban, Clock, AlertTriangle, Shield
} from 'lucide-react';
import { FoodPlateGroup } from '../types';
import { TFNC_FOOD_PLATE_GROUPS } from '../data/sampleData';

interface FoodPlateGuideViewProps {
  onOpenPrintPlan?: () => void;
  registeredCondition?: string; // 'shinikizo_la_damu' | 'kisukari' | 'kupunguza_uzito' | 'watoto_lishe' | 'lishe_jumla'
  activePatientName?: string;
  isAdmin?: boolean;
}

type GuideFilter = 'kawaida' | 'shinikizo_la_damu' | 'kisukari' | 'kupunguza_uzito' | 'watoto';

interface ConditionMealExample {
  title: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
  avoidFoods: string[];
  keyRules: string[];
}

const CONDITION_MEAL_EXAMPLES: Record<GuideFilter, ConditionMealExample> = {
  shinikizo_la_damu: {
    title: 'Mlo wa DASH & Chumvi Chini kwa Shinikizo la Damu (Presha)',
    breakfast: 'Chai ya mchaichai au tangawizi bila sukari + Uji mwepesi wa dona usio na sukari uliochanganywa na maziwa ya mtindi (nusu kikombe) + ndizi mbivu 1 ya wastani (potasiamu nyingi).',
    lunch: 'Nusu sahani mboga za majani (mchicha au matembele) + Robo sahani samaki wa kuchemsha au kuku wa kienyeji asiye na ngozi + Robo sahani ugali wa dona (ngumi 1 tu) + kipande cha parachichi.',
    dinner: 'Supu nzito ya dengu au maharage yasiyo na chumvi nyingi + ndizi 2 za kupika za kijani + salad ya matango na nyanya bila mayonnaise.',
    snacks: 'Matikiti maji vipande viwili, tango bichi, korosho zilizooka bila chumvi (nusu kiganja), na maji safi glasi 8 kwa siku.',
    avoidFoods: [
      'Chumvi mbichi ya kuongeza mezani kwenye chakula kilichoiva.',
      'Viungo vyenye sodiamu nyingi (Royco, cubes, ajinomoto, baking powder, noodles zilizokaushwa).',
      'Vyakula vya makopo, sosi za viwandani (tomato sauce, soya sauce zenye chumvi).',
      'Nyama nyekundu za mafuta na vyakula vilivyokaangwa kwa mafuta yaliyotumika zaidi ya mara moja.'
    ],
    keyRules: [
      'Tumia chini ya kijiko 1 kidogo cha chai cha chumvi kwa milo yote ya siku nzima (chini ya gramu 2).',
      'Kula mboga za majani na matunda yenye madini ya Potasiamu ili kupunguza athari ya sodiamu mwilini.',
      'Kunywa glasi ya maji nusu saa kabla na baada ya mlo.'
    ]
  },
  kisukari: {
    title: 'Mlo wa Glycemic Index ya Chini kwa Udhibiti wa Sukari Mwilini',
    breakfast: 'Yai 1 la kuchemsha + Chai ya maziwa yasiyo na mafuta mengi (skimmed) bila sukari + kipande 1 kidogo cha viazi vitamu vya njano au muhogo wa kuchemsha.',
    lunch: 'Nusu sahani mboga za majani (Kisamvu kisicho na nazi nyingi au Matembele) + Robo sahani kuku wa kienyeji au samaki fresh + Robo sahani ugali wa dona au wali wa brown usiozidi ngumi moja.',
    dinner: 'Supu ya samaki au kuku wa kienyeji iliyotiwa mboga nyingi (karoti, pilipili hoho, vitunguu) + parachichi robo + kipande kidogo cha ndizi ya kupika.',
    snacks: 'Tango lililokatwa vipande, mbegu za maboga zilizokaushwa bila sukari, au maji ya limao vuguvugu.',
    avoidFoods: [
      'Soda zote, vinywaji vya nishati (energy drinks), na juisi za viwandani.',
      'Juisi za matunda zilizochujwa hata kama hazijaongezwa sukari (kunywa juisi husababisha sukari kupanda ghafla).',
      'Mikate myeupe ya dukani, keki, biskuti, maandazi na chapati za ngano nyeupe iliyokobolewa.',
      'Vyakula vyenye wanga rahisi uliosindikwa kama ugali wa sembe mweupe kabisa.'
    ],
    keyRules: [
      'Kamwe usizidishe ngumi 1 ya mkono wako kwa vyakula vya wanga kwenye kila mlo.',
      'Mboga za majani zisiwe chini ya nusu nzima ya sahani yako.',
      'Pima sukari ya asubuhi kabla ya kula na saa 2 baada ya chakula kikuu.'
    ]
  },
  kupunguza_uzito: {
    title: 'Mlo wa Uwiano wa Kalori & Kushibisha kwa Kupunguza Uzito',
    breakfast: 'Chai ya kijani (green tea) bila sukari au maji vuguvugu yenye limao + mayai 2 ya kuchemsha (chanzo kikuu cha protini inayozuia njaa) + tango zima.',
    lunch: 'Nusu sahani saladi mchanganyiko na kabeji iliyokaangwa kidogo + Kipande cha samaki wa kuchemsha au kifua cha kuku + vijiko 4 tu vya wali wa dona au viazi mviringo 1 vya kuchemsha.',
    dinner: 'Bakuli la supu ya mbogamboga bila mafuta au dengu zilizochemshwa kabla ya saa 1:30 usiku + maji glasi 2 kubwa.',
    snacks: 'Tofaa (apple) 1 au parachichi robo, matango ya kutafuna, na unywaji wa maji lita 2.5 hadi 3 kila siku.',
    avoidFoods: [
      'Chipsi mayai, mishikaki ya mafuta mengi, vitumbua, na vyakula vya kukaanga kirefu (deep fried).',
      'Bia, pombe kali na vinywaji vyenye sukari iliyofichika.',
      'Kula vyakula vizito vya wanga baada ya saa 2:00 usiku.',
      'Michuzi yenye mafuta yanayoelea juu ya sahani.'
    ],
    keyRules: [
      'Anza kula mboga za majani kwanza kabla ya kuanza wanga ili kujaza tumbo kwa nyuzinyuzi.',
      'Kunywa glasi 2 za maji dakika 20 kabla ya kila mlo mkuu.',
      'Fanya mazoezi ya kutembea kwa haraka angalau dakika 30 kila siku.'
    ]
  },
  watoto: {
    title: 'Mlo Kamili wa Kuzuia Udumavu & Kujenga Mwili wa Mtoto (Pediatric)',
    breakfast: 'Uji wa lishe uliorutubishwa (dona, soya, ulezi, mbegu za maboga) uliowekwa kijiko cha maziwa au siagi ya karanga + yai 1 la kuchemsha au maziwa fresh.',
    lunch: 'Ugali mlaini wa dona au viazi vilivyopondwa + samaki asiye na mifupa au ini lililopondwa + mboga laini za majani (mchicha) zilizopikwa na maziwa kidogo au mafuta ya mimea.',
    dinner: 'Ndizi mbivu zilizopondwa na maziwa ya ng\'ombe au uji mzito wa lishe + matunda laini kama papai lililoiva vizuri.',
    snacks: 'Maziwa ya mtindi, ndizi mbivu, parachichi lililopondwa, au yai la kienyeji.',
    avoidFoods: [
      'Pipi, biskuti zenye sukari nyingi na soda kabla ya chakula kikuu (hupoteza hamu ya kula ya mtoto).',
      'Uji mwepesi wa mahindi meupe peke yake (hauna virutubisho vya kutosha na husababisha udumavu).',
      'Chakula kilichopoa bila kupashwa moto vizuri.'
    ],
    keyRules: [
      'Ongeza kijiko 1 cha mafuta safi ya mimea au siagi ya karanga kwenye chakula cha mtoto kuongeza nishati lishe.',
      'Mlishe mtoto mara 4 hadi 5 kwa siku kwa sababu tumbo lake ni dogo.',
      'Hakikisha anaendelea kunyonyeshwa maziwa ya mama kwa watoto walio chini ya miaka 2.'
    ]
  },
  kawaida: {
    title: 'Mwongozo wa Kitaifa wa Chakula Tanzania (TFNC) kwa Afya Bora',
    breakfast: 'Chai ya maziwa au chai ya viungo + mayai ya kuchemsha au viazi vitamu vya kuchemsha + tunda la asili (papai/ndizi).',
    lunch: 'Nusu sahani mboga za majani na matunda + Robo sahani samaki/nyama/maharage + Robo sahani ugali wa dona au wali wa asili.',
    dinner: 'Mlo mwepesi wenye uwiano wa mboga, protini na wanga kidogo + maji safi ya kunywa.',
    snacks: 'Matunda safi ya msimu, karanga au korosho kidogo, na maji salama.',
    avoidFoods: [
      'Kula chumvi na sukari kupita kiasi.',
      'Ulaji wa mara kwa mara wa vyakula vilivyosindikwa viwandani.'
    ],
    keyRules: [
      'Gawa sahani yako katika sehemu tatu: Nusu mboga & matunda, robo protini, robo wanga tata.',
      'Kunywa glasi ya maji safi na salama kila mlo.'
    ]
  }
};

export const FoodPlateGuideView: React.FC<FoodPlateGuideViewProps> = ({
  onOpenPrintPlan,
  registeredCondition,
  activePatientName,
  isAdmin = false,
}) => {
  const getInitialFilter = (): GuideFilter => {
    if (registeredCondition === 'shinikizo_la_damu') return 'shinikizo_la_damu';
    if (registeredCondition === 'kisukari') return 'kisukari';
    if (registeredCondition === 'kupunguza_uzito') return 'kupunguza_uzito';
    if (registeredCondition === 'watoto_lishe') return 'watoto';
    return 'kawaida';
  };

  const [selectedGroup, setSelectedGroup] = useState<FoodPlateGroup>(TFNC_FOOD_PLATE_GROUPS[0]);
  const [activeFilter, setActiveFilter] = useState<GuideFilter>(getInitialFilter());
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (registeredCondition) {
      setActiveFilter(getInitialFilter());
    }
  }, [registeredCondition]);

  const filterLabels: Record<GuideFilter, { label: string; desc: string; icon: any; color: string }> = {
    kawaida: {
      label: 'Mwongozo wa Kitaifa (TFNC)',
      desc: 'Muundo wa sahani kamili ya kila siku kwa afya bora ya familia.',
      icon: Utensils,
      color: 'bg-emerald-600 text-white',
    },
    shinikizo_la_damu: {
      label: 'Shinikizo la Damu (Presha / DASH)',
      desc: 'Chumvi kidogo chini ya gramu 2, potasiamu nyingi, mboga nusu sahani.',
      icon: HeartPulse,
      color: 'bg-rose-600 text-white',
    },
    kisukari: {
      label: 'Kisukari (Low Glycemic Index)',
      desc: 'Wanga tata usiozidi ngumi 1, mboga nusu ya sahani, bila soda wala juisi.',
      icon: ShieldCheck,
      color: 'bg-indigo-600 text-white',
    },
    kupunguza_uzito: {
      label: 'Kupunguza Uzito & Kitambi',
      desc: 'Kalori chache, nyuzinyuzi tele za kushibisha, mafuta kidogo sana.',
      icon: Flame,
      color: 'bg-amber-600 text-white',
    },
    watoto: {
      label: 'Watoto Wanaokua (Pediatric)',
      desc: 'Nishati lishe zaidi, uji uliorutubishwa, protini ya kujenga mwili na ubongo.',
      icon: Sparkles,
      color: 'bg-teal-600 text-white',
    },
  };

  const currentMealPlan = CONDITION_MEAL_EXAMPLES[activeFilter];

  return (
    <div className="space-y-6" id="food-plate-guide-view">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-bold mb-3">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              <span>Muongozo wa Kitaifa wa Chakula Tanzania (TFNC)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
              Mwongozo wa Chakula & Mifano ya Sahani Kulingana na Ugonjwa
            </h1>
            <p className="text-sm text-emerald-100/85 leading-relaxed">
              Kulingana na miongozo ya Taasisi ya Chakula na Lishe Tanzania (TFNC), hapa chini kuna uwiano sahihi wa makundi 6 ya chakula na mifano halisi ya vyakula vya Kitanzania vilivyoboreshwa kulingana na ugonjwa wako.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {onOpenPrintPlan && (
              <button
                onClick={onOpenPrintPlan}
                className="px-4 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                id="btn-print-eating-plan"
              >
                <Printer className="w-4 h-4" />
                <span>Chapisha Ratiba ya Chakula</span>
              </button>
            )}
          </div>
        </div>

        {/* Tailored Patient Notice */}
        {registeredCondition && (
          <div className="mt-5 pt-4 border-t border-emerald-800/60 flex items-center gap-2 text-xs text-emerald-200">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span>
              Imebinafsishwa kwa: <strong>{activePatientName || 'Mgonjwa Aliyesajiliwa'}</strong> • Ugonjwa: <strong>{filterLabels[activeFilter].label}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Target Health Goal / Condition Filter Chips (Admin or User can select, defaults to registered disease) */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
          Mwongozo Uliobinafsishwa Kulingana na Ugonjwa:
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {(Object.keys(filterLabels) as GuideFilter[]).map((filterKey) => {
            const item = filterLabels[filterKey];
            const Icon = item.icon;
            const isActive = activeFilter === filterKey;

            return (
              <button
                key={filterKey}
                onClick={() => setActiveFilter(filterKey)}
                className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? item.color + ' shadow-md scale-102 ring-2 ring-emerald-400/30'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                id={`filter-plate-${filterKey}`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* DETAILED CONDITION-SPECIFIC MEAL PLAN & TANZANIAN FOOD EXAMPLES */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mfano wa Ratiba ya Mlo wa Kitanzania kwa Siku Nzima</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {currentMealPlan.title}
            </h2>
          </div>
          
          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-200 max-w-xs">
            💡 <strong>Miongozo ya Taifa:</strong> Kila mlo uzingatie vyakula asilia vya masoko yetu (dona, samaki fresh, mchicha, dengu).
          </div>
        </div>

        {/* 4 Meals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Asubuhi */}
          <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-amber-800 font-black text-sm">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Kifungua Kinywa (Asubuhi)</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {currentMealPlan.breakfast}
            </p>
          </div>

          {/* Mchana */}
          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
              <Utensils className="w-4 h-4 text-emerald-600" />
              <span>Chakula cha Mchana</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {currentMealPlan.lunch}
            </p>
          </div>

          {/* Usiku */}
          <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
            <div className="flex items-center gap-2 text-blue-800 font-black text-sm">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Chakula cha Usiku</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {currentMealPlan.dinner}
            </p>
          </div>
        </div>

        {/* Vitafunwa & Maji */}
        <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Droplets className="w-6 h-6 text-sky-500 shrink-0" />
            <div className="text-xs">
              <strong className="block font-black text-sky-950 text-sm mb-0.5">Vitafunwa na Maji Safi ya Kunywa:</strong>
              <span className="text-sky-900 font-medium">{currentMealPlan.snacks}</span>
            </div>
          </div>
        </div>

        {/* Vyakula vya Kuepuka Kabisa (Forbidden Foods for this condition) */}
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
          <div className="flex items-center gap-2 text-rose-900 font-black text-sm">
            <Ban className="w-4 h-4 text-rose-600" />
            <span>Vyakula vya Kuepuka Kabisa kwa Hali Hii:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {currentMealPlan.avoidFoods.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-rose-950 bg-white/70 p-2.5 rounded-xl border border-rose-200/60 font-medium">
                <span className="text-rose-600 font-bold shrink-0">✕</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Kanuni Kuu za Kilishe */}
        <div className="p-5 rounded-2xl bg-teal-50 border border-teal-200 space-y-2">
          <div className="flex items-center gap-2 text-teal-900 font-black text-sm">
            <Shield className="w-4 h-4 text-teal-700" />
            <span>Kanuni Muhimu za Kilishe:</span>
          </div>
          <ul className="space-y-1.5 text-xs text-teal-950 font-medium">
            {currentMealPlan.keyRules.map((rule, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* TFNC Visual Food Plate & 6 Groups Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Interactive Plate Graphic */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              Muundo wa Sahani ya Kitaifa ya Tanzania (TFNC)
            </h2>
            <p className="text-xs text-slate-500">
              Bofya sehemu yoyote ya sahani au kundi hapa chini kutazama mifano ya vyakula vya masoko yetu.
            </p>
          </div>

          {/* SVG Plate Representation */}
          <div className="relative max-w-sm mx-auto aspect-square p-2">
            <svg viewBox="0 0 320 320" className="w-full h-full drop-shadow-md">
              <circle cx="160" cy="160" r="150" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="8" />
              <circle cx="160" cy="160" r="142" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" />

              {/* 1. Nafaka na Mizizi (32%) */}
              <path
                d="M 160 160 L 300 160 A 140 140 0 0 1 101 287 Z"
                fill={selectedGroup.id === 'group_nafaka_mizizi' ? '#D97706' : '#F59E0B'}
                stroke="#FFFFFF"
                strokeWidth="3"
                className="cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedGroup(TFNC_FOOD_PLATE_GROUPS[0])}
              />

              {/* 2. Mbogamboga (22%) */}
              <path
                d="M 160 160 L 101 287 A 140 140 0 0 1 22 184 Z"
                fill={selectedGroup.id === 'group_mbogamboga' ? '#15803D' : '#22C55E'}
                stroke="#FFFFFF"
                strokeWidth="3"
                className="cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedGroup(TFNC_FOOD_PLATE_GROUPS[1])}
              />

              {/* 3. Matunda (12%) */}
              <path
                d="M 160 160 L 22 184 A 140 140 0 0 1 60 62 Z"
                fill={selectedGroup.id === 'group_matunda' ? '#EA580C' : '#FB923C'}
                stroke="#FFFFFF"
                strokeWidth="3"
                className="cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedGroup(TFNC_FOOD_PLATE_GROUPS[2])}
              />

              {/* 4. Mikunde na Kokwa (17%) */}
              <path
                d="M 160 160 L 60 62 A 140 140 0 0 1 160 20 Z"
                fill={selectedGroup.id === 'group_mikunde_kokwa' ? '#7E22CE' : '#A855F7'}
                stroke="#FFFFFF"
                strokeWidth="3"
                className="cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedGroup(TFNC_FOOD_PLATE_GROUPS[3])}
              />

              {/* 5. Asili ya Wanyama (14%) */}
              <path
                d="M 160 160 L 160 20 A 140 140 0 0 1 291 112 Z"
                fill={selectedGroup.id === 'group_asili_wanyama' ? '#BE123C' : '#F43F5E'}
                stroke="#FFFFFF"
                strokeWidth="3"
                className="cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedGroup(TFNC_FOOD_PLATE_GROUPS[4])}
              />

              {/* 6. Mafuta ya Mimea (3%) */}
              <path
                d="M 160 160 L 291 112 A 140 140 0 0 1 300 160 Z"
                fill={selectedGroup.id === 'group_mafuta_mimea' ? '#CA8A04' : '#FACC15'}
                stroke="#FFFFFF"
                strokeWidth="3"
                className="cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedGroup(TFNC_FOOD_PLATE_GROUPS[5])}
              />

              {/* Center Plate Hub */}
              <circle cx="160" cy="160" r="38" fill="#FFFFFF" stroke="#0F172A" strokeWidth="3" />
              <text x="160" y="155" textAnchor="middle" fontSize="9" fontWeight="900" fill="#0F172A">SAHANI YA</text>
              <text x="160" y="167" textAnchor="middle" fontSize="9" fontWeight="900" fill="#10B981">TANZANIA</text>
              <text x="160" y="177" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#64748B">TFNC</text>
            </svg>

            {/* Floating Glass of Water */}
            <div className="absolute top-0 right-0 bg-white/95 backdrop-blur-md p-2.5 rounded-2xl border border-sky-200 shadow-lg text-center transform translate-x-2 -translate-y-2">
              <Droplets className="w-6 h-6 text-sky-500 mx-auto animate-bounce" />
              <span className="text-[10px] font-black text-sky-900 block leading-tight mt-1">Maji Safi</span>
              <span className="text-[9px] text-sky-700 block">Kila Mlo</span>
            </div>
          </div>

          {/* Quick Clickable Selectors for the 6 Groups */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
            {TFNC_FOOD_PLATE_GROUPS.map((grp) => {
              const isSelected = selectedGroup.id === grp.id;
              return (
                <button
                  key={grp.id}
                  onClick={() => setSelectedGroup(grp)}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: grp.plateVisualColor }}
                    />
                    <span className={`text-[10px] font-extrabold ${isSelected ? 'text-white' : 'text-slate-500'}`}>
                      {grp.recommendedPortionPercentage}
                    </span>
                  </div>
                  <p className="text-xs font-bold truncate">{grp.swahiliTitle.split('(')[0]}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Group Detailed Analysis */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            
            {/* Group Title Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: selectedGroup.plateVisualColor }}
                  />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Uwiano Uliopendekezwa: {selectedGroup.recommendedPortionPercentage} ya Sahani
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900">{selectedGroup.swahiliTitle}</h2>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-700 leading-relaxed">
              {selectedGroup.description}
            </p>

            {/* Key Nutrients Pills */}
            <div>
              <label className="text-xs font-extrabold text-slate-500 uppercase block mb-2">Virutubisho Vikuu:</label>
              <div className="flex flex-wrap gap-1.5">
                {selectedGroup.keyNutrients.map((nutr, i) => (
                  <span key={i} className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold">
                    ✨ {nutr}
                  </span>
                ))}
              </div>
            </div>

            {/* Tailored Health Advice Based on Active Condition */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-black uppercase">
                  Ushauri Maalum wa Kundi Hili kwa: {filterLabels[activeFilter].label}
                </span>
              </div>
              <p className="text-xs text-amber-900 font-medium leading-relaxed">
                {activeFilter === 'shinikizo_la_damu' && selectedGroup.healthAdvice.forHypertension}
                {activeFilter === 'kisukari' && selectedGroup.healthAdvice.forDiabetes}
                {activeFilter === 'kupunguza_uzito' && selectedGroup.healthAdvice.forWeightLoss}
                {activeFilter === 'watoto' && selectedGroup.healthAdvice.forChildren}
                {activeFilter === 'kawaida' && (
                  <span>
                    Chagua vyakula vya asili visivyosafishwa. {selectedGroup.healthAdvice.forHypertension}
                  </span>
                )}
              </p>
            </div>

            {/* Local Food Examples in Tanzania */}
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                Mifano ya Vyakula vya Masoko ya Tanzania & Vipimo:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedGroup.localFoodExamples.map((ex, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <strong className="text-slate-900 text-xs font-bold block">{ex.name}</strong>
                    <p className="text-[11px] text-slate-600">{ex.description}</p>
                    <p className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                      Kipimo: {ex.portionAdvice}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
