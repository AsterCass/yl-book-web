<template>
  <div class="full-width">
    <div class="row items-center">

      <div class="q-ml-md">
        <h6>
          {{ $t('book_booking.label.name') }}&nbsp;:
        </h6>
      </div>
      <q-input v-model="selectName" class="q-ma-md component-outline-input-std" dense outlined
               :placeholder="t('book_booking.placeholder.name')"
               tabindex="0">
      </q-input>

      <div class="q-ml-md">
        <h6>
          {{ $t('book_booking.label.phone') }}&nbsp;:
        </h6>
      </div>
      <q-input v-model="selectPhone" class="q-ma-md component-outline-input-std" dense outlined
               :placeholder="t('book_booking.placeholder.phone')"
               tabindex="0">
      </q-input>

      <div class="q-ml-md">
        <h6>
          {{ $t('book_booking.label.status') }}&nbsp;:
        </h6>
      </div>
      <q-select v-model="selectStatus" :menu-offset="[0, 5]" :options="statusOptions"
                class="q-ma-md component-outline-input-grow"
                clear-icon="fa-solid fa-xmark"
                clearable
                dropdown-icon="fa-solid fa-caret-down" menu-anchor="bottom start"
                outlined popup-content-class="component-extra-card-std">
      </q-select>

      <div class="q-ml-md">
        <h6>
          {{ $t('book_booking.label.bookingTimeStart') }}&nbsp;:
        </h6>
      </div>
      <cask-date-time-picker v-model="selectBookingTimeStart" class="q-ma-md" input-class="component-outline-input-grow"
                             :placeholder="t('book_booking.placeholder.bookingTimeStart')"/>

      <div class="q-ml-md">
        <h6>
          {{ $t('book_booking.label.bookingTimeEnd') }}&nbsp;:
        </h6>
      </div>
      <cask-date-time-picker v-model="selectBookingTimeEnd" class="q-ma-md" input-class="component-outline-input-grow"
                             :placeholder="t('book_booking.placeholder.bookingTimeEnd')"/>

    </div>

    <div class="row">
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push unelevated @click="selectData">
        {{ $t('book_booking.button.query') }}
      </q-btn>
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push unelevated @click="openAddBooking">
        {{ $t('book_booking.button.add') }}
      </q-btn>
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push
             unelevated @click="()=> {clearSearch(); selectData();}">
        {{ $t('book_booking.button.clear') }}
      </q-btn>
    </div>

    <cask-complex-table :custom-table-operation="tableBookOperation" :table-base-info="tableBook"
                        :table-data="tableData"
                        :table-dynamic-data="tableDynamicData"
                        class="full-width"
                        style="padding: 2rem 5rem 0 0.5rem"
                        @columnClick="(name, row) => {
                            if (name === 'staffName' && row.staffId) {
                              openStaffDetail(row.staffId)
                            }
                          }"
                        @operationClick="(name, row) => {
                            if(name === 'detail') {
                              detailBook = row
                              showBookDetail = true
                            }
                            if(name === 'update') {
                              clearUpsertParam();
                              updateId = row.id
                              upsertBookingTime = row.bookingTime
                              upsertName = row.name
                              upsertSkillIdList = (row.skillDtoList || []).map(s => s.id)
                              upsertPhone = row.phone
                              upsertMail = row.mail
                              upsertPreferredStaffId = row.preferredStaffId || null
                              upsertRemark = row.remark || ''
                              upsertSource = row.source
                              isNew = false;
                              showUpsert = true
                            }
                            if(name === 'copy') {
                              copyBooking(row)
                            }
                            if(name === 'assign') {
                              openAssign(row)
                            }
                            if(name === 'delete') {
                              toOpId = row.id
                              toOpTitle = $t('book_booking.dialog.delete.title')
                              toOpDesc = $t('book_booking.dialog.delete.content', { name: row.name })
                              toOpFunc = deleteData
                              showOperation = true
                            }
                          }"
                        @toNewPage="(pageObj) => {
                            tableDynamicData.pageNo = pageObj.pageNo
                            tableDynamicData.pageSize = pageObj.pageSize
                            selectData()
                          }"
    />

    <!-- Upsert Dialog -->
    <q-dialog :model-value="showUpsert" transition-hide="fade" no-backdrop-dismiss no-shake
              transition-show="fade" @hide="showUpsert = false">
      <q-card class="component-cask-dialog-judgement-std" style="max-width: 2000px !important">
        <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
          {{ isNew ? $t('book_booking.upsert.title_add') : $t('book_booking.upsert.title_update') }}
        </h5>

        <q-separator class="component-separator-base" inset spaced="1rem"/>

        <div class="q-ma-md"
             style="display: grid; grid-template-columns: max-content 1fr; gap: 1.2rem; align-items: center;">

          <h6 class="cask-litter-title-asterisk" style="white-space: nowrap;">{{ $t('book_booking.upsert.field.bookingTime') }}&nbsp;:</h6>
          <cask-date-time-picker v-model="upsertBookingTime" input-class="component-outline-input-grow"
                                 :placeholder="t('book_booking.placeholder.bookingTime')"/>

          <h6 class="cask-litter-title-asterisk" style="white-space: nowrap;">{{ $t('book_booking.upsert.field.name') }}&nbsp;:</h6>
          <q-input v-model="upsertName" class="component-outline-input-grow" dense outlined
                   :placeholder="t('book_booking.placeholder.name')"/>

          <h6 class="cask-litter-title-asterisk" style="white-space: nowrap; align-self: flex-start;">
            {{ $t('book_booking.upsert.field.bookProjectName') }}&nbsp;:</h6>
          <q-select v-model="upsertSkillIdList" :menu-offset="[0, 5]" :options="skillOptions"
                    class="component-outline-input-grow"
                    clear-icon="fa-solid fa-xmark"
                    clearable
                    dropdown-icon="fa-solid fa-caret-down" emit-value map-options menu-anchor="bottom start"
                    multiple
                    use-chips
                    outlined popup-content-class="component-extra-card-std">
          </q-select>

          <h6 style="white-space: nowrap; margin-left: 12px!important;">{{ $t('book_booking.upsert.field.phone') }}&nbsp;:</h6>
          <q-input v-model="upsertPhone" class="component-outline-input-grow" dense outlined
                   :placeholder="t('book_booking.placeholder.phone')"/>

          <h6 style="white-space: nowrap; margin-left: 12px!important;">{{ $t('book_booking.upsert.field.mail') }}&nbsp;:</h6>
          <q-input v-model="upsertMail" class="component-outline-input-grow" dense outlined
                   placeholder="example@mail.com"/>

          <h6 style="white-space: nowrap; margin-left: 12px!important;">{{ $t('book_booking.upsert.field.preferredStaffId') }}&nbsp;:</h6>
          <q-select v-model="upsertPreferredStaffId" :menu-offset="[0, 5]" :options="staffSelectOptions"
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
          <q-btn class="shadow-1 component-full-btn-grow" no-caps unelevated @click="upsertData">
            {{ isNew ? $t('book_booking.upsert.save_add') : $t('book_booking.upsert.save_update') }}
          </q-btn>

          <q-btn class="shadow-1 component-outline-btn-grow" no-caps unelevated @click="showUpsert = false">
            {{ $t('main_setting_cancel') }}
          </q-btn>
        </div>
      </q-card>
    </q-dialog>

    <!-- Assign Dialog -->
    <q-dialog :model-value="showAssign" @hide="showAssign = false"
              transition-show="fade" transition-hide="fade">
      <q-card class="component-cask-dialog-judgement-std" style="max-width: 2000px !important">
        <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
          {{ $t('book_booking.upsert.assign_title') }}：{{ assignBookName }}
        </h5>

        <q-separator class="component-separator-base" inset spaced="1rem"/>

        <div class="q-ma-md" style="min-width: 25rem">
          <h6>{{ $t('book_booking.upsert.assign_select_staff') }}&nbsp;:</h6>
          <q-select v-model="assignStaffId" :menu-offset="[0, 5]" :options="staffSelectOptions"
                    class="component-outline-input-grow q-mt-sm"
                    clear-icon="fa-solid fa-xmark"
                    clearable
                    dropdown-icon="fa-solid fa-caret-down" menu-anchor="bottom start"
                    outlined popup-content-class="component-extra-card-std">
          </q-select>
          <div class="q-mt-sm q-ml-xs" style="opacity: 0.5; font-size: 0.8rem">
            {{ $t('book_booking.upsert.assign_empty_hint') }}
          </div>
        </div>

        <div class="row q-mt-xl q-mb-md justify-evenly">
          <q-btn class="shadow-1 component-full-btn-grow" no-caps unelevated @click="assignData">
            {{ $t('book_booking.upsert.assign_confirm') }}
          </q-btn>

          <q-btn class="shadow-1 component-outline-btn-grow" no-caps unelevated @click="showAssign = false">
            {{ $t('main_setting_cancel') }}
          </q-btn>
        </div>
      </q-card>
    </q-dialog>

    <!-- Staff Detail Dialog (read-only) -->
    <q-dialog :model-value="showStaffDetail" @hide="showStaffDetail = false"
              transition-show="fade" transition-hide="fade">
      <q-card class="component-cask-dialog-judgement-std" style="max-width: 2000px !important">
        <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
          {{ $t('book_booking.staff_detail.title') }}
        </h5>

        <q-separator class="component-separator-base" inset spaced="1rem"/>

        <div v-if="staffDetailData" class="q-ma-md" style="min-width: 25rem">
          <div style="display: grid; grid-template-columns: max-content 1fr; gap: 1.2rem; align-items: center;">
            <h6 style="white-space: nowrap;">{{ $t('staff.upsert.field.name') }}&nbsp;:</h6>
            <div>{{ staffDetailData.name || '-' }}</div>

            <h6 style="white-space: nowrap;">{{ $t('staff.upsert.field.phone') }}&nbsp;:</h6>
            <div>{{ staffDetailData.phone || '-' }}</div>

            <h6 style="white-space: nowrap;">{{ $t('staff.upsert.field.priority') }}&nbsp;:</h6>
            <div>{{ staffDetailData.priority }}</div>

            <h6 style="white-space: nowrap; align-self: flex-start;">{{
                $t('book_booking.staff_detail.skill')
              }}&nbsp;:</h6>
            <div class="row" style="gap: .4rem;">
              <div v-for="skill in (staffDetailData.skillDtoList || [])" :key="skill.id">
                {{ skill.name }}
              </div>
              <div v-if="!staffDetailData.skillDtoList || staffDetailData.skillDtoList.length === 0"
                   style="opacity: .5;">-
              </div>
            </div>

            <h6 style="white-space: nowrap; grid-column: 1 / -1;">{{ $t('staff.schedule.title') }}&nbsp;:</h6>

            <template v-for="dayOfWeek in dayOfWeekList" :key="dayOfWeek">
              <div style="white-space: nowrap; font-size: 0.85rem; font-weight: 500;">
                {{ $t(`staff.schedule.day.${dayOfWeek}`) }}
              </div>
              <div v-if="staffDetailScheduleMap[dayOfWeek] && staffDetailScheduleMap[dayOfWeek].length > 0"
                   class="row items-center" style="gap: .6rem; font-size: .85rem;">
                <div v-for="(range, rangeIndex) in staffDetailScheduleMap[dayOfWeek]" :key="rangeIndex">
                  {{ range.startTime }} ~ {{ range.endTime }}
                </div>
              </div>
              <div v-else style="opacity: .5; font-size: .8rem;">
                {{ $t('staff.schedule.empty') }}
              </div>
            </template>
          </div>
        </div>

        <div class="row q-mt-xl q-mb-md justify-center">
          <q-btn class="shadow-1 component-outline-btn-grow" no-caps unelevated @click="showStaffDetail = false">
            {{ $t('book_booking.staff_detail.close') }}
          </q-btn>
        </div>
      </q-card>
    </q-dialog>

    <cask-dialog-judgment v-model="showOperation"
                          :callback-method="isTrue => { showOperation = false; if (isTrue) toOpFunc() }"
                          :dialog-judgment-data="{ title: toOpTitle, content: toOpDesc, falseLabel: $t('book_booking.dialog.common.cancel'), trueLabel: $t('book_booking.dialog.common.confirm') }"
    />

    <!-- Booking Detail Dialog (shared, read-only) -->
    <cask-book-detail-dialog v-model="showBookDetail" :book="detailBook"/>

  </div>
