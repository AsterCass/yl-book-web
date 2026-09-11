<template>
  <q-dialog :model-value="modelValue" transition-show="fade" transition-hide="fade"
            @update:model-value="val => emit('update:modelValue', val)">
    <q-card class="component-cask-dialog-judgement-std row" style="max-width: 2000px !important">
      <cask-tabs-vertical :tabs="tabs" v-model="tab" width="12rem" text-width="10rem"
                          force-text-color="rgb(var(--text-color))"/>
      <div class="col row" style="min-height: 30rem;">
        <q-separator class="component-separator-base q-mx-lg" vertical/>
        <q-tab-panels v-model="tab" animated class="bg-transparent col" transition-duration="500"
                      transition-prev="jump-down" transition-next="jump-up">

          <!-- 已有屏蔽时段：仅门店 block（雇员 block 不在此管理） -->
          <q-tab-panel name="list" style="min-width: 30rem; padding: 1rem 0 1rem 0">
            <div class="column full-height">
              <div class="q-mb-sm" style="opacity: .5; font-size: .85rem; width: 28rem">
                {{ $t('book_calendar.store_block.note') }}
              </div>
              <div class="q-mb-md" style="opacity: .5; font-size: .85rem; width: 28rem">
                {{ $t('book_calendar.store_block.list_range_note') }}
              </div>
              <div class="col q-mr-xl" style="overflow-y: auto; max-height: 24rem">
                <div v-if="blockList.length === 0" style="opacity: .5; font-size: .85rem">
                  {{ $t('book_calendar.store_block.empty') }}
                </div>
                <div v-for="bl in blockList" :key="bl.id" class="row items-center store-block-item">
                  <div style="min-width: 0">
                    <div class="row items-center" style="font-weight: 500">
                      <span>{{ bl.startTime }} ~ {{ bl.endTime }}</span>
                      <!-- 作用范围：雇员 block 标出是谁，门店 block 标明全店生效 -->
                      <span class="store-block-scope-tag q-ml-sm">
                        {{ bl.storeBlock
                          ? $t('book_calendar.store_block.scope_store')
                          : $t('book_calendar.store_block.scope_staff', {name: bl.staffName || bl.staffId}) }}
                      </span>
                      <span v-if="bl.auto" class="store-block-auto-tag q-ml-sm">
                        {{ $t('book_calendar.store_block.auto_tag') }}
                      </span>
                      <span v-if="bl.rest" class="store-block-rest-tag q-ml-sm">
                        {{ $t('book_calendar.store_block.rest_tag') }}
                      </span>
                    </div>
                    <div v-if="bl.auto || bl.rest || bl.reason" class="component-max-line-text"
                         style="opacity: .6; font-size: .78rem">
                      {{ bl.auto ? $t('book_calendar.store_block.auto_note')
                        : (bl.rest ? $t('book_calendar.store_block.rest_note') : bl.reason) }}
                    </div>
                  </div>
                  <q-space/>
                  <!-- 自动 block 不给删：删掉下一轮对账算出来条件还成立就会原样建回来，
                       徒增第三方调用、还让人以为系统坏了。要放开该时段得去改排班或改预约 -->
                  <q-btn v-if="!bl.auto" round flat dense class="component-none-btn-grow" @click="openDelete(bl)">
                    <q-icon name="fa-solid fa-trash" size=".9rem"/>
                  </q-btn>
                </div>
              </div>
            </div>
          </q-tab-panel>

          <!-- 新增屏蔽时段（门店 block，不选雇员） -->
          <q-tab-panel name="add" style="min-width: 30rem; padding: 1rem 0 1rem 0">
            <div class="column full-height">
              <h6>
                {{ $t('book_calendar.store_block.start') }}
              </h6>
              <cask-date-time-picker v-model="addStart" class="q-mr-xl" style="opacity: .92"
                                     input-class="component-outline-input-grow"/>
              <h6 style="margin-top: 1rem !important">
                {{ $t('book_calendar.store_block.end') }}
              </h6>
              <cask-date-time-picker v-model="addEnd" class="q-mr-xl" style="opacity: .92"
                                     input-class="component-outline-input-grow"/>
              <h6 style="margin-top: 1rem !important">
                {{ $t('book_calendar.store_block.reason') }}
              </h6>
              <q-input v-model="addReason" tabindex="0" dense outlined
                       :placeholder="$t('book_calendar.store_block.reason_placeholder')"
                       class="component-outline-input-grow q-mr-xl" style="opacity: .92"/>
              <div class="q-mt-md" style="opacity: .5; font-size: .78rem; width: 28rem">
                {{ $t('book_calendar.store_block.note') }}
              </div>

              <div class="col column justify-end">
                <div class="row justify-evenly">
                  <q-btn no-caps unelevated class="component-full-btn-mini-grow shadow-2"
                         :loading="saving" :disable="saving" @click="saveBlock">
                    <div class="row items-center">
                      <div class="q-mx-sm">
                        {{ $t('main_setting_save') }}
                      </div>
                    </div>
                  </q-btn>
                  <q-btn no-caps unelevated class="component-full-btn-mini-grow shadow-2"
                         @click="emit('update:modelValue', false)">
                    {{ $t('main_setting_cancel') }}
                  </q-btn>
                </div>
              </div>
            </div>
          </q-tab-panel>

        </q-tab-panels>
      </div>
    </q-card>
  </q-dialog>

  <cask-dialog-judgment v-model="showDelete"
                        :loading="deleting"
                        :callback-method="onDeleteConfirm"
                        :dialog-judgment-data="{ title: $t('book_calendar.store_block.delete_title'), content: $t(deleteTarget && deleteTarget.rest ? 'book_calendar.store_block.delete_content_rest' : 'book_calendar.store_block.delete_content', { time: deleteTarget ? `${deleteTarget.startTime} ~ ${deleteTarget.endTime}` : '' }), falseLabel: $t('book_booking.dialog.common.cancel'), trueLabel: $t('book_booking.dialog.common.confirm') }"
  />
