<template>
  <div class="full-width">

    <!-- AI 通话复盘：每通真实来电结束后 yl-phone-spring-ai 送来的档案（对话、工具调用与返回、每轮系统事实）
         + 定时裁判的评判（第二阶段写入）。门店范围跟随页头：总门店 = 账户有权限的全部门店，切到某家门店 = 只看那家 -->
    <div class="row items-center">

      <div class="q-ml-md">
        <h6>
          {{ $t('book_ai_call_review.label.start_date') }}&nbsp;:
        </h6>
      </div>
      <cask-date-picker v-model="selectStartDate" class="q-ma-md"
                        input-class="component-outline-input-std"/>

      <div class="q-ml-md">
        <h6>
          {{ $t('book_ai_call_review.label.end_date') }}&nbsp;:
        </h6>
      </div>
      <cask-date-picker v-model="selectEndDate" class="q-ma-md"
                        input-class="component-outline-input-std"/>

      <div class="q-ml-md">
        <h6>
          {{ $t('book_ai_call_review.label.review_status') }}&nbsp;:
        </h6>
      </div>
      <q-select v-model="selectReviewStatus" :menu-offset="[0, 5]" :options="reviewStatusOptions"
                class="q-ma-md component-outline-input-std"
                clear-icon="fa-solid fa-xmark"
                clearable
                dropdown-icon="fa-solid fa-caret-down" menu-anchor="bottom start"
                outlined popup-content-class="component-extra-card-std-limit">
      </q-select>

      <div class="q-ml-md">
        <h6>
          {{ $t('book_ai_call_review.label.pass') }}&nbsp;:
        </h6>
      </div>
      <q-select v-model="selectPass" :menu-offset="[0, 5]" :options="passOptions"
                class="q-ma-md component-outline-input-std"
                clear-icon="fa-solid fa-xmark"
                clearable
                dropdown-icon="fa-solid fa-caret-down" menu-anchor="bottom start"
                outlined popup-content-class="component-extra-card-std-limit">
      </q-select>

      <div class="q-ml-md">
        <h6>
          {{ $t('book_ai_call_review.label.ops_status') }}&nbsp;:
        </h6>
      </div>
      <q-select v-model="selectOpsStatus" :menu-offset="[0, 5]" :options="opsStatusOptions"
                class="q-ma-md component-outline-input-std"
                clear-icon="fa-solid fa-xmark"
                clearable
                dropdown-icon="fa-solid fa-caret-down" menu-anchor="bottom start"
                outlined popup-content-class="component-extra-card-std-limit">
      </q-select>

    </div>

    <div class="row items-center">

      <div class="q-ml-md">
        <h6>
          {{ $t('book_ai_call_review.label.ended_by') }}&nbsp;:
        </h6>
      </div>
      <q-select v-model="selectEndedBy" :menu-offset="[0, 5]" :options="endedByOptions"
                class="q-ma-md component-outline-input-std"
                clear-icon="fa-solid fa-xmark"
                clearable
                dropdown-icon="fa-solid fa-caret-down" menu-anchor="bottom start"
                outlined popup-content-class="component-extra-card-std-limit">
      </q-select>

      <div class="q-ml-md">
        <h6>
          {{ $t('book_ai_call_review.label.phone') }}&nbsp;:
        </h6>
      </div>
      <q-input v-model="selectPhone" class="q-ma-md component-outline-input-std" dense outlined
               :placeholder="t('book_ai_call_review.placeholder.phone')" @keyup.enter="selectData()"/>

      <div class="q-ml-md">
        <h6>
          {{ $t('book_ai_call_review.label.keyword') }}&nbsp;:
        </h6>
      </div>
      <q-input v-model="selectKeyword" class="q-ma-md component-outline-input-std" dense outlined
               :placeholder="t('book_ai_call_review.placeholder.keyword')" @keyup.enter="selectData()"/>

    </div>

    <div class="row items-center">
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push unelevated @click="selectData()">
        {{ $t('book_ai_call_review.button.query') }}
      </q-btn>
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push unelevated
             @click="() => {clearSearch(); selectData();}">
        {{ $t('book_ai_call_review.button.clear') }}
      </q-btn>
    </div>

    <div class="q-ml-md q-mt-sm" style="max-width: 80%; opacity: .5; font-size: .85rem">
      {{ $t('book_ai_call_review.note') }}
    </div>

    <cask-complex-table :custom-table-operation="tableAiCallReviewOperation" :table-base-info="tableAiCallReview"
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

    <!-- 详情弹窗：左边逐轮对话（每轮下面折叠工具调用与系统事实），右边通话信息 + 裁判评判 + 运营标记 -->
    <q-dialog :model-value="showDetail" @hide="showDetail = false"
              transition-show="fade" transition-hide="fade">
      <q-card class="component-cask-dialog-judgement-std" style="max-width: 2000px !important; width: 96vw">
        <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
          {{ $t('book_ai_call_review.detail.title') }}
        </h5>

        <q-separator class="component-separator-base" inset spaced="1rem"/>

        <div v-if="detail" class="row q-ma-md" style="max-height: 72vh; overflow: auto; min-width: 60rem">

          <!-- 左：对话记录 -->
          <div class="col-7 q-pr-md">
            <div class="q-mb-sm" style="font-weight: 600">
              {{ $t('book_ai_call_review.detail.transcript') }}
            </div>
            <div v-if="transcriptGroups.length === 0" style="opacity: .6">
              {{ $t('book_ai_call_review.detail.no_transcript') }}
            </div>
            <div v-for="group in transcriptGroups" :key="group.turn" class="q-mb-sm">
              <div v-for="(line, i) in group.lines" :key="i" class="q-mb-xs"
                   :style="line.code ? 'opacity: .6; font-style: italic' : ''">
                <span style="opacity: .5; font-size: .8rem">[{{ line.turn }}]</span>
                <span style="font-weight: 600"
                      :style="line.role === 'customer' ? 'color: rgb(74, 124, 168)' : 'color: rgb(68, 117, 80)'">
                  &nbsp;{{ line.role === 'customer' ? $t('book_ai_call_review.detail.customer') : $t('book_ai_call_review.detail.ai') }}
                </span>
                <span v-if="line.code" style="opacity: .7; font-size: .8rem">〔{{ $t('book_ai_call_review.detail.code_tag') }}〕</span>
                <span>:&nbsp;</span>
                <span style="white-space: pre-wrap; overflow-wrap: anywhere">{{ line.text }}</span>
                <span v-if="line.cut" style="opacity: .5; font-size: .8rem">〔{{ $t('book_ai_call_review.detail.cut_tag') }}〕</span>
                <span v-if="line.signal" style="opacity: .6; font-size: .8rem">〔{{ line.signal }}〕</span>
              </div>
              <q-expansion-item v-if="group.tools.length > 0 || group.record" class="q-ml-md" dense dense-toggle
                                header-style="opacity: .7; font-size: .85rem; padding-left: 0"
                                :label="group.tools.length > 0
                                  ? t('book_ai_call_review.detail.tools_label', {n: group.tools.length})
                                  : t('book_ai_call_review.detail.facts_label')">
                <div v-for="tool in group.tools" :key="tool.id" class="q-pa-sm"
                     style="border-left: 2px solid rgba(128, 128, 128, .3); margin: .3rem 0 .3rem .5rem">
                  <div style="font-weight: 600">
                    {{ tool.name }}
                    <span v-if="tool.outcome" :style="`font-weight: 400; color: ${outcomeColor(tool.outcome)}`">
                      &nbsp;· {{ tool.outcome }}
                    </span>
                  </div>
                  <div style="opacity: .6; font-size: .8rem">{{ $t('book_ai_call_review.detail.input') }}</div>
                  <pre class="review-pre">{{ pretty(tool.input) }}</pre>
                  <div style="opacity: .6; font-size: .8rem">{{ $t('book_ai_call_review.detail.result') }}</div>
                  <pre class="review-pre">{{ tool.result || '-' }}<span v-if="tool.truncated">{{ $t('book_ai_call_review.detail.truncated') }}</span></pre>
                </div>
                <div v-if="group.record" class="q-ml-sm q-mt-xs" style="font-size: .8rem; opacity: .75">
                  <span v-for="f in factItems(group.record)" :key="f.key" class="q-mr-md" style="white-space: nowrap">
                    {{ f.key }}={{ f.value }}
                  </span>
                </div>
              </q-expansion-item>
            </div>

            <q-expansion-item class="q-mt-md" dense dense-toggle header-style="opacity: .7; font-size: .85rem; padding-left: 0"
                              :label="t('book_ai_call_review.detail.knowledge')">
              <pre class="review-pre" style="max-height: 24rem">{{ detail.knowledge || '-' }}</pre>
            </q-expansion-item>
            <!-- Vapi 自己的转写（它那边 STT 的版本，可能与本地记录有出入；裁判不用它） -->
            <q-expansion-item v-if="vapiTranscript" class="q-mt-xs" dense dense-toggle
                              header-style="opacity: .7; font-size: .85rem; padding-left: 0"
                              :label="t('book_ai_call_review.detail.vapi_transcript')">
              <pre class="review-pre" style="max-height: 24rem">{{ vapiTranscript }}</pre>
            </q-expansion-item>
          </div>

          <!-- 右：通话信息 + 评判 + 运营标记 -->
          <div class="col-5 q-pl-md" style="border-left: 1px solid rgba(128, 128, 128, .25)">
            <div style="display: grid; grid-template-columns: max-content 1fr; gap: .35rem .8rem; align-items: center; font-size: .9rem">
              <h6 style="white-space: nowrap;">{{ $t('book_ai_call_review.detail.store') }}&nbsp;:</h6>
              <div>{{ detail.storeName || '-' }}</div>
              <h6 style="white-space: nowrap;">{{ $t('book_ai_call_review.detail.caller') }}&nbsp;:</h6>
              <div>{{ detail.callerPhone || '-' }}</div>
              <h6 style="white-space: nowrap;">{{ $t('book_ai_call_review.detail.called') }}&nbsp;:</h6>
              <div>{{ detail.calledPhone || '-' }}</div>
              <h6 style="white-space: nowrap;">{{ $t('book_ai_call_review.detail.started') }}&nbsp;:</h6>
              <div>{{ detail.startedAt || '-' }}</div>
              <h6 style="white-space: nowrap;">{{ $t('book_ai_call_review.detail.ended') }}&nbsp;:</h6>
              <div>{{ detail.endedAt || '-' }}</div>
              <h6 style="white-space: nowrap;">{{ $t('book_ai_call_review.detail.duration') }}&nbsp;:</h6>
              <div>{{ durationShow(detail.durationSec) }}</div>
              <h6 style="white-space: nowrap;">{{ $t('book_ai_call_review.detail.ended_by') }}&nbsp;:</h6>
              <div :style="`color: ${detail.endedByNameWebColorName}`">
                {{ detail.endedByName || '-' }}
                <span v-if="detail.vapiEndedReason" style="opacity: .6; font-size: .8rem">（Vapi: {{ detail.vapiEndedReason }}）</span>
              </div>
              <h6 style="white-space: nowrap; align-self: flex-start;">{{ $t('book_ai_call_review.detail.recording') }}&nbsp;:</h6>
              <div v-if="detail.recordingUrl">
                <!-- Vapi 存储的录音（优先双声道）：直接播放 + 新窗口打开 -->
                <audio controls preload="none" :src="detail.recordingUrl" style="max-width: 100%; height: 2rem"></audio>
                <div style="font-size: .8rem">
                  <a :href="detail.recordingUrl" target="_blank" rel="noopener" style="color: rgb(var(--pointer))">
                    {{ $t('book_ai_call_review.detail.recording_open') }}
                  </a>
                </div>
              </div>
              <div v-else style="opacity: .6">{{ $t('book_ai_call_review.detail.no_recording') }}</div>
              <h6 style="white-space: nowrap;">{{ $t('book_ai_call_review.detail.lang') }}&nbsp;:</h6>
              <div>{{ detail.langName || '-' }}</div>
              <h6 style="white-space: nowrap;">{{ $t('book_ai_call_review.detail.turns') }}&nbsp;:</h6>
              <div>{{ detail.customerTurns != null ? detail.customerTurns : '-' }}</div>
              <h6 style="white-space: nowrap;">{{ $t('book_ai_call_review.detail.review_status') }}&nbsp;:</h6>
              <div :style="`color: ${detail.reviewStatusNameWebColorName}`">{{ detail.reviewStatusName || '-' }}</div>
              <h6 style="white-space: nowrap;">{{ $t('book_ai_call_review.detail.call_id') }}&nbsp;:</h6>
              <div style="overflow-wrap: anywhere; font-size: .8rem; opacity: .8">{{ detail.callId || '-' }}</div>
              <h6 style="white-space: nowrap;">{{ $t('book_ai_call_review.detail.call_sid') }}&nbsp;:</h6>
              <div style="overflow-wrap: anywhere; font-size: .8rem; opacity: .8">{{ detail.callSid || '-' }}</div>
              <h6 style="white-space: nowrap;">{{ $t('book_ai_call_review.detail.service_version') }}&nbsp;:</h6>
              <div>{{ detail.serviceVersion || '-' }}</div>
            </div>

            <q-separator class="q-my-md"/>

            <div style="font-weight: 600">{{ $t('book_ai_call_review.detail.verdict') }}</div>
            <template v-if="detail.reviewStatus === AiCallReviewStatusEnum.REVIEWED.code">
              <div class="q-mt-xs">
                <span :style="`color: ${detail.passNameWebColorName}; font-weight: 600`">{{ detail.passName }}</span>
                <span v-if="detail.severityName" class="q-ml-md" style="opacity: .8">
                  {{ $t('book_ai_call_review.detail.severity') }}: {{ detail.severityName }}
                </span>
                <span v-if="detail.judgeModel" class="q-ml-md" style="opacity: .6; font-size: .8rem">
                  {{ detail.judgeModel }}<span v-if="detail.judgeEffort"> / {{ detail.judgeEffort }}</span>
                  <span v-if="detail.criteriaVersion"> / {{ detail.criteriaVersion }}</span> · {{ detail.reviewedAt }}
                  <span v-if="detail.rejudgeCount > 0"> · {{ $t('book_ai_call_review.detail.rejudge_count', {n: detail.rejudgeCount}) }}</span>
                </span>
              </div>
              <div v-if="detailTags.length > 0" class="q-mt-xs">
                <q-chip v-for="tag in detailTags" :key="tag" dense size="sm" outline>{{ tag }}</q-chip>
              </div>
              <div class="q-mt-sm" style="white-space: pre-wrap">{{ detail.summary || '-' }}</div>
              <div v-if="detail.did" class="q-mt-sm" style="font-size: .9rem">
                <span style="opacity: .6">{{ $t('book_ai_call_review.detail.did') }}: </span>
                <span style="white-space: pre-wrap">{{ detail.did }}</span>
              </div>
              <div v-if="detailProblems.length > 0" class="q-mt-sm">
                <div style="opacity: .6; font-size: .9rem">{{ $t('book_ai_call_review.detail.problems') }}</div>
                <div v-for="(p, i) in detailProblems" :key="i" class="q-mt-xs" style="font-size: .9rem">
                  <span style="opacity: .5">[{{ p.turn != null ? p.turn : '-' }}]</span>
                  <span class="q-ml-xs" style="font-weight: 600">{{ p.criterion || '' }}</span>
                  <span v-if="p.severity" class="q-ml-xs" :style="`color: ${severityColor(p.severity)}`">{{ p.severity }}</span>
                  <span class="q-ml-xs" style="white-space: pre-wrap">{{ p.issue }}</span>
                </div>
              </div>
            </template>
            <div v-else-if="detail.reviewStatus === AiCallReviewStatusEnum.FAILED.code" class="q-mt-xs"
                 style="color: rgb(200, 60, 60); white-space: pre-wrap; font-size: .9rem">
              {{ $t('book_ai_call_review.detail.failed') }}: {{ detail.reviewError || '-' }}
            </div>
            <div v-else-if="detail.reviewStatus === AiCallReviewStatusEnum.NO_DIALOGUE.code" class="q-mt-xs" style="opacity: .6">
              {{ $t('book_ai_call_review.detail.no_dialogue') }}
            </div>
            <div v-else class="q-mt-xs" style="opacity: .6">
              {{ $t('book_ai_call_review.detail.pending') }}
            </div>
            <!-- 代码核对的系统备注：语言不符、该挂没挂、写入没成、被抢位、走了兜底、首包慢…（裁判也拿到了同一份） -->
            <div v-if="detailChecks.length > 0" class="q-mt-sm">
              <div style="opacity: .6; font-size: .9rem">{{ $t('book_ai_call_review.detail.checks') }}</div>
              <div v-for="(c, i) in detailChecks" :key="i" class="q-mt-xs" style="font-size: .85rem; opacity: .85">
                <q-badge outline color="grey-7" class="q-mr-xs">{{ c.key }}</q-badge>
                <span style="white-space: pre-wrap">{{ c.note }}</span>
              </div>
            </div>
            <q-btn v-if="detail.rejudgeOp" class="q-mt-sm shadow-1 component-outline-btn-grow" no-caps unelevated
                   :loading="rejudging" @click="openRejudge(detail)">
              {{ $t('book_ai_call_review.detail.rejudge') }}
            </q-btn>

            <q-separator class="q-my-md"/>

            <div style="font-weight: 600">{{ $t('book_ai_call_review.detail.ops') }}</div>
            <div class="q-mt-xs">
              <span :style="`color: ${detail.opsStatusNameWebColorName}`">{{ detail.opsStatusName }}</span>
              <span v-if="detail.opsTime" class="q-ml-md" style="opacity: .6; font-size: .8rem">
                {{ $t('book_ai_call_review.detail.ops_by') }} {{ detail.opsTime }}
              </span>
            </div>
            <div v-if="detail.opsRemark" class="q-mt-xs" style="white-space: pre-wrap; font-size: .9rem">{{ detail.opsRemark }}</div>
            <q-btn class="q-mt-sm shadow-1 component-outline-btn-grow" no-caps unelevated @click="openOps(detail)">
              {{ $t('book_ai_call_review.ops_dialog.title') }}
            </q-btn>
          </div>

        </div>

        <div class="row q-mt-lg q-mb-md justify-evenly">
          <q-btn class="shadow-1 component-outline-btn-grow" no-caps unelevated @click="showDetail = false">
            {{ $t('book_ai_call_review.detail.close') }}
          </q-btn>
        </div>
      </q-card>
    </q-dialog>

    <!-- 运营标记弹窗：处理状态 + 备注（保存空内容即清空） -->
    <q-dialog :model-value="showOps" transition-hide="fade" no-backdrop-dismiss no-shake
              transition-show="fade" @hide="showOps = false">
      <q-card class="component-cask-dialog-judgement-std" style="max-width: 2000px !important">
        <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
          {{ $t('book_ai_call_review.ops_dialog.title') }}
        </h5>

        <q-separator class="component-separator-base" inset spaced="1rem"/>

        <div class="q-ma-md" style="min-width: 36rem">

          <div class="q-mb-xs" style="font-weight: 600">
            {{ $t('book_ai_call_review.ops_dialog.status_label') }}
          </div>
          <q-select v-model="opsStatus" :menu-offset="[0, 5]" :options="opsStatusOptions"
                    class="component-outline-input-grow"
                    dense dropdown-icon="fa-solid fa-caret-down" menu-anchor="bottom start"
                    outlined popup-content-class="component-extra-card-std-limit"/>

          <div class="q-mt-md q-mb-xs" style="font-weight: 600">
            {{ $t('book_ai_call_review.ops_dialog.remark_label') }}
          </div>
          <q-input v-model="opsRemark"
                   dense outlined class="component-outline-input-grow"
                   :placeholder="t('book_ai_call_review.ops_dialog.remark_placeholder')"/>

        </div>

        <div class="row q-mt-lg q-mb-md justify-evenly">
          <q-btn class="shadow-1 component-full-btn-grow" no-caps unelevated :loading="opsSaving"
                 @click="saveOps">
            {{ $t('main_setting_save') }}
          </q-btn>
          <q-btn class="shadow-1 component-outline-btn-grow" no-caps unelevated
                 @click="showOps = false">
            {{ $t('main_setting_cancel') }}
          </q-btn>
        </div>
      </q-card>
    </q-dialog>

    <!-- 重判确认：覆盖现有评判、等下一轮定时裁判（每小时）、消耗一次模型调用 -->
    <cask-dialog-judgment v-model="showRejudge"
                          :callback-method="onConfirmRejudge"
                          :dialog-judgment-data="{
                            title: t('book_ai_call_review.rejudge_dialog.title'),
                            content: t('book_ai_call_review.rejudge_dialog.content'),
                            falseLabel: t('book_ai_call_review.rejudge_dialog.cancel'),
                            trueLabel: t('book_ai_call_review.rejudge_dialog.confirm'),
                          }"
    />

  </div>
