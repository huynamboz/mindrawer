<template>
  <div>
    <ul class="colors gap-2 flex flex-wrap">
      <li
        v-for="item in colorsDefault"
        :key="item"
        class="item border rounded-[4px] overflow-hidden w-[20px] h-[20px] cursor-pointer"
        @click="selectColor(item)"
      >
        <div
          :style="{ background: `url(${imgAlphaBase64})` }"
          class="alpha"
        />
        <div
          :style="{ background: item }"
          class="color"
        />
      </li>
    </ul>
    <ul
      v-if="colorsHistory.length"
      class="border-t mt-3 pt-3 flex flex-wrap colors history gap-2"
    >
      <li
        v-for="item in colorsHistory"
        :key="item"
        class="item border rounded-[4px] overflow-hidden w-[20px] h-[20px] cursor-pointer"
        @click="selectColor(item)"
      >
        <div
          :style="{ background: `url(${imgAlphaBase64})` }"
          class="alpha"
        />
        <div
          :style="{ background: item }"
          class="color"
        />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { convertRGBAStringToHex, createAlphaSquare } from './composable';

interface Props {
  color: string;
  colorsDefault: string[];
  colorsHistoryKey: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (event: 'selectColor', color: string): void;
}>();

const color = ref(props.color);
const colorsHistory = ref<string[]>([]);
const imgAlphaBase64 = ref<string>('');

// Lấy lịch sử màu từ localStorage nếu có
if (props.colorsHistoryKey && localStorage) {
  colorsHistory.value
    = JSON.parse(localStorage.getItem(props.colorsHistoryKey) as string) || [];
}

imgAlphaBase64.value = createAlphaSquare(4).toDataURL();

// Cập nhật lịch sử màu sắc khi component bị unmount
onBeforeUnmount(() => {
  const colorConvert = convertRGBAStringToHex(props.color);
  // check is transparent color
  if (props.color === 'rgba(0, 0, 0, 0)') {
    setColorsHistory('transparent');
  }
  else {
    setColorsHistory(colorConvert);
  }
});

// Cập nhật danh sách màu sắc trong lịch sử
function setColorsHistory(color: string) {
  if (!color) return;
  const colors = colorsHistory.value;
  const index = colors.indexOf(color);
  if (index >= 0) {
    colors.splice(index, 1);
  }
  if (colors.length >= 8) {
    colors.length = 7;
  }
  colors.unshift(color);
  colorsHistory.value = colors;

  if (localStorage && props.colorsHistoryKey) {
    localStorage.setItem(props.colorsHistoryKey, JSON.stringify(colors));
  }
}

// Chọn màu và phát sự kiện ra ngoài
function selectColor(color: string) {
  emit('selectColor', color);
}

// Cập nhật lịch sử màu mỗi khi màu hiện tại thay đổi
watch(color, (newColor) => {
  setColorsHistory(newColor);
});
</script>

<style lang="scss">
.colors {
  &.history {
  }
  .item {
    position: relative;
    box-sizing: border-box;
    vertical-align: top;
    display: inline-block;
    transition: all 0.1s;
    cursor: pointer;
    &:nth-child(8n + 1) {
      //  margin-left: 0;
    }
    &:hover {
      transform: scale(1.4);
    }
    .alpha {
      height: 100%;
    }
    .color {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
    }
  }
}
</style>
