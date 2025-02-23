import { ActiveSelection, FabricObject, util, type IText } from 'fabric';
import { loadSVGFromClipboard } from './fabric';
import { handlePasteImage } from './image';

const isSVGRegex = /<svg.*<\/svg>/;

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

export async function handlePaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items;
  const fabricStore = useFabricStore();
  const canvas = fabricStore.canvas;
  const mousePos = fabricStore.mousePosition;

  if (!items || !canvas) return;
  for (const item of items) {
    // paste images
    if (item.type.startsWith('image')) {
      handlePasteImage(item);
    }
    else {
      // Paste object
      const clipboardContentString = e.clipboardData?.getData('text') || '';
      console.log(clipboardContentString);

      let objects = [];
      try {
        const parsedData = JSON.parse(clipboardContentString);

        // Kiểm tra cấu trúc JSON hợp lệ trước khi tiếp tục
        if (parsedData?.type === 'objects/mindrawer' && Array.isArray(parsedData.objects)) {
          objects = await util.enlivenObjects(parsedData.objects);
        }
        else {
          console.warn('Invalid clipboard content format');
          return;
        }
      }
      catch (error) {
        console.error('Error parsing clipboard content:', error);
        return;
      }

      objects.forEach((obj) => {
        if (obj instanceof FabricObject)
          canvas.add(obj);
      });

      const activeSelection = new ActiveSelection(objects.filter(obj => obj instanceof FabricObject));
      activeSelection.set({
        left: mousePos.x - activeSelection.width / 2,
        top: mousePos.y - activeSelection.height / 2,
      });
      canvas.setActiveObject(activeSelection);
      canvas.requestRenderAll();

      // paste svg
      if (isSVGRegex.test(clipboardContentString)) {
        loadSVGFromClipboard(clipboardContentString);
      }
    }
  }
};