</template>

<script setup>

import {onMounted, ref} from "vue";
import {useI18n} from 'vue-i18n'
import {notifyTopPositive} from "@/utils/notification-tools.js";
import CaskComplexTable from "@/ui/components/CaskComplexTable.vue";
import CaskDatePicker from "@/ui/components/CaskDatePicker.vue";
import {tableAiCallReview, tableAiCallReviewOperation} from "@/tables/book.js";
import {bookAiCallReviewDetail, bookAiCallReviewList, bookAiCallReviewOps, bookAiCallReviewRejudge} from "@/api/book.js";
import CaskDialogJudgment from "@/ui/components/CaskDialogJudgment.vue";
import {
  AiCallEndedByEnum,
  AiCallLangEnum,
  AiCallReviewOpsStatusEnum,
  AiCallReviewSeverityEnum,
  AiCallReviewStatusEnum
} from "@/constants/enums/book.js";

const {t} = useI18n()

// 筛选：通话日期区间（默认最近 7 天）+ 复盘状态 / 结论 / 处理状态 / 结束方式 + 来电号码 / 关键词
const selectStartDate = ref(daysAgo(6))
const selectEndDate = ref("")
const selectReviewStatus = ref(null)
const selectPass = ref(null)
const selectOpsStatus = ref(null)
const selectEndedBy = ref(null)
const selectPhone = ref("")
const selectKeyword = ref("")
const reviewStatusOptions = ref(AiCallReviewStatusEnum.toSelectForm())
const opsStatusOptions = ref(AiCallReviewOpsStatusEnum.toSelectForm())
const endedByOptions = ref(AiCallEndedByEnum.toSelectForm())
const passOptions = ref([
  {label: t('book_ai_call_review.pass_true'), value: true},
  {label: t('book_ai_call_review.pass_false'), value: false},
])

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function clearSearch() {
  selectStartDate.value = ""
  selectEndDate.value = ""
  selectReviewStatus.value = null
  selectPass.value = null
  selectOpsStatus.value = null
  selectEndedBy.value = null
  selectPhone.value = ""
  selectKeyword.value = ""
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
  bookAiCallReviewList({
    pageNo: tableDynamicData.value.pageNo,
    pageSize: tableDynamicData.value.pageSize,
    startDateStr: selectStartDate.value || null,
    endDateStr: selectEndDate.value || null,
    reviewStatus: selectReviewStatus.value ? selectReviewStatus.value.value : null,
    opsStatus: selectOpsStatus.value ? selectOpsStatus.value.value : null,
    pass: selectPass.value ? selectPass.value.value : null,
    endedBy: selectEndedBy.value ? selectEndedBy.value.value : null,
    phone: selectPhone.value || null,
    keyword: selectKeyword.value || null,
  }).then(res => {
    if (!res || !res.data || !res.data.data) {
      tableDynamicData.value.inLoading = false
      return
    }
    tableDynamicData.value.dataSum = res.data.data.total
    tableData.value = (res.data.data.records || []).map(row => decorate(row))
    tableDynamicData.value.inLoading = false
  })
}

