<template>
  <div class="full-width">

    <!-- 电话需求：AI 电话接线员在通话中采集的非预约类客户诉求（遗失物品/投诉等），
         每条归属具体门店；状态操作逻辑同客户反馈 -->
    <div class="row items-center">

      <div class="q-ml-md">
        <h6>
          {{ $t('book_phone_request.label.start_date') }}&nbsp;:
        </h6>
      </div>
      <cask-date-picker v-model="selectStartDate" class="q-ma-md"
                        input-class="component-outline-input-std"/>

      <div class="q-ml-md">
        <h6>
          {{ $t('book_phone_request.label.end_date') }}&nbsp;:
        </h6>
      </div>
      <cask-date-picker v-model="selectEndDate" class="q-ma-md"
                        input-class="component-outline-input-std"/>

      <div class="q-ml-md">
        <h6>
          {{ $t('book_phone_request.label.status') }}&nbsp;:
        </h6>
      </div>
      <q-select v-model="selectHandleStatus" :menu-offset="[0, 5]" :options="handleStatusOptions"
                class="q-ma-md component-outline-input-std"
                clear-icon="fa-solid fa-xmark"
                clearable
                dropdown-icon="fa-solid fa-caret-down" menu-anchor="bottom start"
                outlined popup-content-class="component-extra-card-std-limit">
      </q-select>

    </div>

    <div class="row items-center">
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push unelevated @click="selectData()">
        {{ $t('book_phone_request.button.query') }}
      </q-btn>
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push unelevated
             @click="() => {clearSearch(); selectData();}">
        {{ $t('book_phone_request.button.clear') }}
      </q-btn>
    </div>

    <div class="q-ml-md q-mt-sm" style="max-width: 80%; opacity: .5; font-size: .85rem">
      {{ $t('book_phone_request.note') }}
    </div>

    <cask-complex-table :custom-table-operation="tablePhoneRequestOperation" :table-base-info="tablePhoneRequest"
                        :table-data="tableData"
                        :table-dynamic-data="tableDynamicData"
                        class="full-width"
                        style="padding: 2rem 5rem 0 0.5rem"
                        @operationClick="onOperationClick"
                        @toNewPage="(pageObj) => {
                            tableDynamicData.pageNo = pageObj.pageNo
                            tableDynamicData.pageSize = pageObj.pageSize
                            selectData(true)
                          }"
    />

    <!-- 编辑运营备注（跟进/回访记录）：保存空内容即清空 -->
    <q-dialog :model-value="showRemarkEdit" transition-hide="fade" no-backdrop-dismiss no-shake
              transition-show="fade" @hide="showRemarkEdit = false">
      <q-card class="component-cask-dialog-judgement-std" style="max-width: 2000px !important">
        <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
          {{ $t('book_phone_request.remark_dialog.title') }}
        </h5>

        <q-separator class="component-separator-base" inset spaced="1rem"/>

        <div class="q-ma-md" style="min-width: 36rem">
          <q-input v-model="remarkEditContent"
                   dense outlined class="component-outline-input-grow"
                   :placeholder="t('book_phone_request.remark_dialog.placeholder')"/>
        </div>

        <div class="row q-mt-lg q-mb-md justify-evenly">
          <q-btn class="shadow-1 component-full-btn-grow" no-caps unelevated :loading="remarkSaving"
                 @click="saveRemark">
            {{ $t('main_setting_save') }}
          </q-btn>
          <q-btn class="shadow-1 component-outline-btn-grow" no-caps unelevated
                 @click="showRemarkEdit = false">
            {{ $t('main_setting_cancel') }}
          </q-btn>
        </div>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>

import {onMounted, ref} from "vue";
import {useI18n} from 'vue-i18n'
import {notifyTopPositive} from "@/utils/notification-tools.js";
import CaskComplexTable from "@/ui/components/CaskComplexTable.vue";
import CaskDatePicker from "@/ui/components/CaskDatePicker.vue";
import {tablePhoneRequest, tablePhoneRequestOperation} from "@/tables/book.js";
import {bookPhoneRequestHandle, bookPhoneRequestList, bookPhoneRequestRemark} from "@/api/book.js";
import {PhoneRequestHandleStatusEnum} from "@/constants/enums/book.js";

const {t} = useI18n()

