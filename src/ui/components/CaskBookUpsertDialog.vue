<template>
  <q-dialog :model-value="modelValue" transition-hide="fade" no-backdrop-dismiss no-shake
            transition-show="fade" @update:model-value="val => emit('update:modelValue', val)">
    <div class="cask-upsert-wrap">
    <q-card class="component-cask-dialog-judgement-std" style="max-width: 2000px !important">
      <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
        {{ isNew ? $t('book_booking.upsert.title_add') : $t('book_booking.upsert.title_update') }}
      </h5>

      <q-separator class="component-separator-base" inset spaced="1rem"/>

      <div class="q-ma-md"
           style="display: grid; grid-template-columns: max-content 1fr; gap: 1.2rem; align-items: center;">

        <h6 class="cask-litter-title-asterisk" style="white-space: nowrap;">
          {{ $t('book_booking.upsert.field.bookingTime') }}&nbsp;:</h6>
        <cask-date-time-picker v-model="upsertBookingTime" input-class="component-outline-input-grow"
                               :placeholder="t('book_booking.placeholder.bookingTime')"/>

        <h6 class="cask-litter-title-asterisk" style="white-space: nowrap;">{{ $t('book_booking.upsert.field.name') }}&nbsp;:</h6>
        <q-input v-model="upsertName" class="component-outline-input-grow" dense outlined
                 :placeholder="t('book_booking.placeholder.name')"/>

        <h6 class="cask-litter-title-asterisk" style="white-space: nowrap; align-self: flex-start;">
          {{ $t('book_booking.upsert.field.bookProjectName') }}&nbsp;:</h6>
        <div>
          <q-select ref="skillOptionRef" v-model="upsertSkillIdList" :menu-offset="[0, 5]" :options="skillOptionsNow"
                    class="component-outline-input-grow"
                    clear-icon="fa-solid fa-xmark"
                    clearable
                    dropdown-icon="fa-solid fa-caret-down" emit-value map-options menu-anchor="bottom start"
                    multiple
                    use-chips
                    use-input
                    input-debounce="200"
                    @filter="filterFn"
                    @update:model-value="onSelect"
                    outlined popup-content-class="component-extra-card-std-limit">
          </q-select>
          <div v-if="totalConsumeMinutes > 0" style="opacity: .6; font-size: .78rem; margin: .3rem 0 0 .2rem;">
            {{ $t('book_booking.upsert.consume_total', {minutes: totalConsumeMinutes}) }}
          </div>
        </div>

        <h6 style="white-space: nowrap; margin-left: 12px!important;">{{
            $t('book_booking.upsert.field.phone')
          }}&nbsp;:</h6>
        <q-input v-model="upsertPhone" class="component-outline-input-grow" dense outlined
                 :placeholder="t('book_booking.placeholder.phone')"/>

        <h6 style="white-space: nowrap; margin-left: 12px!important;">{{
            $t('book_booking.upsert.field.mail')
          }}&nbsp;:</h6>
        <q-input v-model="upsertMail" class="component-outline-input-grow" dense outlined
                 placeholder="example@mail.com"/>

        <h6 style="white-space: nowrap; margin-left: 12px!important;">
          {{ $t('book_booking.upsert.field.preferredStaffId') }}&nbsp;:</h6>
        <q-select v-model="upsertPreferredStaffId" :menu-offset="[0, 5]" :options="staffOptionList"
                  class="component-outline-input-grow"
                  clear-icon="fa-solid fa-xmark"
                  clearable
                  dropdown-icon="fa-solid fa-caret-down" emit-value map-options menu-anchor="bottom start"
                  outlined popup-content-class="component-extra-card-std-limit">
        </q-select>

        <h6 class="cask-litter-title-asterisk" style="white-space: nowrap; align-self: flex-start;">
          {{ $t('book_booking.upsert.field.source') }}&nbsp;:</h6>
        <q-select v-model="upsertSource" :menu-offset="[0, 5]" :options="sourceOptions"
                  class="component-outline-input-grow"
                  dropdown-icon="fa-solid fa-caret-down" emit-value map-options menu-anchor="bottom start"
                  outlined popup-content-class="component-extra-card-std-limit">
        </q-select>

        <h6 style="white-space: nowrap; margin-left: 12px!important; align-self: flex-start;">
          {{ $t('book_booking.upsert.field.remark') }}&nbsp;:</h6>
        <q-input v-model="upsertRemark" class="component-outline-input-grow" dense outlined
                 :placeholder="t('book_booking.placeholder.remark')"/>

      </div>

      <div class="row q-mt-xl q-mb-md justify-evenly">
        <q-btn class="shadow-1 component-full-btn-grow" no-caps unelevated @click="save">
          {{ isNew ? $t('book_booking.upsert.save_add') : $t('book_booking.upsert.save_update') }}
        </q-btn>

        <q-btn class="shadow-1 component-outline-btn-grow" no-caps unelevated
               @click="emit('update:modelValue', false)">
          {{ $t('main_setting_cancel') }}
        </q-btn>
      </div>
    </q-card>

    <!-- 客户历史：绝对定位浮于表单右侧（主卡片的兄弟节点，独立采样背景以保证磨砂效果） -->
    <div v-if="customerHistory.length > 0"
         class="component-cask-dialog-judgement-std cask-customer-history">
        <h6 style="font-weight: 600!important; margin: .4rem .5rem !important;">
          {{ $t('book_booking.customer_history.title') }}
        </h6>
        <div class="q-mx-sm" style="opacity: .5; font-size: .8rem;">
          {{ $t('book_booking.customer_history.hint') }}
        </div>
        <q-separator class="component-separator-base" inset spaced=".6rem"/>

        <div class="cask-history-scroll">
          <div v-for="(cust, ci) in customerHistory" :key="ci"
               class="cask-history-item" @click="pickCustomer(cust)">
            <div class="row items-center justify-between no-wrap">
              <div class="text-weight-bold ellipsis">
                {{ cust.name || $t('book_booking.customer_history.no_name') }}
              </div>
              <q-badge outline color="grey-7"
                       :label="$t('book_booking.customer_history.total', { count: cust.totalCount })"/>
            </div>
            <div class="row items-center no-wrap q-mt-xs" style="font-size: .78rem; opacity: .7; gap: .4rem;">
              <span>{{ cust.phone }}</span>
              <span v-if="cust.mail" class="ellipsis">· {{ cust.mail }}</span>
            </div>

            <div v-for="(bk, bi) in (cust.recentBookings || [])" :key="bi" class="cask-history-booking">
              <span class="cask-history-time">{{ bk.bookingTime }}</span>
              <span class="cask-history-project ellipsis">{{ projectNames(bk) }}</span>
              <span class="cask-history-source" :style="{ color: sourceColor(bk.source) }">
                {{ sourceName(bk.source) }}
              </span>
              <q-badge :style="{ backgroundColor: statusColor(bk.status) }"
                       :label="statusName(bk.status)" style="font-size: 9px;"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-dialog>
