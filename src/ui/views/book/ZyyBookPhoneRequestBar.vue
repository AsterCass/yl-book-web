<template>
  <!-- 预约日历上方的电话需求栏（2026-11-10）：前台一直停在预约日历、不看左上角的闪动待办，
       所以本店还没办完（未处理 / 处理中）的电话需求直接列在这里，随日历定时刷新（调用方调 refresh()）。
       没有就整栏不显示，日历与原先一模一样 -->
  <div>
    <div v-if="total > 0" class="phone-request-bar">

      <div class="row items-center no-wrap phone-request-bar-head">
        <q-icon name="fa-solid fa-phone-volume" size=".9rem" class="q-mr-sm"/>
        <span class="phone-request-bar-title">{{ $t('book_calendar.phone_request.title', {count: total}) }}</span>
        <q-space/>
        <!-- 默认只显示前 COLLAPSED_COUNT 条，其余折叠 -->
        <q-btn v-if="total > COLLAPSED_COUNT" flat dense no-caps size="sm" class="component-none-btn-grow"
               @click="expanded = !expanded">
          {{ expanded ? $t('book_calendar.phone_request.collapse')
            : $t('book_calendar.phone_request.more', {count: total - COLLAPSED_COUNT}) }}
          <q-icon :name="expanded ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'" size=".7rem" class="q-ml-xs"/>
        </q-btn>
      </div>

      <!-- 整个列表是一张网格、每行的格子直接排进去：各行的时间 / 电话 / 类型宽度不一，
           这样内容列仍上下对齐 -->
      <div class="phone-request-bar-list" :class="{ 'phone-request-bar-list-expanded': expanded }"
           :style="{ gridTemplateColumns: gridColumns }">
        <template v-for="row in visibleRows" :key="row.id">
          <div class="phone-request-bar-cell">
            <q-badge class="phone-request-bar-status" :style="{ backgroundColor: statusColor(row.handleStatus) }"
                     :label="phoneRequestStatusName(row.handleStatus)"/>
          </div>
          <div class="phone-request-bar-cell">{{ displayTime(row.createTime) }}</div>
          <div class="phone-request-bar-cell">{{ phoneRequestDisplayPhone(row.phone) }}</div>
          <div class="phone-request-bar-cell phone-request-bar-type">
            <span>{{ row.type || '-' }}</span>
          </div>
          <!-- 简述 + 详述接成一行（空格隔开）：放不下就省略号截断；全文在「处理」弹窗里 -->
          <div class="phone-request-bar-cell">
            <span class="phone-request-bar-text">{{ contentText(row) }}</span>
          </div>
          <!-- 没回访过也占一格，列才对得齐 -->
          <div class="phone-request-bar-cell phone-request-bar-calls"
               :class="{ 'phone-request-bar-cell-last': !canHandle && !canCall }">
            {{ row.callCount ? $t('book_phone_request.call_count', {count: row.callCount}) : '' }}
          </div>
          <!-- 操作同表格操作列：蓝色文字，不用实心按钮 -->
          <div v-if="canHandle" class="phone-request-bar-cell" :class="{ 'phone-request-bar-cell-last': !canCall }">
            <span class="phone-request-bar-op" @click="openHandle(row)">
              {{ $t('book_calendar.phone_request.handle') }}
            </span>
          </div>
          <div v-if="canCall" class="phone-request-bar-cell phone-request-bar-cell-last">
            <span class="phone-request-bar-op" @click="callRef.open(row)">
              {{ $t('book_calendar.phone_request.call') }}
            </span>
          </div>
        </template>
        <!-- 只拉了前 FETCH_LIMIT 条：再多的去电话需求页看 -->
        <div v-if="expanded && total > rows.length" class="phone-request-bar-truncated">
          {{ $t('book_calendar.phone_request.truncated', {count: rows.length}) }}
        </div>
      </div>
    </div>

    <!-- 弹窗放在栏外：定时刷新时别人刚好把最后一条办完、整栏消失，也不会把正在填写的弹窗一起卸掉 -->
    <cask-phone-request-edit-dialog v-model="showHandle" :request="handleRow" from-calendar @saved="refresh"/>
    <cask-phone-request-call ref="callRef" @called="refresh"/>
  </div>
</template>

<script setup>

import {computed, ref, watch} from "vue";
import CaskPhoneRequestEditDialog from "@/ui/components/CaskPhoneRequestEditDialog.vue";
import CaskPhoneRequestCall from "@/ui/components/CaskPhoneRequestCall.vue";
import {bookPhoneRequestList} from "@/api/book.js";
import {PhoneRequestHandleStatusEnum} from "@/constants/enums/book.js";
import {phoneRequestDisplayPhone, phoneRequestStatusName} from "@/utils/phone-request.js";
import {useGlobalStateStore} from "@/utils/global-state.js";

const globalState = useGlobalStateStore()

// 折叠时显示几条
const COLLAPSED_COUNT = 3
// 一次最多拉几条（不分页）：积压真到这么多，就该去电话需求页集中处理了
const FETCH_LIMIT = 50

