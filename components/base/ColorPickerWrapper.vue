<script setup lang="ts">
import ColorPicker from './ColorPicker/ColorPicker.vue';

const fabricStore = useFabricStore();
const color = ref<string>('#1BC7B1');
const suckerCanvas = ref<HTMLCanvasElement | null>(null);
const suckerArea = ref<number[]>([]);
const isOpenSucker = ref<boolean>(false);
const selectedColor = ref<string>('');

const changeColor = (newColor: { rgba: { r: number; g: number; b: number; a: number } }) => {
  const { r, g, b, a } = newColor.rgba;
  color.value = `rgba(${r}, ${g}, ${b}, ${a})`;
  console.log('Color changed:', color.value);
  suckerCanvas.value?.remove();
};

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
</script>

<template>
  <ColorPicker
    theme="light"
    :hide-alpha="true"
    :color="color"
    :sucker-hide="false"
    :sucker-canvas="suckerCanvas"
    :sucker-area="suckerArea"
    v-bind="$attrs"
    @change-color="changeColor"
    @open-sucker="openSucker"
    @select-sucker="changeColor"
  />
</template>
