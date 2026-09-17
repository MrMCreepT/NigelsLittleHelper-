import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { changePasscode } from '../utils/security';

interface PasscodeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLockWorkspace: () => void;
}

export const PasscodeSettingsModal: React.FC<PasscodeSettingsModalProps> = ({
  isOpen,
  onClose,
  onLockWorkspace,
}) => {
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPasscode !== confirmPasscode) {
      setStatusMessage({ type: 'error', text: 'New passcodes do not match.' });
      return;
    }
    if (newPasscode.trim().length < 4) {
      setStatusMessage({ type: 'error', text: 'New passcode must be at least 4 characters.' });
      return;
    }

    setIsUpdating(true);
    setStatusMessage(null);

    const result = await changePasscode(currentPasscode, newPasscode);
    setIsUpdating(false);

    if (result.success) {
      setStatusMessage({ type: 'success', text: 'Master passcode updated successfully!' });
      setCurrentPasscode('');
      setNewPasscode('');
      setConfirmPasscode('');
      setTimeout(() => {
        setStatusMessage(null);
        onClose();
      }, 1600);
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Workspace Security</h2>
              <p className="text-xs text-slate-400">Master Passcode & Git Safety</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Git Security Notice */}
        <div className="mt-4 p-3.5 bg-slate-800/80 border border-slate-700/80 rounded-2xl text-xs space-y-1 text-slate-300">
          <div className="flex items-center gap-2 font-semibold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Public Git Safe</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Zero passwords are saved in the Git repository source code. Passcodes are cryptographically salted and hashed using browser Web Crypto SHA-256, stored only in your local browser.
          </p>
        </div>

        {/* Change Passcode Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Change Master Passcode
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="modal-current-passcode">
              Current Passcode
            </label>
            <div className="relative">
              <input
                id="modal-current-passcode"
                type={showCurrent ? 'text' : 'password'}
                value={currentPasscode}
                onChange={(e) => setCurrentPasscode(e.target.value)}
                placeholder="Enter current passcode"
                required
                className="w-full pl-3 pr-10 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="modal-new-passcode">
              New Passcode
            </label>
            <div className="relative">
              <input
                id="modal-new-passcode"
                type={showNew ? 'text' : 'password'}
                value={newPasscode}
                onChange={(e) => setNewPasscode(e.target.value)}
                placeholder="At least 4 characters"
                required
                className="w-full pl-3 pr-10 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="modal-confirm-new-passcode">
              Confirm New Passcode
            </label>
            <input
              id="modal-confirm-new-passcode"
              type={showNew ? 'text' : 'password'}
              value={confirmPasscode}
              onChange={(e) => setConfirmPasscode(e.target.value)}
              placeholder="Re-enter new passcode"
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {statusMessage && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/50 border border-emerald-800 text-emerald-300'
                  : 'bg-red-950/50 border border-red-800 text-red-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="pt-2 flex items-center gap-2">
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              {isUpdating ? 'Updating...' : 'Update Passcode'}
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onLockWorkspace();
              }}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Lock Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
