import React, { useState, useEffect } from 'react';
import { Palette, Check, Sparkles, X, Sun, Moon, CheckCircle2, RotateCcw } from 'lucide-react';
import { DashboardTheme } from '../types';
import { DASHBOARD_THEMES, ThemeConfig } from '../utils/theme';

interface ThemeSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: DashboardTheme;
  onSelectTheme: (theme: DashboardTheme) => void;
}

export const ThemeSwitcherModal: React.FC<ThemeSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
}) => {
  // Local state for selecting before applying
  const [selectedThemeId, setSelectedThemeId] = useState<DashboardTheme>(currentTheme);
  const [appliedFeedback, setAppliedFeedback] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedThemeId(currentTheme);
      setAppliedFeedback(false);
    }
  }, [isOpen, currentTheme]);

  if (!isOpen) return null;

  const themesList = Object.values(DASHBOARD_THEMES);
  const selectedConfig = DASHBOARD_THEMES[selectedThemeId] || DASHBOARD_THEMES[currentTheme];
  const hasUnappliedChanges = selectedThemeId !== currentTheme;

  const handleApplyTheme = () => {
    onSelectTheme(selectedThemeId);
    setAppliedFeedback(true);
    setTimeout(() => {
      setAppliedFeedback(false);
      onClose();
    }, 900);
  };

  const handleResetToCurrent = () => {
    setSelectedThemeId(currentTheme);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 relative overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shadow-xs">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Badilisha Mandhari ya Dashibodi (Themes)
              </h2>
              <p className="text-xs text-slate-500">
                Chagua mandhari unayopendelea kisha bofya <strong>"Tumia Mandhari Hii (Apply)"</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Funga"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview of Selected Theme */}
        <div 
          className="p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all"
          style={{
            borderColor: selectedConfig.swatchHex,
            backgroundColor: selectedConfig.isDark ? '#0f172a' : '#f8fafc'
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-xl shadow-xs border border-white/30 flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: selectedConfig.swatchHex }}
            >
              {selectedConfig.isDark ? <Moon className="w-4 h-4 text-cyan-300" /> : <Sun className="w-4 h-4 text-white" />}
            </div>
            <div>
              <div className={`text-xs font-black flex items-center gap-2 ${selectedConfig.isDark ? 'text-white' : 'text-slate-900'}`}>
                <span>Umechagua: {selectedConfig.swahiliName}</span>
                {selectedThemeId === currentTheme ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 font-bold">
                    Inatumika Sasa
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 font-bold animate-pulse">
                    Haijatumika (Bonyeza Apply)
                  </span>
                )}
              </div>
              <p className={`text-[11px] ${selectedConfig.isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {selectedConfig.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span 
              className="w-4 h-4 rounded-full border border-white/60 shadow-xs" 
              style={{ backgroundColor: selectedConfig.swatchHex }} 
              title="Primary Color"
            />
            <span 
              className="w-4 h-4 rounded-full border border-white/60 shadow-xs" 
              style={{ backgroundColor: selectedConfig.secondaryHex }} 
              title="Secondary Color"
            />
          </div>
        </div>

        {/* Theme Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[48vh] overflow-y-auto pr-1">
          {themesList.map((t: ThemeConfig) => {
            const isChosen = t.id === selectedThemeId;
            const isCurrentlyActive = t.id === currentTheme;

            return (
              <div
                key={t.id}
                onClick={() => setSelectedThemeId(t.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between group ${
                  isChosen
                    ? 'border-teal-600 ring-2 ring-teal-600 bg-teal-50/40 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                }`}
              >
                {/* Header Swatch & Indicator */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-lg shadow-xs border border-white/40 flex items-center justify-center text-white"
                      style={{ backgroundColor: t.swatchHex }}
                    >
                      {t.isDark ? <Moon className="w-3 h-3 text-cyan-300" /> : <Sun className="w-3 h-3 text-white" />}
                    </div>
                    <span className="font-black text-slate-900 text-xs sm:text-sm">
                      {t.swahiliName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {isCurrentlyActive && (
                      <span className="text-[9px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded-md">
                        Kazi
                      </span>
                    )}
                    <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      isChosen ? 'bg-teal-600 text-white border-teal-600' : 'border-slate-300 bg-white'
                    }`}>
                      {isChosen && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                  </div>
                </div>

                {/* Tagline */}
                <p className="text-[11px] text-slate-600 mb-2 line-clamp-2 leading-relaxed">
                  {t.tagline}
                </p>

                {/* Color preview bar */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                  <span 
                    className="h-2 flex-1 rounded-full"
                    style={{ backgroundColor: t.swatchHex }} 
                  />
                  <span 
                    className="h-2 flex-1 rounded-full"
                    style={{ backgroundColor: t.secondaryHex }} 
                  />
                  <span className="text-[9px] font-mono text-slate-400 uppercase ml-1">
                    {t.id}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer with Apply / Cancel Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium w-full sm:w-auto">
            {appliedFeedback ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Mandhari imetumika kikamilifu!
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                Chagua kisha bofya <strong>Tumia Mandhari</strong>.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {hasUnappliedChanges && (
              <button
                type="button"
                onClick={handleResetToCurrent}
                className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                title="Rudi kwenye mandhari inayotumika sasa"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Ghairi</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              Funga
            </button>

            <button
              type="button"
              onClick={handleApplyTheme}
              disabled={appliedFeedback}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-600 hover:to-emerald-600 text-white text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {appliedFeedback ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Imetumika!</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Tumia Mandhari Hii (Apply)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
