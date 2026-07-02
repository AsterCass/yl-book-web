<template>
  <div class="full-width">

    <div class="row items-center">

      <div class="q-ml-md">
        <h6>
          {{ $t('book_email.label.bookId') }}&nbsp;:
        </h6>
      </div>
      <q-input v-model="selectBookId" class="q-ma-md component-outline-input-std" dense outlined
               :placeholder="t('book_email.placeholder.bookId')"
               tabindex="0">
      </q-input>

      <div class="q-ml-md">
        <h6>
          {{ $t('book_email.label.status') }}&nbsp;:
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
        {{ $t('book_email.button.query') }}
      </q-btn>
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push
             unelevated @click="()=> {clearSearch(); selectData();}">
        {{ $t('book_email.button.clear') }}
      </q-btn>
    </div>

    <cask-complex-table :custom-table-operation="tableBookEmailOperation" :table-base-info="tableBookEmail"
                        :table-data="tableData"
                        :table-dynamic-data="tableDynamicData"
                        class="full-width"
                        style="padding: 2rem 5rem 0 0.5rem"
                        @operationClick="(name, row) => {
                            if(name === 'emailDetail') {
                              openEmailDetail(row)
                            }
                            if(name === 'bookDetail') {
                              detailBook = row.book
                              showBookDetail = true
                            }
                            if(name === 'reparse') {
                              toOpId = row.id
                              toOpTitle = $t('book_email.dialog.reparse.title')
                              toOpDesc = $t('book_email.dialog.reparse.content')
                              toOpFunc = reparseData
                              showOperation = true
                            }
                            if(name === 'giveup') {
                              toOpId = row.id
                              toOpTitle = $t('book_email.dialog.giveup.title')
                              toOpDesc = $t('book_email.dialog.giveup.content')
                              toOpFunc = giveupData
                              showOperation = true
                            }
                          }"
                        @toNewPage="(pageObj) => {
                            tableDynamicData.pageNo = pageObj.pageNo
                            tableDynamicData.pageSize = pageObj.pageSize
                            selectData()
                          }"
    />

    <!-- Email Detail Dialog (read-only) -->
    <q-dialog :model-value="showEmailDetail" @hide="showEmailDetail = false"
              transition-show="fade" transition-hide="fade">
      <q-card class="component-cask-dialog-judgement-std" style="max-width: 2000px !important">
        <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
          {{ $t('book_email.detail.title') }}
        </h5>

        <q-separator class="component-separator-base" inset spaced="1rem"/>

        <div v-if="detailEmail" class="q-ma-md" style="min-width: 30rem; max-width: 45rem;">
          <div style="display: grid; grid-template-columns: max-content 1fr; gap: 0.6rem; align-items: center;">

            <h6 style="white-space: nowrap;">{{ $t('book_email.detail.title_field') }}&nbsp;:</h6>
            <div>{{ detailEmail.title || '-' }}</div>

            <h6 style="white-space: nowrap;">{{ $t('book_email.detail.fromMail') }}&nbsp;:</h6>
            <div>{{ detailEmail.fromMail || '-' }}</div>

            <h6 style="white-space: nowrap;">{{ $t('book_email.detail.toMail') }}&nbsp;:</h6>
            <div>{{ detailEmail.toMail || '-' }}</div>

            <h6 style="white-space: nowrap;">{{ $t('book_email.detail.intent') }}&nbsp;:</h6>
            <div :style="`color: ${detailEmail.intentNameWebColorName}`">{{ detailEmail.intentName || '-' }}</div>

            <h6 style="white-space: nowrap;">{{ $t('book_email.detail.status') }}&nbsp;:</h6>
            <div :style="`color: ${detailEmail.statusNameWebColorName}`">{{ detailEmail.statusName || '-' }}</div>

            <h6 style="white-space: nowrap;">{{ $t('book_email.detail.source') }}&nbsp;:</h6>
            <div>{{ detailEmail.sourceName || '-' }}</div>

            <h6 style="white-space: nowrap;">{{ $t('book_email.detail.retryCount') }}&nbsp;:</h6>
            <div>{{ detailEmail.retryCount != null ? detailEmail.retryCount : '-' }}</div>

            <h6 style="white-space: nowrap; align-self: flex-start;">{{ $t('book_email.detail.errorMsg') }}&nbsp;:</h6>
            <div style="white-space: pre-wrap; word-break: break-all;">{{ detailEmail.errorMsg || '-' }}</div>

            <h6 style="white-space: nowrap;">{{ $t('book_email.detail.createTime') }}&nbsp;:</h6>
            <div>{{ detailEmail.createTime || '-' }}</div>

            <h6 style="white-space: nowrap;">{{ $t('book_email.detail.content') }}&nbsp;:</h6>
            <div/>
          </div>

          <q-scroll-area :thumb-style="globalState.curThemeName === 'dark' ?
                         { background: 'white', width: '3px', height: '3px', opacity: '0.3' } :
                          { background: 'black', width: '3px', height: '3px',  opacity: '0.3' }"
                         style="height: 16rem;"
                         class="q-mt-sm email-content-box" :visible="true">
            <div class="email-content">{{ cleanedContent || '-' }}</div>
          </q-scroll-area>
        </div>

        <div class="row q-mt-xl q-mb-md justify-center">
          <q-btn class="shadow-1 component-outline-btn-grow" no-caps unelevated @click="showEmailDetail = false">
            {{ $t('book_email.detail.close') }}
          </q-btn>
        </div>
      </q-card>
    </q-dialog>

    <!-- Booking Detail Dialog (shared, read-only) -->
    <cask-book-detail-dialog v-model="showBookDetail" :book="detailBook"/>

    <cask-dialog-judgment v-model="showOperation"
                          :callback-method="isTrue => { showOperation = false; if (isTrue) toOpFunc() }"
                          :dialog-judgment-data="{ title: toOpTitle, content: toOpDesc, falseLabel: $t('book_email.dialog.common.cancel'), trueLabel: $t('book_email.dialog.common.confirm') }"
    />
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from "vue";
import {useI18n} from 'vue-i18n'
import {notifyTopPositive, notifyTopWarning} from "@/utils/notification-tools.js";
import CaskComplexTable from "@/ui/components/CaskComplexTable.vue";
import CaskBookDetailDialog from "@/ui/components/CaskBookDetailDialog.vue";
import CaskDialogJudgment from "@/ui/components/CaskDialogJudgment.vue";
import {tableBookEmail, tableBookEmailOperation} from "@/tables/book-email.js";
import {bookEmailGiveup, bookEmailList, bookEmailReparse} from "@/api/book.js";
import {BookEmailStatusEnum, BookSourceEnum, EmailIntentEnum} from "@/constants/enums/book.js";
import {useGlobalStateStore} from "@/utils/global-state.js";

