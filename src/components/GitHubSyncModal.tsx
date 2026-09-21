import React, { useState, useEffect } from 'react';
import { 
  GitBranch, GitCommit, GitPullRequest, ExternalLink, 
  CheckCircle2, AlertCircle, Copy, Check, RefreshCw, 
  ArrowRight, ShieldCheck, Terminal, UploadCloud, X
} from 'lucide-react';

interface GitHubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GitStatusData {
  branch: string;
  hasUncommittedChanges: boolean;
  changedFiles: string[];
  lastCommit: string;
  remotes: string;
}

export const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({ isOpen, onClose }) => {
  const [repoUrl, setRepoUrl] = useState(() => {
    return localStorage.getItem('afyalishe_github_repo_url') || '';
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('afyalishe_github_token') || '';
  });
  const [commitMessage, setCommitMessage] = useState('Sasisho la AfyaLishe: Ufuatiliaji wa Maji na Udhibiti wa Nenosiri');
  const [branch, setBranch] = useState('main');

  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [statusData, setStatusData] = useState<GitStatusData | null>(null);
  const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const fetchStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch('/api/github/status');
      if (res.ok) {
        const data = await res.json();
        setStatusData(data);
        if (data.branch) setBranch(data.branch);
      }
    } catch (err) {
      console.error('Failed to fetch git status:', err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setResultMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) {
      setResultMessage({
        type: 'error',
        text: 'Tafadhali weka anwani ya GitHub Repository (URL).',
      });
      return;
    }

    setIsPushing(true);
    setResultMessage(null);

    // Save repo url for convenience
    localStorage.setItem('afyalishe_github_repo_url', repoUrl.trim());
    if (token.trim()) {
      localStorage.setItem('afyalishe_github_token', token.trim());
    }

    try {
      const res = await fetch('/api/github/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl: repoUrl.trim(),
          personalAccessToken: token.trim(),
          commitMessage: commitMessage.trim(),
          branch: branch.trim() || 'main',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Imeshindikana kuwasilisha kwenye GitHub');
      }

      setResultMessage({
        type: 'success',
        text: data.message || 'Msimbo umewasilishwa kwa ufanisi kwenye GitHub!',
      });
      fetchStatus();
    } catch (err: any) {
      setResultMessage({
        type: 'error',
        text: err.message || 'Hitilafu ya kuunganisha na GitHub',
      });
    } finally {
      setIsPushing(false);
    }
  };

  const manualCommands = [
    `git remote add origin ${repoUrl || 'https://github.com/USERNAME/afyalishe.git'}`,
    `git branch -M main`,
    `git add .`,
    `git commit -m "${commitMessage || 'Sasisho la AfyaLishe'}"`,
    `git push -u origin main`,
  ];

  const handleCopyCommand = (cmd: string, idx: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
              <UploadCloud className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black tracking-tight">Wasilisha Kwenye GitHub</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Git Sync
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Tuma msimbo wa AfyaLishe moja kwa moja kwenye akaunti yako ya GitHub
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Git Status Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-slate-700" />
                Hali ya Git ya Mradi:
              </span>
              <button
                type="button"
                onClick={fetchStatus}
                disabled={isLoadingStatus}
                className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStatus ? 'animate-spin' : ''}`} />
                <span>Sasisha</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Branch ya Sasa</span>
                <span className="font-extrabold text-slate-800 font-mono">
                  {statusData?.branch || 'main'}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Commit ya Mwisho</span>
                <span className="font-medium text-slate-700 truncate block font-mono text-[11px]">
                  {statusData?.lastCommit || 'Inapakia...'}
                </span>
              </div>
            </div>

            {statusData && (
              <div className="text-[11px] text-slate-600 flex items-center gap-2 pt-1">
                {statusData.hasUncommittedChanges ? (
                  <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold border border-amber-200">
                    Faili {statusData.changedFiles.length} zinasubiri kuhifadhiwa na kuwasilishwa
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Faili zote ziko tayari kutumwa
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Push Form */}
          <form onSubmit={handlePush} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Anwani ya GitHub Repository (URL) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  required
                  placeholder="https://github.com/username/afyalishe.git"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Unda repo tupu kwenye <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-teal-600 underline font-semibold">github.com/new</a> kisha nakili anwani yake hapa.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">
                  GitHub Personal Access Token (PAT)
                </label>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-teal-600 hover:text-teal-700 font-semibold inline-flex items-center gap-1"
                >
                  <span>Tengeneza Token</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (au GitHub Token)"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 font-mono"
              />
              <p className="text-[11px] text-slate-500">
                Inahitajika kwa GitHub ili kuruhusu kompyuta au chombo kuweka msimbo (Push with write permissions).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Ujumbe wa Mabadiliko (Commit Message)
                </label>
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Branch
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 font-mono"
                />
              </div>
            </div>

            {/* Notification alert */}
            {resultMessage && (
              <div
                className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 ${
                  resultMessage.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border border-rose-200 text-rose-900'
                }`}
              >
                {resultMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 font-medium leading-relaxed break-words">
                  {resultMessage.text}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isPushing}
                className="flex-1 py-3 px-5 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-extrabold text-xs transition-all shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isPushing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Inatuma kwenye GitHub...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Wasilisha Kwenye GitHub Sasa</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Direct Terminal Commands Reference */}
          <div className="border-t border-slate-200 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-slate-500" />
                Amri za Terminal (Manual Push):
              </span>
              <span className="text-[11px] text-slate-400">Bofya amri kunakili</span>
            </div>

            <div className="bg-slate-900 rounded-2xl p-3.5 space-y-2 font-mono text-[11px] text-slate-200">
              {manualCommands.map((cmd, idx) => (
                <div
                  key={idx}
                  onClick={() => handleCopyCommand(cmd, idx)}
                  className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer group"
                >
                  <span className="text-teal-400 select-all">$ {cmd}</span>
                  <span className="text-slate-400 group-hover:text-white flex items-center gap-1 text-[10px]">
                    {copiedIndex === idx ? (
                      <span className="text-emerald-400 flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Imenakiliwa
                      </span>
                    ) : (
                      <Copy className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Google AI Studio pia inakuwezesha ku-export GitHub moja kwa moja kutoka kwenye menyu ya mipangilio.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors cursor-pointer"
          >
            Funga
          </button>
        </div>
      </div>
    </div>
  );
};
