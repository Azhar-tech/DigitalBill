import { X, Download, Share2 } from 'lucide-react';

interface Props { image: string; fileName: string; message: string; onSave: () => void; onShare: () => void; onClose: () => void }

export default function ExportModal({ image, fileName, message, onSave, onShare, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 sm:items-center" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900">Receipt Image Generated</h2>
          <button aria-label="Close" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-slate-100"><X size={20} /></button>
        </div>
        <img src={image} alt={fileName} className="w-full rounded-lg border border-slate-200" />
        <p className="mt-2 break-all text-center text-[11px] text-slate-500">{fileName}</p>
        {message && <p className="mt-1 text-center text-xs font-semibold text-emerald-600">{message}</p>}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={onSave} className="nw-btn bg-indigo-600 text-white"><Download size={16} /> Save PNG Image</button>
          <button onClick={onShare} className="nw-btn bg-emerald-600 text-white"><Share2 size={16} /> Share</button>
        </div>
        <button onClick={onClose} className="nw-btn mt-2 w-full bg-slate-100 text-slate-700">Close</button>
      </div>
    </div>
  );
}
