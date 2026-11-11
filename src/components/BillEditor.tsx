import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import type { BillData, LineItem } from '../types';
import { newItem, num } from '../utils/billUtils';

interface Props {
  bill: BillData;
  customers: { name: string; phone?: string; address?: string }[];
  onChange: (b: BillData) => void;
}

const Field = ({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) => (
  <label className={`block ${className}`}><span className="nw-label">{label}</span>{children}</label>
);

export default function BillEditor({ bill, customers, onChange }: Props) {
  const set = (p: Partial<BillData>) => onChange({ ...bill, ...p });
  const setStore = (p: Partial<BillData['store']>) => set({ store: { ...bill.store, ...p } });
  const setCust = (p: Partial<BillData['customer']>) => set({ customer: { ...bill.customer, ...p } });

  const setItem = (id: string, p: Partial<LineItem>) =>
    set({ items: bill.items.map((i) => (i.id === id ? { ...i, ...p } : i)) });
  const qtyChange = (i: LineItem, v: string) => {
    const quantity = num(v);
    setItem(i.id, i.unitPrice ? { quantity, amount: quantity * i.unitPrice } : { quantity });
  };
  const rateChange = (i: LineItem, v: string) => {
    const unitPrice = v === '' ? undefined : num(v);
    setItem(i.id, unitPrice ? { unitPrice, amount: i.quantity * unitPrice } : { unitPrice });
  };
  const move = (idx: number, d: number) => {
    const a = [...bill.items]; const j = idx + d;
    if (j < 0 || j >= a.length) return;
    [a[idx], a[j]] = [a[j], a[idx]];
    set({ items: a });
  };
  const pickCustomer = (name: string) => {
    const m = customers.find((c) => c.name.toLowerCase() === name.toLowerCase());
    setCust(m ? { name, phone: bill.customer.phone || m.phone, address: bill.customer.address || m.address } : { name });
  };

  return (
    <div className="space-y-5 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
      <section className="grid grid-cols-2 gap-3">
        <Field label="Invoice No"><input className="nw-input font-mono font-bold" value={bill.invoiceNo} onChange={(e) => set({ invoiceNo: e.target.value })} inputMode="numeric" /></Field>
        <Field label="Booking Date"><input type="date" className="nw-input" value={bill.bookingDate} onChange={(e) => set({ bookingDate: e.target.value })} /></Field>
        <Field label="Delivery Date"><input type="date" className="nw-input" value={bill.deliveryDate || ''} onChange={(e) => set({ deliveryDate: e.target.value })} /></Field>
        <Field label="Delivery Time"><input type="time" className="nw-input" value={bill.deliveryTime || ''} onChange={(e) => set({ deliveryTime: e.target.value })} /></Field>
        <Field label="Customer Name" className="col-span-2">
          <input className="nw-input" list="nw-customers" value={bill.customer.name} onChange={(e) => pickCustomer(e.target.value)} placeholder="Name" />
          <datalist id="nw-customers">{customers.map((c) => <option key={c.name} value={c.name} />)}</datalist>
        </Field>
        <Field label="Phone (WhatsApp)"><input className="nw-input" inputMode="tel" value={bill.customer.phone || ''} onChange={(e) => setCust({ phone: e.target.value })} placeholder="0300-1234567" /></Field>
        <Field label="Address / Contact"><input className="nw-input" value={bill.customer.address || ''} onChange={(e) => setCust({ address: e.target.value })} /></Field>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-extrabold text-slate-800">1. Shop Header Details (Editable)</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Shop Name"><input className="nw-input" value={bill.store.name} onChange={(e) => setStore({ name: e.target.value })} /></Field>
          <Field label="Tagline"><input className="nw-input" value={bill.store.tagline} onChange={(e) => setStore({ tagline: e.target.value })} /></Field>
          <Field label="Shop Address" className="col-span-2"><input className="nw-input" value={bill.store.address} onChange={(e) => setStore({ address: e.target.value })} /></Field>
        </div>
        <span className="nw-label mt-3">Phone Numbers</span>
        <div className="space-y-2">
          {bill.store.phoneNumbers.map((p, i) => (
            <div key={i} className="flex gap-2">
              <input className="nw-input" inputMode="tel" value={p} onChange={(e) => setStore({ phoneNumbers: bill.store.phoneNumbers.map((x, j) => (j === i ? e.target.value : x)) })} />
              <button aria-label="Remove phone" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600"
                onClick={() => setStore({ phoneNumbers: bill.store.phoneNumbers.filter((_, j) => j !== i) })}><Trash2 size={16} /></button>
            </div>
          ))}
          <button className="nw-btn w-full bg-white text-xs text-indigo-700 ring-1 ring-indigo-200" onClick={() => setStore({ phoneNumbers: [...bill.store.phoneNumbers, ''] })}><Plus size={14} /> Add Phone</button>
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-extrabold text-slate-800">2. Particulars, Quantity &amp; Amount Items</h3>
        <div className="space-y-2">
          {bill.items.map((it, idx) => (
            <div key={it.id} className="rounded-xl border border-slate-200 bg-white p-2">
              <input className="nw-input mb-2" placeholder="Description" value={it.particulars} onChange={(e) => setItem(it.id, { particulars: e.target.value })} />
              <div className="grid grid-cols-[1fr_1fr_1.3fr_auto] items-end gap-2">
                <Field label="Qty"><input className="nw-input font-mono" inputMode="decimal" value={it.quantity || ''} onChange={(e) => qtyChange(it, e.target.value)} /></Field>
                <Field label="Rate"><input className="nw-input font-mono" inputMode="decimal" placeholder="opt." value={it.unitPrice ?? ''} onChange={(e) => rateChange(it, e.target.value)} /></Field>
                <Field label="Amt"><input className="nw-input font-mono font-bold" inputMode="decimal" value={it.amount || ''} onChange={(e) => setItem(it.id, { amount: num(e.target.value) })} /></Field>
                <button aria-label="Delete row" className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-50 text-red-600"
                  onClick={() => set({ items: bill.items.filter((x) => x.id !== it.id) })}><Trash2 size={16} /></button>
              </div>
              <div className="mt-1 flex gap-1">
                <button aria-label="Move up" onClick={() => move(idx, -1)} className="flex h-9 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><ArrowUp size={14} /></button>
                <button aria-label="Move down" onClick={() => move(idx, 1)} className="flex h-9 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><ArrowDown size={14} /></button>
              </div>
            </div>
          ))}
          <button className="nw-btn w-full bg-indigo-600 text-xs text-white" onClick={() => set({ items: [...bill.items, newItem()] })}><Plus size={14} /> Add Row</button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Field label="Packaging"><input className="nw-input font-mono" inputMode="decimal" value={bill.packagingCharges || ''} onChange={(e) => set({ packagingCharges: num(e.target.value) })} /></Field>
        <Field label="Delivery"><input className="nw-input font-mono" inputMode="decimal" value={bill.deliveryCharges || ''} onChange={(e) => set({ deliveryCharges: num(e.target.value) })} /></Field>
        <Field label="Discount"><input className="nw-input font-mono" inputMode="decimal" value={bill.discount || ''} onChange={(e) => set({ discount: num(e.target.value) })} /></Field>
        <Field label="Tax %"><input className="nw-input font-mono" inputMode="decimal" value={bill.taxPercentage || ''} onChange={(e) => set({ taxPercentage: num(e.target.value) || undefined })} /></Field>
        <label className="col-span-2 flex min-h-[44px] items-center gap-3 rounded-lg bg-white px-3 ring-1 ring-slate-200">
          <input type="checkbox" className="h-5 w-5" checked={!!bill.manualTotalEnabled}
            onChange={(e) => set({ manualTotalEnabled: e.target.checked, manualTotal: bill.manualTotal ?? bill.totalAmount })} />
          <span className="flex-1 text-xs font-bold text-slate-700">Manual total override</span>
          {bill.manualTotalEnabled && (
            <input className="nw-input !w-28 font-mono font-bold" inputMode="decimal" value={bill.manualTotal ?? ''} onChange={(e) => set({ manualTotal: num(e.target.value) })} />
          )}
        </label>
      </section>
    </div>
  );
}