// 行装饰：枚举名与颜色（ICON_COLOR 列）、时长与标签的展示文本；列表与详情共用
function decorate(row) {
  const reviewEnum = AiCallReviewStatusEnum.fromCode(row.reviewStatus)
  const opsEnum = AiCallReviewOpsStatusEnum.fromCode(row.opsStatus)
  const endedEnum = AiCallEndedByEnum.fromCode(row.endedBy)
  const langEnum = AiCallLangEnum.fromCode(row.lang)
  const severityEnum = AiCallReviewSeverityEnum.fromCode(row.severity)
  let passName = '-'
  let passColor = 'rgb(128, 128, 128)'
  if (row.pass === true) {
    passName = t('book_ai_call_review.pass_true')
    passColor = 'rgb(68, 117, 80)'
  } else if (row.pass === false) {
    passName = t('book_ai_call_review.pass_false')
    passColor = 'rgb(200, 60, 60)'
  }
  return {
    ...row,
    storeName: row.storeName || '-',
    callerPhone: row.callerPhone || '-',
    durationShow: durationShow(row.durationSec),
    endedByName: endedEnum ? endedEnum.name : (row.endedBy || '-'),
    endedByNameWebColorName: endedEnum ? endedEnum.color : 'rgb(128, 128, 128)',
    langName: langEnum ? langEnum.name : (row.lang || '-'),
    reviewStatusName: reviewEnum ? reviewEnum.name : '',
    reviewStatusNameWebColorName: reviewEnum ? reviewEnum.color : 'rgb(128, 128, 128)',
    passName,
    passNameWebColorName: passColor,
    severityName: severityEnum ? severityEnum.name : (row.severity || ''),
    tagsShow: parseJsonArray(row.tags).join(' / '),
    summary: row.summary || '',
    opsStatusName: opsEnum ? opsEnum.name : '',
    opsStatusNameWebColorName: opsEnum ? opsEnum.color : 'rgb(128, 128, 128)',
    opsRemark: row.opsRemark || '',
    detailOp: true,
    opsOp: true,
    // 重判：裁判跑过（已复盘 / 复盘失败）且客户说过话的才能重判
    rejudgeOp: (row.reviewStatus === AiCallReviewStatusEnum.REVIEWED.code
        || row.reviewStatus === AiCallReviewStatusEnum.FAILED.code) && row.customerTurns > 0,
  }
}

