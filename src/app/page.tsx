'use client';

import React, { useState } from 'react';
import {
  Gamepad2,
  Cpu,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Terminal,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Server,
  PackageOpen,
  Apple,
  FileCode,
  Smartphone,
} from 'lucide-react';

import { Navbar } from '@/components/Navbar';
import { LegalDisclaimerModal } from '@/components/LegalDisclaimerModal';
import { GameUploader } from '@/components/GameUploader';
import { KeysUploader } from '@/components/KeysUploader';
import { BuildConfiguration, BuildConfig } from '@/components/BuildConfiguration';
import { GitHubActionsBuilder } from '@/components/GitHubActionsBuilder';
import { HomebrewInstantBuilder } from '@/components/HomebrewInstantBuilder';
import { LocalTerminalHelper } from '@/components/LocalTerminalHelper';
import { WorkflowTemplateViewer } from '@/components/WorkflowTemplateViewer';
import { SideloadingGuide } from '@/components/SideloadingGuide';

import { SwitchFileMetadata } from '@/lib/switch-parser';
import { KeysValidationResult } from '@/lib/keys-parser';

export default function HomePage() {
  // Legal acknowledgement state
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [isLegalAccepted, setIsLegalAccepted] = useState(false);

  // Uploaded game files
  const [uploadedFiles, setUploadedFiles] = useState<{ file: File; meta: SwitchFileMetadata }[]>([]);

  // Decryption keys state
  const [keysResult, setKeysResult] = useState<KeysValidationResult | null>(null);

  // Build configuration state
  const [buildConfig, setBuildConfig] = useState<BuildConfig>({
    appName: 'Super Mario Wonder',
    bundleId: 'com.nxnative.mariowonder',
    language: 'en',
    showFps: false,
    platform: 'ios-ipa',
  });

  // Active builder tab
  const [activeEngineTab, setActiveEngineTab] = useState<'cloud' | 'homebrew' | 'local' | 'workflow'>('cloud');

  const handleAddFiles = (newFiles: { file: File; meta: SwitchFileMetadata }[]) => {
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSelectPrimaryName = (name: string, titleId?: string) => {
    const cleanId = titleId ? titleId.toLowerCase().slice(0, 10) : 'game';
    setBuildConfig((prev) => ({
      ...prev,
      appName: name,
      bundleId: `com.nxnative.${cleanId}`,
    }));
  };

  const handleConfigChange = (updated: Partial<BuildConfig>) => {
    setBuildConfig((prev) => ({ ...prev, ...updated }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d13] text-gray-100">
      {/* Top Navigation */}
      <Navbar
        onOpenLegal={() => setIsLegalModalOpen(true)}
        isLegalAccepted={isLegalAccepted}
      />

      {/* Legal Disclaimer Modal */}
      <LegalDisclaimerModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        onAccept={() => setIsLegalAccepted(true)}
        isAccepted={isLegalAccepted}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 border border-gray-800 bg-gradient-to-br from-[#161a29]/90 via-[#11131c] to-[#171b26]/90 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Native ARM64 Translation • Not an Emulated CPU</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Convert Switch Games to <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-red-500 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Native iOS & iPadOS IPAs
              </span>
            </h1>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Powered by <strong className="text-white">seedds/nxnative</strong> and cloud automated by <strong className="text-white">adro0303/ipa-builder</strong> workflows. 
              Translates Switch Horizon binaries and NVN graphics directly to Apple Silicon Metal shaders for maximum performance.
            </p>

            {/* Fair-use reminder callout */}
            {!isLegalAccepted && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-3 text-xs text-amber-200">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p>
                    <strong>Legally Ripped Disclaimer:</strong> You must supply your own legally acquired game backups and console encryption keys. No ROMs or keys are hosted or redistributed.
                  </p>
                </div>
                <button
                  onClick={() => setIsLegalModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold shrink-0 transition-colors shadow-sm"
                >
                  Accept Terms
                </button>
              </div>
            )}

            {/* Architecture Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
              <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800">
                <p className="text-gray-400 text-[11px]">Execution</p>
                <p className="font-bold text-white mt-0.5">ARM64 Native Direct</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800">
                <p className="text-gray-400 text-[11px]">Graphics</p>
                <p className="font-bold text-white mt-0.5">NVN → Apple Metal</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800">
                <p className="text-gray-400 text-[11px]">Cloud Build</p>
                <p className="font-bold text-white mt-0.5">macOS M2 Runners</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800">
                <p className="text-gray-400 text-[11px]">Output</p>
                <p className="font-bold text-white mt-0.5">Unsigned .IPA / .App</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pipeline Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Step 1: Game Backups Uploader */}
          <div className="p-6 rounded-3xl bg-[#131622] border border-gray-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-wider">
              <span>Step 01</span>
              <span>•</span>
              <span>Game Payload</span>
            </div>
            <GameUploader
              files={uploadedFiles}
              onAddFiles={handleAddFiles}
              onRemoveFile={handleRemoveFile}
              onSelectPrimaryName={handleSelectPrimaryName}
            />
          </div>

          {/* Step 2: Keys Validation */}
          <div className="p-6 rounded-3xl bg-[#131622] border border-gray-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-500 uppercase tracking-wider">
              <span>Step 02</span>
              <span>•</span>
              <span>Decryption Keys</span>
            </div>
            <KeysUploader
              keysResult={keysResult}
              onKeysParsed={setKeysResult}
            />
          </div>
        </div>

        {/* Step 3: Build Configuration */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
            <span>Step 03</span>
            <span>•</span>
            <span>Target Configuration</span>
          </div>
          <BuildConfiguration
            config={buildConfig}
            onChange={handleConfigChange}
          />
        </div>

        {/* Step 4: Choose Compilation Engine */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <span>Step 04</span>
              <span>•</span>
              <span>Select Compilation Pipeline</span>
            </div>

            {/* Engine Tabs */}
            <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-[#121520] border border-gray-800">
              <button
                type="button"
                onClick={() => setActiveEngineTab('cloud')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeEngineTab === 'cloud'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                <span>GitHub Actions Cloud (Recommended)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveEngineTab('homebrew')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeEngineTab === 'homebrew'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <PackageOpen className="w-3.5 h-3.5" />
                <span>In-Browser Packager</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveEngineTab('local')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeEngineTab === 'local'
                    ? 'bg-gray-700 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Apple className="w-3.5 h-3.5" />
                <span>Local Mac CLI</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveEngineTab('workflow')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeEngineTab === 'workflow'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Workflow .YML</span>
              </button>
            </div>
          </div>

          {/* Active Engine View */}
          {activeEngineTab === 'cloud' && (
            <GitHubActionsBuilder
              config={buildConfig}
              keysResult={keysResult}
              files={uploadedFiles}
              isLegalAccepted={isLegalAccepted}
              onOpenLegal={() => setIsLegalModalOpen(true)}
            />
          )}

          {activeEngineTab === 'homebrew' && (
            <HomebrewInstantBuilder
              config={buildConfig}
              files={uploadedFiles}
              isLegalAccepted={isLegalAccepted}
              onOpenLegal={() => setIsLegalModalOpen(true)}
            />
          )}

          {activeEngineTab === 'local' && (
            <LocalTerminalHelper
              config={buildConfig}
            />
          )}

          {activeEngineTab === 'workflow' && (
            <WorkflowTemplateViewer
              config={buildConfig}
            />
          )}
        </div>

        {/* Step 5: Sideloading Instructions */}
        <SideloadingGuide />

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/80 bg-[#0d0f17] py-8 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-red-500" />
            <span className="font-semibold text-gray-300">NXNative Cloud Studio</span>
            <span>•</span>
            <span>Vercel App Formatted Architecture</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsLegalModalOpen(true)}
              className="hover:text-gray-300 underline"
            >
              Legal Disclaimer & Fair Use
            </button>
            <a
              href="https://github.com/seedds/nxnative"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300"
            >
              NXNative GitHub
            </a>
            <a
              href="https://github.com/adro0303/ipa-builder"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300"
            >
              IPA Builder GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
