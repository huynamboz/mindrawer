<script setup>
const fabricStore = useFabricStore();
const currentZoomValue = computed(() => fabricStore.zoom);
const ZOOM_STEP = 0.15; // 15%
</script>

<template>
  <div
    class="max-md:flex-col max-md:bottom-32 fixed items-center flex gap-1 bottom-5 right-3 z-50 text-xs"
  >
    <!-- reset btn -->
    <div
      class="w-8 h-8 hover:bg-slate-100 cursor-pointer flex justify-center items-center rounded-md"
      @click="fabricStore.setZoom(1)"
    >
      <span class="text-xl i-solar-refresh-line-duotone" />
    </div>

    <div
      class="max-md:flex-col relative bg-white border shadow-sm rounded-lg font-light p-1 gap-1 flex items-center"
    >
      <div
        class="w-8 h-8 hover:bg-slate-100 cursor-pointer flex justify-center items-center rounded-md"
        @click="
          fabricStore.setZoom(currentZoomValue - ZOOM_STEP, { manual: true })
        "
      >
        <span class="i-ph-minus text-lg" />
      </div>
      {{ (currentZoomValue * 100).toFixed(0) }}%
      <div
        class="w-8 h-8 hover:bg-slate-100 cursor-pointer flex justify-center items-center rounded-md"
        @click="
          fabricStore.setZoom(currentZoomValue + ZOOM_STEP, { manual: true })
        "
      >
        <span class="i-ph-plus text-lg" />
      </div>
    </div>
  </div>
</template>
