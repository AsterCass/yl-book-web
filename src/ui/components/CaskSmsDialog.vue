<template>
  <div>

    <!-- 短信消息弹窗（写法同 AI 通话复盘详情）：两列并排，左 = 门店发给这个号码的历史短信（旧 → 新，最多 100 条，内部滚动），
         右 = 编辑发送区。号码与发件门店由后端从通话复盘记录取，这里只传记录 id。
         只有外发：顾客回复的短信没有接入站回调，这里看不到 -->
    <q-dialog :model-value="show" transition-show="fade" transition-hide="fade" @hide="close">
      <q-card class="component-cask-dialog-judgement-std" style="max-width: 2000px !important">
        <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
          {{ $t('book_ai_call_review.sms.title') }}
          <span v-if="thread && thread.phone" style="font-weight: 400; opacity: .7;">
            · {{ smsDisplayPhone(thread.phone) }}
          </span>
        </h5>

        <q-separator class="component-separator-base" inset spaced="1rem"/>

        <div v-if="!thread" class="q-ma-xl text-center" style="opacity: .6; min-width: 30rem;">
          {{ $t('book_ai_call_review.sms.loading') }}
        </div>

        <div v-else class="q-ma-md row no-wrap items-start" style="gap: 2rem;">

          <!-- 左列：历史短信 -->
          <div style="flex: 1 1 34rem; min-width: 26rem; max-width: 40rem;">
            <div class="row items-center justify-between">
              <h6 style="white-space: nowrap;">{{ $t('book_ai_call_review.sms.history') }}&nbsp;:</h6>
              <q-btn class="component-outline-btn-mini-grow" no-caps unelevated :loading="refreshing"
                     @click="load(true)">
                {{ $t('book_ai_call_review.sms.refresh') }}
              </q-btn>
            </div>

            <div ref="historyRef" class="sms-history q-mt-sm">
              <div v-if="thread.list.length === 0" style="opacity: .5; font-size: .85rem;">
                {{ $t('book_ai_call_review.sms.empty') }}
              </div>
              <div v-for="m in thread.list" :key="m.id" class="sms-item">
                <div class="sms-meta">
                  {{ m.timeStr }} · {{ m.storeName }} · {{ kindName(m) }}<span
                    v-if="m.operatorName"> · {{ m.operatorName }}</span>
                </div>
                <div class="sms-bubble" :class="{'sms-bubble-dim': notReached(m.state)}">{{ m.body }}</div>
                <div class="sms-state">
                  <span :style="`color: ${stateColor(m.state)}`">{{ $t('book_ai_call_review.sms.state.' + m.state) }}</span>
                  <span v-if="errorText(m)"> · {{ errorText(m) }}</span>
                  <span v-if="m.segments" style="opacity: .55;"> · {{ $t('book_ai_call_review.sms.segments', {n: m.segments}) }}</span>
                </div>
              </div>
            </div>

            <div class="sms-note q-mt-sm">{{ $t('book_ai_call_review.sms.reply_note') }}</div>
          </div>

          <!-- 右列：编辑发送 -->
          <div style="flex: 0 0 auto; width: 27rem;">
            <div style="display: grid; grid-template-columns: max-content 1fr; gap: 0.6rem; align-items: center;">
              <h6 style="white-space: nowrap;">{{ $t('book_ai_call_review.sms.from_store') }}&nbsp;:</h6>
              <div>{{ thread.storeName || '-' }}</div>

              <h6 style="white-space: nowrap;">{{ $t('book_ai_call_review.sms.from_phone') }}&nbsp;:</h6>
              <div>{{ smsDisplayPhone(thread.fromPhone) || '-' }}</div>

              <h6 style="white-space: nowrap;">{{ $t('book_ai_call_review.sms.to_phone') }}&nbsp;:</h6>
              <div>{{ smsDisplayPhone(thread.phone) || '-' }}</div>
            </div>

            <div v-if="blockReason" class="sms-warn q-mt-md">{{ blockReason }}</div>
            <div v-if="thread.dryRun" class="sms-warn q-mt-md">{{ $t('book_ai_call_review.sms.dry_run') }}</div>

            <h6 class="q-mt-md" style="white-space: nowrap;">{{ $t('book_ai_call_review.sms.text_label') }}&nbsp;:</h6>
            <q-input v-model="text" class="component-outline-input-textarea-grow sms-textarea q-mt-sm" type="textarea"
                     borderless maxlength="1500" :disable="!canCompose"
                     :placeholder="t('book_ai_call_review.sms.placeholder')"/>
            <div class="sms-counter" :style="over ? 'color: rgb(200, 60, 60); opacity: 1;' : ''">
              {{ $t('book_ai_call_review.sms.counter', {
                encoding: size.gsm ? 'GSM-7' : 'UCS-2', units: size.units, segments: size.segments,
                max: thread.maxSegments
              }) }}
              <span v-if="!size.gsm"> · {{ $t('book_ai_call_review.sms.counter_ucs2') }}</span>
            </div>

            <!-- 顾客实际收到的全文：门店名前缀与退订提示由系统固定加上，店员删不掉，也计入长度 -->
            <div class="sms-label q-mt-md">{{ $t('book_ai_call_review.sms.preview_label') }}</div>
            <div class="sms-preview">{{ finalText }}</div>

            <ul class="sms-hints">
              <li>{{ $t('book_ai_call_review.sms.hint_fixed') }}</li>
              <li>{{ $t('book_ai_call_review.sms.hint_service') }}</li>
              <li>{{ $t('book_ai_call_review.sms.hint_reply') }}</li>
            </ul>

            <div class="row items-center q-mt-md" style="gap: .8rem;">
              <q-btn class="shadow-1 component-full-btn-grow" no-caps unelevated :loading="previewing"
                     :disable="!canSubmit" @click="openConfirm">
                {{ cooldownLeft > 0 ? $t('book_ai_call_review.sms.cooldown', {s: cooldownLeft})
                    : $t('book_ai_call_review.sms.send') }}
              </q-btn>
              <span style="opacity: .55; font-size: .8rem;">
                {{ $t('book_ai_call_review.sms.quota', {n: thread.sentToday, cap: thread.dailyCap}) }}
              </span>
            </div>
          </div>

        </div>

        <div class="row q-mt-xl q-mb-md justify-center">
          <q-btn class="shadow-1 component-outline-btn-grow" no-caps unelevated @click="close">
            {{ $t('book_ai_call_review.sms.close') }}
          </q-btn>
        </div>
      </q-card>
    </q-dialog>

    <!-- 发送确认：展示的是后端预览接口拼好的最终全文与分段数（与真正发出去的是同一段代码算的）。
         不用 CaskDialogJudgment：它的正文是居中的一行字，放不下多行短信全文 -->
    <q-dialog :model-value="showConfirm" :persistent="sending" transition-show="fade" transition-hide="fade"
              @hide="showConfirm = false">
      <q-card v-if="preview && thread" class="component-cask-dialog-judgement-std" style="max-width: 36rem !important">
        <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
          {{ $t('book_ai_call_review.sms.confirm.title') }}
        </h5>

        <q-separator class="component-separator-base" inset spaced="1rem"/>

        <div class="q-mx-lg q-mt-md q-mb-xs">
          <div style="display: grid; grid-template-columns: max-content 1fr; gap: 0.6rem; align-items: center;">
            <h6 style="white-space: nowrap;">{{ $t('book_ai_call_review.sms.to_phone') }}&nbsp;:</h6>
            <div>{{ smsDisplayPhone(thread.phone) }}</div>

            <h6 style="white-space: nowrap;">{{ $t('book_ai_call_review.sms.from_phone') }}&nbsp;:</h6>
            <div>{{ smsDisplayPhone(thread.fromPhone) }} · {{ thread.storeName }}</div>

            <h6 style="white-space: nowrap;">{{ $t('book_ai_call_review.sms.confirm.size') }}&nbsp;:</h6>
            <div>
              {{ $t('book_ai_call_review.sms.confirm.size_value', {segments: preview.segments, encoding: preview.encoding}) }}
            </div>
          </div>

          <div class="sms-label q-mt-md">{{ $t('book_ai_call_review.sms.confirm.content') }}</div>
          <div class="sms-preview">{{ preview.finalText }}</div>

          <div v-if="preview.quietHours" class="sms-warn q-mt-md">
            {{ $t('book_ai_call_review.sms.confirm.quiet', {time: preview.storeLocalTime}) }}
          </div>
          <div v-if="preview.dryRun" class="sms-warn q-mt-md">{{ $t('book_ai_call_review.sms.dry_run') }}</div>

          <div class="row q-mt-xl q-mb-md justify-center">
            <div class="q-mx-md">
              <q-btn class="shadow-1 component-outline-btn-grow" no-caps unelevated :disable="sending"
                     :label="t('book_ai_call_review.sms.confirm.cancel')" @click="showConfirm = false"/>
            </div>
            <div class="q-mx-md">
              <q-btn class="shadow-1 component-full-btn-grow" no-caps unelevated :loading="sending" :disable="sending"
                     :label="t('book_ai_call_review.sms.confirm.ok')" @click="confirmSend"/>
            </div>
          </div>
        </div>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>

