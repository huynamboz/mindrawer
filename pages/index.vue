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
import { handlePasteImage } from '~/utils/fabric/image';
import { createFabricObject } from '~/utils/fabric/fabric';
import { CIRCLE_RADIUS } from '~/utils/fabric/lineControl';

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

// Pinch to zoom - https://turriate.com/articles/how-to-pinch-to-zoom-2-finger-pan-fabricjs-canvas
function handleZoomCanvas(opt: TPointerEventInfo<WheelEvent>) {
  if (!canvas.value) {
    return;
  }
  opt.e.preventDefault();
  opt.e.stopPropagation();

  if (opt.e.ctrlKey) {
    const delta = opt.e.deltaY;
    let zoom = canvas.value.getZoom();
    zoom *= 0.985 ** delta;
    fabricStore.setZoom(zoom, {
      point: new Point(opt.e.offsetX, opt.e.offsetY),
    });
  }
  else {
    // Di chuyển canvas (pan)
    const e = opt.e;
    const vpt = canvas.value.viewportTransform;

    // Đảo chiều giá trị delta để pan hoạt động đúng hướng
    vpt[4] -= e.deltaX;
    vpt[5] -= e.deltaY;
    // Set coord to fix bug object move but control dot not
    canvas.value.getActiveObjects().forEach((o) => {
      o.setCoords();
    });
    canvas.value.getActiveObject()?.setCoords();
    canvas.value.requestRenderAll();
  }
}

function handleMouseDown(opt: TPointerEventInfo<MouseEvent>) {
  if (!canvas.value) {
    return;
  }

  const evt = opt.e;
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
      fabricObj.value = markRaw(
        createFabricObject(
          fabricStore.activeTool,
          {
            left: startX.value,
            top: startY.value,
          },
          {
            startPoints: [startX.value, startY.value],
          },
        ),
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
          if ('updateLinePosition' in fabricObj.value) {
            if (fabricStore.activeTool === 'line3') {
              (fabricObj.value as any).updateLinePosition(
                fabricObj.value,
                true,
              );
            }
            else {
              (fabricObj.value as any).updateLinePosition(fabricObj.value);
            }
          }
          break;
        case 'line':
          console.log('line moving', fabricObj.value);
          (fabricObj.value as any).updateLinePosition(fabricObj.value, true);
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

  document.addEventListener('paste', handlePasteImage);
});
</script>

<template>
  <ClientOnly fallback-tag="div">
    <div class="w-full h-full">
      <canvas
        id="canvas"
        ref="canvasElement"
        class="w-full h-full"
      />
    </div>
    <template #fallback>
      <!-- this will be rendered on server side -->
      <div class="fixed top-0 left-0 z-[90] w-full h-full flex items-center justify-center bg-blue-900">
        <img
          src="/logo.png"
          alt="loading"
        >
      </div>
    </template>
  </ClientOnly>
</template>
