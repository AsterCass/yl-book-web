<template>
  <div class="full-width">
    <div class="row items-center">

      <div class="q-ml-md">
        <h6>
          {{ $t('staff_device.label.name') }}&nbsp;:
        </h6>
      </div>
      <q-input v-model="selectName" class="q-ma-md component-outline-input-std" dense outlined
               :placeholder="t('staff_device.placeholder.name')"
               tabindex="0">
      </q-input>

      <div class="q-ml-md">
        <h6>
          {{ $t('staff_device.label.status') }}&nbsp;:
        </h6>
      </div>
      <q-select v-model="selectStatus" :menu-offset="[0, 5]" :options="searchStatusOptions"
                class="q-ma-md component-outline-input-std"
                dropdown-icon="fa-solid fa-caret-down" emit-value map-options menu-anchor="bottom start"
                outlined popup-content-class="component-extra-card-std-limit">
      </q-select>

    </div>

    <div class="row">
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push unelevated @click="selectData()">
        {{ $t('staff_device.button.query') }}
      </q-btn>
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push
             unelevated
             @click="clearUpsertParam(); isNew = true; showUpsert = true">
        {{ $t('staff_device.button.add') }}
      </q-btn>
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push
             unelevated @click="()=> {clearSearch(); selectData();}">
        {{ $t('staff_device.button.clear') }}
      </q-btn>
    </div>

    <div class="q-ml-md q-mt-sm" style="max-width: 80%; opacity: .5; font-size: .85rem">
      {{ $t('staff_device.note') }}
    </div>

    <!-- 密钥列为 POINT 类型：点击密钥文字即复制到剪贴板 -->
    <cask-complex-table :custom-table-operation="tableStaffDeviceOperation" :table-base-info="tableStaffDevice"
                        :table-data="tableData"
                        :table-dynamic-data="tableDynamicData"
                        class="full-width"
                        style="padding: 2rem 5rem 0 0.5rem"
                        @columnClick="(name, row) => {
                            if (name === 'deviceKey' && row.deviceKey) {
                              copy(row.deviceKey)
                            }
                          }"
                        @operationClick="(name, row) => {
                            if(name === 'update') {
                              clearUpsertParam();
                              updateId = row.id
                              upsertName = row.name
                              upsertRemark = row.remark || ''
                              upsertStatus = row.status === STATUS_DISABLED ? STATUS_DISABLED : STATUS_ENABLED
                              isNew = false;
                              showUpsert = true
                            }
                            if(name === 'resetKey') {
                              toOpId = row.id
                              toOpTitle = $t('staff_device.dialog.reset_key.title')
                              toOpDesc = $t('staff_device.dialog.reset_key.content', { name: row.name })
                              toOpFunc = resetKey
                              showOperation = true
                            }
                            if(name === 'delete') {
                              toOpId = row.id
                              toOpTitle = $t('staff_device.dialog.delete.title')
                              toOpDesc = $t('staff_device.dialog.delete.content', { name: row.name })
                              toOpFunc = deleteData
                              showOperation = true
                            }
                          }"
                        @enterSearch="selectData()"
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
          {{ isNew ? $t('staff_device.upsert.title_add') : $t('staff_device.upsert.title_update') }}
        </h5>

        <q-separator class="component-separator-base" inset spaced="1rem"/>

        <div class="q-ma-md"
             style="display: grid; grid-template-columns: max-content 1fr; gap: 1.2rem; align-items: center; min-width: 26rem;">

          <h6 class="cask-litter-title-asterisk" style="white-space: nowrap;">
            {{ $t('staff_device.upsert.field.name') }}&nbsp;:</h6>
          <q-input v-model="upsertName" class="component-outline-input-grow" dense outlined maxlength="100"
                   :placeholder="t('staff_device.placeholder.name')"/>

          <h6 style="white-space: nowrap; margin-left: 12px!important;">
            {{ $t('staff_device.upsert.field.remark') }}&nbsp;:</h6>
          <q-input v-model="upsertRemark" class="component-outline-input-grow" dense outlined maxlength="500"
                   :placeholder="t('staff_device.placeholder.remark')"/>

          <h6 style="white-space: nowrap; margin-left: 12px!important;">
            {{ $t('staff_device.upsert.field.status') }}&nbsp;:</h6>
          <q-select v-model="upsertStatus" :options="statusOptions" emit-value map-options
                    class="component-outline-input-grow" dense outlined
                    dropdown-icon="fa-solid fa-caret-down" :menu-offset="[0, 5]" menu-anchor="bottom start"
                    popup-content-class="component-extra-card-std-limit"/>

        </div>

        <div class="row q-mt-xl q-mb-md justify-evenly">
          <!-- 提交中禁用并转 loading，防连点重复建设备 -->
          <q-btn class="shadow-1 component-full-btn-grow" no-caps unelevated :loading="saving" @click="upsertData">
            {{ isNew ? $t('staff_device.upsert.save_add') : $t('staff_device.upsert.save_update') }}
          </q-btn>

          <q-btn class="shadow-1 component-outline-btn-grow" no-caps unelevated @click="showUpsert = false">
            {{ $t('main_setting_cancel') }}
          </q-btn>

        </div>
      </q-card>
    </q-dialog>


    <cask-dialog-judgment v-model="showOperation"
                          :callback-method="isTrue => { showOperation = false; if (isTrue) toOpFunc() }"
                          :dialog-judgment-data="{ title: toOpTitle, content: toOpDesc, falseLabel: $t('staff_device.dialog.common.cancel'), trueLabel: $t('staff_device.dialog.common.confirm') }"
    />

  </div>
