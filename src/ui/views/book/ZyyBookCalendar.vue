<template>
  <div class="full-width cal-page">

    <!-- 顶部：导航 + 视图切换 -->
    <div class="row items-center q-mb-lg q-mt-sm cal-toolbar">
      <!-- 周视图：双箭头=按周移动(±7天)，单箭头=按天移动(±1天)；日视图：单箭头=按天移动 -->
      <q-btn v-if="viewMode === 'week'" round flat dense class="component-none-btn-grow" @click="shift(-7)">
        <q-icon name="fa-solid fa-angles-left" size=".9rem"/>
      </q-btn>
      <q-btn round flat dense class="component-none-btn-grow q-ml-xs" @click="shift(-1)">
        <q-icon name="fa-solid fa-chevron-left" size=".9rem"/>
      </q-btn>
      <q-btn round flat dense class="component-none-btn-grow q-ml-xs" @click="shift(1)">
        <q-icon name="fa-solid fa-chevron-right" size=".9rem"/>
      </q-btn>
      <q-btn v-if="viewMode === 'week'" round flat dense class="component-none-btn-grow q-ml-xs" @click="shift(7)">
        <q-icon name="fa-solid fa-angles-right" size=".9rem"/>
      </q-btn>
      <div class="cal-title q-ml-md">{{ rangeLabel }}</div>
      <q-btn no-caps unelevated  class="q-ml-xl shadow-1 component-full-btn-mini-grow" @click="resetView">
        {{ viewMode === 'week' ? $t('book_calendar.this_week') : $t('book_calendar.today') }}
      </q-btn>
      <q-btn no-caps unelevated  class="q-ml-xl shadow-1 component-full-btn-mini-grow" @click="toggleView">
        {{ viewMode === 'week' ? $t('book_calendar.view_day') : $t('book_calendar.view_week') }}
      </q-btn>

      <q-space/>

      <q-btn no-caps unelevated  class="q-mr-xl shadow-1 component-full-btn-mini-grow" @click="openAddBooking">
        {{ $t('book_booking.button.add') }}
      </q-btn>
      <!-- 图例 -->
