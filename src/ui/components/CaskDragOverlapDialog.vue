<template>

  <!-- 日历拖动落点与目标雇员已有预约的服务时间重叠（2026-10-22）：问店员是否先把那几张移到「未分配」，
       等同店员手动把它们拖到未分配列。只移它们，拖动的那张留在原位——移好后店员再拖一次。整理时间、休息围栏不算重叠
       （另由 precheck 提示）。点钟 / 有备注的单多半是特意安排的，已开始的单移过去会显示为已过期，都打上标记让店员看清再决定。 -->
  <q-dialog :model-value="modelValue" @update:model-value="close"
            :persistent="loading" transition-show="fade" transition-hide="fade">
    <q-card class="component-cask-dialog-judgement-std column drag-overlap-card">

      <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
        {{ $t('book_calendar.drag_overlap.title') }}
      </h5>

      <q-separator class="component-separator-base" inset spaced="1rem"/>

      <div class="q-mx-lg q-mt-md">

        <div class="drag-overlap-summary">
          {{ $t('book_calendar.drag_overlap.summary', {staff: staffName}) }}
        </div>
        <div class="drag-overlap-list q-mt-sm">
          <div v-for="item in items" :key="item.id" class="drag-overlap-row">
            <div class="row items-center no-wrap">
              <div class="drag-overlap-time">{{ item.timeRange }}</div>
              <div class="drag-overlap-name q-ml-md">{{ item.name }}</div>
              <q-space/>
              <span v-if="item.preferred" class="drag-overlap-tag">
                {{ $t('book_calendar.drag_overlap.tag_preferred') }}
              </span>
              <span v-if="item.remarked" class="drag-overlap-tag q-ml-xs">
                {{ $t('book_calendar.drag_overlap.tag_remark') }}
              </span>
              <span v-if="item.started" class="drag-overlap-tag q-ml-xs">
                {{ $t('book_calendar.drag_overlap.tag_started') }}
              </span>
            </div>
            <div v-if="item.skills" class="drag-overlap-skills">{{ item.skills }}</div>
          </div>
        </div>
        <div class="drag-overlap-note q-mt-sm">{{ $t('book_calendar.drag_overlap.note') }}</div>
        <!-- 已开始 / 已完成的单移到未分配会显示为已过期（与手动拖到未分配列一样），拖回技师名下即恢复 -->
        <div v-if="items.some(item => item.started)" class="drag-overlap-note q-mt-xs">
          {{ $t('book_calendar.drag_overlap.note_started') }}
        </div>

        <div class="row q-mt-lg q-mb-md justify-center">
          <div class="q-mx-md">
            <q-btn no-caps unelevated class="shadow-1 component-outline-btn-grow"
                   :disable="loading" @click="close"
                   :label="$t('book_booking.dialog.common.cancel')"/>
          </div>
          <div class="q-mx-md">
            <q-btn no-caps unelevated class="shadow-1 component-full-btn-grow"
                   :loading="loading" :disable="loading" @click="$emit('confirm')"
                   :label="$t('book_calendar.drag_overlap.confirm')"/>
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
   * 目标雇员名（落点所在列）
   */
  staffName: {
    type: String,
    required: false,
    default: ''
  },
  /**
   * 重叠的预约：[{id, timeRange, name, skills, preferred（点钟）, remarked（有备注 / 特殊备注 / 模型备注）, started（已开始）}]
   */
  items: {
    type: Array,
    required: true,
    default: () => []
  },
  /**
   * 移动中：确认键转圈、弹窗锁住，避免重复提交
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

</script>

<style lang="scss">
@import "@/styles/independence-components";
@import "@/styles/override-components";

.drag-overlap-card {
  min-width: 30rem;

  .drag-overlap-summary {
    font-weight: 500;
    line-height: 1.6;
  }

  .drag-overlap-list {
    max-height: 14rem;
    overflow-y: auto;
  }

  .drag-overlap-row {
    padding: .4rem .6rem;
    margin-bottom: .35rem;
    border: 1px solid rgba(var(--text-color), .18);
    border-radius: 4px;
  }

  .drag-overlap-time {
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .drag-overlap-name {
    font-weight: 500;
  }

  // 点钟 / 有备注：小号描边胶囊，跟在客户名后面
  .drag-overlap-tag {
    font-size: .75rem;
    font-weight: 500;
    padding: 0 .4rem;
    border: 1px solid rgba(var(--text-color), .3);
    border-radius: .6rem;
    white-space: nowrap;
  }

  .drag-overlap-skills {
    margin-top: .15rem;
    font-size: .78rem;
    opacity: .6;
  }

  .drag-overlap-note {
    font-size: .78rem;
    opacity: .55;
    line-height: 1.5;
  }
}

</style>