</template>

<script setup>
import {AssignStrategyEnum, BookSourceEnum, BookStatusEnum} from "@/constants/enums/book.js";
import {onMounted, reactive, ref} from "vue";
import {notifyTopPositive, notifyTopWarning} from "@/utils/notification-tools.js";
import {useI18n} from 'vue-i18n'
import {date} from "quasar";
import CaskComplexTable from "@/ui/components/CaskComplexTable.vue";
import CaskDialogJudgment from "@/ui/components/CaskDialogJudgment.vue";
import CaskBookDetailDialog from "@/ui/components/CaskBookDetailDialog.vue";
import {tableBook, tableBookOperation} from "@/tables/book.js";
import {bookAssign, bookCancelAssign, bookCreate, bookDelete, bookList, bookUpdate} from "@/api/book.js";
import {staffDetail, staffListSimple} from "@/api/staff.js";
import {staffSkillListSimple} from "@/api/staff-skill.js";
import CaskDateTimePicker from "@/ui/components/CaskDateTimePicker.vue";

const selectName = ref("")
const selectPhone = ref("")
const selectStatus = ref(null)
const selectBookingTimeStart = ref("")
const selectBookingTimeEnd = ref("")
const statusOptions = ref(BookStatusEnum.toSelectForm())
const sourceOptions = ref(BookSourceEnum.toSelectForm())
const {t} = useI18n()

