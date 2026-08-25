<template>
  <div class="component-cask-dialog-judgement-std cask-customer-history-panel">
    <h6 style="font-weight: 600!important; margin: .4rem .5rem !important;">
      {{ title }}
    </h6>
    <div class="q-mx-sm" style="opacity: .5; font-size: .8rem;">
      {{ hint }}
    </div>
    <q-separator class="component-separator-base" inset spaced=".6rem"/>

    <div class="cask-history-scroll">
      <!-- key 带上邮箱：姓名入口按 姓名+邮箱 聚合，同名不同邮箱是两条不同记录 -->
      <div v-for="cust in customers"
           :key="`${cust.name || ''}:${cust.mail || ''}:${cust.phone || ''}`"
           class="cask-history-item" @click="emit('select', cust)">
        <div class="row items-center justify-between no-wrap">
          <div class="text-weight-bold ellipsis">
            <span>{{ cust.name || $t('book_booking.customer_history.no_name') }}</span>
            <!-- 姓名入口：首行直接展示聚合键「姓名 · 邮箱」，无邮箱时不带分隔点。
                 间距走 margin 而非模板里的空格，免受 Vue 空白折叠影响 -->
            <span v-if="mode === 'name' && cust.mail" class="cask-history-mail">· {{ cust.mail }}</span>
          </div>
          <!-- 次数徽标仅手机号入口展示：姓名入口的次数只统计本次扫描窗口内的预约，不是全量 -->
          <q-badge v-if="mode !== 'name'" outline color="grey-7"
                   :label="$t('book_booking.customer_history.total', { count: cust.totalCount })"/>
        </div>
        <!-- 联系方式行仅手机号入口展示；姓名入口的邮箱已并入首行，且不展示手机号 -->
        <div v-if="mode !== 'name'"
             class="row items-center no-wrap q-mt-xs" style="font-size: .78rem; opacity: .7; gap: .4rem;">
          <span>{{ cust.phone }}</span>
          <span v-if="cust.mail" class="ellipsis">· {{ cust.mail }}</span>
        </div>
        <!-- 无邮箱组：聚合键只剩姓名，可能混了同名不同人的预约，点击不回填手机号 -->
        <div v-if="cust.mailMissing" class="cask-history-warn">
          <q-icon name="fa-solid fa-triangle-exclamation" size=".75rem"/>
          <span>{{ $t('book_booking.customer_history.no_mail_warning') }}</span>
        </div>

        <div v-for="bk in (cust.recentBookings || [])" :key="bk.id" class="cask-history-booking">
          <span class="cask-history-time">{{ bk.bookingTime }}</span>
          <span class="cask-history-project ellipsis">{{ projectNames(bk) }}</span>
          <span class="cask-history-source" :style="{ color: sourceColor(bk.source) }">
            {{ sourceName(bk.source) }}
          </span>
          <q-badge :style="{ backgroundColor: statusColor(bk.status) }"
                   :label="statusName(bk.status)" style="font-size: 9px;"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {BookSourceEnum, BookStatusEnum} from "@/constants/enums/book.js";

defineProps({
  customers: {type: Array, required: true},
  title: {type: String, required: true},
  hint: {type: String, required: true},
  // 'phone'（默认）：按手机号聚合，首行=姓名+次数徽标，次行=手机号·邮箱；
  // 'name'：按 姓名+邮箱 聚合，首行=姓名·邮箱，不展示次数与手机号
  mode: {type: String, default: 'phone'},
})

const emit = defineEmits(['select'])

function projectNames(booking) {
  return (booking.skillDtoList || []).map(skill => skill.name).join(', ')
}

function sourceName(source) {
  const item = source != null ? BookSourceEnum.fromCode(source) : null
  return item ? item.name : ''
}

function sourceColor(source) {
  const item = source != null ? BookSourceEnum.fromCode(source) : null
  return item ? item.color : 'rgb(128, 128, 128)'
}

function statusName(status) {
  const item = BookStatusEnum.fromCode(status)
  return item ? item.name : ''
}

function statusColor(status) {
  const item = BookStatusEnum.fromCode(status)
  return item ? item.color : 'rgb(128, 128, 128)'
}
</script>

<style scoped lang="scss">
.cask-customer-history-panel {
  width: 24rem;
  max-width: 24rem;
  padding: .5rem .3rem;
}

.cask-history-scroll {
  max-height: 30rem;
  overflow-y: auto;
  padding: 0 .3rem .5rem;
}

.cask-history-item {
  padding: .6rem .5rem;
  margin: .2rem 0;
  border-radius: .4rem;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background-color .12s ease, border-color .12s ease;

  &:hover {
    background-color: rgba(128, 128, 128, .1);
    border-color: rgba(128, 128, 128, .25);
  }

  & + .cask-history-item {
    border-top: 1px solid rgba(128, 128, 128, .12);
  }
}

// 首行邮箱（姓名入口）：与姓名同处一个 ellipsis 容器，过长时整体截断
.cask-history-mail {
  margin-left: .3rem;
  font-weight: 400;
  opacity: .7;
}

// 无邮箱提示：警示色但不做实心底，避免在一屏多条时过分抢眼
.cask-history-warn {
  display: flex;
  align-items: center;
  gap: .3rem;
  margin-top: .3rem;
  font-size: .72rem;
  line-height: 1.3;
  color: rgb(var(--negative));
}

.cask-history-booking {
  display: flex;
  align-items: center;
  gap: .4rem;
  margin-top: .3rem;
  font-size: .72rem;
  opacity: .8;

  .cask-history-time {
    flex: 0 0 auto;
    font-variant-numeric: tabular-nums;
  }

  .cask-history-project {
    flex: 1 1 auto;
    min-width: 0;
  }

  .cask-history-source {
    flex: 0 0 auto;
    font-weight: 500;
  }
}
</style>
