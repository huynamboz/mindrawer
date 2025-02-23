import type { IText } from 'fabric';
import { loadSVGFromClipboard } from './fabric';
import { handlePasteImage } from './image';

export function fitTextboxToContent(textV: { target: any }) {
  const text = textV.target as IText;
  const fabricStore = useFabricStore();
  const textLinesMaxWidth = text.textLines.reduce(
    (max, _, i) => Math.max(max, text.getLineWidth(i)),
    0,
  );
  text.set({ width: textLinesMaxWidth + 2 });
  text.setCoords();
  fabricStore.canvas?.requestRenderAll();
}

export function handlePaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items;
  const fabricStore = useFabricStore();
  const canvas = fabricStore.canvas;

  if (!items || !canvas) return;
  for (const item of items) {
    // paste images
    if (item.type.startsWith('image')) {
      handlePasteImage(item);
    }
    else {
      // paste svg
      const clipboardContentString = e.clipboardData?.getData('text');
      if (clipboardContentString) {
        loadSVGFromClipboard(clipboardContentString);
      }
    }
  }
};
