<script setup lang="ts">
const fabricHistoryStore = useFabricHistoryStore();
</script>

<template>
  <div class="flex border shadow-sm rounded-lg p-[2px]">
    <div
      class="w-8 h-8 rounded-md hover:bg-slate-100 cursor-pointer flex justify-center items-center"
      @click="fabricHistoryStore.undo"
    >
      <span class="i-solar-undo-left-round-bold" />
    </div>
    <div
      class="w-8 h-8 rounded-md hover:bg-slate-100 cursor-pointer flex justify-center items-center"
      @click="fabricHistoryStore.redo"
    >
      <span class="i-solar-undo-right-round-bold" />
    </div>
  </div>
</template>
