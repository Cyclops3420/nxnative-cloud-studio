import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Scale, Lock, BookOpen } from 'lucide-react';

interface LegalDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  isAccepted: boolean;
}

export const LegalDisclaimerModal: React.FC<LegalDisclaimerModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  isAccepted,
}) => {
  const [ownsCartridge, setOwnsCartridge] = useState(isAccepted);
  const [personalKeys, setPersonalKeys] = useState(isAccepted);
  const [noDistribution, setNoDistribution] = useState(isAccepted);

  if (!isOpen) return null;

  const canAccept = ownsCartridge && personalKeys && noDistribution;

  const handleConfirm = () => {
    if (canAccept) {
      onAccept();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#141722] border border-gray-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-red-950/40 via-[#181c2b] to-blue-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Legally Ripped Backups Disclaimer
              </h2>
              <p className="text-xs text-gray-400">
                Compliance with Copyright Fair Use & Interoperability Standards
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-gray-300">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200/90 leading-relaxed">
              <strong>Notice:</strong> This web compiler is a toolchain frontend for <strong>seedds/nxnative</strong> and <strong>adro0303/ipa-builder</strong>. 
              It does not contain, distribute, host, or download any copyrighted Nintendo Switch game code, system firmware, or proprietary cryptographic keys.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-400" />
              1. 100% Client-Side Privacy & Safe Harbor
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed pl-6">
              All binary parsing and key verification occur strictly inside your web browser via Web File APIs. 
              No game files (NSP/XCI/NRO) or proprietary keys (prod.keys) are stored on our servers. 
              Cloud builds are compiled directly inside your own private GitHub Actions runners.
            </p>

            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              2. Fair Use & Interoperability
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed pl-6">
              Under 17 U.S.C. § 117 and international interoperability doctrines, archival backup copies and software translation 
              for personal execution on compatible hardware (Apple Silicon ARM64) is recognized for lawful owners of original media.
            </p>
          </div>

          {/* Acknowledgement Checkboxes */}
          <div className="pt-2 space-y-3 border-t border-gray-800">
            <p className="text-xs font-semibold text-gray-200 uppercase tracking-wider">
              Required Acknowledgements:
            </p>

            <label className="flex items-start gap-3 p-3 rounded-lg bg-gray-900/60 hover:bg-gray-900 border border-gray-800 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={ownsCartridge}
                onChange={(e) => setOwnsCartridge(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-700 text-red-500 focus:ring-red-400 bg-gray-800"
              />
              <span className="text-xs text-gray-300">
                <strong>I own an authentic physical cartridge or licensed digital copy</strong> of any game I process using this tool.
              </span>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg bg-gray-900/60 hover:bg-gray-900 border border-gray-800 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={personalKeys}
                onChange={(e) => setPersonalKeys(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-700 text-blue-500 focus:ring-blue-400 bg-gray-800"
              />
              <span className="text-xs text-gray-300">
                <strong>I extracted my `prod.keys` directly from my own personal Nintendo Switch console</strong> using legitimate homebrew tools (e.g. Lockpick_RCM).
              </span>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg bg-gray-900/60 hover:bg-gray-900 border border-gray-800 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={noDistribution}
                onChange={(e) => setNoDistribution(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-700 text-emerald-500 focus:ring-emerald-400 bg-gray-800"
              />
              <span className="text-xs text-gray-300">
                <strong>I will not redistribute or share compiled IPAs or keys</strong>, and will only use them for personal execution on my own Apple devices.
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-800 bg-[#10121a] flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={!canAccept}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-lg transition-all ${
              canAccept
                ? 'bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white shadow-red-900/30 cursor-pointer'
                : 'bg-gray-800 text-gray-500 border border-gray-700/50 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>I Acknowledge & Accept Terms</span>
          </button>
        </div>

      </div>
    </div>
  );
};
