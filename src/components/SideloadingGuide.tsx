import React, { useState } from 'react';
import { Smartphone, ShieldCheck, Download, ExternalLink, HelpCircle, CheckCircle2 } from 'lucide-react';

export const SideloadingGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'altstore' | 'sideloadly' | 'trollstore' | 'livecontainer'>('altstore');

  return (
    <div className="p-6 rounded-2xl bg-[#141724] border border-gray-800 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-semibold text-white">
              iOS / iPadOS Sideloading Guide
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            How to install your compiled NXNative unsigned IPA onto your iPhone or iPad for free.
          </p>
        </div>

        {/* Tab Selectors */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-[#0f111a] border border-gray-800">
          <button
            type="button"
            onClick={() => setActiveTab('altstore')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'altstore' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            AltStore
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sideloadly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'sideloadly' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Sideloadly
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('trollstore')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'trollstore' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            TrollStore
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('livecontainer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'livecontainer' ? 'bg-amber-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            LiveContainer
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="p-5 rounded-xl bg-[#0f111a] border border-gray-800 text-xs text-gray-300 space-y-4">
        {activeTab === 'altstore' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-white text-sm">AltStore Sideloading (Wireless / USB)</h4>
              <a
                href="https://altstore.io"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-emerald-400 hover:underline"
              >
                altstore.io <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-gray-400">
              <li>Install <strong>AltServer</strong> on your Mac or Windows PC and install <strong>AltStore</strong> onto your iPhone/iPad.</li>
              <li>Transfer the compiled <span className="font-mono text-emerald-300">.ipa</span> file to your device via AirDrop, iCloud Drive, or Files app.</li>
              <li>Open <strong>AltStore</strong> on your iOS device, go to the <strong>My Apps</strong> tab, and tap the <strong>"+"</strong> icon.</li>
              <li>Select your compiled IPA. AltStore will sign it with your free Apple ID and install it onto your home screen!</li>
            </ol>
          </div>
        )}

        {activeTab === 'sideloadly' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-white text-sm">Sideloadly (1-Click USB / Wi-Fi Install)</h4>
              <a
                href="https://sideloadly.io"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-400 hover:underline"
              >
                sideloadly.io <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-gray-400">
              <li>Download and open <strong>Sideloadly</strong> on your Windows or Mac PC.</li>
              <li>Plug your iPhone/iPad into your computer via USB (make sure device is unlocked and trusted).</li>
              <li>Drag and drop your compiled <span className="font-mono text-blue-300">.ipa</span> file into the large IPA icon on Sideloadly.</li>
              <li>Enter your Apple ID and click <strong>Start</strong>. Once finished, enable <em>Developer Mode</em> under <em>iOS Settings → Privacy & Security</em> if prompted.</li>
            </ol>
          </div>
        )}

        {activeTab === 'trollstore' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-white text-sm">TrollStore (Permanent Signing, iOS 14.0 – 17.0)</h4>
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px]">No 7-Day Revokes</span>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-gray-400">
              <li>Verify that your iOS device runs a compatible version (iOS 14.0 through iOS 17.0).</li>
              <li>Download the compiled <span className="font-mono text-purple-300">.ipa</span> directly on Safari.</li>
              <li>Tap <strong>Share → Open in TrollStore</strong>.</li>
              <li>TrollStore bypasses code signature checks using CoreTrust bug, permanently installing the game with full JIT permissions!</li>
            </ol>
          </div>
        )}

        {activeTab === 'livecontainer' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-white text-sm">LiveContainer (SideStore / JIT Container)</h4>
              <a
                href="https://github.com/khanhduytran0/LiveContainer"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-amber-400 hover:underline"
              >
                LiveContainer GitHub <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-gray-400">
              <li>Install LiveContainer on your device via SideStore, AltStore, or TrollStore.</li>
              <li>Import your compiled <span className="font-mono text-amber-300">.ipa</span> inside LiveContainer.</li>
              <li>LiveContainer enables running the executable directly inside an isolated app shell without taking up one of your 3 free App ID limits!</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};
