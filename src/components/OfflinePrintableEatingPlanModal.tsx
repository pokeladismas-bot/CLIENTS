import React, { useState, useRef } from 'react';
import { 
  X, Printer, Download, Calendar, User, Phone, CheckSquare, 
  Droplets, AlertTriangle, ShieldCheck, HeartPulse, Apple, Stethoscope,
  Clock, MapPin, Sparkles, FileText
} from 'lucide-react';
import { ClientCategory, RegisteredPatient, UserProfile } from '../types';

interface OfflinePrintableEatingPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile?: UserProfile;
  registeredPatients?: RegisteredPatient[];
}

type PlanDuration = '7_days' | '14_days' | '30_days';

export const OfflinePrintableEatingPlanModal: React.FC<OfflinePrintableEatingPlanModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  registeredPatients = [],
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    currentProfile?.registeredPatientId || (registeredPatients[0]?.id || 'custom')
  );
  const [customName, setCustomName] = useState<string>(currentProfile?.name || 'Mgonjwa wa AfyaLishe');
  const [customAge, setCustomAge] = useState<string>(currentProfile?.age?.toString() || '45');
  const [customPhone, setCustomPhone] = useState<string>(currentProfile?.phone || '+255 700 000 000');
  const [customLocation, setCustomLocation] = useState<string>(currentProfile?.location || 'Dar es Salaam');
  const [planDuration, setPlanDuration] = useState<PlanDuration>('7_days');
  const [planCategory, setPlanCategory] = useState<ClientCategory>(
    currentProfile?.category || 'shinikizo_la_damu'
  );

  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Selected patient data if any
  const matchedPatient = registeredPatients.find(p => p.id === selectedPatientId);
  const patientDisplayName = matchedPatient ? matchedPatient.fullName : customName;
  const patientAge = matchedPatient ? matchedPatient.age : customAge;
  const patientPhone = matchedPatient ? matchedPatient.phone : customPhone;
  const patientLocation = matchedPatient ? matchedPatient.location : customLocation;

  // Plan dates
  const today = new Date();
  const startDateStr = today.toLocaleDateString('sw-TZ', { day: 'numeric', month: 'long', year: 'numeric' });
  const endDate = new Date(today.getTime() + (planDuration === '7_days' ? 7 : planDuration === '14_days' ? 14 : 30) * 24 * 3600 * 1000);
  const endDateStr = endDate.toLocaleDateString('sw-TZ', { day: 'numeric', month: 'long', year: 'numeric' });

  // Customized meals according to condition
  const getWeeklySchedule = (category: ClientCategory) => {
    switch (category) {
      case 'shinikizo_la_damu':
        return [
          {
            day: 'Jumatatu (Siku ya 1)',
            breakfast: 'Uji wa mtama au ulezi bila sukari + Ndizi mbivu 1 (potasiamu) + Yai 1 la kuchemsha bila chumvi',
            snack1: 'Kipande cha papai au tango lililokatwa na ndimu kidogo',
            lunch: 'Ugali wa dona (ngumi 1) + Mchicha mwingi wa kienyeji uliopikwa na nyanya/kitunguu saumu + Samaki sato wa mvuke/kuchemsha',
            snack2: 'Karanga mbichi kiganja kidogo (bila kukaangwa na chumvi) au mbegu za maboga',
            dinner: 'Supu safi ya mboga za asili (bila mafuta yaliyoganda) + Ndizi 2 za Bukoba za kuchemsha + Maharage ya njano kikombe 1',
            bedtime: 'Glasi 1 ya maji safi ya uvuguvugu',
          },
          {
            day: 'Jumanne (Siku ya 2)',
            breakfast: 'Chai ya mchaichai au tangawizi bila sukari + Viazi lishe vya njano vipande 2 + Parachichi 1/3',
            snack1: 'Tofaa (apple) au tunda la pera bichi',
            lunch: 'Wali wa brown au wali mweupe vijiko 5 + Maharage ya soya/kunde + Tembele lililopikwa kwa mafuta kidogo ya alizeti',
            snack2: 'Juisi asilia ya tikiti maji bila sukari ya ziada',
            dinner: 'Kuku wa kienyeji aliyepikwa kwa supu bila ngozi + Kisamvu kiasi + Kipande cha muhogo wa kuchemsha',
            bedtime: 'Glasi ya maji safi na salama',
          },
          {
            day: 'Jumatano (Siku ya 3)',
            breakfast: 'Uji wa dona uliochanganywa na unga wa soya + Yai la kienyeji la kuchemsha + Chungwa 1',
            snack1: 'Matango vipande na karoti mbichi zilizosafishwa',
            lunch: 'Dagaa wa kukausha/kuchemsha wenye nyanya na kitunguu + Ugali wa mtama + Mchicha mwingi',
            snack2: 'Mbegu za maboga (punje 20 zilizokaushwa)',
            dinner: 'Supu ya samaki sangara na mboga za majani + Ndizi mbichi 1 ya kuchemsha',
            bedtime: 'Maji ya uvuguvugu glasi 1',
          },
          {
            day: 'Alhamisi (Siku ya 4)',
            breakfast: 'Kikombe 1 cha maziwa fresh yasiyo na mafuta mengi + Viazi vitamu vya kuchemsha + Parachichi robo',
            snack1: 'Ndizi mbivu 1 ya wastani',
            lunch: 'Kunde au dengu zilizopikwa kwa kitunguu saumu + Ugali wa dona + Majani ya maboga',
            snack2: 'Glasi ya maji safi na limao',
            dinner: 'Kipande cha nyama nyeupe ya kuku au samaki + Saladi ya tango, nyanya na parachichi bila mayonnaise',
            bedtime: 'Glasi ya maji salama',
          },
          {
            day: 'Ijumaa (Siku ya 5)',
            breakfast: 'Chai ya mdalasini na mchaichai + Yai 1 la kuchemsha + Kipande cha mkate wa brown/ngano safi',
            snack1: 'Pera bichi 1 lenye nyuzinyuzi nyingi',
            lunch: 'Ugali wa ulezi + Samaki perege wa kuoka na limao + Mchicha na biringanya zilizochemshwa',
            snack2: 'Kiganja kidogo cha korosho zisizo na chumvi',
            dinner: 'Maharage ya njano + Mbogamboga nusu sahani + Kipande kidogo cha viazi lishe',
            bedtime: 'Maji ya uvuguvugu',
          },
          {
            day: 'Jumamosi (Siku ya 6)',
            breakfast: 'Uji wa dona usio na sukari + Ndizi mbivu 1 + Parachichi kipande kidogo',
            snack1: 'Tikiti maji kipande cha pembetatu',
            lunch: 'Ndizi za kupika na nyama ya kuku bila ngozi na karoti/hoho nyingi + Kisamvu pembeni',
            snack2: 'Tango safi lililokatwa vipande',
            dinner: 'Supu ya dengu na mboga za asili + Donge dogo la ugali wa mtama',
            bedtime: 'Glasi 1 ya maji safi',
          },
          {
            day: 'Jumapili (Siku ya 7)',
            breakfast: 'Viazi vitamu vya kuchemsha + Yai 1 la kuchemsha + Chai ya rangi na tangawizi',
            snack1: 'Chungwa 1 lililomenywa',
            lunch: 'Samaki sato wa mchuzi mwepesi + Ugali wa dona (ngumi 1) + Mchicha na sukuma wiki nusu sahani',
            snack2: 'Mbegu za alizeti au maboga',
            dinner: 'Supu safi ya mboga na kuku wa kienyeji + Saladi mbichi ya mboga na ndimu',
            bedtime: 'Maji safi ya kunywa',
          },
        ];

      case 'kisukari':
        return [
          {
            day: 'Jumatatu (Siku ya 1)',
            breakfast: 'Uji wa ulezi/dona bila sukari + Yai 1 la kuchemsha + Parachichi 1/4',
            snack1: 'Tango lililokatwa na ndimu au pera 1',
            lunch: 'Ugali wa dona (kipande cha ngumi 1 tu) + Mchicha mwingi + Samaki sato wa mvuke',
            snack2: 'Mbegu za maboga punje 20 au karanga mbichi chache',
            dinner: 'Dengu kikombe 1 + Mboga za majani nusu sahani + Kipande kidogo cha viazi lishe',
            bedtime: 'Glasi ya maji safi',
          },
          {
            day: 'Jumanne (Siku ya 2)',
            breakfast: 'Chai ya mchaichai bila sukari + Viazi vitamu vya kuchemsha kipande 1 + Yai la kuchemsha',
            snack1: 'Chungwa 1 la kienyeji (usichuje juisi, kula na nyuzi zake)',
            lunch: 'Wali wa brown vijiko 4 + Maharage ya njano + Tembele mwingi',
            snack2: 'Vipande vya karoti mbichi na tango',
            dinner: 'Kuku wa kienyeji wa supu bila mafuta + Kisamvu na mboga mseto',
            bedtime: 'Maji ya uvuguvugu',
          },
          {
            day: 'Jumatano (Siku ya 3)',
            breakfast: 'Omelette ya yai 1 yenye nyanya na kitunguu maji + Kipande cha mkate wa brown + Chai ya tangawizi',
            snack1: 'Papai kipande kidogo',
            lunch: 'Dagaa wa maji baridi + Ugali wa mtama ngumi 1 + Majani ya maboga nusu sahani',
            snack2: 'Kiganja cha korosho zisizo na sukari/chumvi',
            dinner: 'Supu ya samaki na mboga za asili bila viazi vingi',
            bedtime: 'Glasi ya maji safi',
          },
          {
            day: 'Alhamisi (Siku ya 4)',
            breakfast: 'Uji wa mtama na soya bila sukari + Ndizi mbivu 1 ndogo + Parachichi 1/4',
            snack1: 'Tofaa la kijani au pera',
            lunch: 'Kunde zilizopikwa kwa kitunguu saumu + Ugali wa dona + Mchicha',
            snack2: 'Juisi ya tango na ndimu bila sukari',
            dinner: 'Samaki wa kuoka + Saladi kubwa ya mboga za kienyeji',
            bedtime: 'Maji ya uvuguvugu',
          },
          {
            day: 'Ijumaa (Siku ya 5)',
            breakfast: 'Viazi lishe kipande 1 + Yai la kuchemsha + Chai ya mdalasini',
            snack1: 'Matango vipande na maji',
            lunch: 'Ugali wa ulezi + Samaki perege + Kisamvu kilichopikwa kwa nazi kidogo sana',
            snack2: 'Mbegu za maboga',
            dinner: 'Maharage ya soya + Supu ya mboga na parachichi',
            bedtime: 'Glasi ya maji safi',
          },
          {
            day: 'Jumamosi (Siku ya 6)',
            breakfast: 'Uji wa dona + Yai la kienyeji + Parachichi kipande',
            snack1: 'Tikiti maji kipande 1 kidogo',
            lunch: 'Ndizi 2 za kupika na supu ya kuku + Mchicha mwingi',
            snack2: 'Karanga mbichi kiganja kidogo',
            dinner: 'Dengu na mboga mseto za kienyeji',
            bedtime: 'Maji safi',
          },
          {
            day: 'Jumapili (Siku ya 7)',
            breakfast: 'Yai 1 la kuchemsha + Viazi vitamu + Chai ya rangi',
            snack1: 'Pera 1 bichi',
            lunch: 'Samaki sato + Ugali wa dona (ngumi 1) + Sukuma wiki na mchicha',
            snack2: 'Tango lililokatwa vipande',
            dinner: 'Supu ya kuku wa kienyeji na mboga nyingi za majani',
            bedtime: 'Glasi ya maji salama',
          },
        ];

      default: // kupunguza_uzito au watoto au lishe jumla
        return [
          {
            day: 'Jumatatu (Siku ya 1)',
            breakfast: 'Uji wa dona/ulezi + Yai 1 la kuchemsha + Parachichi kipande',
            snack1: 'Tunda la msimu (papai au chungwa)',
            lunch: 'Ugali wa dona (ngumi 1) + Samaki au kunde + Mboga za majani nusu sahani',
            snack2: 'Mbegu za maboga au karanga chache',
            dinner: 'Supu ya mboga za asili + Kuku wa kienyeji au maharage',
            bedtime: 'Glasi 1 ya maji safi',
          },
          {
            day: 'Jumanne (Siku ya 2)',
            breakfast: 'Viazi lishe vya njano + Yai la kuchemsha + Chai ya mchaichai',
            snack1: 'Pera au tango lililokatwa na limao',
            lunch: 'Wali wa brown vijiko 5 + Maharage ya njano + Tembele mwingi',
            snack2: 'Kiganja cha kokwa mbichi',
            dinner: 'Samaki wa mvuke na mchuzi wa mboga nyingi',
            bedtime: 'Maji ya uvuguvugu',
          },
          {
            day: 'Jumatano (Siku ya 3)',
            breakfast: 'Uji wa mtama na soya + Ndizi mbivu 1 + Yai 1',
            snack1: 'Karoti mbichi na tango',
            lunch: 'Dagaa wa kukausha + Ugali wa dona + Mchicha',
            snack2: 'Mbegu za maboga',
            dinner: 'Supu ya mboga na ndizi 1 ya kuchemsha',
            bedtime: 'Maji safi',
          },
          {
            day: 'Alhamisi (Siku ya 4)',
            breakfast: 'Mkate wa brown + Parachichi + Yai la kuchemsha',
            snack1: 'Chungwa 1 la kienyeji',
            lunch: 'Kunde au dengu + Ugali wa mtama + Majani ya maboga',
            snack2: 'Maji ya dafu au maji safi',
            dinner: 'Kuku wa kienyeji wa kuchemsha na saladi kubwa ya mboga',
            bedtime: 'Glasi ya maji',
          },
          {
            day: 'Ijumaa (Siku ya 5)',
            breakfast: 'Viazi vitamu + Yai la kuchemsha + Chai ya tangawizi',
            snack1: 'Papai kipande cha wastani',
            lunch: 'Samaki sato wa kuoka + Ugali wa dona + Kisamvu',
            snack2: 'Kokwa zisizo na chumvi',
            dinner: 'Maharage ya soya na supu ya mboga',
            bedtime: 'Maji safi',
          },
          {
            day: 'Jumamosi (Siku ya 6)',
            breakfast: 'Uji wa dona + Yai la kuchemsha + Chungwa',
            snack1: 'Tikiti maji kipande kidogo',
            lunch: 'Ndizi za kupika na kuku wa kienyeji + Mchicha nusu sahani',
            snack2: 'Tango safi lililokatwa',
            dinner: 'Dengu na mboga za asili',
            bedtime: 'Glasi ya maji',
          },
          {
            day: 'Jumapili (Siku ya 7)',
            breakfast: 'Viazi vitamu + Yai + Chai ya rangi bila sukari',
            snack1: 'Pera 1 bichi',
            lunch: 'Samaki perege + Ugali wa dona + Mboga za majani nyingi',
            snack2: 'Mbegu za alizeti au maboga',
            dinner: 'Supu ya kuku wa kienyeji na mboga mseto',
            bedtime: 'Glasi ya maji safi',
          },
        ];
    }
  };

  const schedule = getWeeklySchedule(planCategory);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadText = () => {
    let content = `=======================================================\n`;
    content += `KLINIKI YA AFYALISHE TANZANIA - MPANGO WA MLO KWA MGONJWA\n`;
    content += `(Mpango Maalum kwa Ajili ya Mgonjwa Asiye na Simu)\n`;
    content += `=======================================================\n\n`;
    content += `Jina la Mgonjwa: ${patientDisplayName}\n`;
    content += `Umri: ${patientAge} miaka | Simu/Mlezi: ${patientPhone}\n`;
    content += `Makazi: ${patientLocation}\n`;
    content += `Lengo la Kilishe: ${planCategory.toUpperCase().replace('_', ' ')}\n`;
    content += `Muda wa Mpango: ${planDuration === '7_days' ? 'Siku 7 (Wiki 1)' : planDuration === '14_days' ? 'Siku 14 (Wiki 2)' : 'Siku 30 (Mwezi 1)'}\n`;
    content += `Tarehe: Kuanzia ${startDateStr} hadi ${endDateStr}\n\n`;
    content += `MAAGIZO YA CHUMVI NA MAJI:\n`;
    content += `- Kunywa glasi 8 hadi 10 za maji safi kila siku (weka alama ya tiki kwenye karatasi ukutani).\n`;
    content += `- Punguza chumvi: Usizidishe nusu kijiko cha chai cha chumvi kwa siku nzima. Ondoa chumvi mezani.\n\n`;
    content += `RATIBA YA WIKI YA CHAKULA:\n`;
    content += `-------------------------------------------------------\n`;

    schedule.forEach((item) => {
      content += `\n[ ${item.day} ]\n`;
      content += `  - Asubuhi (Kifungua Kinywa): ${item.breakfast}\n`;
      content += `  - Saa 4:00 (Snack): ${item.snack1}\n`;
      content += `  - Mchana: ${item.lunch}\n`;
      content += `  - Saa 10:00 (Snack): ${item.snack2}\n`;
      content += `  - Usiku: ${item.dinner}\n`;
      content += `  - Saa za Kulala: ${item.bedtime}\n`;
    });

    content += `\n=======================================================\n`;
    content += `Simu ya Dharura ya Kliniki: +255 715 334 455\n`;
    content += `Mtaalam wa Lishe: Dkt. Grace Kimaro (Chief Clinical Dietitian)\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mpango_wa_Chakula_${patientDisplayName.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/80 backdrop-blur-sm overflow-y-auto" id="offline-print-modal">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Top Control Bar (Hidden during print) */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base">Mpango wa Chakula wa Kuchapisha (Kwa Wasio na Simu)</h2>
              <p className="text-xs text-slate-400">Chapisha karatasi ya A4 au pakua faili la mgonjwa kufuata akiwa nyumbani.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadText}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              id="btn-download-plan-txt"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pakua Faili</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
              id="btn-print-action"
            >
              <Printer className="w-4 h-4" />
              <span>Chapisha (Print A4)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Funga"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Configuration Bar (Hidden during print) */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs shrink-0 print:hidden">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Mgonjwa Aliyechaguliwa:</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-900"
            >
              <option value="custom">Mgonjwa Mpya / Andika Jina</option>
              {registeredPatients.map(p => (
                <option key={p.id} value={p.id}>{p.fullName} ({p.category})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Aina ya Mpango wa Afya:</label>
            <select
              value={planCategory}
              onChange={(e) => setPlanCategory(e.target.value as ClientCategory)}
              className="w-full p-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-900"
            >
              <option value="shinikizo_la_damu">Shinikizo la Damu (DASH / Chumvi Chini)</option>
              <option value="kisukari">Udhibiti wa Sukari (Kisukari)</option>
              <option value="kupunguza_uzito">Kupunguza Uzito & Kitambi</option>
              <option value="watoto_lishe">Lishe ya Watoto (Makuzi Bora)</option>
              <option value="lishe_jumla">Lishe Bora ya Familia</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Kipindi cha Mpango:</label>
            <select
              value={planDuration}
              onChange={(e) => setPlanDuration(e.target.value as PlanDuration)}
              className="w-full p-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-900"
            >
              <option value="7_days">Wiki 1 (Siku 7)</option>
              <option value="14_days">Wiki 2 (Siku 14)</option>
              <option value="30_days">Mwezi 1 (Siku 30)</option>
            </select>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 print:p-0 print:overflow-visible print:m-0" ref={printAreaRef}>
          
          {/* Clinic Official Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-lg">
                  A
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-slate-950 uppercase">Kliniki ya AfyaLishe Tanzania</h1>
                  <p className="text-[11px] text-slate-600 font-semibold">Idara ya Tiba Lishe, Kisukari & Shinikizo la Damu</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Simu: +255 715 334 455 | Barua Pepe: kliniki@afyalishe.co.tz | Kinondoni / Upanga, Dar es Salaam</p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full bg-slate-950 text-white text-[10px] font-extrabold uppercase tracking-wider">
                Hati Rasmi ya Mlo
              </span>
              <p className="text-[11px] font-bold text-slate-800 mt-1">Kipindi: {planDuration === '7_days' ? 'Wiki 1 (Siku 7)' : planDuration === '14_days' ? 'Wiki 2 (Siku 14)' : 'Mwezi 1 (Siku 30)'}</p>
              <p className="text-[10px] text-slate-500">{startDateStr} - {endDateStr}</p>
            </div>
          </div>

          {/* Patient Details Header Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-300 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Jina la Mgonjwa:</span>
              <strong className="text-slate-950 text-sm block">{patientDisplayName}</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Umri & Jinsia:</span>
              <span className="font-semibold text-slate-900">{patientAge} Miaka</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Simu / Ndugu:</span>
              <span className="font-semibold text-slate-900">{patientPhone}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Makazi:</span>
              <span className="font-semibold text-slate-900">{patientLocation}</span>
            </div>
          </div>

          {/* Key Clinical & Dietary Instructions */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 text-amber-950 space-y-2 text-xs">
            <h4 className="font-black text-sm uppercase tracking-wide flex items-center gap-1.5 text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Maagizo Muhimu ya Kuzingatia Nyumbani (Mwongozo wa Mtaalam wa Lishe)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <strong className="block text-slate-900 font-bold mb-0.5">1. Udhibiti wa Chumvi & Viungo:</strong>
                <p className="text-slate-700">Usizidishe nusu kijiko cha chai cha chumvi kwa siku nzima. Ondoa kabisa chumvi ya mezani. Tumia kitunguu saumu na ndimu.</p>
              </div>
              <div>
                <strong className="block text-slate-900 font-bold mb-0.5">2. Unywaji wa Maji Safi (Glasi 8-10):</strong>
                <p className="text-slate-700">Weka alama ya tiki [✓] kwenye kisanduku cha kila glasi unayokunywa siku hiyo (tazama jedwali la chini).</p>
              </div>
              <div>
                <strong className="block text-slate-900 font-bold mb-0.5">3. Vyakula vya Kuepuka:</strong>
                <p className="text-slate-700">Vyakula vya kukaangwa kwa mafuta mengi, soseji na nyama za makopo, vyakula vyenye sukari ya ziada, na soda.</p>
              </div>
              <div>
                <strong className="block text-slate-900 font-bold mb-0.5">4. Vyakula vya Kutilia Mkazo:</strong>
                <p className="text-slate-700">Ugali wa dona/mtama ngumi 1, mchicha/tembele nusu sahani, parachichi 1/3, samaki wa kuchemsha/mvuke na dagaa.</p>
              </div>
            </div>
          </div>

          {/* Detailed Timetable Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-950 uppercase tracking-wide flex items-center justify-between">
              <span>Ratiba ya Kila Siku (Kifungua Kinywa, Mchana na Usiku)</span>
              <span className="text-[11px] font-semibold text-slate-500 lowercase">bana karatasi hii ukutani nyumbani</span>
            </h3>

            <div className="border border-slate-300 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-extrabold divide-x divide-slate-800">
                    <th className="p-2.5 w-28">Siku</th>
                    <th className="p-2.5">Kifungua Kinywa & Saa 4</th>
                    <th className="p-2.5">Chakula cha Mchana & Saa 10</th>
                    <th className="p-2.5">Chakula cha Usiku & Kulala</th>
                    <th className="p-2.5 w-32 text-center">Tiki ya Maji (Glasi 8)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {schedule.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="p-2.5 font-black text-slate-900 align-top border-r border-slate-200">
                        {row.day.split('(')[0]}
                        <span className="block text-[10px] text-slate-500 font-normal">Siku ya {idx + 1}</span>
                      </td>
                      
                      <td className="p-2.5 align-top border-r border-slate-200 space-y-1">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 block uppercase">Asubuhi (07:00):</span>
                          <span className="text-slate-900 font-medium">{row.breakfast}</span>
                        </div>
                        <div className="pt-1 border-t border-slate-100 text-[11px] text-slate-600">
                          <strong>Saa 4:</strong> {row.snack1}
                        </div>
                      </td>

                      <td className="p-2.5 align-top border-r border-slate-200 space-y-1">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 block uppercase">Mchana (13:00):</span>
                          <span className="text-slate-900 font-medium">{row.lunch}</span>
                        </div>
                        <div className="pt-1 border-t border-slate-100 text-[11px] text-slate-600">
                          <strong>Saa 10:</strong> {row.snack2}
                        </div>
                      </td>

                      <td className="p-2.5 align-top border-r border-slate-200 space-y-1">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 block uppercase">Usiku (19:30):</span>
                          <span className="text-slate-900 font-medium">{row.dinner}</span>
                        </div>
                        <div className="pt-1 border-t border-slate-100 text-[11px] text-slate-600">
                          <strong>Kulala:</strong> {row.bedtime}
                        </div>
                      </td>

                      <td className="p-2.5 align-top text-center">
                        <div className="grid grid-cols-4 gap-1 max-w-[100px] mx-auto">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                            <div key={g} className="w-5 h-5 border border-slate-400 rounded flex items-center justify-center text-[9px] text-slate-400 font-bold">
                              {g}
                            </div>
                          ))}
                        </div>
                        <span className="text-[9px] text-slate-400 block mt-1">weka tiki kila glasi</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Clinician Signature & Stamp Box */}
          <div className="pt-4 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Mtaalam wa Lishe Aliyetayarisha:</p>
              <p className="font-extrabold text-slate-950 text-sm">Dkt. Grace Kimaro, MSc, RD</p>
              <p className="text-[11px] text-slate-600">Mtaalam Mkuu wa Lishe ya Kliniki (Tanzania)</p>
              <div className="mt-4 border-b border-dashed border-slate-400 w-48" />
              <span className="text-[10px] text-slate-400">Sahihi ya Mtaalam</span>
            </div>

            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Muhuri Rasmi wa Kliniki:</p>
              <div className="w-32 h-16 border-2 border-dashed border-slate-300 rounded-xl ml-auto flex items-center justify-center text-slate-400 text-[11px] font-bold">
                [ Muhuri wa Kliniki ]
              </div>
              <p className="text-[10px] text-slate-500 mt-2">Tarehe ya Kurejea Kliniki: Wiki 2 toka leo</p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer (Hidden during print) */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0 print:hidden text-xs">
          <span className="text-slate-500">
            Karatasi hii inafaa kuchapishwa kwenye karatasi ya A4 na kubandikwa ukutani jikoni au chumbani.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
            >
              Funga
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Chapisha Sasa (Print)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
