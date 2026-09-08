import React, { useState } from 'react';
import {
  Bell, Pin, PlusCircle, Sparkles, Trash2, Edit3, Heart, 
  Search, Filter, Calendar, Clock, User, ArrowRight, ShieldCheck, 
  AlertTriangle, BookOpen, ChevronRight, Check, X, Share2, Tag, 
  Flame, Utensils, HeartPulse, Scale, CheckCircle2, Lock, Unlock,
  MessageSquareText, Megaphone
} from 'lucide-react';
import { AnnouncementCategory, NutritionAnnouncement, UserProfile } from '../types';

interface AnnouncementsViewProps {
  announcements: NutritionAnnouncement[];
  profile: UserProfile;
  onAddAnnouncement: (announcement: NutritionAnnouncement) => void;
  onUpdateAnnouncement: (announcement: NutritionAnnouncement) => void;
  onDeleteAnnouncement: (id: string) => void;
  onNavigateTab: (tab: 'dashboard' | 'scanner' | 'glucose' | 'recommendations' | 'food_db' | 'bmi' | 'chat') => void;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  announcements,
  profile,
  onAddAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
  onNavigateTab,
}) => {
  // Admin Mode state
  const [isAdminMode, setIsAdminMode] = useState<boolean>(profile.isAdmin || false);
  const [showAdminPinModal, setShowAdminPinModal] = useState<boolean>(false);
  const [adminPinInput, setAdminPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'urgent' | 'important'>('all');

  // Interactive Read Modal
  const [selectedArticle, setSelectedArticle] = useState<NutritionAnnouncement | null>(null);
  const [likedArticles, setLikedArticles] = useState<Record<string, boolean>>({});

  // Admin Create / Edit Modal State
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState<string>('');
  const [formCategory, setFormCategory] = useState<AnnouncementCategory>('lishe_tips');
  const [formSummary, setFormSummary] = useState<string>('');
  const [formContent, setFormContent] = useState<string>('');
  const [formAuthorName, setFormAuthorName] = useState<string>('Dkt. Grace Mwangi, MD');
  const [formAuthorRole, setFormAuthorRole] = useState<string>('Mkuu wa Idara ya Lishe ya Kimatibabu');
  const [formIsPinned, setFormIsPinned] = useState<boolean>(false);
  const [formPriority, setFormPriority] = useState<'normal' | 'important' | 'urgent'>('normal');
  const [formTags, setFormTags] = useState<string>('Lishe, Kisukari');
  const [formActionText, setFormActionText] = useState<string>('');
  const [formActionTab, setFormActionTab] = useState<string>('none');
  const [readTime, setReadTime] = useState<number>(2);

  // AI Generator state
  const [aiTopic, setAiTopic] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiGenError, setAiGenError] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Categories helper
  const categoriesList: { id: string; label: string; icon: any; color: string }[] = [
    { id: 'all', label: 'Taarifa Zote', icon: BookOpen, color: 'text-slate-700' },
    { id: 'lishe_tips', label: 'Ushauri wa Lishe', icon: Utensils, color: 'text-emerald-700' },
    { id: 'matangazo_kliniki', label: 'Matangazo ya Kliniki', icon: Megaphone, color: 'text-blue-700' },
    { id: 'tahadhari_sukari', label: 'Tahadhari & Dawa', icon: AlertTriangle, color: 'text-rose-700' },
    { id: 'utafiti_mpya', label: 'Utafiti wa Sayansi', icon: Sparkles, color: 'text-purple-700' },
    { id: 'semina_warsha', label: 'Warsha & Semina', icon: Calendar, color: 'text-amber-700' },
  ];

  // Admin PIN verification
  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPinInput === '1234' || adminPinInput === 'admin' || adminPinInput === '2026') {
      setIsAdminMode(true);
      setShowAdminPinModal(false);
      setAdminPinInput('');
      setPinError(null);
      showToast('Umefanikiwa kuingia kama Msimamizi (Admin)!');
    } else {
      setPinError('PIN si sahihi. Jaribu 1234 au wasiliana na kliniki.');
    }
  };

  // Like Toggle
  const handleToggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isCurrentlyLiked = likedArticles[id];
    setLikedArticles((prev) => ({ ...prev, [id]: !isCurrentlyLiked }));
    const target = announcements.find((a) => a.id === id);
    if (target) {
      onUpdateAnnouncement({
        ...target,
        likesCount: (target.likesCount || 0) + (isCurrentlyLiked ? -1 : 1),
      });
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormTitle('');
    setFormCategory('lishe_tips');
    setFormSummary('');
    setFormContent('');
    setFormAuthorName('Dkt. Grace Mwangi, MD');
    setFormAuthorRole('Mkuu wa Idara ya Lishe ya Kimatibabu');
    setFormIsPinned(false);
    setFormPriority('normal');
    setFormTags('Lishe, Kisukari');
    setFormActionText('');
    setFormActionTab('none');
    setReadTime(2);
    setAiTopic('');
    setAiGenError(null);
    setIsEditorOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: NutritionAnnouncement, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormSummary(item.summary);
    setFormContent(item.content);
    setFormAuthorName(item.author.name);
    setFormAuthorRole(item.author.role);
    setFormIsPinned(item.isPinned);
    setFormPriority(item.priority);
    setFormTags(item.tags.join(', '));
    setFormActionText(item.actionButtonText || '');
    setFormActionTab(item.actionLinkTab || 'none');
    setReadTime(item.readTimeMinutes || 2);
    setAiGenError(null);
    setIsEditorOpen(true);
  };

  // Save Announcement
  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      alert('Tafadhali jaza Kichwa cha habari na Maudhui kamili.');
      return;
    }

    const categoryObj = categoriesList.find((c) => c.id === formCategory);
    const categoryLabel = categoryObj ? categoryObj.label : 'Ushauri wa Lishe';

    const tagsArray = formTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const announcementObj: NutritionAnnouncement = {
      id: editingId || `ann-${Date.now()}`,
      title: formTitle.trim(),
      category: formCategory,
      categoryLabelSwahili: categoryLabel,
      summary: formSummary.trim() || formContent.slice(0, 140) + '...',
      content: formContent.trim(),
      author: {
        name: formAuthorName.trim() || 'Afisa wa Lishe',
        role: formAuthorRole.trim() || 'Kliniki ya Kisukari',
      },
      publishedAt: editingId
        ? announcements.find((a) => a.id === editingId)?.publishedAt || new Date().toISOString()
        : new Date().toISOString(),
      isPinned: formIsPinned,
      priority: formPriority,
      tags: tagsArray.length > 0 ? tagsArray : ['Lishe'],
      actionButtonText: formActionText.trim() || undefined,
      actionLinkTab:
        formActionTab !== 'none'
          ? (formActionTab as 'scanner' | 'glucose' | 'recommendations' | 'food_db' | 'bmi' | 'chat')
          : undefined,
      likesCount: editingId ? announcements.find((a) => a.id === editingId)?.likesCount || 0 : 0,
      readTimeMinutes: Number(readTime) || 2,
    };

    if (editingId) {
      onUpdateAnnouncement(announcementObj);
      showToast('Tangazo limesasishwa kikamilifu!');
    } else {
      onAddAnnouncement(announcementObj);
      showToast('Tangazo jipya limechapishwa kwa mafanikio!');
    }

    setIsEditorOpen(false);
  };

  // AI Draft Generator
  const handleGenerateAiDraft = async () => {
    if (!aiTopic.trim()) {
      alert('Tafadhali andika mada unayotaka kuandaliwa na AI.');
      return;
    }

    setIsGeneratingAi(true);
    setAiGenError(null);
    try {
      const res = await fetch('/api/admin/generate-announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic,
          category: formCategory,
          targetAudience: 'Wagonjwa wa Kisukari na Jamii',
          urgency: formPriority,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Imeshindikana kuandaa rasimu.');
      }

      const d = json.data;
      setFormTitle(d.title || formTitle);
      setFormSummary(d.summary || formSummary);
      setFormContent(d.content || formContent);
      if (d.tags && Array.isArray(d.tags)) {
        setFormTags(d.tags.join(', '));
      }
      if (d.readTimeMinutes) {
        setReadTime(d.readTimeMinutes);
      }
      if (d.actionButtonText) {
        setFormActionText(d.actionButtonText);
      }
      if (d.actionLinkTab) {
        setFormActionTab(d.actionLinkTab);
      }
      showToast('Rasimu ya AI imekamilika na kuingizwa!');
    } catch (err: any) {
      console.error('AI draft error:', err);
      setAiGenError(err.message || 'Hitilafu ya mtandao wakati wa kuzalisha.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Filter announcements
  const filtered = announcements.filter((item) => {
    // Category
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }
    // Priority
    if (filterPriority === 'urgent' && item.priority !== 'urgent') {
      return false;
    }
    if (filterPriority === 'important' && item.priority !== 'important' && item.priority !== 'urgent') {
      return false;
    }
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSummary = item.summary.toLowerCase().includes(q);
      const matchContent = item.content.toLowerCase().includes(q);
      const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchSummary && !matchContent && !matchTags) {
        return false;
      }
    }
    return true;
  });

  // Sort: Pinned first, then by date desc
  const sorted = [...filtered].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  // Pinned Items for top featured
  const pinnedAnnouncements = announcements.filter((a) => a.isPinned);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30 mb-2">
                <Megaphone className="w-3.5 h-3.5" />
                <span>Kituo cha Matangazo & Taarifa za Kilishe</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Matangazo na Mwongozo wa Kilishe
              </h1>
              <p className="text-sm text-teal-100/80 max-w-2xl mt-1">
                Pata taarifa za hivi punde kutoka kwa madaktari wa lishe, tahadhari za dharura za sukari, matangazo ya kliniki, na elimu ya mapishi salama ya Kiswahili.
              </p>
            </div>

            {/* Admin Controls Toggle */}
            <div className="flex items-center gap-2.5">
              {isAdminMode ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenCreateModal}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-slate-950 rounded-xl text-xs sm:text-sm font-extrabold shadow-md transition-all flex items-center gap-2"
                    id="btn-admin-create-announcement"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Weka Tangazo Jipya</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsAdminMode(false);
                      showToast('Umetoka kwenye Hali ya Msimamizi (Admin).');
                    }}
                    title="Toka Admin"
                    className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition-all flex items-center gap-1.5"
                  >
                    <Unlock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Admin Washa</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAdminPinModal(true)}
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/20 active:scale-98 text-teal-200 rounded-xl text-xs font-bold border border-white/20 transition-all flex items-center gap-2"
                  id="btn-login-admin-mode"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Jopo la Admin</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pinned / Urgent Highlights Carousel (If Any) */}
      {pinnedAnnouncements.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Pin className="w-3.5 h-3.5 text-rose-600 rotate-45" />
              <span>Matangazo Yaliyobandikwa Juu (Pinned & Urgent)</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-semibold">{pinnedAnnouncements.length} taarifa muhimu</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pinnedAnnouncements.map((pinned) => (
              <div
                key={pinned.id}
                onClick={() => setSelectedArticle(pinned)}
                className="bg-gradient-to-br from-white to-amber-50/50 border-2 border-amber-200/80 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
              >
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Pin className="w-3 h-3 text-amber-700 rotate-45" />
                    Imebandikwa
                  </span>
                  {pinned.priority === 'urgent' && (
                    <span className="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      Dharura
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="pr-20">
                    <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-100">
                      {pinned.categoryLabelSwahili}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-base mt-2 group-hover:text-teal-700 transition-colors leading-snug">
                      {pinned.title}
                    </h4>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {pinned.summary}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-amber-100/80 text-[11px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">{pinned.author.name}</span>
                      <span>•</span>
                      <span>{new Date(pinned.publishedAt).toLocaleDateString('sw-TZ', { month: 'short', day: 'numeric' })}</span>
                    </div>

                    <span className="text-teal-700 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Soma Zaidi <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Tabs & Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categoriesList.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-teal-300' : cat.color}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Priority Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tafuta tangazo, ushauri, au mada (mf. Mlonge, Maembe, HbA1c)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none"
            >
              <option value="all">Uharaka Wote</option>
              <option value="important">Muhimu Sana</option>
              <option value="urgent">Dharura Pekee</option>
            </select>

            {isAdminMode && (
              <button
                onClick={handleOpenCreateModal}
                className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Tangazo Jipya</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Feed Grid */}
      <div className="space-y-4">
        {sorted.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-base">Hakuna Matangazo Yaliyopatikana</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Hakuna taarifa zinazolingana na neno ulilotafuta au kundi ulilochagua. Jaribu kubadilisha kategoria.
            </p>
            {isAdminMode && (
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 bg-teal-700 text-white rounded-xl text-xs font-bold"
              >
                Andika Tangazo la Kwanza
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {sorted.map((item) => {
              const isLiked = likedArticles[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedArticle(item)}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative"
                >
                  {/* Top Meta Bar */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                          {item.categoryLabelSwahili}
                        </span>

                        {item.priority === 'urgent' && (
                          <span className="text-[10px] font-extrabold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">
                            Dharura
                          </span>
                        )}
                      </div>

                      {/* Admin Quick Action Controls */}
                      {isAdminMode && (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateAnnouncement({ ...item, isPinned: !item.isPinned });
                              showToast(item.isPinned ? 'Tangazo limeondolewa juu.' : 'Tangazo limebandikwa juu!');
                            }}
                            title={item.isPinned ? 'Ondoa Pinned' : 'Bandika Juu'}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              item.isPinned ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-50 text-slate-400 hover:text-slate-700'
                            }`}
                          >
                            <Pin className="w-3.5 h-3.5 rotate-45" />
                          </button>

                          <button
                            onClick={(e) => handleOpenEditModal(item, e)}
                            title="Hariri Tangazo"
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Una uhakika unataka kufuta tangazo hili: "${item.title}"?`)) {
                                onDeleteAnnouncement(item.id);
                                showToast('Tangazo limefutwa.');
                              }
                            }}
                            title="Futa Tangazo"
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-base group-hover:text-teal-700 transition-colors leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {item.summary}
                    </p>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom Author & Engagement Bar */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-black text-xs">
                        {item.author.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block text-[11px] leading-tight">
                          {item.author.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.publishedAt).toLocaleDateString('sw-TZ', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => handleToggleLike(item.id, e)}
                        className={`flex items-center gap-1 text-[11px] font-bold transition-colors ${
                          isLiked ? 'text-rose-600' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-600' : ''}`} />
                        <span>{item.likesCount || 0}</span>
                      </button>

                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{item.readTimeMinutes || 2} dk</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FULL ARTICLE POPUP / MODAL */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                    {selectedArticle.categoryLabelSwahili}
                  </span>
                  {selectedArticle.priority === 'urgent' && (
                    <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-lg border border-rose-200">
                      Tahadhari ya Dharura
                    </span>
                  )}
                  {selectedArticle.isPinned && (
                    <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Pin className="w-3 h-3 rotate-45" /> Imebandikwa
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  {selectedArticle.title}
                </h2>
              </div>

              <button
                onClick={() => setSelectedArticle(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Author Information */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold text-sm">
                  {selectedArticle.author.name.charAt(0)}
                </div>
                <div>
                  <h5 className="font-extrabold text-xs text-slate-900">{selectedArticle.author.name}</h5>
                  <p className="text-[11px] text-slate-500">{selectedArticle.author.role}</p>
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-500">
                <span className="block font-semibold">
                  {new Date(selectedArticle.publishedAt).toLocaleDateString('sw-TZ', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <span className="text-[10px] text-teal-700 font-bold">{selectedArticle.readTimeMinutes} dk za kusoma</span>
              </div>
            </div>

            {/* Summary Box */}
            <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-200 text-xs sm:text-sm font-semibold text-teal-950 leading-relaxed">
              💡 {selectedArticle.summary}
            </div>

            {/* Full Article Content */}
            <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed space-y-3 whitespace-pre-line text-xs sm:text-sm">
              {selectedArticle.content}
            </div>

            {/* Action Link CTA if configured */}
            {selectedArticle.actionButtonText && selectedArticle.actionLinkTab && (
              <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                <div>
                  <span className="text-xs font-bold text-teal-300 block">Hatua Iliyopendekezwa:</span>
                  <p className="text-xs text-slate-300">Tumia zana ya kliniki kufanya kipimo au tathmini sasa.</p>
                </div>
                <button
                  onClick={() => {
                    const tab = selectedArticle.actionLinkTab!;
                    setSelectedArticle(null);
                    onNavigateTab(tab);
                  }}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <span>{selectedArticle.actionButtonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Modal Footer Engagement */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={(e) => handleToggleLike(selectedArticle.id, e)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  likedArticles[selectedArticle.id]
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Heart className={`w-4 h-4 ${likedArticles[selectedArticle.id] ? 'fill-rose-600 text-rose-600' : ''}`} />
                <span>Imesaidia ({selectedArticle.likesCount || 0})</span>
              </button>

              <button
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Funga
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN PIN VERIFICATION MODAL */}
      {showAdminPinModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Uthibitisho wa Admin / Msimamizi</h3>
              <p className="text-xs text-slate-500">
                Ingiza PIN ya Msimamizi wa Kliniki ili kuweka, kuhariri, au kufuta matangazo ya kilishe.
              </p>
            </div>

            <form onSubmit={handleVerifyPin} className="space-y-3">
              <div>
                <input
                  type="password"
                  placeholder="PIN ya Msimamizi (Mfano: 1234)"
                  value={adminPinInput}
                  onChange={(e) => setAdminPinInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-center text-base font-black tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  autoFocus
                />
                {pinError && <p className="text-xs text-rose-600 mt-1.5 text-center font-semibold">{pinError}</p>}
                <p className="text-[10px] text-slate-400 text-center mt-1">
                  Kidokezo cha mfumo: Tumia PIN <strong>1234</strong> kuingia.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminPinModal(false);
                    setPinError(null);
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Thibitisha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN CREATE / EDIT MODAL */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-700 text-white flex items-center justify-center">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">
                    {editingId ? 'Hariri Tangazo la Kilishe' : 'Chapisha Tangazo / Ushauri Mpya'}
                  </h3>
                  <p className="text-xs text-slate-500">Maudhui haya yataonekana kwa wagonjwa wote kwenye mfumo</p>
                </div>
              </div>

              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Assistant Generator Banner */}
            <div className="p-4 bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Msaidizi wa AI wa Kuandaa Rasimu (Gemini AI)
                </span>
                <span className="text-[10px] text-slate-400">Huandika kwa Kiswahili fasaha</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Andika mada unayotaka (mfano: Matumizi ya Asali na Mdalasini kwa Kisukari)..."
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
                />
                <button
                  type="button"
                  onClick={handleGenerateAiDraft}
                  disabled={isGeneratingAi}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 whitespace-nowrap disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingAi ? 'AI Inaandaa...' : 'Tengeneza Rasimu'}</span>
                </button>
              </div>
              {aiGenError && <p className="text-xs text-rose-300">{aiGenError}</p>}
            </div>

            {/* Form */}
            <form onSubmit={handleSaveAnnouncement} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kichwa cha Tangazo / Makala <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Mf. Tahadhari ya Msimu wa Maembe na Sukari..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* Category, Priority, Pinned */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategoria:</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as AnnouncementCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
                  >
                    <option value="lishe_tips">Ushauri wa Lishe</option>
                    <option value="matangazo_kliniki">Matangazo ya Kliniki</option>
                    <option value="tahadhari_sukari">Tahadhari & Dawa</option>
                    <option value="utafiti_mpya">Utafiti wa Sayansi</option>
                    <option value="semina_warsha">Warsha & Semina</option>
                    <option value="ushuhuda_hadithi">Shuhuda & Hamasa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kiwango cha Uharaka:</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
                  >
                    <option value="normal">Kawaida (Normal)</option>
                    <option value="important">Muhimu (Important)</option>
                    <option value="urgent">Dharura (Urgent)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="chk-pinned"
                    checked={formIsPinned}
                    onChange={(e) => setFormIsPinned(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded-md border-slate-300 focus:ring-teal-500 cursor-pointer"
                  />
                  <label htmlFor="chk-pinned" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Bandika Juu (Pin to top)
                  </label>
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Muhtasari Mfupi (Sentensi 1-2):
                </label>
                <textarea
                  rows={2}
                  placeholder="Muhtasari mfupi wa kuonekana kwenye kadi kabla ya msomaji kufungua..."
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* Full Content */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Maudhui Kamili ya Tangazo <span className="text-rose-500">*</span>:
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Andika maelezo ya kina, nukta za kufuata, na miongozo ya matibabu..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 leading-relaxed font-mono"
                />
              </div>

              {/* Author & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jina la Mwandishi:</label>
                  <input
                    type="text"
                    value={formAuthorName}
                    onChange={(e) => setFormAuthorName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Wadhifa / Cheo:</label>
                  <input
                    type="text"
                    value={formAuthorRole}
                    onChange={(e) => setFormAuthorRole(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lebo (Tags, tenganisha kwa koma):</label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Optional CTA Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Kitufe cha Kitendo (Mf. Pima Chakula):
                  </label>
                  <input
                    type="text"
                    placeholder="Mf. Pima Chakula Chako Sasa"
                    value={formActionText}
                    onChange={(e) => setFormActionText(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Elekeza Kwenye Sehemu ya:
                  </label>
                  <select
                    value={formActionTab}
                    onChange={(e) => setFormActionTab(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                  >
                    <option value="none">Hakuna kiunganishi</option>
                    <option value="scanner">Kamera ya Chakula (Scanner)</option>
                    <option value="glucose">Kipimo cha Sukari (Glucose)</option>
                    <option value="bmi">Kikokotoo cha BMI</option>
                    <option value="food_db">Orodha ya Vyakula (Food Database)</option>
                    <option value="recommendations">Mapendekezo ya Lishe</option>
                    <option value="chat">Mtaalamu wa AI (Chat)</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingId ? 'Hifadhi Mabadiliko' : 'Chapisha Tangazo'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
