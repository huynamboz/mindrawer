<script setup lang="ts">
import { onKeyStroke, useMagicKeys } from '@vueuse/core';
import type { Toolbar } from '~/types/toolbar';

const { space, Ctrl_Z, meta_Z, Ctrl_Y, meta_Shift_Z } = useMagicKeys();

const fabricStore = useFabricStore();
const fabricHistoryStore = useFabricHistoryStore();

const toolbars = ref<Toolbar[]>([
  {
    name: 'Hand',
    icon: 'i-lineicons-hand',
    action: 'move',
    key: 'a',
  },
  {
    name: 'Move',
    icon: 'i-lineicons-location-arrow-right',
    action: 'select',
    key: 's',
  },
  {
    name: 'Triangle',
    icon: 'i-ph-triangle',
    action: 'triangle',
    key: 'd',
  },
  {
    name: 'Rectangle',
    icon: 'i-ph-rectangle',
    action: 'rect',
    key: 'f',
  },
  {
    name: 'Ellipse',
    icon: 'i-ph-circle',
    action: 'ellipse',
    key: 'g',
  },
  {
    name: 'Line',
    icon: 'i-ph-line-segment',
    action: 'line',
    key: 'h',
  },
  {
    name: 'Line',
    img: '/assets/svg/arrows/4.svg',
    action: 'arrow',
    key: 'h',
  },
  {
    name: '3 path',
    icon: 'i-ph-line-segments',
    action: 'line3',
    key: 'j',
  },
  {
    name: 'Text',
    icon: 'i-ph-text-aa',
    action: 'text',
    key: 'k',
  },
  {
    name: 'Image',
    icon: 'i-ph-image',
    action: 'image',
    key: 'l',
  },
]);

const isAnyTextboxEditing = () => {
  const objects = fabricStore.canvas?.getActiveObjects() ?? [];
  if (objects.length === 0) {
    return false;
  }
  return objects.some(i => i.get('isEditing'));
};

// switch tool by key
onKeyStroke(
  toolbars.value.map(i => i.key),
  (e) => {
    const toolbar = toolbars.value.find(t => t.key === e.key);

    // dont switch tool if current object active is textbox
    if (isAnyTextboxEditing()) {
      return;
    }
    if (toolbar) fabricStore.setActiveTool(toolbar.action);
  },
);

// delete selected object
onKeyStroke('Backspace', () => {
  if (!fabricStore.canvas || isAnyTextboxEditing()) return;
  const objects = fabricStore.canvas.getActiveObjects();
  fabricStore.canvas.remove(...objects);
  fabricStore.canvas.discardActiveObject();
  fabricStore.canvas.renderAll();
});

// switch to move tool when space is pressed
watch(space, (v) => {
  if (
    fabricStore.activeTool === 'move'
    && fabricStore.savedActiveTool === 'move'
  )
    return;

  if (isAnyTextboxEditing()) {
    return;
  }

  if (v) {
    fabricStore.enableTempMoveMode();
  }
  else {
    fabricStore.restoreActiveTool();
  }
});

// undo redo
watch([meta_Z, Ctrl_Z], (v) => {
  // do something
  if ((v[0] || v[1]) && !meta_Shift_Z.value) {
    console.log('undo');
    fabricHistoryStore.undo();
  }
});

watch([meta_Shift_Z, Ctrl_Y], (v) => {
  // do something
  if (v[0] || v[1]) {
    console.log('redo');
    fabricHistoryStore.redo();
  }
});
</script>

<template>
  <div
    class="fixed z-50 overflow-x-auto max-w-[90vw] bottom-5 w-fit -translate-x-1/2 left-1/2 h-[40px] shadow-sm bg-white rounded-lg border"
  >
    <div class="relative w-fit flex items-center gap-1 px-1 py-1">
      <p
        class="text-[10px] whitespace-nowrap text-gray-500 absolute -top-6 left-1/2 transform -translate-x-1/2"
      >
        To move canvas, hold <span class="font-bold">Space</span> and drag or
        use
        <span class="font-bold">Hand

          <span class="i-lineicons-hand" />
        </span>
        tool
      </p>
      <div
        v-for="(toolbar, index) in toolbars"
        :key="toolbar.name"
        class="h-full relative flex items-center gap-1"
      >
        <span
          :class="{
            'text-gray-800': fabricStore.activeTool === toolbar.action,
          }"
          class="absolute -top-[1px] left-1 text-gray-400 text-[9px]"
        >
          {{ toolbar.key }}
        </span>
        <div
          :class="{
            '!bg-slate-200': fabricStore.activeTool === toolbar.action,
          }"
          class="w-8 h-8 hover:bg-slate-100 flex cursor-pointer rounded-md items-center justify-center"
          @click="fabricStore.setActiveTool(toolbar.action)"
        >
          <span
            v-if="toolbar.icon"
            :class="toolbar.icon"
          />
          <img
            v-else
            :src="toolbar.img"
            alt="arrow"
            class="w-4 h-4"
          >
        </div>
        <div
          v-if="index === 1"
          class="h-[25px] w-[1px] border-r"
        />
      </div>
    </div>
  </div>
</template>