import {computed, nextTick, onBeforeUnmount, ref, watch} from "vue"
import {useI18n} from 'vue-i18n'
import {notifyTopPositive, notifyTopWarning} from "@/utils/notification-tools.js"
import {useGlobalStateStore} from "@/utils/global-state.js"
import {bookAiCallReviewSms, bookAiCallReviewSmsPreview, bookAiCallReviewSmsSend} from "@/api/book.js"
import {smsCleanText, smsDisplayPhone, smsMeasure} from "@/utils/sms.js"

const {t, te} = useI18n()
const globalState = useGlobalStateStore()

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  },
  // AI 通话复盘记录 id：号码、发件门店都由后端从这条记录取
  reviewId: {
    type: String,
    required: false,
    default: ''
  },
})

// 历史里最多留多少条（与后端一次返回的上限一致）
const HISTORY_MAX = 100

const show = ref(props.modelValue)
// 弹窗数据：左侧历史 + 右侧发件信息与限制（后端 SmsThreadDto）；null = 还在加载
const thread = ref(null)
const refreshing = ref(false)
const text = ref('')
const historyRef = ref(null)
// 请求序号：弹窗关了又对另一通电话打开时，丢弃上一次还没回来的响应
let loadSeq = 0

// 发送要独立权限（会产生费用并直接触达顾客）；没有的账户只能看历史
const canSendPermission = computed(() => globalState.hasPermission('book:ai-call-review:sms'))

