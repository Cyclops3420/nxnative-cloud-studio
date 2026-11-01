import React from 'react';
import { Sliders, Smartphone, Laptop, Gauge, Globe2, Tag } from 'lucide-react';

export interface BuildConfig {
  appName: string;
  bundleId: string;
  language: string;
  showFps: boolean;
  platform: 'ios-ipa' | 'mac-app';
}

interface BuildConfigurationProps {
  config: BuildConfig;
  onChange: (updated: Partial<BuildConfig>) => void;
}

const LANGUAGES = [
  { code: 'en', label: 'English (US/UK)' },
  { code: 'ja', label: 'Japanese (日本語)' },
  { code: 'es', label: 'Spanish (Español)' },
  { code: 'fr', label: 'French (Français)' },
  { code: 'de', label: 'German (Deutsch)' },
  { code: 'it', label: 'Italian (Italiano)' },
  { code: 'zh', label: 'Chinese (中文)' },
  { code: 'ko', label: 'Korean (한국어)' },
];

export const BuildConfiguration: React.FC<BuildConfigurationProps> = ({
  config,
  onChange,
}) => {
  return (
    <div className="p-5 rounded-2xl bg-[#141724] border border-gray-800 space-y-5">
      <div className="flex items-center gap-2">
        <Sliders className="w-5 h-5 text-red-500" />
        <h3 className="text-base font-semibold text-white">
          NXNative Compilation Options
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* App Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-red-400" />
            Application Display Name
          </label>
          <input
            type="text"
            value={config.appName}
            onChange={(e) => onChange({ appName: e.target.value })}
            placeholder="e.g. Super Mario Wonder"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f111a] border border-gray-700/80 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        {/* Bundle Identifier */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-blue-400" />
            iOS Bundle Identifier
          </label>
          <input
            type="text"
            value={config.bundleId}
            onChange={(e) => onChange({ bundleId: e.target.value })}
            placeholder="e.g. com.nxnative.mariowonder"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f111a] border border-gray-700/80 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors font-mono"
          />
        </div>

        {/* In-game Language */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
            <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
            Preferred In-Game Language
          </label>
          <select
            value={config.language}
            onChange={(e) => onChange({ language: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f111a] border border-gray-700/80 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-[#141724]">
                {lang.label} ({lang.code})
              </option>
            ))}
          </select>
        </div>

        {/* Target Platform */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-purple-400" />
            Target Platform
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChange({ platform: 'ios-ipa' })}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                config.platform === 'ios-ipa'
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500 shadow-sm'
                  : 'bg-[#0f111a] text-gray-400 border-gray-800 hover:border-gray-700'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>iOS / iPadOS (.ipa)</span>
            </button>

            <button
              type="button"
              onClick={() => onChange({ platform: 'mac-app' })}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                config.platform === 'mac-app'
                  ? 'bg-purple-600/20 text-purple-300 border-purple-500 shadow-sm'
                  : 'bg-[#0f111a] text-gray-400 border-gray-800 hover:border-gray-700'
              }`}
            >
              <Laptop className="w-4 h-4" />
              <span>macOS Native (.app)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toggles */}
      <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-medium text-white">Enable Metal Performance HUD & FPS Overlay</p>
            <p className="text-[11px] text-gray-400">Renders real-time framerate and GPU Metal metrics (`--show-fps`)</p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={config.showFps}
            onChange={(e) => onChange({ showFps: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
        </label>
      </div>
    </div>
  );
};
