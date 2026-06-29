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

    </div>

    <div class="row">
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push unelevated @click="selectData">
        {{ $t('book_booking.button.query') }}
      </q-btn>
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push
             unelevated
             @click="clearUpsertParam(); isNew = true; showUpsert = true">
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
                        @operationClick="(name, row) => {
                            if(name === 'update') {
                              clearUpsertParam();
                              updateId = row.id
                              upsertBookingTime = row.bookingTime
                              upsertName = row.name
                              upsertBookProjectName = row.bookProjectName || []
                              upsertPhone = row.phone
                              upsertMail = row.mail
                              upsertPreferredStaffId = row.preferredStaffId || ''
                              upsertAssignStrategy = row.assignStrategy || null
                              upsertBookingUrl = row.bookingUrl
                              isNew = false;
                              showUpsert = true
                            }
                            if(name === 'assign') {
                              assignBookId = row.id
                              assignBookName = row.name
                              showAssign = true
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
          <q-input v-model="upsertBookingTime" class="component-outline-input-grow" dense outlined
                   :placeholder="t('book_booking.placeholder.bookingTime')"/>

          <h6 class="cask-litter-title-asterisk" style="white-space: nowrap;">{{ $t('book_booking.upsert.field.name') }}&nbsp;:</h6>
          <q-input v-model="upsertName" class="component-outline-input-grow" dense outlined
                   :placeholder="t('book_booking.placeholder.name')"/>

          <h6 class="cask-litter-title-asterisk" style="white-space: nowrap;">{{ $t('book_booking.upsert.field.bookProjectName') }}&nbsp;:</h6>
          <q-input v-model="upsertBookProjectNameStr" class="component-outline-input-grow" dense outlined
                   placeholder="haircut, coloring"/>

          <h6 style="white-space: nowrap; margin-left: 12px!important;">{{ $t('book_booking.upsert.field.phone') }}&nbsp;:</h6>
          <q-input v-model="upsertPhone" class="component-outline-input-grow" dense outlined
                   :placeholder="t('book_booking.placeholder.phone')"/>

          <h6 style="white-space: nowrap; margin-left: 12px!important;">{{ $t('book_booking.upsert.field.mail') }}&nbsp;:</h6>
          <q-input v-model="upsertMail" class="component-outline-input-grow" dense outlined
                   placeholder="example@mail.com"/>

          <h6 style="white-space: nowrap; margin-left: 12px!important;">{{ $t('book_booking.upsert.field.preferredStaffId') }}&nbsp;:</h6>
          <q-input v-model="upsertPreferredStaffId" class="component-outline-input-grow" dense outlined
                   placeholder="staff id"/>

          <h6 style="white-space: nowrap; margin-left: 12px!important;">{{ $t('book_booking.upsert.field.assignStrategy') }}&nbsp;:</h6>
          <q-select v-model="upsertAssignStrategy" :menu-offset="[0, 5]" :options="assignStrategyOptions"
                    class="component-outline-input-grow"
                    clearable
                    dropdown-icon="fa-solid fa-caret-down" menu-anchor="bottom start"
                    outlined popup-content-class="component-extra-card-std">
          </q-select>

          <h6 style="white-space: nowrap; margin-left: 12px!important;">{{ $t('book_booking.upsert.field.bookingUrl') }}&nbsp;:</h6>
          <q-input v-model="upsertBookingUrl" class="component-outline-input-grow" dense outlined
                   :placeholder="t('book_booking.placeholder.bookingUrl')"/>

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
                    dropdown-icon="fa-solid fa-caret-down" menu-anchor="bottom start"
                    outlined popup-content-class="component-extra-card-std">
          </q-select>
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

    <cask-dialog-judgment v-model="showOperation"
                          :callback-method="isTrue => { showOperation = false; if (isTrue) toOpFunc() }"
                          :dialog-judgment-data="{ title: toOpTitle, content: toOpDesc, falseLabel: $t('book_booking.dialog.common.cancel'), trueLabel: $t('book_booking.dialog.common.confirm') }"
    />

  </div>
</template>

<script setup>
import {BookStatusEnum, AssignStrategyEnum} from "@/constants/enums/book.js";
import {onMounted, ref} from "vue";
import {notifyTopPositive, notifyTopWarning} from "@/utils/notification-tools.js";
import {useI18n} from 'vue-i18n'
import CaskComplexTable from "@/ui/components/CaskComplexTable.vue";
import CaskDialogJudgment from "@/ui/components/CaskDialogJudgment.vue";
import {tableBook, tableBookOperation} from "@/tables/book.js";
import {bookCreate, bookDelete, bookList, bookUpdate, bookAssign} from "@/api/book.js";
import {staffList} from "@/api/staff.js";

const selectName = ref("")
const selectPhone = ref("")
const selectStatus = ref(null)
const statusOptions = ref(BookStatusEnum.toSelectForm())
const assignStrategyOptions = ref(AssignStrategyEnum.toSelectForm())
const {t} = useI18n()

function clearSearch() {
  selectName.value = ""
  selectPhone.value = ""
  selectStatus.value = null
}

// create/update
const showUpsert = ref(false)
const isNew = ref(false)
const upsertBookingTime = ref("")
const upsertName = ref("")
const upsertBookProjectName = ref([])
const upsertBookProjectNameStr = ref("")
const upsertPhone = ref("")
const upsertMail = ref("")
const upsertPreferredStaffId = ref("")
const upsertAssignStrategy = ref(null)
const upsertBookingUrl = ref("")

const updateId = ref("")

function clearUpsertParam() {
  updateId.value = ""
  upsertBookingTime.value = ""
  upsertName.value = ""
  upsertBookProjectName.value = []
  upsertBookProjectNameStr.value = ""
  upsertPhone.value = ""
  upsertMail.value = ""
  upsertPreferredStaffId.value = ""
  upsertAssignStrategy.value = null
  upsertBookingUrl.value = ""
}

// assign
const showAssign = ref(false)
const assignBookId = ref("")
const assignBookName = ref("")
const assignStaffId = ref(null)
const staffSelectOptions = ref([])

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

  // parse bookProjectName from comma-separated string
  let projectNames = []
  if (upsertBookProjectNameStr.value) {
    projectNames = upsertBookProjectNameStr.value.split(',').map(s => s.trim()).filter(s => s)
  }

  const body = {
    bookTimeStr: upsertBookingTime.value,
    name: upsertName.value,
    bookProjectName: projectNames,
    phone: upsertPhone.value,
    mail: upsertMail.value,
    preferredStaffId: upsertPreferredStaffId.value,
    assignStrategy: upsertAssignStrategy.value ? upsertAssignStrategy.value.value : null,
    bookingUrl: upsertBookingUrl.value,
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

function assignData() {
  if (!assignBookId.value || !assignStaffId.value) {
    notifyTopWarning(t('validation.insufficient_parameters'))
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
      // op flags
      data.updateOp = true
      data.assignOp = data.status === 0
      data.deleteOp = data.status !== -1
      // handle bookProjectName
      if (data.bookProjectName && Array.isArray(data.bookProjectName)) {
        data.bookProjectNameDisplay = data.bookProjectName.join(',')
      }
      // handle skillDtoList for display
      if (data.skillDtoList && data.skillDtoList.length > 0) {
        data.skills = data.skillDtoList.map(item => item.name).join(',')
      }
    });
    tableData.value = thisData
    tableDynamicData.value.inLoading = false
  })
}

function loadStaffList() {
  // Load staff list for assign dialog
  staffList({pageNo: 1, pageSize: 9999}).then(res => {
    if (!res || !res.data || !res.data.data) {
      return
    }
    staffSelectOptions.value = res.data.data.records.map(staff => ({
      label: `${staff.name} (${staff.phone || '无电话'})`,
      value: staff.id,
    }))
  })
}

onMounted(() => {
  selectData()
  loadStaffList()
})
</script>

<style scoped lang="scss">

</style>
