<template>
  <q-dialog :model-value="modelValue" @hide="emit('update:modelValue', false)"
            transition-show="fade" transition-hide="fade">
    <q-card class="component-cask-dialog-judgement-std" style="max-width: 2000px !important">
      <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
        {{ $t('book_booking.detail.title') }}
      </h5>

      <q-separator class="component-separator-base" inset spaced="1rem"/>

      <!-- 两列布局（同门店/雇员编辑卡片）：左=本单信息，右=归档信息（编号/创建）+ 客户在本店的往来记录。
           右列行数多，塞在单列里会把弹窗拉得很长。no-wrap 强制并排，宽度由内容撑开 -->
      <div v-if="book" class="q-ma-md row no-wrap items-start" style="gap: 2rem;">

        <div style="flex: 0 0 auto; min-width: 26rem;">
          <div style="display: grid; grid-template-columns: max-content 1fr; gap: 0.6rem; align-items: center;">

            <h6 style="white-space: nowrap;">{{ $t('book_booking.detail.bookingTime') }}&nbsp;:</h6>
            <div>{{ book.bookingTime || '-' }}</div>

            <h6 style="white-space: nowrap;">{{ $t('book_booking.detail.name') }}&nbsp;:</h6>
            <div>{{ book.name || '-' }}</div>

            <h6 style="white-space: nowrap;">{{ $t('book_booking.detail.phone') }}&nbsp;:</h6>
            <div>{{ book.phone || '-' }}</div>

            <h6 style="white-space: nowrap;">{{ $t('book_booking.detail.mail') }}&nbsp;:</h6>
            <div>{{ book.mail || '-' }}</div>

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

            <!-- 预约金额：为 null 时提示包含未配置金额的服务技能 -->
            <h6 style="white-space: nowrap;">{{ $t('book_booking.detail.amount') }}&nbsp;:</h6>
            <div :style="book.amount == null ? 'color: rgb(var(--negative));' : ''">
              {{ book.amount != null ? book.amount : $t('book_booking.amount_unconfigured') }}
            </div>

            <h6 style="white-space: nowrap;">{{ $t('book_booking.detail.specialRemark') }}&nbsp;:</h6>
            <div>{{ specialRemarksDisplay || '-' }}</div>

            <h6 style="white-space: nowrap; align-self: flex-start;">{{ $t('book_booking.detail.remark') }}&nbsp;:</h6>
            <div style="white-space: pre-wrap;">{{ book.remark || '-' }}</div>

          </div>
        </div>

        <!-- 右列：归档信息 + 该客户在本店的往来记录 -->
        <div style="flex: 0 0 auto; min-width: 30rem; max-width: 34rem;">
          <div style="display: grid; grid-template-columns: max-content 1fr; gap: 0.6rem; align-items: center;">

            <h6 style="white-space: nowrap;">{{ $t('book_booking.detail.id') }}&nbsp;:</h6>
            <div>{{ book.id || '-' }}</div>

            <h6 style="white-space: nowrap;">{{ $t('book_booking.detail.createUser') }}&nbsp;:</h6>
            <div>{{ book.createUserName || book.createUserId || '-' }}</div>

            <h6 style="white-space: nowrap;">{{ $t('book_booking.detail.createTime') }}&nbsp;:</h6>
            <div>{{ book.createTime || '-' }}</div>

            <!-- 按手机号统计的此前已预约次数（不含已取消、不含本单及之后），仅详情接口返回；
                 没有可用手机号时后端返回 null，这里显示「-」而不是 0 -->
            <h6 style="white-space: nowrap;">{{ $t('book_booking.detail.customerBookingCountTenant') }}&nbsp;:</h6>
            <div>{{ book.customerBookingCountTenant != null ? book.customerBookingCountTenant : '-' }}</div>

            <h6 style="white-space: nowrap;">{{ $t('book_booking.detail.customerBookingCount') }}&nbsp;:</h6>
            <div>{{ book.customerBookingCount != null ? book.customerBookingCount : '-' }}</div>

            <!-- 是否首次本站预约：按手机号在本租户内判定（含本站预约各渠道分身），无手机号时为 null -->
            <h6 style="white-space: nowrap;">{{ $t('book_booking.detail.firstOwnSiteBooking') }}&nbsp;:</h6>
            <div :style="book.firstOwnSiteBooking ? `color: rgb(var(--pointer))` : ''">
              {{
                book.firstOwnSiteBooking == null
                    ? '-'
                    : (book.firstOwnSiteBooking ? $t('book_booking.detail.yes') : $t('book_booking.detail.no'))
              }}
            </div>

          </div>

          <!-- 该手机号在本店、本单之前的最近 5 条预约（含已取消）。雇员与项目后端都只给 id，
               用页面已加载的雇员/项目列表（staffNameMap / skillNameMap）渲染成名称，映射不到就原样显示 id -->
          <h6 class="q-mt-lg" style="white-space: nowrap;">{{ $t('book_booking.detail.history') }}&nbsp;:</h6>
          <div class="q-mt-xs" style="opacity: .5; font-size: .78rem;">
            {{ $t('book_booking.detail.history_hint') }}
          </div>

          <div v-if="historyList.length === 0" class="q-mt-sm" style="opacity: .5; font-size: .85rem;">
            {{ $t('book_booking.detail.history_empty') }}
          </div>

          <div class="q-mt-sm" style="max-height: 22rem; overflow-y: auto;">
            <div v-for="history in historyList" :key="history.id" class="book-history-item">
              <div class="row items-center justify-between no-wrap" style="gap: .5rem;">
                <!-- 星期与日期同一套样式，读起来是一整个时间 -->
                <div style="font-weight: 600;">
                  {{ history.bookingTime || '-' }} {{ weekdayOf(history.bookingTime) }}
                </div>
                <div class="row items-center no-wrap" style="gap: .6rem; font-size: .8rem;">
                  <div :style="`color: ${statusColorOf(history.status)}`">{{ statusNameOf(history.status) }}</div>
                  <div :style="`color: ${sourceColorOf(history.source)}`">{{ sourceNameOf(history.source) }}</div>
                </div>
              </div>

              <!-- 两列成对：编号 + 创建时间一行、偏好员工 + 服务人员一行，项目独占末行（名称可能很长） -->
              <div class="book-history-grid q-mt-xs">
                <div class="book-history-label">{{ $t('book_booking.detail.id') }}</div>
                <div>{{ history.id || '-' }}</div>
                <div class="book-history-label">{{ $t('book_booking.detail.createTime') }}</div>
                <div>{{ history.createTime || '-' }}</div>

                <div class="book-history-label">{{ $t('book_booking.detail.preferredStaff') }}</div>
                <div>{{ staffNameOf(history.preferredStaffId) }}</div>
                <div class="book-history-label">{{ $t('book_booking.detail.staff') }}</div>
                <div>{{ staffNameOf(history.staffId) }}</div>

                <div class="book-history-label">{{ $t('book_booking.detail.project') }}</div>
                <div style="grid-column: span 3;">{{ skillNamesOf(history) }}</div>
              </div>
            </div>
          </div>

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
import {useI18n} from 'vue-i18n'
import {BookSourceEnum, BookStatusEnum} from "@/constants/enums/book.js";

