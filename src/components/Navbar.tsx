import React from 'react';
import { ShieldCheck, Cpu, Terminal, ExternalLink, Gamepad2 } from 'lucide-react';

interface NavbarProps {
  onOpenLegal: () => void;
  isLegalAccepted: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenLegal, isLegalAccepted }) => {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-800/80 bg-[#0d0f17]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-gray-900 to-blue-600 p-[2px] shadow-lg">
            <div className="w-full h-full bg-[#12151e] rounded-[10px] flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-red-500 animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-[#0d0f17]"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white text-lg sm:text-xl">
                NX<span className="text-red-500">Native</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Cloud Studio
              </span>
            </div>
            <p className="text-[11px] text-gray-400 hidden sm:block">
              Switch ARM64 to Native Apple Silicon IPA Compiler
            </p>
          </div>
        </div>

        {/* Right side navigation & status */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onOpenLegal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isLegalAccepted
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/40 hover:bg-amber-500/20 animate-pulse'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Legal Disclaimer:</span>
            <span>{isLegalAccepted ? 'Compliant' : 'Review Required'}</span>
          </button>

          <a
            href="https://github.com/seedds/nxnative"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 text-xs text-gray-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 transition-colors"
          >
            <Cpu className="w-3.5 h-3.5 text-red-400" />
            <span>seedds/nxnative</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </a>

          <a
            href="https://github.com/adro0303/ipa-builder"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 text-xs text-gray-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span>adro0303/ipa-builder</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </a>
        </div>
      </div>
    </header>
  );
};
