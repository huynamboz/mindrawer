<template>
  <!-- <canvas /> -->
  <div class="h-full w-full flex items-center justify-center gap-2 pl-2">
    <div
      class="min-w-[20px] h-[20px] rounded-sm"
      :style="{ backgroundColor: color }"
    />
    <input
      v-model="modelColor"
      type="text"
      class="h-[30px] w-full bg-transparent outline-none"
    >
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  color: string;
  width: number;
  height: number;
}>();

const emit = defineEmits<{
  (e: 'inputColor', value: string): void;
}>();

const modelColor = computed({
  get() {
    return props.color || '';
  },
  set(val) {
    emit('inputColor', val);
  },
});
</script>
