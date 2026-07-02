<template>
  <div class="full-width">

    <div class="row items-center">

      <div class="q-ml-md">
        <h6>
          {{ $t('book_email.label.fromMail') }}&nbsp;:
        </h6>
      </div>
      <q-input v-model="selectFromMail" class="q-ma-md component-outline-input-std" dense outlined
               :placeholder="t('book_email.placeholder.fromMail')"
               tabindex="0">
      </q-input>

      <div class="q-ml-md">
        <h6>
          {{ $t('book_email.label.intent') }}&nbsp;:
        </h6>
      </div>
      <q-select v-model="selectIntent" :menu-offset="[0, 5]" :options="intentOptions"
                class="q-ma-md component-outline-input-grow"
                clear-icon="fa-solid fa-xmark"
                clearable
                dropdown-icon="fa-solid fa-caret-down" menu-anchor="bottom start"
                outlined popup-content-class="component-extra-card-std">
      </q-select>

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
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from "vue";
import {useI18n} from 'vue-i18n'
import CaskComplexTable from "@/ui/components/CaskComplexTable.vue";
import CaskBookDetailDialog from "@/ui/components/CaskBookDetailDialog.vue";
import {tableBookEmail, tableBookEmailOperation} from "@/tables/book-email.js";
import {bookEmailList} from "@/api/book.js";
import {BookEmailStatusEnum, BookSourceEnum, EmailIntentEnum} from "@/constants/enums/book.js";
import {useGlobalStateStore} from "@/utils/global-state.js";

const globalState = useGlobalStateStore();
const {t} = useI18n()
const selectFromMail = ref("")
const selectStatus = ref(null)
const selectIntent = ref(null)
const statusOptions = ref(BookEmailStatusEnum.toSelectForm())
const intentOptions = ref(EmailIntentEnum.toSelectForm())

function clearSearch() {
  selectFromMail.value = ""
  selectStatus.value = null
  selectIntent.value = null
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
    fromMail: selectFromMail.value,
    status: selectStatus.value ? selectStatus.value.value : null,
    intent: selectIntent.value ? selectIntent.value.value : null,
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
      // op flags
      data.emailDetailOp = true
      data.bookDetailOp = !!data.book
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
