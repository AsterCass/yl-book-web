<template>

  <q-layout class="component-full-screen column" view="hhh lpr fff"
            style="background-color: rgba(var(--background-color));background-image: url('/img/chatroom-bg.png');">

    <zyy-header/>

    <div class="col relative-position" style="margin: 6rem 0 1rem 0">
      <router-view/>
    </div>

    <zyy-footer/>


  </q-layout>

</template>


<script setup>
import ZyyHeader from "@/ui/views/ZyyHeader.vue";
import ZyyFooter from "@/ui/views/ZyyFooter.vue";
</script>


<style scoped lang="scss">


</style>