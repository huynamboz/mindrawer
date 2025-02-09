<script setup lang="ts">
const a = ref('s');
console.log(a.value);
</script>


<template>
  <div>
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