</template>

<script setup>
import {computed, onMounted, ref} from "vue";
import {notifyTopPositive, notifyTopWarning} from "@/utils/notification-tools.js";
import {useI18n} from 'vue-i18n'
import CaskComplexTable from "@/ui/components/CaskComplexTable.vue";
import CaskDialogJudgment from "@/ui/components/CaskDialogJudgment.vue";
import {tableStaffDevice, tableStaffDeviceOperation} from "@/tables/staff-device.js";
import {
  staffDeviceCreate,
  staffDeviceDelete,
  staffDeviceList,
  staffDeviceResetKey,
  staffDeviceUpdate
} from "@/api/staff-device.js";
import {copy} from "@/utils/base-tools.js";

// 设备状态：0 启用 / 1 停用
const STATUS_ENABLED = 0
const STATUS_DISABLED = 1
// 状态 / 在线列配色：启用、在线同用户状态「正常」的绿，停用同「禁用」的红，离线用中性灰
const COLOR_GREEN = 'rgb(68, 117, 80)'
const COLOR_RED = 'rgb(200, 60, 60)'
const COLOR_GREY = 'rgb(127, 140, 141)'

const {t} = useI18n()

const selectName = ref("")
// 全部 = 空串（不上送）；不能用 null 占位——q-select 把 null 当作未选中，「全部」就显示不出来
const selectStatus = ref('')

const statusOptions = computed(() => [
  {label: t('staff_device.status.enabled'), value: STATUS_ENABLED},
  {label: t('staff_device.status.disabled'), value: STATUS_DISABLED},
])
const searchStatusOptions = computed(() => [
  {label: t('staff_device.status.all'), value: ''},
  ...statusOptions.value,
])

function clearSearch() {
  selectName.value = ""
  selectStatus.value = ''
}

// create/update：设备建在当前门店（页头切换的门店），之后不能换店
const showUpsert = ref(false)
const isNew = ref(false)
const saving = ref(false)
const upsertName = ref("")
const upsertRemark = ref("")
const upsertStatus = ref(STATUS_ENABLED)

const updateId = ref("")

