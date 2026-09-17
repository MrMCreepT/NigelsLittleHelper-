import React from 'react';
import { Invoice } from '../types';
import { calculateInvoiceTotals, formatGBP } from '../data/defaults';
import { ShieldCheck, Building2, Calendar, FileText, CheckCircle, Clock, Download, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface InvoicePreviewProps {
  invoice: Invoice;
  id?: string;
  onDownloadPDF?: () => void;
  isGeneratingPdf?: boolean;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  invoice,
  id = 'invoice-document',
  onDownloadPDF,
  isGeneratingPdf = false,
}) => {
  const { subtotal, taxAmount, totalAmount } = calculateInvoiceTotals(
    invoice.items,
    invoice.taxRate
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    try {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`; // UK DD/MM/YYYY
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-3">
      {/* Mobile & Desktop Quick PDF Download Banner */}
      {onDownloadPDF && (
        <div className="no-print flex items-center justify-between gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
          <div className="min-w-0">
            <span className="text-xs font-bold text-amber-950 block truncate">Ready for Export</span>
            <span className="text-[11px] text-amber-800">Direct A4 PDF download & mobile share</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.02 }}
            type="button"
            onClick={onDownloadPDF}
            disabled={isGeneratingPdf}
            id="btn-preview-download-pdf"
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isGeneratingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isGeneratingPdf ? 'Saving...' : 'Download PDF'}</span>
          </motion.button>
        </div>
      )}

      <div
        id={id}
        className="print-paper bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-200/80 p-5 sm:p-8 md:p-12 w-full max-w-4xl mx-auto font-sans transition-all"
      >
        {/* Top Header: Sender Brand + Invoice Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-6 border-b border-slate-200 pb-6 sm:pb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {invoice.sender.name || 'Nigel Chambers'}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Contractor
            </span>
          </div>

          <p className="text-sm font-medium text-slate-600 mt-1">
            Plumbing & Heating Specialist Services
          </p>

          <div className="mt-3 text-xs text-slate-600 space-y-1">
            <p className="font-medium text-slate-800">{invoice.sender.address}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
              {invoice.sender.phone && (
                <span>Tel: <strong className="text-slate-700">{invoice.sender.phone}</strong></span>
              )}
              {invoice.sender.email && (
                <span>Email: <strong className="text-slate-700">{invoice.sender.email}</strong></span>
              )}
            </div>
          </div>

          {/* Statutory HMRC Tax Identifiers */}
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <div className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-mono">
              <span className="text-slate-500 font-sans mr-1">UTR:</span>
              <strong className="text-slate-900">{invoice.sender.utr}</strong>
            </div>
            <div className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-mono">
              <span className="text-slate-500 font-sans mr-1">NI No:</span>
              <strong className="text-slate-900">{invoice.sender.niNumber}</strong>
            </div>
          </div>
        </div>

        {/* Invoice Title & Meta */}
        <div className="sm:text-right flex flex-col sm:items-end w-full sm:w-auto">
          <div className="flex items-center sm:justify-end gap-3">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400">INVOICE</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
                invoice.status === 'Paid'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : invoice.status === 'Sent'
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'bg-amber-50 text-amber-700 border-amber-300'
              }`}
            >
              {invoice.status}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-1">
            {invoice.invoiceNumber || 'INV-2026-001'}
          </h2>

          <div className="mt-4 text-xs space-y-1.5 text-slate-600 sm:text-right">
            <div className="flex justify-between sm:justify-end gap-4">
              <span className="text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Date of Issue:
              </span>
              <span className="font-semibold text-slate-800">{formatDate(invoice.issueDate)}</span>
            </div>
            <div className="flex justify-between sm:justify-end gap-4">
              <span className="text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Payment Due:
              </span>
              <span className="font-semibold text-slate-900">{formatDate(invoice.dueDate)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Client Section (Bill To) */}
      <div className="mt-8 bg-slate-50/80 border border-slate-200/80 rounded-xl p-5">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          <Building2 className="w-4 h-4 text-amber-600" />
          <span>INVOICE TO (CLIENT)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {invoice.client.companyName || 'Customer / Client Name'}
            </h3>
            {invoice.client.contactName && (
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Attn: {invoice.client.contactName}
              </p>
            )}
            <div className="text-xs text-slate-600 mt-2 space-y-0.5">
              {invoice.client.addressLine1 && <p>{invoice.client.addressLine1}</p>}
              {invoice.client.addressLine2 && <p>{invoice.client.addressLine2}</p>}
              <p>
                {[invoice.client.city, invoice.client.postcode]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-600 flex flex-col justify-end md:items-end space-y-1">
            {invoice.client.email && (
              <p>
                Email: <span className="font-medium text-slate-800">{invoice.client.email}</span>
              </p>
            )}
            {invoice.client.phone && (
              <p>
                Phone: <span className="font-medium text-slate-800">{invoice.client.phone}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Line Items Table */}
      <div className="mt-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 text-xs font-bold text-slate-600 uppercase tracking-wider bg-slate-100/70">
                <th className="py-3 px-4 rounded-tl-lg">Description of Works & Services</th>
                <th className="py-3 px-4 text-right w-24">Hours</th>
                <th className="py-3 px-4 text-right w-28">Rate (£/hr)</th>
                <th className="py-3 px-4 text-right rounded-tr-lg w-32">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {invoice.items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400 italic">
                    No line items added yet.
                  </td>
                </tr>
              ) : (
                invoice.items.map((item, index) => {
                  const itemHours = Number(item.hours) || 0;
                  const itemRate = Number(item.rate) || 0;
                  const lineTotal = itemHours * itemRate;

                  return (
                    <tr key={item.id || index} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {item.description || 'Service item'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                        {itemHours.toFixed(1)} hrs
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                        {formatGBP(itemRate)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">
                        {formatGBP(lineTotal)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Calculation Breakdown (Automated 20% Tax) */}
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-slate-200">
        <div className="max-w-md text-xs text-slate-500 space-y-2">
          {invoice.notes && (
            <div>
              <span className="font-semibold text-slate-700 block mb-0.5">Notes & Compliance:</span>
              <p className="leading-relaxed">{invoice.notes}</p>
            </div>
          )}
        </div>

        <div className="w-full sm:w-80 bg-slate-50 rounded-xl p-4 border border-slate-200/90 text-sm space-y-2.5">
          <div className="flex justify-between items-center text-slate-600 text-xs">
            <span>Subtotal:</span>
            <span className="font-mono font-medium text-slate-800">{formatGBP(subtotal)}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600 text-xs">
            <span className="flex items-center gap-1">
              <span>{invoice.taxLabel?.toLowerCase().includes('less') ? invoice.taxLabel : `Less ${invoice.taxLabel || 'Tax (20%)'}`}</span>
              <span className="text-[10px] bg-red-100 text-red-700 font-semibold px-1 rounded">-20%</span>
            </span>
            <span className="font-mono font-medium text-red-600">-{formatGBP(taxAmount)}</span>
          </div>

          <div className="border-t border-slate-300 pt-2.5 flex justify-between items-baseline">
            <span className="font-bold text-slate-900 text-base">Total Due:</span>
            <span className="font-mono font-bold text-slate-950 text-xl tracking-tight text-amber-700">
              {formatGBP(totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Instructions & Bank Transfer Details */}
      <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-4 rounded-xl">
        <div className="text-xs text-slate-600 space-y-1">
          <div className="font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Remittance & Bank Details</span>
          </div>
          <p>Bank: <strong className="text-slate-800">{invoice.sender.bankName || 'BACS Bank Transfer'}</strong></p>
          <p>Account Name: <strong className="text-slate-800">{invoice.sender.accountName || invoice.sender.name}</strong></p>
          <div className="flex gap-4 pt-0.5">
            <p className="font-mono">Sort Code: <strong className="text-slate-900">{invoice.sender.sortCode || '00-00-00'}</strong></p>
            <p className="font-mono">Account No: <strong className="text-slate-900">{invoice.sender.accountNumber || '00000000'}</strong></p>
          </div>
        </div>

        <div className="text-xs text-slate-500 space-y-1">
          <span className="font-bold uppercase tracking-wider text-slate-700 block mb-1">
            Payment Terms
          </span>
          <p className="leading-relaxed">
            {invoice.paymentTerms ||
              'Payment due strictly within 14 days of invoice date. Please quote invoice number in bank transfer reference.'}
          </p>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="mt-8 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
        <p>
          {invoice.sender.name} &bull; {invoice.sender.address} &bull; UTR: {invoice.sender.utr} &bull; NI: {invoice.sender.niNumber}
        </p>
      </div>
    </div>
  </div>
  );
};
