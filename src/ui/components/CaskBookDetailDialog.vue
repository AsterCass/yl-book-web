<template>
  <q-dialog :model-value="modelValue" @hide="emit('update:modelValue', false)"
            transition-show="fade" transition-hide="fade">
    <q-card class="component-cask-dialog-judgement-std" style="max-width: 2000px !important">
      <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
        {{ $t('book_booking.detail.title') }}
      </h5>

      <q-separator class="component-separator-base" inset spaced="1rem"/>

      <div v-if="book" class="q-ma-md" style="min-width: 28rem">
        <div style="display: grid; grid-template-columns: max-content 1fr; gap: 0.6rem; align-items: center;">

          <h6 style="white-space: nowrap;">{{ $t('book_booking.detail.id') }}&nbsp;:</h6>
          <div>{{ book.id || '-' }}</div>

          <h6 style="white-space: nowrap;">{{ $t('book_booking.detail.bookingTime') }}&nbsp;:</h6>
          <div>{{ book.bookingTime || '-' }}</div>

          <h6 style="white-space: nowrap;">{{ $t('book_booking.detail.name') }}&nbsp;:</h6>
          <div>{{ book.name || '-' }}</div>

          <h6 style="white-space: nowrap;">{{ $t('book_booking.detail.phone') }}&nbsp;:</h6>
          <div>{{ book.phone || '-' }}</div>

          <h6 style="white-space: nowrap;">{{ $t('book_booking.detail.mail') }}&nbsp;:</h6>
          <div>{{ book.mail || '-' }}</div>

          <!-- 按邮箱统计的已预约次数（不含已取消），仅详情接口返回；无邮箱时后端返回 0 -->
          <h6 style="white-space: nowrap;">{{ $t('book_booking.detail.customerBookingCountTenant') }}&nbsp;:</h6>
          <div>{{ book.customerBookingCountTenant != null ? book.customerBookingCountTenant : '-' }}</div>

          <h6 style="white-space: nowrap;">{{ $t('book_booking.detail.customerBookingCount') }}&nbsp;:</h6>
          <div>{{ book.customerBookingCount != null ? book.customerBookingCount : '-' }}</div>

          <h6 style="white-space: nowrap;">{{ $t('book_booking.detail.status') }}&nbsp;:</h6>
          <div :style="`color: ${statusColor}`">{{ statusName }}</div>

          <h6 style="white-space: nowrap;">{{ $t('book_booking.detail.source') }}&nbsp;:</h6>
          <div :style="`color: ${sourceColor}`">{{ sourceName }}</div>

          <h6 style="white-space: nowrap; align-self: flex-start;">{{ $t('book_booking.detail.project') }}&nbsp;:</h6>
          <div class="row" style="gap: .4rem;">
            <div v-for="skill in (book.skillDtoList || [])" :key="skill.id">
              {{ skill.name }}
            </div>
            <div v-if="!book.skillDtoList || book.skillDtoList.length === 0" style="opacity: .5;">-</div>
          </div>

          <h6 style="white-space: nowrap;">{{ $t('book_booking.detail.requiredSkillTime') }}&nbsp;:</h6>
          <div>{{
              book.requiredSkillTime != null ? book.requiredSkillTime : '-'
            }}{{ $t('book_booking.detail.requiredSkillTimeMin') }}
          </div>

          <h6 style="white-space: nowrap;">{{ $t('book_booking.detail.preferredStaff') }}&nbsp;:</h6>
          <div>{{ book.preferredStaffName || book.preferredStaffId || '-' }}</div>

          <h6 style="white-space: nowrap;">{{ $t('book_booking.detail.staff') }}&nbsp;:</h6>
          <div>{{
              book.staffName ? `${book.staffName}${book.staffPhone ? ' (' + book.staffPhone + ')' : ''}` : '-'
            }}
          </div>

          <h6 style="white-space: nowrap;">{{ $t('book_booking.detail.specialRemark') }}&nbsp;:</h6>
          <div>{{ specialRemarksDisplay || '-' }}</div>

          <h6 style="white-space: nowrap; align-self: flex-start;">{{ $t('book_booking.detail.remark') }}&nbsp;:</h6>
          <div style="white-space: pre-wrap;">{{ book.remark || '-' }}</div>

          <h6 style="white-space: nowrap;">{{ $t('book_booking.detail.createUser') }}&nbsp;:</h6>
          <div>{{ book.createUserName || book.createUserId || '-' }}</div>

          <h6 style="white-space: nowrap;">{{ $t('book_booking.detail.createTime') }}&nbsp;:</h6>
          <div>{{ book.createTime || '-' }}</div>

        </div>
      </div>

      <div class="row q-mt-xl q-mb-md justify-center">
        <q-btn class="shadow-1 component-outline-btn-grow" no-caps unelevated @click="emit('update:modelValue', false)">
          {{ $t('book_booking.detail.close') }}
        </q-btn>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import {computed, defineEmits, defineProps} from "vue";
import {BookSourceEnum, BookStatusEnum} from "@/constants/enums/book.js";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false,
  },
  book: {
    type: Object,
    required: false,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])

const statusEnum = computed(() =>
    props.book ? BookStatusEnum.fromCode(props.book.status) : null)
const statusName = computed(() => statusEnum.value ? statusEnum.value.name : '-')
const statusColor = computed(() => statusEnum.value ? statusEnum.value.color : 'rgb(128, 128, 128)')

// 特殊备注：后端返回逗号分隔字符串，详情以空格分割展示
const specialRemarksDisplay = computed(() =>
    props.book && props.book.specialRemarks
        ? props.book.specialRemarks.split(',').filter(item => item).join(' ') : '')

const sourceEnum = computed(() =>
    props.book && props.book.source != null ? BookSourceEnum.fromCode(props.book.source) : null)
const sourceName = computed(() => sourceEnum.value ? sourceEnum.value.name : '-')
const sourceColor = computed(() => sourceEnum.value ? sourceEnum.value.color : 'rgb(128, 128, 128)')
</script>

<style scoped lang="scss">

</style>
