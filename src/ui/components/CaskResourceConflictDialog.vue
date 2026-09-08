<template>

  <!-- 门店资源位（床位等）占用提示。
       后端对管理端<b>不拦截</b>容量，这里只是把「谁占着、占到几点」摆出来让店员判断——
       只说一句「床位不够」是没法决定要不要坚持排的。确认即照常提交。 -->
  <q-dialog :model-value="modelValue" @update:model-value="close"
            :persistent="loading" transition-show="fade" transition-hide="fade">
    <q-card class="component-cask-dialog-judgement-std column res-conflict-card">

      <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
        {{ $t('book_booking.resource.title') }}
      </h5>

      <q-separator class="component-separator-base" inset spaced="1rem"/>

      <div class="q-mx-lg q-mt-md">

        <div class="res-conflict-summary">
          {{ $t('book_booking.resource.summary', {
            name: detail.resourceName, capacity: detail.capacity, required: detail.required
          }) }}
        </div>

        <div class="res-conflict-line q-mt-sm">
          <span class="res-conflict-label">{{ $t('book_booking.resource.conflict_window') }}</span>
          <span class="res-conflict-time">{{ detail.conflictStartTime }} ~ {{ detail.conflictEndTime }}</span>
        </div>
        <div class="res-conflict-line">
          <span class="res-conflict-label">{{ $t('book_booking.resource.target_window') }}</span>
          <span class="res-conflict-time">{{ detail.targetStartTime }} ~ {{ detail.targetEndTime }}</span>
        </div>

        <div class="res-conflict-label q-mt-md q-mb-xs">
          {{ $t('book_booking.resource.occupied_title') }}
        </div>
        <div class="res-conflict-list">
          <div v-for="row in detail.occupied || []" :key="row.bookingId" class="res-conflict-row">
            <div class="row items-center no-wrap">
              <div class="res-conflict-time">{{ timeOnly(row.startTime) }} ~ {{ timeOnly(row.endTime) }}</div>
              <div class="res-conflict-name q-ml-md">{{ row.name }}</div>
              <q-space/>
              <div v-if="row.staffName" class="res-conflict-staff">{{ row.staffName }}</div>
            </div>
            <div v-if="row.skillNames" class="res-conflict-skills">{{ row.skillNames }}</div>
          </div>
        </div>

        <div class="res-conflict-note q-mt-md">{{ $t('book_booking.resource.note') }}</div>

        <div class="row q-mt-lg q-mb-md justify-center">
          <div class="q-mx-md">
            <q-btn no-caps unelevated class="shadow-1 component-outline-btn-grow"
                   :disable="loading" @click="close(false)"
                   :label="$t('book_booking.resource.back')"/>
          </div>
          <div class="q-mx-md">
            <q-btn no-caps unelevated class="shadow-1 component-full-btn-grow"
                   :loading="loading" :disable="loading" @click="$emit('confirm')"
                   :label="$t('book_booking.resource.save_anyway')"/>
          </div>
        </div>

      </div>

    </q-card>
  </q-dialog>

</template>

<script setup>
import {defineEmits, defineProps} from "vue";

const emit = defineEmits(['update:modelValue', 'confirm']);
defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  },
  /**
   * /book/resource/check 的返回体（ok=false 那一份）
   */
  detail: {
    type: Object,
    required: true,
    default: () => ({})
  },
  /**
   * 提交中：确认键转圈、弹窗锁住，避免重复提交
   */
  loading: {
    type: Boolean,
    required: false,
    default: false
  },
})

function close() {
  emit('update:modelValue', false)
}

// 占用方都在同一天，只显示时分，省得每行都顶着一个重复的日期
function timeOnly(str) {
  return str && str.length >= 16 ? str.substring(11, 16) : str
}

</script>

<style lang="scss">
@import "@/styles/independence-components";
@import "@/styles/override-components";

.res-conflict-card {
  min-width: 30rem;

  .res-conflict-summary {
    font-weight: 500;
    line-height: 1.6;
  }

  .res-conflict-line {
    display: flex;
    align-items: baseline;
    font-size: .88rem;
  }

  .res-conflict-label {
    opacity: .6;
    font-size: .82rem;
    margin-right: .5rem;
    white-space: nowrap;
  }

  .res-conflict-time {
    font-variant-numeric: tabular-nums;
  }

  .res-conflict-list {
    max-height: 14rem;
    overflow-y: auto;
  }

  .res-conflict-row {
    padding: .4rem .6rem;
    margin-bottom: .35rem;
    border: 1px solid rgba(var(--text-color), .18);
    border-radius: 4px;
  }

  .res-conflict-name {
    font-weight: 500;
  }

  .res-conflict-staff {
    font-size: .8rem;
    opacity: .65;
    white-space: nowrap;
  }

  .res-conflict-skills {
    margin-top: .15rem;
    font-size: .78rem;
    opacity: .6;
  }

  .res-conflict-note {
    font-size: .78rem;
    opacity: .55;
    line-height: 1.5;
  }
}

</style>
