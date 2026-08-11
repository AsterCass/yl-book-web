<template>
  <div class="full-width">
    <div class="row items-center">

      <div class="q-ml-md">
        <h6>
          {{ $t('book_card_info.label.start_date') }}&nbsp;:
        </h6>
      </div>
      <cask-date-picker v-model="selectStartDate" class="q-ma-md"
                        input-class="component-outline-input-std"/>

      <div class="q-ml-md">
        <h6>
          {{ $t('book_card_info.label.end_date') }}&nbsp;:
        </h6>
      </div>
      <cask-date-picker v-model="selectEndDate" class="q-ma-md"
                        input-class="component-outline-input-std"/>

      <div class="q-ml-md">
        <h6>
          {{ $t('book_card_info.label.source') }}&nbsp;:
        </h6>
      </div>
      <!-- 预约来源多选：筛选「区间内预约来源与所选有交集」的手机号，命中行展示该号全部记录 -->
      <q-select v-model="selectSourceList" :menu-offset="[0, 5]" :options="sourceOptions"
                class="q-ma-md component-outline-input-grow"
                clear-icon="fa-solid fa-xmark"
                clearable
                multiple use-chips
                dropdown-icon="fa-solid fa-caret-down" menu-anchor="bottom start"
                outlined popup-content-class="component-extra-card-std-limit">
      </q-select>

    </div>

    <div class="row items-center">
      <!-- 第三方接口有限流：不主动查询，点击后先弹确认框；查询期间禁用+loading 防重复点击 -->
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push unelevated
             :loading="querying" :disable="querying" @click="askQuery">
        {{ $t('book_card_info.button.query') }}
      </q-btn>
      <!-- 导出：与查询同一条后端链路（含第三方调用与其限流约束），同样先过限流确认弹窗 -->
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push unelevated
             :loading="exporting" :disable="exporting" @click="askExport">
        {{ $t('book_card_info.button.export') }}
      </q-btn>
    </div>

    <!-- 无分页表格：一次性全量展示，总条数=聚合后的手机号行数 -->
    <cask-complex-table :table-base-info="tableCardInfo"
                        :table-data="tableData"
                        :table-dynamic-data="tableDynamicData"
                        class="full-width"
                        style="padding: 2rem 5rem 0 0.5rem"
    />

    <!-- 查询确认：提示第三方限流，谨慎规划查询次数 -->
    <cask-dialog-judgment v-model="showConfirm"
                          :callback-method="onConfirmQuery"
                          :dialog-judgment-data="{
                            title: t('book_card_info.dialog.title'),
                            content: t('book_card_info.dialog.content'),
                            falseLabel: t('book_card_info.dialog.cancel'),
                            trueLabel: t('book_card_info.dialog.confirm'),
                          }"
    />

  </div>
</template>

<script setup>

import {ref} from "vue";
import {date} from "quasar";
import {useI18n} from 'vue-i18n'
import {notifyTopWarning} from "@/utils/notification-tools.js";
import CaskComplexTable from "@/ui/components/CaskComplexTable.vue";
import CaskDatePicker from "@/ui/components/CaskDatePicker.vue";
import CaskDialogJudgment from "@/ui/components/CaskDialogJudgment.vue";
import {tableCardInfo} from "@/tables/book.js";
import {bookCardInfo, bookCardInfoExport} from "@/api/book.js";
import {BookSourceEnum} from "@/constants/enums/book.js";

const {t} = useI18n()

// 默认区间：上个月第一天 ~ 上个月最后一天
const now = new Date()
const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
const lastMonthEnd = new Date(firstOfThisMonth.getTime() - 24 * 60 * 60 * 1000)
const lastMonthStart = new Date(lastMonthEnd.getFullYear(), lastMonthEnd.getMonth(), 1)

const selectStartDate = ref(date.formatDate(lastMonthStart, 'YYYY-MM-DD'))
const selectEndDate = ref(date.formatDate(lastMonthEnd, 'YYYY-MM-DD'))
// 预约来源多选（选项存 {label, value}，空选=不过滤）
const selectSourceList = ref([])
const sourceOptions = ref(BookSourceEnum.toSelectForm())

const showConfirm = ref(false)
// 确认弹窗的动作：'query' 查询 / 'export' 导出（两者都消耗第三方限流额度，共用确认）
const confirmAction = ref('query')
// 查询/导出中：按钮禁用+loading，防重复点击（第三方有限流）
const querying = ref(false)
const exporting = ref(false)

const tableData = ref([])
// 无分页：dataSum = 聚合后的手机号行数；pageNo/pageSize 仅为组件必需的占位
const tableDynamicData = ref(
    {
      inLoading: false,
      pageNo: 1,
      pageSize: 500,
      dataSum: 0,
      multiple: false,
    }
)

