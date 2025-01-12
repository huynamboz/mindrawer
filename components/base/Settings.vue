<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components';
import ColorPickerWrapper from './ColorPickerWrapper.vue';

const color = ref('#1BC7B1');
const backgrounds = ref([]);
const isShowBackgroundPicker = ref(false);
onMounted(() => {
  const savedBgs = localStorage.getItem('vue-colorpicker-history');
  if (savedBgs) {
    backgrounds.value = JSON.parse(savedBgs);
  }
});
</script>

<template>
  <div class="fixed max-h-[80vh] h-full top-1/2 -translate-y-1/2 right-3 z-50">
    <div class="relative text-xs p-3 h-full rounded-xl w-[250px] border bg-white shadow-lg ">
      <div>
        <p>Background</p>
        <div class="flex gap-2 mt-2">
          <div
            v-for="colorItem in backgrounds"
            :key="colorItem"
            class="w-6 h-6 p-[2px] border rounded-md cursor-pointer hover:scale-110 transition-all duration-150"
          >
            <div
              class="w-full h-full rounded-[4px]"
              :style="{ background: colorItem }"
            />
          </div>
          <img
            class="w-6 h-6 rounded-md cursor-pointer"
            src="/color-wheel.png"
            alt=""
            @click="isShowBackgroundPicker = !isShowBackgroundPicker"
          >
        </div>
        <div
          v-if="isShowBackgroundPicker"
          v-on-click-outside="() => isShowBackgroundPicker = false"
          class="absolute right-[calc(100%+10px)] !shadow-lg border !rounded-xl overflow-hidden !bg-white"
        >
          <div class="px-4 pt-3">
            Background
          </div>
          <ColorPickerWrapper
            :color="color"
            class="!bg-white !pt-0 mt-2"
          />
        </div>
      </div>
    </div>
  </div>
</template>
