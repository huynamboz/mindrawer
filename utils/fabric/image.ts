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
            left: mousePos.x - img.width / 4, // div 4 because scaleX is 0.5
            top: mousePos.y - img.height / 4,
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

export function handleImageUpload() {
  const fabricStore = useFabricStore();
  const canvas = fabricStore.canvas;
  if (!canvas) return;
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async (e) => {
    const files = (e.target as HTMLInputElement).files;
    if (!files) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      if (!event.target || !event.target.result) return;
      if (typeof event.target.result === 'string') {
        const img = await FabricImage.fromURL(event.target.result);
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        const vpt = canvas.viewportTransform;

        // -vpt[4]: Remove the horizontal offset of the viewport
        // + canvasWidth / 2: Get the center of the current visible screen (X-axis)
        // / zoom: Adjust the coordinate to the actual canvas system (account for scaling)
        const centerX = (-vpt[4] + canvasWidth / 2) / fabricStore.zoom;
        const centerY = (-vpt[5] + canvasHeight / 2) / fabricStore.zoom;
        img.set({
          ...defaultObjectControl,
          scaleX: 0.5,
          scaleY: 0.5,
        });

        img.set({
          left: centerX - img.width / 4, // div 4 because scaleX is 0.5
          top: centerY - img.height / 4,
        });
        canvas?.add(img);
        img.setCoords();
        canvas?.setActiveObject(img);
        fabricStore.setActiveTool('select');
      }
    };

    reader.readAsDataURL(file);
  };

  input.click();
}
