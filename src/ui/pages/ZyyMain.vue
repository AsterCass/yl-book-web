<template>

  <q-layout class="component-full-screen column" view="hhh lpr fff"
            style="background-color: rgba(var(--background-color));background-image: url('/img/chatroom-bg.png');">

    <zyy-header/>

    <div class="col relative-position" style="margin: 2rem 0 1rem 0; overflow-x: hidden">
      <router-view/>
    </div>

    <zyy-user-setting/>

    <zyy-footer/>

  </q-layout>

</template>


<script setup>
import ZyyHeader from "@/ui/views/ZyyHeader.vue";
import ZyyFooter from "@/ui/views/ZyyFooter.vue";
import ZyyUserSetting from "@/ui/views/common/ZyyUserSetting.vue";
</script>


<style scoped lang="scss">


</style>