import React, { useState } from 'react';
import { Invoice } from '../types';
import { calculateInvoiceTotals, formatGBP } from '../data/defaults';
import { X, Mail, Copy, Check, ExternalLink, Send } from 'lucide-react';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
}

export const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose, invoice }) => {
  const [copied, setCopied] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState(
    invoice.client.email || 'accounts@clientcompany.co.uk'
  );

  if (!isOpen) return null;

  const { subtotal, taxAmount, totalAmount } = calculateInvoiceTotals(
    invoice.items,
    invoice.taxRate
  );

  const subject = `Invoice ${invoice.invoiceNumber} from ${invoice.sender.name || 'Nigel Chambers'}`;

  const itemsListText = invoice.items
    .map(
      (item, idx) =>
        `${idx + 1}. ${item.description || 'Contractor service'} - ${Number(item.hours || 0).toFixed(1)} hrs @ ${formatGBP(Number(item.rate || 0))}/hr = ${formatGBP((Number(item.hours) || 0) * (Number(item.rate) || 0))}`
    )
    .join('\n');

  const body = `Dear ${invoice.client.contactName || invoice.client.companyName || 'Sir / Madam'},

Please find below the invoice breakdown for works carried out by ${invoice.sender.name || 'Nigel Chambers'}.

--------------------------------------------------
INVOICE DETAILS
--------------------------------------------------
Invoice Number: ${invoice.invoiceNumber}
Issue Date:     ${invoice.issueDate}
Payment Due:    ${invoice.dueDate}
Client:         ${invoice.client.companyName}

WORKS & LINE ITEMS:
${itemsListText}

--------------------------------------------------
SUMMARY & TAX:
Subtotal:       ${formatGBP(subtotal)}
Less Tax (20%): -${formatGBP(taxAmount)}
TOTAL DUE:      ${formatGBP(totalAmount)}
--------------------------------------------------

REMITTANCE / BANK TRANSFER DETAILS:
Bank:           ${invoice.sender.bankName || 'BACS Bank Transfer'}
Account Name:   ${invoice.sender.accountName || invoice.sender.name}
Sort Code:      ${invoice.sender.sortCode || '00-00-00'}
Account Number: ${invoice.sender.accountNumber || '00000000'}
Payment Reference: ${invoice.invoiceNumber}

UTR: ${invoice.sender.utr || '—'} | NI: ${invoice.sender.niNumber || '—'}
Registered Address: ${invoice.sender.address || '—'}

${invoice.notes}

Thank you for your business.

Kind regards,
${invoice.sender.name || 'Nigel Chambers'}
${invoice.sender.phone ? `Tel: ${invoice.sender.phone}` : ''}
${invoice.sender.email ? `Email: ${invoice.sender.email}` : ''}`;

  const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Send Invoice via Email</h2>
              <p className="text-xs text-slate-500">Dispatch directly via your email client or copy summary</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="email-recipient">
              Recipient Email Address
            </label>
            <input
              id="email-recipient"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="accounts@clientcompany.co.uk"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500/40 outline-none font-medium"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-600">
                Email Message Preview
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-amber-600 hover:text-amber-700 font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              readOnly
              rows={12}
              value={body}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 leading-relaxed outline-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy All'}</span>
            </button>

            <a
              href={mailtoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm shadow-amber-500/20"
            >
              <Send className="w-4 h-4" />
              <span>Launch Default Mail Client</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