function durationShow(sec) {
  if (sec == null) {
    return '-'
  }
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m > 0 ? t('book_ai_call_review.duration.minutes', {m, s}) : t('book_ai_call_review.duration.seconds', {s})
}

function parseJsonArray(text) {
  if (!text) {
    return []
  }
  try {
    const arr = JSON.parse(text)
    return Array.isArray(arr) ? arr : []
  } catch (e) {
    return []
  }
}

function parseJsonObject(text) {
  if (!text) {
    return null
  }
  try {
    const obj = JSON.parse(text)
    return obj && typeof obj === 'object' ? obj : null
  } catch (e) {
    return null
  }
}

// ===== 详情 =====

const showDetail = ref(false)
const detail = ref(null)
// 按轮分组的对话：{turn, lines[{turn, role, text, code, cut, signal}], tools[{id, name, input, result, truncated, outcome}], record}
const transcriptGroups = ref([])
const detailTags = ref([])
const detailProblems = ref([])
// 代码核对的系统备注 [{key, turn, note}]
const detailChecks = ref([])
// Vapi 报告里的转写（档案正文 vapi.transcript；没收到报告为空）
const vapiTranscript = ref('')

function openDetail(row) {
  bookAiCallReviewDetail(row.id).then(res => {
    if (!res || !res.data || !res.data.data) {
      return
    }
    const data = decorate(res.data.data)
    detail.value = data
    detailTags.value = parseJsonArray(data.tags)
    detailProblems.value = parseJsonArray(data.problems)
    detailChecks.value = parseJsonArray(data.checks)
    const dossier = parseJsonObject(data.dossier)
    vapiTranscript.value = dossier && dossier.vapi && dossier.vapi.transcript ? String(dossier.vapi.transcript) : ''
    transcriptGroups.value = buildGroups(dossier)
    showDetail.value = true
  })
}

