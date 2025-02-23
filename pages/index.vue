<script setup lang="ts">
import {
  type Textbox,
  type FabricObject,
  type FabricObjectProps,
  type ObjectEvents,
  type SerializedObjectProps,
  Point,
  type TPointerEventInfo,
  type TPointerEvent,
} from 'fabric';
import { ref, computed, onMounted } from 'vue';
import { useKeyModifier } from '@vueuse/core';
import { createFabricObject } from '~/utils/fabric/fabric';
import { CIRCLE_RADIUS, updateLinePosition } from '~/utils/fabric/lineControl';
import { handlePaste } from '~/utils/fabric/utils';

useHead({
  htmlAttrs: { lang: 'en' },
  title: 'Mindrawer - A virtual whiteboard for everyone',
  meta: [{ name: 'description', content: '' }],
});

useSeoMeta({
  charset: 'utf-8',
  author: 'huynamboz',
  title: 'Mindrawer - A virtual whiteboard for everyone',
  ogTitle: 'Mindrawer - A virtual whiteboard for everyone',
  description:
    'Mindrawer is a simple drawing tool that allows you to draw with ease',
  ogDescription:
    'Mindrawer is a simple drawing tool that allows you to draw with ease',
  ogImage: '/public/images/thumbnail.png',
});

const shiftState = useKeyModifier('Shift');
const fabricStore = useFabricStore();
const fabricSettingStore = useFabricSettingStore();
const canvasElement = ref<HTMLCanvasElement | null>(null);

const canvas = computed(() => fabricStore.canvas);
const dragTools = ['move', 'select'];
const isMouseDown = ref(false);
const isDragging = ref(false); // Track dragging state
const lastPosX = ref<number>(0);
const lastPosY = ref<number>(0); // Store last mouse positions
const startX = ref<number>(0);
const startY = ref<number>(0);
const fabricObj = ref<FabricObject<
  Partial<FabricObjectProps>,
  SerializedObjectProps,
  ObjectEvents
> | null>();

const zoomOffset = ref({ x: 0, y: 0, delta: 0 });
const panOffset = ref({ deltaX: 0, deltaY: 0 });
const zoomUpdated = ref(false);
const panUpdated = ref(false);

// Pinch to zoom - https://turriate.com/articles/how-to-pinch-to-zoom-2-finger-pan-fabricjs-canvas
function handleZoomCanvas(opt: TPointerEventInfo<WheelEvent>) {
  if (!canvas.value) {
    return;
  }
  opt.e.preventDefault();
  opt.e.stopPropagation();

  if (opt.e.ctrlKey) {
    const delta = opt.e.deltaY;
    // let zoom = canvas.value.getZoom();
    // zoom *= 0.985 ** delta;
    // fabricStore.setZoom(zoom, {
    //   point: new Point(opt.e.offsetX, opt.e.offsetY),
    // });
    // canvas.value.renderAll();
    zoomUpdated.value = false;
    zoomOffset.value = {
      x: opt.e.offsetX,
      y: opt.e.offsetY,
      delta,
    };
  }
  else {
    // Di chuyển canvas (pan)
    // const e = opt.e;
    // const vpt = canvas.value.viewportTransform;

    panUpdated.value = false;
    panOffset.value = {
      deltaX: opt.e.deltaX,
      deltaY: opt.e.deltaY,
    };
    // Đảo chiều giá trị delta để pan hoạt động đúng hướng
    // vpt[4] -= e.deltaX;
    // vpt[5] -= e.deltaY;
    // // Set coord to fix bug object move but control dot not
    // canvas.value.getActiveObjects().forEach((o) => {
    //   o.setCoords();
    // });
    // canvas.value.getActiveObject()?.setCoords();
    // canvas.value.renderAll();
  }
}

function update() {
  if (!canvas.value) {
    return;
  }
  if (!zoomUpdated.value) {
    let zoom = canvas.value.getZoom();
    zoom *= 0.985 ** zoomOffset.value.delta;
    fabricStore.setZoom(zoom, {
      point: new Point(zoomOffset.value.x, zoomOffset.value.y),
    });
    zoomUpdated.value = true;
  }

  if (!panUpdated.value) {
    const vpt = canvas.value.viewportTransform;
    vpt[4] -= panOffset.value.deltaX;
    vpt[5] -= panOffset.value.deltaY;
    canvas.value.getActiveObjects().forEach((o) => {
      o.setCoords();
    });
    canvas.value.getActiveObject()?.setCoords();
    canvas.value.renderAll();
    panUpdated.value = true;
  }
  requestAnimationFrame(update);
}

function handleMouseDown(opt: TPointerEventInfo<MouseEvent>) {
  if (!canvas.value) {
    return;
  }

  if (opt.target || fabricStore.activeTool === 'select') {
    fabricSettingStore.rerenderSetting();
  }

  const evt = opt.e;
  const pointer = canvas.value.getPointer(evt);
  fabricStore.setMousePosition(pointer.x, pointer.y);
  isMouseDown.value = true;

  if (fabricStore.activeTool === 'move') {
    lastPosX.value
      = 'clientX' in evt ? evt.clientX : (evt as TouchEvent).touches[0].clientX;
    lastPosY.value
      = 'clientX' in evt ? evt.clientY : (evt as TouchEvent).touches[0].clientY;
  }
  else {
    const pointer = canvas.value.getPointer(evt);
    startX.value = pointer.x;
    startY.value = pointer.y;

    if (!dragTools.includes(fabricStore.activeTool)) {
      const obj = createFabricObject(
        fabricStore.activeTool,
        {
          left: startX.value,
          top: startY.value,
        },
      );

      if (!obj) return;

      fabricObj.value = markRaw(
        obj,
      );

      if (fabricObj.value) {
        canvas.value.add(fabricObj.value);
        if (fabricObj.value.type === 'textbox') {
          fabricStore.setActiveTool('select');
          canvas.value.setActiveObject(fabricObj.value);
          (fabricObj.value as Textbox).enterEditing();
          (fabricObj.value as Textbox).hiddenTextarea?.focus();
        }
        canvas.value.requestRenderAll();
      }
    }
  }
}

