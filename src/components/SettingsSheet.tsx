import { useState } from 'react';
import { X, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import type { Settings } from '../types';
import { num, uid } from '../utils/billUtils';

export default function SettingsSheet({ settings, onSave, onClose }: { settings: Settings; onSave: (s: Settings) => void; onClose: () => void }) {
  const [s, setS] = useState<Settings>(structuredClone(settings));
  const store = (p: Partial<Settings['store']>) => setS({ ...s, store: { ...s.store, ...p } });
  const preset = (id: string, p: Partial<Settings['presets'][number]>) => setS({ ...s, presets: s.presets.map((x) => (x.id === id ? { ...x, ...p } : x)) });
  const move = (i: number, d: number) => {
    const a = [...s.presets]; const j = i + d;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]];
    setS({ ...s, presets: a });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div className="flex max-h-[94vh] w-full max-w-md flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b p-3">
          <h2 className="text-base font-extrabold text-slate-900">Settings</h2>
          <button aria-label="Close" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-slate-100"><X size={20} /></button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <p className="text-xs text-slate-500">These become the defaults for every new bill.</p>
          <label className="block"><span className="nw-label">Shop Name</span><input className="nw-input" value={s.store.name} onChange={(e) => store({ name: e.target.value })} /></label>
          <label className="block"><span className="nw-label">Tagline</span><input className="nw-input" value={s.store.tagline} onChange={(e) => store({ tagline: e.target.value })} /></label>
          <label className="block"><span className="nw-label">Address</span><input className="nw-input" value={s.store.address} onChange={(e) => store({ address: e.target.value })} /></label>
          <div>
            <span className="nw-label">Phone Numbers</span>
            <div className="space-y-2">
              {s.store.phoneNumbers.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <input className="nw-input" value={p} onChange={(e) => store({ phoneNumbers: s.store.phoneNumbers.map((x, j) => (j === i ? e.target.value : x)) })} />
                  <button aria-label="Remove" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600" onClick={() => store({ phoneNumbers: s.store.phoneNumbers.filter((_, j) => j !== i) })}><Trash2 size={16} /></button>
                </div>
              ))}
              <button className="nw-btn w-full bg-slate-100 text-xs" onClick={() => store({ phoneNumbers: [...s.store.phoneNumbers, ''] })}><Plus size={14} /> Add Phone</button>
            </div>
          </div>
          <label className="block"><span className="nw-label">Currency Symbol</span><input className="nw-input" value={s.currencySymbol} onChange={(e) => setS({ ...s, currencySymbol: e.target.value })} /></label>

          <div>
            <span className="nw-label">Quick Add Presets</span>
            <div className="space-y-2">
              {s.presets.map((p, i) => (
                <div key={p.id} className="flex items-center gap-1.5">
                  <input className="nw-input" value={p.label} onChange={(e) => preset(p.id, { label: e.target.value })} />
                  <input className="nw-input !w-20 font-mono" inputMode="decimal" value={p.price || ''} placeholder="Price" onChange={(e) => preset(p.id, { price: num(e.target.value) })} />
                  <div className="flex flex-col">
                    <button aria-label="Up" className="flex h-[22px] w-8 items-center justify-center text-slate-500" onClick={() => move(i, -1)}><ArrowUp size={14} /></button>
                    <button aria-label="Down" className="flex h-[22px] w-8 items-center justify-center text-slate-500" onClick={() => move(i, 1)}><ArrowDown size={14} /></button>
                  </div>
                  <button aria-label="Delete preset" className="flex h-11 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600" onClick={() => setS({ ...s, presets: s.presets.filter((x) => x.id !== p.id) })}><Trash2 size={15} /></button>
                </div>
              ))}
              <button className="nw-btn w-full bg-slate-100 text-xs" onClick={() => setS({ ...s, presets: [...s.presets, { id: uid(), label: '', price: 0, category: 'item' }] })}><Plus size={14} /> Add Preset</button>
            </div>
          </div>
        </div>
        <div className="border-t p-3">
          <button className="nw-btn w-full bg-indigo-600 text-white" onClick={() => onSave({ ...s, presets: s.presets.filter((p) => p.label.trim()) })}>Save Settings</button>
        </div>
      </div>
    </div>
  );
}
