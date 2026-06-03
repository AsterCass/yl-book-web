<template>
  <router-view/>
</template>

<script setup>
import {RouterView} from "vue-router";
import {onBeforeUnmount, onMounted} from "vue";
import emitter from "@/utils/bus.js";


function screenEventHandler() {
  emitter.emit("screenResizeEvent")
}


onMounted(() => {
  //resize
  window.addEventListener("resize", screenEventHandler);
})


onBeforeUnmount(() => {
  //resize
  window.removeEventListener("resize", screenEventHandler);
})
</script>

<style lang="scss">
@use "@fontsource/roboto-slab/index.css";
@use "@/styles/base-components";
@use "@/styles/extra-components";


</style>