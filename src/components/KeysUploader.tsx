import React, { useRef, useState } from 'react';
import { KeyRound, ShieldCheck, AlertCircle, FileText, CheckCircle2, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { parseProdKeys, KeysValidationResult } from '@/lib/keys-parser';

interface KeysUploaderProps {
  keysResult: KeysValidationResult | null;
  onKeysParsed: (result: KeysValidationResult | null) => void;
  onSyncSuccess?: () => void;
}

export const KeysUploader: React.FC<KeysUploaderProps> = ({
  keysResult,
  onKeysParsed,
  onSyncSuccess,
}) => {
  const [showKeys, setShowKeys] = useState(false);
  const [isManualInput, setIsManualInput] = useState(false);
  const [manualText, setManualText] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processText = (text: string) => {
    const result = parseProdKeys(text);
    onKeysParsed(result);
  };

  const handleSyncToGitHub = async () => {
    if (!keysResult || !keysResult.rawText) return;

    setIsSyncing(true);
    setSyncStatus(null);
    setSyncError(null);

    try {
      const res = await fetch('/api/github/sync-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prodKeys: keysResult.rawText }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sync keys');
      }

      setSyncStatus('PROD_KEYS successfully synced to your GitHub Actions Secrets!');
      if (onSyncSuccess) onSyncSuccess();
    } catch (err: any) {
      setSyncError(err.message || 'Error syncing keys to GitHub Secrets');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const text = await file.text();
      processText(text);
    } catch (err) {
      console.error('Failed to read keys file:', err);
    }
  };

  const loadSampleKeysTemplate = () => {
    const sample = `# Generated Mock Keys for Verification
header_key = 00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff
key_area_key_application_source = 112233445566778899aabbccddeeff00
key_area_key_ocean_source = 2233445566778899aabbccddeeff0011
key_area_key_system_source = 33445566778899aabbccddeeff001122
titlekek_source = 445566778899aabbccddeeff00112233
master_key_00 = 5566778899aabbccddeeff0011223344
master_key_01 = 66778899aabbccddeeff001122334455
master_key_02 = 778899aabbccddeeff00112233445566
master_key_03 = 8899aabbccddeeff0011223344556677
master_key_04 = 99aabbccddeeff001122334455667788
master_key_05 = aabbccddeeff00112233445566778899
master_key_06 = bbccddeeff00112233445566778899aa
master_key_07 = ccddeeff00112233445566778899aabb
master_key_08 = ddeeff00112233445566778899aabbcc
master_key_09 = eeff00112233445566778899aabbccdd
master_key_10 = ff00112233445566778899aabbccddee
master_key_11 = 00112233445566778899aabbccddeeff
master_key_12 = 112233445566778899aabbccddeeff00
master_key_13 = 2233445566778899aabbccddeeff0011
master_key_14 = 33445566778899aabbccddeeff001122
master_key_15 = 445566778899aabbccddeeff00112233
master_key_16 = 5566778899aabbccddeeff0011223344
master_key_17 = 66778899aabbccddeeff001122334455
master_key_18 = 778899aabbccddeeff00112233445566
package1_key_00 = 8899aabbccddeeff0011223344556677
`;
    setManualText(sample);
    processText(sample);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-blue-500" />
            Decryption Keys (prod.keys)
          </h3>
          <p className="text-xs text-gray-400">
            Required by NXNative to decrypt game NCA headers and convert textures/shaders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!keysResult && (
            <button
              type="button"
              onClick={loadSampleKeysTemplate}
              className="px-2.5 py-1 text-xs rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors"
            >
              Load Sample Template
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsManualInput(!isManualInput)}
            className="px-2.5 py-1 text-xs rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-colors"
          >
            {isManualInput ? 'Upload File' : 'Paste Text'}
          </button>
        </div>
      </div>

      {!isManualInput ? (
        /* File upload zone */
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
            keysResult?.isValid
              ? 'border-emerald-500/60 bg-emerald-950/10'
              : 'border-gray-700/80 hover:border-gray-600 bg-[#12151f]/60 hover:bg-[#141824]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".keys,.txt,text/plain"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />

          <div className="flex flex-col items-center justify-center gap-1.5">
            <div className={`p-2.5 rounded-full ${
              keysResult?.isValid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
            }`}>
              <KeyRound className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-white">
              {keysResult?.isValid ? 'prod.keys Verified & Loaded' : 'Click to select prod.keys file'}
            </p>
            <p className="text-xs text-gray-400">
              Extracted from your Switch with Lockpick_RCM
            </p>
          </div>
        </div>
      ) : (
        /* Manual paste zone */
        <div className="space-y-2">
          <textarea
            rows={4}
            value={manualText}
            onChange={(e) => {
              setManualText(e.target.value);
              processText(e.target.value);
            }}
            placeholder="Paste your prod.keys content here (header_key = ..., master_key_00 = ...)"
            className="w-full font-mono text-xs p-3 rounded-xl bg-[#11131b] border border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>
      )}

      {/* Keys Status Badges */}
      {keysResult && (
        <div className="p-4 rounded-xl bg-[#151926] border border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${keysResult.isValid ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-sm font-semibold text-white">
                {keysResult.isValid ? 'Cryptographic Keys Ready' : 'Incomplete Key File'}
              </span>
              <span className="text-xs text-gray-400">({keysResult.totalKeys} keys detected)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowKeys(!showKeys)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 transition-colors"
              >
                {showKeys ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showKeys ? 'Hide' : 'Inspect'}</span>
              </button>
              <button
                type="button"
                onClick={() => onKeysParsed(null)}
                className="text-xs text-red-400 hover:text-red-300 ml-2"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className={`p-2 rounded-lg border flex items-center justify-between ${
              keysResult.hasHeaderKey ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}>
              <span>Header Key</span>
              {keysResult.hasHeaderKey ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            </div>

            <div className={`p-2 rounded-lg border flex items-center justify-between ${
              keysResult.hasKeyAreaKeys ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}>
              <span>Key Area Keys</span>
              {keysResult.hasKeyAreaKeys ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            </div>

            <div className={`p-2 rounded-lg border flex items-center justify-between ${
              keysResult.hasTitleKek ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}>
              <span>TitleKEK</span>
              {keysResult.hasTitleKek ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            </div>

            <div className={`p-2 rounded-lg border flex items-center justify-between ${
              keysResult.hasMasterKeys ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}>
              <span>Master Keys</span>
              <span className="font-mono">{keysResult.masterKeyCount} (up to v{keysResult.highestMasterKey})</span>
            </div>
          </div>

          {showKeys && (
            <div className="p-3 bg-black/50 rounded-lg max-h-36 overflow-y-auto font-mono text-[11px] text-gray-300 border border-gray-800">
              <pre>{keysResult.rawText}</pre>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 pt-1 border-t border-gray-800 justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Keys validated in RAM.</span>
            </div>

            <button
              type="button"
              onClick={handleSyncToGitHub}
              disabled={isSyncing}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isSyncing
                  ? 'bg-gray-800 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isSyncing ? 'Syncing...' : 'Sync to GitHub Secrets'}</span>
            </button>
          </div>

          {syncStatus && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{syncStatus}</span>
            </div>
          )}

          {syncError && (
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{syncError}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
