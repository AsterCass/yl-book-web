<template>
  <div class="full-width">

    <!-- 客户反馈（服务评价）：匿名行的预约/雇员由后端脱敏，不展示、不可点击；
         提交时间为展示口径（匿名 = 提交后 1-3 天随机延迟的「出现时间」），筛选同口径 -->
    <div class="row items-center">

      <div class="q-ml-md">
        <h6>
          {{ $t('book_feedback.label.start_date') }}&nbsp;:
        </h6>
      </div>
      <cask-date-picker v-model="selectStartDate" class="q-ma-md"
                        input-class="component-outline-input-std"/>

      <div class="q-ml-md">
        <h6>
          {{ $t('book_feedback.label.end_date') }}&nbsp;:
        </h6>
      </div>
      <cask-date-picker v-model="selectEndDate" class="q-ma-md"
                        input-class="component-outline-input-std"/>

      <div class="q-ml-md">
        <h6>
          {{ $t('book_feedback.label.status') }}&nbsp;:
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
        {{ $t('book_feedback.button.query') }}
      </q-btn>
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push unelevated
             @click="() => {clearSearch(); selectData();}">
        {{ $t('book_feedback.button.clear') }}
      </q-btn>
      <!-- 导出 xlsx：按当前筛选条件全量导出（不分页），导出中禁用防重复点击。
           导出为全量口径：含尚未到展示时间的匿名反馈、匿名行不脱敏、另带「创建时间」列（实际提交时刻），
           日期筛选项语义不变（仍按展示口径 visible_time） -->
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push unelevated
             :loading="exporting" :disable="exporting" @click="exportData">
        {{ $t('book_feedback.button.export') }}
      </q-btn>
    </div>

    <div class="q-ml-md q-mt-sm" style="max-width: 80%; opacity: .5; font-size: .85rem">
      {{ $t('book_feedback.note') }}
    </div>

    <cask-complex-table :custom-table-operation="tableFeedbackOperation" :table-base-info="tableFeedback"
                        :table-data="tableData"
                        :table-dynamic-data="tableDynamicData"
                        class="full-width"
                        style="padding: 2rem 5rem 0 0.5rem"
                        @columnClick="onColumnClick"
                        @operationClick="onOperationClick"
                        @toNewPage="(pageObj) => {
                            tableDynamicData.pageNo = pageObj.pageNo
                            tableDynamicData.pageSize = pageObj.pageSize
                            selectData(true)
                          }"
    />

    <!-- 编辑运营备注：保存空内容即清空 -->
    <q-dialog :model-value="showRemarkEdit" transition-hide="fade" no-backdrop-dismiss no-shake
              transition-show="fade" @hide="showRemarkEdit = false">
      <q-card class="component-cask-dialog-judgement-std" style="max-width: 2000px !important">
        <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
          {{ $t('book_feedback.remark_dialog.title') }}
        </h5>

        <q-separator class="component-separator-base" inset spaced="1rem"/>

        <div class="q-ma-md" style="min-width: 36rem">
          <q-input v-model="remarkEditContent"
                   dense outlined class="component-outline-input-grow"
                   :placeholder="t('book_feedback.remark_dialog.placeholder')"/>
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

    <!-- 预约详情（复用预约列表的详情弹窗） -->
    <cask-book-detail-dialog v-model="showBookDetail" :book="detailBook"/>

    <!-- 雇员详情：简单展示基础信息 -->
    <q-dialog :model-value="showStaffDetail" transition-hide="fade" transition-show="fade"
              @hide="showStaffDetail = false">
      <q-card class="component-cask-dialog-judgement-std" style="max-width: 2000px !important">
        <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
          {{ $t('book_feedback.staff_detail_title') }}
        </h5>

        <q-separator class="component-separator-base" inset spaced="1rem"/>

        <div class="q-ma-md" style="min-width: 22rem">
          <div v-for="item in staffDetailItems" :key="item.label" class="row justify-between q-my-sm">
            <div style="opacity: .5">{{ item.label }}</div>
            <div>{{ item.value || '-' }}</div>
          </div>
        </div>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>

import {computed, onMounted, ref} from "vue";
import {useI18n} from 'vue-i18n'
import {notifyTopPositive, notifyTopWarning} from "@/utils/notification-tools.js";
import CaskComplexTable from "@/ui/components/CaskComplexTable.vue";
import CaskBookDetailDialog from "@/ui/components/CaskBookDetailDialog.vue";
import CaskDatePicker from "@/ui/components/CaskDatePicker.vue";
import {tableFeedback, tableFeedbackOperation} from "@/tables/book.js";
import {
  bookDetail,
  bookFeedbackDetail,
  bookFeedbackExport,
  bookFeedbackHandle,
  bookFeedbackList,
  bookFeedbackRemark
} from "@/api/book.js";
import {staffDetail} from "@/api/staff.js";
import {BookFeedbackHandleStatusEnum} from "@/constants/enums/book.js";

const {t} = useI18n()

