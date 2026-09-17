import React, { useState, useEffect } from 'react';
import { Lock, FileText, ShieldCheck, ArrowRight, Eye, EyeOff, KeyRound, AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react';
import { isPasscodeConfigured, setupPasscode, verifyPasscode, resetPasscode } from '../utils/security';
import { setStoredAuth } from '../utils/storage';

interface AuthScreenProps {
  onLoginSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [hasPasscode, setHasPasscode] = useState<boolean>(() => isPasscodeConfigured());
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    setHasPasscode(isPasscodeConfigured());
  }, []);

  // Handle setting a new master passcode (First run)
  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = passcode.trim();
    const cleanConfirm = confirmPasscode.trim();

    if (cleanPass.length < 4) {
      setError('Passcode must be at least 4 characters.');
      return;
    }

    if (cleanPass !== cleanConfirm) {
      setError('Passcodes do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const ok = await setupPasscode(cleanPass);
      if (ok) {
        setStoredAuth(true);
        onLoginSuccess();
      } else {
        setError('Failed to save master passcode. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error configuring passcode.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle unlocking with existing master passcode
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = passcode.trim();

    if (!cleanPass) {
      setError('Please enter your passcode.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const isValid = await verifyPasscode(cleanPass);
      if (isValid) {
        setStoredAuth(true);
        onLoginSuccess();
      } else {
        setError('Incorrect passcode. Please try again.');
      }
    } catch {
      setError('Could not verify passcode.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReset = () => {
    resetPasscode();
    setStoredAuth(false);
    setHasPasscode(false);
    setPasscode('');
    setConfirmPasscode('');
    setError(null);
    setShowResetConfirm(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-12 text-slate-100 font-sans">
      <div className="w-full max-w-md bg-slate-800/95 border border-slate-700/80 rounded-3xl p-7 sm:p-8 shadow-2xl backdrop-blur-md">
        {/* Brand Icon & Heading */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mb-3.5 text-amber-400 shadow-inner">
            <FileText className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Nigel Chambers</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Contractor Invoicing & Accounts Workspace</p>

          <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 bg-slate-700/40 border border-slate-600/40 rounded-full text-xs text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>UTR & NI Verified Contractor Profile</span>
          </div>
        </div>

        {/* Form Container */}
        {!hasPasscode ? (
          /* FIRST TIME SETUP FORM (ZERO SECRETS IN GIT) */
          <div>
            <div className="mb-5 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-200/90 leading-relaxed">
              <div className="flex items-center gap-2 font-semibold text-amber-300 mb-1">
                <KeyRound className="w-4 h-4" />
                <span>Initialize Master Passcode</span>
              </div>
              <p>
                No passwords or secrets are committed to Git. Define your private master passcode below to encrypt access on this device.
              </p>
            </div>

            <form onSubmit={handleSetup} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="setup-passcode">
                  Create Master Passcode / PIN
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="setup-passcode"
                    type={showPasscode ? 'text' : 'password'}
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      if (error) setError(null);
                    }}
                    autoComplete="new-password"
                    placeholder="e.g. 4+ digits or passphrase"
                    required
                    className="w-full pl-10 pr-11 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="setup-confirm-passcode">
                  Confirm Master Passcode
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="setup-confirm-passcode"
                    type={showPasscode ? 'text' : 'password'}
                    value={confirmPasscode}
                    onChange={(e) => {
                      setConfirmPasscode(e.target.value);
                      if (error) setError(null);
                    }}
                    autoComplete="new-password"
                    placeholder="Re-enter passcode"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-900/30 border border-red-800/60 rounded-xl text-xs text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                id="btn-save-passcode"
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.99] cursor-pointer"
              >
                <span>{isSubmitting ? 'Securing...' : 'Set Passcode & Enter'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          /* STANDARD LOGIN FORM */
          <div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-300" htmlFor="login-passcode">
                    Workspace Passcode
                  </label>
                  <span className="text-[11px] text-emerald-400 font-medium inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Device Protected
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-passcode"
                    type={showPasscode ? 'text' : 'password'}
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      if (error) setError(null);
                    }}
                    autoComplete="current-password"
                    placeholder="Enter your passcode"
                    autoFocus
                    required
                    className="w-full pl-10 pr-11 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                    title={showPasscode ? 'Hide passcode' : 'Show passcode'}
                  >
                    {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-900/30 border border-red-800/60 rounded-xl text-xs text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                id="btn-login-submit"
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.99] cursor-pointer"
              >
                <span>{isSubmitting ? 'Verifying...' : 'Access Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Reset Passcode Option */}
            <div className="mt-5 pt-4 border-t border-slate-700/60 text-center">
              {!showResetConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-slate-400" />
                  <span>Reset or Change Passcode</span>
                </button>
              ) : (
                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-700 text-left space-y-2.5">
                  <div className="flex items-start gap-2 text-amber-300 text-xs font-semibold">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Reset master passcode on this browser?</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    This will clear the stored passcode so you can create a new one. Your saved invoices in localStorage will remain intact.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleConfirmReset}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Yes, Reset Passcode
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(false)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Details */}
      <div className="mt-8 text-center text-xs text-slate-500 max-w-sm space-y-1">
        <p className="font-semibold text-slate-400">Nigel Chambers &bull; Plumbing & Heating Contractor</p>
        <p className="text-[11px] text-slate-500">Private device storage &bull; Zero banking or tax secrets committed to Git</p>
        <p className="text-[10px] text-slate-600 pt-1">
          Client-side WebCrypto SHA-256 with cryptographically secure salt
        </p>
      </div>
    </div>
  );
};
