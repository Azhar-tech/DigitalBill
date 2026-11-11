export type Category = 'item' | 'service' | 'packaging' | 'delivery' | 'other';

export interface LineItem {
  id: string;
  particulars: string;
  quantity: number;
  unitPrice?: number;
  amount: number;
  category?: Category;
}
export interface StoreInfo { name: string; tagline: string; address: string; phoneNumbers: string[]; logoUrl?: string }
export interface CustomerInfo { name: string; phone?: string; address?: string }

export interface BillData {
  id: string;
  invoiceNo: string;
  bookingDate: string;
  deliveryDate?: string;
  deliveryTime?: string;
  store: StoreInfo;
  customer: CustomerInfo;
  items: LineItem[];
  subtotal: number;
  packagingCharges: number;
  deliveryCharges: number;
  discount: number;
  tax: number;
  taxPercentage?: number;
  totalAmount: number;
  /** When set (and manualTotalEnabled), replaces the computed total. */
  manualTotalEnabled?: boolean;
  manualTotal?: number;
  paidAmount?: number;
  paymentStatus: 'paid' | 'pending' | 'partial';
  currency: 'PKR';
  currencySymbol: string;
  notes?: string;
  termsAndConditions?: string;
}

export interface Preset { id: string; label: string; price: number; category: Category }
export interface Settings { store: StoreInfo; presets: Preset[]; currencySymbol: string }
