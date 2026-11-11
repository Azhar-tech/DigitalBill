import type { BillData, LineItem } from '../types';

export const round2 = (n: number) => Math.round((Number.isFinite(n) ? n : 0) * 100) / 100;
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
export const num = (v: unknown) => { const n = parseFloat(String(v)); return Number.isFinite(n) ? n : 0; };

export function calculateBillTotals(b: BillData): BillData {
  const subtotal = round2(b.items.reduce((s, i) => s + (Number(i.amount) || 0), 0));
  const base = subtotal + (b.packagingCharges || 0) + (b.deliveryCharges || 0) - (b.discount || 0);
  const tax = b.taxPercentage ? round2((base * b.taxPercentage) / 100) : round2(b.tax || 0);
  const computed = round2(Math.max(0, base + tax));
  const totalAmount = b.manualTotalEnabled ? round2(Math.max(0, b.manualTotal || 0)) : computed;
  return { ...b, subtotal, tax, totalAmount };
}

/** "36 pcs Steam Press" -> "Steam Press" */
export function cleanParticulars(s: string): string {
  return s.replace(/^\s*\d+(\.\d+)?\s*(pcs?\.?|pieces?|nos?\.?|x)?\s+(?=\S)/i, '').trim();
}

export const formatAmount = (n: number) => round2(n).toLocaleString('en-US', { maximumFractionDigits: 2 });
export const formatTotal = (n: number) => `${Number.isInteger(round2(n)) ? round2(n) : round2(n).toFixed(2)}/-`;

export const todayISO = () => {
  const d = new Date();
  const p = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export function emptyBill(store: BillData['store'], invoiceNo: string, currencySymbol = 'Rs.'): BillData {
  return {
    id: uid(), invoiceNo, bookingDate: todayISO(), deliveryDate: '', deliveryTime: '',
    store: { ...store, phoneNumbers: [...store.phoneNumbers] },
    customer: { name: '', phone: '', address: '' },
    items: [], subtotal: 0, packagingCharges: 0, deliveryCharges: 0, discount: 0, tax: 0,
    totalAmount: 0, paymentStatus: 'pending', currency: 'PKR', currencySymbol,
  };
}

export function newItem(p: Partial<LineItem> = {}): LineItem {
  return { id: uid(), particulars: '', quantity: 1, amount: 0, category: 'item', ...p };
}

/** Lines shown on the receipt: items plus any separate charge fields. */
export function receiptRows(b: BillData) {
  const rows = b.items
    .filter((i) => i.particulars.trim() || i.amount)
    .map((i) => ({ key: i.id, label: cleanParticulars(i.particulars), qty: String(i.quantity ?? ''), amount: formatAmount(i.amount) }));
  if (b.packagingCharges > 0) rows.push({ key: 'pk', label: 'Packaging Charges', qty: '1', amount: formatAmount(b.packagingCharges) });
  if (b.deliveryCharges > 0) rows.push({ key: 'dl', label: 'Delivery Charges', qty: '1', amount: formatAmount(b.deliveryCharges) });
  if (b.discount > 0) rows.push({ key: 'ds', label: 'Discount', qty: '', amount: '-' + formatAmount(b.discount) });
  if (b.tax > 0) rows.push({ key: 'tx', label: b.taxPercentage ? `Tax (${b.taxPercentage}%)` : 'Tax', qty: '', amount: formatAmount(b.tax) });
  return rows;
}

/** Pakistan: 0300... -> 92300... */
export function waNumber(phone?: string) {
  let d = (phone || '').replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('0')) d = '92' + d.slice(1);
  return d;
}

export function generateWhatsAppMessage(b: BillData): string {
  const sym = b.currencySymbol || 'Rs.';
  const L: string[] = [];
  const line = '--------------------';
  L.push('*OFFICIAL BILL / RECEIPT*', b.store.name.toUpperCase());
  if (b.store.phoneNumbers.length) L.push('Contact: ' + b.store.phoneNumbers.join(', '));
  L.push(line, `Invoice No: ${b.invoiceNo}`);
  if (b.customer.name) L.push(`Customer: ${b.customer.name}`);
  L.push(`Booking Date: ${b.bookingDate}`);
  if (b.deliveryDate) L.push(`Delivery: ${b.deliveryDate}${b.deliveryTime ? ' ' + b.deliveryTime : ''}`);
  L.push(line);
  b.items.forEach((i, n) => L.push(`${n + 1}. ${cleanParticulars(i.particulars)} (${i.quantity}x) - ${sym} ${formatAmount(i.amount)}`));
  if (b.packagingCharges > 0) L.push(`Packaging: ${sym} ${formatAmount(b.packagingCharges)}`);
  if (b.deliveryCharges > 0) L.push(`Delivery: ${sym} ${formatAmount(b.deliveryCharges)}`);
  if (b.discount > 0) L.push(`Discount: -${sym} ${formatAmount(b.discount)}`);
  if (b.tax > 0) L.push(`Tax: ${sym} ${formatAmount(b.tax)}`);
  L.push(line, `*TOTAL AMOUNT: ${sym} ${formatAmount(b.totalAmount)}*`);
  const st = b.paymentStatus.toUpperCase();
  L.push(b.paymentStatus === 'partial' ? `Status: ${st} (Paid ${sym} ${formatAmount(b.paidAmount || 0)})` : `Status: ${st}`);
  L.push('', `Thank you for choosing ${b.store.name}!`);
  return L.join('\n');
}
