<script setup lang="ts">
import {
  NumberField,
  NumberFieldContent,
  NumberFieldInput,
} from '~/components/ui/number-field';

const fabricSettingStore = useFabricSettingStore();
const objSettings = computed(() => fabricSettingStore.objectSettings);
const currentBorderRadius = computed({
  get: () => objSettings.value.rx,
  set: (val) => {
    if (!isNaN(val)) {
      fabricSettingStore.setObjSetting('rx', val);
      fabricSettingStore.setObjSetting('ry', val);
    }
    else {
      currentBorderRadius.value = objSettings.value.rx;
    }
  },
});
const borderRadius = [0, 20];
</script>

<template>
  <div>
    <p>
      Border radius
    </p>

    <div class="flex gap-2 mt-2 items-center">
      <div
        v-for="strokeWidth in borderRadius"
        :key="strokeWidth"
        class="w-8 h-8 border rounded-lg border-transparent hover:bg-[#f1faf1] px-2 cursor-pointer flex justify-center items-center"
        :class="{ '!border-[#6ad171] bg-[#f1faf1]': objSettings.rx === strokeWidth }"
        @click="currentBorderRadius = strokeWidth"
      >
        <span
          v-if="strokeWidth === 0"
          class="i-lineicons-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
          ><path
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 20V5a1 1 0 0 1 1-1h15"
          /></svg>
        </span>
        <span
          v-else
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
          ><path
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 20V10a6 6 0 0 1 6-6h10"
          /></svg>
        </span>
      </div>
      <NumberField
        v-model="currentBorderRadius"
        class="w-12"
        :min="1"
        :max="20"
        @keydown.backspace.stop
      >
        <NumberFieldContent>
          <NumberFieldInput class="h-8" />
        </NumberFieldContent>
      </NumberField>
    </div>
  </div>
</template>
