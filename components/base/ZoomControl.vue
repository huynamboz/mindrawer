<script setup>
const fabricStore = useFabricStore();
const currentZoomValue = computed(() => fabricStore.zoom);
const ZOOM_STEP = 0.15; // 15%
</script>

<template>
  <div class="max-md:bottom-32 fixed items-center flex flex-col gap-1 bottom-5 right-3 z-50  text-xs ">
    <!-- reset btn -->
    <div
      class=" w-8 h-8 hover:bg-slate-100 cursor-pointer flex justify-center items-center rounded-md"
      @click="fabricStore.setZoom(1)"
    >
      <span class=" text-xl i-solar-refresh-line-duotone" />
    </div>

    <div class="relative bg-white border shadow-sm rounded-lg font-light p-1 gap-1 flex flex-col items-center">
      <div
        class="w-8 h-8 hover:bg-slate-100 cursor-pointer flex justify-center items-center rounded-md"
        @click="fabricStore.setZoom(currentZoomValue + ZOOM_STEP, { manual: true })"
      >
        <span class="i-ph-plus text-lg" />
      </div>
      {{ (currentZoomValue * 100).toFixed(0) }}%
      <div
        class="w-8 h-8 hover:bg-slate-100 cursor-pointer flex justify-center items-center rounded-md"
        @click="fabricStore.setZoom(currentZoomValue - ZOOM_STEP, { manual: true })"
      >
        <span class="i-ph-minus text-lg" />
      </div>
    </div>
  </div>
</template>
