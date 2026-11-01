import React, { useState } from 'react';
import { Terminal, Copy, Check, Download, Apple } from 'lucide-react';
import { BuildConfig } from './BuildConfiguration';

interface LocalTerminalHelperProps {
  config: BuildConfig;
  gameFolder?: string;
  keysPath?: string;
}

export const LocalTerminalHelper: React.FC<LocalTerminalHelperProps> = ({
  config,
  gameFolder = '~/Games/SwitchGame',
  keysPath = '~/keys/prod.keys',
}) => {
  const [copied, setCopied] = useState(false);

  const command = `# 1. Clone NXNative & install build requirements (run once)
git clone https://github.com/seedds/nxnative.git && cd nxnative
xcodebuild -downloadComponent MetalToolchain
brew install xcodegen zstd glslang
brew install --cask dotnet-sdk
python3 -m pip install lz4 "capstone>=5,<6" fonttools nsz zbic "backports.zstd; python_version < '3.14'"

# 2. Build Native Apple Silicon IPA for ${config.appName || 'your game'}
python3 scripts/build_ipa_from_nsp.py "${gameFolder}" \\
  -k "${keysPath}" \\
  --app-name "${config.appName || 'SwitchGame'}" \\
  --language "${config.language}" \\
  ${config.showFps ? '--show-fps \\' : ''}
  ${config.platform === 'mac-app' ? '--platform mac-app \\' : ''}
  -o ./build/
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadScript = () => {
    const blob = new Blob([command], { type: 'text/x-sh' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `build_${(config.appName || 'nxnative').replace(/\s+/g, '_')}.sh`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 rounded-2xl bg-[#141724] border border-gray-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Apple className="w-5 h-5 text-gray-200" />
            <h3 className="text-base font-semibold text-white">
              Local Mac CLI Runner (Offline Build)
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Prefer compiling on your own Apple Silicon Mac? Copy the pre-configured terminal commands below.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={downloadScript}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .sh</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Script'}</span>
          </button>
        </div>
      </div>

      <div className="relative rounded-xl bg-black/60 border border-gray-800 p-4 font-mono text-xs text-gray-300 overflow-x-auto">
        <pre className="leading-relaxed">{command}</pre>
      </div>
    </div>
  );
};
