import React, { useState } from 'react';
import { Invoice } from '../types';
import { calculateInvoiceTotals, formatGBP } from '../data/defaults';
import {
  X,
  Search,
  FileText,
  Calendar,
  Building2,
  Trash2,
  Copy,
  FolderOpen,
  Download,
  Upload,
  CheckCircle2,
} from 'lucide-react';

interface InvoiceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
  activeInvoiceId: string;
  onSelectInvoice: (invoice: Invoice) => void;
  onDuplicateInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onImportInvoices: (imported: Invoice[]) => void;
}

export const InvoiceHistoryModal: React.FC<InvoiceHistoryModalProps> = ({
  isOpen,
  onClose,
  invoices,
  activeInvoiceId,
  onSelectInvoice,
  onDuplicateInvoice,
  onDeleteInvoice,
  onImportInvoices,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Draft' | 'Sent' | 'Paid'>('All');

  if (!isOpen) return null;

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.issueDate.includes(searchTerm);

    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(invoices, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nigel-chambers-invoices-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed) && parsed.length > 0) {
            onImportInvoices(parsed);
          } else {
            alert('Invalid invoice backup file format.');
          }
        } catch {
          alert('Could not parse JSON file.');
        }
      };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Saved Invoices Ledger</h2>
              <p className="text-xs text-slate-500">Stored persistently in browser localStorage</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between bg-white">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by invoice # or client..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-medium text-slate-600">
              {(['All', 'Draft', 'Sent', 'Paid'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    statusFilter === st
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Invoices List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No matching invoices found in your storage ledger.
            </div>
          ) : (
            filteredInvoices.map((inv) => {
              const { totalAmount } = calculateInvoiceTotals(inv.items, inv.taxRate);
              const isActive = inv.id === activeInvoiceId;

              return (
                <div
                  key={inv.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-400/30'
                      : 'bg-slate-50/70 border-slate-200/90 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-sm text-slate-900">
                        {inv.invoiceNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : inv.status === 'Sent'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {inv.status}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-amber-600" />
                          Currently Open
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1 text-slate-700 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {inv.client.companyName || 'No Client Name Specified'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {inv.issueDate}
                      </span>
                      <span>
                        {inv.items.length} {inv.items.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                    <div className="text-left sm:text-right">
                      <span className="block text-[10px] font-medium text-slate-400">Amount Due:</span>
                      <span className="font-mono font-bold text-sm text-slate-900">
                        {formatGBP(totalAmount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          onSelectInvoice(inv);
                          onClose();
                        }}
                        title="Open & Edit this invoice"
                        className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Open</span>
                      </button>

                      <button
                        onClick={() => onDuplicateInvoice(inv)}
                        title="Duplicate as new invoice"
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {invoices.length > 1 && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete invoice ${inv.invoiceNumber}?`)) {
                              onDeleteInvoice(inv.id);
                            }
                          }}
                          title="Delete invoice"
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Backup Export & Import */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportJSON}
              className="text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Invoices Backup (JSON)</span>
            </button>

            <label className="text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Import Backup</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
          </div>

          <span className="text-slate-400 font-mono text-[11px]">
            Total Saved: {invoices.length}
          </span>
        </div>
      </div>
    </div>
  );
};
