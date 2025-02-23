<script setup lang="ts">
const fabricStore = useFabricStore();

const moveToFront = () => {
  const activeObj = fabricStore.canvas?.getActiveObject();
  if (!activeObj) return;
  fabricStore.canvas?.bringObjectToFront(activeObj);
  fabricStore.canvas?.requestRenderAll();
};

const moveToBack = () => {
  const activeObj = fabricStore.canvas?.getActiveObject();
  if (!activeObj) return;
  fabricStore.canvas?.sendObjectToBack(activeObj);
  fabricStore.canvas?.requestRenderAll();
};
</script>

<template>
  <div>
    <p>
      Move to front/back
    </p>
    <div class="flex gap-2 mt-2 items-center">
      <div
        class="flex-1 flex justify-center border p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
        @click="moveToFront"
      >
        <span class="text-lg i-lineicons-arrow-upward" />
      </div>
      <div
        class="flex-1 flex justify-center border p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
        @click="moveToBack"
      >
        <span class="text-lg i-lineicons-arrow-downward" />
      </div>
    </div>
  </div>
</template>
