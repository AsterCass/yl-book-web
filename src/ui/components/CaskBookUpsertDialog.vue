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

        <!-- 预约来源在客户名称上方；无默认值，选自然流/电话预约且名称为空时按当前语言自动回填名称 -->
        <h6 class="cask-litter-title-asterisk" style="white-space: nowrap; align-self: flex-start;">
          {{ $t('book_booking.upsert.field.source') }}&nbsp;:</h6>
        <q-select v-model="upsertSource" :menu-offset="[0, 5]" :options="sourceOptions"
                  class="component-outline-input-grow"
                  dropdown-icon="fa-solid fa-caret-down" emit-value map-options menu-anchor="bottom start"
                  @update:model-value="onSourceChange"
                  outlined popup-content-class="component-extra-card-std-limit">
        </q-select>

        <h6 class="cask-litter-title-asterisk" style="white-space: nowrap;">{{ $t('book_booking.upsert.field.name') }}&nbsp;:</h6>
        <q-input v-model="upsertName" class="component-outline-input-grow" dense outlined
                 :placeholder="t('book_booking.placeholder.name')"/>

        <h6 class="cask-litter-title-asterisk" style="white-space: nowrap; align-self: flex-start;">
          {{ $t('book_booking.upsert.field.bookProjectName') }}&nbsp;:</h6>
        <div>
          <q-select ref="skillOptionRef" v-model="upsertSkillIdList" :menu-offset="[0, 5]" :options="skillOptionsNow"
                    class="component-outline-input-grow"
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
          <!-- 总金额：任一所选技能未配置金额则提示，否则合计 -->
          <div v-if="upsertSkillIdList.length > 0" style="opacity: .6; font-size: .78rem; margin: .2rem 0 0 .2rem;">
            <span v-if="hasUnconfiguredAmount">{{ $t('book_booking.amount_unconfigured') }}</span>
            <span v-else>{{ $t('book_booking.upsert.amount_total', {amount: totalServiceAmount}) }}</span>
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

        <!-- 分配雇员：硬指定，填了则跳过自动分配直接分给该雇员（不合法后端直接报错），
             此时偏好员工仅作记录字段；留空维持全自动分配。
             编辑时回填当前已分配雇员：改成别人=改派，清空=退回待分配并交回自动分配 -->
        <h6 style="white-space: nowrap; margin-left: 12px!important;">
          {{ $t('book_booking.upsert.field.assignedStaffId') }}&nbsp;:</h6>
        <q-select v-model="upsertAssignedStaffId" :menu-offset="[0, 5]" :options="staffOptionList"
                  class="component-outline-input-grow"
                  clear-icon="fa-solid fa-xmark"
                  clearable
                  dropdown-icon="fa-solid fa-caret-down" emit-value map-options menu-anchor="bottom start"
                  outlined popup-content-class="component-extra-card-std-limit">
        </q-select>

        <!-- 特殊备注：选项与选中值都是文案字符串本身，无 id->名称 映射，不受选项加载时序影响 -->
        <h6 style="white-space: nowrap; margin-left: 12px!important; align-self: flex-start;">
          {{ $t('book_booking.upsert.field.specialRemark') }}&nbsp;:</h6>
        <q-select v-model="upsertSpecialRemarkList" :menu-offset="[0, 5]" :options="specialRemarkOptions"
                  class="component-outline-input-grow"
                  clear-icon="fa-solid fa-xmark"
                  clearable
                  dropdown-icon="fa-solid fa-caret-down" menu-anchor="bottom start"
                  multiple
                  use-chips
                  outlined popup-content-class="component-extra-card-std-limit">
        </q-select>

        <h6 style="white-space: nowrap; margin-left: 12px!important; align-self: flex-start;">
          {{ $t('book_booking.upsert.field.remark') }}&nbsp;:</h6>
        <q-input v-model="upsertRemark" class="component-outline-input-grow" dense outlined
                 :placeholder="t('book_booking.placeholder.remark')"/>

      </div>

      <div class="row q-mt-xl q-mb-md justify-evenly">
        <!-- 提交中禁用并转 loading，防快速重复点击重复建单 -->
        <q-btn class="shadow-1 component-full-btn-grow" no-caps unelevated :loading="saving" @click="save">
          {{ isNew ? $t('book_booking.upsert.save_add') : $t('book_booking.upsert.save_update') }}
        </q-btn>

        <q-btn class="shadow-1 component-outline-btn-grow" no-caps unelevated
               @click="emit('update:modelValue', false)">
          {{ $t('main_setting_cancel') }}
        </q-btn>
      </div>
    </q-card>

    <!-- 姓名、手机号搜索结果相互独立，分别浮于主表单左、右两侧 -->
    <cask-customer-history-panel
        v-if="nameCustomerHistory.length > 0"
        class="cask-customer-history-left"
        :customers="nameCustomerHistory"
        :title="$t('book_booking.customer_history.name_title')"
        :hint="$t('book_booking.customer_history.name_hint')"
        @select="pickCustomer"/>

    <cask-customer-history-panel
        v-if="phoneCustomerHistory.length > 0"
        class="cask-customer-history-right"
        :customers="phoneCustomerHistory"
        :title="$t('book_booking.customer_history.phone_title')"
        :hint="$t('book_booking.customer_history.phone_hint')"
        @select="pickCustomer"/>
    </div>
  </q-dialog>