function clearSearch() {
  selectName.value = ""
  selectPhone.value = ""
  selectStatus.value = null
  selectBookingTimeStart.value = ""
  selectBookingTimeEnd.value = ""
}

// create/update
const showUpsert = ref(false)
const isNew = ref(false)
const upsertBookingTime = ref("")
const upsertName = ref("")
const upsertSkillIdList = ref([])
const upsertPhone = ref("")
const upsertMail = ref("")
const upsertPreferredStaffId = ref(null)
const upsertSource = ref(BookSourceEnum.WECHAT.code)
const upsertRemark = ref("")
const skillOptions = ref([])

const updateId = ref("")

function clearUpsertParam() {
  updateId.value = ""
  upsertBookingTime.value = ""
  upsertName.value = ""
  upsertSkillIdList.value = []
  upsertPhone.value = ""
  upsertMail.value = ""
  upsertPreferredStaffId.value = null
  upsertSource.value = BookSourceEnum.WECHAT.code
  upsertRemark.value = ""
}

function openAddBooking() {
  clearUpsertParam()
  // default booking time: 5 minutes from now
  upsertBookingTime.value = date.formatDate(Date.now() + 5 * 60 * 1000, 'YYYY-MM-DD HH:mm')
  isNew.value = true
  showUpsert.value = true
}

