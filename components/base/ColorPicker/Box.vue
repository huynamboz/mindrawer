<template>
  <div class="flex items-center bg-gray-100 pl-2 rounded-md">
    <span class="w-[60px]">
      {{ name }}
    </span>
    <input
      v-model="modelColor"
      class="h-[30px] w-full bg-transparent outline-none"
    >
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
  props: {
    name: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '',
    },
  },
  emits: ['inputColor'],
  setup(props, { emit }) {
    const modelColor = computed({
      get() {
        return props.color || '';
      },
      set(val) {
        emit('inputColor', val);
      },
    });
    return {
      modelColor,
    };
  },
});
</script>

<style scoped lang="scss">
.color-type {
  display: flex;
  margin-top: 8px;
  font-size: 12px;
  .name {
    width: 60px;
    height: 30px;
    float: left;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #999;
    background: #252930;
  }
  .value {
    flex: 1;
    height: 30px;
    min-width: 100px;
    padding: 0 12px;
    border: 0;
    color: #fff;
    background: #2e333a;
    box-sizing: border-box;
  }
}
</style>
