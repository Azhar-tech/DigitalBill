import { toPng } from 'html-to-image';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export async function renderPng(node: HTMLElement): Promise<string> {
  // Fixed width so the PNG is identical on every phone / window size.
  if (document.fonts?.ready) await document.fonts.ready;
  return toPng(node, {
    quality: 1, pixelRatio: 3, backgroundColor: '#ffffff', cacheBust: true,
    style: { width: '420px', maxWidth: '420px', margin: '0' },
  });
}

const b64 = (dataUrl: string) => dataUrl.split(',')[1];

export async function savePng(dataUrl: string, fileName: string): Promise<string> {
  if (Capacitor.isNativePlatform()) {
    const r = await Filesystem.writeFile({ path: `NewWayBills/${fileName}`, data: b64(dataUrl), directory: Directory.Documents, recursive: true });
    return `Saved: Documents/NewWayBills/${fileName}` + (r.uri ? '' : '');
  }
  const a = document.createElement('a');
  a.href = dataUrl; a.download = fileName; document.body.appendChild(a); a.click(); a.remove();
  return `Downloaded ${fileName}`;
}

export async function sharePng(dataUrl: string, fileName: string, text: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    const r = await Filesystem.writeFile({ path: fileName, data: b64(dataUrl), directory: Directory.Cache });
    await Share.share({ title: fileName, text, files: [r.uri], dialogTitle: 'Share bill' });
    return;
  }
  const blob = await (await fetch(dataUrl)).blob();
  const file = new File([blob], fileName, { type: 'image/png' });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.canShare?.({ files: [file] })) { await nav.share({ files: [file], text }); return; }
  await savePng(dataUrl, fileName);
}
