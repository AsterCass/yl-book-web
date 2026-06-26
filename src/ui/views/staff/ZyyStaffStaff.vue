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

      <div class="q-ml-md">
        <h6>
          {{ $t('staff.label.status') }}&nbsp;:
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
                              upsertPhone = row.phone
                              upsertPriority = row.priority
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
                            selectData()
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

          <h6 style="white-space: nowrap; margin-left: 12px!important;">{{ $t('staff.upsert.field.phone') }}&nbsp;:</h6>
          <q-input v-model="upsertPhone" class="component-outline-input-grow" dense outlined
                   :placeholder="t('staff.placeholder.phone')"/>

          <h6 style="white-space: nowrap; margin-left: 12px!important;">{{ $t('staff.upsert.field.priority') }}&nbsp;:</h6>
          <q-input v-model="upsertPriority" class="component-outline-input-grow" dense outlined
                   mask="###" :placeholder="t('staff.placeholder.priority')"/>

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
import {CommonStatusEnum} from "@/constants/enums/common.js";
import {onMounted, reactive, ref} from "vue";
import {notifyTopPositive, notifyTopWarning} from "@/utils/notification-tools.js";
import {useI18n} from 'vue-i18n'
import CaskComplexTable from "@/ui/components/CaskComplexTable.vue";
import CaskDialogJudgment from "@/ui/components/CaskDialogJudgment.vue";
import {tableStaff, tableStaffOperation} from "@/tables/staff.js";
import {staffCreate, staffDelete, staffList, staffUpdate, staffUpdateSkill} from "@/api/staff.js";
import {staffSkillList} from "@/api/staff-skill.js";


const selectId = ref("")
const selectName = ref("")
const selectPhone = ref("")
const selectStatus = ref(null)
const statusOptions = ref(CommonStatusEnum.toSelectForm())
const {t} = useI18n()

function clearSearch() {
  selectId.value = ""
  selectName.value = ""
  selectPhone.value = ""
  selectStatus.value = null
}

// create/update
const showUpsert = ref(false)
const isNew = ref(false)
const upsertName = ref("")
const upsertPhone = ref("")
const upsertPriority = ref(null)

const updateId = ref("")

function clearUpsertParam() {
  upsertName.value = ""
  upsertPhone.value = ""
  upsertPriority.value = null
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

  const body = {
    name: upsertName.value,
    phone: upsertPhone.value,
    priority: upsertPriority.value,
  }

  if (isNew.value) {
    staffCreate(body).then(res => {
      if (!res || !res.data) {
        return
      }
      clearUpsertParam()
      showUpsert.value = false
      selectData()
    })
  } else {
    staffUpdate(updateId.value, body).then(res => {
      if (!res || !res.data) {
        return
      }
      clearUpsertParam()
      showUpsert.value = false
      notifyTopPositive(t('staff.notify.update_success'))
      selectData()
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
    selectData()
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
    selectData()
  })
}

function selectData() {
  tableDynamicData.value.inLoading = true
  const param = {
    id: selectId.value, name: selectName.value, phone: selectPhone.value,
    status: selectStatus.value ? selectStatus.value.value : null,
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
      const statusEnum = CommonStatusEnum.fromCode(data.status)
      data.statusName = statusEnum.name;
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
      data.statusNameWebColorName = statusEnum.color
    });
    tableData.value = thisData
    tableDynamicData.value.inLoading = false
  })
}

function getAllSkills() {
  // fetch a large page to get all skills for assigning
  staffSkillList({pageNo: 1, pageSize: 9999}).then(res => {
    if (!res || !res.data || !res.data.data) {
      return
    }
    res.data.data.records.forEach(skill => {
      staffSkillMap[skill.id] = false
    })
    allSkillList.value = res.data.data.records
  })
}

onMounted(() => {
  selectData()
  getAllSkills()
})
</script>

<style scoped lang="scss">



</style>