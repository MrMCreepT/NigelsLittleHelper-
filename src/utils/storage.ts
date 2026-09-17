import { Invoice, SenderProfile } from '../types';
import { INITIAL_INVOICE, DEFAULT_SENDER } from '../data/defaults';

const INVOICES_STORAGE_KEY = 'nigel_chambers_invoices_v1';
const AUTH_STORAGE_KEY = 'nigel_chambers_auth_v1';
const SENDER_PROFILE_KEY = 'nigel_chambers_sender_profile_v1';

export function getStoredSenderProfile(): SenderProfile {
  try {
    const raw = localStorage.getItem(SENDER_PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return { ...DEFAULT_SENDER, ...parsed };
      }
    }
  } catch (err) {
    console.error('Failed to read contractor profile from localStorage', err);
  }
  return { ...DEFAULT_SENDER };
}

export function saveStoredSenderProfile(profile: SenderProfile): void {
  try {
    localStorage.setItem(SENDER_PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save contractor profile to localStorage', err);
  }
}

export function getStoredInvoices(): Invoice[] {
  try {
    const raw = localStorage.getItem(INVOICES_STORAGE_KEY);
    if (!raw) {
      // Seed with default invoice merged with any stored sender profile
      const userProfile = getStoredSenderProfile();
      const initialWithProfile = { ...INITIAL_INVOICE, sender: userProfile };
      localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify([initialWithProfile]));
      return [initialWithProfile];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    const userProfile = getStoredSenderProfile();
    return [{ ...INITIAL_INVOICE, sender: userProfile }];
  } catch (err) {
    console.error('Failed to read invoices from localStorage', err);
    return [INITIAL_INVOICE];
  }
}

export function saveStoredInvoices(invoices: Invoice[]): void {
  try {
    localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));
  } catch (err) {
    console.error('Failed to write invoices to localStorage', err);
  }
}

export function generateNextInvoiceNumber(existing: Invoice[]): string {
  const currentYear = new Date().getFullYear();
  let maxSeq = 0;
  for (const inv of existing) {
    const match = inv.invoiceNumber?.match(/INV-(\d{4})-(\d+)/i);
    if (match) {
      const year = parseInt(match[1], 10);
      const seq = parseInt(match[2], 10);
      if (year === currentYear && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  }
  const nextSeq = String(maxSeq + 1).padStart(3, '0');
  return `INV-${currentYear}-${nextSeq}`;
}

export function createNewBlankInvoice(existing: Invoice[]): Invoice {
  const today = new Date();
  const due = new Date();
  due.setDate(today.getDate() + 14);

  const issueStr = today.toISOString().split('T')[0];
  const dueStr = due.toISOString().split('T')[0];

  return {
    id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    invoiceNumber: generateNextInvoiceNumber(existing),
    issueDate: issueStr,
    dueDate: dueStr,
    status: 'Draft',
    sender: getStoredSenderProfile(),
    client: {
      companyName: '',
      contactName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      postcode: '',
      email: '',
      phone: '',
    },
    items: [
      {
        id: `item-${Date.now()}`,
        description: 'Plumbing & heating contractor services',
        hours: 8,
        rate: 45.0,
      },
    ],
    taxRate: 20,
    taxLabel: 'Less Tax (20%)',
    notes: 'All plumbing and heating works completed to British Standards. Thank you for your business.',
    paymentTerms: 'Payment due strictly within 14 days of invoice date via BACS transfer.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

const LOGGED_OUT_KEY = 'nigel_chambers_logged_out_v1';

export function getStoredAuth(): boolean {
  // 1. In-memory window variable
  if (typeof window !== 'undefined' && (window as any).__NC_AUTH_VALID === true) {
    return true;
  }

  // 2. Check if explicitly logged out
  try {
    if (localStorage.getItem(LOGGED_OUT_KEY) === 'true' || sessionStorage.getItem(LOGGED_OUT_KEY) === 'true') {
      return false;
    }
  } catch {}

  // 3. Check active session storage
  try {
    if (sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true') {
      return true;
    }
  } catch {}

  // 4. Check localStorage persistent session
  try {
    if (localStorage.getItem(AUTH_STORAGE_KEY) === 'true') {
      return true;
    }
  } catch {}

  return false;
}

export function setStoredAuth(val: boolean): void {
  if (typeof window !== 'undefined') {
    (window as any).__NC_AUTH_VALID = val;
  }

  if (val) {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      localStorage.removeItem(LOGGED_OUT_KEY);
    } catch {}

    try {
      sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
      sessionStorage.removeItem(LOGGED_OUT_KEY);
    } catch {}
  } else {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, 'false');
      localStorage.setItem(LOGGED_OUT_KEY, 'true');
    } catch {}

    try {
      sessionStorage.setItem(AUTH_STORAGE_KEY, 'false');
      sessionStorage.setItem(LOGGED_OUT_KEY, 'true');
    } catch {}
  }
}
