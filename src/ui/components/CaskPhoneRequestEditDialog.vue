<template>
  <!-- 电话需求编辑弹窗（电话需求页「编辑」与预约日历电话需求栏「处理」共用）：
       上半部分只读展示需求本身（时间 / 电话 / 类型 / 简述 / 详述 / 回访），
       下半部分编辑处理状态 + 运营备注（仅内部） + 门店答复 comment（客户可见）。备注/答复保存空内容即清空 -->
  <q-dialog :model-value="modelValue" transition-hide="fade" no-backdrop-dismiss no-shake
            transition-show="fade" @hide="emit('update:modelValue', false)">
    <q-card class="component-cask-dialog-judgement-std" style="max-width: 2000px !important">
      <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
        {{ fromCalendar ? $t('book_phone_request.edit_dialog.handle_title') : $t('book_phone_request.edit_dialog.title') }}
      </h5>

      <q-separator class="component-separator-base" inset spaced="1rem"/>

      <div class="q-ma-md" style="min-width: 36rem; max-width: 48rem">

        <div v-if="request" class="phone-request-info">
          <div class="phone-request-info-label">{{ $t('book_phone_request.edit_dialog.time_label') }}</div>
          <div>{{ request.createTime || '-' }}</div>

          <!-- 日历里永远是当前门店，不必再写；电话需求页总门店视角下有用 -->
          <template v-if="!fromCalendar">
            <div class="phone-request-info-label">{{ $t('book_phone_request.edit_dialog.store_label') }}</div>
            <div>{{ request.storeName || '-' }}</div>
          </template>

          <div class="phone-request-info-label">{{ $t('book_phone_request.edit_dialog.phone_label') }}</div>
          <div>{{ phoneRequestDisplayPhone(request.phone) || '-' }}</div>

          <div class="phone-request-info-label">{{ $t('book_phone_request.edit_dialog.type_label') }}</div>
          <div>{{ request.type || '-' }}</div>

          <div class="phone-request-info-label">{{ $t('book_phone_request.edit_dialog.summary_label') }}</div>
          <div class="phone-request-info-text">{{ request.summary || '-' }}</div>

          <div class="phone-request-info-label">{{ $t('book_phone_request.edit_dialog.detail_label') }}</div>
          <div class="phone-request-info-text phone-request-info-detail">{{ request.detail || '-' }}</div>

          <template v-if="request.callCount">
            <div class="phone-request-info-label">{{ $t('book_phone_request.edit_dialog.call_label') }}</div>
            <div>
              {{ $t('book_phone_request.call_count', {count: request.callCount}) }}
              <span v-if="request.lastCallTime" style="opacity: .7">
                · {{ request.lastCallTime }} {{ request.lastCallOperator || '' }}
              </span>
            </div>
          </template>
        </div>

        <q-separator class="component-separator-base q-my-md"/>

        <div class="q-mb-xs" style="font-weight: 600">
          {{ $t('book_phone_request.edit_dialog.status_label') }}
        </div>
        <q-select v-model="editStatus" :menu-offset="[0, 5]" :options="statusOptions"
                  class="component-outline-input-grow"
                  dense dropdown-icon="fa-solid fa-caret-down" menu-anchor="bottom start"
                  outlined popup-content-class="component-extra-card-std-limit"/>
        <!-- 日历栏只列未办完的需求：告诉前台改成哪两种状态它才会消失，免得以为「处理中」也算处理完 -->
        <div v-if="fromCalendar" class="q-mt-xs phone-request-calendar-hint">
          <q-icon name="fa-solid fa-circle-info" class="q-mr-xs"/>
          {{ calendarHint }}
        </div>

        <div class="q-mt-md q-mb-xs" style="font-weight: 600">
          {{ $t('book_phone_request.edit_dialog.remark_label') }}
        </div>
        <q-input v-model="editRemark"
                 dense outlined class="component-outline-input-grow"
                 :placeholder="t('book_phone_request.edit_dialog.remark_placeholder')"/>

        <div class="q-mt-md q-mb-xs" style="font-weight: 600">
          {{ $t('book_phone_request.edit_dialog.comment_label') }}
        </div>
        <q-input v-model="editComment"
                 dense outlined class="component-outline-input-grow"
                 :placeholder="t('book_phone_request.edit_dialog.comment_placeholder')"/>
        <!-- 明示可见性：该字段会被 AI 电话读给来电查询的客户 -->
        <div class="q-mt-xs" style="opacity: .6; font-size: .8rem">
          {{ $t('book_phone_request.edit_dialog.comment_hint') }}
        </div>

      </div>

      <div class="row q-mt-lg q-mb-md justify-evenly">
        <q-btn class="shadow-1 component-full-btn-grow" no-caps unelevated :loading="saving"
               @click="save">
          {{ $t('main_setting_save') }}
        </q-btn>
        <q-btn class="shadow-1 component-outline-btn-grow" no-caps unelevated
               @click="emit('update:modelValue', false)">
          {{ $t('main_setting_cancel') }}
        </q-btn>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>

