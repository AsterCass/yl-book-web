<template>
  <q-dialog :model-value="modelValue" transition-hide="fade" no-backdrop-dismiss no-shake
            transition-show="fade" @update:model-value="val => emit('update:modelValue', val)">
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
        <q-select v-model="upsertSkillIdList" :menu-offset="[0, 5]" :options="skillOptionList"
                  class="component-outline-input-grow"
                  clear-icon="fa-solid fa-xmark"
                  clearable
                  dropdown-icon="fa-solid fa-caret-down" emit-value map-options menu-anchor="bottom start"
                  multiple
                  use-chips
                  outlined popup-content-class="component-extra-card-std">
        </q-select>

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
                  outlined popup-content-class="component-extra-card-std">
        </q-select>

        <h6 class="cask-litter-title-asterisk" style="white-space: nowrap; align-self: flex-start;">
          {{ $t('book_booking.upsert.field.source') }}&nbsp;:</h6>
        <q-select v-model="upsertSource" :menu-offset="[0, 5]" :options="sourceOptions"
                  class="component-outline-input-grow"
                  dropdown-icon="fa-solid fa-caret-down" emit-value map-options menu-anchor="bottom start"
                  outlined popup-content-class="component-extra-card-std">
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
  </q-dialog>
</template>

<script setup>
import {onMounted, ref, watch} from "vue";
import {useI18n} from 'vue-i18n'
import {date} from "quasar";
import {notifyTopPositive, notifyTopWarning} from "@/utils/notification-tools.js";
import {AssignStrategyEnum, BookSourceEnum} from "@/constants/enums/book.js";
import {bookCreate, bookUpdate} from "@/api/book.js";
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

// 选项：优先用父组件传入，否则组件自行加载
const innerSkillOptions = ref([])
const innerStaffOptions = ref([])
const skillOptionList = ref([])
const staffOptionList = ref([])

function syncOptionLists() {
  skillOptionList.value = props.skillOptions || innerSkillOptions.value
  staffOptionList.value = props.staffOptions || innerStaffOptions.value
}

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
  }
})

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
    innerSkillOptions.value = res.data.data.map(skill => ({label: skill.name, value: skill.id}))
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
</script>

<style scoped lang="scss">

</style>
