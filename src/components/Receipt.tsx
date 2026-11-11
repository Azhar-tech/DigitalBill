import { forwardRef } from 'react';
import type { BillData } from '../types';
import { formatTotal, receiptRows } from '../utils/billUtils';

/**
 * Pure presentational receipt. No viewport breakpoints are used on purpose:
 * the layout is deterministic, so the exported PNG equals the on-screen bill.
 * Outer white card (#receipt-capture) is what gets exported.
 */

const BLUE = '#1243A2';

function shopName(name: string) {
  const i = name.toUpperCase().indexOf('DRY CLEAN');
  return (i > 0 ? name.slice(0, i) : name).trim();
}

function tagLines(tagline: string): [string, string[]] {
  const t = tagline.trim();
  if (!t.includes('&')) return [t, []];
  const [a, ...rest] = t.split('&');
  return [a.trim() + ' &', rest.join('&').trim().split(/\s+/).filter(Boolean)];
}

const Receipt = forwardRef<HTMLDivElement, { bill: BillData }>(({ bill }, ref) => {
  const rows = receiptRows(bill);
  const [line1, line2] = tagLines(bill.store.tagline);
  const blank = '___________';

  return (
    <div className="flex justify-center rounded-2xl bg-slate-200/60 p-1 receipt-backdrop">
      <div
        id="receipt-capture"
        ref={ref}
        className="w-full max-w-[420px] rounded-xl bg-white p-2 shadow-xl"
      >
        <div
          id="new-way-paper-receipt"
          className="rounded-lg border-2 bg-paper p-3 font-sans text-ink"
          style={{ borderColor: BLUE, backgroundColor: '#f8faff', color: '#002B66' }}
        >
          {/* HEADER */}
          <div className="flex items-center justify-start gap-1.5 border-b pb-2" style={{ borderColor: BLUE }}>
            <h1
              className="whitespace-nowrap uppercase leading-none tracking-tight"
              style={{ color: BLUE, fontSize: 26, fontFamily: '"Archivo Black","Arial Black",Arial,sans-serif', fontWeight: 400 }}
            >
              {shopName(bill.store.name)}
            </h1>
            <div
              className="ml-auto flex flex-col font-serif font-bold uppercase leading-tight tracking-wider"
              style={{ color: BLUE, fontSize: 10 }}
            >
              <span className="whitespace-nowrap">{line1}</span>
              {line2.length > 0 && (
                <span className="flex justify-between">
                  {line2.map((w, i) => <span key={i}>{w}</span>)}
                </span>
              )}
            </div>
          </div>

          {/* ADDRESS BANNER */}
          <div
            className="mt-2 w-full whitespace-nowrap rounded px-1 py-1 text-center font-bold text-white"
            style={{ backgroundColor: BLUE, fontSize: 9 }}
          >
            {bill.store.address}
          </div>

          {/* PHONES */}
          <div className="pt-1 text-center font-mono font-extrabold tracking-wider" style={{ color: BLUE, fontSize: 11 }}>
            {bill.store.phoneNumbers.filter(Boolean).join(' , ')}
          </div>

          {/* METADATA */}
          <div className="space-y-2 border-b py-3 text-[11px]" style={{ borderColor: 'rgba(18,67,162,.3)' }}>
            <div className="flex items-end justify-between">
              <div className="flex items-end gap-1.5">
                <span className="whitespace-nowrap font-bold" style={{ color: BLUE }}>Booking Date</span>
                <span className="border-b px-1 text-center font-mono font-bold" style={{ borderColor: BLUE }}>
                  {bill.bookingDate || blank}
                </span>
              </div>
              <div className="flex items-end gap-1.5">
                <span className="whitespace-nowrap font-bold" style={{ color: BLUE }}>Delivery Date</span>
                <span className="border-b px-1 text-center font-mono font-bold" style={{ borderColor: BLUE }}>
                  {bill.deliveryDate || blank}
                </span>
              </div>
            </div>
            <div className="flex items-end gap-1.5">
              <span className="font-bold" style={{ color: BLUE }}>Name</span>
              <span className="min-w-0 flex-1 truncate border-b font-bold" style={{ borderColor: BLUE }}>
                {bill.customer.name || 'Â '}
              </span>
              <span className="font-bold" style={{ color: BLUE }}>No</span>
              <span className="border-b px-2 font-mono text-sm font-bold" style={{ borderColor: BLUE }}>
                {bill.invoiceNo}
              </span>
            </div>
            <div className="flex items-end gap-1.5">
              <span className="font-bold" style={{ color: BLUE }}>Address</span>
              <span className="min-w-0 flex-1 truncate border-b font-semibold" style={{ borderColor: BLUE }}>
                {bill.customer.address || bill.customer.phone || 'Â '}
              </span>
            </div>
          </div>

          {/* TABLE */}
          <div className="mt-2 overflow-hidden rounded-md border-2 bg-white" style={{ borderColor: BLUE }}>
            <div className="grid grid-cols-12 py-1.5 text-xs font-bold text-white" style={{ backgroundColor: BLUE }}>
              <div className="col-span-6 text-center">Particulars</div>
              <div className="col-span-3 border-l border-white/40 text-center">Quantity</div>
              <div className="col-span-3 border-l border-white/40 text-center">Amount</div>
            </div>

            <div className="min-h-[140px] divide-y divide-slate-100 p-2">
              {rows.map((r) => (
                <div key={r.key} className="grid grid-cols-12 items-center py-1">
                  <div
                    className="col-span-6 min-h-[24px] border-r py-0.5 pr-1 text-left text-[11px] font-semibold leading-snug"
                    style={{ borderColor: 'rgba(18,67,162,.2)' }}
                  >
                    {r.label}
                  </div>
                  <div
                    className="col-span-3 border-r text-center font-mono text-[11px] font-bold"
                    style={{ borderColor: 'rgba(18,67,162,.2)' }}
                  >
                    {r.qty}
                  </div>
                  <div className="col-span-3 pr-2 text-right font-mono text-[11px] font-bold">{r.amount}</div>
                </div>
              ))}
            </div>

            <div className="mx-2 mb-2 mt-4 grid grid-cols-12 items-center border-t-2 pt-2" style={{ borderColor: BLUE }}>
              <div className="col-span-9 pr-3 text-right text-sm font-extrabold uppercase tracking-wider">TOTAL</div>
              <div className="col-span-3 border-l-2 pl-2 font-mono text-base font-extrabold" style={{ borderColor: BLUE }}>
                {formatTotal(bill.totalAmount)}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div
            className="mt-3 flex items-end justify-between border-t pt-2"
            style={{ borderColor: 'rgba(18,67,162,.3)' }}
          >
            <p className="pr-2 text-[9.5px] font-medium leading-tight text-slate-800">
              <b>Note:</b> Please check clothing pockets for cash and valuables before leaving booking or delivery
              counter. The store accepts no responsibility for lost items. <i>(See terms on back)</i>
            </p>
            <div className="shrink-0 border-l border-slate-300 pl-3">
              <div className="h-5" />
              <div className="text-[10px] font-bold text-slate-700">Signature</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Receipt;

