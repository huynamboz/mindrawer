import { FabricObject, type ActiveSelection } from 'fabric';
import { Canvas, Point } from 'fabric';
import FontFaceObserver from 'fontfaceobserver';
import { useFabricSettingStore } from './editorSetting';
import type { ToolType } from '~/types/toolbar';
import { defaultObjectControl } from '~/utils/fabric/fabric';
import { updateLinePositionWrapper } from '~/utils/fabric/lineControl';
import { getAdditionalObjectKey } from '~/utils/fabric';
import { deselectAllPoint, assignEventToObj } from '~/utils/fabricEventHandler';
import { fitTextboxToContent } from '~/utils/fabric/utils';
import { handleImageUpload } from '~/utils/fabric/image';

export const useFabricStore = defineStore('fabric', () => {
  const canvas = ref<Canvas>();
  const activeTool = ref<ToolType>('select');
  const savedActiveTool = ref<ToolType>('select');
  const mousePosition = ref({ x: 0, y: 0 });
  const zoom = ref(1);
  const canvasHTMLElement = ref<HTMLCanvasElement>();

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
  async function init(canvasElement: HTMLCanvasElement) {
    canvasHTMLElement.value = canvasElement;
    canvas.value = markRaw(
      new Canvas(canvasElement, {
        uniformScaling: false,
        renderOnAddRemove: false,
        preserveObjectStacking: true,
        selectionFullyContained: true,
        targetFindTolerance: 10,
      }),
    );
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Load canvas from local storage
    const savedCanvas = localStorage.getItem('canvas');

    const fontFamilyList = savedCanvas?.match(/fontFamily":"(.*?)"/g)?.map(match => match.replace(/fontFamily":"(.*?)"/, '$1'));
    const fontWeights = savedCanvas?.match(/fontWeight":"(.*?)"/g)?.map(match => match.replace(/fontWeight":"(.*?)"/, '$1'));
    console.log('fontFamilyList', fontFamilyList);

    if (fontFamilyList && fontWeights) {
      const uniqueFontFamilyList = Array.from(new Set(fontFamilyList));
      const uniqueFontWeightList = Array.from(new Set(fontWeights));
      const fontPromises = [] as Promise<void>[];

      uniqueFontFamilyList.forEach((fontFamily) => {
        uniqueFontWeightList.forEach((fontWeight) => {
          const fontFace = new FontFaceObserver(fontFamily, { weight: fontWeight });
          fontPromises.push(
            fontFace.load().then(() => {
              console.log(`Font is available: ${fontFamily}, weight: ${fontWeight}`);
            }).catch(() => {
              console.log(`Font is not available: ${fontFamily}, weight: ${fontWeight}`);
            }),
          );
        });
      });
      try {
        await Promise.all(fontPromises);
      }
      catch (error) {
        console.error('Error loading font', error);
      }
    }

    if (savedCanvas) {
      canvas.value.loadFromJSON(savedCanvas, (o, obj) => {
        if (obj && obj instanceof FabricObject) {
          assignEventToObj(obj);
          canvas.value?.requestRenderAll();
        }
      });
    }

    setInterval(() => {
      localStorage.setItem('canvas', JSON.stringify(canvas.value?.toDatalessJSON(getAdditionalObjectKey())));
    }, 5000);

    canvas?.value.on('object:moving', function (e) {
      console.log('object:moving');
      updateLinePositionWrapper(e.target);
    });

    canvas.value?.on('mouse:down', function (e) {
      const target = e.target;
      console.log('mouse:down', target);
      if (!target) {
        deselectAllPoint();
      }
    });

    canvas.value?.on('text:changed', fitTextboxToContent);

    canvas.value.on('object:scaling', function (e) {
      updateLinePositionWrapper(e.target);
    });

    canvas.value.on('object:resizing', function (e) {
      updateLinePositionWrapper(e.target);
    });

    canvas.value.on('selection:created', function (event) {
      const group = canvas.value?.getActiveObject();
      if (group && group.type === 'activeselection' && event.e?.target) {
        // if not select full 3 control line then remove out of selection
        const itemWillRemove: { [key: string]: FabricObject[] } = {};
        (group as ActiveSelection).getObjects().forEach((o) => {
          const groupId = o.get('groupId');
          if (groupId) {
            if (!itemWillRemove[groupId]) {
              itemWillRemove[groupId] = [];
            }
            itemWillRemove[groupId].push(o);
          }
        });

        for (const item in itemWillRemove) {
          if (itemWillRemove[item].length < 2)
            (group as ActiveSelection).remove?.(...itemWillRemove[item]);
        }

        group.set(defaultObjectControl);
      }
    });
  }

  function setMousePosition(x: number, y: number) {
    mousePosition.value = { x, y };
  }

  function setActiveTool(action: ToolType) {
    if (!canvas.value || action === activeTool.value) return;

    const fabricSettingStore = useFabricSettingStore();
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
        Object.assign(obj, {
          prevSelectable: obj.selectable,
          prevEvented: obj.evented,
        });
        obj.selectable = false;
        obj.evented = false;
      });
      fabricSettingStore.rerenderSetting();
      if (action === 'image') {
        handleImageUpload();
      }
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

  async function setZoom(
    val: number,
    options?: { manual?: boolean; point?: Point; velocity?: number },
  ) {
    if (!canvas.value) return;

    // Limit the zoom value
    val = Math.max(0.1, Math.min(20, val));

    const { manual = false, point, velocity = 1 } = options ?? {};
    const zoomPoint
      = point
      ?? new Point(canvas.value.getWidth() / 2, canvas.value.getHeight() / 2);

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
  async function animateZoom(
    targetZoom: number,
    zoomPoint: Point,
    velocity = 1,
  ) {
    const step = 0.01 * velocity; // Small zoom step for animation
    const intervalTime = 10; // Time interval between steps (ms)

    const isZoomingIn = targetZoom > zoom.value;
    return new Promise<void>((resolve) => {
      let currentZoom = zoom.value;

      const interval = setInterval(() => {
        // Stop the interval when the target zoom value is reached
        if (
          (isZoomingIn && currentZoom >= targetZoom)
          || (!isZoomingIn && currentZoom <= targetZoom)
        ) {
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
    canvasHTMLElement,
    saveActiveTool,
    restoreActiveTool,
    enableTempMoveMode,
    getObjectById,
    setZoom,
    setMousePosition,
  };
});
