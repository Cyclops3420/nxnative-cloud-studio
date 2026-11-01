import React, { useState } from 'react';
import { PackageOpen, Download, Loader2, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { packageBrowserIpa } from '@/lib/ipa-generator';
import { BuildConfig } from './BuildConfiguration';
import { SwitchFileMetadata } from '@/lib/switch-parser';

interface HomebrewInstantBuilderProps {
  config: BuildConfig;
  files: { file: File; meta: SwitchFileMetadata }[];
  isLegalAccepted: boolean;
  onOpenLegal: () => void;
}

export const HomebrewInstantBuilder: React.FC<HomebrewInstantBuilderProps> = ({
  config,
  files,
  isLegalAccepted,
  onOpenLegal,
}) => {
  const [isBuilding, setIsBuilding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState('');

  const targetFile = files.find((f) => f.meta.category === 'Homebrew App') || files[0];

  const handleBuild = async () => {
    if (!isLegalAccepted) {
      onOpenLegal();
      return;
    }

    setIsBuilding(true);
    setProgress(5);
    setStatusText('Preparing IPA container...');

    try {
      const blob = await packageBrowserIpa({
        appName: config.appName || 'NXHomebrew',
        bundleId: config.bundleId || 'org.nxnative.homebrew',
        version: '1.0.0',
        gameFile: targetFile?.file,
        onProgress: (pct, msg) => {
          setProgress(pct);
          setStatusText(msg);
        },
      });

      const url = URL.createObjectURL(blob);
      const safeName = (config.appName || 'NXHomebrew').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${safeName}_NXNative_Unsigned.ipa`;

      setDownloadUrl(url);
      setDownloadFileName(filename);
      setProgress(100);
      setStatusText('Complete! Click below to download.');
    } catch (err: any) {
      console.error('Packaging error:', err);
      setStatusText('Error packaging IPA: ' + (err.message || 'Unknown error'));
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-[#141724] border border-gray-800 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <PackageOpen className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-semibold text-white">
              Instant In-Browser IPA Packager (Homebrew / Client Mode)
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
              100% Client-Side
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Packages Homebrew executables (.nro) and assets directly into an iOS IPA wrapper inside your browser using WebAssembly & JSZip. Zero external servers.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#0f111a] border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-gray-200">
            Selected Payload: <span className="font-mono text-purple-300">{targetFile?.file.name || 'Sample Homebrew Template'}</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Bundles Info.plist, Mach-O ARM64 launch stub, Horizon HLE configuration, and RomFS.
          </p>
        </div>

        <button
          type="button"
          onClick={handleBuild}
          disabled={isBuilding}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
            isBuilding
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-900/30 cursor-pointer'
          }`}
        >
          {isBuilding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>{isBuilding ? 'Generating IPA...' : 'Build IPA in Browser Now'}</span>
        </button>
      </div>

      {/* Progress & Result */}
      {progress > 0 && (
        <div className="space-y-3 p-4 rounded-xl bg-[#0f111a] border border-gray-800">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-300 font-mono">{statusText}</span>
              <span className="text-purple-400 font-semibold">{progress}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {downloadUrl && (
            <div className="pt-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>IPA generated successfully!</span>
              </div>

              <a
                href={downloadUrl}
                download={downloadFileName}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download {downloadFileName}</span>
              </a>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 text-[11px] text-gray-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>No files uploaded to Vercel. 100% local browser packaging.</span>
      </div>
    </div>
  );
};