// 档案正文 → 按轮分组：transcript 的句子按轮归堆，tools / turns / writes 挂到各自的轮上；写入结局按"同轮同名工具按顺序"配到工具上
function buildGroups(dossier) {
  if (!dossier) {
    return []
  }
  const groups = []
  const byTurn = new Map()
  const group = (turn) => {
    if (!byTurn.has(turn)) {
      const g = {turn, lines: [], tools: [], record: null}
      byTurn.set(turn, g)
      groups.push(g)
    }
    return byTurn.get(turn)
  }
  for (const line of (dossier.transcript || [])) {
    group(line.turn).lines.push({...line})
  }
  for (const tool of (dossier.tools || [])) {
    group(tool.turn).tools.push({...tool, outcome: null})
  }
  for (const record of (dossier.turns || [])) {
    group(record.turn).record = record
  }
  for (const w of (dossier.writes || [])) {
    const g = byTurn.get(w.turn)
    if (!g) {
      continue
    }
    const tool = g.tools.find(x => x.name === w.tool && !x.outcome)
    if (tool) {
      tool.outcome = w.outcome
    }
  }
  // 发了挂断 / 转接信号的那一轮：最后一句 AI 的话后面标出来
  for (const g of groups) {
    let signal = null
    for (const tool of g.tools) {
      if (tool.name === 'end_call') {
        signal = t('book_ai_call_review.detail.signal_end')
      } else if (tool.name === 'transfer_to_staff' && tool.result && tool.result.startsWith('Transferring')) {
        signal = t('book_ai_call_review.detail.signal_transfer')
      }
    }
    if (signal) {
      for (let i = g.lines.length - 1; i >= 0; i--) {
        if (g.lines[i].role === 'ai') {
          g.lines[i].signal = signal
          break
        }
      }
    }
  }
  groups.sort((a, b) => a.turn - b.turn)
  return groups
}

