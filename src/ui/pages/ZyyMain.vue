<template>

  <q-layout class="component-full-screen column" view="hhh lpr fff"
            style="background-color: rgba(var(--background-color));background-image: url('/img/chatroom-bg.png');">

    <zyy-header/>

    <div class="col row" style="margin: 6rem 2% 1rem 2%">

      <router-view v-slot="{ Component, route }">
        <transition name="fade" mode="out-in">
          <div :key="route.name">
            <component :is="Component"></component>
          </div>
        </transition>
      </router-view>


    </div>

    <zyy-footer/>


  </q-layout>

</template>


<script setup>


import ZyyHeader from "@/ui/views/ZyyHeader.vue";
import ZyyFooter from "@/ui/views/ZyyFooter.vue";
</script>


<style scoped>

</style>