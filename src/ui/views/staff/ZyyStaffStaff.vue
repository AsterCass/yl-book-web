<template>
  <div class="full-width">
    <div class="row items-center">

      <div class="q-ml-md">
        <h6>
          {{ $t('staff.label.id') }}&nbsp;:
        </h6>
      </div>
      <q-input v-model="selectId" class="q-ma-md component-outline-input-std" dense outlined
               :placeholder="t('staff.placeholder.id')"
               tabindex="0">
      </q-input>

      <div class="q-ml-md">
        <h6>
          {{ $t('staff.label.name') }}&nbsp;:
        </h6>
      </div>
      <q-input v-model="selectName" class="q-ma-md component-outline-input-std" dense outlined
               :placeholder="t('staff.placeholder.name')"
               tabindex="0">
      </q-input>

      <div class="q-ml-md">
        <h6>
          {{ $t('staff.label.phone') }}&nbsp;:
        </h6>
      </div>
      <q-input v-model="selectPhone" class="q-ma-md component-outline-input-std" dense outlined
               :placeholder="t('staff.placeholder.phone')"
               tabindex="0">
      </q-input>

    </div>

    <div class="row">
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push unelevated @click="selectData()">
        {{ $t('staff.button.query') }}
      </q-btn>
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push
             unelevated
             @click="clearUpsertParam(); isNew = true; showUpsert = true">
        {{ $t('staff.button.add') }}
      </q-btn>
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push
             unelevated @click="()=> {clearSearch(); selectData();}">
        {{ $t('staff.button.clear') }}
      </q-btn>
    </div>

    <cask-complex-table :custom-table-operation="tableStaffOperation" :table-base-info="tableStaff"
                        :table-data="tableData"
                        :table-dynamic-data="tableDynamicData"
                        class="full-width"
                        style="padding: 2rem 5rem 0 0.5rem"
                        @operationClick="(name, row) => {
                            if(name === 'update') {
                              clearUpsertParam();
                              updateId = row.id
                              upsertName = row.name
                              upsertExternalName = row.externalName
                              upsertPhone = row.phone
                              initScheduleParam(row.scheduleList || row.scheduleDtoList || row.staffScheduleList || [])
                              isNew = false;
                              showUpsert = true
                            }
                            if(name === 'updateSkill') {
                              updateId = row.id
                              clearStaffSkill()
                              // mark existing skills
                              if (row.skillDtoList && row.skillDtoList.length > 0) {
                                for(const s of row.skillDtoList) {
                                  if (s.id in staffSkillMap) {
                                    staffSkillMap[s.id] = true
                                  }
                                }
                              }
                              showStaffSkill = true
                            }
                            if(name === 'delete') {
                              toOpId = row.id
                              toOpTitle = $t('staff.dialog.delete.title')
                              toOpDesc = $t('staff.dialog.delete.content', { name: row.name })
                              toOpFunc = deleteData
                              showOperation = true
                            }
                          }"
                        @toNewPage="(pageObj) => {
                            tableDynamicData.pageNo = pageObj.pageNo
                            tableDynamicData.pageSize = pageObj.pageSize
                            selectData(true)
                          }"
    />

    <q-dialog :model-value="showUpsert" transition-hide="fade" no-backdrop-dismiss no-shake
              transition-show="fade" @hide="showUpsert = false">
      <q-card class="component-cask-dialog-judgement-std" style="max-width: 2000px !important">
        <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
          {{ isNew ? $t('staff.upsert.title_add') : $t('staff.upsert.title_update') }}
        </h5>

        <q-separator class="component-separator-base" inset spaced="1rem"/>

        <div class="q-ma-md"
             style="display: grid; grid-template-columns: max-content 1fr; gap: 1.2rem; align-items: center;">

          <h6 class="cask-litter-title-asterisk" style="white-space: nowrap;">{{ $t('staff.upsert.field.name') }}&nbsp;:</h6>
          <q-input v-model="upsertName" class="component-outline-input-grow" dense outlined
                   :placeholder="t('staff.placeholder.name')"/>

          <h6 style="white-space: nowrap; margin-left: 12px!important;">{{ $t('staff.upsert.field.external_name') }}&nbsp;:</h6>
          <q-input v-model="upsertExternalName" class="component-outline-input-grow" dense outlined
                   :placeholder="t('staff.placeholder.external_name')"/>

          <h6 style="white-space: nowrap; margin-left: 12px!important;">{{ $t('staff.upsert.field.phone') }}&nbsp;:</h6>
          <q-input v-model="upsertPhone" class="component-outline-input-grow" dense outlined
                   :placeholder="t('staff.placeholder.phone')"/>

        </div>

        <div class="q-mx-md q-mb-md">
          <h6 class="cask-litter-title-asterisk" style="white-space: nowrap;">
            {{ $t('staff.schedule.title') }}
          </h6>
          <div class="q-mt-sm q-ml-md" style="opacity: 0.5; width: 25rem; font-size: 0.85rem">
            {{ $t('staff.schedule.note') }}
          </div>

          <div v-for="dayOfWeek in dayOfWeekList" :key="dayOfWeek" class="q-mt-md q-ml-md">
            <div class="row items-center">
              <div style="min-width: 7rem; font-size: 0.85rem; font-weight: 500;">
                {{ $t(`staff.schedule.day.${dayOfWeek}`) }}
              </div>
              <q-btn no-caps unelevated  class="component-none-btn-mini-grow"
                     @click="addScheduleRange(dayOfWeek)">
                <div class="row items-center justify-center">
                  <q-icon name="fa-solid fa-plus" size="0.9rem"/>
                  <div class="q-ml-xs" style="font-size: 0.85rem">
                    {{ $t('staff.schedule.add') }}
                  </div>
                </div>
              </q-btn>
            </div>

            <div v-if="upsertScheduleMap[dayOfWeek].length === 0" class="q-mt-xs"
                 style="opacity: .5; font-size: .75rem;">
              {{ $t('staff.schedule.empty') }}
            </div>

            <div v-for="(range, rangeIndex) in upsertScheduleMap[dayOfWeek]" :key="`${dayOfWeek}-${rangeIndex}`"
                 class="row items-center q-mt-xs" style="gap: .5rem;">
              <cask-time-picker v-model="range.startTime" :placeholder="t('staff.schedule.start')"/>
              <div>~</div>
              <cask-time-picker v-model="range.endTime" :placeholder="t('staff.schedule.end')"/>
              <q-btn no-caps unelevated class="component-none-btn-grow"
                     @click="removeScheduleRange(dayOfWeek, rangeIndex)">
                <div class="row items-center">
                  <q-icon name="fa-solid fa-trash" size="1rem"/>
                </div>
              </q-btn>

            </div>
          </div>
        </div>

        <div class="row q-mt-xl q-mb-md justify-evenly">
          <q-btn class="shadow-1 component-full-btn-grow" no-caps unelevated @click="upsertData">
            {{ isNew ? $t('staff.upsert.save_add') : $t('staff.upsert.save_update') }}
          </q-btn>

          <q-btn class="shadow-1 component-outline-btn-grow" no-caps unelevated @click="showUpsert = false">
            {{ $t('main_setting_cancel') }}
          </q-btn>

        </div>
      </q-card>
    </q-dialog>

    <q-dialog :model-value="showStaffSkill" @hide="showStaffSkill = false"
              transition-show="fade" transition-hide="fade">
      <q-card class="component-cask-dialog-judgement-std" style="max-width: 2000px !important">
        <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
          {{ $t('staff.skill_assign.title') }}
        </h5>

        <q-separator class="component-separator-base" inset spaced="1rem"/>

        <div class="row q-px-sm" style="padding-top: .1rem; width: 25rem">
          <div v-for="skillItem in allSkillList" :key="skillItem.id">
            <q-checkbox class="q-ma-xs" color="grey-10" size="37px" v-model="staffSkillMap[skillItem.id]"
                        :label="skillItem.name"/>
          </div>

        </div>

        <div class="row q-mt-xl q-mb-md justify-center">
          <q-btn no-caps unelevated class="shadow-1 component-full-btn-grow" @click="updateStaffSkill">
            {{ $t('staff.button.save') }}
          </q-btn>
        </div>
      </q-card>
    </q-dialog>

    <cask-dialog-judgment v-model="showOperation"
                          :callback-method="isTrue => { showOperation = false; if (isTrue) toOpFunc() }"
                          :dialog-judgment-data="{ title: toOpTitle, content: toOpDesc, falseLabel: $t('staff.dialog.common.cancel'), trueLabel: $t('staff.dialog.common.confirm') }"
    />

  </div>
