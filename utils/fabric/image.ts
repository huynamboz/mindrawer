import { FabricImage } from 'fabric';
import { defaultObjectControl } from './fabric';

export function handlePasteImage(e: ClipboardEvent) {
  const items = e.clipboardData?.items;
  const fabricStore = useFabricStore();
  const canvas = fabricStore.canvas;
  const mousePos = fabricStore.mousePosition;

  if (!items || !canvas) return;

  for (const item of items) {
    if (item.type.startsWith('image')) {
      const blob = item.getAsFile();
      const reader = new FileReader();

      reader.onload = async (event) => {
        if (!event.target || !event.target.result) return;
        if (typeof event.target.result === 'string') {
          const img = await FabricImage.fromURL(event.target.result);
          img.set({
            ...defaultObjectControl,
            scaleX: 0.5,
            scaleY: 0.5,
          });
          canvas?.add(img);

          img.set({
            left: mousePos.x - (img.width / 4), // div 4 because scaleX is 0.5
            top: mousePos.y - (img.height / 4),
          });
          img.setCoords();
          canvas?.setActiveObject(img);
          canvas.renderAll();
        }
      };

      if (blob) {
        reader.readAsDataURL(blob);
      }
    }
  }
}
