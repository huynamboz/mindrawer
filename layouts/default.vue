<script setup lang="ts">
import ToolBar from '~/components/base/ToolBar.vue';
</script>

<template>
  <div class="w-full h-lvh">
    <ToolBar />
    <a
      href="https://github.com/huynamboz/mindrawer"
      target="_blank"
    >
      <span class="i-mdi-github fixed z-50 top-3 right-3 cursor-pointer text-2xl" />
    </a>

    <img
      class="fixed top-3 left-3 h-[20px]"
      src="/logo.png"
      alt=""
    >
    <slot />
  </div>
</template>
