<template>
  <div class="full-width cal-page">

    <!-- 顶部：导航 + 视图切换 -->
    <div class="row items-center q-mb-lg q-mt-sm cal-toolbar">
      <q-btn round flat dense class="component-none-btn-grow" @click="shift(-1)">
        <q-icon name="fa-solid fa-chevron-left" size=".9rem"/>
      </q-btn>
      <q-btn round flat dense class="component-none-btn-grow q-ml-xs" @click="shift(1)">
        <q-icon name="fa-solid fa-chevron-right" size=".9rem"/>
      </q-btn>
      <div class="cal-title q-ml-md">{{ rangeLabel }}</div>
      <q-btn no-caps unelevated  class="q-ml-xl shadow-1 component-full-btn-mini-grow" @click="resetView">
        {{ viewMode === 'week' ? $t('book_calendar.this_week') : $t('book_calendar.today') }}
      </q-btn>
      <q-btn no-caps unelevated  class="q-ml-xl shadow-1 component-full-btn-mini-grow" @click="toggleView">
        {{ viewMode === 'week' ? $t('book_calendar.view_day') : $t('book_calendar.view_week') }}
      </q-btn>

      <q-space/>

      <!-- 图例 -->
      <div class="row items-center cal-legend">
        <span class="cal-legend-dot cal-legend-block"/>
        <span class="q-mr-md">{{ $t('book_calendar.legend_block') }}</span>
        <span class="cal-legend-dot cal-legend-blocked"/>
        <span>{{ $t('book_calendar.legend_blocked') }}</span>
      </div>
    </div>

    <div v-if="columns.length === 0" class="row flex-center q-py-xl" style="opacity: .6;">
      <q-icon name="fa-regular fa-folder-open" size="18px" class="q-mr-sm"/>
      {{ $t('book_calendar.no_data') }}
    </div>

    <div v-else class="cal-scroll-x">
      <div class="cal-grid" :style="gridStyle">

        <!-- 表头 -->
        <div class="cal-head-row">
          <div class="cal-corner"/>
          <div v-for="col in columns" :key="col.key" class="cal-day-head" :class="{ 'cal-today': col.highlight }">
            <div class="cal-day-main">{{ col.headerMain }}</div>
            <div v-if="col.headerSub" class="cal-day-sub">{{ col.headerSub }}</div>
          </div>
        </div>

        <!-- 主体 -->
        <div class="cal-body-scroll">
          <div ref="bodyRef" class="cal-body" :style="{ height: totalHeight + 'px' }">

            <!-- 时间刻度 -->
            <div ref="gutterRef" class="cal-gutter">
              <div v-for="h in hours" :key="h" class="cal-hour-label" :style="{ height: HOUR_HEIGHT + 'px' }">
                <span>{{ formatHour(h) }}</span>
              </div>
            </div>

            <!-- 列 -->
            <div v-for="(col, colIndex) in columns" :key="col.key" class="cal-col"
                 :class="{ 'cal-col-today': col.highlight }">

              <!-- 小时网格线 -->
              <div v-for="h in hours" :key="h" class="cal-hour-cell" :style="{ height: HOUR_HEIGHT + 'px' }"/>

              <!-- 商户 block 背景（置灰） -->
              <div v-for="(block, bi) in col.blocks" :key="'b' + bi" class="cal-block"
                   :style="{ top: block.top + 'px', height: block.height + 'px' }"/>

              <!-- 预约块（可拖动） -->
              <div v-for="(ev, ei) in col.events" :key="'e' + ei" class="cal-event"
                   :class="{
                     'cal-event-blocked': ev.blocked,
                     'cal-event-cancelled': ev.cancelled,
                     'cal-event-dragging': dragState && dragState.booking.id === ev.booking.id,
                   }"
                   :style="{
                     top: ev.top + 'px', height: ev.height + 'px',
                     left: `calc(${ev.leftPct}% + 2px)`,
                     width: `calc(${ev.widthPct}% - 4px)`,
                     borderLeftColor: ev.statusColor,
                   }"
                   @pointerdown="onEventPointerDown($event, ev, colIndex)">
                <div class="cal-event-title">{{ ev.booking.name || $t('book_calendar.no_name') }}</div>
                <div v-if="ev.height > 34" class="cal-event-sub">{{ ev.sub }}</div>

                <!-- 右下角：已分配显示雇员名；待分配显示自动分配按钮 -->
                <div class="cal-event-corner">
                  <span v-if="ev.booking.staffName" class="cal-event-staff">{{ ev.booking.staffName }}</span>
                  <span v-else-if="ev.booking.status === 0" class="cal-event-auto"
                        @pointerdown.stop @click.stop="autoAssignCalendar(ev.booking)">
                    {{ $t('book_calendar.auto_assign') }}
                  </span>
                </div>
              </div>

            </div>

            <!-- 拖动预览块 -->
            <div v-if="dragState" class="cal-event cal-drag-preview"
                 :style="{
                   top: dragState.top + 'px', height: dragState.height + 'px',
                   left: dragState.left + 'px', width: dragState.width + 'px',
                 }">
              <div class="cal-event-title">{{ dragState.booking.name || $t('book_calendar.no_name') }}</div>
              <div class="cal-event-sub">{{ dragState.label }}</div>
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
import {notifyTopPositive} from "@/utils/notification-tools.js";
import CaskBookDetailDialog from "@/ui/components/CaskBookDetailDialog.vue";
import {bookAdjust, bookCalendar, bookReassign} from "@/api/book.js";
import {staffListSimple} from "@/api/staff.js";
import {BookStatusEnum} from "@/constants/enums/book.js";

