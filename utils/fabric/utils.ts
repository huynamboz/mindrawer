import type { IText } from 'fabric';

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