<!--      <div class="row items-center cal-legend">-->
<!--        <span class="cal-legend-dot cal-legend-block"/>-->
<!--        <span class="q-mr-md">{{ $t('book_calendar.legend_block') }}</span>-->
<!--        <span class="cal-legend-dot cal-legend-blocked"/>-->
<!--        <span>{{ $t('book_calendar.legend_blocked') }}</span>-->
<!--      </div>-->
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

              <!-- 门店 block 背景（置灰） -->
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
                     background: ev.bgColor,
                   }"
                   @pointerdown="onEventPointerDown($event, ev, colIndex)"
                   @mouseenter="onEventEnter($event, ev, colIndex)">
                <!-- 第一行：客户名称 + 来源（带来源色）；第二行起：起止时间 / 预约项目 / 联系方式 / 备注 -->
                <div class="cal-event-title">
                  <span class="cal-event-name">{{ ev.booking.name || $t('book_calendar.no_name') }}</span>
                  <span v-if="ev.sourceName" class="cal-event-source" :style="{ color: ev.sourceColor }">
                    {{ ev.sourceName }}
                  </span>
                </div>
                <div v-for="(line, li) in ev.lines" :key="li" class="cal-event-sub">{{ line }}</div>

                <!-- 底部：左=雇员名/自动分配，右=取消预约 -->
                <div v-if="ev.booking.staffName || ev.booking.status !== -1" class="cal-event-footer">
                  <span v-if="ev.booking.staffName" class="cal-event-staff">{{ ev.booking.staffName }}</span>
                </div>
              </div>

            </div>

            <!-- 拖动预览块 -->
            <div v-if="dragState" class="cal-event cal-drag-preview"
                 :style="{
                   top: dragState.top + 'px', height: dragState.height + 'px',
                   left: dragState.left + 'px', width: dragState.width + 'px',
                   borderLeftColor: dragState.booking._statusColor,
                   background: dragState.booking._bgColor,
                 }">
              <div class="cal-event-title">{{ dragState.booking.name || $t('book_calendar.no_name') }}</div>
              <div class="cal-event-sub">{{ dragState.label }}</div>
            </div>

          </div>
        </div>

      </div>
    </div>

    <cask-book-detail-dialog v-model="showDetail" :book="detailBook"/>

    <!-- 新增/编辑弹窗（与预约列表共用同一组件，保持一致） -->
    <cask-book-upsert-dialog v-model="showEdit" :book="editBook" :is-new="editIsNew"
                             @saved="reload"/>

    <!-- 取消预约确认（复用预约列表的取消文案与逻辑） -->
    <cask-dialog-judgment v-model="showCancel"
                          :callback-method="isTrue => { showCancel = false; if (isTrue) cancelData() }"
                          :dialog-judgment-data="{ title: $t('book_booking.dialog.delete.title'), content: $t('book_booking.dialog.delete.content', { name: cancelBook ? cancelBook.name : '' }), falseLabel: $t('book_booking.dialog.common.cancel'), trueLabel: $t('book_booking.dialog.common.confirm') }"
    />

    <!-- 悬浮完整预览：teleport 到 body，不受日历容器裁剪，可完整显示（含边缘卡片）。
         预览块本身可交互：mouseleave 收回、pointerdown 进入拖拽/点击流程、可点击「自动分配」 -->
    <teleport to="body">
      <div v-if="hoverCard" class="cal-event cal-hover-card"
           :class="{ 'cal-event-cancelled': hoverCard.ev.cancelled }"
           :style="hoverCard.style"
           @mouseleave="hideHoverCard"
           @pointerdown="onEventPointerDown($event, hoverCard.ev, hoverCard.colIndex)">
        <div class="cal-event-title">
          <span class="cal-event-name">{{ hoverCard.ev.booking.name || $t('book_calendar.no_name') }}</span>
          <span v-if="hoverCard.ev.sourceName" class="cal-event-source" :style="{ color: hoverCard.ev.sourceColor }">
            {{ hoverCard.ev.sourceName }}
          </span>
          <q-space/>
          <q-icon v-if="hoverCard.ev.booking.status !== -1" name="fa-solid fa-pen" size="0.9rem"
                  class="cal-event-edit" @pointerdown.stop @click.stop="openEdit(hoverCard.ev.booking)"/>
        </div>
        <div v-for="(line, li) in hoverCard.ev.lines" :key="li" class="cal-event-sub">{{ line }}</div>
        <div v-if="hoverCard.ev.booking.staffName || hoverCard.ev.booking.status !== -1"
             class="cal-event-footer">
          <span v-if="hoverCard.ev.booking.staffName" class="cal-event-staff">{{ hoverCard.ev.booking.staffName }}</span>
          <span v-else-if="hoverCard.ev.booking.status === 0" class="cal-event-auto"
                @pointerdown.stop @click.stop="autoAssignCalendar(hoverCard.ev.booking)">
            {{ $t('book_calendar.auto_assign') }}
          </span>
          <span v-if="hoverCard.ev.booking.status !== -1" class="cal-event-cancel"
                @pointerdown.stop @click.stop="openCancel(hoverCard.ev.booking)">
            {{ $t('book_calendar.cancel_booking') }}
          </span>
        </div>
      </div>
    </teleport>

  </div>
</template>

<script setup>
import {computed, onBeforeUnmount, onMounted, ref} from "vue";
import {useI18n} from 'vue-i18n'
import {date} from "quasar";
import {notifyTopPositive} from "@/utils/notification-tools.js";
import CaskBookDetailDialog from "@/ui/components/CaskBookDetailDialog.vue";
import CaskBookUpsertDialog from "@/ui/components/CaskBookUpsertDialog.vue";
import {bookAdjust, bookCalendar, bookDelete, bookReassign} from "@/api/book.js";
import CaskDialogJudgment from "@/ui/components/CaskDialogJudgment.vue";
import {staffListSimple} from "@/api/staff.js";
import {BookSourceEnum, BookStatusEnum} from "@/constants/enums/book.js";

const {t} = useI18n()

const HOUR_HEIGHT = 64          // 每小时像素高度
const DEFAULT_START_HOUR = 8    // 默认最早显示 08:00
const DEFAULT_END_HOUR = 22     // 默认最晚显示 22:00
const gutterWidth = '4rem'

const viewMode = ref('week')    // week | day
const bookings = ref([])
const blocks = ref([])
const staffList = ref([])
const weekStart = ref(getWeekViewStart(new Date()))
const dayDate = ref(today())

function today() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