</template>

<script setup>
import {computed, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {useI18n} from 'vue-i18n'
import {date} from "quasar";
import {notifyTopPositive, notifyTopWarning} from "@/utils/notification-tools.js";
import {AssignStrategyEnum, BookSourceEnum, BookStatusEnum} from "@/constants/enums/book.js";
import {bookCreate, bookCustomerHistory, bookUpdate} from "@/api/book.js";
import {staffListSimple} from "@/api/staff.js";
import {staffSkillListSimple} from "@/api/staff-skill.js";
import CaskDateTimePicker from "@/ui/components/CaskDateTimePicker.vue";

const {t} = useI18n()

const props = defineProps({
  modelValue: {type: Boolean, default: false},
  // 编辑时传入预约行数据（含 id）；新增/复制传入预填数据或 null
  book: {type: Object, default: null},
  isNew: {type: Boolean, default: false},
  // 可选：由父组件提供已加载的选项，避免重复请求；未提供则组件自行加载
  skillOptions: {type: Array, default: null},
  staffOptions: {type: Array, default: null},
})

const emit = defineEmits(['update:modelValue', 'saved'])

const upsertBookingTime = ref("")
const upsertName = ref("")
const upsertSkillIdList = ref([])
const upsertPhone = ref("")
const upsertMail = ref("")
const upsertPreferredStaffId = ref(null)
const upsertSource = ref(BookSourceEnum.WECHAT.code)
const upsertRemark = ref("")
const sourceOptions = ref(BookSourceEnum.toSelectForm())

// 客户历史（按手机号模糊查询，防抖）
const customerHistory = ref([])
const HISTORY_DEBOUNCE = 400
let historyTimer = null

// 选项：优先用父组件传入，否则组件自行加载
const skillOptionRef = ref(null)
const innerSkillOptions = ref([])
const innerStaffOptions = ref([])
const skillOptionList = ref([])
const skillOptionsNow = ref([])
const staffOptionList = ref([])

function syncOptionLists() {
  skillOptionList.value = props.skillOptions || innerSkillOptions.value
  staffOptionList.value = props.staffOptions || innerStaffOptions.value
}

function filterFn(val, update) {
  update(() => {
    if (val === '') {
      skillOptionsNow.value = skillOptionList.value
    } else {
      const needle = val.toLowerCase()
      skillOptionsNow.value = skillOptionList.value.filter(
          v => v.label.toLowerCase().indexOf(needle) > -1 || v.code.toLowerCase().indexOf(needle) > -1
      )
    }
  })
}

function onSelect() {
  // 选中后清空输入框
  if(skillOptionRef && skillOptionRef.value) {
    skillOptionRef.value.updateInputValue('')
  }

}

// 已选项目的预计总耗时（选项带 consumeMinutes，来自 /staff/skill/list/simple）
const totalConsumeMinutes = computed(() =>
    upsertSkillIdList.value.reduce((sum, skillId) => {
      const opt = skillOptionList.value.find(o => o.value === skillId)
      return sum + (opt && opt.consumeMinutes ? opt.consumeMinutes : 0)
    }, 0))

// 弹窗打开时用 book 填充表单（新增无 book 时给默认预约时间=当前+5分钟）
function populate() {
  const b = props.book
  if (props.isNew && (!b || !b.bookingTime)) {
    upsertBookingTime.value = date.formatDate(Date.now() + 5 * 60 * 1000, 'YYYY-MM-DD HH:mm')
  } else {
    upsertBookingTime.value = b && b.bookingTime ? b.bookingTime : ''
  }
  upsertName.value = b && b.name ? b.name : ''
  upsertSkillIdList.value = (b && b.skillDtoList ? b.skillDtoList : []).map(s => s.id)
  upsertPhone.value = b && b.phone ? b.phone : ''
  upsertMail.value = b && b.mail ? b.mail : ''
  upsertPreferredStaffId.value = b && b.preferredStaffId ? b.preferredStaffId : null
  upsertSource.value = b && b.source != null ? b.source : BookSourceEnum.WECHAT.code
  upsertRemark.value = b && b.remark ? b.remark : ''
}

watch(() => props.modelValue, (val) => {
  if (val) {
    populate()
  } else {
    // 关闭时清空历史与待触发的查询
    customerHistory.value = []
    clearHistoryTimer()
  }
})

// 手机号变化（含用户输入与回填）时，防抖后按手机号模糊查询客户历史
watch(() => upsertPhone.value, (val) => {
  clearHistoryTimer()
  const phone = (val || '').trim()
  if (!phone) {
    customerHistory.value = []
    return
  }
  historyTimer = setTimeout(() => loadCustomerHistory(phone), HISTORY_DEBOUNCE)
})

function clearHistoryTimer() {
  if (historyTimer) {
    clearTimeout(historyTimer)
    historyTimer = null
  }
}

function loadCustomerHistory(phone) {
  bookCustomerHistory(phone).then(res => {
    if (!res || !res.data || !res.data.data) {
      customerHistory.value = []
      return
    }
    customerHistory.value = res.data.data
  })
}

// 点击客户：回填姓名、手机号，若有邮箱则一并回填
function pickCustomer(cust) {
  upsertName.value = cust.name || ''
  upsertPhone.value = cust.phone || ''
  if (cust.mail) {
    upsertMail.value = cust.mail
  }
}

// 历史预约展示辅助
function projectNames(bk) {
  return (bk.skillDtoList || []).map(s => s.name).join(', ')
}

function sourceName(source) {
  const e = source != null ? BookSourceEnum.fromCode(source) : null
  return e ? e.name : ''
}

function sourceColor(source) {
  const e = source != null ? BookSourceEnum.fromCode(source) : null
  return e ? e.color : 'rgb(128, 128, 128)'
}

function statusName(status) {
  const e = BookStatusEnum.fromCode(status)
  return e ? e.name : ''
}

function statusColor(status) {
  const e = BookStatusEnum.fromCode(status)
  return e ? e.color : 'rgb(128, 128, 128)'
}

function save() {
  if (!upsertBookingTime.value || !upsertName.value) {
    notifyTopWarning(t('validation.insufficient_parameters'))
    return
  }
  if (!props.isNew && (!props.book || !props.book.id)) {
    notifyTopWarning(t('validation.insufficient_parameters'))
    return
  }

  const body = {
    bookTimeStr: upsertBookingTime.value,
    name: upsertName.value,
    bookRequirementSkillIdList: upsertSkillIdList.value,
    phone: upsertPhone.value,
    mail: upsertMail.value,
    preferredStaffId: upsertPreferredStaffId.value,
    assignStrategy: AssignStrategyEnum.PRIORITY.code,
    source: upsertSource.value ? upsertSource.value : BookSourceEnum.WECHAT.code,
    remark: upsertRemark.value,
  }

  if (props.isNew) {
    bookCreate(body).then(res => {
      if (!res || !res.data) {
        return
      }
      emit('update:modelValue', false)
      emit('saved')
    })
  } else {
    bookUpdate(props.book.id, body).then(res => {
      if (!res || !res.data) {
        return
      }
      emit('update:modelValue', false)
      notifyTopPositive(t('book_booking.notify.update_success'))
      emit('saved')
    })
  }
}

function loadSkillOptions() {
  if (props.skillOptions) {
    return
  }
  staffSkillListSimple().then(res => {
    if (!res || !res.data || !res.data.data) {
      return
    }
    innerSkillOptions.value = res.data.data.map(skill => ({
      label: skill.name,
      value: skill.id,
      code: skill.code,
      consumeMinutes: skill.consumeMinutes,
    }))
    syncOptionLists()
  })
}

function loadStaffOptions() {
  if (props.staffOptions) {
    return
  }
  staffListSimple().then(res => {
    if (!res || !res.data || !res.data.data) {
      return
    }
    innerStaffOptions.value = res.data.data.map(staff => ({
      label: `${staff.name} ( ${staff.phone || ' - '} )`,
      value: staff.id,
    }))
    syncOptionLists()
  })
}

watch(() => [props.skillOptions, props.staffOptions], syncOptionLists)

onMounted(() => {
  syncOptionLists()
  loadSkillOptions()
  loadStaffOptions()
})

onBeforeUnmount(() => {
  clearHistoryTimer()
})
</script>

<style scoped lang="scss">

// 定位容器：仅按主卡片宽度收缩并居中，历史面板作为兄弟节点绝对定位其右侧。
// Quasar 对 .q-dialog__inner > div 强制 overflow: auto，会把溢出到右侧的历史面板裁剪掉，
// 这里改回 visible，并把「限高 + 滚动」职责下放给主卡片自身
.cask-upsert-wrap {
  position: relative;
  display: inline-block;
  overflow: visible !important;

  > .q-card {
    max-height: calc(100vh - 48px);
    overflow: auto;
  }
}

.cask-customer-history {
  // 绝对定位到表单右侧，不影响表单自身的居中位置；作为主卡片兄弟节点，backdrop-filter 独立采样背景
  position: absolute;
  top: 0;
  left: calc(100% + 1rem);
  width: 24rem;
  max-width: 24rem;
  padding: .5rem .3rem;

  .cask-history-scroll {
    max-height: 30rem;
    overflow-y: auto;
    padding: 0 .3rem .5rem;
  }

  .cask-history-item {
    padding: .6rem .5rem;
    margin: .2rem 0;
    border-radius: .4rem;
    cursor: pointer;
    border: 1px solid transparent;
    transition: background-color .12s ease, border-color .12s ease;

    &:hover {
      background-color: rgba(128, 128, 128, .1);
      border-color: rgba(128, 128, 128, .25);
    }

    & + .cask-history-item {
      border-top: 1px solid rgba(128, 128, 128, .12);
    }
  }

  .cask-history-booking {
    display: flex;
    align-items: center;
    gap: .4rem;
    margin-top: .3rem;
    font-size: .72rem;
    opacity: .8;

    .cask-history-time {
      flex: 0 0 auto;
      font-variant-numeric: tabular-nums;
    }

    .cask-history-project {
      flex: 1 1 auto;
      min-width: 0;
    }

    .cask-history-source {
      flex: 0 0 auto;
      font-weight: 500;
    }
  }
}

</style>
