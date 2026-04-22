import React from 'react';
import { LockKeyhole } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface LoginPageProps {
  loginEmail: string;
  loginPassword: string;
  rememberMe: boolean;
  rememberedEmails: string[];
  error: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRememberChange: (value: boolean) => void;
  onLogin: () => void;
  onRegister: () => void;
}

export function LoginPage({
  loginEmail,
  loginPassword,
  rememberMe,
  rememberedEmails,
  error,
  onEmailChange,
  onPasswordChange,
  onRememberChange,
  onLogin,
  onRegister,
}: LoginPageProps) {
  return (
    <div className="min-h-screen grid place-items-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 relative overflow-hidden">
      <div className="absolute top-12 left-10 w-52 h-52 rounded-full bg-fuchsia-500/20 blur-3xl animate-pulse" />
      <div className="absolute bottom-8 right-8 w-60 h-60 rounded-full bg-cyan-500/20 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute inset-0 login-ambient">
        <span className="orbs orb-1" />
        <span className="orbs orb-2" />
        <span className="orbs orb-3" />
        <span className="scan scan-1" />
        <span className="scan scan-2" />
      </div>
      <div className="w-full max-w-md border border-white/20 rounded-2xl p-6 bg-slate-900/70 backdrop-blur-xl space-y-4 shadow-2xl text-white relative z-10">
        <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full border border-white/20 bg-white/10 float-slow" />
        <div className="flex items-center gap-2">
          <LockKeyhole className="h-5 w-5 text-emerald-300" />
          <h1 className="text-xl font-semibold">Welcome to StockPredict Pro</h1>
        </div>
        <p className="text-sm text-slate-300">Secure, transparent, and real-time portfolio intelligence.</p>
        <Input placeholder="Email" autoComplete="email" value={loginEmail} onChange={(e) => onEmailChange(e.target.value)} className="bg-white/90 text-black" />
        {rememberedEmails.length > 0 && (
          <div className="flex flex-wrap gap-1 -mt-2">
            {rememberedEmails.map((savedEmail) => (
              <button key={savedEmail} type="button" onClick={() => onEmailChange(savedEmail)} className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20">
                {savedEmail}
              </button>
            ))}
          </div>
        )}
        <Input type="password" autoComplete="current-password" placeholder="Password" value={loginPassword} onChange={(e) => onPasswordChange(e.target.value)} className="bg-white/90 text-black" />
        {error && <p className="text-sm text-rose-300">{error}</p>}
        <label className="text-xs flex items-center gap-2 text-slate-300">
          <input type="checkbox" checked={rememberMe} onChange={(e) => onRememberChange(e.target.checked)} />
          Remember my account on this device
        </label>
        <div className="flex gap-2">
          <Button onClick={onLogin} className="bg-emerald-600 hover:bg-emerald-500 text-white">Login</Button>
          <Button onClick={onRegister} className="bg-white text-slate-900 hover:bg-slate-100 border border-white/40">Register</Button>
        </div>
        <div className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 shimmer text-xs text-slate-200">
          <p className="font-medium">Market Pulse</p>
          <p className="opacity-90 mt-1">Track real-time symbols, trusted sources, and explainable predictions in one premium workspace.</p>
        </div>
      </div>
    </div>
  );
}
