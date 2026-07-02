<template>
  <div class="full-width cal-page">

    <!-- 顶部：周导航 -->
    <div class="row items-center q-mb-md q-mt-sm cal-toolbar">
      <q-btn round flat dense class="component-none-btn-grow" @click="shiftWeek(-1)">
        <q-icon name="fa-solid fa-chevron-left" size=".9rem"/>
      </q-btn>
      <q-btn round flat dense class="component-none-btn-grow q-ml-xs" @click="shiftWeek(1)">
        <q-icon name="fa-solid fa-chevron-right" size=".9rem"/>
      </q-btn>
      <div class="cal-title q-ml-md">{{ weekLabel }}</div>
      <q-btn no-caps unelevated class="q-ml-xl shadow-1 component-full-btn-mini-grow" @click="goThisWeek">
        {{ $t('book_calendar.this_week') }}
      </q-btn>

      <q-space/>

      <!-- 图例 -->
      <div class="row items-center cal-legend q-mr-sm">
        <span class="cal-legend-dot cal-legend-block"/>
        <span class="q-mr-md">{{ $t('book_calendar.legend_block') }}</span>
        <span class="cal-legend-dot cal-legend-blocked"/>
        <span>{{ $t('book_calendar.legend_blocked') }}</span>
      </div>
    </div>

    <div class="cal-scroll-x">
      <div class="cal-grid" :style="{ '--cal-gutter': gutterWidth }">

        <!-- 星期表头 -->
        <div class="cal-head-row">
          <div class="cal-corner"/>
          <div v-for="day in weekDays" :key="day.dateStr" class="cal-day-head" :class="{ 'cal-today': day.isToday }">
            <div class="cal-day-name">{{ day.name }}</div>
            <div class="cal-day-num">{{ day.dayNum }}</div>
          </div>
        </div>

        <!-- 日历主体 -->
        <div class="cal-body-scroll">
          <div class="cal-body" :style="{ height: totalHeight + 'px' }">

            <!-- 时间刻度 -->
            <div class="cal-gutter">
              <div v-for="h in hours" :key="h" class="cal-hour-label" :style="{ height: HOUR_HEIGHT + 'px' }">
                <span>{{ formatHour(h) }}</span>
              </div>
            </div>

            <!-- 每日列 -->
            <div v-for="col in dayColumns" :key="col.day.dateStr" class="cal-col"
                 :class="{ 'cal-col-today': col.day.isToday }">

              <!-- 小时网格线 -->
              <div v-for="h in hours" :key="h" class="cal-hour-cell" :style="{ height: HOUR_HEIGHT + 'px' }"/>

              <!-- 商户 block 背景（置灰） -->
              <div v-for="(block, bi) in col.blocks" :key="'b' + bi" class="cal-block"
                   :style="{ top: block.top + 'px', height: block.height + 'px' }"/>

              <!-- 预约块 -->
              <div v-for="(ev, ei) in col.events" :key="'e' + ei" class="cal-event"
                   :class="{ 'cal-event-blocked': ev.blocked, 'cal-event-cancelled': ev.cancelled }"
                   :style="{
                     top: ev.top + 'px', height: ev.height + 'px',
                     left: `calc(${ev.leftPct}% + 2px)`,
                     width: `calc(${ev.widthPct}% - 4px)`,
                     borderLeftColor: ev.statusColor,
                   }"
                   @click="openDetail(ev.booking)">
                <div class="cal-event-title">{{ ev.booking.name || $t('book_calendar.no_name') }}</div>
                <div v-if="ev.height > 34" class="cal-event-sub">{{ ev.sub }}</div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>

    <cask-book-detail-dialog v-model="showDetail" :book="detailBook"/>

  </div>
</template>

<script setup>
import {computed, onMounted, ref} from "vue";
import {useI18n} from 'vue-i18n'
import {date} from "quasar";
import CaskBookDetailDialog from "@/ui/components/CaskBookDetailDialog.vue";
import {bookCalendar} from "@/api/book.js";
import {BookStatusEnum} from "@/constants/enums/book.js";

const {t} = useI18n()

const HOUR_HEIGHT = 64          // 每小时像素高度
const DEFAULT_START_HOUR = 8  // 默认最早显示 08:00
const DEFAULT_END_HOUR = 22    // 默认最晚显示 22:00
const gutterWidth = '4rem'

const bookings = ref([])
const blocks = ref([])
const weekStart = ref(getMonday(new Date()))

