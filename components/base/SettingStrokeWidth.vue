<script setup lang="ts">
import {
  NumberField,
  NumberFieldContent,
  NumberFieldInput,
} from '~/components/ui/number-field';

const fabricSettingStore = useFabricSettingStore();
const objSettings = computed(() => fabricSettingStore.objectSettings);
const currentStrokeWidth = computed({
  get: () => objSettings.value.strokeWidth,
  set: (val) => {
    if (!isNaN(val)) {
      fabricSettingStore.setObjSetting('strokeWidth', val);
    }
    else {
      currentStrokeWidth.value = objSettings.value.strokeWidth;
    }
  },
});
const strokeWidths = [1, 2, 3, 4];
</script>

<template>
  <div>
    <p>
      Stroke Width
    </p>

    <div class="flex gap-2 mt-2 items-center">
      <div
        v-for="strokeWidth in strokeWidths"
        :key="strokeWidth"
        class="w-8 h-8 border rounded-lg px-2 cursor-pointer flex justify-center items-center"
        :class="{ 'border-[#6ad171] bg-[#f1faf1]': objSettings.strokeWidth === strokeWidth }"
        @click="fabricSettingStore.setObjSetting('strokeWidth', strokeWidth)"
      >
        <div
          :style="{ height: `${strokeWidth}px` }"
          class="w-full h-full rounded-sm bg-[#1b1a1f]"
        />
      </div>
      <NumberField
        v-model="currentStrokeWidth"
        class="w-12"
        :min="1"
        :max="20"
        @keydown.backspace.stop
      >
        <NumberFieldContent>
          <NumberFieldInput />
        </NumberFieldContent>
      </NumberField>
    </div>
  </div>
</template>
