import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, AlertCircle, Loader2, Download, ExternalLink, HelpCircle, Server, Terminal, Lock } from 'lucide-react';
import { BuildConfig } from './BuildConfiguration';
import { KeysValidationResult } from '@/lib/keys-parser';
import { SwitchFileMetadata } from '@/lib/switch-parser';

interface GitHubActionsBuilderProps {
  config: BuildConfig;
  keysResult: KeysValidationResult | null;
  files: { file: File; meta: SwitchFileMetadata }[];
  isLegalAccepted: boolean;
  onOpenLegal: () => void;
}

export const GitHubActionsBuilder: React.FC<GitHubActionsBuilderProps> = ({
  config,
  keysResult,
  files,
  isLegalAccepted,
  onOpenLegal,
}) => {
  // Pre-linked to user's repository
  const repoOwner = 'Cyclops3420';
  const repoName = 'nxnative-cloud-studio';

  // Build execution state
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchError, setDispatchError] = useState<string | null>(null);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);
  
  // Polling state
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [runStatus, setRunStatus] = useState<string | null>(null); // 'queued' | 'in_progress' | 'completed'
  const [runConclusion, setRunConclusion] = useState<string | null>(null); // 'success' | 'failure'
  const [runHtmlUrl, setRunHtmlUrl] = useState<string | null>(null);
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [simulatedProgress, setSimulatedProgress] = useState<number | null>(null);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Poll workflow status
  useEffect(() => {
    if (!activeRunId || runStatus === 'completed' || isSimulating) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/github/status?runId=${activeRunId}`);
        const data = await res.json();
        if (data.found && data.run) {
          setRunStatus(data.run.status);
          setRunConclusion(data.run.conclusion);
          setRunHtmlUrl(data.run.html_url);
          if (data.artifacts && data.artifacts.length > 0) {
            setArtifacts(data.artifacts);
          }
        }
      } catch (err) {
        console.warn('Error polling GitHub status:', err);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [activeRunId, runStatus, isSimulating]);

  const handleDispatch = async () => {
    if (!isLegalAccepted) {
      onOpenLegal();
      return;
    }

    setIsDispatching(true);
    setDispatchError(null);
    setDispatchSuccess(null);

    try {
      const res = await fetch('/api/github/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prodKeys: keysResult?.rawText,
          inputs: {
            app_name: config.appName,
            bundle_id: config.bundleId,
            language: config.language,
            show_fps: config.showFps ? 'true' : 'false',
            platform: config.platform,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch GitHub workflow');
      }

      setDispatchSuccess(`Build successfully dispatched to ${repoOwner}/${repoName} macOS Apple Silicon runner!`);
      setRunStatus('queued');

      // Fetch the newly triggered run after a short delay
      setTimeout(async () => {
        try {
          const statusRes = await fetch(`/api/github/status`);
          const statusData = await statusRes.json();
          if (statusData.found && statusData.run) {
            setActiveRunId(statusData.run.id);
            setRunStatus(statusData.run.status);
            setRunHtmlUrl(statusData.run.html_url);
          }
        } catch (e) {
          console.warn('Failed initial run lookup:', e);
        }
      }, 3500);

    } catch (err: any) {
      setDispatchError(err.message || 'An error occurred while connecting to GitHub.');
    } finally {
      setIsDispatching(false);
    }
  };

  // Demo simulator for testing
  const handleSimulateBuild = () => {
    if (!isLegalAccepted) {
      onOpenLegal();
      return;
    }

    setIsSimulating(true);
    setRunStatus('in_progress');
    setRunConclusion(null);
    setSimulatedProgress(0);
    setSimulationLogs(['[NXNative Cloud] Initializing simulation pipeline...']);

    const steps = [
      { pct: 15, msg: 'Provisioning GitHub Actions macos-15 runner (Apple M-series Silicon, 14GB RAM)...' },
      { pct: 30, msg: 'Installed MetalToolchain, xcodegen, dotnet-sdk, and glslang.' },
      { pct: 50, msg: 'Setting up Python 3.12: lz4, capstone 5.0, fonttools, nsz, zbic ready.' },
      { pct: 65, msg: 'Loaded prod.keys: Verified header_key & 18 master keys.' },
      { pct: 80, msg: `Translating ARM64 NSO binaries -> Mach-O & Horizon HLE services for "${config.appName}"...` },
      { pct: 92, msg: 'Recompiling NVN shaders directly to Apple Metal Shading Language...' },
      { pct: 100, msg: 'Successfully packaged unsigned IPA! Ready for sideloading.' },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        const s = steps[currentStep];
        setSimulatedProgress(s.pct);
        setSimulationLogs((prev) => [...prev, s.msg]);
        currentStep++;
      } else {
        clearInterval(interval);
        setRunStatus('completed');
        setRunConclusion('success');
        setArtifacts([
          {
            id: 'simulated-artifact',
            name: `${config.appName.replace(/\s+/g, '_')}_Metal_Unsigned.ipa`,
            size_in_bytes: 48200000,
            archive_download_url: '#',
          },
        ]);
      }
    }, 1800);
  };

  return (
    <div className="p-6 rounded-2xl bg-[#141724] border border-gray-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-semibold text-white">
              Cloud Compiler (GitHub Actions macOS Runner)
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Pre-Linked
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Directly connected to repository: <a href={`https://github.com/${repoOwner}/${repoName}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-mono">{repoOwner}/{repoName}</a>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-gray-900 border border-gray-800 text-gray-300">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Password Protected</span>
          </span>
          <a
            href={`https://github.com/${repoOwner}/${repoName}/actions`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>GitHub Actions Hub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleDispatch}
          disabled={isDispatching || runStatus === 'in_progress'}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all ${
            isDispatching || runStatus === 'in_progress'
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-900/30 cursor-pointer'
          }`}
        >
          {isDispatching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          <span>{isDispatching ? 'Dispatching to GitHub...' : `Trigger Cloud Build on ${repoOwner}/${repoName}`}</span>
        </button>

        <button
          type="button"
          onClick={handleSimulateBuild}
          disabled={isSimulating && runStatus === 'in_progress'}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium bg-[#1e2233] hover:bg-[#252a3d] text-gray-200 border border-gray-700 transition-colors"
        >
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
          <span>Simulate Runner Pipeline (Demo Mode)</span>
        </button>
      </div>

      {/* Errors or Notices */}
      {dispatchError && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{dispatchError}</span>
        </div>
      )}

      {dispatchSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>{dispatchSuccess}</span>
        </div>
      )}

      {/* Live Pipeline Monitor */}
      {runStatus && (
        <div className="p-5 rounded-xl bg-[#0f111a] border border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${
                runStatus === 'in_progress' ? 'bg-amber-400 animate-ping' :
                runConclusion === 'success' ? 'bg-emerald-400' :
                runConclusion === 'failure' ? 'bg-red-400' : 'bg-blue-400 animate-pulse'
              }`} />
              <span className="text-sm font-semibold text-white capitalize">
                Status: {runStatus.replace('_', ' ')}
              </span>
              {runConclusion && (
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                  runConclusion === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  {runConclusion.toUpperCase()}
                </span>
              )}
            </div>

            {runHtmlUrl && (
              <a
                href={runHtmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300"
              >
                <span>View Live Logs on GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Progress bar */}
          {simulatedProgress !== null && (
            <div className="space-y-1.5">
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${simulatedProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>Progress: {simulatedProgress}%</span>
                <span>Runner: macOS Apple Silicon M2</span>
              </div>
            </div>
          )}

          {/* Log Stream Output */}
          {simulationLogs.length > 0 && (
            <div className="p-3 bg-black/60 rounded-lg max-h-40 overflow-y-auto font-mono text-[11px] text-gray-300 space-y-1 border border-gray-800/80">
              {simulationLogs.map((log, i) => (
                <p key={i} className="text-emerald-400/90 leading-relaxed font-mono">
                  {log}
                </p>
              ))}
            </div>
          )}

          {/* Output Artifacts */}
          {artifacts.length > 0 && (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold text-sm">Compiled IPA Artifact Ready!</span>
              </div>

              {artifacts.map((art) => (
                <div
                  key={art.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-emerald-500/20"
                >
                  <div>
                    <p className="text-xs font-mono font-medium text-white">{art.name}</p>
                    <p className="text-[11px] text-gray-400">
                      Unsigned iOS IPA • Ready for Sideloading (AltStore / Sideloadly)
                    </p>
                  </div>

                  <a
                    href={art.archive_download_url}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download IPA</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
