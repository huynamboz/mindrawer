<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components';
import ColorPickerWrapper from './ColorPicker/ColorPickerWrapper.vue';

const fabricSettingStore = useFabricSettingStore();
const isShowBackgroundPicker = ref(false);
const color = ref('#1BC7B1');

const props = defineProps<{
  label: string;
  settingKey: 'fill' | 'stroke';
  historyKey: 'recentFillColors' | 'recentStrokeColors';
  historyColors?: string[];
}>();

function closeBackgroundPicker() {
  isShowBackgroundPicker.value = false;
  fabricSettingStore.setObjSetting(props.settingKey, color.value);
  fabricSettingStore.updateRecentColorFromLocal(props.historyKey);
}

onBeforeMount(() => {
  fabricSettingStore.updateRecentColorFromLocal(props.historyKey);
});

watch(color, () => {
  fabricSettingStore.setObjSetting(props.settingKey, color.value);
});
</script>

<template>
  <div class=" font-light text-gray-600 text-xs">
    <div
      v-if="isShowBackgroundPicker"
      v-on-click-outside="closeBackgroundPicker"
      class="absolute right-[calc(100%+10px)] !shadow-lg border !rounded-xl overflow-hidden !bg-white"
    >
      <div class="px-4 pt-3">
        {{ label }}
      </div>
      <ColorPickerWrapper
        v-model="color"
        :colors-history-key="historyKey"
        class="!bg-white !pt-0 mt-2"
      />
    </div>
    <p class="">
      {{ label }}
    </p>
    <div class="flex gap-2 mt-2">
      <div
        v-for="colorItem in historyColors"
        :key="colorItem"
        :class="{ 'border-1': fabricSettingStore.getObjSetting(settingKey) === colorItem }"
        :style="{ borderColor: fabricSettingStore.getObjSetting(settingKey) === colorItem && colorItem.toLowerCase() !== 'transparent' ? colorItem : 'inherit' }"
        class="relative w-6 h-6 p-[2px] border rounded-md cursor-pointer hover:scale-110 transition-all duration-150"
        @click="fabricSettingStore.setObjSetting(settingKey, colorItem)"
      >
        <div
          class="w-full h-full rounded-[4px] flex justify-center items-center"
          :style="{ background: colorItem }"
        >
          <span
            v-if="fabricSettingStore.getObjSetting(settingKey) === colorItem"
            :class="{ 'text-white': colorItem.toLowerCase() !== 'transparent' }"
            class="i-lineicons-check text-gray-600"
          />
        </div>
      </div>
      <img
        class="w-6 h-6 rounded-md cursor-pointer"
        src="/color-wheel.png"
        alt=""
        @click="isShowBackgroundPicker = !isShowBackgroundPicker"
      >
    </div>
  </div>
</template>
