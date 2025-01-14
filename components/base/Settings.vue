<script setup lang="ts">
import SettingColor from './SettingColor.vue';
import SettingStrokeWidth from './SettingStrokeWidth.vue';
import SettingFont from './SettingFont.vue';
import { Slider } from '@/components/ui/slider';

const fabricStore = useFabricStore();
const fabricSettingStore = useFabricSettingStore();
const objSettings = computed(() => fabricSettingStore.objectSettings);
const editorSettings = computed(() => fabricSettingStore.editorSettings);
const settings = [
  {
    type: ['text'],
    options: ['stroke', 'fontColor', 'fontFamily', 'fontSize', 'opacity'],
  },
  {
    type: ['rect', 'triangle', 'ellipse', 'line', 'line3'],
    options: ['fill', 'stroke', 'strokeWidth', 'opacity'],
  },
];

const currentObjType = ref<string>('');
onBeforeMount(() => {
  const obj = fabricStore.canvas?.getActiveObject();
  if (obj) {
    currentObjType.value = obj.type;
  }
  else {
    currentObjType.value = fabricStore.activeTool;
  }
});

const settingsFilter = computed(() => {
  return settings.find(setting => setting.type.includes(currentObjType.value)) || { options: [] };
});
</script>

<template>
  <div
    v-if="settingsFilter.options.length"
    class="fixed max-h-[80vh] h-fit top-20 right-3 z-50"
  >
    <div
      class="relative font-light text-gray-600 text-xs p-3 h-fit rounded-xl w-[240px] border bg-white shadow-lg"
    >
      <template
        v-for="setting in settingsFilter.options"
        :key="setting"
      >
        <div v-if="setting === 'fill'">
          <SettingColor
            label="Fill"
            setting-key="fill"
            history-key="recentFillColors"
            :history-colors="editorSettings.recentFillColors"
          />
        </div>

        <div
          v-if="setting === 'stroke'"
          class="mt-4"
        >
          <SettingColor
            label="Stroke"
            setting-key="stroke"
            history-key="recentStrokeColors"
            :history-colors="editorSettings.recentStrokeColors"
          />
        </div>

        <div
          v-if="setting === 'fontColor'"
          class="mt-4"
        >
          <SettingColor
            label="Font color"
            :is-font-color="true"
            setting-key="stroke"
            history-key="recentFillColors"
            :history-colors="editorSettings.recentStrokeColors"
          />
        </div>

        <div
          v-if="setting === 'fontFamily'"
          class="mt-4"
        >
          <SettingFont />
        </div>
        <!-- stroke width -->
        <div
          v-if="setting === 'strokeWidth'"
          class="mt-4"
        >
          <SettingStrokeWidth />
        </div>
        <!-- opacity -->
        <div
          v-if="setting === 'opacity'"
          class="mt-4"
        >
          <p class="mb-2">
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
      </template>
    </div>
  </div>
</template>