function clearUpsertParam() {
  updateId.value = ""
  upsertName.value = ""
  upsertRemark.value = ""
  upsertStatus.value = STATUS_ENABLED
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
  if (saving.value) {
    return
  }
  if (!upsertName.value || !upsertName.value.trim()) {
    notifyTopWarning(t('validation.insufficient_parameters'))
    return;
  }

  if (!updateId.value && !isNew.value) {
    notifyTopWarning(t('validation.insufficient_parameters'))
    return;
  }

  const body = {
    name: upsertName.value.trim(),
    remark: upsertRemark.value,
    status: upsertStatus.value,
  }

  saving.value = true
  if (isNew.value) {
    staffDeviceCreate(body).then(res => {
      saving.value = false
      if (!res || !res.data) {
        return
      }
      clearUpsertParam()
      showUpsert.value = false
      // 后端只回新设备 id；密钥在列表里（点击即复制）
      notifyTopPositive(t('staff_device.notify.create_success'), 5000)
      selectData(true)
    })
  } else {
    staffDeviceUpdate(updateId.value, body).then(res => {
      saving.value = false
      if (!res || !res.data) {
        return
      }
      clearUpsertParam()
      showUpsert.value = false
      notifyTopPositive(t('staff_device.notify.update_success'))
      selectData(true)
    })
  }
}

// 重置密钥：后端返回新密钥、旧密钥立即失效；刷新列表即可看到并复制新密钥
function resetKey() {
  if (!toOpId.value) {
    notifyTopWarning(t('validation.insufficient_parameters'))
    return
  }
  staffDeviceResetKey(toOpId.value).then(res => {
    if (!res || !res.data) {
      return
    }
    notifyTopPositive(t('staff_device.notify.reset_key_success'), 5000)
    selectData(true)
  })
}

function deleteData() {
  if (!toOpId.value) {
    notifyTopWarning(t('validation.insufficient_parameters'))
    return
  }
  staffDeviceDelete(toOpId.value).then(res => {
    if (!res || !res.data) {
      return
    }
    notifyTopPositive(t('notify.delete_success'))
    selectData(true)
  })
}

// 心跳原文：能解析成 JSON 就缩进排版（TEXT 列保留换行与缩进），解析不了原样展示
function formatHeartbeatInfo(raw) {
  if (!raw) {
    return ''
  }
  try {
    return JSON.stringify(JSON.parse(raw), null, 2)
  } catch (e) {
    return raw
  }
}

// 默认从第一页开始查询；翻页、行操作后刷新时传 keepPage = true 保持当前页
function selectData(keepPage = false) {
  if (!keepPage) {
    tableDynamicData.value.pageNo = 1
  }
  tableDynamicData.value.inLoading = true
  const param = {
    name: selectName.value.trim() || null,
    // 0 = 启用是合法取值，不能按真假判断
    status: selectStatus.value === '' ? null : selectStatus.value,
    pageNo: tableDynamicData.value.pageNo, pageSize: tableDynamicData.value.pageSize,
  }

  staffDeviceList(param).then(res => {
    if (!res || !res.data || !res.data.data) {
      tableDynamicData.value.inLoading = false
      return
    }
    const thisData = res.data.data.records || []
    tableDynamicData.value.dataSum = res.data.data.total
    thisData.forEach(data => {
      data.updateOp = true
      data.resetKeyOp = true
      data.deleteOp = true
      const disabled = data.status === STATUS_DISABLED
      data.statusName = disabled ? t('staff_device.status.disabled') : t('staff_device.status.enabled')
      data.statusNameWebColorName = disabled ? COLOR_RED : COLOR_GREEN
      data.onlineName = data.online ? t('staff_device.online.online') : t('staff_device.online.offline')
      data.onlineNameWebColorName = data.online ? COLOR_GREEN : COLOR_GREY
      data.lastHeartbeatTime = data.lastHeartbeatTime || t('staff_device.table.never')
      data.heartbeatInfo = formatHeartbeatInfo(data.lastHeartbeatInfo)
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