watch(() => props.modelValue, (open) => {
  show.value = open
  if (open) {
    thread.value = null
    text.value = ''
    preview.value = null
    cooldownUntil.value = 0
    load(false)
  } else {
    loadSeq++
    stopTimer()
  }
})

function close() {
  show.value = false
  showConfirm.value = false
  emit('update:modelValue', false)
}

// 取历史与发件信息；manual = 点了「刷新」（按钮转圈，编辑区内容保留）
function load(manual) {
  if (!props.reviewId) {
    return
  }
  const seq = ++loadSeq
  refreshing.value = manual === true
  bookAiCallReviewSms(props.reviewId).then(res => {
    if (seq !== loadSeq) {
      return
    }
    if (!res || !res.data || !res.data.data) {
      // 第一次就没取到（无权限 / 记录不可见，提示已由请求拦截器弹出）：关掉空弹窗
      if (!thread.value) {
        close()
      }
      return
    }
    thread.value = res.data.data
    scrollToBottom()
  }).finally(() => {
    if (seq === loadSeq) {
      refreshing.value = false
    }
  })
}

function scrollToBottom() {
  nextTick(() => {
    if (historyRef.value) {
      historyRef.value.scrollTop = historyRef.value.scrollHeight
    }
  })
}

// ===== 历史里一条短信的展示 =====

