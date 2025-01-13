<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components';

const fonts = [
  'Poppins',
  'Bricolage Grotesque',
];

const fontSizes = [
  {
    label: 'XS',
    value: 20,
  },
  {
    label: 'SM',
    value: 25,
  },
  {
    label: 'XL',
    value: 40,
  },
];

const fabricSettingStore = useFabricSettingStore();
const objSettings = computed(() => fabricSettingStore.objectSettings);
const currentFont = computed({
  get: () => objSettings.value.fontFamily,
  set: (val) => {
    fabricSettingStore.setObjSetting('fontFamily', val);
  },
});
const isShowFontPicker = ref(false);
</script>

<template>
  <div class="relative">
    <!-- popup font -->
    <div
      v-show="isShowFontPicker"
      v-on-click-outside="() => isShowFontPicker = false"
      class="absolute top-0 w-full h-fit z-50 right-[calc(100%+20px)] bg-white border border-gray-200 rounded-lg shadow-lg"
      @click="isShowFontPicker = false"
    >
      <ul class="p-2">
        <li
          v-for="font in fonts"
          :key="font"
          :style="{ fontFamily: font }"
          class="flex items-center gap-2 h-[30px] font-semibold cursor-pointer hover:bg-gray-100 p-2 rounded-lg"
          @click="currentFont = font"
          @mouseover="fabricSettingStore.setObjSetting('fontFamily', font, { temp: true })"
        >
          {{ font }}
          <span
            v-if="currentFont === font"
            class="i-lineicons-check text-lg"
          />
        </li>
      </ul>
    </div>
  </div>
  <p class="">
    Font
  </p>

  <div class="flex gap-2 mt-2 items-center">
    <div class="border w-full py-1 px-2 rounded-lg flex items-center gap-2">
      <div
        class="min-w-5 h-5 rounded-md cursor-pointer"
        :style="{ fontFamily: currentFont }"
        @click="isShowFontPicker = !isShowFontPicker"
      >
        <span class="i-ph-text-aa-light text-xl" />
      </div>
      <input
        v-model="currentFont"
        class="w-full h-6 rounded-md px-2 outline-none"
        type="text"
        disabled
      >
    </div>
  </div>

  <p class="mt-2">
    Size
  </p>

  <div class="flex gap-2 mt-2">
    <div
      v-for="size in fontSizes"
      :key="size.label"
      :class="{ ' bg-[#f1faf1] border-[#6ad171]': objSettings.fontSize === size.value }"
      class="relative w-8 h-8 flex justify-center items-center p-[2px] border rounded-md cursor-pointer hover:scale-110 transition-all duration-150"
      @click="fabricSettingStore.setObjSetting('fontSize', size.value)"
    >
      {{ size.label }}
    </div>
  </div>
</template>

<style scoped>
.font-custom {
  font-family: 'Poppins', sans-serif;
}
</style>