</template>

<script setup>
import {defineEmits, defineProps, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {date} from "quasar";
import CaskTabsVertical from "@/ui/components/CaskTabsVertical.vue";
import CaskDateTimePicker from "@/ui/components/CaskDateTimePicker.vue";
import CaskDialogJudgment from "@/ui/components/CaskDialogJudgment.vue";
import {notifyTopPositive, notifyTopWarning} from "@/utils/notification-tools.js";
import {bookBlockCreate, bookBlockDelete, bookBlockList} from "@/api/book.js";

const {t} = useI18n()

const emit = defineEmits(['update:modelValue', 'changed']);
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  }
})

// 与后端一致：block 覆盖日期最多到今天起 13 天（后端因第三方渠道窗口限 14 天且不确定是否含当天，保守取 13）
const MAX_BLOCK_DAYS = 13
const DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/

const tabs = ref([
  {
    value: 'list',
    label: 'book_calendar.store_block.tab_list',
    color: 'rgb(var(--full-container-background-color))'
  },
  {
    value: 'add',
    label: 'book_calendar.store_block.tab_add',
    color: 'rgb(var(--full-container-background-color))'
  },
])
const tab = ref('list')

const blockList = ref([])
const addStart = ref('')
const addEnd = ref('')
const addReason = ref('')
// 保存中：按钮置灰转圈，防重复提交
const saving = ref(false)

watch(() => props.modelValue, (val) => {
  if (val) {
    tab.value = 'list'
    addStart.value = ''
    addEnd.value = ''
    addReason.value = ''
    saving.value = false
    loadBlocks()
  }
})

// 按「今天 ±14 天」窗口查询（与后端 list 的窗口钳制一致，列表上方有对应提示）。
// 门店 block 与雇员 block 一并列出，靠行内标记区分作用范围——雇员 block 只挡某个人，
// 只列门店的话，店长在这里看不到「小王明天请假」这类同样会影响排单的屏蔽
function loadBlocks() {
  const now = new Date()
  bookBlockList({
    startDateStr: date.formatDate(date.addToDate(now, {days: -14}), 'YYYY-MM-DD'),
    endDateStr: date.formatDate(date.addToDate(now, {days: 14}), 'YYYY-MM-DD'),
  }).then(res => {
    if (!res || !res.data || !res.data.data) {
      return
    }
    blockList.value = res.data.data
  })
}

