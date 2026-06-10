<template>

  <div class="subsystem-main absolute-full" style="margin: 0 2px">


    <q-scroll-area :thumb-style="globalState.curThemeName === 'dark' ?
                         { background: 'white', width: '7px', opacity: '0.6' } :
                          { background: 'black', width: '7px', opacity: '0.6' }"

                   class="full-height full-width" :visible="true">
      <div class="row justify-evenly" style="padding: 5% 0 0 0">
        <cask-float-card v-for="(video, index) in systemList" :key="index" style="margin: 2.5rem"
                         :cover-image="video.collectionImg"
                         :character-image="video.collectionImgExtra"
                         :name="video.collectionName"
                         :base-size="16"
                         :on-click="()=> {}"/>
      </div>

    </q-scroll-area>

  </div>
</template>

<script setup>
import CaskFloatCard from "@/ui/components/CaskFloatCard.vue";
import {ref} from "vue";
import {useGlobalStateStore} from "@/utils/global-state.js";
import {useRouter} from "vue-router";


const globalState = useGlobalStateStore();
const thisRouter = useRouter()

const systemList = ref([
  {
    collectionImg: "/img/subsystem/appointment.jpg",
    collectionImgExtra: "/img/subsystem/appointment.webp",
    collectionName: "预约系统"
  },
  {
    collectionImg: "/img/subsystem/appointment.jpg",
    collectionImgExtra: "/img/subsystem/appointment.webp",
    collectionName: "预约系统"
  },
  {
    collectionImg: "/img/subsystem/appointment.jpg",
    collectionImgExtra: "/img/subsystem/appointment.webp",
    collectionName: "预约系统"
  },
  {
    collectionImg: "/img/subsystem/appointment.jpg",
    collectionImgExtra: "/img/subsystem/appointment.webp",
    collectionName: "预约系统"
  },
  {
    collectionImg: "/img/subsystem/appointment.jpg",
    collectionImgExtra: "/img/subsystem/appointment.webp",
    collectionName: "预约系统"
  },
  {
    collectionImg: "/img/subsystem/appointment.jpg",
    collectionImgExtra: "/img/subsystem/appointment.webp",
    collectionName: "预约系统"
  },
  {
    collectionImg: "/img/subsystem/appointment.jpg",
    collectionImgExtra: "/img/subsystem/appointment.webp",
    collectionName: "预约系统"
  },
])

</script>

<style lang="scss">


</style>