</template>

<script setup>
import {onMounted, reactive, ref} from "vue";
import {notifyTopPositive, notifyTopWarning} from "@/utils/notification-tools.js";
import {useI18n} from 'vue-i18n'
import CaskComplexTable from "@/ui/components/CaskComplexTable.vue";
import CaskDialogJudgment from "@/ui/components/CaskDialogJudgment.vue";
import CaskTimePicker from "@/ui/components/CaskTimePicker.vue";
import {tableStaff, tableStaffOperation} from "@/tables/staff.js";
import {staffCreate, staffDelete, staffList, staffUpdate, staffUpdateSkill} from "@/api/staff.js";
import {staffSkillListSimple} from "@/api/staff-skill.js";


const selectId = ref("")
const selectName = ref("")
const selectPhone = ref("")
const {t} = useI18n()

function clearSearch() {
  selectId.value = ""
  selectName.value = ""
  selectPhone.value = ""
}

// create/update
const showUpsert = ref(false)
const isNew = ref(false)
const upsertName = ref("")
const upsertExternalName = ref("")
const upsertPhone = ref("")
const dayOfWeekList = [1, 2, 3, 4, 5, 6, 7]
const upsertScheduleMap = reactive({
  1: [],
  2: [],
  3: [],
  4: [],
  5: [],
  6: [],
  7: [],
})

