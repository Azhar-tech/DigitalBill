import type { BillData, Preset, Settings, StoreInfo } from '../types';

export const DEFAULT_STORE: StoreInfo = {
  name: 'NEW WAY',
  tagline: 'DRY CLEAN & STEAM PRESS',
  address: 'Shop # 4, Mughal Plaza, Idrees Market, F-10/2, Islamabad.',
  phoneNumbers: ['0323-5557878', '0349-5963359'],
};

export const DEFAULT_PRESETS: Preset[] = [
  { id: 'p1', label: 'Steam Press / Ironing', price: 60, category: 'service' },
  { id: 'p2', label: 'Shirt Dry Clean', price: 250, category: 'service' },
  { id: 'p3', label: 'Packaging Charges', price: 300, category: 'packaging' },
  { id: 'p4', label: 'Delivery Charges', price: 500, category: 'delivery' },
];

export const DEFAULT_SETTINGS: Settings = {
  store: DEFAULT_STORE,
  presets: DEFAULT_PRESETS,
  currencySymbol: 'Rs.',
};

/** Seed bill taken from the reference sample. Rows add to 3210; the owner hand-rounded to 3200. */
export const SAMPLE_BILL: BillData = {
  id: 'sample-5928',
  invoiceNo: '5928',
  bookingDate: '2026-06-09',
  deliveryDate: '2026-06-09',
  deliveryTime: '',
  store: DEFAULT_STORE,
  customer: { name: 'Adeel Sahib', phone: '', address: 'F-10/2 Islamabad' },
  items: [
    { id: 's1', particulars: 'Steam Press / Ironing', quantity: 36, unitPrice: 60, amount: 2160, category: 'service' },
    { id: 's2', particulars: 'Shirt Dry Clean', quantity: 1, amount: 250, category: 'service' },
    { id: 's3', particulars: 'Packaging Charges', quantity: 1, amount: 300, category: 'packaging' },
    { id: 's4', particulars: 'Delivery Charges', quantity: 1, amount: 500, category: 'delivery' },
  ],
  subtotal: 3210,
  packagingCharges: 0,
  deliveryCharges: 0,
  discount: 0,
  tax: 0,
  totalAmount: 3200,
  manualTotalEnabled: true,
  manualTotal: 3200,
  paymentStatus: 'pending',
  currency: 'PKR',
  currencySymbol: 'Rs.',
};