// TURN_LOG 里值得一眼看到的字段（为空 / false / -1 的不显示）
const FACT_KEYS = ['source', 'hops', 'methods', 'writes', 'firstPacketMs', 'answerMs', 'totalMs', 'modelMs', 'ack', 'nudge',
  'transferMatch', 'transferResent', 'transferSaid', 'leak', 'emptyHop', 'langRetry', 'prefaceDropped', 'superseded', 'cache']

function factItems(record) {
  const out = []
  for (const key of FACT_KEYS) {
    const v = record[key]
    if (v === null || v === undefined || v === '' || v === false || v === -1) {
      continue
    }
    out.push({key, value: v === true ? 'yes' : v})
  }
  return out
}

function pretty(obj) {
  if (obj === null || obj === undefined) {
    return '-'
  }
  try {
    return JSON.stringify(obj, null, 1)
  } catch (e) {
    return String(obj)
  }
}

function outcomeColor(outcome) {
  return outcome === 'done' ? 'rgb(68, 117, 80)' : 'rgb(200, 60, 60)'
}

function severityColor(severity) {
  const e = AiCallReviewSeverityEnum.fromCode(severity)
  return e ? e.color : 'rgb(128, 128, 128)'
}

// ===== 运营标记（处理状态 + 备注） =====

