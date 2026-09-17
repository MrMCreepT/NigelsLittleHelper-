import React, { useState } from 'react';
import { Invoice, LineItem } from '../types';
import { calculateInvoiceTotals, formatGBP, DEFAULT_CLIENT, DEFAULT_SENDER } from '../data/defaults';
import {
  Plus,
  Trash2,
  Copy,
  Building2,
  Calendar,
  CreditCard,
  User,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  Save,
  Download,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InvoiceEditorProps {
  invoice: Invoice;
  onChange: (updatedInvoice: Invoice) => void;
  onSave?: () => void;
  onDownloadPDF?: () => void;
  isGeneratingPdf?: boolean;
  lastSavedTime?: string;
}

export const InvoiceEditor: React.FC<InvoiceEditorProps> = ({
  invoice,
  onChange,
  onSave,
  onDownloadPDF,
  isGeneratingPdf = false,
  lastSavedTime,
}) => {
  const [showSenderDetails, setShowSenderDetails] = useState(false);

  const { subtotal, taxAmount, totalAmount } = calculateInvoiceTotals(
    invoice.items,
    invoice.taxRate
  );

  const updateField = <K extends keyof Invoice>(field: K, value: Invoice[K]) => {
    onChange({
      ...invoice,
      [field]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  const updateSender = (field: keyof Invoice['sender'], value: string) => {
    onChange({
      ...invoice,
      sender: {
        ...invoice.sender,
        [field]: value,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const updateClient = (field: keyof Invoice['client'], value: string) => {
    onChange({
      ...invoice,
      client: {
        ...invoice.client,
        [field]: value,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      description: '',
      hours: 1,
      rate: 45.0,
    };
    onChange({
      ...invoice,
      items: [...invoice.items, newItem],
      updatedAt: new Date().toISOString(),
    });
  };

  const duplicateLineItem = (index: number) => {
    const target = invoice.items[index];
    const duplicated: LineItem = {
      ...target,
      id: `item-${Date.now()}`,
    };
    const newItems = [...invoice.items];
    newItems.splice(index + 1, 0, duplicated);
    onChange({
      ...invoice,
      items: newItems,
      updatedAt: new Date().toISOString(),
    });
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const newItems = [...invoice.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    onChange({
      ...invoice,
      items: newItems,
      updatedAt: new Date().toISOString(),
    });
  };

  const removeLineItem = (index: number) => {
    const newItems = invoice.items.filter((_, i) => i !== index);
    onChange({
      ...invoice,
      items: newItems,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleFillCoseleyClient = () => {
    onChange({
      ...invoice,
      client: { ...DEFAULT_CLIENT },
      updatedAt: new Date().toISOString(),
    });
  };

  const handleResetSenderNigel = () => {
    onChange({
      ...invoice,
      sender: { ...DEFAULT_SENDER },
      updatedAt: new Date().toISOString(),
    });
  };

  const addQuickPresetItem = (desc: string, hours: number, rate: number) => {
    const newItem: LineItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      description: desc,
      hours,
      rate,
    };
    onChange({
      ...invoice,
      items: [...invoice.items, newItem],
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Document Information (Invoice #, Dates, Status) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-500" />
            Invoice Details & Timing
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              id="select-invoice-status"
              value={invoice.status}
              onChange={(e) => updateField('status', e.target.value as any)}
              className="text-xs font-semibold py-1 px-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Paid">Paid</option>
            </select>

            {onSave && (
              <motion.button
                whileTap={{ scale: 0.94 }}
                whileHover={{ scale: 1.02 }}
                type="button"
                onClick={onSave}
                id="btn-editor-header-save"
                className="ml-1 sm:ml-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shadow-emerald-600/20"
                title="Save invoice changes immediately (Ctrl+S)"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </motion.button>
            )}

            {onDownloadPDF && (
              <motion.button
                whileTap={{ scale: 0.94 }}
                whileHover={{ scale: 1.02 }}
                type="button"
                onClick={onDownloadPDF}
                disabled={isGeneratingPdf}
                id="btn-editor-header-pdf"
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                title="Download A4 PDF directly to your device"
              >
                {isGeneratingPdf ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>PDF</span>
              </motion.button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="invoice-number">
              Invoice Number
            </label>
            <input
              id="invoice-number"
              type="text"
              value={invoice.invoiceNumber}
              onChange={(e) => updateField('invoiceNumber', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
              placeholder="INV-2026-001"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="invoice-issue-date">
              Issue Date
            </label>
            <input
              id="invoice-issue-date"
              type="date"
              value={invoice.issueDate}
              onChange={(e) => updateField('issueDate', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="invoice-due-date">
              Due Date
            </label>
            <input
              id="invoice-due-date"
              type="date"
              value={invoice.dueDate}
              onChange={(e) => updateField('dueDate', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Sender Profile (Pre-populated with Nigel Chambers) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-sm">
              NC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  {invoice.sender.name || 'Nigel Chambers'}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Pre-configured Sender
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {invoice.sender.address || 'Click Edit Credentials to configure'}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="toggle-sender-details"
            onClick={() => setShowSenderDetails(!showSenderDetails)}
            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>{showSenderDetails ? 'Hide Credentials' : 'Edit Credentials'}</span>
            {showSenderDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Highlighted credentials preview badges */}
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <div className="bg-slate-100 border border-slate-200/80 rounded-lg px-2.5 py-1 text-slate-700 font-mono">
            <span className="text-slate-500 font-sans mr-1.5">UTR:</span>
            <strong className="text-slate-900">{invoice.sender.utr}</strong>
          </div>
          <div className="bg-slate-100 border border-slate-200/80 rounded-lg px-2.5 py-1 text-slate-700 font-mono">
            <span className="text-slate-500 font-sans mr-1.5">National Insurance:</span>
            <strong className="text-slate-900">{invoice.sender.niNumber}</strong>
          </div>
        </div>

        {/* Collapsible edit form for Nigel Chambers */}
        {showSenderDetails && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500 uppercase">Sender Profile Details</span>
              <button
                type="button"
                onClick={handleResetSenderNigel}
                className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                Reset to Nigel Chambers Default
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1" htmlFor="sender-name">
                  Full Name / Trading Name
                </label>
                <input
                  id="sender-name"
                  type="text"
                  value={invoice.sender.name}
                  onChange={(e) => updateSender('name', e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1" htmlFor="sender-address">
                  Registered Address
                </label>
                <input
                  id="sender-address"
                  type="text"
                  value={invoice.sender.address}
                  onChange={(e) => updateSender('address', e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1" htmlFor="sender-utr">
                  Unique Taxpayer Reference (UTR)
                </label>
                <input
                  id="sender-utr"
                  type="text"
                  value={invoice.sender.utr}
                  onChange={(e) => updateSender('utr', e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1" htmlFor="sender-ni">
                  National Insurance Number (NI)
                </label>
                <input
                  id="sender-ni"
                  type="text"
                  value={invoice.sender.niNumber}
                  onChange={(e) => updateSender('niNumber', e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1" htmlFor="sender-phone">
                  Phone Number
                </label>
                <input
                  id="sender-phone"
                  type="text"
                  value={invoice.sender.phone || ''}
                  onChange={(e) => updateSender('phone', e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1" htmlFor="sender-email">
                  Email Address
                </label>
                <input
                  id="sender-email"
                  type="email"
                  value={invoice.sender.email || ''}
                  onChange={(e) => updateSender('email', e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Client Section (Manual entry for Customer Details) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Customer / Client Section
            </h2>
          </div>

          <button
            type="button"
            id="btn-fill-coseley"
            onClick={handleFillCoseleyClient}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Load: The Coseley Heating, Plumbing Ltd</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="client-company-name">
              Company / Client Name *
            </label>
            <input
              id="client-company-name"
              type="text"
              value={invoice.client.companyName}
              onChange={(e) => updateClient('companyName', e.target.value)}
              placeholder="e.g. The Coseley Heating, Plumbing services limited"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="client-contact-name">
              Contact Person / Attention
            </label>
            <input
              id="client-contact-name"
              type="text"
              value={invoice.client.contactName}
              onChange={(e) => updateClient('contactName', e.target.value)}
              placeholder="e.g. Accounts Payable / Site Manager"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="client-address-1">
              Address Line 1
            </label>
            <input
              id="client-address-1"
              type="text"
              value={invoice.client.addressLine1}
              onChange={(e) => updateClient('addressLine1', e.target.value)}
              placeholder="e.g. Unit 4, Spring Road Industrial Estate"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="client-address-2">
              Address Line 2 (Optional)
            </label>
            <input
              id="client-address-2"
              type="text"
              value={invoice.client.addressLine2 || ''}
              onChange={(e) => updateClient('addressLine2', e.target.value)}
              placeholder="e.g. Coseley"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="client-city">
              Town / City
            </label>
            <input
              id="client-city"
              type="text"
              value={invoice.client.city}
              onChange={(e) => updateClient('city', e.target.value)}
              placeholder="e.g. Bilston"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="client-postcode">
              Postcode
            </label>
            <input
              id="client-postcode"
              type="text"
              value={invoice.client.postcode}
              onChange={(e) => updateClient('postcode', e.target.value)}
              placeholder="e.g. WV14 8JW"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="client-email">
              Client Email
            </label>
            <input
              id="client-email"
              type="email"
              value={invoice.client.email || ''}
              onChange={(e) => updateClient('email', e.target.value)}
              placeholder="accounts@example.co.uk"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="client-phone">
              Client Phone
            </label>
            <input
              id="client-phone"
              type="text"
              value={invoice.client.phone || ''}
              onChange={(e) => updateClient('phone', e.target.value)}
              placeholder="01902 555890"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Dynamic Line Items Section */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Work Items & Labor Hours
            </h2>
            <p className="text-xs text-slate-500">
              Enter description, hours worked, and hourly rate for automated 20% tax calculation.
            </p>
          </div>

          <button
            type="button"
            id="btn-add-line-item"
            onClick={addLineItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Line Item</span>
          </button>
        </div>

        {/* Quick presets for plumbing & heating trades */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-medium text-slate-400 mr-1">Quick Add:</span>
          <button
            type="button"
            onClick={() => addQuickPresetItem('Commercial heating manifold inspection and pipework replacement', 8, 45.0)}
            className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            + Heating Manifold (8h @ £45)
          </button>
          <button
            type="button"
            onClick={() => addQuickPresetItem('Boiler pressure testing, safety valve calibration & certification', 4, 45.0)}
            className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            + Boiler Test (4h @ £45)
          </button>
          <button
            type="button"
            onClick={() => addQuickPresetItem('Emergency call-out plumbing diagnostics & system drain-down', 3, 55.0)}
            className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            + Emergency Call-out (3h @ £55)
          </button>
        </div>

        {/* Line Items List */}
        <div className="space-y-3">
          {invoice.items.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
              <p className="text-xs text-slate-400 mb-2">No line items yet</p>
              <button
                type="button"
                onClick={addLineItem}
                className="text-xs font-semibold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add your first item
              </button>
            </div>
          ) : (
            <AnimatePresence>
              {invoice.items.map((item, idx) => {
                const itemHours = Number(item.hours) || 0;
                const itemRate = Number(item.rate) || 0;
                const lineTotal = itemHours * itemRate;

                return (
                  <motion.div
                    key={item.id || idx}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 space-y-2.5 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1" htmlFor={`item-desc-${idx}`}>
                          Description of Work / Service #{idx + 1}
                        </label>
                        <input
                          id={`item-desc-${idx}`}
                          type="text"
                          value={item.description}
                          onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                          placeholder="e.g. Commercial heating pipework repair..."
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-1 pt-5">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => duplicateLineItem(idx)}
                          title="Duplicate item"
                          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => removeLineItem(idx)}
                          title="Delete item"
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center pt-1">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1" htmlFor={`item-hours-${idx}`}>
                          Hours Worked
                        </label>
                        <input
                          id={`item-hours-${idx}`}
                          type="number"
                          min="0.1"
                          step="0.5"
                          value={item.hours}
                          onChange={(e) => updateLineItem(idx, 'hours', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1" htmlFor={`item-rate-${idx}`}>
                          Hourly Rate (£)
                        </label>
                        <input
                          id={`item-rate-${idx}`}
                          type="number"
                          min="0"
                          step="1"
                          value={item.rate}
                          onChange={(e) => updateLineItem(idx, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
                        />
                      </div>

                      <div className="sm:text-right pt-2 sm:pt-0">
                        <span className="block text-[11px] font-medium text-slate-400">Line Amount:</span>
                        <span className="text-sm font-bold font-mono text-slate-900">
                          {formatGBP(lineTotal)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Calculations & Automated 20% Tax Summary */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Automated 20% Tax Deduction & Totals
            </h3>
          </div>
          <span className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
            Auto-calculated (-tax)
          </span>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center text-slate-300">
            <span>Gross Subtotal (Hours &times; Rate):</span>
            <span className="font-mono font-medium text-white">{formatGBP(subtotal)}</span>
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <div className="flex items-center gap-2">
              <span>Tax Deduction Rate (CIS 20%):</span>
              <div className="inline-flex items-center gap-1 bg-red-950/60 border border-red-800/60 px-2 py-0.5 rounded text-xs font-mono text-red-300">
                <span>-20.0%</span>
              </div>
            </div>
            <span className="font-mono font-medium text-red-400">-{formatGBP(taxAmount)}</span>
          </div>

          <div className="border-t border-slate-800 pt-3 flex justify-between items-baseline">
            <div>
              <span className="text-base font-bold text-white block">Net Total Due to Contractor:</span>
              <span className="text-[11px] text-slate-400">Gross subtotal less 20% tax deduction (-tax)</span>
            </div>
            <span className="text-2xl font-bold font-mono text-amber-400 tracking-tight">
              {formatGBP(totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Terms & Remittance Information */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
          Payment Terms & Bank Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="payment-terms">
              Payment Terms
            </label>
            <textarea
              id="payment-terms"
              rows={2}
              value={invoice.paymentTerms}
              onChange={(e) => updateField('paymentTerms', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500/40 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="invoice-notes">
              Compliance & Notes
            </label>
            <textarea
              id="invoice-notes"
              rows={2}
              value={invoice.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500/40 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div>
            <label className="block text-[11px] text-slate-500 mb-0.5" htmlFor="bank-name">Bank</label>
            <input
              id="bank-name"
              type="text"
              value={invoice.sender.bankName || ''}
              onChange={(e) => updateSender('bankName', e.target.value)}
              className="w-full px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-500 mb-0.5" htmlFor="account-name">Account Name</label>
            <input
              id="account-name"
              type="text"
              value={invoice.sender.accountName || ''}
              onChange={(e) => updateSender('accountName', e.target.value)}
              className="w-full px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-500 mb-0.5" htmlFor="sort-code">Sort Code</label>
            <input
              id="sort-code"
              type="text"
              value={invoice.sender.sortCode || ''}
              onChange={(e) => updateSender('sortCode', e.target.value)}
              className="w-full px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800 font-bold"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-500 mb-0.5" htmlFor="account-number">Account Number</label>
            <input
              id="account-number"
              type="text"
              value={invoice.sender.accountNumber || ''}
              onChange={(e) => updateSender('accountNumber', e.target.value)}
              className="w-full px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800 font-bold"
            />
          </div>
        </div>
      </div>

      {/* Bottom Save & Local Persistence Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono self-start sm:self-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{lastSavedTime ? `Status: ${lastSavedTime}` : 'All changes saved locally'}</span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {onSave && (
            <motion.button
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.02 }}
              type="button"
              onClick={onSave}
              id="btn-editor-save-bottom"
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <Save className="w-4 h-4 text-emerald-400" />
              <span>Save Changes</span>
            </motion.button>
          )}

          {onDownloadPDF && (
            <motion.button
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.02 }}
              type="button"
              onClick={onDownloadPDF}
              disabled={isGeneratingPdf}
              id="btn-editor-pdf-bottom"
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};