const {t} = useI18n()

const HOUR_HEIGHT = 64          // 每小时像素高度
const DEFAULT_START_HOUR = 8    // 默认最早显示 08:00
const DEFAULT_END_HOUR = 22     // 默认最晚显示 22:00
const gutterWidth = '4rem'

const viewMode = ref('week')    // week | day
const bookings = ref([])
const blocks = ref([])
const staffList = ref([])
const weekStart = ref(getMonday(new Date()))
const dayDate = ref(today())

function today() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function getMonday(input) {
  const d = new Date(input)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay() // 0=周日..6=周六
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

// 1=周一..7=周日
function dayOfWeekOf(input) {
  const g = new Date(input).getDay()
  return g === 0 ? 7 : g
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
      dayOfWeek: i + 1,
      name: t(`staff.schedule.day.${i + 1}`),
      dayNum: date.formatDate(d, 'M/D'),
      isToday: dateStr === todayStr,
    })
  }
  return arr
})

const rangeLabel = computed(() => {
  if (viewMode.value === 'week') {
    const d = weekDays.value
    return `${d[0].dateStr}  ~  ${d[6].dateStr}`
  }
  const ds = date.formatDate(dayDate.value, 'YYYY-MM-DD')
  return `${ds}  ${t(`staff.schedule.day.${dayOfWeekOf(dayDate.value)}`)}`
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

// 同一列重叠预约的分列布局：贪心分配列，簇内平均分配宽度
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

// 某天的 block 段（按 dayOfWeek 匹配，商户级别）
function buildDayBlocks(dow, toPx) {
  return blocks.value
      .filter(bl => Number(bl.dayOfWeek) === dow)
      .map(bl => ({
        start: bl.startMinute,
        end: bl.endMinute,
        top: toPx(bl.startMinute),
        height: Math.max((bl.endMinute - bl.startMinute) / 60 * HOUR_HEIGHT, 2),
      }))
}

// 构建一列（预约块 + 定位 + 是否落在 block 内）
// extra: { dateStr, staffId } —— 拖拽落点用于计算新的 bookTimeStr / staffId
function buildColumn(key, headerMain, headerSub, highlight, rawBookings, dayBlocks, toPx, extra = {}) {
  const rawEvents = rawBookings.map(b => ({start: b._start, end: b._end, booking: b}))
  const laid = layoutEvents(rawEvents)
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
  return {
    key, headerMain, headerSub, highlight, blocks: dayBlocks, events,
    dateStr: extra.dateStr || null,
    staffId: extra.staffId || null,
  }
}

// 周视图：横坐标为日期
const weekColumns = computed(() => {
  const {startHour} = timeRange.value
  const rangeStart = startHour * 60
  const toPx = (m) => (m - rangeStart) / 60 * HOUR_HEIGHT
  return weekDays.value.map(day => {
    const dayBlocks = buildDayBlocks(day.dayOfWeek, toPx)
    const rb = bookings.value.filter(b => b._dateStr === day.dateStr)
    return buildColumn(day.dateStr, day.name, day.dayNum, day.isToday, rb, dayBlocks, toPx, {dateStr: day.dateStr})
  })
})

// 每日视图：横坐标为雇员，展示当日每个雇员的工作安排
const staffColumns = computed(() => {
  const {startHour} = timeRange.value
  const rangeStart = startHour * 60
  const toPx = (m) => (m - rangeStart) / 60 * HOUR_HEIGHT
  const dayBlocks = buildDayBlocks(dayOfWeekOf(dayDate.value), toPx)

  const byStaff = {}
  const unassigned = []
  for (const b of bookings.value) {
    if (b.staffId) {
      byStaff[b.staffId] = byStaff[b.staffId] || []
      byStaff[b.staffId].push(b)
    } else {
      unassigned.push(b)
    }
  }

  const dayStr = date.formatDate(dayDate.value, 'YYYY-MM-DD')
  const cols = []
  if (unassigned.length) {
    cols.push(buildColumn('__unassigned', t('book_calendar.unassigned'), '', false, unassigned, dayBlocks, toPx,
        {dateStr: dayStr, staffId: null}))
  }
  for (const s of staffList.value) {
    cols.push(buildColumn(s.id, s.name, s.phone || '', false, byStaff[s.id] || [], dayBlocks, toPx,
        {dateStr: dayStr, staffId: s.id}))
  }
  return cols
})

const columns = computed(() => viewMode.value === 'week' ? weekColumns.value : staffColumns.value)

const gridStyle = computed(() => ({
  '--cal-gutter': gutterWidth,
  '--cal-cols': columns.value.length,
  minWidth: `calc(${gutterWidth} + ${columns.value.length} * 9rem)`,
}))

// 详情
const showDetail = ref(false)
const detailBook = ref(null)

function openDetail(booking) {
  detailBook.value = booking
  showDetail.value = true
}

// 待分配预约的一键自动分配
function autoAssignCalendar(booking) {
  bookReassign(booking.id).then(res => {
    if (!res || !res.data) {
      return
    }
    notifyTopPositive(t('book_calendar.auto_assign_success'))
    reload()
  })
}

function shift(offset) {
  if (viewMode.value === 'week') {
    weekStart.value = date.addToDate(weekStart.value, {days: offset * 7})
    loadWeek()
  } else {
    dayDate.value = date.addToDate(dayDate.value, {days: offset})
    loadDay()
  }
}

function resetView() {
  if (viewMode.value === 'week') {
    weekStart.value = getMonday(new Date())
    loadWeek()
  } else {
    dayDate.value = today()
    loadDay()
  }
}

function toggleView() {
  if (viewMode.value === 'week') {
    viewMode.value = 'day'
    dayDate.value = today()
    loadDay()
  } else {
    viewMode.value = 'week'
    loadWeek()
  }
}

function reload() {
  if (viewMode.value === 'week') {
    loadWeek()
  } else {
    loadDay()
  }
}

// ===== 拖动调整预约 =====
const SNAP_MINUTES = 10          // 纵向拖动以 10 分钟为单位
const DRAG_THRESHOLD = 4         // 小于该位移视为点击
const bodyRef = ref(null)        // 日历主体（定位基准）
const gutterRef = ref(null)      // 时间刻度列（用于测量宽度）
const dragState = ref(null)      // 拖动预览态（响应式，驱动预览块）
let dragCtx = null               // 拖动过程数据（非响应式）

function minutesToTime(min) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function onEventPointerDown(e, ev, colIndex) {
  if (e.button !== 0) {
    return
  }
  e.preventDefault()
  const duration = ev.booking._end - ev.booking._start
  dragCtx = {
    booking: ev.booking,
    duration,
    origStart: ev.booking._start,
    origColIndex: colIndex,
    startX: e.clientX,
    startY: e.clientY,
    moved: false,
  }
  document.body.style.userSelect = 'none'
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
}

function onPointerMove(e) {
  if (!dragCtx) {
    return
  }
  const dx = e.clientX - dragCtx.startX
  const dy = e.clientY - dragCtx.startY
  if (!dragCtx.moved) {
    if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) {
      return
    }
    dragCtx.moved = true
    document.body.classList.add('cal-dragging')
  }

  const bodyEl = bodyRef.value
  if (!bodyEl) {
    return
  }
  const rect = bodyEl.getBoundingClientRect()
  const gutterPx = gutterRef.value ? gutterRef.value.getBoundingClientRect().width : 64
  const colCount = columns.value.length
  const colWidth = (rect.width - gutterPx) / colCount

  let colIndex = Math.floor((e.clientX - rect.left - gutterPx) / colWidth)
  colIndex = Math.max(0, Math.min(colCount - 1, colIndex))

  const {startHour, endHour} = timeRange.value
  const rangeStart = startHour * 60
  const rangeEnd = endHour * 60
  const deltaMin = dy / HOUR_HEIGHT * 60
  let newStart = Math.round((dragCtx.origStart + deltaMin) / SNAP_MINUTES) * SNAP_MINUTES
  newStart = Math.max(rangeStart, Math.min(rangeEnd - dragCtx.duration, newStart))

  dragState.value = {
    booking: dragCtx.booking,
    newStart,
    newColIndex: colIndex,
    left: gutterPx + colIndex * colWidth + 2,
    width: colWidth - 4,
    top: (newStart - rangeStart) / 60 * HOUR_HEIGHT,
    height: dragCtx.duration / 60 * HOUR_HEIGHT,
    label: minutesToTime(newStart),
  }
}

function onPointerUp() {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  document.body.style.userSelect = ''
  document.body.classList.remove('cal-dragging')
  const ctx = dragCtx
  const ds = dragState.value
  dragCtx = null
  dragState.value = null
  if (!ctx) {
    return
  }
  // 未移动 -> 视为点击，打开详情
  if (!ctx.moved || !ds) {
    openDetail(ctx.booking)
    return
  }
  const changedTime = ds.newStart !== ctx.origStart
  const changedCol = ds.newColIndex !== ctx.origColIndex
  if (!changedTime && !changedCol) {
    return
  }
  commitDrag(ctx, ds)
}

function commitDrag(ctx, ds) {
  const targetCol = columns.value[ds.newColIndex]
  const newTime = minutesToTime(ds.newStart)
  const dateStr = targetCol.dateStr || ctx.booking._dateStr
  const bookTimeStr = `${dateStr} ${newTime}`
  // 日视图：落点列即目标雇员；周视图：保留原有雇员（原本为空则为空，不为空则仍传原 staffId）
  const staffId = viewMode.value === 'day'
      ? (targetCol.staffId || undefined)
      : (ctx.booking.staffId || undefined)

  const b = ctx.booking
  // 记录回退所需的原值
  const prev = {
    bookingTime: b.bookingTime, staffId: b.staffId, staffName: b.staffName, staffPhone: b.staffPhone,
    _start: b._start, _end: b._end, _dateStr: b._dateStr,
  }
  // 乐观更新：先反映拖动结果
  b._dateStr = dateStr
  b._start = ds.newStart
  b._end = ds.newStart + ctx.duration
  b.bookingTime = bookTimeStr
  if (viewMode.value === 'day' && targetCol.staffId) {
    b.staffId = targetCol.staffId
    b.staffName = targetCol.headerMain
    b.staffPhone = targetCol.headerSub
  }

  bookAdjust(b.id, bookTimeStr, staffId).then(res => {
    if (!res || !res.data) {
      revertDrag(b, prev)
      return
    }
    notifyTopPositive(t('book_calendar.adjust_success'))
    reload()
  }).catch(() => {
    revertDrag(b, prev)
  })
}

function revertDrag(b, prev) {
  b.bookingTime = prev.bookingTime
  b.staffId = prev.staffId
  b.staffName = prev.staffName
  b.staffPhone = prev.staffPhone
  b._start = prev._start
  b._end = prev._end
  b._dateStr = prev._dateStr
}

function enrichBooking(b) {
  b._dateStr = b.bookingTime ? b.bookingTime.substring(0, 10) : ''
  const startMin = b.bookingTime ? timeToMinutes(b.bookingTime.substring(11, 16)) : 0
  const dur = b.requiredSkillTime && b.requiredSkillTime > 0 ? b.requiredSkillTime : 60
  b._start = startMin
  b._end = startMin + dur
  const statusEnum = BookStatusEnum.fromCode(b.status)
  b.statusName = statusEnum ? statusEnum.name : ''
  b._statusColor = statusEnum ? statusEnum.color : 'rgb(128, 128, 128)'
  const skillNames = (b.skillDtoList || []).map(s => s.name).join(',')
  b._calSub = skillNames || (b.requiredSkillTime ? `${b.requiredSkillTime}min` : '')
  return b
}

function applyData(res) {
  if (!res || !res.data || !res.data.data) {
    return
  }
  const data = res.data.data;
  (data.list || []).forEach(enrichBooking)
  bookings.value = data.list || []
  blocks.value = data.blockList || []
}

// 筛选项必传：周视图取本周一~周日，日视图取当天
function loadWeek() {
  bookCalendar({
    startDateStr: weekDays.value[0].dateStr,
    endDateStr: weekDays.value[6].dateStr,
  }).then(applyData)
}

function loadDay() {
  const ds = date.formatDate(dayDate.value, 'YYYY-MM-DD')
  bookCalendar({startDateStr: ds, endDateStr: ds}).then(applyData)
}

function loadStaff() {
  staffListSimple().then(res => {
    if (!res || !res.data || !res.data.data) {
      return
    }
    staffList.value = res.data.data.map(s => ({id: s.id, name: s.name, phone: s.phone}))
  })
}

onMounted(() => {
  loadStaff()
  loadWeek()
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
  border: 1px solid rgba(128, 128, 128, .18);
  border-radius: .5rem;
  overflow: hidden;
}

.cal-head-row,
.cal-body {
  display: grid;
  grid-template-columns: var(--cal-gutter) repeat(var(--cal-cols), minmax(0, 1fr));
}

.cal-head-row {
  border-bottom: 1px solid rgba(128, 128, 128, .18);
}

.cal-corner {
  border-right: 1px solid rgba(128, 128, 128, .12);
}

.cal-day-head {
  text-align: center;
  padding: .5rem .2rem;
  border-right: 1px solid rgba(128, 128, 128, .12);
  overflow: hidden;

  &:last-child {
    border-right: none;
  }

  .cal-day-main {
    font-size: .9rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cal-day-sub {
    font-size: .75rem;
    opacity: .65;
    margin-top: .1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &.cal-today .cal-day-main {
    color: rgb(var(--pointer));
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
  cursor: grab;
  touch-action: none;
  transition: box-shadow .15s ease, transform .15s ease;

  &:hover {
    box-shadow: 0 3px 10px rgba(0, 0, 0, .2);
    z-index: 3;
  }

  &:active {
    cursor: grabbing;
  }

  // 正在被拖动的原始预约块：淡化
  &.cal-event-dragging {
    opacity: .25;
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

  .cal-event-corner {
    position: absolute;
    right: .35rem;
    bottom: .15rem;
    max-width: calc(100% - .7rem);
    text-align: right;
  }

  .cal-event-staff {
    display: inline-block;
    max-width: 100%;
    font-size: .68rem;
    opacity: .75;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: bottom;
  }

  .cal-event-auto {
    font-size: .68rem;
    color: rgb(var(--pointer));
    cursor: pointer;
    padding: .02rem .3rem;
    border: 1px solid rgb(var(--pointer));
    border-radius: .25rem;
    white-space: nowrap;

    &:hover {
      background: rgba(var(--pointer), .12);
    }
  }

  &.cal-event-blocked {
    opacity: .55;
  }

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

// 拖动时跟随指针的预览块
.cal-drag-preview {
  z-index: 5;
  pointer-events: none;
  border-left-color: rgb(var(--pointer)) !important;
  box-shadow: 0 4px 14px rgba(0, 0, 0, .28);
  opacity: .95;
}

</style>

<!-- 全局：拖动期间强制 grabbing 光标（scoped 无法作用于 body） -->
<style lang="scss">
body.cal-dragging,
body.cal-dragging * {
  cursor: grabbing !important;
}
</style>
