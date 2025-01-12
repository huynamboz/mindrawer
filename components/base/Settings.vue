<script setup lang="ts">
import SettingColor from './SettingColor.vue';
import { Slider } from '@/components/ui/slider';

const fabricSettingStore = useFabricSettingStore();
const objSettings = fabricSettingStore.objectSettings;
const editorSettings = fabricSettingStore.editorSettings;
</script>

<template>
  <div class="fixed max-h-[80vh] h-fit top-20 right-3 z-50">
    <div
      class="relative font-light text-gray-600 text-xs p-3 h-fit rounded-xl w-[220px] border bg-white shadow-lg"
    >
      <div>
        <SettingColor
          label="Fill"
          setting-key="fill"
          history-key="recentFillColors"
          :history-colors="editorSettings.recentFillColors"
        />
      </div>

      <div class="mt-4">
        <SettingColor
          label="Stroke"
          setting-key="stroke"
          history-key="recentStrokeColors"
          :history-colors="editorSettings.recentStrokeColors"
        />
      </div>
      <!-- opacity -->
      <p class="mt-4 mb-2">
        Opacity:
        <span class="text-xs text-gray-400">{{ (objSettings.opacity * 100).toFixed(0) }}%</span>
      </p>
      <Slider
        :model-value="[objSettings.opacity]"
        :min="0"
        :max="1"
        :step="0.01"
        @update:model-value="
          $event && fabricSettingStore.setObjSetting('opacity', $event[0])
        "
      />
    </div>
  </div>
</template>
