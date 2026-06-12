<template>
  <div class="absolute-full" style="margin: 0 2px">


    <q-scroll-area :thumb-style="globalState.curThemeName === 'dark' ?
                         { background: 'white', width: '7px', opacity: '0.6' } :
                          { background: 'black', width: '7px', opacity: '0.6' }"
                   class="full-height full-width" :visible="true">
      <div class="row" style="padding: 5rem 0 0 5rem">
        <cask-tabs-vertical :tabs="tabs" v-model="tab" :width="globalState.language === 'zh' ? '10rem' : '17rem'"
                            :text-width="globalState.language === 'zh' ? '7rem' : '13rem'"
                            force-text-color="rgb(var(--text-color))"/>


        <router-view />

      </div>

    </q-scroll-area>

  </div>
</template>

<script setup>
import {useGlobalStateStore} from "@/utils/global-state.js";
import {useRouter} from "vue-router";
import CaskTabsVertical from "@/ui/components/CaskTabsVertical.vue";
import {computed, nextTick, onMounted, ref, watch} from "vue";
import {toSpecifyPage} from "@/router/index.js";

const globalState = useGlobalStateStore();
const thisRouter = useRouter()

const tabs = computed(() => {
  const userRoute = thisRouter.getRoutes().find(r => r.name === 'user')
  if (!userRoute || !userRoute.children) return []
  return userRoute.children.map(item => ({
    value: item.meta?.value || item.name,
    label: item.meta?.label,
    color: item.meta?.color,
    routeName: item.name
  }))
})

const tab = ref("");

watch(() => tab.value, async () => {
  await nextTick()
  if (thisRouter.currentRoute.value.name !== tab.value) {
    toSpecifyPage(thisRouter, tab.value)
  }
})

watch(thisRouter.currentRoute, () => {
  updateCurrentTab()
});

function updateCurrentTab() {
  tab.value = thisRouter.currentRoute.value.name
}

onMounted(() => {
  updateCurrentTab()
})

</script>

<style scoped lang="scss">

</style>