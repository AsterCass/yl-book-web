<template>
  <div class="subsystem-main absolute-full " style="margin: 0 2px">

    <div v-for="n in 10" :key="n" class="q-pa-xs">
      fdsafdsafsd
    </div>

  </div>
</template>

<script setup>

import {useGlobalStateStore} from "@/utils/global-state.js";
import {useRouter} from "vue-router";

const globalState = useGlobalStateStore();
const thisRouter = useRouter()



</script>

<style scoped lang="scss">

</style>