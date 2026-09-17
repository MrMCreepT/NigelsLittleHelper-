import React, { useState, useEffect } from 'react';
import { Building2, X, CheckCircle2, Shield, Lock } from 'lucide-react';
import { SenderProfile } from '../types';
import { getStoredSenderProfile, saveStoredSenderProfile } from '../utils/storage';

interface ContractorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: (updatedProfile: SenderProfile) => void;
}

export const ContractorProfileModal: React.FC<ContractorProfileModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated,
}) => {
  const [profile, setProfile] = useState<SenderProfile>(() => getStoredSenderProfile());
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setProfile(getStoredSenderProfile());
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: keyof SenderProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredSenderProfile(profile);
    onProfileUpdated(profile);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs font-sans">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Your Business & Bank Details</h2>
              <p className="text-xs text-slate-400">Stored exclusively on your private device</p>
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

        {/* Git Privacy Guarantee Notice */}
        <div className="mt-4 p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl text-xs space-y-1 text-emerald-200">
          <div className="flex items-center gap-2 font-semibold text-emerald-400">
            <Shield className="w-4 h-4" />
            <span>Local Device Storage (Safe for Public Git)</span>
          </div>
          <p className="text-[11px] text-emerald-300/80 leading-relaxed">
            The details below are saved only in this browser's local storage and are inserted into generated PDFs. They are <strong>never</strong> committed to your GitHub repository or sent to an external server.
          </p>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="profile-name">
                Trading / Full Name
              </label>
              <input
                id="profile-name"
                type="text"
                value={profile.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Nigel Chambers"
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="profile-phone">
                Phone Number
              </label>
              <input
                id="profile-phone"
                type="text"
                value={profile.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="07700 900123"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="profile-email">
              Email Address
            </label>
            <input
              id="profile-email"
              type="email"
              value={profile.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="contractor@example.co.uk"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="profile-address">
              Full Business Address & Postcode
            </label>
            <textarea
              id="profile-address"
              rows={2}
              value={profile.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="e.g. 109 High Street, Town, Postcode"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Tax Identification */}
          <div className="pt-2 border-t border-slate-800/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              HMRC & Tax Identification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="profile-utr">
                  HMRC UTR Number (10 digits)
                </label>
                <input
                  id="profile-utr"
                  type="text"
                  value={profile.utr}
                  onChange={(e) => handleChange('utr', e.target.value)}
                  placeholder="1234567890"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="profile-ni">
                  National Insurance Number
                </label>
                <input
                  id="profile-ni"
                  type="text"
                  value={profile.niNumber}
                  onChange={(e) => handleChange('niNumber', e.target.value)}
                  placeholder="QQ123456C"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono uppercase"
                />
              </div>
            </div>
          </div>

          {/* Banking Details */}
          <div className="pt-2 border-t border-slate-800/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Bank Account Details (for Client BACS Transfers)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="sm:col-span-1">
                <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="profile-bank">
                  Bank Name
                </label>
                <input
                  id="profile-bank"
                  type="text"
                  value={profile.bankName}
                  onChange={(e) => handleChange('bankName', e.target.value)}
                  placeholder="Barclays Bank UK"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="profile-sortcode">
                  Sort Code
                </label>
                <input
                  id="profile-sortcode"
                  type="text"
                  value={profile.sortCode}
                  onChange={(e) => handleChange('sortCode', e.target.value)}
                  placeholder="00-00-00"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="profile-accountno">
                  Account Number
                </label>
                <input
                  id="profile-accountno"
                  type="text"
                  value={profile.accountNumber}
                  onChange={(e) => handleChange('accountNumber', e.target.value)}
                  placeholder="00000000"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                />
              </div>
            </div>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Details saved securely to your browser storage!</span>
            </div>
          )}

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Save to This Device
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
