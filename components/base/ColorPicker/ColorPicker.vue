// special thank to https://github.com/anish2690/vue-color-kit //
<template>
  <div
    class="hu-color-picker"
    :class="{ light: isLightTheme }"
    :style="{ width: totalWidth + 'px' }"
  >
    <div class="color-set">
      <Saturation
        ref="saturation"
        :color="rgbString"
        :hsv="hsv"
        :size="hueHeight"
        @select-saturation="selectSaturation"
      />
      <Hue
        ref="hue"
        :hsv="hsv"
        :width="hueWidth"
        :height="hueHeight"
        @select-hue="selectHue"
      />
      <Alpha
        v-if="!props.hideAlpha"
        ref="alpha"
        :color="rgbString"
        :rgba="rgba"
        :width="hueWidth"
        :height="hueHeight"
        @select-alpha="selectAlpha"
      />
    </div>
    <div class="color-show border py-[1px] w-full rounded-lg overflow-hidden">
      <Preview
        :color="modelHex"
        :width="previewWidth"
        :height="previewHeight"
        @input-color="inputHex"
      />
      <Sucker
        v-if="!suckerHide"
        :sucker-canvas="suckerCanvas"
        :sucker-area="suckerArea"
        @open-sucker="openSucker"
        @select-sucker="selectSucker"
      />
    </div>
    <!-- <Box
      name="HEX"
      :color="modelHex"
      @input-color="inputHex"
    /> -->
    <!-- <Box
      name="RGBA"
      :color="modelRgba"
      @input-color="inputRgba"
    /> -->
    <Colors
      :color="rgbaString"
      :colors-default="colorsDefault"
      :colors-history-key="colorsHistoryKey"
      @select-color="selectColor"
    />
    <!-- custom options -->
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { setColorValue, rgb2hex } from './composable';
import Saturation from './Saturation.vue';
import Hue from './Hue.vue';
import Alpha from './Alpha.vue';
import Preview from './Preview.vue';
import Sucker from './Sucker.vue';
// import Box from './Box.vue';
import Colors from './Colors.vue';

const saturation = ref<InstanceType<typeof Saturation> | null>(null);
const hue = ref<InstanceType<typeof Hue> | null>(null);
const alpha = ref<InstanceType<typeof Alpha> | null>(null);

const props = defineProps({
  hideAlpha: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: '#ffffff',
  },
  theme: {
    type: String,
    default: 'dark',
  },
  suckerHide: {
    type: Boolean,
    default: true,
  },
  suckerCanvas: {
    type: null, // HTMLCanvasElement
    default: null,
  },
  suckerArea: {
    type: Array as () => number[],
    default: () => [],
  },
  colorsDefault: {
    type: Array as () => string[],
    default: () => [
      '#000000',
      '#FFFFFF',
      '#FF1900',
      '#F47365',
      '#FFB243',
      '#FFE623',
      '#6EFF2A',
      '#1BC7B1',
      '#00BEFF',
      '#2E81FF',
      '#5D61FF',
      '#FF89CF',
      '#FC3CAD',
      '#BF3DCE',
      '#8E00A7',
      'rgba(0,0,0,0)',
    ],
  },
  colorsHistoryKey: {
    type: String,
    default: 'vue-colorpicker-history',
  },
});

const emit = defineEmits(['changeColor', 'openSucker']);

const hueWidth = ref(15);
const hueHeight = ref(152);
const previewHeight = ref(30);
const modelRgba = ref('');
const modelHex = ref('');
const r = ref(0);
const g = ref(0);
const b = ref(0);
const a = ref(1);
const h = ref(0);
const s = ref(0);
const v = ref(0);

const isLightTheme = computed(() => props.theme === 'light');
const totalWidth = computed(() => hueHeight.value + (hueWidth.value + 12) * 2);
const previewWidth = computed(
  () => totalWidth.value - (props.suckerHide ? 0 : previewHeight.value),
);
const rgba = computed(() => ({
  r: r.value,
  g: g.value,
  b: b.value,
  a: a.value,
}));
const hsv = computed(() => ({ h: h.value, s: s.value, v: v.value }));
const rgbString = computed(() => `rgb(${r.value}, ${g.value}, ${b.value})`);
const rgbaStringShort = computed(
  () => `${r.value}, ${g.value}, ${b.value}, ${a.value}`,
);
const rgbaString = computed(() => `rgba(${rgbaStringShort.value})`);
const hexString = computed(() => rgb2hex(rgba.value, true));