// 筛选：提交日期区间（展示口径，匿名=出现时间）+ 处理状态（单选，空=不过滤）
const selectStartDate = ref("")
const selectEndDate = ref("")
const selectHandleStatus = ref(null)
const handleStatusOptions = ref(BookFeedbackHandleStatusEnum.toSelectForm())

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
  bookFeedbackList({
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
      const statusEnum = BookFeedbackHandleStatusEnum.fromCode(row.handleStatus)
      return {
        ...row,
        // 匿名行：bookId/staffName/createTime 后端已置空，直接空显示（POINT 列空值不可点）
        bookId: row.bookId || '',
        staffName: row.staffName || '',
        createTime: row.createTime || '',
        remark: row.remark || '',
        // 编辑备注：所有行可用
        remarkOp: true,
        detailOp: true,
        scoreShow: row.score != null ? `${row.score} ★` : '',
        handleStatusName: statusEnum ? statusEnum.name : '',
        handleStatusNameWebColorName: statusEnum ? statusEnum.color : 'rgb(128, 128, 128)',
        // 三态流转操作：当前态之外的两个状态可点
        handledOp: row.handleStatus !== BookFeedbackHandleStatusEnum.HANDLED.code,
        noNeedOp: row.handleStatus !== BookFeedbackHandleStatusEnum.NO_NEED.code,
        unhandledOp: row.handleStatus !== BookFeedbackHandleStatusEnum.UNHANDLED.code,
      }
    })
    tableDynamicData.value.inLoading = false
  })
}

// ===== 预约/雇员详情（仅非匿名行可点，匿名行对应字段为空） =====

const showBookDetail = ref(false)
const detailBook = ref(null)

const showStaffDetail = ref(false)
const staffDetailData = ref(null)

const staffDetailItems = computed(() => {
  const staff = staffDetailData.value
  if (!staff) {
    return []
  }
  return [
    {label: t('book_feedback.staff_field.name'), value: staff.name},
    {label: t('book_feedback.staff_field.external_name'), value: staff.externalName},
    {label: t('book_feedback.staff_field.phone'), value: staff.phone},
    {label: t('book_feedback.staff_field.mail'), value: staff.mail},
  ]
})

function onColumnClick(name, row) {
  if (row.anonymous) {
    return
  }
  // row.storeId：总门店视角（未选定门店）下按行所属门店携带 X-Store-Id（详情接口要求门店上下文）
  if (name === 'bookId' && row.bookId) {
    bookDetail(row.bookId, row.storeId).then(res => {
      if (!res || !res.data || !res.data.data) {
        return
      }
      detailBook.value = res.data.data
      showBookDetail.value = true
    })
  }
  if (name === 'staffName' && row.staffId) {
    staffDetail(row.staffId, row.storeId).then(res => {
      if (!res || !res.data || !res.data.data) {
        return
      }
      staffDetailData.value = res.data.data
      showStaffDetail.value = true
    })
  }
}

// ===== 导出 xlsx =====

// 导出中：按钮禁用+loading，防重复点击
const exporting = ref(false)

function exportData() {
  if (exporting.value) {
    return
  }
  exporting.value = true
  bookFeedbackExport({
    startDateStr: selectStartDate.value || null,
    endDateStr: selectEndDate.value || null,
    handleStatus: selectHandleStatus.value ? selectHandleStatus.value.value : null,
  }).then(async res => {
    if (!res || !res.data) {
      return
    }
    const blob = res.data
    // 后端业务错误（如日期格式非法）会以 JSON 返回：blob 形态需解析后提示，不触发下载
    if (blob.type && blob.type.includes('application/json')) {
      try {
        const errorObj = JSON.parse(await blob.text())
        notifyTopWarning(errorObj.message || t('error_request'))
      } catch (e) {
        notifyTopWarning(t('error_request'))
      }
      return
    }
    // 文件名优先取响应头（后端为 customer-feedback-{时间戳}.xlsx），取不到用兜底
    const disposition = res.headers ? res.headers['content-disposition'] : ''
    const match = disposition ? disposition.match(/filename=([^;]+)/) : null
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = match ? match[1].trim() : 'customer-feedback.xlsx'
    link.click()
    window.URL.revokeObjectURL(url)
  }).finally(() => {
    exporting.value = false
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
  bookFeedbackRemark(remarkEditId.value, {remark: remarkEditContent.value}).then(res => {
    if (!res || !res.data) {
      return
    }
    showRemarkEdit.value = false
    notifyTopPositive(t('book_feedback.notify.remark_success'))
    selectData(true)
  }).finally(() => {
    remarkSaving.value = false
  })
}

// ===== 处理状态流转 =====

function onOperationClick(name, row) {
  if (name === 'showBookDetail') {
    // 按反馈 id 取预约详情：匿名行同样可看（后端按反馈定位所属门店，前端无需带 X-Store-Id）
    bookFeedbackDetail(row.id).then(res => {
      if (!res || !res.data || !res.data.data) {
        return
      }
      detailBook.value = res.data.data
      showBookDetail.value = true
    })
    return
  }
  if (name === 'editRemark') {
    openRemarkEdit(row)
    return
  }
  let handleStatus = null
  if (name === 'markHandled') {
    handleStatus = BookFeedbackHandleStatusEnum.HANDLED.code
  } else if (name === 'markNoNeed') {
    handleStatus = BookFeedbackHandleStatusEnum.NO_NEED.code
  } else if (name === 'markUnhandled') {
    handleStatus = BookFeedbackHandleStatusEnum.UNHANDLED.code
  }
  if (handleStatus === null) {
    return
  }
  bookFeedbackHandle(row.id, handleStatus).then(res => {
    if (!res || !res.data) {
      return
    }
    notifyTopPositive(t('book_feedback.notify.handle_success'))
    selectData(true)
  })
}

onMounted(() => {
  selectData()
})

</script>

<style scoped lang="scss">
</style>