const showOps = ref(false)
const opsId = ref("")
const opsStatus = ref(null)
const opsRemark = ref("")
// 保存中：按钮 loading 防重复提交
const opsSaving = ref(false)

function openOps(row) {
  opsId.value = row.id
  const statusEnum = AiCallReviewOpsStatusEnum.fromCode(row.opsStatus)
  // q-select 选项形状与筛选下拉一致（toSelectForm 的 {label, value}）
  opsStatus.value = statusEnum ? {label: statusEnum.name, value: statusEnum.code} : null
  opsRemark.value = row.opsRemark || ''
  showOps.value = true
}

function saveOps() {
  if (opsSaving.value || !opsStatus.value) {
    return
  }
  opsSaving.value = true
  // 备注空内容原样提交=清空
  bookAiCallReviewOps(opsId.value, {
    opsStatus: opsStatus.value.value,
    opsRemark: opsRemark.value,
  }).then(res => {
    if (!res || !res.data) {
      return
    }
    showOps.value = false
    notifyTopPositive(t('book_ai_call_review.notify.ops_success'))
    selectData(true)
    // 详情弹窗开着就同步刷新里面的标记
    if (showDetail.value && detail.value && detail.value.id === opsId.value) {
      openDetail(detail.value)
    }
  }).finally(() => {
    opsSaving.value = false
  })
}