onMounted(() => {
  inputHex(props.color);
});

watch(
  () => rgba.value,
  () => {
    emit('changeColor', {
      rgba: rgba.value,
      hsv: hsv.value,
      hex: modelHex.value,
    });
  },
);

const selectSaturation = (color: any) => {
  const {
    r: rVal,
    g: gVal,
    b: bVal,
    h: hVal,
    s: sVal,
    v: vVal,
  } = setColorValue(color);
  r.value = rVal;
  g.value = gVal;
  b.value = bVal;
  h.value = hVal;
  s.value = sVal;
  v.value = vVal;

  setText();
};

const selectHue = (color: any) => {
  const {
    r: rVal,
    g: gVal,
    b: bVal,
    h: hVal,
    s: sVal,
    v: vVal,
  } = setColorValue(color);
  r.value = rVal;
  g.value = gVal;
  b.value = bVal;
  h.value = hVal;
  s.value = sVal;
  v.value = vVal;
  setText();
  nextTick(() => {
    saturation.value?.renderColor();
    saturation.value?.renderSlide();
  });
};

const selectAlpha = (aValue: any) => {
  a.value = aValue;
  setText();
};

const inputHex = (color: string) => {
  console.log('inputHex', color);
  const {
    r: rVal,
    g: gVal,
    b: bVal,
    a: aVal,
    h: hVal,
    s: sVal,
    v: vVal,
  } = setColorValue(color);
  r.value = rVal;
  g.value = gVal;
  b.value = bVal;
  a.value = aVal;
  h.value = hVal;
  s.value = sVal;
  v.value = vVal;
  modelHex.value = color;
  modelRgba.value = rgbaStringShort.value;
  nextTick(() => {
    saturation.value?.renderColor();
    saturation.value?.renderSlide();
    hue.value?.renderSlide();
  });
};

// const inputRgba = (color: string) => {
//   const {
//     r: rVal,
//     g: gVal,
//     b: bVal,
//     a: aVal,
//     h: hVal,
//     s: sVal,
//     v: vVal,
//   } = setColorValue(color);
//   r.value = rVal;
//   g.value = gVal;
//   b.value = bVal;
//   a.value = aVal;
//   h.value = hVal;
//   s.value = sVal;
//   v.value = vVal;
//   modelHex.value = hexString.value;
//   modelRgba.value = color;
//   nextTick(() => {
//     saturation.value?.renderColor();
//     saturation.value?.renderSlide();
//     hue.value?.renderSlide();
//   });
// };

const setText = () => {
  modelHex.value = hexString.value;
  modelRgba.value = rgbaStringShort.value;
};

const openSucker = (isOpen: boolean) => {
  emit('openSucker', isOpen);
};

const selectSucker = (color: string) => {
  const {
    r: rVal,
    g: gVal,
    b: bVal,
    a: aVal,
    h: hVal,
    s: sVal,
    v: vVal,
  } = setColorValue(color);
  r.value = rVal;
  g.value = gVal;
  b.value = bVal;
  a.value = aVal;
  h.value = hVal;
  s.value = sVal;
  v.value = vVal;
  setText();
  nextTick(() => {
    saturation.value?.renderColor();
    saturation.value?.renderSlide();
    hue.value?.renderSlide();
  });
};

const selectColor = (color: string) => {
  const {
    r: rVal,
    g: gVal,
    b: bVal,
    a: aVal,
    h: hVal,
    s: sVal,
    v: vVal,
  } = setColorValue(color);
  r.value = rVal;
  g.value = gVal;
  b.value = bVal;
  a.value = aVal;
  h.value = hVal;
  s.value = sVal;
  v.value = vVal;
  setText();
  nextTick(() => {
    saturation.value?.renderColor();
    saturation.value?.renderSlide();
    hue.value?.renderSlide();
  });
};
</script>

<style scoped lang="scss">
.hu-color-picker {
  padding: 16px;
  background: #fff;
  // border: 1px solid #ccc;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  &.light {
    background-color: #f8f8f8;
  }

  .color-set {
    display: flex;
    width: 100%;
    gap: 8px;
  }

  .color-show {
    display: flex;
    justify-content: center;
  }
}
</style>
