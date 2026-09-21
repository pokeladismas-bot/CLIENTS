import { DashboardTheme } from '../types';

export interface ThemeConfig {
  id: DashboardTheme;
  name: string;
  swahiliName: string;
  tagline: string;
  swatchHex: string;
  secondaryHex: string;
  isDark: boolean;
  // CSS & Tailwind helper classes
  pageBg: string;
  cardBg: string;
  cardBorder: string;
  headerGradient: string;
  bannerGradient: string;
  accentText: string;
  accentBg: string;
  primaryButton: string;
  secondaryButton: string;
  badgeClass: string;
  activeTabClass: string;
  ringFocus: string;
}

export const DASHBOARD_THEMES: Record<DashboardTheme, ThemeConfig> = {
  emerald: {
    id: 'emerald',
    name: 'Emerald Health',
    swahiliName: '🌿 Afya Asili (Kijani)',
    tagline: 'Kijani kibichi cha asili, lishe bora na uponyaji',
    swatchHex: '#059669',
    secondaryHex: '#0f766e',
    isDark: false,
    pageBg: 'bg-slate-50',
    cardBg: 'bg-white',
    cardBorder: 'border-slate-200',
    headerGradient: 'from-emerald-800 via-teal-900 to-slate-900',
    bannerGradient: 'from-emerald-700 via-teal-800 to-slate-900',
    accentText: 'text-emerald-600',
    accentBg: 'bg-emerald-50 text-emerald-700',
    primaryButton: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20',
    secondaryButton: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    activeTabClass: 'bg-emerald-600 text-white shadow-xs',
    ringFocus: 'focus:ring-emerald-500',
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Clinical',
    swahiliName: '🌊 Bluu ya Kliniki (Bahari)',
    tagline: 'Bluu ya kuaminika, utulivu wa hospitali na daktari',
    swatchHex: '#2563eb',
    secondaryHex: '#0284c7',
    isDark: false,
    pageBg: 'bg-sky-50/40',
    cardBg: 'bg-white',
    cardBorder: 'border-blue-100',
    headerGradient: 'from-blue-900 via-sky-950 to-slate-900',
    bannerGradient: 'from-blue-700 via-sky-800 to-slate-900',
    accentText: 'text-blue-600',
    accentBg: 'bg-blue-50 text-blue-700',
    primaryButton: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20',
    secondaryButton: 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    activeTabClass: 'bg-blue-600 text-white shadow-xs',
    ringFocus: 'focus:ring-blue-500',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Slate',
    swahiliName: '🌙 Usiku Mtulivu (Giza)',
    tagline: 'Mandhari meusi tulivu kwa ajili ya kupunguza mwangaza na uchovu wa macho',
    swatchHex: '#0f172a',
    secondaryHex: '#06b6d4',
    isDark: true,
    pageBg: 'bg-slate-950 text-slate-100',
    cardBg: 'bg-slate-900 text-slate-100',
    cardBorder: 'border-slate-800',
    headerGradient: 'from-slate-900 via-zinc-900 to-black',
    bannerGradient: 'from-slate-900 via-slate-800 to-zinc-950 border border-slate-700/60',
    accentText: 'text-cyan-400',
    accentBg: 'bg-slate-800 text-cyan-300 border border-slate-700',
    primaryButton: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-cyan-500/20',
    secondaryButton: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700',
    badgeClass: 'bg-slate-800 text-cyan-300 border-slate-700',
    activeTabClass: 'bg-cyan-600 text-white shadow-xs',
    ringFocus: 'focus:ring-cyan-400',
  },
  amber: {
    id: 'amber',
    name: 'Amber Vitality',
    swahiliName: '🌅 Jua la Dhahabu (Uhai)',
    tagline: 'Uchangamfu, kimetaboliki na nishati chanya ya mwili',
    swatchHex: '#d97706',
    secondaryHex: '#ea580c',
    isDark: false,
    pageBg: 'bg-amber-50/40',
    cardBg: 'bg-white',
    cardBorder: 'border-amber-100',
    headerGradient: 'from-amber-900 via-orange-950 to-stone-900',
    bannerGradient: 'from-amber-700 via-orange-800 to-stone-900',
    accentText: 'text-amber-600',
    accentBg: 'bg-amber-50 text-amber-800',
    primaryButton: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20',
    secondaryButton: 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    activeTabClass: 'bg-amber-600 text-white shadow-xs',
    ringFocus: 'focus:ring-amber-500',
  },
  violet: {
    id: 'violet',
    name: 'Royal Violet',
    swahiliName: '💜 Zambarau ya Kifalme',
    tagline: 'Muonekano wa kisasa, ustawi wa hali ya juu na faraja',
    swatchHex: '#7c3aed',
    secondaryHex: '#4f46e5',
    isDark: false,
    pageBg: 'bg-purple-50/40',
    cardBg: 'bg-white',
    cardBorder: 'border-purple-100',
    headerGradient: 'from-purple-950 via-indigo-950 to-slate-900',
    bannerGradient: 'from-purple-800 via-indigo-800 to-slate-900',
    accentText: 'text-purple-600',
    accentBg: 'bg-purple-50 text-purple-700',
    primaryButton: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20',
    secondaryButton: 'bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-200',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
    activeTabClass: 'bg-purple-600 text-white shadow-xs',
    ringFocus: 'focus:ring-purple-500',
  },
  teal: {
    id: 'teal',
    name: 'Teal Modern',
    swahiliName: '🩵 Aqua Safi (Teal)',
    tagline: 'Mwangaza safi wa teknolojia ya kisasa ya tiba na uchunguzi',
    swatchHex: '#0d9488',
    secondaryHex: '#0891b2',
    isDark: false,
    pageBg: 'bg-teal-50/30',
    cardBg: 'bg-white',
    cardBorder: 'border-teal-100',
    headerGradient: 'from-teal-900 via-cyan-950 to-slate-900',
    bannerGradient: 'from-teal-700 via-cyan-800 to-slate-900',
    accentText: 'text-teal-600',
    accentBg: 'bg-teal-50 text-teal-700',
    primaryButton: 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20',
    secondaryButton: 'bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-200',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-300',
    activeTabClass: 'bg-teal-600 text-white shadow-xs',
    ringFocus: 'focus:ring-teal-500',
  },
};

export const THEME_STORAGE_KEY = 'afyalishe_dashboard_theme';

export function getSavedTheme(): DashboardTheme {
  const saved = localStorage.getItem(THEME_STORAGE_KEY) as DashboardTheme;
  if (saved && DASHBOARD_THEMES[saved]) {
    return saved;
  }
  return 'emerald';
}

export function saveTheme(theme: DashboardTheme): void {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  document.documentElement.setAttribute('data-theme', theme);
  if (theme === 'midnight') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}
