<template>

  <div class="full-width">
    <div class="row items-center">

      <div class="q-ml-md">
        <h6>
          {{ $t('user_store.label.id') }}&nbsp;:
        </h6>
      </div>
      <q-input v-model="selectId" class="q-ma-md component-outline-input-std" dense outlined
               :placeholder="t('user_store.placeholder.id')"
               tabindex="0">
      </q-input>

      <div class="q-ml-md">
        <h6>
          {{ $t('user_store.label.name') }}&nbsp;:
        </h6>
      </div>
      <q-input v-model="keyword" class="q-ma-md component-outline-input-std" dense outlined
               :placeholder="t('user_store.placeholder.name')"
               tabindex="0">
      </q-input>

    </div>

    <div class="row">
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push unelevated
             @click="selectData()">
        {{ $t('user_store.button.query') }}
      </q-btn>
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push
             unelevated
             @click="clearUpsertParam(); isNew = true; showUpsert = true">
        {{ $t('user_store.button.add') }}
      </q-btn>
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push
             unelevated @click="()=> {clearSearch(); selectData();}">
        {{ $t('user_store.button.clear') }}
      </q-btn>
    </div>

    <cask-complex-table :custom-table-operation="tableStoreOperation" :table-base-info="tableStore"
                        :table-data="tableData"
                        :table-dynamic-data="tableDynamicData"
                        class="full-width"
                        style="padding: 2rem 5rem 0 0.5rem"
                        @operationClick="(name, row) => {
                            if(name === 'update') {
                              clearUpsertParam();
                              updateId = row.id
                              upsertName = row.name
                              upsertAddress = row.address
                              upsertPhone = row.phone
                              upsertDesc = row.description
                              isNew = false;
                              showUpsert = true
                            }
                          }"
                        @toNewPage="(pageObj) => {
                            tableDynamicData.pageNo = pageObj.pageNo
                            tableDynamicData.pageSize = pageObj.pageSize
                          }"
    />

    <q-dialog :model-value="showUpsert" transition-hide="fade" no-backdrop-dismiss no-shake
              transition-show="fade" @hide="showUpsert = false">
      <q-card class="component-cask-dialog-judgement-std" style="max-width: 2000px !important">
        <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
          {{ isNew ? $t('user_store.upsert.title_add') : $t('user_store.upsert.title_update') }}
        </h5>

        <div class="q-mx-sm" style="opacity: 0.5; width: 25rem; font-size: 0.85rem">
          <div v-if="isNew">
            {{ $t('user_store.upsert.admin_note') }}
          </div>
        </div>

        <q-separator class="component-separator-base" inset spaced="1rem"/>

        <div style="padding-top: .1rem">

        </div>

        <div class="q-ma-md"
             style="display: grid; grid-template-columns: max-content 1fr; gap: 1.2rem; align-items: center;">

          <h6 class="cask-litter-title-asterisk" style="white-space: nowrap;">{{ $t('user_store.upsert.field.name') }}&nbsp;:</h6>
          <q-input v-model="upsertName" class="component-outline-input-grow" dense outlined
                   :placeholder="t('user_store.placeholder.name')"/>

          <h6 style="white-space: nowrap; margin-left: 12px!important;">{{
              $t('user_store.upsert.field.address')
            }}&nbsp;:</h6>
          <q-input v-model="upsertAddress" class="component-outline-input-grow" dense outlined
                   :placeholder="t('user_store.placeholder.optional')"/>

          <h6 style="white-space: nowrap; margin-left: 12px!important;">{{
              $t('user_store.upsert.field.phone')
            }}&nbsp;:</h6>
          <q-input v-model="upsertPhone" class="component-outline-input-grow" dense outlined
                   :placeholder="t('user_store.placeholder.optional')"/>

          <h6 style="white-space: nowrap; margin-left: 12px!important;">{{
              $t('user_store.upsert.field.desc')
            }}&nbsp;:</h6>
          <q-input v-model="upsertDesc" class="component-outline-input-grow" dense outlined
                   :placeholder="t('user_store.placeholder.optional')"/>

          <template v-if="isNew">
            <h6 style="white-space: nowrap; margin-left: 12px!important;">{{
                $t('user_store.upsert.field.timezone')
              }}&nbsp;:</h6>
            <q-select outlined clearable class="component-outline-input-grow"
                      dropdown-icon="fa-solid fa-caret-down"
                      popup-content-class="component-extra-card-std"
                      clear-icon="fa-solid fa-xmark"
                      menu-anchor="bottom start" :menu-offset="[0, 5]"
                      v-model="upsertTimezone" :options="timezoneOptions">
            </q-select>

            <h6 class="cask-litter-title-asterisk" style="white-space: nowrap;">
              {{ $t('user_store.upsert.field.admin_mail') }}&nbsp;:</h6>
            <q-input v-model="upsertAdminMail" class="component-outline-input-grow" dense outlined
                     :placeholder="t('user_store.placeholder.admin_mail')"/>

            <h6 style="white-space: nowrap; margin-left: 12px!important;">{{
                $t('user_store.upsert.field.admin_nick')
              }}&nbsp;:</h6>
            <q-input v-model="upsertAdminNickName" class="component-outline-input-grow" dense outlined
                     :placeholder="t('user_store.placeholder.admin_nick')"/>

            <h6 class="cask-litter-title-asterisk" style="white-space: nowrap;">
              {{ $t('user_store.upsert.field.admin_role_name') }}&nbsp;:</h6>
            <q-input v-model="upsertAdminRoleName" class="component-outline-input-grow" dense outlined
                     :placeholder="t('user_store.placeholder.admin_role_name')"/>

            <h6 class="cask-litter-title-asterisk" style="white-space: nowrap;">
              {{ $t('user_store.upsert.field.admin_role_code') }}&nbsp;:</h6>
            <q-input v-model="upsertAdminRoleCode" class="component-outline-input-grow" dense outlined
                     :placeholder="t('user_store.placeholder.admin_role_code')"/>
          </template>

        </div>

        <div class="row q-mt-xl q-mb-md justify-evenly">
          <q-btn class="shadow-1 component-full-btn-grow" no-caps unelevated @click="upsertData">
            {{ isNew ? $t('user_store.upsert.save_add') : $t('user_store.upsert.save_update') }}
          </q-btn>

          <q-btn class="shadow-1 component-outline-btn-grow" no-caps unelevated @click="showUpsert = false">
            {{ $t('main_setting_cancel') }}
          </q-btn>

        </div>
      </q-card>
    </q-dialog>

  </div>

