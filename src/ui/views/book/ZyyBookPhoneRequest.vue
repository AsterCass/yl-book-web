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

      <!-- 联系电话：包含匹配，后端只取数字（带括号/空格/横杠/+1 都能搜，输入部分数字也行） -->
      <div class="q-ml-md">
        <h6>
          {{ $t('book_phone_request.label.phone') }}&nbsp;:
        </h6>
      </div>
      <q-input v-model="selectPhone" class="q-ma-md component-outline-input-std" dense outlined
               :placeholder="t('book_phone_request.placeholder.phone')"
               tabindex="0" @keyup.enter="selectData()">
      </q-input>

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
                        @enterSearch="selectData()"
                        @toNewPage="(pageObj) => {
                            tableDynamicData.pageNo = pageObj.pageNo
                            tableDynamicData.pageSize = pageObj.pageSize
                            selectData(true)
                          }"
    />

    <!-- 统一编辑弹窗：需求本身只读展示 + 处理状态 / 运营备注（仅内部） / 门店答复 comment（客户可见）。
         与预约日历电话需求栏共用 -->
    <cask-phone-request-edit-dialog v-model="showEdit" :request="editRow" @saved="selectData(true)"/>

    <!-- 回访拨号：先拨门店电话、按 1 才接通客户，二次确认防误呼。与预约日历电话需求栏共用 -->
    <cask-phone-request-call ref="callRef" @called="selectData(true)"/>

  </div>
</template>

<script setup>

import {computed, onMounted, ref, watch} from "vue";
import {useI18n} from 'vue-i18n'
import CaskComplexTable from "@/ui/components/CaskComplexTable.vue";
import CaskDatePicker from "@/ui/components/CaskDatePicker.vue";
import CaskPhoneRequestEditDialog from "@/ui/components/CaskPhoneRequestEditDialog.vue";
import CaskPhoneRequestCall from "@/ui/components/CaskPhoneRequestCall.vue";
import {tablePhoneRequest, tablePhoneRequestOperation} from "@/tables/book.js";
import {bookPhoneRequestList} from "@/api/book.js";
import {PhoneRequestHandleStatusEnum} from "@/constants/enums/book.js";
import {phoneRequestStatusName, phoneRequestStatusOptions} from "@/utils/phone-request.js";

const {t, locale} = useI18n()

// 筛选：记录日期区间 + 处理状态 + 联系电话（模糊，空=不过滤）；需求类型为 AI 自拟的自由文本标签，不做筛选
const selectStartDate = ref("")
const selectEndDate = ref("")
const selectHandleStatus = ref(null)
const selectPhone = ref("")
// 状态名走 i18n，随界面语言切换
const handleStatusOptions = computed(() => phoneRequestStatusOptions())

function clearSearch() {
  selectStartDate.value = ""
  selectEndDate.value = ""
  selectHandleStatus.value = null
  selectPhone.value = ""
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
    phone: selectPhone.value.trim() || null,
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
        comment: row.comment || '',
        handleStatusName: phoneRequestStatusName(row.handleStatus),
        handleStatusNameWebColorName: statusEnum ? statusEnum.color : 'rgb(128, 128, 128)',
        // 统一编辑（状态/备注/答复）：所有行可用
        editOp: true,
        // 拨打电话：所有行可用（门店号码没配全时点了给提示，不静默禁用——否则店员不知道为什么没有按钮）
        callOp: true,
        // 回访记录：次数 + 最近一次（谁、什么时候），TEXT 列渲染换行
        callShow: row.callCount
            ? [t('book_phone_request.call_count', {count: row.callCount}),
              `${row.lastCallTime || ''} ${row.lastCallOperator || ''}`.trim()]
                .filter(p => p).join('\n')
            : '-',
      }
    })
    tableDynamicData.value.inLoading = false
  })
}

// ===== 统一编辑（处理状态 + 备注（仅内部） + 答复 comment（客户可见）） / 回访拨号：弹窗见共用组件 =====

const showEdit = ref(false)
const editRow = ref(null)
const callRef = ref(null)

function onOperationClick(name, row) {
  if (name === 'edit') {
    editRow.value = row
    showEdit.value = true
  }
  if (name === 'call') {
    callRef.value.open(row)
  }
}

onMounted(() => {
  selectData()
})

// 表格行里的状态名等是取数时按当时语言生成的：切换界面语言后重新取当前页（同 ZyyStaffDevice）
watch(locale, () => {
  selectData(true)
})
</script>

<style scoped lang="scss">
</style>