const {t} = useI18n()

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
  // 雇员 id -> 姓名。历史预约行里的偏好员工/服务人员后端只给 id，用调用页已加载的雇员列表渲染。
  // 不传（如邮件/客户反馈页，它们本就不拉雇员列表）则原样显示 id，不额外发请求——
  // /staff/list/simple 要 book:book:list 权限，仅持反馈域权限的账户会被拒并弹错误提示
  staffNameMap: {
    type: Object,
    required: false,
    default: () => ({}),
  },
  // 项目（技能）id -> 名称，口径同 staffNameMap：历史行的 requiredSkillIds 是逗号分隔的 id 串
  skillNameMap: {
    type: Object,
    required: false,
    default: () => ({}),
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

// ===== 该手机号的历史预约（右列列表） =====
const historyList = computed(() =>
    props.book && Array.isArray(props.book.historyBookings) ? props.book.historyBookings : [])

function statusNameOf(status) {
  const item = status != null ? BookStatusEnum.fromCode(status) : null
  return item ? item.name : '-'
}

function statusColorOf(status) {
  const item = status != null ? BookStatusEnum.fromCode(status) : null
  return item ? item.color : 'rgb(128, 128, 128)'
}

function sourceNameOf(source) {
  const item = source != null ? BookSourceEnum.fromCode(source) : null
  return item ? item.name : '-'
}

function sourceColorOf(source) {
  const item = source != null ? BookSourceEnum.fromCode(source) : null
  return item ? item.color : 'rgb(128, 128, 128)'
}

// 后端给的是逗号分隔的技能 id 串，用调用页已加载的项目列表渲染；映射不到的原样保留 id
function skillNamesOf(history) {
  const ids = history && history.requiredSkillIds
      ? history.requiredSkillIds.split(',').map(id => id.trim()).filter(id => id) : []
  return ids.length > 0 ? ids.map(id => props.skillNameMap[id] || id).join(' ') : '-'
}

// 星期：只从「yyyy-MM-dd」这几位按 年/月/日 直接算，不经过任何时区换算。
// 某个日历日期对应星期几是固定的（与时区无关），会算错的只有「把墙钟字符串当成时刻去转时区」这一种写法——
// 预约时间是门店墙钟，new Date('2026-09-17 14:30') 会按浏览器时区解释，跨时区可能差出一天。
// 这里用 Date.UTC 构造再取 getUTCDay，两端都在 UTC 上，不会有偏移
function weekdayOf(timeStr) {
  if (!timeStr || timeStr.length < 10) {
    return ''
  }
  const year = Number(timeStr.substring(0, 4))
  const month = Number(timeStr.substring(5, 7))
  const day = Number(timeStr.substring(8, 10))
  if (!year || !month || !day) {
    return ''
  }
  const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  // getUTCDay 是 0=周日，转成 i18n 里用的 1=周一 ~ 7=周日
  return t(`book_booking.detail.weekday.${dayOfWeek === 0 ? 7 : dayOfWeek}`)
}

// 映射不到（雇员已删除、调用页未传映射表）时原样显示 id，至少还能据此查到人
function staffNameOf(staffId) {
  if (!staffId) {
    return '-'
  }
  return props.staffNameMap[staffId] || staffId
}
</script>

<style scoped lang="scss">

// 历史预约行：边框卡片，与雇员编辑卡片里的屏蔽时段列表同款
.book-history-item {
  padding: .5rem .7rem;
  margin-bottom: .5rem;
  border: 1px solid rgba(var(--text-color), .35);
  border-radius: 4px;
  font-size: .82rem;
}

// 一行放两组「标签 + 值」；minmax(0, 1fr) 让长值（预约编号、项目名串）换行而不是把网格撑破
.book-history-grid {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr) max-content minmax(0, 1fr);
  gap: .2rem .6rem;
  align-items: baseline;
  word-break: break-word;
}

.book-history-label {
  white-space: nowrap;
  opacity: .55;
}

</style>
