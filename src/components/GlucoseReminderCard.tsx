import React, { useState } from 'react';
import { 
  Bell, BellOff, Clock, Volume2, VolumeX, ShieldCheck, 
  Sparkles, Check, ChevronDown, ChevronUp, AlertCircle, Smartphone
} from 'lucide-react';
import { DailyReminderConfig, UserProfile } from '../types';
import { playReminderChime, requestNotificationPermission, sendBrowserNotification } from '../utils/reminderSound';

interface GlucoseReminderCardProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onOpenGlucoseModal: () => void;
}

export const GlucoseReminderCard: React.FC<GlucoseReminderCardProps> = ({
  profile,
  onUpdateProfile,
  onOpenGlucoseModal,
}) => {
  const currentConfig: DailyReminderConfig = profile.dailyReminders || {
    enabled: true,
    morningTime: '07:30',
    morningEnabled: true,
    afternoonTime: '13:30',
    afternoonEnabled: true,
    eveningTime: '20:00',
    eveningEnabled: true,
    browserNotifications: false,
    soundEnabled: true,
  };

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [testNotificationSent, setTestNotificationSent] = useState<boolean>(false);

  // Toggle master reminder switch
  const handleToggleMaster = async (checked: boolean) => {
    const updated: UserProfile = {
      ...profile,
      dailyReminders: {
        ...currentConfig,
        enabled: checked,
      },
    };
    onUpdateProfile(updated);

    if (checked) {
      playReminderChime();
    }
  };

  // Toggle Browser Notifications
  const handleToggleBrowserNotif = async (checked: boolean) => {
    if (checked) {
      const granted = await requestNotificationPermission();
      const updated: UserProfile = {
        ...profile,
        dailyReminders: {
          ...currentConfig,
          browserNotifications: granted,
        },
      };
      onUpdateProfile(updated);
      if (granted) {
        sendBrowserNotification(
          '🔔 Arifa za Sukari Zimewashwa!',
          'Utapokea vikumbusho vya kila siku vya kupima sukari ya damu kwa wakati uliopanga.',
          onOpenGlucoseModal
        );
      }
    } else {
      const updated: UserProfile = {
        ...profile,
        dailyReminders: {
          ...currentConfig,
          browserNotifications: false,
        },
      };
      onUpdateProfile(updated);
    }
  };

  // Update specific reminder time
  const handleUpdateTime = (
    field: 'morningTime' | 'afternoonTime' | 'eveningTime',
    value: string
  ) => {
    const updated: UserProfile = {
      ...profile,
      dailyReminders: {
        ...currentConfig,
        [field]: value,
      },
    };
    onUpdateProfile(updated);
  };

  // Toggle individual slot
  const handleToggleSlot = (
    field: 'morningEnabled' | 'afternoonEnabled' | 'eveningEnabled',
    checked: boolean
  ) => {
    const updated: UserProfile = {
      ...profile,
      dailyReminders: {
        ...currentConfig,
        [field]: checked,
      },
    };
    onUpdateProfile(updated);
  };

  // Toggle Sound
  const handleToggleSound = (checked: boolean) => {
    const updated: UserProfile = {
      ...profile,
      dailyReminders: {
        ...currentConfig,
        soundEnabled: checked,
      },
    };
    onUpdateProfile(updated);
    if (checked) {
      playReminderChime();
    }
  };

  // Test Reminder Trigger
  const handleTestReminder = () => {
    if (currentConfig.soundEnabled) {
      playReminderChime();
    }
    if (currentConfig.browserNotifications) {
      sendBrowserNotification(
        '🔔 Jaribio la Kikumbusho cha Sukari',
        'Habari ' + profile.name + ', huu ni mfano wa kikumbusho chako cha kupima sukari ya damu.',
        onOpenGlucoseModal
      );
    }
    setTestNotificationSent(true);
    setTimeout(() => setTestNotificationSent(false), 3500);
  };

  return (
    <div className="bg-gradient-to-r from-rose-50/80 via-amber-50/60 to-slate-50 border border-rose-200/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
      {/* Top Banner: Master Switch & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
              currentConfig.enabled
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'bg-slate-200 text-slate-500'
            }`}
          >
            {currentConfig.enabled ? <Bell className="w-6 h-6 animate-pulse" /> : <BellOff className="w-6 h-6" />}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-extrabold text-slate-900 text-base">
                Vikumbusho vya Kila Siku vya Kupima Sukari
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                  currentConfig.enabled
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : 'bg-slate-100 text-slate-600 border-slate-300'
                }`}
              >
                {currentConfig.enabled ? 'Vimewashwa (Active)' : 'Vimezimwa (Off)'}
              </span>
            </div>
            <p className="text-xs text-slate-600 max-w-xl">
              {currentConfig.enabled
                ? 'Utapokea kengele na arifa za kukukumbusha kupima sukari ya asubuhi (Fasting), mchana na kabla ya kulala.'
                : 'Washa vikumbusho ili usisahau kurekodi sukari kabla na baada ya milo kwa udhibiti bora wa kisukari.'}
            </p>
          </div>
        </div>

        {/* Master Switch & Toggle Dropdown */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <label className="relative inline-flex items-center cursor-pointer" id="toggle-glucose-reminders">
            <input
              type="checkbox"
              checked={currentConfig.enabled}
              onChange={(e) => handleToggleMaster(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
          </label>

          {currentConfig.enabled && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold flex items-center gap-1 transition-colors"
              title="Rekebisha Ratiba ya Saa"
            >
              <span>Ratiba</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Scheduling & Preferences */}
      {currentConfig.enabled && (
        <div className={`space-y-4 pt-3 border-t border-rose-200/60 ${isExpanded ? 'block' : 'hidden sm:block'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Morning Slot */}
            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                currentConfig.morningEnabled
                  ? 'bg-white border-rose-200 shadow-2xs'
                  : 'bg-slate-100/70 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs font-bold text-slate-800">Asubuhi (Fasting)</span>
                </div>
                <input
                  type="checkbox"
                  checked={currentConfig.morningEnabled}
                  onChange={(e) => handleToggleSlot('morningEnabled', e.target.checked)}
                  className="w-3.5 h-3.5 text-rose-600 rounded cursor-pointer"
                />
              </div>
              <input
                type="time"
                value={currentConfig.morningTime}
                disabled={!currentConfig.morningEnabled}
                onChange={(e) => handleUpdateTime('morningTime', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Kabla ya chai au kifungua kinywa</span>
            </div>

            {/* Afternoon Slot */}
            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                currentConfig.afternoonEnabled
                  ? 'bg-white border-rose-200 shadow-2xs'
                  : 'bg-slate-100/70 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span className="text-xs font-bold text-slate-800">Mchana (Post-Lunch)</span>
                </div>
                <input
                  type="checkbox"
                  checked={currentConfig.afternoonEnabled}
                  onChange={(e) => handleToggleSlot('afternoonEnabled', e.target.checked)}
                  className="w-3.5 h-3.5 text-rose-600 rounded cursor-pointer"
                />
              </div>
              <input
                type="time"
                value={currentConfig.afternoonTime}
                disabled={!currentConfig.afternoonEnabled}
                onChange={(e) => handleUpdateTime('afternoonTime', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Masaa 2 baada ya chakula cha mchana</span>
            </div>

            {/* Evening Slot */}
            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                currentConfig.eveningEnabled
                  ? 'bg-white border-rose-200 shadow-2xs'
                  : 'bg-slate-100/70 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-800">Usiku (Bedtime)</span>
                </div>
                <input
                  type="checkbox"
                  checked={currentConfig.eveningEnabled}
                  onChange={(e) => handleToggleSlot('eveningEnabled', e.target.checked)}
                  className="w-3.5 h-3.5 text-rose-600 rounded cursor-pointer"
                />
              </div>
              <input
                type="time"
                value={currentConfig.eveningTime}
                disabled={!currentConfig.eveningEnabled}
                onChange={(e) => handleUpdateTime('eveningTime', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Kabla ya kulala usiku</span>
            </div>
          </div>

          {/* Additional Preferences: Sound, Browser Push, & Test Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              {/* Sound toggle */}
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold">
                <input
                  type="checkbox"
                  checked={currentConfig.soundEnabled}
                  onChange={(e) => handleToggleSound(e.target.checked)}
                  className="w-3.5 h-3.5 text-rose-600 rounded"
                />
                {currentConfig.soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-rose-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
                <span>Sauti ya Kengele (Chime Tone)</span>
              </label>

              {/* Browser Push toggle */}
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold">
                <input
                  type="checkbox"
                  checked={currentConfig.browserNotifications}
                  onChange={(e) => handleToggleBrowserNotif(e.target.checked)}
                  className="w-3.5 h-3.5 text-rose-600 rounded"
                />
                <Smartphone className="w-3.5 h-3.5 text-teal-600" />
                <span>Arifa za Kwenye Simu / Kivinjari</span>
              </label>
            </div>

            {/* Test Reminder Action */}
            <button
              type="button"
              onClick={handleTestReminder}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 active:scale-98 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all"
            >
              {testNotificationSent ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Bell className="w-3.5 h-3.5" />}
              <span>{testNotificationSent ? 'Kikumbusho Kimepigwa!' : 'Jaribu Kengele ya Majaribio'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
