import { MapPin, Store, History, Settings as Cog } from 'lucide-react';

export default function Navbar({ onHistory, onSettings, name, area }: { onHistory: () => void; onSettings: () => void; name: string; area: string }) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 text-white shadow-lg" style={{ backgroundColor: '#0f1f4b' }}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/90"><Store size={20} /></div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-extrabold uppercase tracking-wide">{name} DRY CLEAN</div>
        <div className="flex items-center gap-1 text-[11px] text-slate-300"><MapPin size={11} /> {area}</div>
      </div>
      <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-400/40">Shop App</span>
      <button aria-label="History" onClick={onHistory} className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-white/10"><History size={20} /></button>
      <button aria-label="Settings" onClick={onSettings} className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-white/10"><Cog size={20} /></button>
    </header>
  );
}