const updateId = ref("")

function clearUpsertParam() {
  updateId.value = ""
  upsertName.value = ""
  upsertExternalName.value = ""
  upsertPhone.value = ""
  clearScheduleParam()
}

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

function timeToMinute(timeStr) {
  if (!timeStr || typeof timeStr !== 'string' || timeStr.length < 5) {
    return null
  }
  const timeParts = timeStr.split(':')
  if (timeParts.length !== 2) {
    return null
  }
  const hour = Number(timeParts[0])
  const minute = Number(timeParts[1])
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null
  }
  if (hour < 0 || hour > 24 || minute < 0 || minute > 59) {
    return null
  }
  if (hour === 24 && minute > 0) {
    return null
  }
  return hour * 60 + minute
}

function clearScheduleParam() {
  for (const dayOfWeek of dayOfWeekList) {
    upsertScheduleMap[dayOfWeek] = []
  }
}

function addScheduleRange(dayOfWeek) {
  if (!dayOfWeekList.includes(dayOfWeek)) {
    return
  }
  upsertScheduleMap[dayOfWeek].push({
    startTime: '09:00',
    endTime: '18:00',
  })
}

function removeScheduleRange(dayOfWeek, rangeIndex) {
  if (!dayOfWeekList.includes(dayOfWeek)) {
    return
  }
  upsertScheduleMap[dayOfWeek].splice(rangeIndex, 1)
}

function initScheduleParam(scheduleList) {
  clearScheduleParam()
  if (!scheduleList || !Array.isArray(scheduleList)) {
    return
  }
  for (const schedule of scheduleList) {
    const dayOfWeek = Number(schedule.dayOfWeek)
    if (!dayOfWeekList.includes(dayOfWeek)) {
      continue
    }
    const startTime = minuteToTime(schedule.startMinute)
    const endTime = minuteToTime(schedule.endMinute)
    if (!startTime || !endTime) {
      continue
    }
    upsertScheduleMap[dayOfWeek].push({
      startTime: startTime,
      endTime: endTime,
    })
  }
}

function buildScheduleListForSubmit() {
  const scheduleList = []
  for (const dayOfWeek of dayOfWeekList) {
    for (const range of upsertScheduleMap[dayOfWeek]) {
      const startMinute = timeToMinute(range.startTime)
      const endMinute = timeToMinute(range.endTime)
      if (startMinute === null || endMinute === null) {
        notifyTopWarning(t('staff.schedule.notify.invalid_time'))
        return null
      }
      if (startMinute >= endMinute) {
        notifyTopWarning(t('staff.schedule.notify.invalid_range'))
        return null
      }
      scheduleList.push({
        dayOfWeek: dayOfWeek,
        startMinute: startMinute,
        endMinute: endMinute,
      })
    }
  }
  return scheduleList
}

