import React, { useState, useEffect } from 'react';
import { Invoice, SenderProfile } from './types';
import {
  getStoredInvoices,
  saveStoredInvoices,
  createNewBlankInvoice,
  getStoredAuth,
  setStoredAuth,
} from './utils/storage';
import { downloadInvoicePDF } from './utils/pdfGenerator';
import { AuthScreen } from './components/AuthScreen';
import { InvoiceEditor } from './components/InvoiceEditor';
import { InvoicePreview } from './components/InvoicePreview';
import { InvoiceHistoryModal } from './components/InvoiceHistoryModal';
import { EmailModal } from './components/EmailModal';
import { PasscodeSettingsModal } from './components/PasscodeSettingsModal';
import { ContractorProfileModal } from './components/ContractorProfileModal';
import {
  FileText,
  Plus,
  Printer,
  Mail,
  History,
  LogOut,
  Eye,
  Edit3,
  Columns,
  ShieldCheck,
  Check,
  Building,
  Building2,
  Save,
  Download,
  Loader2,
  Share2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => getStoredAuth());
  const [invoices, setInvoices] = useState<Invoice[]>(() => getStoredInvoices());
  const [activeInvoiceId, setActiveInvoiceId] = useState<string>(() => {
    const list = getStoredInvoices();
    return list[0]?.id || '';
  });

  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Saved');
  const [showSaveToast, setShowSaveToast] = useState(false);

  // PDF Generation State
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgressStatus, setPdfProgressStatus] = useState<string>('');
  const [showPdfSuccessToast, setShowPdfSuccessToast] = useState(false);

  // Active invoice object
  const currentInvoice =
    invoices.find((inv) => inv.id === activeInvoiceId) || invoices[0] || createNewBlankInvoice([]);

  const handleSaveActiveInvoice = () => {
    if (invoices.length > 0) {
      saveStoredInvoices(invoices);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSavedTime(timeStr);
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 2500);
    }
  };

  // Direct PDF Download and Mobile Share handler
  const handleDownloadPDF = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    setPdfProgressStatus('Preparing document...');

    // Always ensure current invoice data is saved locally first
    saveStoredInvoices(invoices);

    try {
      const success = await downloadInvoicePDF(currentInvoice, {
        onProgress: (status) => setPdfProgressStatus(status),
      });

      if (success) {
        setShowPdfSuccessToast(true);
        setTimeout(() => setShowPdfSuccessToast(false), 3500);
      }
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgressStatus('');
    }
  };

  // Sync invoices to localStorage on change
  useEffect(() => {
    if (invoices.length > 0 && isAuthenticated) {
      saveStoredInvoices(invoices);
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  }, [invoices, isAuthenticated]);

  // Intercept Ctrl+S / Cmd+S to save locally and prevent browser / iframe save & reload
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        e.stopPropagation();
        handleSaveActiveInvoice();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [invoices]);

  const handleLoginSuccess = () => {
    setStoredAuth(true);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setStoredAuth(false);
    setIsAuthenticated(false);
  };

  const handleUpdateCurrentInvoice = (updated: Invoice) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === updated.id ? updated : inv))
    );
    setStoredAuth(true);
  };

  const handleProfileUpdated = (updatedProfile: SenderProfile) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === activeInvoiceId ? { ...inv, sender: updatedProfile } : inv
      )
    );
  };

  const handleCreateNewInvoice = () => {
    const newInv = createNewBlankInvoice(invoices);
    const updatedList = [newInv, ...invoices];
    setInvoices(updatedList);
    setActiveInvoiceId(newInv.id);
    setViewMode('split');
  };

  const handleDuplicateInvoice = (target: Invoice) => {
    const newInv: Invoice = {
      ...target,
      id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      invoiceNumber: `${target.invoiceNumber}-COPY`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedList = [newInv, ...invoices];
    setInvoices(updatedList);
    setActiveInvoiceId(newInv.id);
    setIsHistoryOpen(false);
  };

  const handleDeleteInvoice = (id: string) => {
    if (invoices.length <= 1) {
      alert('You must keep at least one invoice in the storage ledger.');
      return;
    }
    const updatedList = invoices.filter((inv) => inv.id !== id);
    setInvoices(updatedList);
    if (activeInvoiceId === id) {
      setActiveInvoiceId(updatedList[0].id);
    }
  };

  const handleImportInvoices = (imported: Invoice[]) => {
    setInvoices(imported);
    if (imported[0]) {
      setActiveInvoiceId(imported[0].id);
    }
    setIsHistoryOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  // If not authenticated, display login screen
  if (!isAuthenticated) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Application Navbar (Hidden when printing) */}
      <header className="no-print sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand & Active Invoice Indicator */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20 shrink-0">
              <FileText className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="font-bold text-sm sm:text-base text-white hover:text-amber-400 truncate cursor-pointer transition-colors text-left"
                  title="Click to edit your business and bank details (saved locally)"
                >
                  {currentInvoice.sender.name || 'Nigel Chambers'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors cursor-pointer"
                  title="Manage bank & tax profile"
                >
                  <ShieldCheck className="w-3 h-3" />
                  {currentInvoice.sender.utr && currentInvoice.sender.utr !== '[HMRC UTR]'
                    ? `UTR ${currentInvoice.sender.utr}`
                    : 'Bank & Tax'}
                </button>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-mono truncate">
                {currentInvoice.invoiceNumber} &bull; {currentInvoice.client.companyName || 'No Client'}
              </p>
            </div>
          </div>

          {/* Center: View Layout Switcher (Desktop) */}
          <div className="hidden lg:flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700/60 text-xs">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('editor')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'editor'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editor</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Side-by-Side</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'preview'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Document</span>
            </motion.button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Primary Action: Download PDF */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.03 }}
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              id="btn-download-pdf"
              className="px-3 sm:px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-colors cursor-pointer disabled:opacity-50"
              title="Generate and download A4 PDF document"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span className="hidden xs:inline">Download PDF</span>
              <span className="xs:hidden">PDF</span>
            </motion.button>

            {/* Save to LocalStorage */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.02 }}
              onClick={handleSaveActiveInvoice}
              id="btn-save-invoice"
              className="px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Save invoice changes immediately (Ctrl+S)"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Save</span>
            </motion.button>

            {/* New Document */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.02 }}
              onClick={handleCreateNewInvoice}
              id="btn-new-invoice"
              className="hidden md:flex px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium items-center gap-1.5 transition-colors cursor-pointer"
              title="Create a new blank invoice"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </motion.button>

            {/* Saved Ledger */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setIsHistoryOpen(true)}
              id="btn-open-history"
              className="px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="View all saved invoices in localStorage"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Saved</span>
              <span className="bg-slate-700 text-amber-300 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
                {invoices.length}
              </span>
            </motion.button>

            {/* Contractor Profile & Bank Details */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setIsProfileModalOpen(true)}
              id="btn-open-profile"
              className="px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Edit Bank Details, UTR, NI & Address (saved locally on this device)"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Bank & Tax</span>
            </motion.button>

            {/* Print button on desktop */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.02 }}
              onClick={handlePrint}
              id="btn-print-pdf"
              className="hidden lg:flex px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium items-center gap-1.5 transition-colors cursor-pointer"
              title="Print via browser dialog"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>Print</span>
            </motion.button>

            {/* Email Dispatch */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setIsEmailOpen(true)}
              id="btn-open-email"
              className="hidden sm:flex px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium items-center gap-1.5 transition-colors cursor-pointer"
              title="Send invoice via email"
            >
              <Mail className="w-3.5 h-3.5 text-slate-300" />
              <span>Email</span>
            </motion.button>

            {/* Security & Passcode Settings */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => setIsSecurityModalOpen(true)}
              id="btn-security-settings"
              className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Passcode & Security Settings (Git-Safe)"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </motion.button>

            {/* Sign Out / Lock */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={handleLogout}
              id="btn-logout"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Lock Workspace / Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Sub-bar on Mobile / Tablet for switching between Editor and Preview */}
      <div className="no-print lg:hidden bg-white border-b border-slate-200 px-3 py-2 flex items-center justify-between shadow-xs">
        <div className="flex gap-1.5">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => setViewMode('editor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
              viewMode === 'editor'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Form Editor</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => setViewMode('preview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
              viewMode === 'preview'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>A4 Preview</span>
          </motion.button>
        </div>

        <span className="text-[11px] text-slate-500 font-mono">
          Auto-saved {lastSavedTime}
        </span>
      </div>

      {/* Save Toast Notification */}
      <AnimatePresence>
        {showSaveToast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="no-print fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2.5"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>Changes saved to localStorage</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF Download Success Toast Notification */}
      <AnimatePresence>
        {showPdfSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="no-print fixed bottom-20 lg:bottom-6 left-4 lg:left-6 z-50 bg-amber-500 text-slate-950 text-xs font-bold px-4 py-3 rounded-2xl shadow-xl border border-amber-600/30 flex items-center gap-2.5"
          >
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            <span>PDF downloaded & ready on your device!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF Progress Modal Overlay */}
      <AnimatePresence>
        {isGeneratingPdf && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="no-print fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.92, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="bg-white text-slate-900 rounded-3xl p-6 shadow-2xl max-w-xs w-full text-center space-y-4 border border-slate-200"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
                <Loader2 className="w-7 h-7 animate-spin" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">Exporting PDF</h3>
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  {pdfProgressStatus || 'Generating document...'}
                </p>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-amber-500 animate-pulse w-full rounded-full" />
              </div>
              <p className="text-[11px] text-slate-400">
                Optimized for phone files & direct sharing
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Workspace (Padded bottom for mobile navigation) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 pb-24 lg:pb-8">
        {/* Layout Modes */}
        {viewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Interactive Form Editor */}
            <div className="no-print lg:col-span-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Invoice Editor</h2>
                <span className="text-xs text-slate-500 font-mono">
                  Saved locally &bull; {lastSavedTime}
                </span>
              </div>
              <InvoiceEditor
                invoice={currentInvoice}
                onChange={handleUpdateCurrentInvoice}
                onSave={handleSaveActiveInvoice}
                onDownloadPDF={handleDownloadPDF}
                isGeneratingPdf={isGeneratingPdf}
                lastSavedTime={lastSavedTime}
              />
            </div>

            {/* Right: Printable A4 Document Preview */}
            <div className="lg:col-span-6 sticky top-24">
              <div className="no-print mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-amber-600" />
                  Live Document Output (A4)
                </h2>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPdf}
                    className="text-amber-700 hover:text-amber-800 font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PDF
                  </button>
                  <span className="text-slate-300">&bull;</span>
                  <button
                    onClick={handlePrint}
                    className="text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print
                  </button>
                </div>
              </div>
              <InvoicePreview
                invoice={currentInvoice}
                id="invoice-document"
                onDownloadPDF={handleDownloadPDF}
                isGeneratingPdf={isGeneratingPdf}
              />
            </div>
          </div>
        )}

        {viewMode === 'editor' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="no-print flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Invoice Form Editor</h2>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('preview')}
                className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                View Document Output &rarr;
              </motion.button>
            </div>
            <InvoiceEditor
              invoice={currentInvoice}
              onChange={handleUpdateCurrentInvoice}
              onSave={handleSaveActiveInvoice}
              onDownloadPDF={handleDownloadPDF}
              isGeneratingPdf={isGeneratingPdf}
              lastSavedTime={lastSavedTime}
            />
          </div>
        )}

        {viewMode === 'preview' && (
          <div className="space-y-6">
            <div className="no-print max-w-4xl mx-auto flex items-center justify-between">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('editor')}
                className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
              >
                &larr; Back to Form Editor
              </motion.button>
              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPdf}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-amber-500/20 disabled:opacity-50"
                >
                  {isGeneratingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  <span>Download PDF</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setIsEmailOpen(true)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </motion.button>
              </div>
            </div>
            <InvoicePreview
              invoice={currentInvoice}
              id="invoice-document"
              onDownloadPDF={handleDownloadPDF}
              isGeneratingPdf={isGeneratingPdf}
            />
          </div>
        )}
      </main>

      {/* Sticky Bottom Navigation Bar for Mobile Phones (Thumb-friendly) */}
      <nav className="no-print lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-3 py-2 flex items-center justify-around shadow-2xl">
        {/* Editor Tab */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setViewMode('editor')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors cursor-pointer ${
            viewMode === 'editor' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Edit3 className="w-5 h-5" />
          <span className="text-[10px]">Editor</span>
        </motion.button>

        {/* Preview Tab */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setViewMode('preview')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors cursor-pointer ${
            viewMode === 'preview' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Eye className="w-5 h-5" />
          <span className="text-[10px]">Preview</span>
        </motion.button>

        {/* Standout Download PDF Button */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.04 }}
          onClick={handleDownloadPDF}
          disabled={isGeneratingPdf}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-2xl shadow-lg shadow-amber-500/30 cursor-pointer disabled:opacity-50"
        >
          {isGeneratingPdf ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>PDF</span>
        </motion.button>

        {/* Saved Ledger Drawer */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsHistoryOpen(true)}
          className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-slate-400 hover:text-slate-200 transition-colors cursor-pointer relative"
        >
          <History className="w-5 h-5" />
          <span className="text-[10px]">Saved</span>
          <span className="absolute top-0 right-1.5 bg-amber-500 text-slate-950 text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {invoices.length}
          </span>
        </motion.button>

        {/* Share / Email */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsEmailOpen(true)}
          className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <Mail className="w-5 h-5" />
          <span className="text-[10px]">Email</span>
        </motion.button>
      </nav>

      {/* Persistent Storage & History Ledger Modal */}
      <InvoiceHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        invoices={invoices}
        activeInvoiceId={activeInvoiceId}
        onSelectInvoice={(inv) => setActiveInvoiceId(inv.id)}
        onDuplicateInvoice={handleDuplicateInvoice}
        onDeleteInvoice={handleDeleteInvoice}
        onImportInvoices={handleImportInvoices}
      />

      {/* Email Export & Dispatch Modal */}
      <EmailModal
        isOpen={isEmailOpen}
        onClose={() => setIsEmailOpen(false)}
        invoice={currentInvoice}
      />

      {/* Security & Master Passcode Management Modal */}
      <PasscodeSettingsModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        onLockWorkspace={handleLogout}
      />

      {/* Contractor Business & Bank Details Modal */}
      <ContractorProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onProfileUpdated={handleProfileUpdated}
      />
    </div>
  );
}
