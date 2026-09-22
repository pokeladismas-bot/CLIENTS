import React, { useState } from 'react';
import { 
  X, UserPlus, Stethoscope, Award, GraduationCap, Briefcase, 
  Phone, MessageSquare, MapPin, Trash2, Edit3, CheckCircle2, 
  AlertCircle, ShieldCheck, ToggleLeft, ToggleRight, Search, Plus, Sparkles, Building2,
  Mail, KeyRound, Eye, EyeOff, Send, Copy, CreditCard, RefreshCw, Lock, Download
} from 'lucide-react';
import { OnlineDoctor } from '../types';

interface AdminPractitionersModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctors: OnlineDoctor[];
  onSaveDoctor: (doctor: OnlineDoctor) => void;
  onDeleteDoctor: (doctorId: string) => void;
  onToggleOnlineStatus: (doctorId: string) => void;
  onOpenInstallerModal?: () => void;
}

export const AdminPractitionersModal: React.FC<AdminPractitionersModalProps> = ({
  isOpen,
  onClose,
  doctors,
  onSaveDoctor,
  onDeleteDoctor,
  onToggleOnlineStatus,
  onOpenInstallerModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'add_edit'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'doctor' | 'nutritionist'>('all');
  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null);

  // Visibility toggle for practitioner passwords (admin can see passwords)
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Email Dispatch Modal state
  const [selectedDoctorForEmail, setSelectedDoctorForEmail] = useState<OnlineDoctor | null>(null);
  const [isEmailSentSuccess, setIsEmailSentSuccess] = useState(false);
  const [isCopiedEmail, setIsCopiedEmail] = useState(false);

  // Quick reset password modal
  const [resetDoctorModal, setResetDoctorModal] = useState<OnlineDoctor | null>(null);
  const [newResetPassword, setNewResetPassword] = useState('');

  // Form states
  const [formName, setFormName] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formRoleType, setFormRoleType] = useState<'doctor' | 'nutritionist'>('doctor');
  const [formQualifications, setFormQualifications] = useState('');
  const [formInstitution, setFormInstitution] = useState('');
  const [formExperienceYears, setFormExperienceYears] = useState<number>(5);
  const [formSpecialty, setFormSpecialty] = useState<'shinikizo_la_damu' | 'kisukari' | 'lishe_ya_kliniki' | 'watoto' | 'afya_ya_jamii'>('shinikizo_la_damu');
  const [formFacility, setFormFacility] = useState('');
  const [formLocation, setFormLocation] = useState('Dar es Salaam');
  const [formCity, setFormCity] = useState('Dar es Salaam');
  const [formPhone, setFormPhone] = useState('+255 ');
  const [formWhatsapp, setFormWhatsapp] = useState('+255 ');
  const [formRegistrationNo, setFormRegistrationNo] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formConsultationFee, setFormConsultationFee] = useState<number>(10000);
  const [formIsOnline, setFormIsOnline] = useState<boolean>(true);
  const [formAvatarUrl, setFormAvatarUrl] = useState('');

  // Credentials & Payments in form
  const [formEmail, setFormEmail] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formLipaNamba, setFormLipaNamba] = useState('');
  const [formMerchantName, setFormMerchantName] = useState('');
  const [formPaymentInstructions, setFormPaymentInstructions] = useState('');

  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const togglePasswordVisibility = (docId: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [docId]: !prev[docId],
    }));
  };

  const handleOpenAdd = () => {
    setEditingDoctorId(null);
    setFormName('');
    setFormTitle('');
    setFormRoleType('doctor');
    setFormQualifications('');
    setFormInstitution('');
    setFormExperienceYears(5);
    setFormSpecialty('shinikizo_la_damu');
    setFormFacility('');
    setFormLocation('Dar es Salaam');
    setFormCity('Dar es Salaam');
    setFormPhone('+255 ');
    setFormWhatsapp('+255 ');
    setFormRegistrationNo('');
    setFormBio('');
    setFormConsultationFee(10000);
    setFormIsOnline(true);
    setFormAvatarUrl('https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80');
    setFormEmail('');
    setFormUsername('');
    setFormPassword('Afya#' + Math.floor(1000 + Math.random() * 9000));
    setFormLipaNamba('');
    setFormMerchantName('');
    setFormPaymentInstructions('Lipa kwa M-Pesa au Tigo Pesa (Lipa Namba)');
    setActiveSubTab('add_edit');
  };

  const handleOpenEdit = (doc: OnlineDoctor) => {
    setEditingDoctorId(doc.id);
    setFormName(doc.name);
    setFormTitle(doc.title);
    setFormRoleType(doc.roleType || 'doctor');
    setFormQualifications(doc.qualifications || '');
    setFormInstitution(doc.educationInstitution || '');
    setFormExperienceYears(doc.experienceYears || 5);
    setFormSpecialty(doc.specialty);
    setFormFacility(doc.facility);
    setFormLocation(doc.location);
    setFormCity(doc.city);
    setFormPhone(doc.phone);
    setFormWhatsapp(doc.whatsappNumber || doc.phone);
    setFormRegistrationNo(doc.registrationCouncilNo || '');
    setFormBio(doc.bio);
    setFormConsultationFee(doc.consultationFeeTzs || 10000);
    setFormIsOnline(doc.isOnline);
    setFormAvatarUrl(doc.avatarUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80');
    setFormEmail(doc.email || '');
    setFormUsername(doc.username || doc.name.toLowerCase().replace(/[^a-z0-9]/g, '.'));
    setFormPassword(doc.password || doc.initialPassword || 'Doc#2026');
    setFormLipaNamba(doc.paymentDetails?.lipaNamba || '');
    setFormMerchantName(doc.paymentDetails?.merchantName || doc.name);
    setFormPaymentInstructions(doc.paymentDetails?.paymentInstructions || 'Lipa kwa Lipa Namba ya mtandao wowote');
    setActiveSubTab('add_edit');
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;

    let specialtyLabel = 'Shinikizo la Damu & Moyo';
    if (formSpecialty === 'kisukari') specialtyLabel = 'Kisukari na Tezi';
    if (formSpecialty === 'lishe_ya_kliniki') specialtyLabel = 'Lishe ya Kliniki & Chakula';
    if (formSpecialty === 'watoto') specialtyLabel = 'Afya & Lishe ya Watoto';
    if (formSpecialty === 'afya_ya_jamii') specialtyLabel = 'Mtindo wa Maisha & Mazoezi';

    const existing = doctors.find((d) => d.id === editingDoctorId);
    const assignedPassword = formPassword.trim() || (existing ? (existing.password || existing.initialPassword) : 'Doc#2026') || 'Doc#2026';

    const savedDoc: OnlineDoctor = {
      id: editingDoctorId || `doc-${Date.now()}`,
      name: formName.trim(),
      title: formTitle.trim() || (formRoleType === 'doctor' ? 'Daktari wa Tiba' : 'Mtaalamu wa Lishe'),
      roleType: formRoleType,
      qualifications: formQualifications.trim(),
      educationInstitution: formInstitution.trim(),
      experienceYears: formExperienceYears,
      registrationCouncilNo: formRegistrationNo.trim(),
      specialty: formSpecialty,
      specialtyLabelSwahili: specialtyLabel,
      facility: formFacility.trim() || 'Kituo cha Afya Tanzania',
      location: formLocation.trim() || 'Dar es Salaam',
      city: formCity.trim() || 'Dar es Salaam',
      isOnline: formIsOnline,
      rating: existing?.rating || 5.0,
      reviewsCount: existing?.reviewsCount || 45,
      phone: formPhone.trim(),
      whatsappNumber: formWhatsapp.trim() || formPhone.trim(),
      avatarUrl: formAvatarUrl.trim() || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      languages: ['Kiswahili', 'English'],
      bio: formBio.trim() || `${formName} ana uzoefu wa miaka ${formExperienceYears} katika kutoa huduma za kitaalamu za afya na lishe.`,
      consultationFeeTzs: formConsultationFee, // Managed strictly by Admin DISMAS POKELA
      freeFollowup: true,
      isAcceptingEmergencies: formSpecialty === 'shinikizo_la_damu' || formSpecialty === 'kisukari',
      email: formEmail.trim() || `${formName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@afyalishe.co.tz`,
      username: formUsername.trim() || formName.toLowerCase().replace(/[^a-z0-9]/g, '.'),
      password: assignedPassword,
      initialPassword: existing?.initialPassword || assignedPassword,
      isPasswordChanged: existing?.isPasswordChanged ?? false,
      paymentDetails: {
        lipaNamba: formLipaNamba.trim() || '554433',
        merchantName: formMerchantName.trim() || formName,
        paymentInstructions: formPaymentInstructions.trim() || 'Lipa kwa simu (M-Pesa, Tigo Pesa, Airtel Money)',
      },
    };

    onSaveDoctor(savedDoc);
    setFormSuccessMessage(`Taarifa na akaunti ya ${savedDoc.name} zimehifadhiwa kikamilifu na Admin DISMAS POKELA!`);
    setTimeout(() => {
      setFormSuccessMessage(null);
      setActiveSubTab('list');
    }, 1500);
  };

  // Direct Email dispatch simulation & mailto trigger
  const handleOpenEmailModal = (doc: OnlineDoctor) => {
    setSelectedDoctorForEmail(doc);
    setIsEmailSentSuccess(false);
    setIsCopiedEmail(false);
  };

  const getEmailContent = (doc: OnlineDoctor) => {
    const adminName = 'DISMAS POKELA';
    const emailTo = doc.email || 'daktari@afyalishe.co.tz';
    const username = doc.username || doc.name.toLowerCase().replace(/[^a-z0-9]/g, '.');
    const pass = doc.password || doc.initialPassword || 'Doc#2026';
    const fee = doc.consultationFeeTzs?.toLocaleString() || '10,000';

    const subject = `Taarifa za Kuingia kwenye Mfumo wa AfyaLishe - Msimamizi ${adminName}`;
    const body = `Habari ${doc.name},

Umesajiliwa rasmi kwenye Mfumo wa AfyaLishe Tanzania na Msimamizi Mkuu ${adminName} kama ${doc.roleType === 'nutritionist' ? 'Mtaalamu wa Lishe' : 'Daktari wa Tiba'}.

TAARIFA ZAKO ZA KUINGIA KWENYE MFUMO:
--------------------------------------------
Kada: ${doc.title}
Barua Pepe: ${emailTo}
Jina la Mtumiaji (Username): ${username}
Nenosiri la Awali (Initial Password): ${pass}
Ada ya Ushauri Iliyopangwa: TZS ${fee}

Haki Zako kwenye Mfumo:
- Unaweza kuingia kwa kuchagua 'Wataalamu wa Lishe & Madaktari' mwanzo wa app.
- Unaweza kubadilisha nenosiri hili wakati wowote baada ya kuingia.
- Unaweza kuwasiliana na wagonjwa wa kliniki na kupokea maombi ya ushauri.

Wasiliana na Admin DISMAS POKELA iwapo unahitaji msaada wowote.
AfyaLishe Tanzania - Huduma Bora ya Lishe na Tiba.`;

    return { subject, body, emailTo };
  };

  const handleSendDirectEmail = () => {
    if (!selectedDoctorForEmail) return;
    const { subject, body, emailTo } = getEmailContent(selectedDoctorForEmail);

    // Update doctor's emailSentAt in app state
    const updated = {
      ...selectedDoctorForEmail,
      emailSentAt: new Date().toISOString(),
    };
    onSaveDoctor(updated);
    setSelectedDoctorForEmail(updated);

    // Open user's default email client as well
    const mailtoUrl = `mailto:${encodeURIComponent(emailTo)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;

    setIsEmailSentSuccess(true);
  };

  const handleCopyEmailText = () => {
    if (!selectedDoctorForEmail) return;
    const { body } = getEmailContent(selectedDoctorForEmail);
    navigator.clipboard.writeText(body);
    setIsCopiedEmail(true);
    setTimeout(() => setIsCopiedEmail(false), 2500);
  };

  // Admin Quick Password Reset
  const handleConfirmResetPassword = () => {
    if (!resetDoctorModal || !newResetPassword.trim()) return;
    const updated: OnlineDoctor = {
      ...resetDoctorModal,
      password: newResetPassword.trim(),
      isPasswordChanged: false,
    };
    onSaveDoctor(updated);
    setResetDoctorModal(null);
    setNewResetPassword('');
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesRole = roleFilter === 'all' || doc.roleType === roleFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      doc.name.toLowerCase().includes(q) ||
      doc.title.toLowerCase().includes(q) ||
      (doc.facility && doc.facility.toLowerCase().includes(q)) ||
      (doc.qualifications && doc.qualifications.toLowerCase().includes(q)) ||
      (doc.email && doc.email.toLowerCase().includes(q));
    return matchesRole && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm" id="admin-practitioners-modal">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-black uppercase tracking-wider mb-0.5">
                👑 Msimamizi Mkuu: DISMAS POKELA
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Usimamizi wa Madaktari, Wataalamu wa Lishe & Ada Zao
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            id="btn-close-admin-practitioners"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switch & Action */}
        <div className="px-6 pt-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveSubTab('list');
                setEditingDoctorId(null);
              }}
              className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'list'
                  ? 'border-teal-600 text-teal-900 bg-white shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Orodha ya Wataalamu ({doctors.length})</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'add_edit' && !editingDoctorId
                  ? 'border-teal-600 text-teal-900 bg-white shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>+ Sajili Mtaalamu Mpya</span>
            </button>
          </div>

          <div className="flex items-center gap-2 py-1">
            {activeSubTab === 'list' && (
              <button
                onClick={handleOpenAdd}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-xs transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Sajili Daktari / Lishe</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          
          {/* TAB 1: LIST VIEW */}
          {activeSubTab === 'list' && (
            <div className="space-y-4">
              
              {/* Filter and Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tafuta kwa jina, barua pepe, chuo, au hospitali..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setRoleFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      roleFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Wote ({doctors.length})
                  </button>
                  <button
                    onClick={() => setRoleFilter('doctor')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      roleFilter === 'doctor' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Madaktari
                  </button>
                  <button
                    onClick={() => setRoleFilter('nutritionist')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      roleFilter === 'nutritionist' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Wataalamu wa Lishe
                  </button>
                </div>
              </div>

              {/* Practitioners Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDoctors.map((doc) => {
                  const isPasswordVisible = !!visiblePasswords[doc.id];
                  const currentPass = doc.password || doc.initialPassword || 'Doc#2026';

                  return (
                    <div 
                      key={doc.id} 
                      className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all space-y-3.5 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {/* Top Bio row */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={doc.avatarUrl}
                              alt={doc.name}
                              referrerPolicy="no-referrer"
                              className="w-13 h-13 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                            />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-black text-slate-900 text-sm">{doc.name}</h3>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                  doc.roleType === 'nutritionist' ? 'bg-teal-100 text-teal-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {doc.roleType === 'nutritionist' ? 'Mtaalamu wa Lishe' : 'Daktari'}
                                </span>
                              </div>
                              <p className="text-xs text-teal-700 font-bold">{doc.title}</p>
                              <p className="text-[11px] text-slate-500">{doc.facility}</p>
                            </div>
                          </div>

                          {/* Online Toggle */}
                          <button
                            onClick={() => onToggleOnlineStatus(doc.id)}
                            className={`p-1.5 px-2.5 rounded-xl border flex items-center gap-1.5 text-[11px] font-black cursor-pointer transition-colors ${
                              doc.isOnline 
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                                : 'bg-slate-100 border-slate-200 text-slate-500'
                            }`}
                            title="Bofya kubadili hadhi ya mtandaoni"
                          >
                            <span className={`w-2 h-2 rounded-full ${doc.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                            <span>{doc.isOnline ? 'Hewani' : 'Offline'}</span>
                          </button>
                        </div>

                        {/* Education & Qualifications */}
                        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 text-xs space-y-1.5">
                          {doc.qualifications && (
                            <div className="flex items-start gap-1.5 text-slate-800">
                              <GraduationCap className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                              <span className="font-semibold leading-tight">
                                <strong className="text-slate-900">Sifa:</strong> {doc.qualifications}
                              </span>
                            </div>
                          )}
                          {doc.educationInstitution && (
                            <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                              <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span><strong>Chuo:</strong> {doc.educationInstitution}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1.5 border-t border-slate-200">
                            <span className="flex items-center gap-1 font-bold text-slate-800">
                              <Briefcase className="w-3.5 h-3.5 text-teal-600" />
                              <span>Uzoefu: {doc.experienceYears || 5} miaka</span>
                            </span>
                            {doc.registrationCouncilNo && (
                              <span className="text-[10px] text-slate-500 font-medium">
                                Usajili Bodi: {doc.registrationCouncilNo}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* USER LOGIN CREDENTIALS & PASSWORD (VISIBLE TO ADMIN DISMAS POKELA) */}
                        <div className="bg-teal-950 text-white rounded-2xl p-3 text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-black text-teal-300">
                              <KeyRound className="w-3.5 h-3.5" />
                              <span>Akaunti ya Kuingia (User Login)</span>
                            </div>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              doc.isPasswordChanged ? 'bg-amber-900 text-amber-200' : 'bg-teal-900 text-teal-200'
                            }`}>
                              {doc.isPasswordChanged ? 'Imebadilishwa na Daktari' : 'Nenosiri la Awali'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <span className="text-teal-400 block text-[10px]">Username:</span>
                              <span className="font-mono font-bold text-white">{doc.username || 'N/A'}</span>
                            </div>
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-teal-400 text-[10px]">Nenosiri:</span>
                                <button
                                  type="button"
                                  onClick={() => togglePasswordVisibility(doc.id)}
                                  className="text-teal-300 hover:text-white p-0.5"
                                  title="Admin: Onyesha/Ficha nenosiri"
                                >
                                  {isPasswordVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                </button>
                              </div>
                              <span className="font-mono font-bold text-amber-300">
                                {isPasswordVisible ? currentPass : '••••••••'}
                              </span>
                            </div>
                          </div>

                          <div className="pt-1 border-t border-teal-800/80 flex items-center justify-between text-[10px]">
                            <span className="text-teal-300 truncate max-w-[170px]" title={doc.email}>
                              Email: {doc.email || 'Haijasajiliwa'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setResetDoctorModal(doc);
                                setNewResetPassword('Pass#' + Math.floor(1000 + Math.random() * 9000));
                              }}
                              className="text-teal-200 hover:text-white underline cursor-pointer font-bold"
                            >
                              Weka Upya Password
                            </button>
                          </div>
                        </div>

                        {/* Consultation Fee & Lipa Namba Set by Admin */}
                        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-2.5 text-xs flex items-center justify-between">
                          <div>
                            <div className="text-[10px] text-amber-800 font-bold">
                              Ada ya Ushauri (Imepangwa na Admin):
                            </div>
                            <div className="font-black text-slate-900 text-sm">
                              TZS {doc.consultationFeeTzs?.toLocaleString()}
                            </div>
                          </div>
                          {doc.paymentDetails?.lipaNamba && (
                            <div className="text-right">
                              <span className="text-[10px] text-slate-500 block">Lipa Namba:</span>
                              <span className="font-mono font-black text-teal-800 bg-white px-2 py-0.5 rounded border border-amber-200 text-xs">
                                {doc.paymentDetails.lipaNamba}
                              </span>
                            </div>
                          )}
                        </div>

                      </div>

                      {/* Action buttons (Email Dispatch, Edit, Delete) */}
                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEmailModal(doc)}
                            className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                            title="Tuma username na password direct kwenye email ya daktari"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Tuma Email ya Kuingia</span>
                          </button>

                          <button
                            onClick={() => handleOpenEdit(doc)}
                            className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                            title="Hariri taarifa zake"
                          >
                            <Edit3 className="w-3 h-3 text-teal-600" />
                            <span>Hariri</span>
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(`Admin DISMAS POKELA: Je, una uhakika unataka kumfuta ${doc.name} kutoka kwenye orodha ya madaktari?`)) {
                                onDeleteDoctor(doc.id);
                              }
                            }}
                            className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Futa Daktari"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {doc.emailSentAt && (
                          <div className="text-[10px] text-emerald-700 font-medium flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Email ilitumwa: {new Date(doc.emailSentAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 2: ADD / EDIT FORM */}
          {activeSubTab === 'add_edit' && (
            <form onSubmit={handleSaveSubmit} className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
              
              {formSuccessMessage && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{formSuccessMessage}</span>
                </div>
              )}

              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {editingDoctorId ? 'Hariri / Boresha Taarifa za Daktari au Mtaalamu wa Lishe' : 'Sajili Mtaalamu Mpya wa Afya & Lishe'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Msimamizi wa Mfumo: DISMAS POKELA — Weka vigezo vyote na ada ya ushauri.
                  </p>
                </div>
                <span className="text-xs font-black px-3 py-1 rounded-full bg-teal-100 text-teal-800">
                  Admin Authority
                </span>
              </div>

              {/* 1. Basic Bio */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>1. Taarifa za Msingi & Kada</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Kada ya Mtaalamu *</label>
                    <select
                      value={formRoleType}
                      onChange={(e) => setFormRoleType(e.target.value as 'doctor' | 'nutritionist')}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="doctor">Daktari wa Tiba (Medical Doctor / Specialist)</option>
                      <option value="nutritionist">Mtaalamu wa Lishe (Clinical Nutritionist / Dietitian)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Jina Kamili la Mtaalamu *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Mfano: Dkt. Emmanuel Mrema, MD"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Cheo / Wadhifa *</label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Mfano: Daktari Bingwa wa Shinikizo la Damu & Moyo"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Eneo la Ubingwa (Specialty) *</label>
                    <select
                      value={formSpecialty}
                      onChange={(e) => setFormSpecialty(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="shinikizo_la_damu">Shinikizo la Damu & Moyo (Hypertension)</option>
                      <option value="kisukari">Kisukari na Mfumo wa Tezi (Diabetes)</option>
                      <option value="lishe_ya_kliniki">Lishe ya Kliniki & Kupunguza Uzito</option>
                      <option value="watoto">Afya & Lishe ya Watoto (Pediatric)</option>
                      <option value="afya_ya_jamii">Mtindo wa Maisha & Mazoezi Salama</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Credentials for Logging in */}
              <div className="space-y-4 p-5 rounded-2xl bg-teal-50/60 border border-teal-200">
                <h4 className="text-xs font-black text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-teal-700" />
                  <span>2. Taarifa za Kuingia (User Login & Email)</span>
                </h4>
                <p className="text-[11px] text-teal-900/80">
                  Mfumo utamtengenezea daktari huyu akaunti ya kuingia kwa kutumia barua pepe na nenosiri litakaloonekana kwako (Admin DISMAS POKELA).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">Barua Pepe (Email) *</label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="daktari@afyalishe.co.tz"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">Jina la Mtumiaji (Username) *</label>
                    <input
                      type="text"
                      required
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      placeholder="dkt.emmanuel"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">Nenosiri la Awali *</label>
                    <input
                      type="text"
                      required
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="Weka password..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-teal-900"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Qualifications, Institution, Experience */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-teal-600" />
                  <span>3. Sifa Alizosomea & Uzoefu</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Sifa Alizosomea (Degree / Masters) *</label>
                    <input
                      type="text"
                      required
                      value={formQualifications}
                      onChange={(e) => setFormQualifications(e.target.value)}
                      placeholder="Mfano: MD, MMed (Internal Medicine), MSc Clinical Nutrition"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Chuo Alichosomea (Institution) *</label>
                    <input
                      type="text"
                      required
                      value={formInstitution}
                      onChange={(e) => setFormInstitution(e.target.value)}
                      placeholder="Mfano: Chuo Kikuu cha Afya Muhimbili (MUHAS)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Miaka ya Uzoefu wa Kazi</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={formExperienceYears}
                      onChange={(e) => setFormExperienceYears(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nambari ya Usajili wa Bodi (MCT / Baraza)</label>
                    <input
                      type="text"
                      value={formRegistrationNo}
                      onChange={(e) => setFormRegistrationNo(e.target.value)}
                      placeholder="Mfano: MCT/REG/8421 au TZ-NUTR/RD/052"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Consultation Fee & Lipa Namba (ADMIN FEE CONTROL) */}
              <div className="space-y-4 p-5 rounded-2xl bg-amber-50/70 border border-amber-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-amber-700" />
                    <span>4. Ada ya Ushauri & Malipo (Yaliyopangwa na Admin DISMAS POKELA)</span>
                  </h4>
                  <span className="text-[10px] font-black text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full">
                    Malipo Rasmi
                  </span>
                </div>
                <p className="text-[11px] text-amber-900/80">
                  Mgonjwa atalipa ada hii kulingana na alivyopanga admin wakati wa kumsajili daktari au mtaalamu wa lishe.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-900">Ada ya Ushauri (TZS) *</label>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      required
                      value={formConsultationFee}
                      onChange={(e) => setFormConsultationFee(Number(e.target.value))}
                      placeholder="10000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-900">Lipa Namba ya Mtaalamu</label>
                    <input
                      type="text"
                      value={formLipaNamba}
                      onChange={(e) => setFormLipaNamba(e.target.value)}
                      placeholder="Mfano: 554433"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-900">Jina la Mfanyabiashara (Merchant)</label>
                    <input
                      type="text"
                      value={formMerchantName}
                      onChange={(e) => setFormMerchantName(e.target.value)}
                      placeholder="Mfano: AfyaLishe Clinic"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Contact & Hospital */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                  <span>5. Mawasiliano & Hospitali / Kituo</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Hospitali / Kituo cha Kazi</label>
                    <input
                      type="text"
                      value={formFacility}
                      onChange={(e) => setFormFacility(e.target.value)}
                      placeholder="Mfano: Hospitali ya Taifa Muhimbili"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Namba ya Kupiga Simu *</label>
                    <input
                      type="text"
                      required
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="+255 754 000 000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Namba ya WhatsApp *</label>
                    <input
                      type="text"
                      required
                      value={formWhatsapp}
                      onChange={(e) => setFormWhatsapp(e.target.value)}
                      placeholder="+255 754 000 000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Form submit buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('list')}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Ghairi
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{editingDoctorId ? 'Hifadhi Mabadiliko (Update)' : 'Kamilisha Usajili wa Daktari'}</span>
                </button>
              </div>

            </form>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Mfumo wa Msimamizi Mkuu DISMAS POKELA | AfyaLishe Tanzania</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors cursor-pointer"
          >
            Funga
          </button>
        </div>

      </div>

      {/* SUB-MODAL 1: DIRECT EMAIL DISPATCH PREVIEW */}
      {selectedDoctorForEmail && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="p-5 bg-teal-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-teal-300" />
                <h3 className="font-black text-sm sm:text-base">Tuma Taarifa za Kuingia Kwenye Email</h3>
              </div>
              <button
                onClick={() => setSelectedDoctorForEmail(null)}
                className="p-1.5 rounded-lg text-teal-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {isEmailSentSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Barua pepe imeelekezwa moja kwa moja kwenye barua pepe ya {selectedDoctorForEmail.email}!</span>
                </div>
              )}

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2 font-mono">
                <div><strong>Mpokeaji:</strong> {selectedDoctorForEmail.email}</div>
                <div><strong>Mtumaji:</strong> DISMAS POKELA (Admin)</div>
                <div><strong>Mada (Subject):</strong> {getEmailContent(selectedDoctorForEmail).subject}</div>
                <div className="pt-2 border-t border-slate-200 text-slate-700 whitespace-pre-line text-[11px] leading-relaxed max-h-48 overflow-y-auto">
                  {getEmailContent(selectedDoctorForEmail).body}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSendDirectEmail}
                  className="flex-1 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Tuma Mara Moja (Direct Email Dispatch)</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyEmailText}
                  className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>{isCopiedEmail ? 'Imenakiliwa!' : 'Nakili'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 2: QUICK PASSWORD RESET BY ADMIN */}
      {resetDoctorModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-teal-800 font-black text-sm">
                <KeyRound className="w-4 h-4" />
                <span>Weka Upya Nenosiri</span>
              </div>
              <button onClick={() => setResetDoctorModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Msimamizi <strong>DISMAS POKELA</strong>: Weka nenosiri jipya kwa ajili ya <strong>{resetDoctorModal.name}</strong>.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Nenosiri Jipya</label>
              <input
                type="text"
                value={newResetPassword}
                onChange={(e) => setNewResetPassword(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResetDoctorModal(null)}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Ghairi
              </button>
              <button
                type="button"
                onClick={handleConfirmResetPassword}
                className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs shadow-xs"
              >
                Hifadhi Nenosiri
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