function kindName(m) {
  if (m.kind === 'MANUAL') {
    return t('book_ai_call_review.sms.kind.MANUAL')
  }
  const key = 'book_ai_call_review.sms.kind.' + m.kind
  return t('book_ai_call_review.sms.kind.AUTO') + (te(key) ? ' · ' + t(key) : '')
}

// 没到顾客手机上的（或不确定到没到的）：气泡淡显
function notReached(state) {
  return state === 'FAILED' || state === 'UNDELIVERED' || state === 'OPTED_OUT' || state === 'NOT_SENT'
      || state === 'UNKNOWN'
}

function stateColor(state) {
  if (state === 'DELIVERED' || state === 'SENT') {
    return 'rgb(68, 117, 80)'
  }
  if (state === 'FAILED' || state === 'UNDELIVERED' || state === 'OPTED_OUT') {
    return 'rgb(200, 60, 60)'
  }
  if (state === 'UNKNOWN') {
    return 'rgb(190, 130, 40)'
  }
  return 'rgb(128, 128, 128)'
}

// 失败 / 未送达的原因：常见的 Twilio 错误码翻成人话，其余给错误码或 Twilio 的原始说明
function errorText(m) {
  if (m.state !== 'FAILED' && m.state !== 'UNDELIVERED') {
    return ''
  }
  if (m.errorCode) {
    const key = 'book_ai_call_review.sms.error.code_' + m.errorCode
    return te(key) ? t(key) : t('book_ai_call_review.sms.error.other', {code: m.errorCode})
  }
  return m.errorMessage || ''
}

// ===== 编辑区 =====

const cleanText = computed(() => smsCleanText(text.value))
// 顾客实际收到的全文（页面上的近似预览，确认框里换成后端算的）
const finalText = computed(() => thread.value
    ? thread.value.prefix + cleanText.value + '\n' + thread.value.suffix : '')
const size = computed(() => smsMeasure(finalText.value))
const over = computed(() => !!thread.value && size.value.segments > thread.value.maxSegments)
const capReached = computed(() => !!thread.value && thread.value.sentToday >= thread.value.dailyCap)

// 现在为什么不能发（空串 = 能发）
const blockReason = computed(() => {
  if (!thread.value) {
    return ''
  }
  if (!thread.value.canSend) {
    return t('book_ai_call_review.sms.cannot.' + thread.value.cannotSendReason)
  }
  if (!canSendPermission.value) {
    return t('book_ai_call_review.sms.no_permission')
  }
  if (capReached.value) {
    return t('book_ai_call_review.sms.cap_reached', {cap: thread.value.dailyCap})
  }
  return ''
})
const canCompose = computed(() => !!thread.value && blockReason.value === '')
const canSubmit = computed(() => canCompose.value && cleanText.value.length > 0 && !over.value
    && cooldownLeft.value <= 0 && !previewing.value && !sending.value)

// 发出一条后的间隔（后端有同样的限制，这里只是让按钮直接显示倒计时，不必点了才被拒）
const cooldownUntil = ref(0)
const nowMs = ref(Date.now())
let timer = null
const cooldownLeft = computed(() => Math.max(0, Math.ceil((cooldownUntil.value - nowMs.value) / 1000)))

function startTimer() {
  nowMs.value = Date.now()
  if (timer === null) {
    timer = setInterval(() => {
      nowMs.value = Date.now()
      if (cooldownUntil.value <= nowMs.value) {
        stopTimer()
      }
    }, 1000)
  }
}

function stopTimer() {
  if (timer !== null) {
    clearInterval(timer)
    timer = null
  }
}

onBeforeUnmount(stopTimer)

// ===== 发送（先取后端预览，再二次确认） =====

const previewing = ref(false)
const showConfirm = ref(false)
const preview = ref(null)
// 发送中：确认键转圈、两个按钮锁住、确认框点外部 / ESC 关不掉，防重复提交
const sending = ref(false)
// 确认框里那份全文对应的原文：确认时原样提交
let confirmedText = ''