function validateDates() {
  if (!selectStartDate.value || !selectEndDate.value) {
    notifyTopWarning(t('book_card_info.notify.date_required'))
    return false
  }
  if (selectEndDate.value < selectStartDate.value) {
    notifyTopWarning(t('book_card_info.notify.date_order'))
    return false
  }
  return true
}

function askQuery() {
  if (!validateDates()) {
    return
  }
  confirmAction.value = 'query'
  showConfirm.value = true
}

function askExport() {
  if (!validateDates()) {
    return
  }
  confirmAction.value = 'export'
  showConfirm.value = true
}

function onConfirmQuery(confirmed) {
  showConfirm.value = false
  if (!confirmed) {
    return
  }
  if (confirmAction.value === 'export') {
    doExport()
  } else {
    doQuery()
  }
}

// 交易类型映射：consume=消费 / purchase=充值 / refund=退款，未知原样展示
function changeTypeName(changeType) {
  const key = `book_card_info.change_type.${changeType}`
  const named = t(key)
  return named === key ? changeType : named
}

// MULTI_ROW 列按逗号拆行，行内内容需避免出现英文逗号
function noComma(str) {
  return (str || '').replaceAll(',', '，')
}

function doQuery() {
  if (querying.value) {
    return
  }
  querying.value = true
  tableDynamicData.value.inLoading = true
  bookCardInfo({
    startDateStr: selectStartDate.value,
    endDateStr: selectEndDate.value,
    // 来源多选：空选传 null 不上送（后端空=不过滤）
    sourceList: selectSourceList.value && selectSourceList.value.length
        ? selectSourceList.value.map(opt => opt.value) : null,
  }).then(res => {
    if (!res || !res.data || !res.data.data) {
      return
    }
    const pageData = res.data.data
    tableDynamicData.value.dataSum = pageData.total
    tableData.value = (pageData.records || []).map(row => ({
      phone: row.phone,
      names: (row.nameList || []).map(noComma).join(','),
      // 行格式：来源 | 项目1/项目2 | $金额 | 推荐码 | 时间（空项自动省略）
      bookLines: (row.bookList || []).map(item => {
        const sourceEnum = BookSourceEnum.fromCode(item.source)
        const parts = [
          sourceEnum ? sourceEnum.name : '',
          noComma((item.skillNames || []).join('/')),
          item.amount != null ? `$${item.amount}` : '',
          item.referralCode ? `${t('book_card_info.referral_prefix')}${noComma(item.referralCode)}` : '',
          item.bookingTime,
        ]
        return parts.filter(p => p).join(' | ')
      }).join(','),
      // 总充值金额（后端已按交易类型聚合：充值加、退款减、消费忽略）
      totalRecharge: `$${row.totalRechargeAmount != null ? row.totalRechargeAmount : 0}`,
      // 行格式：门店 | 交易类型 | $金额 | 时间
      rechargeLines: (row.rechargeList || []).map(item => {
        const parts = [
          noComma(item.compName),
          changeTypeName(item.changeType),
          item.changePrice != null ? `$${item.changePrice}` : '',
          item.createDate,
        ]
        return parts.filter(p => p).join(' | ')
      }).join(','),
    }))
  }).finally(() => {
    querying.value = false
    tableDynamicData.value.inLoading = false
  })
}

// 导出 xlsx：与查询同一条后端链路（含第三方调用与其限流约束），blob 下载
function doExport() {
  if (exporting.value) {
    return
  }
  exporting.value = true
  bookCardInfoExport({
    startDateStr: selectStartDate.value,
    endDateStr: selectEndDate.value,
    sourceList: selectSourceList.value && selectSourceList.value.length
        ? selectSourceList.value.map(opt => opt.value) : null,
  }).then(async res => {
    if (!res || !res.data) {
      return
    }
    const blob = res.data
    // 后端业务错误（如限流/日期非法）会以 JSON 返回：解析后提示，不触发下载
    if (blob.type && blob.type.includes('application/json')) {
      try {
        const errorObj = JSON.parse(await blob.text())
        notifyTopWarning(errorObj.message || t('error_request'))
      } catch (e) {
        notifyTopWarning(t('error_request'))
      }
      return
    }
    const disposition = res.headers ? res.headers['content-disposition'] : ''
    const match = disposition ? disposition.match(/filename=([^;]+)/) : null
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = match ? match[1].trim() : 'card-info.xlsx'
    link.click()
    window.URL.revokeObjectURL(url)
  }).finally(() => {
    exporting.value = false
  })
}

// 注意：本页面不做 onMounted 自动查询——第三方接口有限流，必须由用户显式确认后才发起

</script>

<style scoped lang="scss">
</style>
