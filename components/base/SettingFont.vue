<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';

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
      <div
        class="border-b px-3 flex items-center"
        @click.stop
      >
        <span class="i-lineicons-search-alt" />
        <input
          type="text"
          class="w-full h-8 px-2 rounded-md outline-none"
          placeholder="Search font"
        >
      </div>
      <ul class="p-2">
        <li
          v-for="font in fonts"
          :key="font"
          :style="{ fontFamily: font }"
          class="flex items-center gap-2 h-[30px] font-medium cursor-pointer hover:bg-gray-100 p-2 rounded-lg"
          @click="currentFont = font"
          @mouseover="fabricSettingStore.setObjSetting('fontFamily', font, { temp: true })"
        >
          {{ font }}
          <span
            v-if="currentFont === font"
            class="i-lineicons-check text-base"
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
        :style="{ fontFamily: currentFont }"
        class="w-full h-6 rounded-md px-2 outline-none font-medium"
        type="text"
        disabled
      >
    </div>
  </div>

  <p class="mt-2">
    Size
  </p>

  <div class="flex items-center gap-2 mt-2">
    <div class="flex gap-2 w-full items-center">
      <div
        v-for="size in fontSizes"
        :key="size.label"
        :class="{ ' bg-[#f1faf1] !border-[#6ad171]': objSettings.fontSize === size.value }"
        class="relative min-w-8 h-8 border-transparent hover:bg-[#f5faf5] flex justify-center items-center p-[2px] border rounded-md cursor-pointer hover:scale-110 transition-all duration-150"
        @click="fabricSettingStore.setObjSetting('fontSize', size.value)"
      >
        {{ size.label }}
      </div>

      <Select
        class="flex-auto"
        :model-value="String(objSettings.fontSize)"
        @update:model-value="fabricSettingStore.setObjSetting('fontSize', Number($event))"
      >
        <SelectTrigger class="text-xs h-8">
          <!-- <SelectValue /> -->
          {{ objSettings.fontSize }}
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem
              v-for="n in 20"
              :key="n"
              :value="String(n * 4)"
            >
              {{ n * 4 }}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  </div>
</template>

<style scoped>
.font-custom {
  font-family: 'Poppins', sans-serif;
}
</style>
