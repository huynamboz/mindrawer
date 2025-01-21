<script setup lang="ts">
import ToolBar from '~/components/base/ToolBar.vue';
import ZoomControl from '~/components/base/ZoomControl.vue';
import Settings from '~/components/base/Settings.vue';
import ExportButton from '~/components/base/ExportButton.vue';

const fabricSettingStore = useFabricSettingStore();
</script>

<template>
  <div class="w-full h-lvh">
    <ToolBar />
    <ZoomControl />
    <Settings :key="fabricSettingStore.id" />

    <img
      class="fixed top-3 left-3 h-[20px]"
      src="/logo.png"
      alt=""
    >

    <a
      href="https://github.com/huynamboz/mindrawer"
      target="_blank"
    >
      <span
        class="i-mdi-github fixed z-50 top-3 right-3 cursor-pointer text-2xl"
      />
    </a>

    <ExportButton
      class="fixed top-3 right-12 z-50"
    />
    <div
      class="max-md:hidden fixed top-3 left-1/2 flex items-center gap-1 h-[20px] -translate-x-1/2 z-50"
    >
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