import {computed, ref, watch} from "vue";
import {useI18n} from 'vue-i18n'
import {notifyTopPositive} from "@/utils/notification-tools.js";
import {bookPhoneRequestUpdate} from "@/api/book.js";
import {PhoneRequestHandleStatusEnum} from "@/constants/enums/book.js";
import {phoneRequestDisplayPhone, phoneRequestStatusName, phoneRequestStatusOptions} from "@/utils/phone-request.js";

const props = defineProps({
  modelValue: {type: Boolean, default: false},
  /** 电话需求行（列表接口 PhoneRequestDto），打开时据此回填 */
  request: {type: Object, default: null},
  /** 从预约日历电话需求栏打开：标题为「处理需求」、提示改成哪些状态后不再显示、不列「客户已取消」、不显示门店 */
  fromCalendar: {type: Boolean, default: false},
})

const emit = defineEmits(['update:modelValue', 'saved'])

const {t} = useI18n()

// 「客户已取消」只能由客户来电写入，管理端保存它后端一律拒绝。电话需求页照旧列出（README：前端有意不拦，
// 已是该状态的记录要能显示）；日历栏只列未处理 / 处理中，永远用不上这一项，列出来只会让前台点了报错
const statusOptions = computed(() => phoneRequestStatusOptions(
    props.fromCalendar ? [PhoneRequestHandleStatusEnum.CUSTOMER_CANCELED.code] : []))

// 状态名与下拉里的一致（同走 i18n），不在文案里写死
const calendarHint = computed(() => t('book_phone_request.edit_dialog.calendar_hint', {
  handled: phoneRequestStatusName(PhoneRequestHandleStatusEnum.HANDLED.code),
  noNeed: phoneRequestStatusName(PhoneRequestHandleStatusEnum.NO_NEED.code),
  inProgress: phoneRequestStatusName(PhoneRequestHandleStatusEnum.IN_PROGRESS.code),
}))

const editStatus = ref(null)
const editRemark = ref("")
const editComment = ref("")
// 保存中：按钮 loading 防重复提交
const saving = ref(false)

// 每次打开按当前行回填（同一行连开两次也要重置掉上次没保存的输入）
watch(() => props.modelValue, open => {
  if (!open || !props.request) {
    return
  }
  const statusEnum = PhoneRequestHandleStatusEnum.fromCode(props.request.handleStatus)
  // q-select 选项形状与下拉选项一致（{label, value}）
  editStatus.value = statusEnum
      ? {label: phoneRequestStatusName(statusEnum.code), value: statusEnum.code} : null
  editRemark.value = props.request.remark || ''
  editComment.value = props.request.comment || ''
})

function save() {
  if (saving.value || !editStatus.value || !props.request) {
    return
  }
  saving.value = true
  // 备注/答复空内容原样提交=清空
  bookPhoneRequestUpdate(props.request.id, {
    handleStatus: editStatus.value.value,
    remark: editRemark.value,
    comment: editComment.value,
  }).then(res => {
    if (!res || !res.data) {
      return
    }
    emit('update:modelValue', false)
    notifyTopPositive(t('book_phone_request.notify.update_success'))
    emit('saved')
  }).finally(() => {
    saving.value = false
  })
}

</script>

<style scoped lang="scss">

.phone-request-info {
  display: grid;
  grid-template-columns: max-content 1fr;
  column-gap: 1rem;
  row-gap: .45rem;
  font-size: .9rem;

  .phone-request-info-label {
    font-weight: 600;
    white-space: nowrap;
  }

  .phone-request-info-text {
    white-space: pre-wrap;
    word-break: break-word;
  }

  // 详述最长 2000 字：限高、内部滚动，不把弹窗撑出屏幕
  .phone-request-info-detail {
    max-height: 12rem;
    overflow-y: auto;
  }
}

.phone-request-calendar-hint {
  font-size: .8rem;
  color: rgb(214, 120, 20);
}

</style>
