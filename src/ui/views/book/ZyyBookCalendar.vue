<template>
  <div class="full-width cal-page" :class="{ 'cal-page-fullscreen': isFullscreen }">

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
      <q-btn no-caps unelevated  class="q-ml-xl shadow-1 component-full-btn-mini-grow"
             @click="showCancelled = !showCancelled">
        {{ showCancelled ? $t('book_calendar.hide_cancelled') : $t('book_calendar.show_cancelled') }}
      </q-btn>
      <q-btn no-caps unelevated  class="q-ml-xl shadow-1 component-full-btn-mini-grow"
             @click="showStoreBlock = true">
        {{ $t('book_calendar.store_block.manage') }}
      </q-btn>
      <q-btn no-caps unelevated  class="q-ml-xl shadow-1 component-full-btn-mini-grow"
             @click="openColorSetting">
        {{ $t('book_calendar.color.setting') }}
      </q-btn>

      <q-space/>

      <!-- 全屏：整个日历页（含工具栏）铺满视口，覆盖导航/header/footer；弹窗层级更高不受影响 -->
      <q-btn round flat dense class="component-none-btn-grow q-mr-md" @click="isFullscreen = !isFullscreen">
        <q-icon :name="isFullscreen ? 'fa-solid fa-compress' : 'fa-solid fa-expand'" size="1rem"/>
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

            <!-- 列（空白处悬停显示 10 分钟档时间线，点击直接创建该时间的预约） -->
            <div v-for="(col, colIndex) in columns" :key="col.key" class="cal-col"
                 :class="{ 'cal-col-today': col.highlight }"
                 @pointermove="onColPointerMove($event, col)"
                 @pointerleave="onColPointerLeave"
                 @click="onColClick($event, col)">

              <!-- 小时网格线 -->
              <div v-for="h in hours" :key="h" class="cal-hour-cell" :style="{ height: HOUR_HEIGHT + 'px' }"/>

              <!-- block 背景（斜纹置灰）：周视图=门店 block；日视图=门店 block + 该列雇员自己的 block -->
              <div v-for="(block, bi) in col.blocks" :key="'b' + bi" class="cal-block"
                   :style="{ top: block.top + 'px', height: block.height + 'px' }">
                <span v-if="block.reason" class="cal-block-reason">{{ block.reason }}</span>
              </div>

              <!-- 悬停时间提示线（10 分钟一档，点击即以该时间创建预约） -->
              <div v-if="hoverSlot && hoverSlot.colKey === col.key" class="cal-slot-line"
                   :style="{ top: hoverSlot.top + 'px' }">
                <span class="cal-slot-label">{{ hoverSlot.label }}</span>
              </div>

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
                     ...cardStyle(ev.booking.status),
                   }"
                   @pointerdown="onEventPointerDown($event, ev, colIndex)"
                   @mouseenter="onEventEnter($event, ev, colIndex)">
                <!-- 第一行：客户名称 / 来源（带来源色）/ 偏好员工 / 特殊备注——顺序须与下方
                     悬停卡片一致；第二行起：起止时间+预约项目 / 金额 / 联系方式 / 备注 -->
                <div class="cal-event-title">
                  <!-- 日视图首行塞了四项，卡片窄时省略号会把偏好/特殊备注截没；改为整行横向循环滚动，
                       放得下则静止。周视图列窄、卡片多，滚动会很吵，仍用各自的省略号 -->
                  <cask-marquee-row :enabled="viewMode === 'day'">
                    <span class="cal-event-name">{{ ev.booking.name || $t('book_calendar.no_name') }}</span>
                    <span v-if="ev.sourceName" class="cal-event-source" :style="{ color: ev.sourceColor }">
                      {{ ev.sourceName }}
                    </span>
                    <!-- 日视图：偏好员工放首行（周视图放备注上一行，见 lines） -->
                    <span v-if="viewMode === 'day' && ev.preferredName" class="cal-event-preferred">
                      {{ $t('book_calendar.preferred_prefix') }}{{ ev.preferredName }}
                    </span>
                    <!-- 特殊备注：日视图放首行（周视图作为独立正文行，见 lines） -->
                    <span v-if="ev.specialRemarks" class="cal-event-special">
                      {{ ev.specialRemarks }}
                    </span>
                  </cask-marquee-row>
                  <!-- 前台已签到标记：留在滚动区外，始终可见 -->
                  <q-icon v-if="ev.booking.checkIn" name="fa-solid fa-check" size="1rem"
                          class="cal-event-checkin-mark"/>
                </div>
                <!-- 正文行与首行同口径：日视图放不下就横向滚动，周视图仍省略号。
                     文字必须裹一层 span——插槽内容若是裸文本，在 flex 容器里会变成匿名 flex item，
                     text-overflow 对它不生效，周视图就只剩硬裁剪、没有省略号了 -->
                <div v-for="(line, li) in ev.lines" :key="li" class="cal-event-sub">
                  <cask-marquee-row :enabled="viewMode === 'day'">
                    <span class="cal-event-sub-text">{{ line }}</span>
                  </cask-marquee-row>
                </div>

                <!-- 底部：左=雇员名（日视图列头已是雇员，卡片上不重复显示）/自动分配，右=取消预约 -->
                <div v-if="ev.booking.staffName || ev.booking.status !== -1" class="cal-event-footer">
                  <span v-if="ev.booking.staffName && viewMode !== 'day'" class="cal-event-staff">
                    {{ ev.booking.staffName }}
                  </span>
                </div>
              </div>

            </div>

            <!-- 当前时间线：今天在视图窗口内且时间落在显示范围内时出现；悬停加粗并跟随指针显示当前时间 -->
            <div v-if="nowLine" class="cal-now-line" :class="{ 'cal-now-line-hover': nowHover }"
                 :style="{ top: nowLine.top + 'px' }"
                 @pointerenter="nowHover = true"
                 @pointerleave="nowHover = false; nowLabelX = null"
                 @pointermove="onNowLineMove">
              <span v-if="nowHover && nowLabelX != null" class="cal-now-label"
                    :style="{ left: nowLabelX + 'px' }">{{ nowLine.label }}</span>
            </div>

            <!-- 拖动预览块 -->
            <div v-if="dragState" class="cal-event cal-drag-preview"
                 :style="{
                   top: dragState.top + 'px', height: dragState.height + 'px',
                   left: dragState.left + 'px', width: dragState.width + 'px',
                   ...cardStyle(dragState.booking.status),
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

    <!-- 门店屏蔽时段管理（查看/新增/删除门店 block），变更后刷新日历 -->
    <cask-store-block-dialog v-model="showStoreBlock" @changed="reload"/>

    <!-- 卡片配色设置：逐预约状态自定义左边栏/背景/文字三色。改的是草稿，保存才落账号 meta -->
    <q-dialog v-model="showColorSetting" transition-show="fade" transition-hide="fade">
      <q-card class="component-cask-dialog-judgement-std column cal-color-card">
        <h6 style="margin: 0 0 .5rem 0 !important">{{ $t('book_calendar.color.title') }}</h6>
        <div class="cal-color-note">{{ $t('book_calendar.color.note') }}</div>

        <div class="col cal-color-list">
          <div v-for="st in STATUS_ROWS" :key="st.code" class="row items-center no-wrap cal-color-row">
            <!-- 预览块与真实卡片同一套渲染口径（cardStyle），改色即时可见 -->
            <div class="cal-event cal-color-preview" :style="cardStyle(st.code, colorDraft)">
              <div class="cal-event-title">{{ st.name }}</div>
              <div class="cal-event-sub">{{ $t('book_calendar.color.preview') }}</div>
            </div>
            <div v-for="part in COLOR_PARTS" :key="part" class="column items-center cal-color-cell">
              <div class="cal-color-cell-label">{{ $t(`book_calendar.color.part.${part}`) }}</div>
              <!-- 色块本身是取色器的触发区；底衬棋盘格，半透明色也看得出深浅 -->
              <div class="cal-color-swatch">
                <div class="cal-color-swatch-fill" :style="{ background: swatchOf(st.code, part) }"/>
                <q-popup-proxy transition-show="scale" transition-hide="scale">
                  <q-color :model-value="swatchOf(st.code, part)" format-model="rgba"
                           @update:model-value="val => setDraftColor(st.code, part, val)"/>
                </q-popup-proxy>
              </div>
            </div>
            <q-btn round flat dense class="component-none-btn-grow q-ml-sm"
                   @click="resetDraftStatus(st.code)">
              <q-icon name="fa-solid fa-rotate-left" size=".8rem"/>
              <q-tooltip>{{ $t('book_calendar.color.reset_row') }}</q-tooltip>
            </q-btn>
          </div>
        </div>

        <div class="row justify-evenly q-mt-md">
          <q-btn no-caps unelevated class="component-full-btn-mini-grow shadow-2"
                 :loading="colorSaving" :disable="colorSaving" @click="saveColorSetting">
            {{ $t('main_setting_save') }}
          </q-btn>
          <q-btn no-caps unelevated class="component-full-btn-mini-grow shadow-2"
                 @click="colorDraft = {}">
            {{ $t('book_calendar.color.reset_all') }}
          </q-btn>
          <q-btn no-caps unelevated class="component-full-btn-mini-grow shadow-2"
                 @click="showColorSetting = false">
            {{ $t('main_setting_cancel') }}
          </q-btn>
        </div>
      </q-card>
    </q-dialog>

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
          <!-- 首行顺序须与上方预约卡片一致：客户名称 / 来源 / 偏好员工 / 特殊备注 -->
          <span v-if="hoverCard.ev.sourceName" class="cal-event-source" :style="{ color: hoverCard.ev.sourceColor }">
            {{ hoverCard.ev.sourceName }}
          </span>
          <span v-if="viewMode === 'day' && hoverCard.ev.preferredName" class="cal-event-preferred">
            {{ $t('book_calendar.preferred_prefix') }}{{ hoverCard.ev.preferredName }}
          </span>
          <span v-if="hoverCard.ev.specialRemarks" class="cal-event-special">
            {{ hoverCard.ev.specialRemarks }}
          </span>
          <q-space/>
          <!-- 签到开关：已签到高亮为对勾（点击取消签到），未签到灰显（点击签到） -->
          <q-icon v-if="hoverCard.ev.booking.status !== -1" name="fa-solid fa-check" size="1rem"
                  class="cal-event-edit"
                  :class="{ 'cal-event-checkin-on': hoverCard.ev.booking.checkIn }"
                  @pointerdown.stop @click.stop="toggleCheckin(hoverCard.ev.booking)"/>
          <q-icon v-if="hoverCard.ev.booking.status !== -1" name="fa-solid fa-pen" size="0.9rem"
                  class="cal-event-edit" @pointerdown.stop @click.stop="openEdit(hoverCard.ev.booking)"/>
        </div>
        <div v-for="(line, li) in hoverCard.ev.lines" :key="li" class="cal-event-sub">{{ line }}</div>
        <div v-if="hoverCard.ev.booking.staffName || hoverCard.ev.booking.status !== -1"
             class="cal-event-footer">
          <span v-if="hoverCard.ev.booking.staffName && viewMode !== 'day'" class="cal-event-staff">
            {{ hoverCard.ev.booking.staffName }}
          </span>
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
import {computed, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {useI18n} from 'vue-i18n'
import {date} from "quasar";
import {notifyTopPositive} from "@/utils/notification-tools.js";
import CaskBookDetailDialog from "@/ui/components/CaskBookDetailDialog.vue";
import CaskBookUpsertDialog from "@/ui/components/CaskBookUpsertDialog.vue";
import CaskStoreBlockDialog from "@/ui/components/CaskStoreBlockDialog.vue";
import CaskMarqueeRow from "@/ui/components/CaskMarqueeRow.vue";
import {
  bookAdjust,
  bookCalendar,
  bookCheckin,
  bookDelete,
  bookDetail,
  bookReassign,
  bookUncheckin
} from "@/api/book.js";
import CaskDialogJudgment from "@/ui/components/CaskDialogJudgment.vue";
import {mCalendarColor} from "@/api/myu.js";
import {staffListSimple} from "@/api/staff.js";
import {BookSourceEnum, BookStatusEnum} from "@/constants/enums/book.js";
import {useGlobalStateStore} from "@/utils/global-state.js";

const {t, locale} = useI18n()

// 时间展示：英文用 12 小时制（含 AM/PM），其他语言用 24 小时制。仅用于展示，
// 提交后端的 bookTimeStr 仍走 minutesToTime 的 24 小时制
function formatTimeDisplay(h, m) {
  if (locale.value === 'en') {
    const period = h < 12 ? 'AM' : 'PM'
    const hour12 = h % 12 === 0 ? 12 : h % 12
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`
  }
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// 分钟数 -> 展示时间
function formatMinutesDisplay(min) {
  return formatTimeDisplay(Math.floor(min / 60), min % 60)
}

// 'HH:mm' 字符串 -> 展示时间
function formatHmDisplay(hm) {
  if (!hm) {
    return ''
  }
  const parts = hm.split(':')
  return formatTimeDisplay(Number(parts[0]), Number(parts[1]))
}
const globalState = useGlobalStateStore()

const HOUR_HEIGHT = 64          // 每小时像素高度
const DEFAULT_START_HOUR = 9    // 默认最早显示 09:00
const DEFAULT_END_HOUR = 24     // 默认最晚显示 24:00
const gutterWidth = '4rem'
// 日视图首列「未分配」：常年空着，给固定宽度即可，剩下的宽度让给真正有卡片的雇员列
const UNASSIGNED_KEY = '__unassigned'
const UNASSIGNED_COL_WIDTH = '12rem'
const MIN_COL_WIDTH = '9rem'

const viewMode = ref('day')     // week | day，默认日视图
const bookings = ref([])
const blocks = ref([])
const staffList = ref([])
// 雇员 id -> 名称（simple 列表），用于偏好员工展示（映射不到时回退显示 id）
const staffNameById = computed(() => {
  const map = {}
  for (const s of staffList.value) {
    map[s.id] = s.name
  }
  return map
})
const weekStart = ref(getWeekViewStart(new Date()))
const dayDate = ref(today())
// 是否显示已取消的预约（默认隐藏）
const showCancelled = ref(false)
// 门店屏蔽时段管理弹窗
const showStoreBlock = ref(false)
// 全屏（CSS 固定定位铺满视口，覆盖导航/header/footer；不用原生 Fullscreen API，
// 否则 teleport 到 body 的弹窗/悬浮预览在全屏子树外将不可见）。
// 祖先 q-scrollarea 的 contain: strict 会把 fixed 后代困在滚动盒内，
// 全屏期间通过 body 类 + 全局样式临时解除（不能用 Teleport 脱离：
// 常驻 Teleport 会触发 transition(out-in) 离场后新页面插入锚点失效的 Vue 缺陷）
const isFullscreen = ref(false)

watch(() => isFullscreen.value, (val) => {
  document.body.classList.toggle('cal-fullscreen-active', val)
})

function onFullscreenKeyDown(e) {
  // 弹窗打开时 Esc 优先关弹窗，不退出全屏
  if (e.key === 'Escape' && isFullscreen.value
      && !showEdit.value && !showCancel.value && !showDetail.value) {
    isFullscreen.value = false
  }
}
// ===== 卡片配色（按预约状态）=====
// 账号级偏好：存后端 yl_user.meta.calendarColors，随登录/用户详情下发，不做前端本地设置——
// 换设备/换浏览器仍是同一套配色。这里只持有服务端下发的那份，弹窗改的是 colorDraft 草稿
const COLOR_PARTS = ['bar', 'bg', 'text']
const STATUS_ROWS = BookStatusEnum.getAll()
// 未配置时的默认底色透明度（等于旧「卡片底色深浅」滑条的默认值）
const DEFAULT_BG_ALPHA = 0.25
// 卡片内阴影：用文字色在卡片内缘描一圈，上下紧邻的连续预约即使配色相近也分得开。
// 窄扩散 + 高不透明度——要的是一道看得清的内缘，不是往卡片中间晕开一大片
const INSET_ALPHA = 0.6
const INSET_OFFSET = '0 0 .22rem'

const cardColors = ref({})
const showColorSetting = ref(false)
const colorDraft = ref({})
const colorSaving = ref(false)

// 服务端下发的配色 -> 本地：userData 每次是整体替换，监听引用即可
function loadCardColors() {
  const raw = globalState.userData ? globalState.userData.calendarColors : null
  cardColors.value = raw && typeof raw === 'object' ? JSON.parse(JSON.stringify(raw)) : {}
}

watch(() => globalState.userData, loadCardColors)

function statusBaseColor(status) {
  const statusEnum = BookStatusEnum.fromCode(status)
  return statusEnum ? statusEnum.color : 'rgb(128, 128, 128)'
}

// 某状态的最终三色：逐项回落到内置默认（左边栏=状态色、背景=状态色的低透明版、文字=跟随主题）。
// source 传弹窗草稿即可预览未保存的配色
function colorOf(status, source) {
  const cfg = (source || cardColors.value)[String(status)] || {}
  const base = statusBaseColor(status)
  return {
    bar: cfg.bar || base,
    bg: cfg.bg || withAlpha(base, DEFAULT_BG_ALPHA),
    // 文字色留空 = 继承主题色，不写死，切换明暗主题才不会撞色
    text: cfg.text || '',
  }
}

// 卡片的配色内联样式（真实卡片、拖动预览、悬浮预览、配色弹窗预览共用同一口径）
function cardStyle(status, source) {
  const color = colorOf(status, source)
  return {
    borderLeftColor: color.bar,
    background: cardBg(color.bg),
    color: color.text || undefined,
    // 内阴影颜色跟着文字色走；文字色未配置时用主题文字色
    '--cal-event-inset': `${INSET_OFFSET} ${color.text
        ? withAlpha(color.text, INSET_ALPHA) : `rgba(var(--text-color), ${INSET_ALPHA})`}`,
  }
}

// 取色器的当前值：草稿里没有该项时给出「实际渲染出来的那个颜色」，避免一打开就是纯黑
function swatchOf(status, part) {
  const cfg = colorDraft.value[String(status)] || {}
  if (cfg[part]) {
    return cfg[part]
  }
  if (part === 'text') {
    return themeTextColor()
  }
  return colorOf(status, colorDraft.value)[part]
}

// 主题文字色（--text-color 存的是 "r, g, b" 三元组），取不到时兜底中性灰
function themeTextColor() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim()
  return raw ? `rgb(${raw})` : 'rgb(128, 128, 128)'
}

function openColorSetting() {
  hideHoverCard()
  colorDraft.value = JSON.parse(JSON.stringify(cardColors.value))
  showColorSetting.value = true
}

function setDraftColor(status, part, value) {
  const code = String(status)
  colorDraft.value = {...colorDraft.value, [code]: {...(colorDraft.value[code] || {}), [part]: value}}
}

// 单个状态恢复默认 = 从草稿里摘掉它（渲染时自然回落到内置默认色）
function resetDraftStatus(status) {
  const next = {...colorDraft.value}
  delete next[String(status)]
  colorDraft.value = next
}

// 提交前剔掉空项/空状态：meta 是 yl_user 的整行字段，别拿默认值把它撑大
function prunedDraft() {
  const out = {}
  for (const [code, cfg] of Object.entries(colorDraft.value || {})) {
    const item = {}
    for (const part of COLOR_PARTS) {
      if (cfg && cfg[part]) {
        item[part] = cfg[part]
      }
    }
    if (Object.keys(item).length > 0) {
      out[code] = item
    }
  }
  return out
}

function saveColorSetting() {
  const colors = prunedDraft()
  colorSaving.value = true
  mCalendarColor({colors}).then(res => {
    if (!res || !res.data) {
      return
    }
    cardColors.value = JSON.parse(JSON.stringify(colors))
    // 同步写回本地用户信息，换页回来无需再请求；不重拉 /user/m/detail——那会把当前门店切换状态一并冲掉
    if (globalState.userData) {
      globalState.updateUserData({...globalState.userData, calendarColors: colors})
    }
    showColorSetting.value = false
    notifyTopPositive(t('book_calendar.color.save_success'))
  }).finally(() => {
    colorSaving.value = false
  })
}

// 日/周视图共用的数据源：按开关过滤已取消预约
const visibleBookings = computed(() =>
    showCancelled.value ? bookings.value : bookings.value.filter(b => b.status !== -1))

// 当前时间线：每 30 秒刷新一次位置
const NOW_TICK_INTERVAL = 30 * 1000
const nowTick = ref(Date.now())
const nowHover = ref(false)
const nowLabelX = ref(null)
let nowTimer = null

// 数据定时刷新：每 2 分钟按当前视图重新拉取（日视图拉当天、周视图拉当前周窗口）；拖拽进行中跳过本次
const DATA_REFRESH_INTERVAL = 2 * 60 * 1000
let refreshTimer = null

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

// 卡片底色：半透明状态色层叠在不透明页面底色上——卡片整体不透明，
// 垫在下层的 block 斜纹不会透过卡片显示（block 恒在卡片下方），观感与空白区域的卡片一致
function cardBg(tint) {
  return `linear-gradient(${tint}, ${tint}), rgb(var(--background-color))`
}

// 任意颜色串 -> 指定透明度的 rgba()。支持 rgb()/rgba() 与 #rgb/#rgba/#rrggbb/#rrggbbaa
//（取色器出的是 rgba()，hex 分支是给手工写进 meta 的值兜底）；认不出来的原样返回
function withAlpha(color, alpha) {
  if (!color) {
    return `rgba(128, 128, 128, ${alpha})`
  }
  const fn = color.match(/rgba?\(([^)]+)\)/)
  if (fn) {
    const parts = fn[1].split(',').slice(0, 3).map(s => s.trim())
    return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`
  }
  const hex = color.trim().match(/^#([0-9a-fA-F]{3,8})$/)
  if (!hex) {
    return color
  }
  let raw = hex[1]
  if (raw.length === 3 || raw.length === 4) {
    raw = raw.split('').map(c => c + c).join('')
  }
  const num = parseInt(raw.substring(0, 6), 16)
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`
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
  return formatTimeDisplay(h, 0)
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
  for (const b of visibleBookings.value) {
    if (b._start != null) {
      minM = Math.min(minM, b._start)
    }
    if (b._end != null) {
      maxM = Math.max(maxM, b._end)
    }
  }
  // block 段扩展显示范围：周视图只算门店 block（雇员 block 不渲染）；日视图门店+雇员都算
  const viewDates = viewMode.value === 'week'
      ? weekDays.value.map(d => d.dateStr)
      : [date.formatDate(dayDate.value, 'YYYY-MM-DD')]
  for (const bl of blocks.value) {
    if (viewMode.value === 'week' && !bl.storeBlock) {
      continue
    }
    for (const ds of viewDates) {
      if (ds < bl.startDateStr || ds > bl.endDateStr) {
        continue
      }
      const s = ds === bl.startDateStr ? bl.startMin : 0
      const e = ds === bl.endDateStr ? bl.endMin : 1440
      if (e > s) {
        minM = Math.min(minM, s)
        maxM = Math.max(maxM, e)
      }
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

// 当前时间线：仅当今天在当前视图窗口内、且当前时间落在显示时间范围内时返回定位信息
const nowLine = computed(() => {
  const now = new Date(nowTick.value)
  const todayStr = date.formatDate(now, 'YYYY-MM-DD')
  const inView = viewMode.value === 'week'
      ? weekDays.value.some(d => d.dateStr === todayStr)
      : date.formatDate(dayDate.value, 'YYYY-MM-DD') === todayStr
  if (!inView) {
    return null
  }
  const minutes = now.getHours() * 60 + now.getMinutes()
  const {startHour, endHour} = timeRange.value
  if (minutes < startHour * 60 || minutes > endHour * 60) {
    return null
  }
  return {
    top: (minutes - startHour * 60) / 60 * HOUR_HEIGHT,
    label: formatMinutesDisplay(minutes),
  }
})

// 标签横向跟随指针（相对时间线自身定位）
function onNowLineMove(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  nowLabelX.value = e.clientX - rect.left
}

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

// 某日期与 block 的重叠段（当日分钟）：门店 block 恒包含；staffId 非空时额外包含该雇员自己的 block。
// block 为跨天时间段，按日期裁剪出当日部分（起点前的日子 0 起、终点后的日子 1440 止）
function blockSegmentsForDate(dateStr, staffId) {
  const segs = []
  for (const bl of blocks.value) {
    if (!bl.storeBlock && (!staffId || bl.staffId !== staffId)) {
      continue
    }
    if (dateStr < bl.startDateStr || dateStr > bl.endDateStr) {
      continue
    }
    const start = dateStr === bl.startDateStr ? bl.startMin : 0
    const end = dateStr === bl.endDateStr ? bl.endMin : 1440
    if (end > start) {
      segs.push({start, end, reason: bl.reason})
    }
  }
  return segs
}

// 某列的 block 渲染段（定位到像素）
function buildDayBlocks(dateStr, staffId, toPx) {
  return blockSegmentsForDate(dateStr, staffId).map(seg => ({
    ...seg,
    top: toPx(seg.start),
    height: Math.max((seg.end - seg.start) / 60 * HOUR_HEIGHT, 2),
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
    // 卡片正文行（第二行起）：起止时间+预约项目 / 金额 / 客户联系方式 / 备注，空值自动跳过（下一行上移）
    const timeRange = (b._startHm && b._endHm)
        ? `${formatHmDisplay(b._startHm)} - ${formatHmDisplay(b._endHm)}` : ''
    const isDayView = viewMode.value === 'day'
    // 偏好员工：日视图放首行（模板内联展示），周视图作为独立行插在备注上一行
    const preferredName = b.preferredStaffId
        ? (staffNameById.value[b.preferredStaffId] || b.preferredStaffId) : ''
    const preferredLine = !isDayView && preferredName
        ? `${t('book_calendar.preferred_prefix')}${preferredName}` : ''
    // 特殊备注：日视图移到首行（模板内联展示）；周视图一屏七列、首行塞不下，仍作为独立正文行
    const specialRemarks = isDayView ? (b._specialRemarks || '') : ''
    // 起止时间与预约项目同行，省一行给卡片正文。用「·」而非空格分隔：
    // .cal-event-sub 是 nowrap，HTML 会把连续空格折叠成一个，拉不开视觉间距
    const timeAndSkills = [timeRange, b._calSub].filter(Boolean).join(' · ')
    const lines = [timeAndSkills, b._amountLine,
      isDayView ? '' : b._specialRemarks, b._contact, preferredLine, b.remark]
        .filter(Boolean)
    return {
      booking: b,
      preferredName,
      specialRemarks,
      top: toPx(ev.start),
      height: Math.max((ev.end - ev.start) / 60 * HOUR_HEIGHT, 22),
      leftPct: ev.col * widthPct,
      widthPct,
      blocked,
      cancelled: b.status === -1,
      sourceColor: b._sourceColor,
      sourceName: b._sourceName,
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
    const dayBlocks = buildDayBlocks(day.dateStr, null, toPx)
    const rb = visibleBookings.value.filter(b => b._dateStr === day.dateStr)
    return buildColumn(day.dateStr, day.name, day.dayNum, day.isToday, rb, dayBlocks, toPx, {dateStr: day.dateStr})
  })
})

// 每日视图：横坐标为雇员，展示当日每个雇员的工作安排
const staffColumns = computed(() => {
  const {startHour} = timeRange.value
  const rangeStart = startHour * 60
  const toPx = (m) => (m - rangeStart) / 60 * HOUR_HEIGHT

  const byStaff = {}
  const unassigned = []
  for (const b of visibleBookings.value) {
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
  // 未分配列始终存在，方便将预约拖入以解除分配（即使当前没有未分配预约）；只垫门店 block
  cols.push(buildColumn(UNASSIGNED_KEY, t('book_calendar.unassigned'), '', false, unassigned,
      buildDayBlocks(dayStr, null, toPx), toPx, {dateStr: dayStr, staffId: null}))
  for (const s of staffList.value) {
    // 只显示当天有排班的雇员；无排班但当天已有预约的仍显示，避免预约块丢失
    const scheduledToday = (s.scheduleList || []).some(sc => Number(sc.dayOfWeek) === dow)
    const hasBookings = (byStaff[s.id] || []).length > 0
    if (!scheduledToday && !hasBookings) {
      continue
    }
    // 雇员列：门店 block + 该雇员自己的 block
    cols.push(buildColumn(s.id, s.name, s.phone || '', false, byStaff[s.id] || [],
        buildDayBlocks(dayStr, s.id, toPx), toPx, {dateStr: dayStr, staffId: s.id}))
  }
  return cols
})

const columns = computed(() => viewMode.value === 'week' ? weekColumns.value : staffColumns.value)

// 列宽轨道：日视图的「未分配」列固定窄宽，其余列等分剩余宽度（周视图各列一律等分）
const gridStyle = computed(() => {
  const tracks = columns.value.map(
      col => col.key === UNASSIGNED_KEY ? UNASSIGNED_COL_WIDTH : 'minmax(0, 1fr)')
  const fixedCount = tracks.filter(track => track === UNASSIGNED_COL_WIDTH).length
  const flexCount = tracks.length - fixedCount
  return {
    '--cal-gutter': gutterWidth,
    '--cal-tracks': tracks.join(' '),
    minWidth: `calc(${gutterWidth} + ${fixedCount} * ${UNASSIGNED_COL_WIDTH}`
        + ` + ${flexCount} * ${MIN_COL_WIDTH})`,
  }
})

// 详情
const showDetail = ref(false)
const detailBook = ref(null)

// 详情统一走 /book/detail/{id}：列表/日历数据不含详情独有字段（如按邮箱统计的预约次数）
function openDetail(booking) {
  bookDetail(booking.id).then(res => {
    if (!res || !res.data || !res.data.data) {
      return
    }
    detailBook.value = res.data.data
    showDetail.value = true
  })
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

// ===== 点击空白区域创建预约 =====
const hoverSlot = ref(null)   // {colKey, top, label, minutes}

// 指针位置 -> 该列时间轴上的分钟数（按 SNAP_MINUTES=10 分钟取档）
function pointerSlotMinutes(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const {startHour, endHour} = timeRange.value
  const rangeStart = startHour * 60
  let minutes = rangeStart + (e.clientY - rect.top) / HOUR_HEIGHT * 60
  minutes = Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES
  return Math.max(rangeStart, Math.min(endHour * 60, minutes))
}

function onColPointerMove(e, col) {
  // 拖拽中、或指针位于预约卡片上时不显示空白时间提示线
  if (dragCtx || (e.target.closest && e.target.closest('.cal-event'))) {
    hoverSlot.value = null
    return
  }
  const minutes = pointerSlotMinutes(e)
  const {startHour} = timeRange.value
  hoverSlot.value = {
    colKey: col.key,
    minutes,
    top: (minutes - startHour * 60) / 60 * HOUR_HEIGHT,
    label: formatMinutesDisplay(minutes),
  }
}

function onColPointerLeave() {
  hoverSlot.value = null
}

function onColClick(e, col) {
  // 卡片上的点击（打开详情/按钮）与拖拽结束后的余波点击都不触发创建
  if (e.target.closest && e.target.closest('.cal-event')) {
    return
  }
  if (Date.now() - lastDragEndTs < 150) {
    return
  }
  const minutes = pointerSlotMinutes(e)
  const dateStr = col.dateStr || date.formatDate(dayDate.value, 'YYYY-MM-DD')
  hideHoverCard()
  // 预填点击位置对应的日期时间；日视图从雇员列点开时预填该列雇员为【分配雇员】（硬指定，
  // 可在弹窗中清空/更换；未分配列为空）。偏好员工不做预填
  editBook.value = {
    bookingTime: `${dateStr} ${minutesToTime(minutes)}`,
    assignedStaffId: viewMode.value === 'day' ? (col.staffId || null) : null,
  }
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
  // 悬浮预览是卡片的完整版，配色须与卡片一致：底色经 cardBg 叠在页面底色上，半透明配色也不透字
  const style = {
    position: 'fixed',
    minWidth: rect.width + 'px',
    minHeight: rect.height + 'px',
    ...cardStyle(ev.booking.status),
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

// 前台签到/取消签到（仅展示标记，不联动其他逻辑）；成功后先本地翻转保证悬浮卡即时反馈，再刷新
function toggleCheckin(booking) {
  const target = !booking.checkIn
  const req = target ? bookCheckin : bookUncheckin
  req(booking.id).then(res => {
    if (!res || !res.data) {
      return
    }
    booking.checkIn = target
    notifyTopPositive(t(target ? 'book_calendar.checkin_success' : 'book_calendar.uncheckin_success'))
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
let lastDragEndTs = 0            // 最近一次拖拽结束时间，用于屏蔽拖拽结束后的余波 click

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
  if (dragCtx && dragCtx.moved) {
    lastDragEndTs = Date.now()
  }
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
    label: formatMinutesDisplay(newStart),
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
  lastDragEndTs = Date.now()
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
  // 起止时间原始 HH:mm（bookingTime / endTime 均为 YYYY-MM-DD HH:mm）；
  // 展示格式化放在 buildColumn 内按当前语言生成，切换语言即时生效
  b._startHm = b.bookingTime ? b.bookingTime.substring(11, 16) : ''
  b._endHm = b.endTime ? b.endTime.substring(11, 16) : ''
  const statusEnum = BookStatusEnum.fromCode(b.status)
  b.statusName = statusEnum ? statusEnum.name : ''
  // 来源文字（带来源色）；卡片三色按状态在渲染时实时计算（见 cardStyle），此处不预生成
  const sourceEnum = b.source != null ? BookSourceEnum.fromCode(b.source) : null
  b._sourceColor = sourceEnum ? sourceEnum.color : 'rgb(128, 128, 128)'
  b._sourceName = sourceEnum ? sourceEnum.name : ''
  // 特殊备注：后端为逗号分隔字符串，卡片上以空格分割展示为一行
  b._specialRemarks = b.specialRemarks
      ? b.specialRemarks.split(',').filter(item => item).join(' ') : ''
  // 预约金额：为 null 时提示包含未配置金额的服务技能
  b._amountLine = b.amount != null
      ? `${t('book_calendar.amount_prefix')}${b.amount}`
      : t('book_booking.amount_unconfigured')
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
  // block（startTime/endTime 为 yyyy-MM-dd HH:mm）：预解析为日期 + 当日分钟，便于按列裁剪渲染
  blocks.value = (data.blockList || []).map(bl => ({
    id: bl.id,
    staffId: bl.staffId || null,
    storeBlock: !!bl.storeBlock,
    reason: bl.reason || '',
    startDateStr: bl.startTime ? bl.startTime.substring(0, 10) : '',
    endDateStr: bl.endTime ? bl.endTime.substring(0, 10) : '',
    startMin: bl.startTime ? timeToMinutes(bl.startTime.substring(11, 16)) : 0,
    endMin: bl.endTime ? timeToMinutes(bl.endTime.substring(11, 16)) : 0,
  }))
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
  loadCardColors()
  loadStaff()
  reload()
  nowTimer = setInterval(() => {
    nowTick.value = Date.now()
  }, NOW_TICK_INTERVAL)
  refreshTimer = setInterval(() => {
    if (dragCtx) {
      return
    }
    reload()
  }, DATA_REFRESH_INTERVAL)
  window.addEventListener('keydown', onFullscreenKeyDown)
})

onBeforeUnmount(() => {
  removeDragListeners()
  if (nowTimer) {
    clearInterval(nowTimer)
    nowTimer = null
  }
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
  window.removeEventListener('keydown', onFullscreenKeyDown)
  document.body.classList.remove('cal-fullscreen-active')
})
</script>

<style scoped lang="scss">

.cal-page {
  padding: 0 2rem 1rem 0.5rem;
}

// 全屏态：固定铺满视口，盖住导航/header/footer（z-index 高于 q-header 的 2000，低于弹窗层 6000+）
.cal-page-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 3000;
  padding: 1rem 2rem;
  overflow-y: auto;
  background: rgb(var(--background-color));

  // 全屏下日历主体尽量占满高度（默认 66vh）
  .cal-body-scroll {
    max-height: calc(100vh - 13rem);
  }
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
  // 轨道由 gridStyle 下发：日视图「未分配」列固定窄宽，其余列等分
  grid-template-columns: var(--cal-gutter) var(--cal-tracks);
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
  cursor: pointer; // 空白处可点击创建预约（卡片自身覆盖为 grab）

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

// block 时段底色：斜纹置灰 + 上下虚线边界，与普通空白/预约卡片明显区分；不参与命中（点击穿透可创建预约）
.cal-block {
  position: absolute;
  left: 0;
  right: 0;
  background: repeating-linear-gradient(-45deg,
      rgba(128, 128, 128, .28) 0, rgba(128, 128, 128, .28) 6px,
      rgba(128, 128, 128, .1) 6px, rgba(128, 128, 128, .1) 12px);
  border-top: 1px dashed rgba(128, 128, 128, .55);
  border-bottom: 1px dashed rgba(128, 128, 128, .55);
  z-index: 1;
  pointer-events: none;
  overflow: hidden;

  .cal-block-reason {
    display: inline-block;
    max-width: 100%;
    padding: .05rem .35rem;
    font-size: .68rem;
    opacity: .75;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

// 空白处悬停时间提示线（10 分钟一档），仅提示不参与命中
.cal-slot-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 0;
  border-top: 1px dashed rgb(var(--full-container-background-color), 0.5);
  z-index: 3;
  pointer-events: none;

  .cal-slot-label {
    position: absolute;
    top: -1.75rem;
    left: 0.5rem;
    font-size: .7rem;
    padding: .05rem .35rem;
    border-radius: .25rem;
    color: #fff;
    background: rgb(var(--full-container-background-color), 0.5);
    white-space: nowrap;
  }
}

// 当前时间线：横跨时间刻度右侧的所有列，悬停加粗并显示当前时间标签
.cal-now-line {
  position: absolute;
  left: var(--cal-gutter);
  right: 0;
  height: 0;
  border-top: 2px solid rgb(var(--full-container-background-color), 0.5);
  z-index: 4;
  cursor: pointer;

  // 上下外扩几像素的命中区域，方便触摸到这条细线
  &::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: -5px;
    height: 12px;
  }

  .cal-now-label {
    position: absolute;
    top: -1.75rem;
    transform: translateX(-50%);
    font-size: .72rem;
    padding: .08rem .4rem;
    border-radius: .25rem;
    color: #fff;
    background: rgb(var(--full-container-background-color), 0.5);
    white-space: nowrap;
    pointer-events: none;
  }
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
  // 内阴影用卡片自身的文字色在内缘描一圈（颜色由 cardStyle 内联下发），
  // 上下紧邻的连续预约即使配色接近也能一眼看出这是两张卡；未下发时为全透明，等于没有
  --cal-event-inset: 0 0 0 rgba(0, 0, 0, 0);
  box-shadow: inset var(--cal-event-inset), 0 1px 4px rgba(0, 0, 0, .12);
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
    box-shadow: inset var(--cal-event-inset), 0 3px 10px rgba(0, 0, 0, .2);
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

    // 右上角「前台已签到」静态对勾
    .cal-event-checkin-mark {
      flex: 0 0 auto;
      margin-left: auto;
      color: rgb(var(--pointer));
    }

    .cal-event-checkin-on {
      color: rgb(var(--pointer));
      opacity: 1;
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

    // 正文行文字（裹在 CaskMarqueeRow 里）：周视图靠它出省略号，
    // 日视图则被下面的「自然宽度」规则改写、交给滚动
    .cal-event-sub-text {
      flex: 0 1 auto;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  // 滚动模式（日视图，CaskMarqueeRow 挂 .cask-marquee-natural）：插槽子元素一律按自然宽度铺开，
  // 压缩与省略号一并让位给滚动——否则内容先被截断，滚动也补不回来。
  // 首行那条必须压过 .cal-event .cal-event-title .cal-event-name（特异性 4），
  // 故两条都带上各自的父级前缀，编译后特异性为 5。
  // 周视图 enabled=false，挂的是 .cask-marquee-plain，不匹配本规则，仍走各自的 ellipsis。
  .cal-event-title :deep(.cask-marquee-natural) .cask-marquee-item > *,
  .cal-event-sub :deep(.cask-marquee-natural) .cask-marquee-item > * {
    flex: 0 0 auto;
    min-width: 0;
    overflow: visible;
    text-overflow: clip;
  }

  // 底部行：左=雇员名/自动分配，右=取消预约，flex 布局保证彼此及与上方文字均不重叠
  .cal-event-footer {
    flex: 0 0 auto;
    margin-top: auto; // 有空间时贴底；空间不足时随卡片裁剪（可 hover 展开查看）
    display: flex;
    align-items: flex-end;
    gap: .4rem;
    padding-top: .5rem;
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

  // 偏好员工（日视图首行）：与来源同款截断策略，中性色不抢状态/来源色
  .cal-event-preferred {
    flex: 0 999 auto;
    min-width: 0;
    font-size: .68rem;
    opacity: .75;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  // 特殊备注（日视图首行，紧跟来源）：同款截断策略；不透明度高于偏好员工/来源，
  // 因为它是操作时必须看到的提醒（如「孕妇」「忌重手法」），不是纯参考信息
  .cal-event-special {
    flex: 0 999 auto;
    min-width: 0;
    font-size: .68rem;
    font-weight: 500;
    opacity: .9;
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

  // 落在屏蔽时段的预约（冻结态）：不能整卡半透明——会让下层 block 斜纹透出、内容不可读；
  // 改用不影响透明度的虚线描边标识
  &.cal-event-blocked {
    outline: 2px dashed rgba(128, 128, 128, .75);
    outline-offset: -2px;
  }

  // 已取消：只做删除线，左边栏/底色一律交给该状态的配色（CANCEL 也是可自定义的状态之一）
  &.cal-event-cancelled {
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
  box-shadow: inset var(--cal-event-inset), 0 4px 14px rgba(0, 0, 0, .28);
  opacity: .95;
}

// ===== 卡片配色设置弹窗 =====
.cal-color-card {
  min-width: 40rem;

  .cal-color-note {
    font-size: .78rem;
    opacity: .55;
    max-width: 38rem;
    line-height: 1.5;
  }

  .cal-color-list {
    margin-top: .75rem;
    max-height: 26rem;
    overflow-y: auto;
  }

  .cal-color-row {
    padding: .35rem 0;
    border-bottom: 1px solid rgba(128, 128, 128, .14);

    &:last-child {
      border-bottom: none;
    }
  }

  // 预览块：借用 .cal-event 的配色与内阴影，但不要它的绝对定位/拖拽光标
  .cal-color-preview {
    position: static;
    flex: 0 0 auto;
    width: 11rem;
    height: 3.2rem;
    margin-right: 1rem;
    cursor: default;
    display: block;
  }

  .cal-color-cell {
    width: 4.5rem;

    .cal-color-cell-label {
      font-size: .7rem;
      opacity: .6;
      margin-bottom: .25rem;
    }
  }

  // 色块：底衬棋盘格，半透明配色也看得出实际深浅
  .cal-color-swatch {
    position: relative;
    width: 3rem;
    height: 1.4rem;
    border-radius: .25rem;
    cursor: pointer;
    overflow: hidden;
    border: 1px solid rgba(128, 128, 128, .45);
    background-image:
        linear-gradient(45deg, rgba(128, 128, 128, .35) 25%, transparent 25%),
        linear-gradient(-45deg, rgba(128, 128, 128, .35) 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, rgba(128, 128, 128, .35) 75%),
        linear-gradient(-45deg, transparent 75%, rgba(128, 128, 128, .35) 75%);
    background-size: 8px 8px;
    background-position: 0 0, 0 4px, 4px -4px, -4px 0;

    .cal-color-swatch-fill {
      position: absolute;
      inset: 0;
    }
  }
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
  box-shadow: inset var(--cal-event-inset), 0 6px 22px rgba(0, 0, 0, .28);
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

/* 拖动期间当前时间线也不参与命中，避免干扰拖拽落点 */
body.cal-dragging .cal-now-line {
  pointer-events: none;
}

/* 日历全屏期间解除祖先滚动容器的 contain: strict（它会把 fixed 后代困在滚动盒内），
   退出全屏或离开页面时移除该类即恢复 */
body.cal-fullscreen-active .q-scrollarea {
  contain: none !important;
}
</style>