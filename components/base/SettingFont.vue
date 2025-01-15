<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components';
import FontFaceObserver from 'fontfaceobserver';
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
  'Montserrat',
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

const fontWeights = [
  {
    label: 'Light',
    value: '300',
  },
  {
    label: 'Regular',
    value: '400',
  },
  {
    label: 'Medium',
    value: '500',
  },
  {
    label: 'Bold',
    value: '700',
  },
];

const fabricSettingStore = useFabricSettingStore();
const objSettings = computed(() => fabricSettingStore.objectSettings);
const currentFont = ref(fabricSettingStore.objectSettings.fontFamily);
const currentFontWeightLabel = computed(() => {
  const weight = fontWeights.find(weight => weight.value === objSettings.value.fontWeight);
  return weight?.label ?? '';
});
const isShowFontPicker = ref(false);

function handleSelectFontProperty({ weight, fontFamily, temp = false }: { weight?: string; fontFamily?: string; temp?: boolean }) {
  const currentFontFamily = fontFamily ?? objSettings.value.fontFamily;
  const currentFontWeight = weight ?? objSettings.value.fontWeight;
  const fontInstance = new FontFaceObserver(currentFontFamily, {
    weight: currentFontWeight,
  });
  console.log('font', fontInstance);
  fontInstance.load().then(() => {
    console.log('Font is available', weight);
    if (weight) {
      fabricSettingStore.setObjSetting('fontWeight', currentFontWeight, { temp });
    }
    if (fontFamily) {
      fabricSettingStore.setObjSetting('fontFamily', currentFontFamily, { temp });
      if (!temp) {
        currentFont.value = currentFontFamily;
      }
    }
  });
}

function restoreInitialFont() {
  fabricSettingStore.loadSettingFromLocalStorage();
  fabricSettingStore.setObjSetting('fontFamily', objSettings.value.fontFamily);
}

onBeforeMount(() => {
  handleSelectFontProperty({});
});
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
          @click="handleSelectFontProperty({ fontFamily: font })"
          @mouseover="handleSelectFontProperty({ fontFamily: font, temp: true })"
          @mouseleave="restoreInitialFont"
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
        :style="{ fontFamily: objSettings.fontFamily }"
        @click="isShowFontPicker = !isShowFontPicker"
      >
        <span class="i-ph-text-aa-light text-xl" />
      </div>
      <input
        :value="objSettings.fontFamily"
        :style="{ fontFamily: objSettings.fontFamily }"
        class="w-full h-6 rounded-md px-2 outline-none font-medium"
        type="text"
        disabled
      >
    </div>
  </div>

  <!-- size -->
  <p class="mt-4">
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
  <!-- end size -->

  <!-- weight -->
  <p class="mt-4">
    Weight
  </p>

  <div class="flex items-center gap-2 mt-2">
    <div class="flex gap-2 w-full items-center">
      <Select
        class="flex-auto"
        :model-value="objSettings.fontWeight"
        @update:model-value="handleSelectFontProperty({ weight: $event })"
      >
        <SelectTrigger class="text-xs h-8">
          <!-- <SelectValue /> -->
          {{ currentFontWeightLabel }}
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem
              v-for="weight in fontWeights"
              :key="weight.label"
              :value="weight.value"
              class="font-light text-xs"
            >
              {{ weight.label }}
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
