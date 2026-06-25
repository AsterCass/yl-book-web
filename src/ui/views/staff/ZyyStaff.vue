<template>
  <div class="absolute-full row" style="margin: 5rem 2px 0 5rem">


    <cask-tabs-vertical :tabs="tabs" v-model="tab" :width="globalState.language === 'zh' ? '10rem' : '17rem'"
                        :text-width="globalState.language === 'zh' ? '7rem' : '13rem'"
                        force-text-color="rgb(var(--text-color))"/>


    <q-scroll-area :thumb-style="globalState.curThemeName === 'dark' ?
                         { background: 'white', width: '7px', height: '7px', opacity: '0.6' } :
                          { background: 'black', width: '7px', height: '7px',  opacity: '0.6' }"
                   class="col full-height full-width" :visible="true">
      <div class="row" style="padding: 0 0 0 5rem; ">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component"/>
          </transition>
        </router-view>
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
  const staffRoute = thisRouter.getRoutes().find(r => r.name === 'staff')
  if (!staffRoute || !staffRoute.children) return []
  return staffRoute.children.map(item => ({
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

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(80%);
}

.fade-slide-enter-active {
  transition: all .5s ease;
}

.fade-slide-leave-active {
  transition: all .5s ease;
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(80%);
}



</style>