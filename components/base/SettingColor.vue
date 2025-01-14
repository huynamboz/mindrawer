<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components';
import ColorPickerWrapper from './ColorPicker/ColorPickerWrapper.vue';
import Sucker from './ColorPicker/Sucker.vue';
import { createAlphaSquare } from './ColorPicker/composable';

const fabricSettingStore = useFabricSettingStore();
const isShowBackgroundPicker = ref(false);

const props = defineProps<{
  label: string;
  isFontColor?: boolean;
  settingKey: 'fill' | 'stroke' ;
  historyKey: 'recentFillColors' | 'recentStrokeColors';
  historyColors?: string[];
}>();

const color = ref(fabricSettingStore.getObjSetting(props.settingKey));

function closeBackgroundPicker() {
  isShowBackgroundPicker.value = false;
  if (props.isFontColor) {
    fabricSettingStore.setObjSetting('fill', color.value);
    fabricSettingStore.setObjSetting('stroke', color.value);
  }
  else {
    fabricSettingStore.setObjSetting(props.settingKey, color.value);
  }
  fabricSettingStore.updateRecentColorFromLocal(props.historyKey);
}

watch(color, () => {
  if (props.isFontColor) {
    fabricSettingStore.setObjSetting('fill', color.value);
    fabricSettingStore.setObjSetting('stroke', color.value);
  }
  else {
    fabricSettingStore.setObjSetting(props.settingKey, color.value);
  }
});

const fabricStore = useFabricStore();
const suckerCanvas = ref<HTMLCanvasElement | null>(null);
const suckerArea = ref<number[]>([]);
const isOpenSucker = ref<boolean>(true);
const selectedColor = ref<string>('');

const openSucker = (isOpen: boolean) => {
  isOpenSucker.value = isOpen;

  if (isOpen) {
    setTimeout(() => {
      const sourceCanvas = fabricStore.canvasHTMLElement; // Tham chiếu tới canvas gốc
      if (!sourceCanvas) return;

      const rect = sourceCanvas.getBoundingClientRect();
      const helperCanvas = document.createElement('canvas');
      const ctx = sourceCanvas.getContext('2d');
      const helperCtx = helperCanvas.getContext('2d');

      if (!ctx || !helperCtx) {
        console.error('Failed to get context');
        return;
      }

      // Gán kích thước cho helper canvas
      helperCanvas.width = rect.width;
      helperCanvas.height = rect.height;

      // Vẽ lại nội dung canvas gốc lên helper canvas
      helperCtx.drawImage(sourceCanvas, 0, 0, rect.width, rect.height);

      // Thêm canvas mới (ẩn) vào DOM để xử lý lựa chọn màu
      helperCanvas.style.position = 'absolute';
      helperCanvas.style.left = `${rect.left}px`;
      helperCanvas.style.top = `${rect.top}px`;
      helperCanvas.style.opacity = '0';
      document.body.appendChild(helperCanvas);

      // Lưu canvas để dọn dẹp khi cần
      suckerCanvas.value = helperCanvas;

      suckerArea.value = [
        rect.left,
        rect.top,
        rect.left + rect.width,
        rect.top + rect.height,
      ];

      // Xử lý chọn màu bằng click vào canvas
      helperCanvas.addEventListener('click', (event) => {
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const pixel = helperCtx.getImageData(x, y, 1, 1).data;
        const color = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] / 255})`;
        console.log('Selected color:', color);
        selectedColor.value = color;
        isOpenSucker.value = false;
        suckerCanvas.value?.remove();
      });
    }, 10);
  }
  else {
    // Xóa canvas và dọn tài nguyên nếu tắt
    if (suckerCanvas.value) {
      suckerCanvas.value.remove();
    }
  }
};

const currentColor = computed({
  get: () => fabricSettingStore.getObjSetting(props.settingKey),
  set: (val) => {
    color.value = val;
    fabricSettingStore.setObjSetting(props.settingKey, val);
  },
});

const colorsExample = [
  '#0e1827',
  'transparent',
];
const imgAlphaBase64 = createAlphaSquare(4).toDataURL();
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
        :sucker-hide="true"
        :colors-history-key="historyKey"
        class="!bg-white !pt-0 mt-2"
      />
    </div>
    <p class="">
      {{ label }}
    </p>
    <div class="flex gap-2 mt-2 items-center">
      <div class="border w-full py-0 px-[2px] rounded-lg flex items-center gap-2">
        <div
          class="min-w-5 h-5 rounded-md cursor-pointer"
          :style="{ background: currentColor === 'transparent' ? `url(${imgAlphaBase64})` : currentColor }"
          @click.stop="isShowBackgroundPicker = !isShowBackgroundPicker"
        />
        <input
          v-model="currentColor"
          class="w-full h-6 rounded-md px-2 outline-none"
          type="text"
        >

        <Sucker
          class="sucker"
          :sucker-status="isOpenSucker"
          :sucker-canvas="suckerCanvas"
          :sucker-area="suckerArea"
          @open-sucker="openSucker"
        />
      </div>

      <div class="flex gap-2">
        <div
          v-for="colorItem in colorsExample"
          :key="colorItem"
          :class="{ 'border-1': currentColor === colorItem }"
          :style="{ borderColor: currentColor === colorItem && colorItem.toLowerCase() !== 'transparent' ? colorItem : 'inherit' }"
          class="relative w-6 h-6 p-[2px] border rounded-md cursor-pointer hover:scale-110 transition-all duration-150"
          @click="currentColor = colorItem"
        >
          <div
            class="w-full h-full rounded-[4px] flex justify-center items-center"
            :style="{ background: colorItem === 'transparent' ? `url(${imgAlphaBase64})` : colorItem }"
          >
            <span
              v-if="currentColor === colorItem"
              :class="{ 'text-white': colorItem.toLowerCase() !== 'transparent' }"
              class="i-lineicons-check text-red-600"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
