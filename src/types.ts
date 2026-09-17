export interface SenderProfile {
  name: string;
  address: string;
  utr: string;
  niNumber: string;
  phone?: string;
  email?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  sortCode?: string;
}

export interface ClientProfile {
  companyName: string;
  contactName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode: string;
  email?: string;
  phone?: string;
}

export interface LineItem {
  id: string;
  description: string;
  hours: number;
  rate: number;
}

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  sender: SenderProfile;
  client: ClientProfile;
  items: LineItem[];
  taxRate: number; // e.g. 20 for 20%
  taxLabel: string; // e.g. "Tax (20%)" or "VAT (20%)"
  notes: string;
  paymentTerms: string;
  createdAt: string;
  updatedAt: string;
}
