import { computed } from 'vue';
import type { FabricObject } from 'fabric';

export function useCanvasCenter() {
  const fabricStore = useFabricStore();
  const canvas = fabricStore.canvas;

  const center = computed(() => {
    if (!canvas) return { x: 0, y: 0 };
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];

    return {
      x: (-vpt[4] + canvasWidth / 2) / fabricStore.zoom,
      y: (-vpt[5] + canvasHeight / 2) / fabricStore.zoom,
    };
  });

  function positionObjToCenter(obj: FabricObject) {
    if (!canvas || !obj) return;
    const { x, y } = center.value;
    obj.set({
      left: x - (obj.width || 0) / 2, // Chia 4 vì scaleX = 0.5
      top: y - (obj.height || 0) / 2,
      scaleX: 0.5,
      scaleY: 0.5,
    });
    canvas.requestRenderAll();
  }

  return { center, positionObjToCenter };
}