// 当前周一
function getMonday(input) {
  const d = new Date(input)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay() // 0=周日..6=周六
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

function timeToMinutes(hhmm) {
  if (!hhmm) {
    return 0
  }
  const parts = hhmm.split(':')
  if (parts.length < 2) {
    return 0
  }
  const h = Number(parts[0])
  const m = Number(parts[1])
  if (Number.isNaN(h) || Number.isNaN(m)) {
    return 0
  }
  return h * 60 + m
}

function formatHour(h) {
  return `${String(h).padStart(2, '0')}:00`
}

// 一周 7 天（周一 ~ 周日）
const weekDays = computed(() => {
  const todayStr = date.formatDate(new Date(), 'YYYY-MM-DD')
  const arr = []
  for (let i = 0; i < 7; i++) {
    const d = date.addToDate(weekStart.value, {days: i})
    const dateStr = date.formatDate(d, 'YYYY-MM-DD')
    arr.push({
      dateStr,
      dayOfWeek: i + 1, // 1=周一..7=周日
      name: t(`staff.schedule.day.${i + 1}`),
      dayNum: date.formatDate(d, 'M/D'),
      isToday: dateStr === todayStr,
    })
  }
  return arr
})

const weekLabel = computed(() => {
  const days = weekDays.value
  return `${days[0].dateStr}  ~  ${days[6].dateStr}`
})

// 显示时间范围：默认 8:00-22:00，若有数据超出则自动扩展
const timeRange = computed(() => {
  let minM = DEFAULT_START_HOUR * 60
  let maxM = DEFAULT_END_HOUR * 60
  for (const b of bookings.value) {
    if (b._start != null) {
      minM = Math.min(minM, b._start)
    }
    if (b._end != null) {
      maxM = Math.max(maxM, b._end)
    }
  }
  for (const bl of blocks.value) {
    if (bl.startMinute != null) {
      minM = Math.min(minM, bl.startMinute)
    }
    if (bl.endMinute != null) {
      maxM = Math.max(maxM, bl.endMinute)
    }
  }
  return {
    startHour: Math.max(0, Math.floor(minM / 60)),
    endHour: Math.min(24, Math.ceil(maxM / 60)),
  }
})

const hours = computed(() => {
  const {startHour, endHour} = timeRange.value
  const arr = []
  for (let h = startHour; h < endHour; h++) {
    arr.push(h)
  }
  return arr
})

const totalHeight = computed(() => {
  const {startHour, endHour} = timeRange.value
  return Math.max(endHour - startHour, 1) * HOUR_HEIGHT
})

// 同一天重叠预约的分列布局：贪心分配列，簇内平均分配宽度
function layoutEvents(events) {
  const sorted = [...events].sort((a, b) => a.start - b.start || a.end - b.end)
  let cluster = []
  let clusterEnd = -1
  const flush = () => {
    if (!cluster.length) {
      return
    }
    const columnsEnd = []
    for (const ev of cluster) {
      let placed = false
      for (let i = 0; i < columnsEnd.length; i++) {
        if (ev.start >= columnsEnd[i]) {
          ev.col = i
          columnsEnd[i] = ev.end
          placed = true
          break
        }
      }
      if (!placed) {
        ev.col = columnsEnd.length
        columnsEnd.push(ev.end)
      }
    }
    for (const ev of cluster) {
      ev.colCount = columnsEnd.length
    }
    cluster = []
    clusterEnd = -1
  }
  for (const ev of sorted) {
    if (cluster.length && ev.start >= clusterEnd) {
      flush()
    }
    cluster.push(ev)
    clusterEnd = Math.max(clusterEnd, ev.end)
  }
  flush()
  return sorted
}

const dayColumns = computed(() => {
  const {startHour} = timeRange.value
  const rangeStart = startHour * 60
  const toPx = (minute) => (minute - rangeStart) / 60 * HOUR_HEIGHT

  return weekDays.value.map(day => {
    // 该天的 block（按 dayOfWeek 匹配）
    const dayBlocks = blocks.value
        .filter(bl => Number(bl.dayOfWeek) === day.dayOfWeek)
        .map(bl => ({
          start: bl.startMinute,
          end: bl.endMinute,
          top: toPx(bl.startMinute),
          height: Math.max((bl.endMinute - bl.startMinute) / 60 * HOUR_HEIGHT, 2),
        }))

    // 该天的预约
    const dayEvents = bookings.value
        .filter(b => b._dateStr === day.dateStr)
        .map(b => ({start: b._start, end: b._end, booking: b}))

    const laid = layoutEvents(dayEvents)
    const events = laid.map(ev => {
      const widthPct = 100 / ev.colCount
      const blocked = dayBlocks.some(bl => ev.start < bl.end && ev.end > bl.start)
      return {
        booking: ev.booking,
        top: toPx(ev.start),
        height: Math.max((ev.end - ev.start) / 60 * HOUR_HEIGHT, 22),
        leftPct: ev.col * widthPct,
        widthPct,
        blocked,
        cancelled: ev.booking.status === -1,
        statusColor: ev.booking._statusColor,
        sub: ev.booking._calSub,
      }
    })

    return {day, blocks: dayBlocks, events}
  })
})

// 详情
const showDetail = ref(false)
const detailBook = ref(null)

function openDetail(booking) {
  detailBook.value = booking
  showDetail.value = true
}

function shiftWeek(offset) {
  weekStart.value = date.addToDate(weekStart.value, {days: offset * 7})
  selectData()
}

function goThisWeek() {
  weekStart.value = getMonday(new Date())
  selectData()
}

function selectData() {
  // 筛选项必传：本周一 ~ 本周日
  const param = {
    startDateStr: weekDays.value[0].dateStr,
    endDateStr: weekDays.value[6].dateStr,
  }
  bookCalendar(param).then(res => {
    if (!res || !res.data || !res.data.data) {
      return
    }
    const data = res.data.data
    const list = data.list || []
    list.forEach(b => {
      b._dateStr = b.bookingTime ? b.bookingTime.substring(0, 10) : ''
      const startMin = b.bookingTime ? timeToMinutes(b.bookingTime.substring(11, 16)) : 0
      const dur = b.requiredSkillTime && b.requiredSkillTime > 0 ? b.requiredSkillTime : 60
      b._start = startMin
      b._end = startMin + dur
      const statusEnum = BookStatusEnum.fromCode(b.status)
      b.statusName = statusEnum ? statusEnum.name : ''
      b._statusColor = statusEnum ? statusEnum.color : 'rgb(128, 128, 128)'
      const skillNames = (b.skillDtoList || []).map(s => s.name).join('、')
      b._calSub = skillNames || (b.requiredSkillTime ? `${b.requiredSkillTime}min` : '')
    })
    bookings.value = list
    blocks.value = data.blockList || []
  })
}

onMounted(() => {
  selectData()
})
</script>

<style scoped lang="scss">

.cal-page {
  padding: 0 2rem 1rem 0.5rem;
}

.cal-toolbar {
  .cal-title {
    font-size: 1.1rem;
    font-weight: 600;
  }

  .cal-legend {
    font-size: .8rem;
    opacity: .8;

    .cal-legend-dot {
      display: inline-block;
      width: .9rem;
      height: .9rem;
      border-radius: .2rem;
      margin-right: .35rem;
      vertical-align: middle;
    }

    .cal-legend-block {
      background: rgba(128, 128, 128, .22);
    }

    .cal-legend-blocked {
      background: rgb(var(--pointer));
      opacity: .5;
    }
  }
}

.cal-scroll-x {
  overflow-x: auto;
}

.cal-grid {
  min-width: 62rem;
  border: 1px solid rgba(128, 128, 128, .18);
  border-radius: .5rem;
  overflow: hidden;
}

.cal-head-row,
.cal-body {
  display: grid;
  grid-template-columns: var(--cal-gutter) repeat(7, minmax(0, 1fr));
}

.cal-head-row {
  border-bottom: 1px solid rgba(128, 128, 128, .18);
}

.cal-corner {
  border-right: 1px solid rgba(128, 128, 128, .12);
}

.cal-day-head {
  text-align: center;
  padding: .5rem 0;
  border-right: 1px solid rgba(128, 128, 128, .12);

  &:last-child {
    border-right: none;
  }

  .cal-day-name {
    font-size: .8rem;
    opacity: .7;
  }

  .cal-day-num {
    font-size: .95rem;
    font-weight: 600;
    margin-top: .1rem;
  }

  &.cal-today {
    .cal-day-num {
      color: rgb(var(--pointer));
    }
  }
}

.cal-body-scroll {
  max-height: 66vh;
  overflow-y: auto;
}

.cal-body {
  position: relative;
}

.cal-gutter {
  border-right: 1px solid rgba(128, 128, 128, .12);

  .cal-hour-label {
    position: relative;
    font-size: .72rem;
    opacity: .6;
    text-align: right;
    padding-right: .4rem;

    span {
      position: absolute;
      top: -.55rem;
      right: .4rem;
    }
  }
}

.cal-col {
  position: relative;
  border-right: 1px solid rgba(128, 128, 128, .12);

  &:last-child {
    border-right: none;
  }

  &.cal-col-today {
    background: rgba(var(--pointer), .03);
  }
}

.cal-hour-cell {
  border-bottom: 1px solid rgba(128, 128, 128, .1);
}

.cal-block {
  position: absolute;
  left: 0;
  right: 0;
  background: rgba(128, 128, 128, .22);
  z-index: 1;
  pointer-events: none;
}

.cal-event {
  position: absolute;
  z-index: 2;
  border-radius: .3rem;
  border-left: 3px solid rgb(128, 128, 128);
  background: rgba(255, 255, 255, .5);
  box-shadow: 0 1px 4px rgba(0, 0, 0, .12);
  padding: .15rem .35rem;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow .15s ease, transform .15s ease;

  &:hover {
    box-shadow: 0 3px 10px rgba(0, 0, 0, .2);
    z-index: 3;
  }

  .cal-event-title {
    font-size: .78rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cal-event-sub {
    font-size: .7rem;
    opacity: .7;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  // 被 block 覆盖的预约：半透明，让下层灰色可见
  &.cal-event-blocked {
    opacity: .55;
  }

  // 已取消：置灰 + 删除线
  &.cal-event-cancelled {
    border-left-color: rgb(200, 60, 60) !important;

    .cal-event-title {
      text-decoration: line-through;
      opacity: .6;
    }

    .cal-event-sub {
      text-decoration: line-through;
    }
  }
}

</style>