function onOperationClick(name, row) {
  if (name === 'detail') {
    openDetail(row)
  }
  if (name === 'ops') {
    openOps(row)
  }
  if (name === 'rejudge') {
    openRejudge(row)
  }
}

// ===== 重判（二次确认：会覆盖现有评判、等下一轮定时裁判，并消耗一次模型调用） =====

const showRejudge = ref(false)
const rejudgeRow = ref(null)
const rejudging = ref(false)

function openRejudge(row) {
  rejudgeRow.value = row
  showRejudge.value = true
}

function onConfirmRejudge(confirmed) {
  showRejudge.value = false
  if (!confirmed || !rejudgeRow.value || rejudging.value) {
    return
  }
  const row = rejudgeRow.value
  rejudging.value = true
  bookAiCallReviewRejudge(row.id).then(res => {
    if (!res || !res.data) {
      return
    }
    notifyTopPositive(t('book_ai_call_review.notify.rejudge_success'))
    selectData(true)
    if (showDetail.value && detail.value && detail.value.id === row.id) {
      openDetail(row)
    }
  }).finally(() => {
    rejudging.value = false
  })
}

onMounted(() => {
  selectData()
})

</script>

<style scoped lang="scss">

.review-pre {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-size: .8rem;
  margin: .2rem 0 .4rem 0;
  max-height: 14rem;
  overflow: auto;
  padding: .3rem .5rem;
  border-radius: 4px;
  background: rgba(128, 128, 128, .08);
}

</style>
