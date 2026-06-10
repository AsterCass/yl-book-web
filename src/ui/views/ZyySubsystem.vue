<template>
  <router-view v-slot="{ Component, route }">
    <component :is="Component"></component>
  </router-view>
</template>

<script setup>

</script>

<style scoped lang="scss">

</style>