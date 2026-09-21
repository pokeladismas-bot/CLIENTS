import React, { useState } from 'react';
import { 
  Baby, Scale, HeartPulse, AlertTriangle, CheckCircle2, Plus, 
  Calendar, Utensils, Droplets, Smile, Frown, Meh, Sparkles, 
  BookOpen, ChevronRight, User, Phone, ShieldCheck
} from 'lucide-react';
import { 
  RegisteredPatient, ChildFeedingLog, ChildFeedingChallenge 
} from '../types';

interface ChildNutritionTrackerViewProps {
  patient: RegisteredPatient;
  onUpdatePatient: (updated: RegisteredPatient) => void;
}

export const ChildNutritionTrackerView: React.FC<ChildNutritionTrackerViewProps> = ({
  patient,
  onUpdatePatient,
}) => {
  const childProfile = patient.childProfile;

  // New Feeding Log Form State
  const [isAddingLog, setIsAddingLog] = useState(false);
  const [mealType, setMealType] = useState<'kifungua_kinywa' | 'mchana' | 'usiku' | 'vitafunwa' | 'maziwa'>('kifungua_kinywa');
  const [foodItems, setFoodItems] = useState('');
  const [portionConsumed, setPortionConsumed] = useState<'yote' | 'nusu' | 'kidogo' | 'alikataa'>('yote');
  const [waterAndFluidsMl, setWaterAndFluidsMl] = useState<number>(150);
  const [moodDuringMeal, setMoodDuringMeal] = useState<'mchangamfu' | 'taratibu' | 'alilia_au_alilazimishwa' | 'alikataa_kabisa'>('mchangamfu');
  const [mealNotes, setMealNotes] = useState('');

  // Quick MUAC update
  const [isUpdatingMuac, setIsUpdatingMuac] = useState(false);
  const [muacInput, setMuacInput] = useState(childProfile?.muacCm?.toString() || '');

  const calculateMuacStatus = (val: number): 'kijani' | 'njano' | 'nyekundu' => {
    if (val < 11.5) return 'nyekundu';
    if (val <= 12.5) return 'njano';
    return 'kijani';
  };

  const handleSaveMuac = () => {
    const val = parseFloat(muacInput);
    if (isNaN(val) || val <= 0) return;

    const status = calculateMuacStatus(val);
    const updated = {
      ...patient,
      childProfile: {
        ...(patient.childProfile || {
          guardianName: '',
          guardianPhone: '',
          guardianRelation: '',
          breastfeedingStatus: 'haihusiki' as const,
        }),
        muacCm: val,
        muacStatus: status,
      },
    };
    onUpdatePatient(updated);
    setIsUpdatingMuac(false);
  };

  const handleSaveFeedingLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodItems.trim()) return;

    const newLog: ChildFeedingLog = {
      id: 'cfl-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      mealType,
      foodItems: foodItems.trim(),
      portionConsumed,
      waterAndFluidsMl: Number(waterAndFluidsMl) || 0,
      moodDuringMeal,
      notes: mealNotes.trim() || undefined,
    };

    const updatedLogs = [newLog, ...(childProfile?.feedingLogs || [])];

    const updated = {
      ...patient,
      childProfile: {
        ...(patient.childProfile || {
          guardianName: '',
          guardianPhone: '',
          guardianRelation: '',
          breastfeedingStatus: 'haihusiki' as const,
        }),
        feedingLogs: updatedLogs,
      },
    };

    onUpdatePatient(updated);
    setFoodItems('');
    setMealNotes('');
    setIsAddingLog(false);
  };

  const challengeDefinitions: Record<string, { title: string; desc: string; advice: string }> = {
    picky_eating: {
      title: 'Kuchagua Sana Vyakula (Picky Eater)',
      desc: 'Hula vyakula vichache tu, anakataa mboga au vyakula vyenye muundo mpya.',
      advice: 'Tengeneza sahani zenye rangi tofauti, usilazimishe kwa hasira, na changanya mboga zilizosagwa kwenye supu au viazi anavyovipenda.',
    },
    poor_appetite: {
      title: 'Kukosa Hamu ya Kula',
      desc: 'Hajisikii njaa au hushiba haraka baada ya vijiko viwili.',
      advice: 'Toa milo midogo midogo mara 5-6 kwa siku badala ya milo mikubwa miwili. Epuka kumpa vitafunwa vya sukari nusu saa kabla ya mlo mkuu.',
    },
    stunting_growth: {
      title: 'Kudumaa na Uzito Duni (Stunting & Underweight)',
      desc: 'Uzito au urefu uko chini ya wastani wa umri kulingana na viwango vya WHO.',
      advice: 'Tumia kanuni ya kuongeza msongamano wa nishati: weka kijiko cha siagi/parachichi au yai lililopigwa kwenye kila bakuli la uji au viazi.',
    },
    type1_diabetes: {
      title: 'Kisukari cha Utotoni (Type 1 Diabetes)',
      desc: 'Hutegemea sindano za insulini na uwiano thabiti wa wanga.',
      advice: 'Zingatia uwiano wa wanga (carbohydrate counting) na muda wa milo kulingana na dozi za insulini ili kuzuia sukari kushuka (hypoglycemia).',
    },
    allergies: {
      title: 'Mizio ya Vyakula (Food Allergies)',
      desc: 'Mizio ya maziwa ya ngombe, karanga, mayai, au ngano.',
      advice: 'Badilisha maziwa ya ngombe na maziwa ya soya yaliyorutubishwa na kalsiamu. Soma lebo zote za vyakula vya madukani kwa umakini.',
    },
    anemia_deficiency: {
      title: 'Upungufu wa Damu & Madini Chuma (Anemia)',
      desc: 'Uchovu, weupe kwenye viganja/macho, kinga dhaifu ya mwili.',
      advice: 'Ongeza dagaa waliosafishwa na kusagwa, maini laini mara 2 kwa wiki, na matunda yenye vitamini C (machungwa, embe) kusaidia unyonyaji wa chuma.',
    },
    chewing_swallowing: {
      title: 'Ugumu wa Kutafuna / Kumeza',
      desc: 'Kukataa vyakula vigumu au kukohoa wakati wa kula.',
      advice: 'Ponda chakula kiwe laini (smooth puree) lakini si maji maji kupita kiasi. Tumia viazi lishe vilivyochemshwa vizuri.',
    },
    junk_food_dependency: {
      title: 'Kutegemea Pipi & Vitafunwa vya Kiwandani',
      desc: 'Kulia na kutaka soda, biskuti na peremende badala ya mlo halisi.',
      advice: 'Ondoa vitafunwa hivyo nyumbani. Weka matunda yaliyokatwa vipande vya kuvutia (mfano: viduara vya ndizi na vipande vya tikiti).',
    },
  };

  const muacVal = childProfile?.muacCm;
  const muacStat = childProfile?.muacStatus || (muacVal ? calculateMuacStatus(muacVal) : null);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shrink-0">
              <Baby className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black tracking-tight">{patient.fullName}</h2>
                <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Umri: {patient.age} miaka {childProfile?.ageMonths ? `(${childProfile.ageMonths} miezi)` : ''}
                </span>
                <span className="bg-white text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Kliniki ya Lishe ya Watoto
                </span>
              </div>
              <p className="text-xs text-amber-100 mt-1">
                Ufuatiliaji wa ukuaji, mzingo wa mkono (MUAC), ulaji wa kila siku na utatuzi wa changamoto za kilishe
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setIsAddingLog(true)}
              className="px-4 py-2.5 bg-white text-amber-900 hover:bg-amber-50 active:scale-95 text-xs font-black rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Rekodi Mlo wa Mtoto</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Anthropometrics & Guardian Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Growth & Weight Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-amber-600" />
              <span>Uzito & Ukuaji</span>
            </span>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
              Lengo: {patient.targetWeightKg} kg
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{patient.currentWeightKg}</span>
            <span className="text-sm font-bold text-slate-500">kg</span>
            <span className="text-xs text-slate-400 ml-auto">Awali: {patient.initialWeightKg} kg</span>
          </div>

          <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex justify-between">
              <span>Urefu wa Mtoto:</span>
              <span className="font-bold text-slate-800">{patient.heightCm} cm</span>
            </div>
            {childProfile?.birthWeightKg && (
              <div className="flex justify-between">
                <span>Uzito Wakati wa Kuzaliwa:</span>
                <span className="font-bold text-slate-800">{childProfile.birthWeightKg} kg</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Hali ya Kunyonyesha:</span>
              <span className="font-bold text-slate-800 capitalize">
                {childProfile?.breastfeedingStatus === 'anaendelea' ? 'Anaendelea Kunyonya' :
                 childProfile?.breastfeedingStatus === 'ameachishwa' ? 'Ameachishwa Kunyonya' : 'Haihusiki'}
              </span>
            </div>
          </div>
        </div>

        {/* MUAC Indicator Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-teal-600" />
              <span>Mzingo wa Mkono (MUAC)</span>
            </span>
            <button
              onClick={() => setIsUpdatingMuac(!isUpdatingMuac)}
              className="text-[11px] font-bold text-teal-700 hover:underline cursor-pointer"
            >
              {isUpdatingMuac ? 'Funga' : 'Badili Kipimo'}
            </button>
          </div>

          {isUpdatingMuac ? (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                step="0.1"
                value={muacInput}
                onChange={e => setMuacInput(e.target.value)}
                placeholder="cm"
                className="w-24 px-2.5 py-1.5 border border-slate-300 rounded-xl text-xs font-bold"
              />
              <button
                onClick={handleSaveMuac}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Hifadhi
              </button>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{muacVal || '--'}</span>
              <span className="text-sm font-bold text-slate-500">cm</span>
              {muacStat && (
                <span className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-full ml-auto ${
                  muacStat === 'nyekundu' ? 'bg-rose-100 text-rose-800' :
                  muacStat === 'njano' ? 'bg-amber-100 text-amber-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {muacStat === 'nyekundu' ? 'Nyekundu (Mkali)' : muacStat === 'njano' ? 'Njano (Wastani)' : 'Kijani (Salama)'}
                </span>
              )}
            </div>
          )}

          {/* MUAC Scale Visual Bar */}
          <div className="space-y-1 pt-1">
            <div className="h-2 w-full rounded-full flex overflow-hidden">
              <div className="w-1/3 bg-rose-500" title="< 11.5cm: Utapiamlo Mkali"></div>
              <div className="w-1/3 bg-amber-400" title="11.5 - 12.5cm: Utapiamlo wa Wastani"></div>
              <div className="w-1/3 bg-emerald-500" title="> 12.5cm: Hali Nzuri"></div>
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 font-bold px-0.5">
              <span>&lt; 11.5cm</span>
              <span>11.5 - 12.5cm</span>
              <span>&gt; 12.5cm</span>
            </div>
          </div>
        </div>

        {/* Guardian & Caregiver Details */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <User className="w-4 h-4 text-blue-600" />
            <span>Taarifa za Mlezi / Mzazi</span>
          </span>

          <div className="space-y-2 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Jina la Mlezi:</span>
              <span className="font-bold text-slate-900 text-sm">
                {childProfile?.guardianName || 'Haijajazwa'}
              </span>
              <span className="text-slate-500 text-[11px] block">
                {childProfile?.guardianRelation || 'Mzazi'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="font-semibold">{childProfile?.guardianPhone || patient.phone || 'Hakuna simu'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Feeding Challenges Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-black text-slate-900">
              Changamoto za Kilishe na Ulaji za Mtoto Huyu
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {childProfile?.feedingChallenges?.length || 0} changamoto zilizobainika
          </span>
        </div>

        {(!childProfile?.feedingChallenges || childProfile.feedingChallenges.length === 0) ? (
          <div className="p-4 bg-emerald-50 text-emerald-900 rounded-2xl border border-emerald-200 text-xs">
            Hakuna changamoto kubwa ya ulaji iliyorekodiwa. Mtoto anakula vizuri bila usumbufu.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {childProfile.feedingChallenges.map(ch => {
              const def = challengeDefinitions[ch] || {
                title: ch,
                desc: 'Changamoto ya lishe ya mtoto',
                advice: 'Wasiliana na mtaalamu wa lishe kwa mwongozo zaidi.',
              };

              return (
                <div
                  key={ch}
                  className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                      {def.title}
                    </h4>
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  </div>
                  <p className="text-xs text-slate-600">{def.desc}</p>
                  <div className="bg-white p-2.5 rounded-xl border border-amber-200 text-xs text-slate-800">
                    <span className="font-bold text-amber-900 block mb-0.5">Ushauri wa Kliniki:</span>
                    <span className="text-slate-700">{def.advice}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Child Feeding Logs & New Entry Modal/Form */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-amber-600" />
              <span>Rekodi ya Ulaji wa Mtoto (Daily Feeding Log)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Kumbukumbu ya kila mlo, kiasi alichokula mtoto, na hisia zake wakati wa kula
            </p>
          </div>
          <button
            onClick={() => setIsAddingLog(!isAddingLog)}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddingLog ? 'Funga Fomu' : 'Rekodi Mlo Mpya'}</span>
          </button>
        </div>

        {/* Add Feeding Log Form */}
        {isAddingLog && (
          <form onSubmit={handleSaveFeedingLog} className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200 space-y-4 animate-in fade-in duration-150">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-950">
              Weka Kumbukumbu ya Mlo wa Leo
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Aina ya Mlo</label>
                <select
                  value={mealType}
                  onChange={e => setMealType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  <option value="kifungua_kinywa">Kifungua Kinywa</option>
                  <option value="mchana">Chakula cha Mchana</option>
                  <option value="usiku">Chakula cha Usiku</option>
                  <option value="vitafunwa">Kitafunwa / Snack</option>
                  <option value="maziwa">Maziwa / Uji</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kiasi Alichokula Mtoto</label>
                <select
                  value={portionConsumed}
                  onChange={e => setPortionConsumed(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  <option value="yote">Alimaliza Sahani Nzima (Yote)</option>
                  <option value="nusu">Alikula Nusu Tu</option>
                  <option value="kidogo">Alikula Kidogo Sana (Vijiko 2-3)</option>
                  <option value="alikataa">Alikataa Kabisa Kula</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Maji / Vinywaji (ml)</label>
                <input
                  type="number"
                  value={waterAndFluidsMl}
                  onChange={e => setWaterAndFluidsMl(Number(e.target.value))}
                  placeholder="150"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Chakula Kilichoandaliwa</label>
              <input
                type="text"
                required
                value={foodItems}
                onChange={e => setFoodItems(e.target.value)}
                placeholder="Mf. Uji wa ulezi uliotiwa yai lililopigwa + parachichi nusu"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hisia za Mtoto Wakati wa Kula</label>
                <select
                  value={moodDuringMeal}
                  onChange={e => setMoodDuringMeal(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  <option value="mchangamfu">Mchangamfu / Alifurahia</option>
                  <option value="taratibu">Taratibu lakini alikula</option>
                  <option value="alilia_au_alilazimishwa">Alilia / Alilazimishwa</option>
                  <option value="alikataa_kabisa">Alikasirika / Alitupa chakula</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Vidokezo vya Ziada</label>
                <input
                  type="text"
                  value={mealNotes}
                  onChange={e => setMealNotes(e.target.value)}
                  placeholder="Mf. Alipenda kikombe chake cha rangi, hakutaka mboga"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingLog(false)}
                className="px-3.5 py-1.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Ghairi
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Hifadhi Mlo
              </button>
            </div>
          </form>
        )}

        {/* Feeding History List */}
        {(!childProfile?.feedingLogs || childProfile.feedingLogs.length === 0) ? (
          <p className="text-xs text-slate-500 italic py-6 text-center">
            Hakuna kumbukumbu ya milo ya mtoto iliyorekodiwa bado. Bonyeza "Rekodi Mlo Mpya" hapo juu.
          </p>
        ) : (
          <div className="space-y-2.5">
            {childProfile.feedingLogs.map(log => (
              <div
                key={log.id}
                className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                      {log.mealType.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400">{log.date}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      log.portionConsumed === 'yote' ? 'bg-emerald-100 text-emerald-800' :
                      log.portionConsumed === 'nusu' ? 'bg-blue-100 text-blue-800' :
                      log.portionConsumed === 'kidogo' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      Kiwango: {log.portionConsumed === 'yote' ? 'Kamilifu' : log.portionConsumed}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-900">{log.foodItems}</p>
                  {log.notes && (
                    <p className="text-[11px] text-slate-500 italic">"{log.notes}"</p>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-600 shrink-0">
                  <span className="flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    <span>{log.waterAndFluidsMl} ml</span>
                  </span>
                  <span className="text-slate-400 capitalize">
                    Hisia: {log.moodDuringMeal.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fortified Local Recipe Guidance for Children */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-3xl border border-amber-200 space-y-3">
        <h3 className="text-sm font-black text-amber-950 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Miongozo ya Vyakula vya Asili vya Watoto (Pediatric Food Fortification)</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-white p-3.5 rounded-2xl border border-amber-200/80 space-y-1">
            <h4 className="font-bold text-amber-900">Uji wa Lishe Ulioboreshwa</h4>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Unga wa ulezi na mtama uliochanganywa na unga wa soya. Piga yai 1 la kienyeji likiwa bichi ukilikoroga kwenye uji ukiwa unachemka. Ongeza kijiko 1 cha parachichi lililopondwa.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-amber-200/80 space-y-1">
            <h4 className="font-bold text-amber-900">Puree ya Viazi Lishe & Samaki</h4>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Viazi vitamu vya njano (orange-fleshed) vilivyochemshwa na kupondwa na mchuzi wa samaki au dagaa waliokaushwa na kusagwa bila chumvi nyingi.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-amber-200/80 space-y-1">
            <h4 className="font-bold text-amber-900">Dawa ya Kuchagua Chakula</h4>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Mpe mtoto nafasi ya kuchagua kati ya vyakula 2 vyenye afya (mfano: "Unataka parachichi au embe?"). Usilazimishe sahani kuwa safi; kula naye pamoja mezani kama mfano.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
