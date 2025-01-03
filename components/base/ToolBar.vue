<script setup lang="ts">
import type { Toolbar } from '~/types/toolbar';

const fabricStore = useFabricStore();

const toolbars = ref<Toolbar[]>([
  {
    name: 'Hand',
    icon: 'i-lineicons-hand',
    action: 'move',
  },
  {
    name: 'Move',
    icon: 'i-lineicons-location-arrow-right',
    action: 'select',
  },
  {
    name: 'Triangle',
    icon: 'i-ph-triangle',
    action: 'triangle',
  },
  {
    name: 'Rectangle',
    icon: 'i-ph-rectangle',
    action: 'rect',
  },
  {
    name: 'Ellipse',
    icon: 'i-ph-circle',
    action: 'ellipse',
  },
]);
</script>

<template>
  <div class="fixed z-50 bottom-8 w-fit -translate-x-1/2 left-1/2 h-[40px] shadow-sm bg-white rounded-lg border">
    <div class="relative w-fit flex items-center gap-1 px-1 py-1 ">
      <p class="text-[10px] whitespace-nowrap text-gray-500 absolute -top-6 left-1/2 transform -translate-x-1/2">
        To move canvas, hold <span class="font-bold">Space</span> and drag or use <span class="font-bold">Hand

          <span class="i-lineicons-hand" />
        </span> tool
      </p>
      <!-- <div class="h-full border-r flex items-center gap-1 px-1">
      <div
        :class="{ '!bg-slate-200': fabricStore.activeTool === toolbars[0].action }"
        class="w-8 h-8 hover:bg-slate-100 flex cursor-pointer rounded-md items-center justify-center"
        @click="fabricStore.setActiveTool('move')"
      >
        <span class="i-lineicons-hand" />
      </div>
      <div
        :class="{ '!bg-slate-200': fabricStore.activeTool === toolbars[1].action }"
        class="w-8 h-8 hover:bg-slate-100 flex cursor-pointer rounded-md items-center justify-center"
        @click="fabricStore.setActiveTool('select')"
      >
        <span class="i-lineicons-location-arrow-right" />
      </div>
    </div> -->

      <!-- list -->
      <div
        v-for="toolbar in toolbars"
        :key="toolbar.name"
        class="h-full flex items-center gap-1"
      >
        <div
          :class="{ '!bg-slate-200': fabricStore.activeTool === toolbar.action }"
          class="w-8 h-8 hover:bg-slate-100 flex cursor-pointer rounded-md items-center justify-center"
          @click="fabricStore.setActiveTool(toolbar.action)"
        >
          <span :class="toolbar.icon" />
        </div>
      </div>
    </div>
  </div>
</template>
