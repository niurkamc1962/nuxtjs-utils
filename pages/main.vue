<template>
  <div>
    <div class="flex items-center justify-center h-screen">
      <div :class="{ 'dark-mode': $colorMode.value === 'dark' }">
        <div class="text-2xl">INTERFACE DE UTILIDADES API FRAPPE</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup></script>

<!-- <style scoped>
html {
  background-color: white;
  color: black;
  transition: background-color 0.3s, color 0.3s;
}

html.dark {
  background-color: #1a1a1a;
  color: white;
}
</style> -->
