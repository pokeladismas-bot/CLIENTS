import React, { useState } from 'react';
import { 
  Download, Smartphone, Monitor, Apple, Check, Copy, 
  Sparkles, ShieldCheck, X, ChevronRight, Zap, RefreshCw, ExternalLink
} from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';

interface AppInstallerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: 'admin' | 'practitioner' | 'patient';
  userName?: string;
}

export const AppInstallerModal: React.FC<AppInstallerModalProps> = ({
  isOpen,
  onClose,
  userRole = 'practitioner',
  userName,
}) => {
  const { isInstallable, isInstalled, promptInstall, hasNativePrompt } = usePwaInstall();
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeDeviceTab, setActiveDeviceTab] = useState<'desktop' | 'android' | 'ios'>('desktop');
  const [isInstalling, setIsInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [installNotice, setInstallNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const appUrl = window.location.origin;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    setInstallNotice('Kiungo cha App kimenakiliwa! Fungua kwenye Chrome au Safari na uchague "Install" au "Add to Home Screen".');
    setTimeout(() => {
      setCopiedLink(false);
    }, 2500);
  };

  const handleDirectInstall = async () => {
    setIsInstalling(true);
    setInstallNotice(null);

    // If native prompt is available, trigger it
    if (hasNativePrompt) {
      const success = await promptInstall();
      setIsInstalling(false);
      if (success) {
        setInstallSuccess(true);
        setInstallNotice('Hongera! App ya AfyaLishe imesakinishwa kikamilifu kwenye kifaa chako!');
        setTimeout(() => {
          setInstallSuccess(false);
          onClose();
        }, 2000);
        return;
      }
    }

    // If running in browser where native prompt is pending or user is on iOS / desktop browser menu
    setTimeout(() => {
      setIsInstalling(false);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);

      if (isIOS) {
        setActiveDeviceTab('ios');
        setInstallNotice('Kwenye iPhone/iPad: Bofya kitufe cha Kushare (Share) chini katikati ya Safari ➔ kisha chagua "Ongeza kwenye Skrini ya Mwanzo" (Add to Home Screen).');
      } else if (isAndroid) {
        setActiveDeviceTab('android');
        setInstallNotice('Kwenye Simu ya Android: Bofya nukta tatu (⋮) juu kulia mwa Chrome ➔ chagua "Sakinisha App" (Install App).');
      } else {
        setActiveDeviceTab('desktop');
        setInstallNotice('Kwenye Kompyuta: Angalia alama ya Kompyuta / Mshale (+) kwenye upau wa anwani (URL bar) juu kulia na ubofye "Sakinisha / Install"!');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Kusakinisha App ya Kliniki (PWA)</span>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Sakinisha Mfumo kwenye Kifaa
              </h2>
              <p className="text-xs text-emerald-200/90 mt-1 leading-relaxed">
                {userRole === 'admin' 
                  ? 'Kama Msimamizi Mkuu, sakinisha mfumo kwenye kompyuta au simu yako ya kliniki kwa usimamizi rahisi na wa haraka bila browser bar.'
                  : 'Kama Mtaalamu wa Lishe, sakinisha mfumo huu kwenye kompyuta au kishikwambi chako kwa ajili ya kuwahudumia wagonjwa papo hapo.'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Quick Install Action Cards */}
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-emerald-950">Kitufe cha Kusakinisha Papo Hapo</div>
                    <div className="text-[11px] text-emerald-800">Bofya kitufe kuanza kusakinisha kwenye kifaa hiki</div>
                  </div>
                </div>
                {hasNativePrompt ? (
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                    Tayari (Ready)
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                    Kivinjari / Browser
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  id="btn-trigger-pwa-install"
                  onClick={handleDirectInstall}
                  disabled={isInstalling}
                  className="py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>{isInstalling ? 'Inasakinisha...' : '📲 Sakinisha App Sasa'}</span>
                </button>

                <button
                  type="button"
                  id="btn-copy-install-link"
                  onClick={handleCopyLink}
                  className="py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                  <span>{copiedLink ? 'Kiungo Kimenakiliwa!' : '🔗 Nakili Kiungo cha App'}</span>
                </button>
              </div>

              {installNotice && (
                <div className="p-2.5 rounded-xl bg-teal-900/10 border border-teal-600/30 text-[11px] text-teal-950 font-medium flex items-center gap-2 animate-in fade-in">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{installNotice}</span>
                </div>
              )}
            </div>
          </div>

          {/* Benefits summary */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="w-7 h-7 mx-auto rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1.5 font-bold">
                ⚡
              </div>
              <div className="text-[11px] font-black text-slate-800">Kasi Kubwa</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Hufunguka papo hapo</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="w-7 h-7 mx-auto rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-1.5 font-bold">
                🔒
              </div>
              <div className="text-[11px] font-black text-slate-800">Ulinzi wa Data</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Hakuna URL bar au ads</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="w-7 h-7 mx-auto rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-1.5 font-bold">
                📱
              </div>
              <div className="text-[11px] font-black text-slate-800">App Halisi</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Desktop & Simu</div>
            </div>
          </div>

          {/* Step-by-Step Instructions by Device */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Maelekezo ya Kusakinisha Kulingana na Kifaa:</span>
            </div>

            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveDeviceTab('desktop')}
                className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeDeviceTab === 'desktop'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Monitor className="w-3.5 h-3.5 text-blue-600" />
                <span>Kompyuta / PC</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDeviceTab('android')}
                className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeDeviceTab === 'android'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Android</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDeviceTab('ios')}
                className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeDeviceTab === 'ios'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Apple className="w-3.5 h-3.5 text-slate-800" />
                <span>iPhone / iPad</span>
              </button>
            </div>

            {/* Device Instructions Body */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2.5">
              {activeDeviceTab === 'desktop' && (
                <>
                  <div className="font-black text-slate-800 flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-blue-600" />
                    <span>Usakinishaji kwenye Chrome, Edge au Brave (Windows / Mac):</span>
                  </div>
                  <ol className="list-decimal pl-5 space-y-1.5 text-slate-600">
                    <li>Kwenye upau wa anwani (URL address bar), angalia upande wa kulia kwenye alama ya <strong>Kompyuta yenye mshale wa kupakua</strong> au <strong>(+)</strong>.</li>
                    <li>Bofya kitufe hicho kisha uchague <strong>"Sakinisha / Install"</strong>.</li>
                    <li>Vinginevyo, bonyeza nukta tatu za kivinjari (<strong>⋮</strong> juu kulia) ➔ chagua <strong>"Sakinisha AfyaLishe"</strong> au <strong>"Hifadhi na Shiriki ➔ Sakinisha"</strong>.</li>
                    <li>Programu itawekwa kwenye Desktop na Start Menu ya kompyuta yako papo hapo.</li>
                  </ol>
                </>
              )}

              {activeDeviceTab === 'android' && (
                <>
                  <div className="font-black text-slate-800 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>Usakinishaji kwenye Simu au Tablet ya Android:</span>
                  </div>
                  <ol className="list-decimal pl-5 space-y-1.5 text-slate-600">
                    <li>Fungua kiungo cha mfumo kwenye <strong>Google Chrome</strong>.</li>
                    <li>Bofya nukta tatu (<strong>⋮</strong>) zilizo juu kulia mwa skrini.</li>
                    <li>Chagua <strong>"Sakinisha App (Install App)"</strong> au <strong>"Ongeza kwenye Skrini ya Mwanzo (Add to Home screen)"</strong>.</li>
                    <li>Bonyeza <strong>Sakinisha</strong> ili icon ya AfyaLishe iwekwe kwenye skrini kuu ya simu yako.</li>
                  </ol>
                </>
              )}

              {activeDeviceTab === 'ios' && (
                <>
                  <div className="font-black text-slate-800 flex items-center gap-2">
                    <Apple className="w-4 h-4 text-slate-900" />
                    <span>Usakinishaji kwenye iPhone au iPad (Apple Safari):</span>
                  </div>
                  <ol className="list-decimal pl-5 space-y-1.5 text-slate-600">
                    <li>Fungua ukurasa huu kwenye kivinjari cha <strong>Safari</strong>.</li>
                    <li>Bofya kitufe cha <strong>Kushare (Share)</strong> kilicho chini katikati ya skrini (mraba wenye mshale unaoelekea juu).</li>
                    <li>Sogeza menyu chini kisha uchague <strong>"Ongeza kwenye Skrini ya Mwanzo" (Add to Home Screen)</strong>.</li>
                    <li>Bofya <strong>Ongeza (Add)</strong> juu kulia. Icon ya AfyaLishe itatokea kama App kamili ya iOS.</li>
                  </ol>
                </>
              )}
            </div>
          </div>

          {/* Share/Copy link for clinic staff */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-500 truncate">
              Kiungo cha Kusakinisha: <span className="font-mono text-slate-700">{appUrl}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="shrink-0 py-2 px-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Imenakiliwa!' : 'Nakili Kiungo'}</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>AfyaLishe PWA • Mfumo wa Kliniki Tanzania</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-all cursor-pointer"
          >
            Sawa, Nimeelewa
          </button>
        </div>

      </div>
    </div>
  );
};
