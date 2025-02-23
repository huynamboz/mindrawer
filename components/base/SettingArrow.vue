<script setup lang="ts">
import { loadSVGFromClipboard } from '~/utils/fabric/fabric';

const { positionObjToCenter } = useCanvasCenter();
const fabricStore = useFabricStore();
const fabricSettingStore = useFabricSettingStore();
async function selectArrow(url: string) {
  // fetch svg from url
  const obj = await loadSVGFromClipboard(url, { mode: 'url' });
  fabricStore.setActiveTool('select');
  if (obj) {
    obj.set('fill', fabricSettingStore.objectSettings.fill);
    positionObjToCenter(obj);
    fabricStore.canvas?.setActiveObject(obj);
  }
};
</script>

<template>
  <div class="w-full grid grid-cols-4">
    <div
      v-for="n in 27"
      :key="n"
      class="cursor-pointer hover:bg-slate-100 rounded-lg p-1"
      @click="selectArrow(`/assets/svg/arrows/${n}.svg`)"
    >
      <img
        :src="`/assets/svg/arrows/${n}.svg`"
        class="h-12"
        alt="arrow"
      >
    </div>
  </div>
</template>
