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
      <div v-for="cust in customers" :key="`${cust.name || ''}:${cust.phone || ''}`"
           class="cask-history-item" @click="emit('select', cust)">
        <div class="row items-center justify-between no-wrap">
          <div class="text-weight-bold ellipsis">
            {{ cust.name || $t('book_booking.customer_history.no_name') }}
          </div>
          <q-badge outline color="grey-7"
                   :label="$t('book_booking.customer_history.total', { count: cust.totalCount })"/>
        </div>
        <div class="row items-center no-wrap q-mt-xs" style="font-size: .78rem; opacity: .7; gap: .4rem;">
          <span>{{ cust.phone }}</span>
          <span v-if="cust.mail" class="ellipsis">· {{ cust.mail }}</span>
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
