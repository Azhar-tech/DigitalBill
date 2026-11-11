import type { BillData, Settings } from '../types';
import { DEFAULT_SETTINGS, SAMPLE_BILL } from '../data/defaults';

export const HISTORY_KEY = 'bill_digitizer_history';
const SETTINGS_KEY = 'nw_settings';
const DRAFT_KEY = 'nw_draft';

function read<T>(key: string, fallback: T): T {
  try { const s = localStorage.getItem(key); return s ? (JSON.parse(s) as T) : fallback; } catch { return fallback; }
}
function write(key: string, v: unknown) { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* storage full/blocked */ } }

export const loadHistory = (): BillData[] => read<BillData[]>(HISTORY_KEY, []);
export const saveHistory = (h: BillData[]) => write(HISTORY_KEY, h.slice(0, 50));

export function upsertBill(h: BillData[], b: BillData): BillData[] {
  return [b, ...h.filter((x) => x.id !== b.id)].slice(0, 50);
}

export const loadSettings = (): Settings => {
  const s = read<Partial<Settings>>(SETTINGS_KEY, {});
  return { ...DEFAULT_SETTINGS, ...s, store: { ...DEFAULT_SETTINGS.store, ...(s.store || {}) } };
};
export const saveSettings = (s: Settings) => write(SETTINGS_KEY, s);

export const loadDraft = (): BillData => read<BillData>(DRAFT_KEY, SAMPLE_BILL);
export const saveDraft = (b: BillData) => write(DRAFT_KEY, b);

export function nextInvoiceNo(h: BillData[]): string {
  const nums = h.map((b) => parseInt(b.invoiceNo, 10)).filter(Number.isFinite);
  return String((nums.length ? Math.max(...nums) : 5928) + 1);
}

export function exportBackupJson(h: BillData[], s: Settings): string {
  return JSON.stringify({ app: 'new-way-bill', version: 1, history: h, settings: s }, null, 2);
}
export function parseBackup(text: string): { history: BillData[]; settings?: Settings } {
  const d = JSON.parse(text);
  const history = Array.isArray(d) ? d : d.history;
  if (!Array.isArray(history)) throw new Error('Invalid backup file');
  return { history, settings: d.settings };
}
