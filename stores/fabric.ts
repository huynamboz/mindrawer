import { Canvas } from 'fabric';
import type { ToolType } from '~/types/toolbar';

export const useFabricStore = defineStore('fabric', () => {
  const canvas = ref<Canvas>();
  const activeTool = ref<ToolType>('select');
  const savedActiveTool = ref<ToolType>('select');

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
    canvas.value.defaultCursor = 'crosshair';

    if (action === 'move') {
      canvas.value.defaultCursor = 'grabbing';
    }
    else if (action === 'select') {
      canvas.value.defaultCursor = 'default';
    }

    if (action !== 'select') {
      canvas.value.discardActiveObject();
      canvas.value.forEachObject((obj) => {
        obj.selectable = false;
        obj.evented = false;
      });
      canvas.value.renderAll();
    }
    else if (action === 'select') {
      canvas.value.forEachObject((obj) => {
        obj.selectable = true;
        obj.evented = true;
      });
      canvas.value.renderAll();
    }
  }

  function saveActiveTool() {
    savedActiveTool.value = activeTool.value;
  }

  function restoreActiveTool() {
    activeTool.value = savedActiveTool.value;
  }

  function enableTempMoveMode() {
    saveActiveTool();
    setActiveTool('move');
  }

  return {
    canvas,
    init,
    setActiveTool,
    activeTool,
    saveActiveTool,
    restoreActiveTool,
    enableTempMoveMode,
  };
});
