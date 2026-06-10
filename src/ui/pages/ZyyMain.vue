<template>

  <q-layout class="component-full-screen column" view="hhh lpr fff"
            style="background-color: rgba(var(--background-color));background-image: url('/img/chatroom-bg.png');">

    <zyy-header/>

    <div class="col relative-position" style="margin: 6rem 0 1rem 0">

      <router-view v-slot="{ Component, route }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="route.fullPath"/>
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


<style scoped lang="scss">

.fade-enter-from {
  opacity: 0;
  transform: scale(.95);
}

.fade-enter-active {
  transition: all .5s ease;
}

.fade-leave-active {
  transition: all .5s ease;
}

.fade-leave-to {
  opacity: 0;
  transform: scale(.95);
}

</style>