</template>

<script setup>
import {computed, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {useI18n} from 'vue-i18n'
import {date} from "quasar";
import {notifyTopPositive, notifyTopWarning} from "@/utils/notification-tools.js";
import {AssignStrategyEnum, BookSourceEnum} from "@/constants/enums/book.js";
import {
  bookCreate,
  bookCustomerHistory,
  bookCustomerHistoryByName,
  bookSpecialRemarkListSimple,
  bookUpdate
} from "@/api/book.js";
import {staffListSimple} from "@/api/staff.js";
import {staffSkillListSimple} from "@/api/staff-skill.js";
import CaskDateTimePicker from "@/ui/components/CaskDateTimePicker.vue";
import CaskCustomerHistoryPanel from "@/ui/components/CaskCustomerHistoryPanel.vue";

const {t, availableLocales} = useI18n()

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
const upsertAssignedStaffId = ref(null)
const upsertSource = ref(BookSourceEnum.PHONE.code)
const upsertRemark = ref("")
const upsertSpecialRemarkList = ref([])
const sourceOptions = ref(BookSourceEnum.toSelectForm())
// 门店特殊备注选项（纯文案字符串，选中值即文案，无需 id 映射）
const specialRemarkOptions = ref([])

// 客户历史：姓名和手机号各自维护结果、防抖计时器及请求序号，避免相互覆盖或旧响应回写
const nameCustomerHistory = ref([])
const phoneCustomerHistory = ref([])
const HISTORY_DEBOUNCE = 400
let nameHistoryTimer = null
let phoneHistoryTimer = null
let nameHistoryRequestId = 0
let phoneHistoryRequestId = 0

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
  // 选项到达时同步到展示列表：skillOptionsNow 初始为空且只在 filterFn 里更新，
  // 若技能列表晚于弹窗回填到达，map-options 会查不到已选 id 的名称；这里保证不依赖加载顺序
  skillOptionsNow.value = skillOptionList.value
}

