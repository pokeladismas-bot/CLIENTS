import React, { useState } from 'react';
import { 
  Stethoscope, Phone, MessageSquare, MapPin, Star, ShieldCheck, 
  Clock, CheckCircle2, AlertTriangle, Send, PhoneCall, Video, 
  UserCheck, HeartPulse, Search, Sparkles, Filter, X, Info,
  GraduationCap, Briefcase, Building2, ExternalLink, UserPlus
} from 'lucide-react';
import { DoctorConsultationMessage, OnlineDoctor, RegisteredPatient, UserProfile } from '../types';
import { SAMPLE_ONLINE_DOCTORS } from '../data/sampleData';

interface NearbyOnlineDoctorViewProps {
  profile: UserProfile;
  registeredPatients?: RegisteredPatient[];
  doctors?: OnlineDoctor[];
  activePatientCondition?: string;
  onOpenRegisterModal?: () => void;
  onSwitchToPatient?: (patientId: string) => void;
  onOpenAdminModal?: () => void;
  isAdmin?: boolean;
}

export const NearbyOnlineDoctorView: React.FC<NearbyOnlineDoctorViewProps> = ({
  profile,
  registeredPatients = [],
  doctors = SAMPLE_ONLINE_DOCTORS,
  activePatientCondition,
  onOpenRegisterModal,
  onSwitchToPatient,
  onOpenAdminModal,
  isAdmin = false,
}) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [onlyOnline, setOnlyOnline] = useState<boolean>(true);
  const [searchDoctorQuery, setSearchDoctorQuery] = useState<string>('');
  
  // Selected doctor for full contact details modal (Call & WhatsApp)
  const [selectedContactDoctor, setSelectedContactDoctor] = useState<OnlineDoctor | null>(null);

  // Active Consultation Chat Modal State
  const [activeChatDoctor, setActiveChatDoctor] = useState<OnlineDoctor | null>(null);
  const [chatMessages, setChatMessages] = useState<DoctorConsultationMessage[]>([
    {
      id: 'msg-1',
      sender: 'doctor',
      senderName: 'Daktari wa Zamu',
      text: 'Habari yako! Mimi nipo mtandaoni sasa hivi. Je, una tatizo gani kuhusu presha, sukari, au lishe ungependa nisaidie?',
      timestamp: 'Saa 10:15 Jioni',
    },
  ]);
  const [messageInput, setMessageInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Calling modal simulation state
  const [isCallActive, setIsCallActive] = useState<boolean>(false);
  const [callingDoctor, setCallingDoctor] = useState<OnlineDoctor | null>(null);

  // Check registration status: either profile has registeredPatientId or is in registered list
  const isRegistered = Boolean(profile.registeredPatientId || profile.phone);
  const patientLocation = profile.location || 'Dar es Salaam';

  // Format WhatsApp Link
  const getWhatsAppLink = (doctor: OnlineDoctor) => {
    const rawNumber = doctor.whatsappNumber || doctor.phone;
    let cleanNumber = rawNumber.replace(/[^0-9]/g, '');
    if (cleanNumber.startsWith('0')) {
      cleanNumber = '255' + cleanNumber.substring(1);
    } else if (!cleanNumber.startsWith('255') && cleanNumber.length <= 10) {
      cleanNumber = '255' + cleanNumber;
    }
    const conditionText = activePatientCondition 
      ? `(Mgonjwa wa ${activePatientCondition === 'shinikizo_la_damu' ? 'Shinikizo la Damu/Presha' : activePatientCondition === 'kisukari' ? 'Kisukari' : activePatientCondition === 'kupunguza_uzito' ? 'Kupunguza Uzito' : 'Lishe ya Watoto'})` 
      : '';
    const text = encodeURIComponent(
      `Habari ${doctor.name}, naitwa ${profile.name || 'Mgonjwa'} ${conditionText} kutoka jukwaa la AfyaLishe. Nimeona uko hewani/mtandaoni sasa hivi na ningependa kupata ushauri wako wa kidaktari na lishe.`
    );
    return `https://wa.me/${cleanNumber}?text=${text}`;
  };

  // Filter doctors
  const filteredDoctors = doctors.filter((doc) => {
    if (onlyOnline && !doc.isOnline) return false;
    if (selectedSpecialty !== 'all' && doc.specialty !== selectedSpecialty) return false;
    if (searchDoctorQuery.trim() !== '') {
      const q = searchDoctorQuery.toLowerCase();
      const matchName = doc.name.toLowerCase().includes(q);
      const matchFacility = doc.facility.toLowerCase().includes(q);
      const matchLoc = doc.location.toLowerCase().includes(q);
      const matchSpec = doc.specialtyLabelSwahili.toLowerCase().includes(q);
      const matchQual = doc.qualifications ? doc.qualifications.toLowerCase().includes(q) : false;
      if (!matchName && !matchFacility && !matchLoc && !matchSpec && !matchQual) return false;
    }
    return true;
  });

  const handleStartChat = (doctor: OnlineDoctor) => {
    setActiveChatDoctor(doctor);
    setChatMessages([
      {
        id: 'msg-init-' + doctor.id,
        sender: 'doctor',
        senderName: doctor.name,
        text: `Habari ndugu ${profile.name || 'Mteja'}! Mimi ni ${doctor.name} toka ${doctor.facility}. Nipo hewani kwa sasa. Unaweza kunieleza kipimo chako cha mwisho cha presha au sukari na changamoto unayohisi kwa sasa?`,
        timestamp: new Date().toLocaleTimeString('sw-TZ', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChatDoctor) return;

    const userText = messageInput.trim();
    const newMsg: DoctorConsultationMessage = {
      id: 'msg-' + Date.now(),
      sender: 'patient',
      senderName: profile.name || 'Wewe',
      text: userText,
      timestamp: new Date().toLocaleTimeString('sw-TZ', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages(prev => [...prev, newMsg]);
    setMessageInput('');
    setIsTyping(true);

    // Automated smart clinician response in Swahili
    setTimeout(() => {
      let doctorReply = `Nimepokea ujumbe wako. Tafadhali endelea kupima asubuhi na jioni, na ufuatilie mwongozo wa chakula uliopo kwenye dashibodi yako ya AfyaLishe.`;
      
      if (userText.toLowerCase().includes('presha') || userText.toLowerCase().includes('bp')) {
        doctorReply = `Asante kwa taarifa ya presha. Kama presha iko zaidi ya 140/90, meza dawa zako za kila siku kama ulivyoandikiwa na daktari na punguza chumvi. Kama inafika 180/120, piga nambari yangu ya simu mara moja kwa huduma ya haraka.`;
      } else if (userText.toLowerCase().includes('sukari')) {
        doctorReply = `Kuhusu sukari, hakikisha unakula ugali wa dona usiozidi ngumi 1, mboga za majani nusu ya sahani yako, na usinywe soda wala juisi. Je, kipimo chako cha mwisho cha sukari ya asubuhi kilikuwa ngapi?`;
      } else if (userText.toLowerCase().includes('kichwa') || userText.toLowerCase().includes('maumivu')) {
        doctorReply = `Maumivu makali ya kichwa (hasa kisogoni) yanaweza kuwa kiashiria cha shinikizo la damu kupanda. Pima presha sasa hivi na unywe glasi mbili za maji safi. Nipo hapa kuendelea kukupa mwongozo.`;
      }

      setChatMessages(prev => [
        ...prev,
        {
          id: 'doc-reply-' + Date.now(),
          sender: 'doctor',
          senderName: activeChatDoctor.name,
          text: doctorReply,
          timestamp: new Date().toLocaleTimeString('sw-TZ', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 1200);
  };

  const handleStartCall = (doc: OnlineDoctor) => {
    setCallingDoctor(doc);
    setIsCallActive(true);
  };

  return (
    <div className="space-y-6" id="nearby-online-doctor-view">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Madaktari & Wataalamu wa Lishe Walio Hewani Sasa</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
              Wasiliana na Daktari au Mtaalamu wa Lishe Aliye Hewani
            </h1>
            <p className="text-sm text-blue-100/85 leading-relaxed">
              Daktari au mtaalamu akiwa hewani, bonyeza kadi yake kuona namba ya <strong>Kupiga Simu</strong> moja kwa moja au kuanzisha mawasiliano kupitia <strong>WhatsApp</strong> kwa ushauri wa kitaalamu wa haraka.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {isAdmin && onOpenAdminModal && (
              <button
                onClick={onOpenAdminModal}
                className="px-4 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
                id="btn-admin-manage-doctors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Usimamizi wa Madaktari (Admin)</span>
              </button>
            )}
            
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-center">
              <span className="text-xs text-blue-200 block font-medium">Walio Hewani Sasa:</span>
              <span className="text-2xl font-black text-emerald-400">
                {doctors.filter(d => d.isOnline).length}
              </span>
              <span className="text-[11px] text-blue-200 ml-1">wataalamu</span>
            </div>
          </div>
        </div>

        {/* Condition-specific matching notice if patient has a registered condition */}
        {activePatientCondition && (
          <div className="mt-5 pt-4 border-t border-blue-800/60 flex items-center gap-2 text-xs text-blue-200">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span>
              Imerekebishwa kwa ajili yako: Madaktari na wataalamu hawa wana uzoefu maalum wa kutibu na kutoa mwongozo wa <strong>{
                activePatientCondition === 'shinikizo_la_damu' ? 'Shinikizo la Damu (Presha)' :
                activePatientCondition === 'kisukari' ? 'Kisukari' :
                activePatientCondition === 'kupunguza_uzito' ? 'Kupunguza Uzito' : 'Lishe ya Watoto'
              }</strong>.
            </span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchDoctorQuery}
              onChange={(e) => setSearchDoctorQuery(e.target.value)}
              placeholder="Tafuta kwa jina, hospitali, au sifa (mf. JKCI, Muhimbili, MD, Lishe)..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyOnline}
                onChange={(e) => setOnlyOnline(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Onyesha Walio Hewani Tu ({doctors.filter(d => d.isOnline).length})
              </span>
            </label>
          </div>
        </div>

        {/* Specialty Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'Wote' },
            { id: 'shinikizo_la_damu', label: 'Shinikizo la Damu & Moyo' },
            { id: 'kisukari', label: 'Kisukari & Tezi' },
            { id: 'lishe_ya_kliniki', label: 'Lishe ya Kliniki & Uzito' },
            { id: 'watoto', label: 'Watoto' },
            { id: 'afya_ya_jamii', label: 'Mtindo wa Maisha' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedSpecialty(tab.id)}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedSpecialty === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDoctors.length === 0 ? (
          <div className="col-span-2 bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200">
            <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-30 text-blue-600" />
            <p className="text-sm font-semibold">Hakuna daktari au mtaalamu aliyepatikana kwa vigezo hivi.</p>
            <button
              onClick={() => { setOnlyOnline(false); setSelectedSpecialty('all'); setSearchDoctorQuery(''); }}
              className="mt-3 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer"
            >
              Onyesha Wataalamu Wote
            </button>
          </div>
        ) : (
          filteredDoctors.map((doctor) => {
            const waUrl = getWhatsAppLink(doctor);

            return (
              <div
                key={doctor.id}
                className={`bg-white rounded-3xl border transition-all p-5 sm:p-6 space-y-4 flex flex-col justify-between ${
                  doctor.isOnline 
                    ? 'border-emerald-200 shadow-md ring-1 ring-emerald-500/20' 
                    : 'border-slate-200 shadow-xs'
                }`}
              >
                <div className="space-y-3">
                  {/* Doctor Card Top Header */}
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <img
                        src={doctor.avatarUrl}
                        alt={doctor.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-xs"
                      />
                      {doctor.isOnline ? (
                        <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white" />
                        </span>
                      ) : (
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-slate-300 rounded-full border-2 border-white" />
                      )}
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 
                          onClick={() => setSelectedContactDoctor(doctor)}
                          className="font-extrabold text-slate-900 text-base truncate hover:text-blue-600 cursor-pointer"
                          title="Bofya kuona wasifu kamili na mawasiliano"
                        >
                          {doctor.name}
                        </h3>
                        {doctor.isOnline ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 shrink-0 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Hewani Sasa
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 shrink-0">
                            Offline
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-blue-700 font-bold">{doctor.title}</p>
                      <p className="text-[11px] text-slate-500 truncate">{doctor.facility}</p>
                    </div>
                  </div>

                  {/* Qualifications & Experience Badges */}
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-xs space-y-1.5">
                    {doctor.qualifications && (
                      <div className="flex items-start gap-1.5 text-slate-700">
                        <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span className="font-semibold text-[11px] leading-tight text-slate-800">
                          {doctor.qualifications}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span className="flex items-center gap-1 font-bold text-slate-800">
                        <Briefcase className="w-3 h-3 text-teal-600" />
                        <span>Uzoefu: {doctor.experienceYears || 5} miaka</span>
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        <span>{doctor.location}</span>
                      </span>
                    </div>
                  </div>

                  {/* Bio brief */}
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {doctor.bio}
                  </p>

                  {/* Rating & Fee */}
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 pt-1 flex-wrap gap-1">
                    <span className="flex items-center gap-1 text-amber-600 font-black">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {doctor.rating} ({doctor.reviewsCount} maoni)
                    </span>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Ada ya Admin DISMAS POKELA:</span>
                      <span className="text-teal-950 font-black text-xs bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-lg inline-block">
                        Tsh {doctor.consultationFeeTzs?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* PROMINENT DOCTOR CONTACTS (CALL & WHATSAPP) - Core User Requirement */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  {doctor.isOnline && (
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] font-bold flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        Daktari Yuko Hewani Tayari Kupokea Simu & WhatsApp:
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {/* Direct Call Button */}
                    <a
                      href={`tel:${doctor.phone}`}
                      className="py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer text-center"
                      id={`btn-call-direct-${doctor.id}`}
                    >
                      <PhoneCall className="w-4 h-4 text-emerald-100" />
                      <span>Piga Simu</span>
                    </a>

                    {/* WhatsApp Button */}
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer text-center"
                      id={`btn-whatsapp-direct-${doctor.id}`}
                    >
                      <MessageSquare className="w-4 h-4 text-white" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  {/* View Details / Live Chat */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedContactDoctor(doctor)}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5 text-blue-600" />
                      <span>Wasifu & Sifa za Elimu</span>
                    </button>

                    <button
                      onClick={() => handleStartChat(doctor)}
                      className="py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                      <span>Live Chat</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DETAILED DOCTOR CONTACT MODAL (Opens when clicking doctor or 'Wasifu & Sifa') */}
      {selectedContactDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm" id="doctor-contact-sheet-modal">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-blue-900 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={selectedContactDoctor.avatarUrl}
                    alt={selectedContactDoctor.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white/30 shadow-md"
                  />
                  {selectedContactDoctor.isOnline && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-black text-lg text-white leading-tight">
                    {selectedContactDoctor.name}
                  </h3>
                  <p className="text-xs text-blue-200 font-semibold">{selectedContactDoctor.title}</p>
                  {selectedContactDoctor.isOnline ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-400 mt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      🟢 YUKO HEWANI SASA (ONLINE)
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-semibold mt-1">
                      ⚪ Hayupo Mtandaoni kwa Sasa
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedContactDoctor(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 bg-slate-50">
              
              {/* MALIPO YA USHAURI YALIYOPANGWA NA ADMIN DISMAS POKELA */}
              <div className="bg-amber-50/80 border border-amber-300/80 rounded-2xl p-4 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span>Ada ya Ushauri (Iliyopangwa na Admin DISMAS POKELA)</span>
                  </span>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950">
                    Malipo Rasmi
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-xs text-slate-700 font-semibold">Gharama ya Kumwona Daktari:</span>
                  <span className="text-lg font-black text-slate-900">
                    TZS {selectedContactDoctor.consultationFeeTzs?.toLocaleString()}
                  </span>
                </div>

                {selectedContactDoctor.paymentDetails?.lipaNamba && (
                  <div className="p-2.5 rounded-xl bg-white border border-amber-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Lipa Namba ya Mtaalamu:</span>
                      <span className="font-mono font-black text-sm text-teal-900">
                        {selectedContactDoctor.paymentDetails.lipaNamba}
                      </span>
                    </div>
                    {selectedContactDoctor.paymentDetails.merchantName && (
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Jina la Akaunti:</span>
                        <span className="font-bold text-slate-800 text-xs">
                          {selectedContactDoctor.paymentDetails.merchantName}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-[11px] text-amber-900/80 leading-tight">
                  Tafadhali kamilisha malipo kabla au wakati wa kuanza ushauri wa kitaalamu na daktari kwa simu au WhatsApp.
                </p>
              </div>

              {/* PRIMARY CONTACT ACTIONS: PIGA SIMU NA WHATSAPP */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Mawasiliano ya Moja kwa Moja
                </div>

                <div className="space-y-2.5">
                  {/* PIGA SIMU DIRECT LINK */}
                  <a
                    href={`tel:${selectedContactDoctor.phone}`}
                    className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-between shadow-md transition-all cursor-pointer group"
                    id="modal-btn-call-doctor"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                        <PhoneCall className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <span className="block text-xs text-emerald-100 font-bold">Piga Simu ya Sauti:</span>
                        <span className="text-base font-black tracking-wide">{selectedContactDoctor.phone}</span>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-white/20 font-extrabold group-hover:translate-x-0.5 transition-transform">
                      Piga Sasa →
                    </span>
                  </a>

                  {/* WHATSAPP DIRECT LINK */}
                  <a
                    href={getWhatsAppLink(selectedContactDoctor)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-sm flex items-center justify-between shadow-md transition-all cursor-pointer group"
                    id="modal-btn-whatsapp-doctor"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <span className="block text-xs text-green-100 font-bold">Tuma Ujumbe WhatsApp:</span>
                        <span className="text-base font-black tracking-wide">
                          {selectedContactDoctor.whatsappNumber || selectedContactDoctor.phone}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-white/20 font-extrabold group-hover:translate-x-0.5 transition-transform">
                      Fungua WA →
                    </span>
                  </a>
                </div>
              </div>

              {/* SIFA ALIZOSOMEA & TAASISI */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>Sifa Alizosomea & Uzoefu wa Kazi</span>
                </div>

                <div className="space-y-2 text-xs">
                  {selectedContactDoctor.qualifications && (
                    <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                      <span className="block font-black text-slate-900 mb-0.5">Sifa na Vyeti vya Elimu:</span>
                      <span className="text-slate-700 leading-relaxed font-semibold">
                        {selectedContactDoctor.qualifications}
                      </span>
                    </div>
                  )}

                  {selectedContactDoctor.educationInstitution && (
                    <div className="flex items-center gap-2 text-slate-700">
                      <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                      <span><strong>Chuo Kikuu / Taasisi:</strong> {selectedContactDoctor.educationInstitution}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-slate-700">
                    <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                    <span><strong>Miaka ya Uzoefu wa Kliniki:</strong> {selectedContactDoctor.experienceYears || 5} miaka</span>
                  </div>

                  {selectedContactDoctor.registrationCouncilNo && (
                    <div className="flex items-center gap-2 text-slate-700">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Namba ya Usajili wa Bodi:</strong> {selectedContactDoctor.registrationCouncilNo}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                    <span><strong>Kituo cha Kazi:</strong> {selectedContactDoctor.facility} ({selectedContactDoctor.location})</span>
                  </div>
                </div>
              </div>

              {/* BIO / CLINICAL BACKGROUND */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Kuhusu Daktari & Uzoefu Wake
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedContactDoctor.bio}
                </p>
              </div>

              {/* IN-APP CHAT BUTTON */}
              <button
                onClick={() => {
                  handleStartChat(selectedContactDoctor);
                  setSelectedContactDoctor(null);
                }}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Anzisha Ushauri wa Moja kwa Moja kwenye App (Live Chat)</span>
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Live Consultation Chat Modal Window */}
      {activeChatDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/80 backdrop-blur-sm" id="chat-consultation-modal">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[600px] max-h-[92vh]">
            
            {/* Chat Top Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={activeChatDoctor.avatarUrl}
                    alt={activeChatDoctor.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-xl object-cover border border-white/20"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border border-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">{activeChatDoctor.name}</h3>
                  <p className="text-[11px] text-emerald-300 font-medium">🟢 Mtandaoni Sasa • {activeChatDoctor.facility}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${activeChatDoctor.phone}`}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Piga simu ya kawaida"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <a
                  href={getWhatsAppLink(activeChatDoctor)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                  title="Wasiliana WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setActiveChatDoctor(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Messages Feed */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-slate-50">
              <div className="text-center my-2">
                <span className="text-[10px] uppercase font-bold bg-slate-200 text-slate-600 px-3 py-1 rounded-full">
                  Mawasiliano ya Kidaktari Yaliyolindwa na Faragha
                </span>
              </div>

              {chatMessages.map((msg) => {
                const isUser = msg.sender === 'patient';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-blue-600 text-white rounded-tr-xs'
                          : 'bg-white text-slate-900 border border-slate-200 rounded-tl-xs shadow-xs'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span
                        className={`block text-[10px] mt-1.5 font-medium ${
                          isUser ? 'text-blue-100 text-right' : 'text-slate-400'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 italic p-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-150" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-300" />
                  <span className="ml-1">{activeChatDoctor.name} anaandika...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Andika swali lako la presha, sukari, au lishe hapa..."
                className="flex-1 p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition-colors cursor-pointer"
                id="btn-send-doctor-msg"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Voice Call Teleconsultation Simulation Modal */}
      {isCallActive && callingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md" id="voice-call-modal">
          <div className="bg-slate-900 rounded-3xl p-8 max-w-sm w-full text-center text-white border border-slate-800 shadow-2xl space-y-6">
            <div className="relative mx-auto w-24 h-24">
              <img
                src={callingDoctor.avatarUrl}
                alt={callingDoctor.name}
                referrerPolicy="no-referrer"
                className="w-full h-full rounded-full object-cover border-4 border-emerald-500"
              />
              <span className="animate-ping absolute inset-0 rounded-full border-2 border-emerald-400 opacity-60" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">{callingDoctor.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{callingDoctor.facility}</p>
              <p className="text-xs text-emerald-400 font-bold mt-2">Inaita kwa njia ya mtandao...</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300">
              Pia unaweza kumpigia simu ya moja kwa moja kupitia laini yako ya simu:
              <a
                href={`tel:${callingDoctor.phone}`}
                className="block mt-2 font-black text-sm text-emerald-300 underline"
              >
                {callingDoctor.phone}
              </a>
            </div>

            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={() => setIsCallActive(false)}
                className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition-colors cursor-pointer"
              >
                Kata Simu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
