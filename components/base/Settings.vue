<script setup lang="ts">
import SettingColor from './SettingColor.vue';
import SettingStrokeWidth from './SettingStrokeWidth.vue';
import SettingRounded from './SettingRounded.vue';
import SettingFont from './SettingFont.vue';
import SettingArrow from './SettingArrow.vue';
import SettingIndex from './SettingIndex.vue';
import { Slider } from '@/components/ui/slider';

const fabricStore = useFabricStore();
const fabricSettingStore = useFabricSettingStore();
const objSettings = computed(() => fabricSettingStore.objectSettings);
const editorSettings = computed(() => fabricSettingStore.editorSettings);
const settings = [
  {
    type: ['textbox', 'text'],
    options: ['fontColor', 'fontFamily', 'fontSize', 'opacity', 'index', 'delete'],
  },
  {
    type: ['group', 'image'],
    options: ['opacity', 'index', 'delete'],
  },
  {
    type: ['path'],
    options: ['opacity', 'fill', 'index', 'delete'],
  },
  {
    type: ['rect'],
    options: ['fill', 'stroke', 'strokeWidth', 'rounded', 'opacity', 'index', 'delete'],
  },
  {
    type: ['triangle'],
    options: ['fill', 'stroke', 'strokeWidth', 'rounded', 'opacity', 'index', 'delete'],
  },
  {
    type: ['ellipse'],
    options: ['fill', 'stroke', 'strokeWidth', 'opacity', 'index', 'delete'],
  },
  {
    type: ['line', 'line3'],
    options: ['stroke', 'strokeWidth', 'opacity', 'index', 'delete'],
  },
  {
    type: ['arrow'],
    options: ['arrows', 'index', 'delete'],
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

function handleDeleteObjects() {
  if (!fabricStore.canvas) return;
  const objects = fabricStore.canvas.getActiveObjects();
  fabricStore.canvas.remove(...objects);
  fabricStore.canvas.discardActiveObject();
  fabricStore.canvas.requestRenderAll();
}
</script>

<template>
  <div
    v-if="settingsFilter.options.length"
    class="fixed max-h-[80vh] h-fit top-20 right-3 z-50"
  >
    <div
      class="relative flex flex-col gap-5 font-light shadow-lg rounded-xl border text-gray-600 text-xs p-3 h-fit max-h-[100%] w-[240px] bg-white"
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
        >
          <SettingFont />
        </div>

        <!-- arrows -->
        <div
          v-if="setting === 'arrows'"
        >
          <SettingArrow />
        </div>

        <!-- index -->
        <div
          v-if="setting === 'index'"
        >
          <SettingIndex />
        </div>

        <!-- stroke width -->
        <div
          v-if="setting === 'strokeWidth'"
        >
          <SettingStrokeWidth />
        </div>

        <!-- rounded -->
        <div
          v-if="setting === 'rounded'"
        >
          <SettingRounded />
        </div>

        <!-- opacity -->
        <div
          v-if="setting === 'opacity'"
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

        <!-- delete -->
        <div
          v-if="setting === 'delete'"
          class="flex items-center justify-center py-1 border rounded-lg gap-2 cursor-pointer hover:bg-gray-100"
          @click="handleDeleteObjects"
        >
          <span class="i-lineicons-trash-3 text-xl text-red-500" />
        </div>
      </template>
    </div>
  </div>
</template>
