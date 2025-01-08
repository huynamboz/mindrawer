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

    <div class="max-md:hidden fixed top-3 left-1/2 flex items-center gap-1 h-[20px] -translate-x-1/2 z-50">
      <img
        class="h-[12px]"
        src="/logo.png"
        alt="Logo"
      >
      <p class="text-[10px] font-light text-gray-600">
        BETA version - I'm rapidly adding features.
      </p>
      <a
        class="text-[10px] text-gray-600 font-bold underline"
        href="https://github.com/huynamboz/mindrawer"
        target="_blank"
      >
        Follow me on GitHub
      </a>
    </div>

    <slot />
  </div>
</template>
