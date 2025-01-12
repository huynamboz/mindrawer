<template>
  <div>
    <svg
      v-if="!isSucking"
      :class="{ active: isOpenSucker }"
      class="sucker"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-12 -12 48 48"
      @click="openSucker"
    >
      <path
        d="M13.1,8.2l5.6,5.6c0.4,0.4,0.5,1.1,0.1,1.5s-1.1,0.5-1.5,0.1c0,0-0.1,0-0.1-0.1l-1.4-1.4l-7.7,7.7C7.9,21.9,7.6,22,7.3,22H3.1C2.5,22,2,21.5,2,20.9l0,0v-4.2c0-0.3,0.1-0.6,0.3-0.8l5.8-5.8C8.5,9.7,9.2,9.6,9.7,10s0.5,1.1,0.1,1.5c0,0,0,0.1-0.1,0.1l-5.5,5.5v2.7h2.7l7.4-7.4L8.7,6.8c-0.5-0.4-0.5-1-0.1-1.5s1.1-0.5,1.5-0.1c0,0,0.1,0,0.1,0.1l1.4,1.4l3.5-3.5c1.6-1.6,4.1-1.6,5.8-0.1c1.6,1.6,1.6,4.1,0.1,5.8L20.9,9l-3.6,3.6c-0.4,0.4-1.1,0.5-1.5,0.1"
      />
    </svg>
    <svg
      v-if="isSucking"
      class="sucker"
      viewBox="-16 -16 68 68"
      xmlns="http://www.w3.org/2000/svg"
      stroke="#9099a4"
    >
      <g
        fill="none"
        fill-rule="evenodd"
      >
        <g
          transform="translate(1 1)"
          stroke-width="4"
        >
          <circle
            stroke-opacity=".5"
            cx="18"
            cy="18"
            r="18"
          />
          <path d="M36 18c0-9.94-8.06-18-18-18">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 18 18"
              to="360 18 18"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
  suckerCanvas: {
    type: Object as () => HTMLCanvasElement | null,
    default: null,
  },
  suckerArea: {
    type: Array as () => number[],
    default: () => [],
  },
});

const emit = defineEmits<{
  (event: 'openSucker', value: boolean): void;
  (event: 'selectSucker', color: any): void;
}>();

const isOpenSucker = ref(false);
const suckerPreview = ref<HTMLDivElement | null>(null);
const isSucking = ref(false);

watch(() => props.suckerCanvas, (newVal) => {
  isSucking.value = false;
  suckColor(newVal);
});

const openSucker = () => {
  if (!isOpenSucker.value) {
    isOpenSucker.value = true;
    isSucking.value = true;
    emit('openSucker', true);
    document.addEventListener('keydown', keydownHandler);
  }
  else {
    keydownHandler(new KeyboardEvent('keydown', { keyCode: 27 }));
  }
};

const keydownHandler = (e: KeyboardEvent) => {
  if (e.keyCode === 27) {
    isOpenSucker.value = false;
    isSucking.value = false;
    emit('openSucker', false);
    document.removeEventListener('keydown', keydownHandler);
    document.removeEventListener('mousemove', mousemoveHandler);
    document.removeEventListener('mouseup', mousemoveHandler);
    if (suckerPreview.value) {
      document.body.removeChild(suckerPreview.value);
      suckerPreview.value = null;
    }
  }
};

const mousemoveHandler = (e: MouseEvent) => {
  const { clientX, clientY } = e;
  const {
    top: domTop,
    left: domLeft,
    width,
    height,
  } = props.suckerCanvas?.getBoundingClientRect() ?? { top: 0, left: 0, width: 0, height: 0 };
  const x = clientX - domLeft;
  const y = clientY - domTop;
  const ctx = props.suckerCanvas?.getContext('2d');
  const imgData = ctx?.getImageData(Math.min(x, width - 1), Math.min(y, height - 1), 1, 1);
  const [r, g, b, alpha] = imgData?.data ?? [0, 0, 0, 0];
  const a = parseFloat((alpha / 255).toFixed(2));
  const style = suckerPreview.value?.style;
  if (style) {
    Object.assign(style, {
      position: 'absolute',
      left: clientX + 20 + 'px',
      top: clientY - 36 + 'px',
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      border: '2px solid #fff',
      boxShadow: '0 0 8px 0 rgba(0, 0, 0, 0.16)',
      background: `rgba(${r}, ${g}, ${b}, ${a})`,
      zIndex: 95,
    });
    if (
      props.suckerArea.length
      && clientX >= props.suckerArea[0]
      && clientY >= props.suckerArea[1]
      && clientX <= props.suckerArea[2]
      && clientY <= props.suckerArea[3]
    ) {
      style.display = '';
    }
    else {
      style.display = 'none';
    }
  }
};

const suckColor = (dom: HTMLCanvasElement | null) => {
  if (dom?.tagName !== 'CANVAS') {
    return;
  }
  suckerPreview.value = document.createElement('div');
  if (suckerPreview.value) document.body.appendChild(suckerPreview.value);

  document.addEventListener('mousemove', mousemoveHandler);
  document.addEventListener('mouseup', mousemoveHandler);

  dom.addEventListener('click', (e: MouseEvent) => {
    const { clientX, clientY } = e;
    const { top, left, width, height } = dom.getBoundingClientRect();
    const x = clientX - left;
    const y = clientY - top;
    const ctx = dom.getContext('2d');
    const imgData = ctx?.getImageData(Math.min(x, width - 1), Math.min(y, height - 1), 1, 1);
    const [r, g, b, alpha] = imgData?.data ?? [0, 0, 0, 0];
    const a = parseFloat((alpha / 255).toFixed(2));
    emit('selectSucker', { r, g, b, a });
  });
};
</script>

<style lang="scss">
.sucker {
  width: 30px;
  fill: #9099a4;
  // background: #2e333a;
  cursor: pointer;
  transition: all 0.3s;
  &:hover,
  &.active {
    fill: #1593ff;
  }
}
</style>