// assign
const showAssign = ref(false)
const assignBookId = ref("")
const assignBookName = ref("")
const assignStaffId = ref(null)
const staffSelectOptions = ref([])
const staffIdNameMap = ref({})

// booking detail (shared read-only dialog)
const showBookDetail = ref(false)
const detailBook = ref(null)

// staff detail (read-only)
const showStaffDetail = ref(false)
const staffDetailData = ref(null)
const dayOfWeekList = [1, 2, 3, 4, 5, 6, 7]
const staffDetailScheduleMap = reactive({1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []})

function minuteToTime(minute) {
  const safeMinute = Number(minute)
  if (Number.isNaN(safeMinute)) {
    return null
  }
  const clampMinute = Math.max(0, Math.min(1440, safeMinute))
  const hour = Math.floor(clampMinute / 60)
  const minutePart = clampMinute % 60
  return `${String(hour).padStart(2, '0')}:${String(minutePart).padStart(2, '0')}`
}

function openStaffDetail(staffId) {
  for (const dayOfWeek of dayOfWeekList) {
    staffDetailScheduleMap[dayOfWeek] = []
  }
  staffDetail(staffId).then(res => {
    if (!res || !res.data || !res.data.data) {
      return
    }
    staffDetailData.value = res.data.data
    for (const schedule of (staffDetailData.value.scheduleList || [])) {
      const dayOfWeek = Number(schedule.dayOfWeek)
      if (!dayOfWeekList.includes(dayOfWeek)) {
        continue
      }
      const startTime = minuteToTime(schedule.startMinute)
      const endTime = minuteToTime(schedule.endMinute)
      if (!startTime || !endTime) {
        continue
      }
      staffDetailScheduleMap[dayOfWeek].push({startTime, endTime})
    }
    showStaffDetail.value = true
  })
}