function openConfirm() {
  if (!canSubmit.value) {
    return
  }
  previewing.value = true
  confirmedText = text.value
  bookAiCallReviewSmsPreview(props.reviewId, {text: confirmedText}).then(res => {
    if (!res || !res.data || !res.data.data) {
      return
    }
    preview.value = res.data.data
    showConfirm.value = true
  }).finally(() => {
    previewing.value = false
  })
}

function confirmSend() {
  if (sending.value || !thread.value) {
    return
  }
  sending.value = true
  bookAiCallReviewSmsSend(props.reviewId, {text: confirmedText}).then(res => {
    if (!res || !res.data || !res.data.data) {
      // 校验不过 / 请求超时（提示已由请求拦截器弹出）。超时的那次可能其实已经发出去了，重取一次历史看实际结果
      load(true)
      return
    }
    const result = res.data.data
    const m = result.message
    thread.value.list.push(m)
    if (thread.value.list.length > HISTORY_MAX) {
      thread.value.list.shift()
    }
    thread.value.sentToday = result.sentToday
    scrollToBottom()
    // 接口正常返回不等于发出去了：按这条记录的状态提示
    if (m.state === 'FAILED') {
      notifyTopWarning(t('book_ai_call_review.sms.notify.failed', {reason: errorText(m) || '-'}), 6000)
      return
    }
    if (m.state === 'OPTED_OUT') {
      notifyTopWarning(t('book_ai_call_review.sms.notify.opted_out'), 6000)
      return
    }
    // 发出去了 / 结果未知 / 测试环境只落记录：清空编辑区并开始间隔倒计时（结果未知时更不能马上重发）
    text.value = ''
    cooldownUntil.value = Date.now() + (thread.value.intervalSeconds || 60) * 1000
    startTimer()
    if (m.state === 'NOT_SENT') {
      notifyTopWarning(t('book_ai_call_review.sms.notify.not_sent'), 6000)
    } else if (m.state === 'UNKNOWN') {
      notifyTopWarning(t('book_ai_call_review.sms.notify.unknown'), 8000)
    } else {
      notifyTopPositive(t('book_ai_call_review.sms.notify.sent'))
    }
  }).finally(() => {
    sending.value = false
    showConfirm.value = false
  })
}

</script>

<style scoped lang="scss">

// 历史短信：固定高度内部滚动（最多 100 条），打开时滚到最新一条
.sms-history {
  height: 34rem;
  overflow-y: auto;
  padding-right: .5rem;
}

.sms-item {
  margin-bottom: 1rem;
}

.sms-meta {
  opacity: .55;
  font-size: .78rem;
}

// 一条短信的正文：边框卡片（同通话详情里工具调用的等宽块），保留换行
.sms-bubble {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-size: .88rem;
  line-height: 1.45;
  margin-top: .2rem;
  padding: .5rem .7rem;
  border-radius: 6px;
  background: rgba(var(--text-color), .06);
}

.sms-bubble-dim {
  opacity: .55;
}

.sms-state {
  font-size: .78rem;
  margin-top: .2rem;
  overflow-wrap: anywhere;
}

.sms-note {
  opacity: .55;
  font-size: .78rem;
}

.sms-label {
  opacity: .55;
  font-size: .8rem;
}

.sms-counter {
  opacity: .6;
  font-size: .78rem;
  margin-top: .3rem;
}

.sms-preview {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-size: .88rem;
  line-height: 1.45;
  margin-top: .2rem;
  padding: .5rem .7rem;
  border-radius: 6px;
  max-height: 14rem;
  overflow: auto;
  border: 1px dashed rgba(var(--text-color), .35);
}

.sms-warn {
  font-size: .85rem;
  padding: .4rem .6rem;
  border-radius: 4px;
  color: rgb(200, 60, 60);
  border: 1px solid rgba(200, 60, 60, .5);
}

.sms-hints {
  opacity: .6;
  font-size: .78rem;
  line-height: 1.5;
  margin: .6rem 0 0 0;
  padding-left: 1.1rem;
}

:deep(.sms-textarea textarea) {
  height: 9rem;
  line-height: 1.45;
}

</style>
