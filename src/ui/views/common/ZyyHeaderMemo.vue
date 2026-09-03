<template>
  <!-- 前台备忘录入口：紧挨待办右侧，图标 + 当前数量。
       用描边按钮而不是纯图文——左边的待办是「状态行」不可点，这个是入口，得一眼看出来能按。
       权限复用预约域，看不到预约的账号这里也不出现 -->
  <div v-if="canView" class="row items-center no-wrap q-ml-md">
    <q-btn no-caps unelevated class="component-outline-btn-mini-grow" @click="showMemo = true">
      <div class="row items-center no-wrap">
        <q-icon class="q-mr-xs" name="fa-regular fa-note-sticky" size=".9rem"/>
        {{ memoCount > 0 ? $t('memo.entry_count', {count: memoCount}) : $t('memo.entry_empty') }}
      </div>
    </q-btn>

    <cask-memo-dialog v-model="showMemo" @changed="loadMemoCount"/>
  </div>
</template>

<script setup>

import {computed, onBeforeUnmount, onMounted, ref, watch} from "vue";
import CaskMemoDialog from "@/ui/components/CaskMemoDialog.vue";
import {memoList} from "@/api/memo.js";
import {useGlobalStateStore} from "@/utils/global-state.js";

const globalState = useGlobalStateStore()

const showMemo = ref(false)
const memoCount = ref(0)

// 每隔 5 分钟刷新一次数量（便签是多人共用的墙，别人贴了这边也该看得到）
const MEMO_REFRESH_INTERVAL = 5 * 60 * 1000
let refreshTimer = null

// 备忘录权限同预约：能看预约列表的账号才显示入口（后端仍是 fail-closed 的最终判定）
const canView = computed(() => globalState.hasPermission('book:book:list'))

function loadMemoCount() {
  if (!canView.value) {
    memoCount.value = 0
    return
  }
  memoList().then(res => {
    if (!res || !res.data || !res.data.data) {
      memoCount.value = 0
      return
    }
    memoCount.value = res.data.data.length
  })
}

// 切换租户/门店后便签墙换了一面，重新拉取
watch(() => [
  globalState.userData ? globalState.userData.tenantId : null,
  globalState.userData ? globalState.userData.storeId : null,
], () => {
  loadMemoCount()
})

onMounted(() => {
  loadMemoCount()
  refreshTimer = setInterval(loadMemoCount, MEMO_REFRESH_INTERVAL)
})

onBeforeUnmount(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
})

</script>

<style scoped lang="scss">


</style>