const globalState = useGlobalStateStore();
const {t} = useI18n()
const selectBookId = ref("")
const selectStatus = ref(null)
const statusOptions = ref(BookEmailStatusEnum.toSelectForm())

function clearSearch() {
  selectBookId.value = ""
  selectStatus.value = null
}

// 列表长文本截断：超过 30 字符以 ... 代替
function truncate(str, max = 30) {
  if (!str) {
    return ''
  }
  const text = String(str).trim()
  return text.length > max ? text.slice(0, max) + '...' : text
}

// email detail
const showEmailDetail = ref(false)
const detailEmail = ref(null)

function openEmailDetail(row) {
  detailEmail.value = row
  showEmailDetail.value = true
}

// 纯文本兜底展示：折叠 3 行以上连续空行、去除行尾/首尾空白（HTML 原文优先用 iframe 渲染）
const cleanedContent = computed(() => {
  const raw = detailEmail.value && detailEmail.value.content ? detailEmail.value.content : ''
  return raw
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
})

// booking detail (shared dialog)
const showBookDetail = ref(false)
const detailBook = ref(null)

// op confirm (reparse / giveup)
const showOperation = ref(false)
const toOpId = ref("")
const toOpTitle = ref("")
const toOpDesc = ref("")
const toOpFunc = ref(null)

function reparseData() {
  if (!toOpId.value) {
    notifyTopWarning(t('validation.insufficient_parameters'))
    return
  }
  bookEmailReparse(toOpId.value).then(res => {
    if (!res || !res.data) {
      return
    }
    notifyTopPositive(t('book_email.notify.reparse_success'))
    selectData()
  })
}

function giveupData() {
  if (!toOpId.value) {
    notifyTopWarning(t('validation.insufficient_parameters'))
    return
  }
  bookEmailGiveup(toOpId.value).then(res => {
    if (!res || !res.data) {
      return
    }
    notifyTopPositive(t('book_email.notify.giveup_success'))
    selectData()
  })
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

function selectData() {
  tableDynamicData.value.inLoading = true
  const param = {
    bookId: selectBookId.value,
    status: selectStatus.value ? selectStatus.value.value : null,
    pageNo: tableDynamicData.value.pageNo, pageSize: tableDynamicData.value.pageSize,
  }

  bookEmailList(param).then(res => {
    if (!res || !res.data || !res.data.data) {
      tableDynamicData.value.inLoading = false
      return
    }
    const thisData = res.data.data.records
    tableDynamicData.value.dataSum = res.data.data.total
    thisData.forEach(data => {
      const statusEnum = BookEmailStatusEnum.fromCode(data.status)
      data.statusName = statusEnum ? statusEnum.name : '未知'
      data.statusNameWebColorName = statusEnum ? statusEnum.color : 'rgb(128, 128, 128)'
      const intentEnum = EmailIntentEnum.fromCode(data.intent)
      data.intentName = intentEnum ? intentEnum.name : '-'
      data.intentNameWebColorName = intentEnum ? intentEnum.color : 'rgb(128, 128, 128)'
      const sourceEnum = data.source != null ? BookSourceEnum.fromCode(data.source) : null
      data.sourceName = sourceEnum ? sourceEnum.name : '-'
      // 列表长文本截断展示（完整值保留在原字段，供详情弹窗使用）
      data.titleDisplay = truncate(data.title)
      data.contentDisplay = truncate(data.content)
      data.errorMsgDisplay = truncate(data.errorMsg)
      // op flags
      data.emailDetailOp = true
      data.bookDetailOp = !!data.book
      // 重试：未处理(0) / 处理失败(-1)；无需处理：未处理(0) / 处理失败(-1)
      data.reparseOp = data.status === 0 || data.status === -1
      data.giveupOp = data.status === 0 || data.status === -1
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

.email-content-box {
  border: 1px solid rgba(128, 128, 128, .3);
  border-radius: .4rem;
  background: rgba(128, 128, 128, .06);
}

.email-content {
  padding: .6rem .8rem;
  font-size: .8rem;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

</style>
