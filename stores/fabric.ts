import { Canvas, Point } from 'fabric';
import type { ToolType } from '~/types/toolbar';
import { defaultObjectControl } from '~/utils/fabric/fabric';
import { updateLinePositionWrapper } from '~/utils/fabric/lineControl';

export const useFabricStore = defineStore('fabric', () => {
  const canvas = ref<Canvas>();
  const activeTool = ref<ToolType>('select');
  const savedActiveTool = ref<ToolType>('select');
  const mousePosition = ref({ x: 0, y: 0 });
  const zoom = ref(1);

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

  // preserveObjectStacking - Không thay đổi z-index của object khi click
  // targetFindTolerance - vùng xung quanh object để có thể click trúng
  function init(canvasElement: HTMLCanvasElement) {
    canvas.value = markRaw(new Canvas(canvasElement, {
      uniformScaling: false,
      renderOnAddRemove: false,
      preserveObjectStacking: true,
      selectionFullyContained: true,
      targetFindTolerance: 10,
    }));
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    document.addEventListener('mousemove', (e) => {
      mousePosition.value = { x: e.clientX, y: e.clientY };
    });

    canvas?.value.on('object:moving', function (e) {
      updateLinePositionWrapper(e.target);
    });

    canvas.value.on('object:scaling', function (e) {
      updateLinePositionWrapper(e.target);
    });

    canvas.value.on('selection:created', function (event) {
      const group = canvas.value?.getActiveObject();
      if (group && group.type === 'activeselection' && event.e?.target) {
        group.set(defaultObjectControl);
      }
    });
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
        obj.selectable = obj.get('prevSelectable') ?? true;
        obj.evented = obj.get('prevEvented') ?? true;
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

  async function setZoom(val: number, options?: { manual?: boolean; point?: Point; velocity?: number }) {
    if (!canvas.value) return;

    // Limit the zoom value
    val = Math.max(0.1, Math.min(20, val));

    const { manual = false, point, velocity = 1 } = options ?? {};
    const zoomPoint = point ?? new Point(
      canvas.value.getWidth() / 2,
      canvas.value.getHeight() / 2,
    );

    if (!manual) {
      // Direct zoom if "manual" mode is disabled
      canvas.value.zoomToPoint(zoomPoint, val);
      canvas.value.renderAll();
    }
    else {
      // Smooth zoom (animated) in "manual" mode
      await animateZoom(val, zoomPoint, velocity);
    }

    // Update the zoom value
    zoom.value = val;
  }

  // Support function for smooth zoom animation
  async function animateZoom(targetZoom: number, zoomPoint: Point, velocity = 1) {
    const step = 0.01 * velocity; // Small zoom step for animation
    const intervalTime = 10; // Time interval between steps (ms)

    const isZoomingIn = targetZoom > zoom.value;
    return new Promise<void>((resolve) => {
      let currentZoom = zoom.value;

      const interval = setInterval(() => {
        // Stop the interval when the target zoom value is reached
        if ((isZoomingIn && currentZoom >= targetZoom) || (!isZoomingIn && currentZoom <= targetZoom)) {
          clearInterval(interval);
          resolve();
          return;
        }

        // Update the zoom value
        currentZoom = isZoomingIn ? currentZoom + step : currentZoom - step;
        canvas.value?.zoomToPoint(zoomPoint, currentZoom);
        canvas.value?.renderAll();
      }, intervalTime);
    });
  }

  return {
    canvas,
    init,
    setActiveTool,
    activeTool,
    savedActiveTool,
    mousePosition,
    zoom,
    saveActiveTool,
    restoreActiveTool,
    enableTempMoveMode,
    getObjectById,
    setZoom,
  };
});
