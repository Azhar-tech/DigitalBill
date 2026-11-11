import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Download, Share2, MessageCircle, Printer } from 'lucide-react';
import type { BillData, Preset, Settings } from './types';
import { SAMPLE_BILL } from './data/defaults';
import {
  calculateBillTotals, emptyBill, generateWhatsAppMessage, newItem, num, uid, waNumber,
} from './utils/billUtils';
import {
  exportBackupJson, loadDraft, loadHistory, loadSettings, nextInvoiceNo, parseBackup,
  saveDraft, saveHistory, saveSettings, upsertBill,
} from './utils/storage';
import { renderPng, savePng, sharePng } from './utils/exportImage';
import Navbar from './components/Navbar';
import Toolbar from './components/Toolbar';
import BillEditor from './components/BillEditor';
import QuickAddChips from './components/QuickAddChips';
import Receipt from './components/Receipt';
import HistoryDrawer from './components/HistoryDrawer';
import SettingsSheet from './components/SettingsSheet';
import ExportModal from './components/ExportModal';

export default function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [raw, setRaw] = useState<BillData>(loadDraft);
  const [history, setHistory] = useState<BillData[]>(loadHistory);
  const [editing, setEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const bill = useMemo(() => calculateBillTotals(raw), [raw]);
  const fileName = `NEW_WAY_Bill_${bill.invoiceNo}.png`;

  // Autosave: draft always, history once the bill has content.
  useEffect(() => {
    const t = setTimeout(() => {
      saveDraft(bill);
      if (bill.items.length > 0) setHistory((h) => { const n = upsertBill(h, bill); saveHistory(n); return n; });
    }, 600);
    return () => clearTimeout(t);
  }, [bill]);

  const customers = useMemo(() => {
    const m = new Map<string, BillData['customer']>();
    history.forEach((b) => { if (b.customer.name && !m.has(b.customer.name)) m.set(b.customer.name, b.customer); });
    return [...m.values()];
  }, [history]);

  const newBill = useCallback(() => {
    setRaw({ ...emptyBill(settings.store, nextInvoiceNo(history), settings.currencySymbol) });
    setEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [settings, history]);

  const addPreset = (p: Preset) =>
    setRaw((b) => ({
      ...b,
      items: [...b.items, newItem({ particulars: p.label, quantity: 1, unitPrice: p.price || undefined, amount: p.price, category: p.category })],
    }));

  const generate = async () => {
    if (!receiptRef.current) return null;
    setBusy(true);
    try {
      const url = await renderPng(receiptRef.current);
      setImage(url); setMsg('');
      return url;
    } catch (e) {
      alert('Could not generate image: ' + (e as Error).message);
      return null;
    } finally { setBusy(false); }
  };

  const saveImage = async () => {
    if (!image) return;
    try { setMsg(await savePng(image, fileName)); } catch (e) { setMsg('Save failed: ' + (e as Error).message); }
  };

  const share = async () => {
    const url = image ?? (await generate());
    if (!url) return;
    try { await sharePng(url, fileName, generateWhatsAppMessage(bill)); }
    catch (e) { if ((e as Error).name !== 'AbortError') setMsg('Share failed: ' + (e as Error).message); }
  };

  const whatsapp = () => {
    const n = waNumber(bill.customer.phone);
    window.open(`https://wa.me/${n}?text=${encodeURIComponent(generateWhatsAppMessage(bill))}`, '_blank');
  };

  const importBackup = (text: string) => {
    try {
      const d = parseBackup(text);
      const merged = d.history.reduceRight((h, b) => upsertBill(h, b), history);
      setHistory(merged); saveHistory(merged);
      if (d.settings) { setSettings(d.settings); saveSettings(d.settings); }
      alert(`Imported ${d.history.length} bills`);
    } catch (e) { alert('Import failed: ' + (e as Error).message); }
  };

  const downloadBackup = () => {
    const blob = new Blob([exportBackupJson(history, settings)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'new_way_bills_backup.json'; a.click();
    URL.revokeObjectURL(a.href);
  };

  const area = settings.store.address.match(/F-\d+\/\d+[^,.]*/)?.[0] ?? 'Islamabad';
  const chip = (s: BillData['paymentStatus'], cls: string) => (
    <button key={s} onClick={() => setRaw({ ...raw, paymentStatus: s })}
      className={`nw-btn flex-1 rounded-full text-xs uppercase ${bill.paymentStatus === s ? cls + ' text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}>{s}</button>
  );

  return (
    <div className="min-h-screen pb-6">
      <Navbar name={settings.store.name.toUpperCase()} area={area} onHistory={() => setShowHistory(true)} onSettings={() => setShowSettings(true)} />

      <main className="mx-auto max-w-xl space-y-4 px-3 pt-4">
        <button onClick={newBill} className="nw-btn w-full bg-emerald-600 py-3 text-base text-white shadow-lg hover:bg-emerald-500">
          <Plus size={20} /> New Bill
        </button>

        <Toolbar
          invoiceNo={bill.invoiceNo} editing={editing} busy={busy}
          onRefresh={() => { if (confirm('Reset the current bill to the sample bill?')) setRaw({ ...SAMPLE_BILL, id: uid() }); }}
          onToggleEdit={() => setEditing((e) => !e)}
          onDownload={generate}
        />

        <QuickAddChips presets={settings.presets} onAdd={addPreset} />

        {editing && <BillEditor bill={raw} customers={customers} onChange={setRaw} />}

        <Receipt ref={receiptRef} bill={bill} />

        {/* Records only: never printed on the bill image */}
        <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">Payment (not shown on bill)</div>
          <div className="flex gap-2">
            {chip('paid', 'bg-emerald-600')}{chip('partial', 'bg-amber-500')}{chip('pending', 'bg-rose-600')}
          </div>
          {bill.paymentStatus === 'partial' && (
            <label className="mt-2 block">
              <span className="nw-label">Paid amount</span>
              <input className="nw-input font-mono" inputMode="decimal" value={raw.paidAmount ?? ''} onChange={(e) => setRaw({ ...raw, paidAmount: num(e.target.value) })} />
            </label>
          )}
        </div>

        <button onClick={generate} disabled={busy} className="nw-btn w-full bg-indigo-600 py-3 text-base text-white shadow-lg hover:bg-indigo-500 disabled:opacity-60">
          <Download size={18} /> {busy ? 'Generating…' : 'Download Receipt PNG'}
        </button>
        <div className="grid grid-cols-3 gap-2">
          <button onClick={share} className="nw-btn bg-slate-900 text-xs text-white"><Share2 size={16} /> Share</button>
          <button onClick={whatsapp} className="nw-btn bg-green-600 text-xs text-white"><MessageCircle size={16} /> WhatsApp</button>
          <button onClick={() => window.print()} className="nw-btn bg-slate-200 text-xs text-slate-800"><Printer size={16} /> Print</button>
        </div>
      </main>

      <footer className="mx-auto mt-6 max-w-xl rounded-2xl bg-slate-800 px-4 py-3 text-center text-[11px] leading-relaxed text-slate-300">
        <div className="font-bold text-white">{settings.store.name} {settings.store.tagline}</div>
        <div>{settings.store.address}</div>
        <div>{settings.store.phoneNumbers.join(' , ')}</div>
      </footer>

      {image && <ExportModal image={image} fileName={fileName} message={msg} onSave={saveImage} onShare={share} onClose={() => setImage(null)} />}
      {showHistory && (
        <HistoryDrawer
          history={history}
          onOpen={(b) => { setRaw(b); setShowHistory(false); }}
          onDuplicate={(b) => { setRaw({ ...b, id: uid(), invoiceNo: nextInvoiceNo(history), bookingDate: new Date().toISOString().slice(0, 10) }); setShowHistory(false); setEditing(true); }}
          onDelete={(b) => { const n = history.filter((x) => x.id !== b.id); setHistory(n); saveHistory(n); }}
          onExport={downloadBackup}
          onImport={importBackup}
          onClose={() => setShowHistory(false)}
        />
      )}
      {showSettings && (
        <SettingsSheet settings={settings} onClose={() => setShowSettings(false)}
          onSave={(s) => { setSettings(s); saveSettings(s); setShowSettings(false); }} />
      )}
    </div>
  );
}