// 筛选：记录日期区间 + 处理状态（空=不过滤）；需求类型为 AI 自拟的自由文本标签，不做筛选
const selectStartDate = ref("")
const selectEndDate = ref("")
const selectHandleStatus = ref(null)
const handleStatusOptions = ref(PhoneRequestHandleStatusEnum.toSelectForm())

function clearSearch() {
  selectStartDate.value = ""
  selectEndDate.value = ""
  selectHandleStatus.value = null
}

const tableData = ref([])
const tableDynamicData = ref(
    {
      inLoading: true,
      pageNo: 1,
      pageSize: 10,
      dataSum: 0,
      multiple: false,
    }
)

// 默认从第一页开始查询；翻页/操作后刷新传 keepPage = true 保持当前页
function selectData(keepPage = false) {
  if (!keepPage) {
    tableDynamicData.value.pageNo = 1
  }
  tableDynamicData.value.inLoading = true
  bookPhoneRequestList({
    pageNo: tableDynamicData.value.pageNo,
    pageSize: tableDynamicData.value.pageSize,
    startDateStr: selectStartDate.value || null,
    endDateStr: selectEndDate.value || null,
    handleStatus: selectHandleStatus.value ? selectHandleStatus.value.value : null,
  }).then(res => {
    if (!res || !res.data || !res.data.data) {
      tableDynamicData.value.inLoading = false
      return
    }
    tableDynamicData.value.dataSum = res.data.data.total
    tableData.value = (res.data.data.records || []).map(row => {
      const statusEnum = PhoneRequestHandleStatusEnum.fromCode(row.handleStatus)
      return {
        ...row,
        storeName: row.storeName || '-',
        // 需求类型：AI 自拟的自由文本标签，原样展示
        type: row.type || '',
        detail: row.detail || '',
        remark: row.remark || '',
        handleStatusName: statusEnum ? statusEnum.name : '',
        handleStatusNameWebColorName: statusEnum ? statusEnum.color : 'rgb(128, 128, 128)',
        // 编辑备注：所有行可用
        remarkOp: true,
        // 三态流转操作：当前态之外的两个状态可点
        handledOp: row.handleStatus !== PhoneRequestHandleStatusEnum.HANDLED.code,
        noNeedOp: row.handleStatus !== PhoneRequestHandleStatusEnum.NO_NEED.code,
        unhandledOp: row.handleStatus !== PhoneRequestHandleStatusEnum.UNHANDLED.code,
      }
    })
    tableDynamicData.value.inLoading = false
  })
}

// ===== 运营备注编辑 =====

const showRemarkEdit = ref(false)
const remarkEditId = ref("")
const remarkEditContent = ref("")
// 保存中：按钮 loading 防重复提交
const remarkSaving = ref(false)

function openRemarkEdit(row) {
  remarkEditId.value = row.id
  remarkEditContent.value = row.remark || ''
  showRemarkEdit.value = true
}

function saveRemark() {
  if (remarkSaving.value) {
    return
  }
  remarkSaving.value = true
  // 空内容原样提交=清空备注
  bookPhoneRequestRemark(remarkEditId.value, {remark: remarkEditContent.value}).then(res => {
    if (!res || !res.data) {
      return
    }
    showRemarkEdit.value = false
    notifyTopPositive(t('book_phone_request.notify.remark_success'))
    selectData(true)
  }).finally(() => {
    remarkSaving.value = false
  })
}

// ===== 处理状态流转 =====

function onOperationClick(name, row) {
  if (name === 'editRemark') {
    openRemarkEdit(row)
    return
  }
  let handleStatus = null
  if (name === 'markHandled') {
    handleStatus = PhoneRequestHandleStatusEnum.HANDLED.code
  } else if (name === 'markNoNeed') {
    handleStatus = PhoneRequestHandleStatusEnum.NO_NEED.code
  } else if (name === 'markUnhandled') {
    handleStatus = PhoneRequestHandleStatusEnum.UNHANDLED.code
  }
  if (handleStatus === null) {
    return
  }
  bookPhoneRequestHandle(row.id, handleStatus).then(res => {
    if (!res || !res.data) {
      return
    }
    notifyTopPositive(t('book_phone_request.notify.handle_success'))
    selectData(true)
  })
}

onMounted(() => {
  selectData()
})

</script>

<style scoped lang="scss">
</style>
