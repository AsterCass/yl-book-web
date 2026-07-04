<template>
  <div v-if="userData && userData.tenantId" class="row items-center no-wrap q-mr-sm"
       style="font-size: .85rem">

    <q-icon class="q-mr-sm" name="fa-regular fa-building" size=".8rem"/>
    <div class="cask-header-switch-name">
      {{ userData.tenantName }}
    </div>
    <q-btn v-if="tenantSwitchable" class="q-ml-sm" dense flat round size="9px"
           icon="fa-solid fa-angle-down">
      <q-menu anchor="bottom middle" self="top middle" :offset="[0, 10]"
              class="component-extra-card-std">
        <q-list dense style="min-width: 10rem">
          <q-item v-for="tenant in userData.tenantList" :key="tenant.tenantId"
                  clickable v-close-popup
                  :active="tenant.tenantId === userData.tenantId"
                  @click="switchTenant(tenant)">
            <q-item-section>{{ tenant.tenantName }}</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>

    <template v-if="userData.storeId || storeOptions.length > 0">
      <q-icon class="q-ml-lg q-mr-sm" name="fa-solid fa-store" size=".8rem"/>
      <div class="cask-header-switch-name">
        {{ userData.storeName }}
      </div>
      <q-btn v-if="storeSwitchable" class="q-ml-sm" dense flat round size="9px"
             icon="fa-solid fa-angle-down">
        <q-menu anchor="bottom middle" self="top middle" :offset="[0, 10]"
                class="component-extra-card-std">
          <q-list dense style="min-width: 10rem">
            <q-item v-for="store in storeOptions" :key="store.storeId"
                    clickable v-close-popup
                    :active="store.storeId === userData.storeId"
                    @click="switchStore(store)">
              <q-item-section>{{ store.storeName }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </template>

  </div>
</template>

<script setup>

import {computed} from "vue";
import {useGlobalStateStore} from "@/utils/global-state.js";
import {notifyTopPositive} from "@/utils/notification-tools.js";
import {useI18n} from "vue-i18n";

const {t} = useI18n()
const globalState = useGlobalStateStore()

const userData = computed(() => globalState.userData)

const tenantSwitchable = computed(() =>
    userData.value && Array.isArray(userData.value.tenantList) && userData.value.tenantList.length > 1)

// 当前租户下可选的门店列表（storeList 嵌套在 tenantList 元素内）
const storeOptions = computed(() => {
  const ud = userData.value
  if (!ud || !Array.isArray(ud.tenantList)) {
    return []
  }
  const curTenant = ud.tenantList.find(item => item.tenantId === ud.tenantId)
  return curTenant && Array.isArray(curTenant.storeList) ? curTenant.storeList : []
})

const storeSwitchable = computed(() => storeOptions.value.length > 1)

function switchTenant(tenant) {
  if (!tenant || tenant.tenantId === userData.value.tenantId) {
    return
  }
  globalState.switchTenant(tenant)
  notifyTopPositive(t('main_header_switch_success'))
}

function switchStore(store) {
  if (!store || store.storeId === userData.value.storeId) {
    return
  }
  globalState.switchStore(store.storeId, store.storeName)
  notifyTopPositive(t('main_header_switch_success'))
}

</script>

<style scoped lang="scss">

.cask-header-switch-name {
  max-width: 7rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: .85;
}

</style>