function saveBlock() {
  if (!DATETIME_PATTERN.test(addStart.value) || !DATETIME_PATTERN.test(addEnd.value)) {
    notifyTopWarning(t('book_calendar.store_block.time_required'))
    return
  }
  if (addEnd.value <= addStart.value) {
    notifyTopWarning(t('book_calendar.store_block.time_order'))
    return
  }
  // 前置窗口校验（后端同样校验）：结束时间恰为 00:00 时该日不算被覆盖
  const maxDateStr = date.formatDate(date.addToDate(new Date(), {days: MAX_BLOCK_DAYS}), 'YYYY-MM-DD')
  const lastDateStr = addEnd.value.substring(11, 16) === '00:00'
      ? date.formatDate(date.addToDate(new Date(addEnd.value.substring(0, 10)), {days: -1}), 'YYYY-MM-DD')
      : addEnd.value.substring(0, 10)
  if (lastDateStr > maxDateStr) {
    notifyTopWarning(t('book_calendar.store_block.time_window'))
    return
  }
  saving.value = true
  bookBlockCreate({
    startTimeStr: addStart.value,
    endTimeStr: addEnd.value,
    reason: addReason.value || undefined,
  }).then(res => {
    if (!res || !res.data) {
      return
    }
    notifyTopPositive(t('book_calendar.store_block.add_success'))
    addStart.value = ''
    addEnd.value = ''
    addReason.value = ''
    tab.value = 'list'
    loadBlocks()
    emit('changed')
  }).finally(() => {
    saving.value = false
  })
}

const showDelete = ref(false)
const deleteTarget = ref(null)
// 删除中：确认键转圈、弹窗锁住，删 block 要连带反注销第三方屏蔽时段，可能要等一会儿
const deleting = ref(false)

function openDelete(bl) {
  deleteTarget.value = bl
  showDelete.value = true
}

// 确认框回调：确认后不立刻关窗，等请求收尾再关，中间保持转圈
function onDeleteConfirm(isTrue) {
  if (deleting.value) {
    return
  }
  if (!isTrue) {
    showDelete.value = false
    return
  }
  deleteBlock()
}

function deleteBlock() {
  if (!deleteTarget.value) {
    showDelete.value = false
    return
  }
  deleting.value = true
  bookBlockDelete(deleteTarget.value.id).then(res => {
    if (!res || !res.data) {
      return
    }
    notifyTopPositive(t('book_calendar.store_block.delete_success'))
    loadBlocks()
    emit('changed')
  }).finally(() => {
    deleting.value = false
    showDelete.value = false
  })
}
</script>

<style scoped lang="scss">

// 作用范围标记：中性描边，只交代「挡谁」，不抢自动 block 那个主色标记的注意力
.store-block-scope-tag {
  padding: .05rem .35rem;
  border: 1px solid rgba(var(--text-color), .3);
  border-radius: 3px;
  opacity: .7;
  font-size: .68rem;
  font-weight: 500;
  white-space: nowrap;
}

// 休息围栏标记：与日历上的休息围栏斜纹同色系
.store-block-rest-tag {
  padding: .05rem .35rem;
  border: 1px solid rgba(33, 150, 83, .6);
  border-radius: 3px;
  color: rgb(33, 150, 83);
  font-size: .68rem;
  font-weight: 600;
  white-space: nowrap;
}

// 自动 block 标记：与日历上的自动 block 斜纹同色系，一眼对得上
.store-block-auto-tag {
  padding: .05rem .35rem;
  border: 1px solid rgba(204, 118, 45, .6);
  border-radius: 3px;
  color: rgb(204, 118, 45);
  font-size: .68rem;
  font-weight: 600;
  white-space: nowrap;
}

.store-block-item {
  padding: .5rem .75rem;
  margin-bottom: .5rem;
  border: 2px solid rgba(var(--text-color));
  border-radius: 4px;
}

</style>