// assign skill
const showStaffSkill = ref(false)
const allSkillList = ref([])
const staffSkillMap = reactive({})

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
  if (!upsertName.value) {
    notifyTopWarning(t('validation.insufficient_parameters'))
    return;
  }

  if (!updateId.value && !isNew.value) {
    notifyTopWarning(t('validation.insufficient_parameters'))
    return;
  }

  const scheduleList = buildScheduleListForSubmit()
  if (scheduleList === null) {
    return;
  }

  const body = {
    name: upsertName.value,
    externalName: upsertExternalName.value,
    phone: upsertPhone.value,
    priority: 1,
    scheduleList: scheduleList,
  }

  if (isNew.value) {
    staffCreate(body).then(res => {
      if (!res || !res.data) {
        return
      }
      clearUpsertParam()
      showUpsert.value = false
      selectData(true)
    })
  } else {
    staffUpdate(updateId.value, body).then(res => {
      if (!res || !res.data) {
        return
      }
      clearUpsertParam()
      showUpsert.value = false
      notifyTopPositive(t('staff.notify.update_success'))
      selectData(true)
    })
  }
}


function clearStaffSkill() {
  for (const key in staffSkillMap) {
    staffSkillMap[key] = false
  }
}

function updateStaffSkill() {
  if (!updateId.value) {
    notifyTopWarning(t('validation.insufficient_parameters'))
    return;
  }

  const body = {
    skillIdList: []
  }

  for (const key in staffSkillMap) {
    if (staffSkillMap[key]) {
      body.skillIdList.push(key)
    }
  }

  staffUpdateSkill(updateId.value, body).then(res => {
    if (!res || !res.data) {
      return
    }
    showStaffSkill.value = false
    notifyTopPositive(t('staff.notify.skill_assign_success'))
    selectData(true)
  })

}

function deleteData() {
  if (!toOpId.value) {
    notifyTopWarning(t('validation.insufficient_parameters'))
  }
  staffDelete(toOpId.value).then(res => {
    if (!res || !res.data) {
      return
    }
    notifyTopPositive(t('notify.delete_success'))
    selectData(true)
  })
}

// 默认从第一页开始查询；翻页、行操作后刷新时传 keepPage = true 保持当前页
function selectData(keepPage = false) {
  if (!keepPage) {
    tableDynamicData.value.pageNo = 1
  }
  tableDynamicData.value.inLoading = true
  const param = {
    id: selectId.value, name: selectName.value, phone: selectPhone.value,
    pageNo: tableDynamicData.value.pageNo, pageSize: tableDynamicData.value.pageSize,
  }

  staffList(param).then(res => {
    if (!res || !res.data || !res.data.data) {
      tableDynamicData.value.inLoading = false
      return
    }
    const thisData = res.data.data.records
    tableDynamicData.value.dataSum = res.data.data.total
    thisData.forEach(data => {
      data.createUserName = data.createUserName || data.createUserId
      data.deleteOp = true
      data.updateOp = true
      // show skill op
      data.skillOp = true
      data.skillDtoList = data.skillDtoList || []
      data.skills = ""
      if (data.skillDtoList && data.skillDtoList.length > 0) {
        data.simpleSkillList = data.skillDtoList.map(item => item.id)
        for (const thisSkill of data.skillDtoList) {
          data.skills += thisSkill.name + ","
        }
        data.skills = data.skills.slice(0, -1)
      } else {
        data.simpleSkillList = []
      }
    });
    tableData.value = thisData
    tableDynamicData.value.inLoading = false
  })
}

function getAllSkills() {
  // fetch a large page to get all skills for assigning
  staffSkillListSimple().then(res => {
    if (!res || !res.data || !res.data.data) {
      return
    }
    res.data.data.forEach(skill => {
      staffSkillMap[skill.id] = false
    })
    allSkillList.value = res.data.data
  })
}

onMounted(() => {
  selectData()
  getAllSkills()
})
</script>

<style scoped lang="scss">



</style>