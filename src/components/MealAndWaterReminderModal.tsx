import React, { useState, useEffect } from 'react';
import { 
  X, Bell, Droplets, Utensils, CheckCircle2, Volume2, 
  Clock, Plus, Minus, ShieldCheck, Sparkles, Check, Play
} from 'lucide-react';
import { DailyReminderConfig, MealReminderItem, UserProfile } from '../types';
import { playMealChime, playWaterChime, sendBrowserNotification } from '../utils/reminderSound';

interface MealAndWaterReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  waterGlassesToday?: number;
  onLogWaterGlass?: (amount: number) => void;
}

export const MealAndWaterReminderModal: React.FC<MealAndWaterReminderModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  waterGlassesToday = 4,
  onLogWaterGlass,
}) => {
  const defaultMealSlots: MealReminderItem[] = [
    { id: 'm-1', name: 'Kifungua Kinywa (Asubuhi)', time: '07:30', enabled: true, notes: 'Uji wa dona/ulezi + yai 1 bila sukari', completedToday: true },
    { id: 'm-2', name: 'Kitafunwa cha Asubuhi (Saa 4)', time: '10:00', enabled: true, notes: 'Tango lililokatwa au tunda la papai', completedToday: true },
    { id: 'm-3', name: 'Chakula cha Mchana', time: '13:00', enabled: true, notes: 'Ugali wa dona (ngumi 1) + mchicha mwingi + samaki', completedToday: false },
    { id: 'm-4', name: 'Kitafunwa cha Alasiri (Saa 10)', time: '16:30', enabled: true, notes: 'Mbegu za maboga kiganja kidogo + glasi ya maji', completedToday: false },
    { id: 'm-5', name: 'Chakula cha Usiku', time: '19:30', enabled: true, notes: 'Supu ya mboga za asili + dengu/kunde', completedToday: false },
    { id: 'm-6', name: 'Kinywaji cha Kulala (Saa 3.5)', time: '21:30', enabled: true, notes: 'Glasi ya maji safi ya uvuguvugu', completedToday: false },
  ];

  const existingReminders: DailyReminderConfig = profile.dailyReminders || {
    enabled: true,
    morningTime: '07:30',
    morningEnabled: true,
    afternoonTime: '13:30',
    afternoonEnabled: true,
    eveningTime: '20:00',
    eveningEnabled: true,
    browserNotifications: true,
    soundEnabled: true,
    mealsEnabled: true,
    mealSlots: defaultMealSlots,
    hydration: {
      enabled: true,
      dailyTargetGlasses: 8,
      intervalMinutes: 90,
      startTime: '07:00',
      endTime: '21:00',
      soundEnabled: true,
    },
  };

  const [activeTab, setActiveTab] = useState<'meals' | 'water'>('meals');
  const [mealSlots, setMealSlots] = useState<MealReminderItem[]>(
    existingReminders.mealSlots && existingReminders.mealSlots.length > 0 
      ? existingReminders.mealSlots 
      : defaultMealSlots
  );

  const [waterTarget, setWaterTarget] = useState<number>(
    existingReminders.hydration?.dailyTargetGlasses || 8
  );
  const [waterInterval, setWaterInterval] = useState<number>(
    existingReminders.hydration?.intervalMinutes || 90
  );
  const [waterEnabled, setWaterEnabled] = useState<boolean>(
    existingReminders.hydration?.enabled ?? true
  );
  const [soundEnabled, setSoundEnabled] = useState<boolean>(
    existingReminders.soundEnabled ?? true
  );
  const [browserNotifs, setBrowserNotifs] = useState<boolean>(
    existingReminders.browserNotifications ?? true
  );
  const [currentGlasses, setCurrentGlasses] = useState<number>(waterGlassesToday);
  const [justSaved, setJustSaved] = useState<boolean>(false);

  useEffect(() => {
    setCurrentGlasses(waterGlassesToday);
  }, [waterGlassesToday]);

  if (!isOpen) return null;

  const handleToggleMeal = (id: string) => {
    setMealSlots(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
  };

  const handleMealTimeChange = (id: string, newTime: string) => {
    setMealSlots(prev => prev.map(m => m.id === id ? { ...m, time: newTime } : m));
  };

  const handleToggleMealCompleted = (id: string) => {
    setMealSlots(prev => prev.map(m => m.id === id ? { ...m, completedToday: !m.completedToday } : m));
  };

  const handleAddGlass = () => {
    const next = currentGlasses + 1;
    setCurrentGlasses(next);
    if (onLogWaterGlass) {
      onLogWaterGlass(1);
    }
    playWaterChime();
  };

  const handleMinusGlass = () => {
    if (currentGlasses > 0) {
      const next = currentGlasses - 1;
      setCurrentGlasses(next);
      if (onLogWaterGlass) {
        onLogWaterGlass(-1);
      }
    }
  };

  const handleSaveAll = () => {
    const updatedConfig: DailyReminderConfig = {
      ...existingReminders,
      enabled: true,
      soundEnabled,
      browserNotifications: browserNotifs,
      mealsEnabled: true,
      mealSlots,
      hydration: {
        enabled: waterEnabled,
        dailyTargetGlasses: waterTarget,
        intervalMinutes: waterInterval,
        startTime: '07:00',
        endTime: '21:00',
        soundEnabled,
      },
    };

    onUpdateProfile({
      ...profile,
      dailyReminders: updatedConfig,
    });

    setJustSaved(true);
    setTimeout(() => {
      setJustSaved(false);
      onClose();
    }, 1200);
  };

  const testMealChime = () => {
    playMealChime();
    sendBrowserNotification('Kikumbusho cha Mlo - AfyaLishe', 'Muda wa chakula cha mchana umewadia! Kumbuka ugali ngumi 1 na mboga nusu sahani.');
  };

  const testWaterChime = () => {
    playWaterChime();
    sendBrowserNotification('Kikumbusho cha Maji - AfyaLishe', 'Kunywa glasi 1 ya maji safi na salama kulinda figo na mishipa yako ya damu!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/80 backdrop-blur-sm overflow-y-auto" id="meal-water-reminder-modal">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-400/30">
              <Bell className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Vikumbusho vya Ulaji na Unywaji Maji</h2>
              <p className="text-xs text-teal-200/80">Weka kengele na ratiba ya ulaji kwa wakati sahihi na unywaji wa maji ya kutosha.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Funga"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Tabs: Ulaji wa Chakula vs Unywaji wa Maji */}
        <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('meals')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'meals'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Utensils className="w-4 h-4 text-emerald-600" />
            <span>Vikumbusho vya Chakula ({mealSlots.filter(m => m.enabled).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('water')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'water'
                ? 'bg-white text-sky-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Droplets className="w-4 h-4 text-sky-600" />
            <span>Kikumbusho cha Maji ({currentGlasses}/{waterTarget} Glasi)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Tab 1: Meal Slots & Schedule */}
          {activeTab === 'meals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Milo na Saa Zilizopangwa</h3>
                  <p className="text-xs text-slate-500">Bofya kengele kuwasha/kuzima na weka tiki ya 'Nimekula' baada ya kumaliza mlo.</p>
                </div>
                <button
                  type="button"
                  onClick={testMealChime}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Sikiliza mlio wa chakula"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Pima Mlio</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {mealSlots.map((meal) => (
                  <div
                    key={meal.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      meal.enabled
                        ? meal.completedToday
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : 'bg-white border-slate-200 shadow-xs'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleMeal(meal.id)}
                        className={`mt-0.5 p-2 rounded-xl transition-colors cursor-pointer ${
                          meal.enabled ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                        }`}
                        title={meal.enabled ? 'Zima kikumbusho' : 'Washa kikumbusho'}
                      >
                        <Bell className="w-3.5 h-3.5" />
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs font-black text-slate-900">{meal.name}</strong>
                          {meal.completedToday && (
                            <span className="text-[10px] bg-emerald-200 text-emerald-800 font-extrabold px-2 py-0.2 rounded-full">
                              Umekula ✓
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">{meal.notes}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-xl">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <input
                          type="time"
                          value={meal.time}
                          onChange={(e) => handleMealTimeChange(meal.id, e.target.value)}
                          className="bg-transparent text-xs font-black text-slate-800 focus:outline-none cursor-pointer"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleMealCompleted(meal.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          meal.completedToday
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{meal.completedToday ? 'Nimekula' : 'Weka Tiki'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Water Reminder & Tracker */}
          {activeTab === 'water' && (
            <div className="space-y-5">
              
              {/* Water Progress Visual Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-sky-100 uppercase tracking-wider block">Maendeleo ya Leo</span>
                  <h3 className="text-3xl font-black">{currentGlasses} / {waterTarget} Glasi</h3>
                  <p className="text-xs text-sky-100">Takriban {currentGlasses * 250} ml kati ya {waterTarget * 250} ml (Lita {(waterTarget * 250) / 1000})</p>
                </div>

                {/* Quick Add / Minus Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleMinusGlass}
                    disabled={currentGlasses <= 0}
                    className="w-11 h-11 rounded-2xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-black transition-all disabled:opacity-40 cursor-pointer"
                    title="Punguza glasi 1"
                  >
                    <Minus className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleAddGlass}
                    className="px-5 py-3 rounded-2xl bg-white text-sky-950 hover:bg-sky-50 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                    id="btn-add-water-glass"
                  >
                    <Plus className="w-4 h-4 text-sky-600" />
                    <span>+1 Glasi ya Maji</span>
                  </button>
                </div>
              </div>

              {/* Water Settings */}
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="text-xs font-extrabold text-slate-900 block">Kikumbusho cha Mara kwa Mara</strong>
                    <span className="text-[11px] text-slate-500">Mlio utalia kukukumbusha kunywa maji ukiwa na simu au kompyuta yako.</span>
                  </div>
                  <button
                    type="button"
                    onClick={testWaterChime}
                    className="px-3 py-1.5 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Pima Mlio wa Tone</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">Lengo la Glasi kwa Siku:</label>
                    <div className="flex items-center gap-2">
                      {[6, 8, 10, 12].map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setWaterTarget(g)}
                          className={`flex-1 py-2 rounded-xl font-bold border transition-colors cursor-pointer ${
                            waterTarget === g ? 'bg-sky-600 text-white border-sky-600 shadow-xs' : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          {g} Glasi
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">Muda Kati ya Kila Kikumbusho:</label>
                    <div className="flex items-center gap-2">
                      {[
                        { label: 'Kila Saa 1', mins: 60 },
                        { label: 'Kila Saa 1.5', mins: 90 },
                        { label: 'Kila Masaa 2', mins: 120 },
                      ].map(int => (
                        <button
                          key={int.mins}
                          type="button"
                          onClick={() => setWaterInterval(int.mins)}
                          className={`flex-1 py-2 rounded-xl font-bold border transition-colors cursor-pointer ${
                            waterInterval === int.mins ? 'bg-sky-600 text-white border-sky-600 shadow-xs' : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          {int.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sound & System Notification Toggles */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Ruhusu Milio ya Kengele (Audio Chimes)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
              <input
                type="checkbox"
                checked={browserNotifs}
                onChange={(e) => setBrowserNotifs(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Arifa za Kivinjari (Browser Push Notifications)</span>
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            {justSaved ? '✅ Mipangilio imehifadhiwa vizuri!' : 'Vikumbusho hufanya kazi kiotomatiki ukiwa kwenye mfumo.'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
            >
              Funga
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md cursor-pointer"
              id="btn-save-reminders"
            >
              Hifadhi Ratiba
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