</template>

<script setup>
import {onMounted, ref} from "vue";
import {notifyTopPositive, notifyTopWarning} from "@/utils/notification-tools.js";
import {useI18n} from 'vue-i18n'
import CaskComplexTable from "@/ui/components/CaskComplexTable.vue";
import {tableStore, tableStoreOperation} from "@/tables/store.js";
import {storeCreate, storeList, storeUpdate} from "@/api/store.js";
import {CommonStatusEnum, TimezoneOptEnum} from "@/constants/enums/common.js";


const {t} = useI18n()
const selectId = ref("")
const keyword = ref("")

function clearSearch() {
  selectId.value = ""
  keyword.value = ""
}

// create/update
const showUpsert = ref(false)
const isNew = ref(false)
const upsertName = ref("")
const upsertAddress = ref("")
const upsertPhone = ref("")
const upsertDesc = ref("")
const upsertTimezone = ref(null)
const upsertAdminMail = ref("")
const upsertAdminNickName = ref("")
const upsertAdminRoleName = ref("")
const upsertAdminRoleCode = ref("")
const timezoneOptions = ref(TimezoneOptEnum.toSelectForm())

const updateId = ref("")

function clearUpsertParam() {
  upsertName.value = ""
  upsertAddress.value = ""
  upsertPhone.value = ""
  upsertDesc.value = ""
  upsertTimezone.value = null
  upsertAdminMail.value = ""
  upsertAdminNickName.value = ""
  upsertAdminRoleName.value = ""
  upsertAdminRoleCode.value = ""
}

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

  if (isNew.value) {
    if (!upsertAdminMail.value || !upsertAdminRoleName.value || !upsertAdminRoleCode.value) {
      notifyTopWarning(t('validation.insufficient_parameters'))
      return;
    }
    const body = {
      name: upsertName.value,
      address: upsertAddress.value,
      phone: upsertPhone.value,
      description: upsertDesc.value,
      timezone: upsertTimezone.value ? upsertTimezone.value.value : null,
      adminMail: upsertAdminMail.value,
      adminNickName: upsertAdminNickName.value,
      adminRoleName: upsertAdminRoleName.value,
      adminRoleCode: upsertAdminRoleCode.value,
    }
    storeCreate(body).then(res => {
      if (!res || !res.data) {
        return
      }
      clearUpsertParam()
      showUpsert.value = false
      notifyTopPositive(t('user_store.notify.create_success'))
      selectData(true)
    })
  } else {
    if (!updateId.value) {
      notifyTopWarning(t('validation.insufficient_parameters'))
      return;
    }
    const body = {
      name: upsertName.value,
      address: upsertAddress.value,
      phone: upsertPhone.value,
      description: upsertDesc.value,
    }
    storeUpdate(updateId.value, body).then(res => {
      if (!res || !res.data) {
        return
      }
      clearUpsertParam()
      showUpsert.value = false
      notifyTopPositive(t('user_store.notify.update_success'))
      selectData(true)
    })
  }
}

// 默认从第一页开始查询；行操作后刷新时传 keepPage = true 保持当前页
function selectData(keepPage = false) {
  if (!keepPage) {
    tableDynamicData.value.pageNo = 1
  }
  tableDynamicData.value.inLoading = true
  storeList().then(res => {
    if (!res || !res.data || !res.data.data) {
      tableDynamicData.value.inLoading = false
      return
    }
    const thisData = res.data.data
    thisData.forEach(data => {
      const statusEnum = CommonStatusEnum.fromCode(data.status)
      data.statusName = statusEnum.name
      data.statusNameWebColorName = statusEnum.color
      // 未匹配到预设时区时直接展示原始值
      const timezoneEnum = TimezoneOptEnum.fromCode(data.timezone)
      data.timezoneName = timezoneEnum ? timezoneEnum.name : (data.timezone || '')
      data.updateOp = true
    })
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