function filterFn(val, update) {
  update(() => {
    if (val === '') {
      skillOptionsNow.value = skillOptionList.value
    } else {
      const needle = val.toLowerCase()
      skillOptionsNow.value = skillOptionList.value.filter(
          v => (v.label || '').toLowerCase().indexOf(needle) > -1 || (v.code || '').toLowerCase().indexOf(needle) > -1
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

// 已选技能里是否存在未配置金额（serviceAmount 为 null/undefined）的项
const hasUnconfiguredAmount = computed(() =>
    upsertSkillIdList.value.some(skillId => {
      const opt = skillOptionList.value.find(o => o.value === skillId)
      return !opt || opt.serviceAmount == null
    }))

// 已选技能的总金额（仅在全部已配置金额时有意义）
const totalServiceAmount = computed(() =>
    upsertSkillIdList.value.reduce((sum, skillId) => {
      const opt = skillOptionList.value.find(o => o.value === skillId)
      return sum + (opt && opt.serviceAmount != null ? Number(opt.serviceAmount) : 0)
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
  // 分配雇员：创建时由日历日视图从雇员列点开预填该列雇员；
  // 编辑时回填该单当前已分配的雇员（待分配单为空，留空即继续走自动分配）。
  // staffId 兜底仅限编辑——「复制预约」也是 isNew 且带着源单 staffId，不该被硬指定成同一人
  upsertAssignedStaffId.value = (b && b.assignedStaffId) ? b.assignedStaffId
      : ((!props.isNew && b && b.staffId) ? b.staffId : null)
  // 来源不设默认值：新增必须显式选择（保存时校验）
  upsertSource.value = b && b.source != null ? b.source : null
  upsertRemark.value = b && b.remark ? b.remark : ''
  // 优先取数组；列表行数据只有逗号分隔的 specialRemarks 字符串，需解析回填（否则更新时会误清空）
  if (b && Array.isArray(b.specialRemarkList)) {
    upsertSpecialRemarkList.value = [...b.specialRemarkList]
  } else if (b && b.specialRemarks) {
    upsertSpecialRemarkList.value = b.specialRemarks.split(',').filter(item => item)
  } else {
    upsertSpecialRemarkList.value = []
  }
}

watch(() => props.modelValue, (val) => {
  if (val) {
    // 重置过滤残留，保证已选项目能映射出名称
    skillOptionsNow.value = skillOptionList.value
    populate()
  } else {
    // 关闭时清空历史与待触发的查询
    nameCustomerHistory.value = []
    phoneCustomerHistory.value = []
    clearNameHistoryTimer()
    clearPhoneHistoryTimer()
    // 让已发出的请求响应失效，避免下次打开时短暂显示旧结果
    nameHistoryRequestId++
    phoneHistoryRequestId++
  }
})

// 姓名变化（含用户输入与回填）时，只更新左侧姓名搜索结果
watch(() => upsertName.value, (val) => {
  clearNameHistoryTimer()
  const requestId = ++nameHistoryRequestId
  nameCustomerHistory.value = []
  const name = (val || '').trim()
  if (!name) {
    return
  }
  nameHistoryTimer = setTimeout(() => loadNameCustomerHistory(name, requestId), HISTORY_DEBOUNCE)
})

// 手机号变化（含用户输入与回填）时，只更新右侧手机号搜索结果
watch(() => upsertPhone.value, (val) => {
  clearPhoneHistoryTimer()
  const requestId = ++phoneHistoryRequestId
  phoneCustomerHistory.value = []
  const phone = (val || '').trim()
  if (!phone) {
    return
  }
  phoneHistoryTimer = setTimeout(() => loadPhoneCustomerHistory(phone, requestId), HISTORY_DEBOUNCE)
})

function clearNameHistoryTimer() {
  if (nameHistoryTimer) {
    clearTimeout(nameHistoryTimer)
    nameHistoryTimer = null
  }
}

function clearPhoneHistoryTimer() {
  if (phoneHistoryTimer) {
    clearTimeout(phoneHistoryTimer)
    phoneHistoryTimer = null
  }
}

function loadNameCustomerHistory(name, requestId) {
  bookCustomerHistoryByName(name).then(res => {
    if (requestId !== nameHistoryRequestId) {
      return
    }
    nameCustomerHistory.value = res && res.data && Array.isArray(res.data.data)
        ? res.data.data : []
  })
}

function loadPhoneCustomerHistory(phone, requestId) {
  bookCustomerHistory(phone).then(res => {
    if (requestId !== phoneHistoryRequestId) {
      return
    }
    phoneCustomerHistory.value = res && res.data && Array.isArray(res.data.data)
        ? res.data.data : []
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

// 来源联动自动填充客户名（自然流/电话预约），文案走 i18n、随当前系统语言；
// 仅当名称为空、或仍是上一次自动填充值（用户未手改）时写入，不覆盖用户输入
const SOURCE_AUTO_NAME_KEYS = {
  [BookSourceEnum.NATURAL.code]: 'book_booking.upsert.auto_name_natural',
  [BookSourceEnum.PHONE.code]: 'book_booking.upsert.auto_name_phone',
}

// 全部语言下的自动填充文案集合（识别「仍是自动填充值」需覆盖所有语言，防中途切换语言后漏判）
function autoNameValues() {
  const values = []
  for (const key of Object.values(SOURCE_AUTO_NAME_KEYS)) {
    for (const l of availableLocales) {
      values.push(t(key, {}, {locale: l}))
    }
  }
  return values
}

function onSourceChange(code) {
  const current = (upsertName.value || '').trim()
  if (current && !autoNameValues().includes(current)) {
    return
  }
  const autoNameKey = SOURCE_AUTO_NAME_KEYS[code]
  if (autoNameKey) {
    upsertName.value = t(autoNameKey)
  }
}

// 提交中标记：按钮 loading + 拦截重复触发（回车/连点），请求结束（含失败）恢复可点
const saving = ref(false)

function save() {
  if (saving.value) {
    return
  }
  if (!upsertBookingTime.value || !upsertName.value || upsertSource.value == null) {
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
    // 编辑时清空偏好雇员需传空串（后端将 null 视为不修改）
    preferredStaffId: upsertPreferredStaffId.value != null
        ? upsertPreferredStaffId.value : (props.isNew ? null : ''),
    // 分配雇员（硬指定，后端跳过自动分配；不合法直接报错）。
    // 编辑时清空需传空串——后端将 null 视为不修改，空串才是「退回待分配并交回自动分配」
    assignedStaffId: upsertAssignedStaffId.value != null
        ? upsertAssignedStaffId.value : (props.isNew ? null : ''),
    assignStrategy: AssignStrategyEnum.PRIORITY.code,
    source: upsertSource.value,
    remark: upsertRemark.value,
    // 始终传数组：空数组=清空（创建时等价于留空）
    specialRemarkList: upsertSpecialRemarkList.value,
  }

  saving.value = true
  if (props.isNew) {
    bookCreate(body).then(res => {
      if (!res || !res.data) {
        return
      }
      emit('update:modelValue', false)
      emit('saved')
    }).finally(() => {
      saving.value = false
    })
  } else {
    bookUpdate(props.book.id, body).then(res => {
      if (!res || !res.data) {
        return
      }
      emit('update:modelValue', false)
      notifyTopPositive(t('book_booking.notify.update_success'))
      emit('saved')
    }).finally(() => {
      saving.value = false
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
      serviceAmount: skill.serviceAmount,
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

function loadSpecialRemarkOptions() {
  bookSpecialRemarkListSimple().then(res => {
    if (!res || !res.data || !res.data.data) {
      return
    }
    specialRemarkOptions.value = res.data.data
  })
}

onMounted(() => {
  syncOptionLists()
  loadSkillOptions()
  loadStaffOptions()
  loadSpecialRemarkOptions()
})

onBeforeUnmount(() => {
  clearNameHistoryTimer()
  clearPhoneHistoryTimer()
})
</script>

<style scoped lang="scss">

// 定位容器：仅按主卡片宽度收缩并居中，两个历史面板作为兄弟节点绝对定位在左右两侧。
// Quasar 对 .q-dialog__inner > div 强制 overflow: auto，会把溢出到两侧的历史面板裁剪掉，
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

.cask-customer-history-left,
.cask-customer-history-right {
  position: absolute;
  top: 0;
}

.cask-customer-history-left {
  right: calc(100% + 1rem);
}

.cask-customer-history-right {
  left: calc(100% + 1rem);
}

</style>