// 还没办完 = 未处理 + 处理中。改成已处理 / 无需处理（或客户来电撤销）后就不再出现
const PENDING_STATUS_LIST = [
  PhoneRequestHandleStatusEnum.UNHANDLED.code,
  PhoneRequestHandleStatusEnum.IN_PROGRESS.code,
]

const rows = ref([])
const total = ref(0)
// 展开状态跨定时刷新保留；刷新页面后回到折叠
const expanded = ref(false)

const visibleRows = computed(() => expanded.value ? rows.value : rows.value.slice(0, COLLAPSED_COUNT))

// 按钮按权限显示（后端同样校验）：处理 = 预约域修改权限，回拨会真实呼出，用独立权限
const canHandle = computed(() => globalState.hasPermission('book:book:update'))
const canCall = computed(() => globalState.hasPermission('book:book:call'))

// 列：状态 / 时间 / 电话 / 类型 / 简述+详述 / 回访次数 [/ 处理] [/ 回拨]。
// 简述+详述占满剩余宽度，minmax(0, …) 让它可压缩，放不下时省略号截断
const gridColumns = computed(() => 'auto auto auto auto minmax(0, 1fr) auto'
    + (canHandle.value ? ' auto' : '') + (canCall.value ? ' auto' : ''))

// 定时刷新与保存后刷新可能交错，只认最后一次发出的请求
let refreshSeq = 0

function refresh() {
  const seq = ++refreshSeq
  bookPhoneRequestList({
    pageNo: 1,
    pageSize: FETCH_LIMIT,
    handleStatusList: PENDING_STATUS_LIST,
    // 未处理排最前，同一状态里新的在前
    unhandledFirst: true,
  }).then(res => {
    if (seq !== refreshSeq || !res || !res.data || !res.data.data) {
      return
    }
    rows.value = res.data.data.records || []
    total.value = res.data.data.total || 0
    if (total.value <= COLLAPSED_COUNT) {
      expanded.value = false
    }
  })
}

// 切换门店后范围变了，立刻重拉（不等下一轮定时刷新）
watch(() => globalState.userData ? globalState.userData.storeId : null, refresh)

function statusColor(code) {
  const statusEnum = PhoneRequestHandleStatusEnum.fromCode(code)
  return statusEnum ? statusEnum.color : 'rgb(128, 128, 128)'
}

// 记录时间 yyyy-MM-dd HH:mm：今年的省掉年份，往年的照写（不限日期，可能有隔年没办完的）
function displayTime(createTime) {
  if (!createTime) {
    return '-'
  }
  return createTime.startsWith(String(new Date().getFullYear()) + '-') ? createTime.substring(5) : createTime
}

// 简述 + 详述接成一行、中间一个空格（换行也压成空格，只显示一行）；两者都空显示 '-'
function contentText(row) {
  return [row.summary, row.detail]
      .map(text => (text || '').replace(/\s+/g, ' ').trim())
      .filter(text => text)
      .join(' ') || '-'
}

const showHandle = ref(false)
const handleRow = ref(null)
const callRef = ref(null)

function openHandle(row) {
  handleRow.value = row
  showHandle.value = true
}

defineExpose({refresh})

</script>

<style scoped lang="scss">

.phone-request-bar {
  border: 1px solid rgba(128, 128, 128, .22);
  border-left: 3px solid rgb(200, 60, 60);
  border-radius: .5rem;
  padding: .35rem .75rem .45rem;
  font-size: .85rem;
}

.phone-request-bar-head {
  min-height: 1.6rem;

  .phone-request-bar-title {
    font-weight: 600;
  }
}

.phone-request-bar-list {
  display: grid;
}

// 展开后限高、栏内滚动，不把日历推到屏幕外
.phone-request-bar-list-expanded {
  max-height: 16rem;
  overflow-y: auto;
}

// 网格不留列间距，间隔用每格的右内边距：行分隔线画在每格的上边框上，这样才连成一整条
.phone-request-bar-cell {
  display: flex;
  align-items: center;
  min-width: 0;
  min-height: 2.2rem;
  padding-right: .75rem;
  border-top: 1px solid rgba(128, 128, 128, .14);
  white-space: nowrap;

  .phone-request-bar-status {
    font-size: .8rem;
    padding: 3px 6px;
  }

  // 单行放不下就省略号（格子 min-width: 0 + 网格列 minmax(0, 1fr)，它才收得窄）
  .phone-request-bar-text {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

// 每行最后一格不留右边距，按钮贴齐栏的右边
.phone-request-bar-cell-last {
  padding-right: 0;
}

.phone-request-bar-type span {
  max-width: 10rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
}

// 同 CaskComplexTable 操作列：主题色文字、可点
.phone-request-bar-op {
  color: rgb(var(--pointer));
  cursor: pointer;
  margin: 0 .2rem;
}

.phone-request-bar-calls {
  opacity: .7;
}

.phone-request-bar-truncated {
  grid-column: 1 / -1;
  padding-top: .35rem;
  font-size: .8rem;
  opacity: .6;
}

</style>