// 周视图默认窗口起点：前一天（如今天周一，则窗口为上周日 ~ 本周六）
function getWeekViewStart(input) {
  const d = new Date(input)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - 1)
  return d
}

// 1=周一..7=周日
function dayOfWeekOf(input) {
  const g = new Date(input).getDay()
  return g === 0 ? 7 : g
}

// 'rgb(r, g, b)' -> 'rgba(r, g, b, alpha)'，用于以状态色渲染半透明底色
function rgbToRgba(color, alpha) {
  if (!color) {
    return `rgba(128, 128, 128, ${alpha})`
  }
  const m = color.match(/rgba?\(([^)]+)\)/)
  if (!m) {
    return color
  }
  const parts = m[1].split(',').slice(0, 3).map(s => s.trim())
  return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`
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

// 从 weekStart 起连续 7 天（滚动窗口，起点任意；dayOfWeek 按真实星期计算）
const weekDays = computed(() => {
  const todayStr = date.formatDate(new Date(), 'YYYY-MM-DD')
  const arr = []
  for (let i = 0; i < 7; i++) {
    const d = date.addToDate(weekStart.value, {days: i})
    const dateStr = date.formatDate(d, 'YYYY-MM-DD')
    const dow = dayOfWeekOf(d)
    arr.push({
      dateStr,
      dayOfWeek: dow,
      name: t(`staff.schedule.day.${dow}`),
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

// 某天的 block 段（按 dayOfWeek 匹配，门店级别）
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
    const b = ev.booking
    // 卡片正文行（第二行起）：预约项目 / 客户联系方式 / 备注，空值自动跳过（下一行上移）
    const lines = [b._timeRange, b._calSub, b._contact, b.remark].filter(Boolean)
    return {
      booking: b,
      top: toPx(ev.start),
      height: Math.max((ev.end - ev.start) / 60 * HOUR_HEIGHT, 22),
      leftPct: ev.col * widthPct,
      widthPct,
      blocked,
      cancelled: b.status === -1,
      statusColor: b._statusColor,
      sourceColor: b._sourceColor,
      sourceName: b._sourceName,
      bgColor: b._bgColor,
      lines,
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
  const dow = dayOfWeekOf(dayDate.value)
  const cols = []
  // 未分配列始终存在，方便将预约拖入以解除分配（即使当前没有未分配预约）
  cols.push(buildColumn('__unassigned', t('book_calendar.unassigned'), '', false, unassigned, dayBlocks, toPx,
      {dateStr: dayStr, staffId: null}))
  for (const s of staffList.value) {
    // 只显示当天有排班的雇员；无排班但当天已有预约的仍显示，避免预约块丢失
    const scheduledToday = (s.scheduleList || []).some(sc => Number(sc.dayOfWeek) === dow)
    const hasBookings = (byStaff[s.id] || []).length > 0
    if (!scheduledToday && !hasBookings) {
      continue
    }
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

// 新增/编辑（弹窗与预约列表共用组件；保存成功后刷新当前视图）
const showEdit = ref(false)
const editBook = ref(null)
const editIsNew = ref(false)

function openEdit(booking) {
  hideHoverCard()
  editBook.value = booking
  editIsNew.value = false
  showEdit.value = true
}

function openAddBooking() {
  hideHoverCard()
  editBook.value = null
  editIsNew.value = true
  showEdit.value = true
}

// 悬浮完整预览（teleport 到 body，不受日历滚动/裁剪容器限制，边缘自动翻转方向）。
// 预览块完整覆盖原卡片且自身可交互：收回由预览块的 mouseleave 驱动（浏览器原生命中判定，
// 从任意方向进入均稳定），拖拽/点击/自动分配均可直接在预览块上操作。
const hoverCard = ref(null)

function onEventEnter(e, ev, colIndex) {
  if (dragCtx) {
    return // 拖拽过程中不展开预览
  }
  const rect = e.currentTarget.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight
  const style = {
    position: 'fixed',
    minWidth: rect.width + 'px',
    minHeight: rect.height + 'px',
    borderLeftColor: ev.statusColor,
  }
  // 靠右/靠下的卡片改为从右/下边缘向左/上生长，保证完整可见
  if (rect.left > vw * 0.6) {
    style.right = (vw - rect.right) + 'px'
  } else {
    style.left = rect.left + 'px'
  }
  if (rect.top > vh * 0.6) {
    style.bottom = (vh - rect.bottom) + 'px'
  } else {
    style.top = rect.top + 'px'
  }
  hoverCard.value = {ev, style, colIndex}
}

function hideHoverCard() {
  hoverCard.value = null
}

// 取消预约（确认后调用，与预约列表的取消逻辑一致）
const showCancel = ref(false)
const cancelBook = ref(null)

function openCancel(booking) {
  hideHoverCard()
  cancelBook.value = booking
  showCancel.value = true
}

function cancelData() {
  if (!cancelBook.value) {
    return
  }
  bookDelete(cancelBook.value.id).then(res => {
    if (!res || !res.data) {
      return
    }
    notifyTopPositive(t('notify.cancel_success'))
    reload()
  })
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

// offset 为天数：周视图单箭头传 ±1（按天滚动）、双箭头传 ±7（按周滚动）；日视图单箭头传 ±1
function shift(offset) {
  hideHoverCard()
  if (viewMode.value === 'week') {
    weekStart.value = date.addToDate(weekStart.value, {days: offset})
    loadWeek()
  } else {
    dayDate.value = date.addToDate(dayDate.value, {days: offset})
    loadDay()
  }
}

function resetView() {
  hideHoverCard()
  if (viewMode.value === 'week') {
    weekStart.value = getWeekViewStart(new Date())
    loadWeek()
  } else {
    dayDate.value = today()
    loadDay()
  }
}

function toggleView() {
  hideHoverCard()
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

function removeDragListeners() {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('keydown', onDragKeyDown)
}

function onDragKeyDown(e) {
  if (e.key === 'Escape') {
    cancelDrag()
  }
}

// 取消拖动：清理监听与预览。卡片本就未移动（仅预览跟随指针），清理即回归原位，不调后端
function cancelDrag() {
  removeDragListeners()
  document.body.style.userSelect = ''
  document.body.classList.remove('cal-dragging')
  dragCtx = null
  dragState.value = null
}

// 事件源可以是列内的原卡片，也可以是悬浮预览块（colIndex 由 hoverCard 携带）。
// 拖拽坐标全部基于 bodyRef 与指针位置计算，与事件源无关。
function onEventPointerDown(e, ev, colIndex) {
  if (e.button !== 0) {
    return
  }
  e.preventDefault()
  hideHoverCard()
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
  window.addEventListener('keydown', onDragKeyDown)
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
  removeDragListeners()
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
  if (viewMode.value === 'day') {
    if (targetCol.staffId) {
      b.staffId = targetCol.staffId
      b.staffName = targetCol.headerMain
      b.staffPhone = targetCol.headerSub
    } else {
      // 拖入未分配列：乐观清空雇员
      b.staffId = null
      b.staffName = null
      b.staffPhone = null
    }
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
  // 起止时间行（bookingTime / endTime 均为 YYYY-MM-DD HH:mm，仅在两者都有值时展示 HH:mm - HH:mm）
  b._timeRange = (b.bookingTime && b.endTime)
      ? `${b.bookingTime.substring(11, 16)} - ${b.endTime.substring(11, 16)}` : ''
  const statusEnum = BookStatusEnum.fromCode(b.status)
  b.statusName = statusEnum ? statusEnum.name : ''
  b._statusColor = statusEnum ? statusEnum.color : 'rgb(128, 128, 128)'
  // 左下角来源文字（带来源色）；底色=状态色的低透明版本（不影响文字可读性）
  const sourceEnum = b.source != null ? BookSourceEnum.fromCode(b.source) : null
  b._sourceColor = sourceEnum ? sourceEnum.color : 'rgb(128, 128, 128)'
  b._sourceName = sourceEnum ? sourceEnum.name : ''
  b._bgColor = rgbToRgba(b._statusColor, 0.25)
  // 客户联系方式：有电话显示电话，否则显示邮件，都没有则为空
  b._contact = b.phone || b.mail || ''
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
    staffList.value = res.data.data.map(s => ({
      id: s.id, name: s.name, phone: s.phone,
      scheduleList: s.scheduleList || [],
    }))
  })
}

onMounted(() => {
  loadStaff()
  loadWeek()
})

onBeforeUnmount(() => {
  removeDragListeners()
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
  display: flex;
  flex-flow: column wrap;        // 高度装不下的行 -> 整行换到第二列
  align-content: flex-start;     // 防止 wrap 后列被拉伸
  column-gap: 2rem;              // 把第二列推出右侧裁剪边界(> 右 padding 即可)
  border-radius: .3rem;
  border-left: 5px solid rgb(128, 128, 128);
  background: rgba(255, 255, 255, .5);
  box-shadow: 0 1px 4px rgba(0, 0, 0, .12);
  padding: .15rem .35rem;
  overflow: hidden;
  cursor: grab;
  touch-action: none;
  transition: box-shadow .15s ease;

  > * {
    width: 100%;
  }

  // hover 仅做轻微反馈，完整展开由 teleport 悬浮预览承担（不受容器裁剪）
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
    display: flex;
    align-items: center;
    gap: .3rem;
    font-size: .78rem;
    font-weight: 600;
    overflow: hidden;

    .cal-event-name {
      flex: 0 1 auto;
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .cal-event-edit {
      pointer-events: none;
      cursor: pointer;
      // padding 扩大点击命中区域，负 margin 抵消占位使视觉位置不变
      padding: 8px;
      margin: -2px -6px -2px -4px;
      opacity: 0.7;

      &:hover {
        opacity: 1;
      }
    }
  }

  &:hover .cal-event-title .cal-event-edit {
    pointer-events: auto;
  }

  .cal-event-sub {
    flex: 0 0 auto;
    font-size: .7rem;
    opacity: .7;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  // 底部行：左=雇员名/自动分配，右=取消预约，flex 布局保证彼此及与上方文字均不重叠
  .cal-event-footer {
    flex: 0 0 auto;
    margin-top: auto; // 有空间时贴底；空间不足时随卡片裁剪（可 hover 展开查看）
    display: flex;
    align-items: flex-end;
    gap: .4rem;
    padding-top: .1rem;
    line-height: 1.15;
  }

  // 来源：跟在标题行客户名称后（带来源色）。
  // flex-shrink 远大于名称：空间不足时先压缩来源（末尾出省略号），名称保持完整；名称过长时才轮到名称截断
  .cal-event-source {
    flex: 0 999 auto;
    min-width: 0;
    font-size: .68rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cal-event-staff {
    flex: 0 1 auto;
    min-width: 0;
    max-width: 65%;
    font-size: .68rem;
    opacity: .75;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cal-event-auto {
    flex: 0 0 auto;
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

  // 取消预约：样式同自动分配，负向色，固定靠右
  .cal-event-cancel {
    flex: 0 0 auto;
    margin-left: auto;
    font-size: .68rem;
    color: rgb(var(--negative));
    cursor: pointer;
    padding: .02rem .3rem;
    border: 1px solid rgb(var(--negative));
    border-radius: .25rem;
    white-space: nowrap;

    &:hover {
      background: rgba(var(--negative), .12);
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

// 拖动时跟随指针的预览块（保留状态左边框与状态底色，用更强阴影作为拖动提示）
.cal-drag-preview {
  z-index: 5;
  pointer-events: none;
  box-shadow: 0 4px 14px rgba(0, 0, 0, .28);
  opacity: .95;
}

// 悬浮完整预览：固定定位、脱离一切裁剪容器，内容按需向右/下（或翻转向左/上）生长。
// 自身可交互（拖拽/点击/自动分配），收回由自身 mouseleave 驱动
.cal-hover-card {
  position: fixed !important;
  z-index: 9999;
  overflow: visible;
  width: max-content;
  max-width: 26rem;
  height: auto;
  background-color: rgb(var(--full-container-background-color-light));
  box-shadow: 0 6px 22px rgba(0, 0, 0, .28);
  cursor: grab;

  // 外扩命中区域：吃掉亚像素误差与边缘 1px 抖动，防止展开↔收回闪烁。
  // z-index: -1 使其垫在内容之下，不遮挡「自动分配」按钮的点击
  &::after {
    content: '';
    position: absolute;
    inset: -6px;
    z-index: -1;
  }
}

</style>

<!-- 全局：拖动期间强制 grabbing 光标（scoped 无法作用于 body） -->
<style lang="scss">
body.cal-dragging,
body.cal-dragging * {
  cursor: grabbing !important;
}

/* 拖动期间禁用卡片的悬浮展开，避免经过其它卡片时触发放大
   （.cal-hover-card 同样带 .cal-event 类，此规则也一并使拖动中的预览不可交互） */
body.cal-dragging .cal-event {
  pointer-events: none;
}
</style>