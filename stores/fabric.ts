import { Canvas } from 'fabric';
import type { ToolType } from '~/types/toolbar';

export const useFabricStore = defineStore('fabric', () => {
  const canvas = ref<Canvas>();
  const activeTool = ref<ToolType>('select');

  function resizeCanvas() {
    if (!canvas.value) {
      return;
    }
    // Get the viewport dimensions
    const winW = window.innerWidth;
    const winH = window.innerHeight;

    // Current dimensions of the canvas
    // const curW = canvas.getWidth();
    // const curH = canvas.getHeight();

    // Calculate new dimensions for the canvas
    const canW = winW; // Adjust for any desired margin
    const canH = winH; // Adjust for any desired margin

    // Update the canvas size
    canvas.value.setWidth(canW);
    canvas.value.setHeight(canH);
    canvas.value.renderAll();
  }

  function init(canvasElement: HTMLCanvasElement) {
    canvas.value = markRaw(new Canvas(canvasElement));
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  function setActiveTool(action: ToolType) {
    if (!canvas.value) return;
    activeTool.value = action;

    if (action === 'move') {
      canvas.value.defaultCursor = 'grabbing';
    }
    else {
      canvas.value.defaultCursor = 'default';
    }
  }

  return {
    canvas,
    init,
    setActiveTool,
    activeTool,
  };
});
