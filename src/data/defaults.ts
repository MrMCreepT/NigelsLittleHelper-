import { Invoice, SenderProfile, ClientProfile, LineItem } from '../types';

export const DEFAULT_SENDER: SenderProfile = {
  name: 'Nigel Chambers',
  address: '[Business Address, Line 1, Postcode]',
  utr: '[HMRC UTR]',
  niNumber: '[NI Number]',
  phone: '07000 000000',
  email: 'contractor@example.co.uk',
  bankName: 'Barclays Bank UK',
  accountName: 'Nigel Chambers',
  accountNumber: '00000000',
  sortCode: '00-00-00',
};

export const DEFAULT_CLIENT: ClientProfile = {
  companyName: 'Client Heating & Plumbing Ltd',
  contactName: 'Accounts Payable',
  addressLine1: 'Unit 4, Spring Road Industrial Estate',
  addressLine2: '',
  city: 'Bilston',
  postcode: 'WV14 000',
  email: 'accounts@clientcompany.co.uk',
  phone: '01902 000000',
};

export const SAMPLE_LINE_ITEMS: LineItem[] = [
  {
    id: 'item-1',
    description: 'Commercial heating manifold inspection and pipework replacement',
    hours: 16,
    rate: 45.0,
  },
  {
    id: 'item-2',
    description: 'Boiler pressure testing, safety valve calibration & certification',
    hours: 8.5,
    rate: 45.0,
  },
  {
    id: 'item-3',
    description: 'Emergency call-out plumbing diagnostics & system drain-down',
    hours: 4,
    rate: 55.0,
  },
];

export const INITIAL_INVOICE: Invoice = {
  id: 'inv-init-001',
  invoiceNumber: 'INV-2026-001',
  issueDate: '2026-09-17',
  dueDate: '2026-10-01',
  status: 'Draft',
  sender: DEFAULT_SENDER,
  client: DEFAULT_CLIENT,
  items: SAMPLE_LINE_ITEMS,
  taxRate: 20,
  taxLabel: 'Less Tax (20%)',
  notes: 'All plumbing and heating works completed to British Standards BS 6700 and current building regulations. Thank you for your business.',
  paymentTerms: 'Payment due strictly within 14 days of invoice date via BACS transfer.',
  createdAt: '2026-09-17T08:00:00.000Z',
  updatedAt: '2026-09-17T08:00:00.000Z',
};

export function calculateInvoiceTotals(items: LineItem[], taxRate: number) {
  const subtotal = items.reduce((acc, item) => {
    const hours = Number(item.hours) || 0;
    const rate = Number(item.rate) || 0;
    return acc + hours * rate;
  }, 0);

  const taxAmount = (subtotal * (Number(taxRate) || 0)) / 100;
  // Subcontractor tax (e.g. CIS 20% deduction) is deducted from the subtotal: -tax, not +tax
  const totalAmount = Math.max(0, subtotal - taxAmount);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
  };
}

export function formatGBP(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
