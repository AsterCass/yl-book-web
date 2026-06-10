<template>

  <div class="subsystem-main absolute-full" style="margin: 0 2px">


    <q-scroll-area :thumb-style="globalState.curThemeName === 'dark' ?
                         { background: 'white', width: '7px', opacity: '0.6' } :
                          { background: 'black', width: '7px', opacity: '0.6' }"

                   class="full-height full-width" :visible="true">
      <div class="row justify-evenly" style="padding: 5rem 0 0 0">
        <cask-float-card v-for="(video, index) in systemList" :key="index" style="margin: 3rem 8rem"
                         :cover-image="video.collectionImg"
                         :character-image="video.collectionImgExtra"
                         :name="$t(video.collectionName)"
                         :enable="video.enable"
                         :base-size="16"
                         :disable-text="$t('in_develop_simple')"
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
    collectionName: "zyy_subsystem_appointment",
    enable: true,
  },
  {
    collectionImg: "/img/subsystem/staff.jpg",
    collectionImgExtra: "/img/subsystem/staff.webp",
    collectionName: "zyy_subsystem_staff",
    enable: true,
  },
  {
    collectionImg: "/img/subsystem/agent.jpg",
    collectionImgExtra: "",
    collectionName: "zyy_subsystem_agent",
    enable: false,
  },
  {
    collectionImg: "/img/subsystem/bill.jpg",
    collectionImgExtra: "",
    collectionName: "zyy_subsystem_bill",
    enable: false,
  },
  {
    collectionImg: "/img/subsystem/order.jpg",
    collectionImgExtra: "",
    collectionName: "zyy_subsystem_order",
    enable: false,
  },
  {
    collectionImg: "/img/subsystem/page.jpg",
    collectionImgExtra: "",
    collectionName: "zyy_subsystem_page",
    enable: false,
  },
  {
    collectionImg: "/img/subsystem/user.jpg",
    collectionImgExtra: "/img/subsystem/user.webp",
    collectionName: "zyy_subsystem_user",
    enable: true,
  },

])

</script>

<style lang="scss">


</style>