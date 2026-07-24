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
                    <div style="font-weight: 500">{{ bl.startTime }} ~ {{ bl.endTime }}</div>
                    <div v-if="bl.reason" class="component-max-line-text"
                         style="opacity: .6; font-size: .78rem">{{ bl.reason }}</div>
                  </div>
                  <q-space/>
                  <q-btn round flat dense class="component-none-btn-grow" @click="openDelete(bl)">
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
                        :callback-method="isTrue => { showDelete = false; if (isTrue) deleteBlock() }"
                        :dialog-judgment-data="{ title: $t('book_calendar.store_block.delete_title'), content: $t('book_calendar.store_block.delete_content', { time: deleteTarget ? `${deleteTarget.startTime} ~ ${deleteTarget.endTime}` : '' }), falseLabel: $t('book_booking.dialog.common.cancel'), trueLabel: $t('book_booking.dialog.common.confirm') }"
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

// 按「今天 ±14 天」窗口查询（与后端 list 的窗口钳制一致，列表上方有对应提示）；此处只管理门店 block
function loadBlocks() {
  const now = new Date()
  bookBlockList({
    startDateStr: date.formatDate(date.addToDate(now, {days: -14}), 'YYYY-MM-DD'),
    endDateStr: date.formatDate(date.addToDate(now, {days: 14}), 'YYYY-MM-DD'),
  }).then(res => {
    if (!res || !res.data || !res.data.data) {
      return
    }
    blockList.value = res.data.data.filter(bl => bl.storeBlock)
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

function openDelete(bl) {
  deleteTarget.value = bl
  showDelete.value = true
}

function deleteBlock() {
  if (!deleteTarget.value) {
    return
  }
  bookBlockDelete(deleteTarget.value.id).then(res => {
    if (!res || !res.data) {
      return
    }
    notifyTopPositive(t('book_calendar.store_block.delete_success'))
    loadBlocks()
    emit('changed')
  })
}
</script>

<style scoped lang="scss">

.store-block-item {
  padding: .5rem .75rem;
  margin-bottom: .5rem;
  border: 2px solid rgba(var(--text-color));
  border-radius: 4px;
}

</style>
