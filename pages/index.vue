<script setup lang="ts">
import { Triangle, type FabricObject, type Canvas, type FabricObjectProps, type ObjectEvents, type SerializedObjectProps, Rect, Point, type TPointerEventInfo, type TPointerEvent } from 'fabric';
import { ref, computed, onMounted } from 'vue';
import { useKeyModifier } from '@vueuse/core';

const shiftState = useKeyModifier('Shift');
const fabricStore = useFabricStore();
const canvasElement = ref<HTMLCanvasElement | null>(null);

const canvas = computed(() => fabricStore.canvas);
const dragTools = ['move', 'select'];
const isMouseDown = ref(false);
const isDragging = ref(false); // Track dragging state
const lastPosX = ref<number | null>(null);
const lastPosY = ref<number | null>(null); // Store last mouse positions
const startX = ref<number | null>(null);
const startY = ref<number | null>(null);
const fabricObj = ref<FabricObject<Partial<FabricObjectProps>, SerializedObjectProps, ObjectEvents> | null>();

function handleZoomCanvas(opt: TPointerEventInfo<WheelEvent>) {
  if (!canvas.value) {
    return;
  }

  const delta = opt.e.deltaY;
  let zoom = canvas.value.getZoom();
  zoom *= 0.999 ** delta;
  if (zoom > 20) zoom = 20;
  if (zoom < 0.01) zoom = 0.01;
  canvas.value.zoomToPoint(new Point(opt.e.offsetX, opt.e.offsetY), zoom);
  opt.e.preventDefault();
  opt.e.stopPropagation();
}

function handleMouseDown(opt: TPointerEventInfo<MouseEvent>) {
  if (!canvas.value) {
    return;
  }

  const evt = opt.e;
  isMouseDown.value = true;
  if (fabricStore.activeTool === 'move') {
    canvas.value.selection = false; // Disable object selection
    lastPosX.value = evt.clientX;
    lastPosY.value = evt.clientY;
    canvas.value.discardActiveObject();
    canvas.value.forEachObject((obj) => {
      obj.selectable = false;
      obj.evented = false;
    });
    canvas.value.renderAll();
  }
  else {
    const pointer = canvas.value.getPointer(evt);
    startX.value = pointer.x;
    startY.value = pointer.y;

    if (!dragTools.includes(fabricStore.activeTool)) {
      fabricObj.value = markRaw(createFabricObject(fabricStore.activeTool, {
        left: startX.value,
        top: startY.value,
        stroke: 'black',
        strokeWidth: 1,
        fill: 'transparent',
      }));
      if (fabricObj.value) {
        canvas.value.add(fabricObj.value);
      }
    }
  }
}

function handleMouseMove(opt: TPointerEventInfo<TPointerEvent>) {
  const evt = opt.e;
  if (isMouseDown.value) {
    isDragging.value = true;
  }

  if (!isDragging.value || !canvas.value) return;

  if (fabricStore.activeTool === 'move') {
    const vpt = canvas.value.viewportTransform;
    if ('clientX' in evt) {
      vpt[4] += evt.clientX - (lastPosX.value || 0);
      vpt[5] += evt.clientY - (lastPosY.value || 0);
      lastPosX.value = evt.clientX;
      lastPosY.value = evt.clientY;
    }
    else {
      vpt[4] += evt.touches[0].clientX - (lastPosX.value || 0);
      vpt[5] += evt.touches[0].clientY - (lastPosY.value || 0);
      lastPosX.value = evt.touches[0].clientX;
      lastPosY.value = evt.touches[0].clientY;
    }
    canvas.value.requestRenderAll();
  }
  else {
    const pointer = canvas.value.getPointer(evt);
    console.log(startX.value, startY.value, pointer.x, pointer.y);
    const width = pointer.x - (startX.value || 0);
    const height = pointer.y - (startY.value || 0);
    const rx = Math.abs(pointer.x - (startX.value || 0)) / 2; // Half width
    const ry = Math.abs(pointer.y - (startY.value || 0)) / 2; // Half height
    const left = Math.min(pointer.x, startX.value || 0);
    const top = Math.min(pointer.y, startY.value || 0);

    if (fabricObj.value && !dragTools.includes(fabricStore.activeTool)) {
      canvas.value.selection = false;
      console.log(fabricObj.value.type);
      switch (fabricObj.value.type) {
        case 'rect':
        case 'triangle':
          fabricObj.value.set({
            width: Math.abs(width),
            height: Math.abs(height),
            left: width > 0 ? startX.value : startX.value || 0 - Math.abs(width),
            top: height > 0 ? startY.value : startY.value || 0 - Math.abs(height),
          });
          break;
        case 'ellipse':
          fabricObj.value.set({
            left: left,
            top: top,
            // radius: Math.sqrt((pointer.x - (startX.value || 0)) ** 2 + (pointer.y - (startY.value || 0)) ** 2) / 2,
            rx,
            ry: shiftState.value ? rx : ry,
          });
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
    if (!isDragging.value && fabricObj.value && (fabricObj.value.width < 2 || fabricObj.value.height < 2)) {
      canvas.value.remove(fabricObj.value);
      return;
    }
    if (isDragging.value) {
      if (!dragTools.includes(fabricStore.activeTool)) {
        fabricStore.setActiveTool('select');
        canvas.value.setActiveObject(fabricObj.value);
        fabricObj.value = null;
      }

      canvas.value.forEachObject((obj) => {
        obj.selectable = true;
        obj.evented = true;
      });
      canvas.value.renderAll();
    }
  }
  catch (error) {
    console.error(error);
  }
  finally {
    isMouseDown.value = false;
    isDragging.value = false;

    if (!canvas.value) return;
    canvas.value.selection = true;
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
