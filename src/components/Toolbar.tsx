import { RefreshCw, Pencil, Check, Download } from 'lucide-react';

interface Props { invoiceNo: string; editing: boolean; onRefresh: () => void; onToggleEdit: () => void; onDownload: () => void; busy: boolean }

export default function Toolbar({ invoiceNo, editing, onRefresh, onToggleEdit, onDownload, busy }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-slate-900 p-3 text-white shadow-xl">
      <button aria-label="Reset to sample" onClick={onRefresh} className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700"><RefreshCw size={18} /></button>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold">Receipt #{invoiceNo}</div>
        <div className="truncate text-[11px] text-slate-400">Computerized Official Voucher</div>
      </div>
      <button onClick={onToggleEdit}
        className={`nw-btn rounded-xl text-xs ${editing ? 'bg-amber-400 text-slate-900' : 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/50'}`}>
        {editing ? <Check size={16} /> : <Pencil size={16} />} {editing ? 'Done Editing' : 'Edit Bill'}
      </button>
      <button onClick={onDownload} disabled={busy} className="nw-btn bg-indigo-600 text-xs text-white hover:bg-indigo-500 disabled:opacity-60">
        <Download size={16} /> Download PNG
      </button>
    </div>
  );
}
