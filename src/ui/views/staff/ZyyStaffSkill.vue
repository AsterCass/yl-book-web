<template>
  <div class="full-width">
    <div class="row items-center">

      <div class="q-ml-md">
        <h6>
          {{ $t('staff_skill.label.id') }}&nbsp;:
        </h6>
      </div>
      <q-input v-model="selectId" class="q-ma-md component-outline-input-std" dense outlined
               :placeholder="t('staff_skill.placeholder.id')"
               tabindex="0">
      </q-input>

      <div class="q-ml-md">
        <h6>
          {{ $t('staff_skill.label.name') }}&nbsp;:
        </h6>
      </div>
      <q-input v-model="selectName" class="q-ma-md component-outline-input-std" dense outlined
               :placeholder="t('staff_skill.placeholder.name')"
               tabindex="0">
      </q-input>

      <div class="q-ml-md">
        <h6>
          {{ $t('staff_skill.label.code') }}&nbsp;:
        </h6>
      </div>
      <q-input v-model="selectCode" class="q-ma-md component-outline-input-std" dense outlined
               :placeholder="t('staff_skill.placeholder.code')"
               tabindex="0">
      </q-input>

      <div class="q-ml-md">
        <h6>
          {{ $t('staff_skill.label.status') }}&nbsp;:
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
        {{ $t('staff_skill.button.query') }}
      </q-btn>
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push
             unelevated
             @click="clearUpsertParam(); isNew = true; showUpsert = true">
        {{ $t('staff_skill.button.add') }}
      </q-btn>
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push
             unelevated @click="()=> {clearSearch(); selectData();}">
        {{ $t('staff_skill.button.clear') }}
      </q-btn>
    </div>

    <cask-complex-table :custom-table-operation="tableStaffSkillOperation" :table-base-info="tableStaffSkill"
                        :table-data="tableData"
                        :table-dynamic-data="tableDynamicData"
                        class="full-width"
                        style="padding: 2rem 5rem 0 0.5rem"
                        @operationClick="(name, row) => {
                            if(name === 'update') {
                              clearUpsertParam();
                              updateId = row.id
                              upsertName = row.name
                              upsertCode = row.code
                              upsertDesc = row.description
                              upsertConsumeMinutes = row.consumeMinutes
                              upsertAliasList = row.aliasList
                              isNew = false;
                              showUpsert = true
                            }
                            if(name === 'delete') {
                              toOpId = row.id
                              toOpTitle = $t('staff_skill.dialog.delete.title')
                              toOpDesc = $t('staff_skill.dialog.delete.content', { name: row.name })
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
      <q-card class="component-cask-dialog-judgement-std"
              style="max-width: 2000px !important; min-width: 500px!important;">
        <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
          {{ isNew ? $t('staff_skill.upsert.title_add') : $t('staff_skill.upsert.title_update') }}
        </h5>

        <q-separator class="component-separator-base" inset spaced="1rem"/>

        <div style="padding-top: .1rem">

        </div>

        <div class="q-ma-md"
             style="display: grid; grid-template-columns: max-content 1fr; gap: 1.2rem; align-items: center;">

          <h6 class="cask-litter-title-asterisk" style="white-space: nowrap;">{{ $t('staff_skill.upsert.field.name') }}&nbsp;:</h6>
          <q-input v-model="upsertName" class="component-outline-input-grow" dense outlined
                   :placeholder="t('staff_skill.placeholder.name')"/>


          <h6 class="cask-litter-title-asterisk" style="white-space: nowrap;">{{
              $t('staff_skill.upsert.field.code')
            }}&nbsp;:</h6>
          <q-input v-model="upsertCode" class="component-outline-input-grow" dense outlined
                   :placeholder="t('staff_skill.placeholder.code')"/>


          <h6 style="white-space: nowrap; margin-left: 12px!important;">{{
              $t('staff_skill.upsert.field.desc')
            }}&nbsp;:</h6>
          <q-input v-model="upsertDesc" class="component-outline-input-grow" dense outlined
                   :placeholder="t('staff_skill.placeholder.desc')"/>

          <h6 class="cask-litter-title-asterisk" style="white-space: nowrap;">{{
              $t('staff_skill.upsert.field.consumeMinutes')
            }}&nbsp;:</h6>
          <q-input v-model="upsertConsumeMinutes" class="component-outline-input-grow" dense outlined
                   mask="###"
                   :placeholder="t('staff_skill.placeholder.consumeMinutes')"/>


          <h6 style="white-space: nowrap; margin-left: 12px!important; align-self: flex-start;">
            {{
              $t('staff_skill.upsert.field.aliasList')
            }}&nbsp;:</h6>
          <div>
            <div class="q-mb-xs" style="opacity: 0.5; font-size: 0.85rem">
              {{ $t('staff_skill.upsert.alias_note') }}
            </div>
            <q-btn no-caps unelevated class="component-none-btn-mini-grow"
                   @click="addAliasItem">
              <div class="row items-center justify-center">
                <q-icon name="fa-solid fa-plus" size="0.9rem"/>
                <div class="q-ml-xs" style="font-size: 0.85rem">
                  {{ $t('staff_skill.upsert.alias_add') }}
                </div>
              </div>
            </q-btn>

            <div v-if="upsertAliasList.length === 0" class="q-mt-xs" style="opacity: .5; font-size: .75rem;">
              {{ $t('staff_skill.upsert.alias_empty') }}
            </div>

            <div v-for="(aliasValue, aliasIndex) in upsertAliasList" :key="`alias-${aliasIndex}-${aliasValue}`"
                 class="row items-center q-mt-xs" style="gap: .5rem;">
              <q-input v-model="upsertAliasList[aliasIndex]" class="component-outline-input-grow" dense outlined
                       :placeholder="t('staff_skill.placeholder.alias')"/>
              <q-btn no-caps unelevated class="component-none-btn-grow" @click="removeAliasItem(aliasIndex)">
                <div class="row items-center">
                  <q-icon name="fa-solid fa-trash" size="1rem"/>
                </div>
              </q-btn>
            </div>
          </div>


        </div>

        <div class="row q-mt-xl q-mb-md justify-evenly">
          <q-btn class="shadow-1 component-full-btn-grow" no-caps unelevated @click="upsertData">
            {{ isNew ? $t('staff_skill.upsert.save_add') : $t('staff_skill.upsert.save_update') }}
          </q-btn>

          <q-btn class="shadow-1 component-outline-btn-grow" no-caps unelevated @click="showUpsert = false">
            {{ $t('main_setting_cancel') }}
          </q-btn>

        </div>
      </q-card>
    </q-dialog>


    <cask-dialog-judgment v-model="showOperation"
                          :callback-method="isTrue => { showOperation = false; if (isTrue) toOpFunc() }"
                          :dialog-judgment-data="{ title: toOpTitle, content: toOpDesc, falseLabel: $t('staff_skill.dialog.common.cancel'), trueLabel: $t('staff_skill.dialog.common.confirm') }"
    />

  </div>
</template>

<script setup>
import {CommonStatusEnum} from "@/constants/enums/common.js";
import {onMounted, ref} from "vue";
import {notifyTopPositive, notifyTopWarning} from "@/utils/notification-tools.js";
import {useI18n} from 'vue-i18n'
import CaskComplexTable from "@/ui/components/CaskComplexTable.vue";
import CaskDialogJudgment from "@/ui/components/CaskDialogJudgment.vue";
import {tableStaffSkill, tableStaffSkillOperation} from "@/tables/staff-skill.js";
import {staffSkillCreate, staffSkillDelete, staffSkillList, staffSkillUpdate} from "@/api/staff-skill.js";


const selectId = ref("")
const selectName = ref("")
const selectCode = ref("")
const selectStatus = ref(null)
const statusOptions = ref(CommonStatusEnum.toSelectForm())
const {t} = useI18n()

function clearSearch() {
  selectId.value = ""
  selectName.value = ""
  selectCode.value = ""
  selectStatus.value = null
}

// create/update
const showUpsert = ref(false)
const isNew = ref(false)
const upsertName = ref("")
const upsertCode = ref("")
const upsertDesc = ref("")
const upsertConsumeMinutes = ref(null)
const upsertAliasList = ref([])

const updateId = ref("")

function clearUpsertParam() {
  upsertName.value = ""
  upsertCode.value = ""
  upsertDesc.value = ""
  upsertConsumeMinutes.value = null
  upsertAliasList.value = []
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

function addAliasItem() {
  upsertAliasList.value.push('')
}

function removeAliasItem(aliasIndex) {
  upsertAliasList.value.splice(aliasIndex, 1)
}

function upsertData() {
  if (!upsertName.value || !upsertConsumeMinutes.value || !upsertCode.value) {
    notifyTopWarning(t('validation.insufficient_parameters'))
    return;
  }

  if (!updateId.value && !isNew.value) {
    notifyTopWarning(t('validation.insufficient_parameters'))
    return;
  }

  const body = {
    name: upsertName.value,
    code: upsertCode.value,
    description: upsertDesc.value,
    consumeMinutes: upsertConsumeMinutes.value,
    aliasList: upsertAliasList.value,
  }

  if (isNew.value) {
    staffSkillCreate(body).then(res => {
      if (!res || !res.data) {
        return
      }
      clearUpsertParam()
      showUpsert.value = false
      selectData()
    })
  } else {
    staffSkillUpdate(updateId.value, body).then(res => {
      if (!res || !res.data) {
        return
      }
      clearUpsertParam()
      showUpsert.value = false
      notifyTopPositive(t('staff_skill.notify.update_success'))
      selectData()
    })
  }
}


function deleteData() {
  if (!toOpId.value) {
    notifyTopWarning(t('validation.insufficient_parameters'))
  }
  staffSkillDelete(toOpId.value).then(res => {
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
    id: selectId.value, name: selectName.value, code: selectCode.value,
    status: selectStatus.value ? selectStatus.value.value : null,
    pageNo: tableDynamicData.value.pageNo, pageSize: tableDynamicData.value.pageSize,
  }

  staffSkillList(param).then(res => {
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
      data.statusNameWebColorName = statusEnum.color
    });
    tableData.value = thisData
    tableDynamicData.value.inLoading = false
  })
}

onMounted(() => {
  selectData()
})
</script>

<style scoped lang="scss">


</style>