import { useRef, useState } from 'react';
import { X, Search, Copy, Trash2, Upload, DownloadCloud } from 'lucide-react';
import type { BillData } from '../types';
import { formatAmount } from '../utils/billUtils';

interface Props {
  history: BillData[];
  onOpen: (b: BillData) => void;
  onDuplicate: (b: BillData) => void;
  onDelete: (b: BillData) => void;
  onExport: () => void;
  onImport: (text: string) => void;
  onClose: () => void;
}

export default function HistoryDrawer({ history, onOpen, onDuplicate, onDelete, onExport, onImport, onClose }: Props) {
  const [q, setQ] = useState('');
  const file = useRef<HTMLInputElement>(null);
  const list = history.filter((b) => {
    const s = q.trim().toLowerCase();
    return !s || b.customer.name.toLowerCase().includes(s) || b.invoiceNo.toLowerCase().includes(s);
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onClose}>
      <aside className="flex h-full w-full max-w-sm flex-col bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b p-3">
          <h2 className="text-base font-extrabold text-slate-900">Bill History</h2>
          <button aria-label="Close" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-slate-100"><X size={20} /></button>
        </div>
        <div className="relative p-3">
          <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="nw-input !pl-9" placeholder="Search name or invoice no" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-3">
          {list.length === 0 && <p className="py-8 text-center text-sm text-slate-400">No bills found</p>}
          {list.map((b) => (
            <div key={b.id} className="rounded-xl border border-slate-200 p-3">
              <button className="block w-full text-left" onClick={() => onOpen(b)}>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-sm font-bold text-slate-900">#{b.invoiceNo}</span>
                  <span className="font-mono text-sm font-bold text-indigo-700">{formatAmount(b.totalAmount)}</span>
                </div>
                <div className="truncate text-xs text-slate-600">{b.customer.name || 'No name'} · {b.bookingDate}</div>
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${b.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : b.paymentStatus === 'partial' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>{b.paymentStatus}</span>
              </button>
              <div className="mt-2 flex gap-2">
                <button className="nw-btn flex-1 bg-slate-100 text-xs text-slate-700" onClick={() => onDuplicate(b)}><Copy size={14} /> Duplicate</button>
                <button className="nw-btn flex-1 bg-red-50 text-xs text-red-600" onClick={() => { if (confirm(`Delete bill #${b.invoiceNo}?`)) onDelete(b); }}><Trash2 size={14} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 border-t p-3">
          <button className="nw-btn bg-slate-900 text-xs text-white" onClick={onExport}><DownloadCloud size={14} /> Export JSON</button>
          <button className="nw-btn bg-slate-100 text-xs text-slate-800" onClick={() => file.current?.click()}><Upload size={14} /> Import JSON</button>
          <input ref={file} type="file" accept="application/json,.json" hidden
            onChange={async (e) => { const f = e.target.files?.[0]; if (f) onImport(await f.text()); e.target.value = ''; }} />
        </div>
      </aside>
    </div>
  );
}
