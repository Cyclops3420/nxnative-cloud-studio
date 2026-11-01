import React, { useState } from 'react';
import { Lock, KeyRound, ShieldAlert, ArrowRight, Loader2, Gamepad2 } from 'lucide-react';

interface PasswordGateProps {
  onAuthenticated: () => void;
}

export const PasswordGate: React.FC<PasswordGateProps> = ({ onAuthenticated }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid password');
      }

      onAuthenticated();
    } catch (err: any) {
      setError(err.message || 'Incorrect password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0b0d13]">
      <div className="relative w-full max-w-md p-8 rounded-3xl bg-[#141724] border border-gray-800 shadow-2xl space-y-6">
        
        {/* Glow */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mb-2">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Protected Studio Access
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            This deployment is private to prevent unauthorized execution of your linked GitHub Actions runner. Enter the access password to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-blue-400" />
              Access Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="w-full px-4 py-3 rounded-xl bg-[#0f111a] border border-gray-700/80 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
              autoFocus
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-300 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all shadow-lg ${
              loading || !password
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                : 'bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white shadow-red-900/30 cursor-pointer'
            }`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            <span>{loading ? 'Verifying...' : 'Unlock Studio'}</span>
          </button>
        </form>

        <div className="pt-2 text-center text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
          <Gamepad2 className="w-3.5 h-3.5 text-gray-600" />
          <span>Linked to Cyclops3420/nxnative-cloud-studio</span>
        </div>
      </div>
    </div>
  );
};
