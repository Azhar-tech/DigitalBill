import { Plus } from 'lucide-react';
import type { Preset } from '../types';

export default function QuickAddChips({ presets, onAdd }: { presets: Preset[]; onAdd: (p: Preset) => void }) {
  return (
    <div>
      <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">Quick add</div>
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button key={p.id} onClick={() => onAdd(p)}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-indigo-200 bg-white px-3.5 text-xs font-semibold text-indigo-700 shadow-sm active:scale-95">
            <Plus size={14} /> {p.label}{p.price ? <span className="text-slate-400">· {p.price}</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}
