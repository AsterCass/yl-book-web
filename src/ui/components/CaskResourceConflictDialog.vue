<template>

  <!-- 提交前检查的提示弹窗：门店资源位（床位等）占用 + 雇员休息围栏，两类各自独立、可能同时出现。
       后端对管理端<b>两者都不拦截</b>，这里只是把「谁占着、占到几点」摆出来让店员判断——
       只说一句「床位不够」是没法决定要不要坚持排的。确认即照常提交。
       手动 block 不会出现在这里：它始终硬拦，提交会直接报错。 -->
  <q-dialog :model-value="modelValue" @update:model-value="close"
            :persistent="loading" transition-show="fade" transition-hide="fade">
    <q-card class="component-cask-dialog-judgement-std column res-conflict-card">

      <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
        {{ $t('book_booking.resource.title') }}
      </h5>

      <q-separator class="component-separator-base" inset spaced="1rem"/>

      <div class="q-mx-lg q-mt-md">

        <!-- 休息围栏：插进去不会把休息取消掉，而是让它顺延到本单之后，这点必须说清楚 -->
        <template v-if="(detail.restBlocks || []).length">
          <div class="res-conflict-summary">{{ $t('book_booking.resource.rest_summary') }}</div>
          <div class="res-conflict-list q-mt-sm">
            <div v-for="rb in detail.restBlocks" :key="rb.blockId" class="res-conflict-row">
              <div class="row items-center no-wrap">
                <div class="res-conflict-time">{{ timeOnly(rb.startTime) }} ~ {{ timeOnly(rb.endTime) }}</div>
                <div class="res-conflict-name q-ml-md">{{ rb.staffName }}</div>
              </div>
            </div>
          </div>
          <div class="res-conflict-note q-mt-sm">{{ $t('book_booking.resource.rest_note') }}</div>
          <q-separator v-if="detail.resourceName" class="component-separator-base" spaced="1rem"/>
        </template>

        <div v-if="detail.resourceName" class="res-conflict-summary">
          {{ $t('book_booking.resource.summary', {
            name: detail.resourceName, capacity: detail.capacity, required: detail.required
          }) }}
        </div>

        <template v-if="detail.resourceName">
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
        </template>

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
   * /book/precheck 的返回体（ok=false 那一份）：资源位字段 + restBlocks，两类可能同时存在
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