function handleMouseMove(opt: TPointerEventInfo<TPointerEvent>) {
  const evt = opt.e;
  if (!canvas.value) {
    return;
  }

  const pointer = canvas.value.getPointer(evt);
  fabricStore.setMousePosition(pointer.x, pointer.y);
  if (isMouseDown.value) {
    isDragging.value = true;
  }

  if (!isDragging.value || !canvas.value) return;

  if (fabricStore.activeTool === 'move') {
    const vpt = canvas.value.viewportTransform;
    if ('clientX' in evt) {
      vpt[4] += evt.clientX - lastPosX.value;
      vpt[5] += evt.clientY - lastPosY.value;
      lastPosX.value = evt.clientX;
      lastPosY.value = evt.clientY;
    }
    else {
      vpt[4] += evt.touches[0].clientX - lastPosX.value;
      vpt[5] += evt.touches[0].clientY - lastPosY.value;
      lastPosX.value = evt.touches[0].clientX;
      lastPosY.value = evt.touches[0].clientY;
    }
    canvas.value.requestRenderAll();
  }
  else {
    const width = pointer.x - startX.value;
    const height = pointer.y - startY.value;
    const rx = Math.abs(pointer.x - startX.value) / 2; // Half width
    const ry = Math.abs(pointer.y - startY.value) / 2; // Half height
    const left = Math.min(pointer.x, startX.value);
    const top = Math.min(pointer.y, startY.value);

    if (fabricObj.value && !dragTools.includes(fabricStore.activeTool)) {
      switch (fabricObj.value.type) {
        case 'rect':
        case 'triangle':
          fabricObj.value.set({
            width: Math.abs(width),
            height: Math.abs(height),
            left: width > 0 ? startX.value : startX.value - Math.abs(width),
            top: height > 0 ? startY.value : startY.value - Math.abs(height),
          });
          break;
        case 'ellipse':
          fabricObj.value.set({
            left: left,
            top: top,
            rx,
            ry: shiftState.value ? rx : ry,
          });
          break;
        case 'circle':
          fabricObj.value.set({
            top: pointer.y - CIRCLE_RADIUS,
            left: pointer.x - CIRCLE_RADIUS,
          });
          if (fabricStore.activeTool === 'line3') {
            updateLinePosition(
              fabricObj.value,
              true,
            );
          }
          else {
            console.log('line moving', fabricObj.value);
            updateLinePosition(fabricObj.value);
          }
          break;
        case 'line':
          console.log('line moving', fabricObj.value);
          updateLinePosition(fabricObj.value, true);
          break;
      }
      fabricObj.value.setCoords();
      canvas.value.renderAll();
    }
  }
}

function handleMouseUp() {
  try {
    if (!canvas.value) return;
    if (
      !isDragging.value
      && fabricObj.value
      && fabricObj.value.type !== 'textbox'
      && (fabricObj.value.width < 2 || fabricObj.value.height < 2)
    ) {
      canvas.value.remove(fabricObj.value);
      return;
    }
    if (isDragging.value) {
      if (fabricObj.value && !dragTools.includes(fabricStore.activeTool)) {
        fabricStore.setActiveTool('select');
        canvas.value.setActiveObject(fabricObj.value);
        canvas.value.renderAll();
        fabricObj.value = null;

        // save history
        const fabricHistoryStore = useFabricHistoryStore();
        fabricHistoryStore.clearAfterIndex();
        fabricHistoryStore.historySaveAction();
      }
    }
  }
  catch (error) {
    console.error(error);
  }
  finally {
    isMouseDown.value = false;
    isDragging.value = false;
  }
}

onMounted(() => {
  if (!canvasElement.value) {
    return;
  }
  fabricStore.init(canvasElement.value);

  if (!canvas.value) {
    return;
  }
  canvas.value.on('mouse:wheel', handleZoomCanvas);

  canvas.value.on('mouse:down', handleMouseDown);

  canvas.value.on('mouse:move', handleMouseMove);

  canvas.value.on('mouse:up', handleMouseUp);

  document.addEventListener('paste', handlePaste);

  document.addEventListener('copy', () => {
    if (!canvas.value) return;
    const objects = canvas.value.getActiveObjects();
    if (objects.length === 0) return;
    const clipboard = objects.map(o => o.toObject());
    const content = JSON.stringify({
      type: 'objects/mindrawer',
      version: '1.0.0',
      objects: clipboard,
    });
    // Copy to clipboard
    navigator.clipboard.writeText(content);
  });

  requestAnimationFrame(update);
});
</script>

<template>
  <div class="w-full h-full">
    <canvas
      id="canvas"
      ref="canvasElement"
      class="w-full h-full"
    />
  </div>
</template>
