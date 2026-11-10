<template>
  <!-- 电话需求回访（Twilio 回拨桥接：先拨门店电话，店员接起后按 1 再接通客户）。
       电话需求页「拨打电话」与预约日历电话需求栏「回拨」共用；调用方经 ref 调 open(row)。
       拨打确认：明确告知「先拨门店电话、按 1 才接通客户」，防误呼 -->
  <cask-dialog-judgment v-model="showConfirm"
                        :callback-method="onConfirm"
                        :dialog-judgment-data="{
                          title: t('book_phone_request.call_dialog.title'),
                          content: confirmContent,
                          falseLabel: t('book_phone_request.call_dialog.cancel'),
                          trueLabel: t('book_phone_request.call_dialog.confirm'),
                        }"
  />
</template>

<script setup>

import {ref} from "vue";
import {useI18n} from 'vue-i18n'
import {notifyTopPositive, notifyTopWarning} from "@/utils/notification-tools.js";
import CaskDialogJudgment from "@/ui/components/CaskDialogJudgment.vue";
import {bookPhoneRequestCall} from "@/api/book.js";

const emit = defineEmits(['called'])

const {t} = useI18n()

const showConfirm = ref(false)
const callRow = ref(null)
const confirmContent = ref("")
// 呼出中：防重复点击（一次点击=一通真实电话）
const calling = ref(false)

function open(row) {
  // 门店电话（店员接听的一端）与呼出电话（主叫显示，本店 Twilio 号码）缺一不可，
  // 后端同样会拒绝，这里先给出可操作的提示
  if (!row.storePhone) {
    notifyTopWarning(t('book_phone_request.notify.no_store_phone'))
    return
  }
  if (!row.storeOutboundPhone) {
    notifyTopWarning(t('book_phone_request.notify.no_outbound_phone'))
    return
  }
  callRow.value = row
  confirmContent.value = t('book_phone_request.call_dialog.content', {
    phone: row.phone,
    store: row.storePhone,
    outbound: row.storeOutboundPhone,
  })
  showConfirm.value = true
}

function onConfirm(confirmed) {
  showConfirm.value = false
  if (!confirmed || !callRow.value || calling.value) {
    return
  }
  const row = callRow.value
  calling.value = true
  bookPhoneRequestCall(row.id).then(res => {
    if (!res || !res.data || !res.data.data) {
      return
    }
    notifyTopPositive(t('book_phone_request.notify.call_success', {
      store: res.data.data.storePhone,
    }))
    // 调用方据此刷新回访次数 / 最近一次回访
    emit('called')
  }).finally(() => {
    calling.value = false
  })
}

defineExpose({open})

</script>
