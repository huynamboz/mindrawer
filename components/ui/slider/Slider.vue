<script setup lang="ts">
import type { SliderRootEmits, SliderRootProps } from 'radix-vue';
import {
  SliderRange,
  SliderRoot,
  SliderThumb,
  SliderTrack,
  useForwardPropsEmits,
} from 'radix-vue';
import { computed, type HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

const props = defineProps<
  SliderRootProps & { class?: HTMLAttributes['class'] }
>();
const emits = defineEmits<SliderRootEmits>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <SliderRoot
    :class="
      cn(
        'relative flex w-full touch-none select-none items-center data-[orientation=vertical]:flex-col data-[orientation=vertical]:w-1.5 data-[orientation=vertical]:h-full',
        props.class,
      )
    "
    v-bind="forwarded"
  >
    <SliderTrack
      class="relative h-1 w-full data-[orientation=vertical]:w-1.5 grow overflow-hidden rounded-full bg-primary/20"
    >
      <SliderRange
        class="absolute h-full data-[orientation=vertical]:w-full bg-primary"
      />
    </SliderTrack>
    <SliderThumb
      v-for="(_, key) in modelValue"
      :key="key"
      class="block h-4 w-4 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
    />
  </SliderRoot>
</template>