// op
const showOperation = ref(false)
const toOpId = ref("")
const toOpTitle = ref("")
const toOpDesc = ref("")
const toOpFunc = ref(null)

const tableData = ref([])
const tableDynamicData = ref(
    {
      inLoading: true,
      pageNo: 1,
      pageSize: 10,
      dataSum: 0,
    }
)

function upsertData() {
  if (!upsertBookingTime.value || !upsertName.value) {
    notifyTopWarning(t('validation.insufficient_parameters'))
    return;
  }

  if (!updateId.value && !isNew.value) {
    notifyTopWarning(t('validation.insufficient_parameters'))
    return;
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

  if (isNew.value) {
    bookCreate(body).then(res => {
      if (!res || !res.data) {
        return
      }
      clearUpsertParam()
      showUpsert.value = false
      selectData()
    })
  } else {
    bookUpdate(updateId.value, body).then(res => {
      if (!res || !res.data) {
        return
      }
      clearUpsertParam()
      showUpsert.value = false
      notifyTopPositive(t('book_booking.notify.update_success'))
      selectData()
    })
  }
}

// open the "config assignment" dialog, pre-filling the currently assigned staff (if any)
function openAssign(row) {
  assignBookId.value = row.id
  assignBookName.value = row.name
  assignStaffId.value = row.staffId
      ? (staffSelectOptions.value.find(o => o.value === row.staffId) || null)
      : null
  showAssign.value = true
}

// confirm config assignment: empty staff -> cancel assignment, otherwise assign
function assignData() {
  if (!assignBookId.value) {
    notifyTopWarning(t('validation.insufficient_parameters'))
    return
  }
  if (!assignStaffId.value) {
    bookCancelAssign(assignBookId.value).then(res => {
      if (!res || !res.data) {
        return
      }
      showAssign.value = false
      notifyTopPositive(t('book_booking.notify.cancel_assign_success'))
      selectData()
    })
    return
  }
  bookAssign(assignBookId.value, assignStaffId.value.value).then(res => {
    if (!res || !res.data) {
      return
    }
    showAssign.value = false
    notifyTopPositive(t('book_booking.notify.assign_success'))
    selectData()
  })
}

// copy an existing booking's data into the add dialog as a new booking
function copyBooking(row) {
  clearUpsertParam()
  upsertBookingTime.value = row.bookingTime || ''
  upsertName.value = row.name || ''
  upsertSkillIdList.value = (row.skillDtoList || []).map(s => s.id)
  upsertPhone.value = row.phone || ''
  upsertMail.value = row.mail || ''
  upsertPreferredStaffId.value = row.preferredStaffId || null
  upsertRemark.value = row.remark || ''
  upsertSource.value = row.source || BookSourceEnum.WECHAT.code
  isNew.value = true
  showUpsert.value = true
}

// whether the booking has started (now >= bookingTime); op time gates rely on this
function isStarted(bookingTime) {
  if (!bookingTime) {
    return false
  }
  const startDate = date.extractDate(bookingTime, 'YYYY-MM-DD HH:mm')
  if (!startDate || Number.isNaN(startDate.getTime())) {
    return false
  }
  return Date.now() >= startDate.getTime()
}

function deleteData() {
  if (!toOpId.value) {
    notifyTopWarning(t('validation.insufficient_parameters'))
  }
  bookDelete(toOpId.value).then(res => {
    if (!res || !res.data) {
      return
    }
    notifyTopPositive(t('notify.delete_success'))
    selectData()
  })
}

function selectData() {
  tableDynamicData.value.inLoading = true
  const param = {
    name: selectName.value, phone: selectPhone.value,
    status: selectStatus.value ? selectStatus.value.value : null,
    bookingTimeStartStr: selectBookingTimeStart.value ? selectBookingTimeStart.value : null,
    bookingTimeEndStr: selectBookingTimeEnd.value ? selectBookingTimeEnd.value : null,
    pageNo: tableDynamicData.value.pageNo, pageSize: tableDynamicData.value.pageSize,
  }

  bookList(param).then(res => {
    if (!res || !res.data || !res.data.data) {
      tableDynamicData.value.inLoading = false
      return
    }
    const thisData = res.data.data.records
    tableDynamicData.value.dataSum = res.data.data.total
    thisData.forEach(data => {
      const statusEnum = BookStatusEnum.fromCode(data.status)
      data.statusName = statusEnum ? statusEnum.name : '未知'
      data.statusNameWebColorName = statusEnum ? statusEnum.color : 'rgb(128, 128, 128)'
      // op flags (time gate: config-assign only allowed before booking starts)
      const notStarted = !isStarted(data.bookingTime)
      data.detailOp = true
      data.updateOp = data.status === 0 && notStarted
      // config assignment (assign / reassign / cancel-assign) on PRE or WORK before start
      data.configAssignOp = (data.status === 0 || data.status === 1) && notStarted
      data.copyOp = true
      // delete allowed on PRE/WORK/IN_PROGRESS/DONE; not on EXPIRED(4)/CANCEL(-1)
      data.deleteOp = data.status === 0 || data.status === 1 || data.status === 2 || data.status === 3
      // booking projects (skill names) for MULTI_ROW column
      data.bookProjectNames = (data.skillDtoList || []).map(item => item.name).join(',')
      // creator display: prefer name, fall back to id
      data.createUserName = data.createUserName || data.createUserId
      // booking source name
      const sourceEnum = BookSourceEnum.fromCode(data.source)
      data.sourceName = sourceEnum ? sourceEnum.name : ''
      // preferred staff name from staff list lookup
      data.preferredStaffName = data.preferredStaffId
          ? (staffIdNameMap.value[data.preferredStaffId] || '') : ''
    });
    tableData.value = thisData
    tableDynamicData.value.inLoading = false
  })
}

function loadStaffList() {
  // Load staff list for assign dialog & preferred-staff name lookup
  return staffListSimple().then(res => {
    if (!res || !res.data || !res.data.data) {
      return
    }
    staffSelectOptions.value = res.data.data.map(staff => ({
      label: `${staff.name} ( ${staff.phone || ' - '} )`,
      value: staff.id,
    }))
    const nameMap = {}
    res.data.data.forEach(staff => {
      nameMap[staff.id] = staff.name
    })
    staffIdNameMap.value = nameMap
  })
}

function loadSkillList() {
  staffSkillListSimple().then(res => {
    if (!res || !res.data || !res.data.data) {
      return
    }
    skillOptions.value = res.data.data.map(skill => ({
      label: skill.name,
      value: skill.id,
    }))
  })
}

onMounted(() => {
  loadSkillList()
  // load staff first so the booking list can resolve preferred-staff names
  loadStaffList().then(() => selectData())
})
</script>

<style scoped lang="scss">

</style>
