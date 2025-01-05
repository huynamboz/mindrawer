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
    canvas.value = markRaw(new Canvas(canvasElement, { renderOnAddRemove: false, preserveObjectStacking: true }));
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

    if (action !== 'select') {
      canvas.value.selection = false; // Disable object selection
      canvas.value.discardActiveObject();
      canvas.value.forEachObject((obj) => {
        Object.assign(obj, { prevSelectable: obj.selectable, prevEvented: obj.evented });
        obj.selectable = false;
        obj.evented = false;
      });
      canvas.value.renderAll();
    }
    else if (action === 'select') {
      canvas.value.selection = true;
      canvas.value.defaultCursor = 'default';
      canvas.value.forEachObject((obj) => {
        obj.selectable = (obj as any).prevSelectable ?? true;
        obj.evented = (obj as any).prevEvented ?? true;
      });
      canvas.value.renderAll();
    }
  }

  function saveActiveTool() {
    savedActiveTool.value = activeTool.value;
  }

  function restoreActiveTool() {
    setActiveTool(savedActiveTool.value);
  }

  function enableTempMoveMode() {
    saveActiveTool();
    setActiveTool('move');
  }

  function getObjectById(id: string) {
    return canvas.value?.getObjects().find(obj => obj.get('id') === id);
  }

  return {
    canvas,
    init,
    setActiveTool,
    activeTool,
    savedActiveTool,
    saveActiveTool,
    restoreActiveTool,
    enableTempMoveMode,
    getObjectById,
  };
});
