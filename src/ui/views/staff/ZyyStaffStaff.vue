<template>
  <div class="full-width">
    <div class="row items-center">

      <div class="q-ml-md">
        <h6>
          {{ $t('staff.label.id') }}&nbsp;:
        </h6>
      </div>
      <q-input v-model="selectId" class="q-ma-md component-outline-input-std" dense outlined
               :placeholder="t('staff.placeholder.id')"
               tabindex="0">
      </q-input>

      <div class="q-ml-md">
        <h6>
          {{ $t('staff.label.name') }}&nbsp;:
        </h6>
      </div>
      <q-input v-model="selectName" class="q-ma-md component-outline-input-std" dense outlined
               :placeholder="t('staff.placeholder.name')"
               tabindex="0">
      </q-input>

      <div class="q-ml-md">
        <h6>
          {{ $t('staff.label.phone') }}&nbsp;:
        </h6>
      </div>
      <q-input v-model="selectPhone" class="q-ma-md component-outline-input-std" dense outlined
               :placeholder="t('staff.placeholder.phone')"
               tabindex="0">
      </q-input>

    </div>

    <div class="row">
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push unelevated @click="selectData()">
        {{ $t('staff.button.query') }}
      </q-btn>
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push
             unelevated
             @click="clearUpsertParam(); isNew = true; showUpsert = true">
        {{ $t('staff.button.add') }}
      </q-btn>
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push
             unelevated @click="()=> {clearSearch(); selectData();}">
        {{ $t('staff.button.clear') }}
      </q-btn>
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push
             unelevated @click="openDisplayPriority">
        {{ $t('staff.button.adjust_priority') }}
      </q-btn>
    </div>

    <cask-complex-table :custom-table-operation="tableStaffOperation" :table-base-info="tableStaff"
                        :table-data="tableData"
                        :table-dynamic-data="tableDynamicData"
                        class="full-width"
                        style="padding: 2rem 5rem 0 0.5rem"
                        @operationClick="(name, row) => {
                            if(name === 'update') {
                              clearUpsertParam();
                              updateId = row.id
                              upsertName = row.name
                              upsertExternalName = row.externalName
                              upsertPhone = row.phone
                              upsertMail = row.mail
                              upsertGoogleCalendarId = row.googleCalendarId
                              initScheduleParam(row.scheduleList || row.scheduleDtoList || row.staffScheduleList || [])
                              loadStaffBlocks()
                              isNew = false;
                              showUpsert = true
                            }
                            if(name === 'updateSkill') {
                              updateId = row.id
                              clearStaffSkill()
                              // mark existing skills
                              if (row.skillDtoList && row.skillDtoList.length > 0) {
                                for(const s of row.skillDtoList) {
                                  if (s.id in staffSkillMap) {
                                    staffSkillMap[s.id] = true
                                  }
                                }
                              }
                              showStaffSkill = true
                            }
                            if(name === 'delete') {
                              toOpId = row.id
                              toOpTitle = $t('staff.dialog.delete.title')
                              toOpDesc = $t('staff.dialog.delete.content', { name: row.name })
                              toOpFunc = deleteData
                              showOperation = true
                            }
                          }"
                        @toNewPage="(pageObj) => {
                            tableDynamicData.pageNo = pageObj.pageNo
                            tableDynamicData.pageSize = pageObj.pageSize
                            selectData(true)
                          }"
    />

    <q-dialog :model-value="showUpsert" transition-hide="fade" no-backdrop-dismiss no-shake
              transition-show="fade" @hide="showUpsert = false">
      <q-card class="component-cask-dialog-judgement-std" style="max-width: 2000px !important">
        <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
          {{ isNew ? $t('staff.upsert.title_add') : $t('staff.upsert.title_update') }}
        </h5>

        <q-separator class="component-separator-base" inset spaced="1rem"/>

        <!-- 两列布局：左=基础信息，右=计划工作时间（排班行数多，单列会把弹窗拉得过长、展示效果差）。
             no-wrap 强制并排：弹窗宽度由两列内容撑开（卡片 max-width 已放宽），不会换行退化成单列 -->
        <div class="q-ma-md row no-wrap items-start" style="gap: 2rem;">

        <div style="flex: 1 1 auto; min-width: 24rem;">

        <div style="display: grid; grid-template-columns: max-content 1fr; gap: 1.2rem; align-items: center;">

          <h6 class="cask-litter-title-asterisk" style="white-space: nowrap;">{{ $t('staff.upsert.field.name') }}&nbsp;:</h6>
          <q-input v-model="upsertName" class="component-outline-input-grow" dense outlined
                   :placeholder="t('staff.placeholder.name')"/>

          <h6 style="white-space: nowrap; margin-left: 12px!important;">{{ $t('staff.upsert.field.external_name') }}&nbsp;:</h6>
          <q-input v-model="upsertExternalName" class="component-outline-input-grow" dense outlined
                   :placeholder="t('staff.placeholder.external_name')"/>

          <h6 style="white-space: nowrap; margin-left: 12px!important;">{{ $t('staff.upsert.field.phone') }}&nbsp;:</h6>
          <q-input v-model="upsertPhone" class="component-outline-input-grow" dense outlined
                   :placeholder="t('staff.placeholder.phone')"/>

          <h6 style="white-space: nowrap; margin-left: 12px!important;">{{ $t('staff.upsert.field.mail') }}&nbsp;:</h6>
          <q-input v-model="upsertMail" class="component-outline-input-grow" dense outlined
                   :placeholder="t('staff.placeholder.mail')"/>

          <h6 style="white-space: nowrap; margin-left: 12px!important;">{{ $t('staff.upsert.field.google_calendar_id') }}&nbsp;:</h6>
          <q-input v-model="upsertGoogleCalendarId" class="component-outline-input-grow" dense outlined
                   :placeholder="t('staff.placeholder.google_calendar_id')"/>

        </div>

        <!-- 屏蔽时间段（个人 block，仅编辑态，需已有雇员 id）：默认仅展示前后两周，可直接添加/删除；
             仅同步该雇员谷歌日历（未配置则只在本系统生效），后端尽力而为。
             标题补 12px 左边距与上方非必填字段标签的文字起点对齐（必填标签由星号占位） -->
        <div v-if="!isNew" class="q-mt-lg">
          <div class="row items-center">
            <h6 style="white-space: nowrap; margin-left: 12px!important;">{{ $t('staff.block.title') }}</h6>
          </div>
          <div class="q-mt-sm" style="opacity: .5; max-width: 25rem; font-size: .85rem; margin-left: 12px">
            {{ $t('staff.block.note') }}
          </div>

          <!-- 列表样式与预约日历「门店已屏蔽时段」一致（store-block-item 同款）：
               边框行卡片，首行时间加粗、次行原因，右侧圆形删除钮；超高滚动 -->
          <div class="q-mt-sm" style="overflow-y: auto; max-height: 16rem; margin-left: 12px">
            <div v-if="staffBlockList.length === 0" style="opacity: .5; font-size: .85rem">
              {{ $t('staff.block.empty') }}
            </div>
            <div v-for="blk in staffBlockList" :key="blk.id" class="row items-center staff-block-item">
              <div style="min-width: 0">
                <div style="font-weight: 500">{{ blk.startTime }} ~ {{ blk.endTime }}</div>
                <div v-if="blk.reason" class="component-max-line-text"
                     style="opacity: .6; font-size: .78rem">{{ blk.reason }}</div>
              </div>
              <q-space/>
              <q-btn round flat dense class="component-none-btn-grow" @click="deleteStaffBlock(blk)">
                <q-icon name="fa-solid fa-trash" size=".9rem"/>
              </q-btn>
            </div>
          </div>

          <!-- 与右侧「添加时间段」同款按钮：点击才展开填写框，再点收起 -->
          <div class="row justify-center q-my-sm">
            <q-btn no-caps unelevated class="component-none-btn-mini-grow"
                   @click="showBlockAdd = !showBlockAdd">
              <div class="row items-center justify-center">
                <q-icon name="fa-solid fa-plus" size="0.9rem"/>
                <div class="q-ml-xs" style="font-size: 0.85rem">
                  {{ $t('staff.block.add') }}
                </div>
              </div>
            </q-btn>
          </div>


          <!-- 填写框：点击上方「添加屏蔽时段」后才显示 -->
          <template v-if="showBlockAdd">
            <div class="row items-center no-wrap q-mt-sm q-ml-md" style="gap: .5rem;">
              <cask-date-time-picker v-model="newBlockStart" input-class="component-outline-input-mini-grow"
                                     :placeholder="t('staff.block.start')"/>
              <div>~</div>
              <cask-date-time-picker v-model="newBlockEnd" input-class="component-outline-input-mini-grow"
                                     :placeholder="t('staff.block.end')"/>
            </div>
            <div class="row items-center no-wrap q-mt-sm q-ml-md" style="gap: .5rem;">
              <q-input v-model="newBlockReason" class="component-outline-input-grow col" dense outlined
                       :placeholder="t('staff.block.reason')"/>
              <q-btn no-caps unelevated class="component-none-btn-mini-grow" @click="addStaffBlock">
                <div class="row items-center justify-center">
                  <q-icon name="fa-solid fa-check" size="0.9rem"/>
                  <div class="q-ml-xs" style="font-size: 0.85rem">
                    {{ $t('staff.block.confirm') }}
                  </div>
                </div>
              </q-btn>
            </div>
          </template>
        </div>

        </div>

        <div style="flex: 1 1 auto; min-width: 26rem;">
          <h6 class="cask-litter-title-asterisk" style="white-space: nowrap;">
            {{ $t('staff.schedule.title') }}
          </h6>
          <div class="q-mt-sm q-ml-md" style="opacity: 0.5; max-width: 25rem; font-size: 0.85rem">
            {{ $t('staff.schedule.note') }}
          </div>

          <div v-for="dayOfWeek in dayOfWeekList" :key="dayOfWeek" class="q-mt-md q-ml-md">
            <div class="row items-center">
              <div style="min-width: 7rem; font-size: 0.85rem; font-weight: 500;">
                {{ $t(`staff.schedule.day.${dayOfWeek}`) }}
              </div>
              <q-btn no-caps unelevated  class="component-none-btn-mini-grow"
                     @click="addScheduleRange(dayOfWeek)">
                <div class="row items-center justify-center">
                  <q-icon name="fa-solid fa-plus" size="0.9rem"/>
                  <div class="q-ml-xs" style="font-size: 0.85rem">
                    {{ $t('staff.schedule.add') }}
                  </div>
                </div>
              </q-btn>
            </div>

            <div v-if="upsertScheduleMap[dayOfWeek].length === 0" class="q-mt-xs"
                 style="opacity: .5; font-size: .75rem;">
              {{ $t('staff.schedule.empty') }}
            </div>

            <div v-for="(range, rangeIndex) in upsertScheduleMap[dayOfWeek]" :key="`${dayOfWeek}-${rangeIndex}`"
                 class="row items-center q-mt-xs" style="gap: .5rem;">
              <cask-time-picker v-model="range.startTime" :placeholder="t('staff.schedule.start')"/>
              <div>~</div>
              <cask-time-picker v-model="range.endTime" :placeholder="t('staff.schedule.end')"/>
              <q-btn no-caps unelevated class="component-none-btn-grow"
                     @click="removeScheduleRange(dayOfWeek, rangeIndex)">
                <div class="row items-center">
                  <q-icon name="fa-solid fa-trash" size="1rem"/>
                </div>
              </q-btn>

            </div>
          </div>
        </div>
        </div>

        <div class="row q-mt-xl q-mb-md justify-evenly">
          <q-btn class="shadow-1 component-full-btn-grow" no-caps unelevated @click="upsertData">
            {{ isNew ? $t('staff.upsert.save_add') : $t('staff.upsert.save_update') }}
          </q-btn>

          <q-btn class="shadow-1 component-outline-btn-grow" no-caps unelevated @click="showUpsert = false">
            {{ $t('main_setting_cancel') }}
          </q-btn>

        </div>
      </q-card>
    </q-dialog>

    <q-dialog :model-value="showStaffSkill" @hide="showStaffSkill = false"
              transition-show="fade" transition-hide="fade">
      <q-card class="component-cask-dialog-judgement-std" style="max-width: 2000px !important">
        <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
          {{ $t('staff.skill_assign.title') }}
        </h5>

        <q-separator class="component-separator-base" inset spaced="1rem"/>

        <div class="row q-px-sm" style="padding-top: .1rem; width: 25rem">
          <div v-for="skillItem in allSkillList" :key="skillItem.id">
            <q-checkbox class="q-ma-xs" color="grey-10" size="37px" v-model="staffSkillMap[skillItem.id]"
                        :label="skillItem.name"/>
          </div>

        </div>

        <div class="row q-mt-xl q-mb-md justify-center">
          <q-btn no-caps unelevated class="shadow-1 component-full-btn-grow" @click="updateStaffSkill">
            {{ $t('staff.button.save') }}
          </q-btn>
        </div>
      </q-card>
    </q-dialog>

    <q-dialog :model-value="showDisplayPriority" @hide="showDisplayPriority = false"
              transition-show="fade" transition-hide="fade">
      <q-card class="component-cask-dialog-judgement-std" style="max-width: 2000px !important">
        <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
          {{ $t('staff.display_priority.title') }}
        </h5>

        <q-separator class="component-separator-base" inset spaced="1rem"/>

        <div class="q-mt-sm q-mx-md" style="opacity: 0.5; width: 25rem; font-size: 0.85rem">
          {{ $t('staff.display_priority.note') }}
        </div>

        <div class="q-mx-md q-mt-md" style="width: 25rem; max-height: 24rem; overflow-y: auto">
          <div v-if="priorityStaffList.length === 0" style="opacity: .5; font-size: .85rem;">
            {{ $t('staff.display_priority.empty') }}
          </div>
          <div v-for="(staffItem, staffIndex) in priorityStaffList" :key="staffItem.id"
               class="row items-center priority-drag-item"
               :class="{ 'priority-drag-item-active': priorityDragIndex === staffIndex }"
               draggable="true"
               @dragstart="onPriorityDragStart(staffIndex, $event)"
               @dragover.prevent="onPriorityDragOver(staffIndex)"
               @drop.prevent
               @dragend="onPriorityDragEnd">
            <q-icon class="q-mr-sm" name="fa-solid fa-grip-vertical" size="0.9rem"/>
            <div class="priority-drag-index">{{ staffIndex + 1 }}</div>
            <div class="q-ml-sm" style="font-weight: 500">{{ staffItem.name }}</div>
            <q-space/>
            <div style="font-size: .8rem">{{ staffItem.phone }}</div>
          </div>
        </div>

        <div class="row q-mt-xl q-mb-md justify-evenly">
          <q-btn class="shadow-1 component-full-btn-grow" no-caps unelevated @click="updateDisplayPriority">
            {{ $t('staff.button.save') }}
          </q-btn>

          <q-btn class="shadow-1 component-outline-btn-grow" no-caps unelevated @click="showDisplayPriority = false">
            {{ $t('main_setting_cancel') }}
          </q-btn>
        </div>
      </q-card>
    </q-dialog>

    <cask-dialog-judgment v-model="showOperation"
                          :callback-method="isTrue => { showOperation = false; if (isTrue) toOpFunc() }"
                          :dialog-judgment-data="{ title: toOpTitle, content: toOpDesc, falseLabel: $t('staff.dialog.common.cancel'), trueLabel: $t('staff.dialog.common.confirm') }"
    />

  </div>
</template>

<script setup>
import {onMounted, reactive, ref} from "vue";
import {notifyTopPositive, notifyTopWarning} from "@/utils/notification-tools.js";
import {useI18n} from 'vue-i18n'
import CaskComplexTable from "@/ui/components/CaskComplexTable.vue";
import CaskDialogJudgment from "@/ui/components/CaskDialogJudgment.vue";
import CaskTimePicker from "@/ui/components/CaskTimePicker.vue";
import CaskDateTimePicker from "@/ui/components/CaskDateTimePicker.vue";
import {tableStaff, tableStaffOperation} from "@/tables/staff.js";
import {
  staffCreate,
  staffDelete,
  staffList,
  staffListSimple,
  staffUpdate,
  staffUpdateDisplayPriority,
  staffUpdateSkill
} from "@/api/staff.js";
import {staffSkillListSimple} from "@/api/staff-skill.js";
import {bookBlockCreate, bookBlockDelete, bookBlockList} from "@/api/book.js";


const selectId = ref("")
const selectName = ref("")
const selectPhone = ref("")
const {t} = useI18n()

function clearSearch() {
  selectId.value = ""
  selectName.value = ""
  selectPhone.value = ""
}

// create/update
const showUpsert = ref(false)
const isNew = ref(false)
const upsertName = ref("")
const upsertExternalName = ref("")
const upsertPhone = ref("")
// 通知邮箱（点钟得/失/取消通知）；空 = 不发送
const upsertMail = ref("")
// 谷歌日历ID（门店 block 同步 ClassPass 用）；空 = 不参与同步
const upsertGoogleCalendarId = ref("")
const dayOfWeekList = [1, 2, 3, 4, 5, 6, 7]
const upsertScheduleMap = reactive({
  1: [],
  2: [],
  3: [],
  4: [],
  5: [],
  6: [],
  7: [],
})

const updateId = ref("")

// 屏蔽时间段（个人 block，仅编辑态）：列表 + 新增输入（填写框点「添加屏蔽时段」才展开）
const staffBlockList = ref([])
const showBlockAdd = ref(false)
const newBlockStart = ref("")
const newBlockEnd = ref("")
const newBlockReason = ref("")

function clearUpsertParam() {
  updateId.value = ""
  upsertName.value = ""
  upsertExternalName.value = ""
  upsertPhone.value = ""
  upsertMail.value = ""
  upsertGoogleCalendarId.value = ""
  staffBlockList.value = []
  showBlockAdd.value = false
  newBlockStart.value = ""
  newBlockEnd.value = ""
  newBlockReason.value = ""
  clearScheduleParam()
}

// 浏览器本地日期 + 偏移天数 → yyyy-MM-dd（后端会再按门店时区钳制到 ±14 天，轻微时区差异无影响）
function fmtDateOffset(offsetDays) {
  const d = new Date(Date.now() + offsetDays * 86400000)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// 查询该雇员前后两周内的个人 block（不带日期入口，窗口固定，界面有对应提示）
function loadStaffBlocks() {
  if (!updateId.value) {
    return
  }
  bookBlockList({
    staffId: updateId.value,
    startDateStr: fmtDateOffset(-14),
    endDateStr: fmtDateOffset(14),
  }).then(res => {
    if (!res || !res.data || !res.data.data) {
      staffBlockList.value = []
      return
    }
    staffBlockList.value = res.data.data
  })
}

function addStaffBlock() {
  if (!newBlockStart.value || !newBlockEnd.value) {
    notifyTopWarning(t('staff.block.time_required'))
    return
  }
  bookBlockCreate({
    staffId: updateId.value,
    startTimeStr: newBlockStart.value,
    endTimeStr: newBlockEnd.value,
    reason: newBlockReason.value || null,
  }).then(res => {
    if (!res || !res.data) {
      return
    }
    showBlockAdd.value = false
    newBlockStart.value = ""
    newBlockEnd.value = ""
    newBlockReason.value = ""
    loadStaffBlocks()
  })
}

function deleteStaffBlock(blk) {
  bookBlockDelete(blk.id).then(res => {
    if (!res || !res.data) {
      return
    }
    loadStaffBlocks()
  })
}

function minuteToTime(minute) {
  const safeMinute = Number(minute)
  if (Number.isNaN(safeMinute)) {
    return null
  }
  const clampMinute = Math.max(0, Math.min(1440, safeMinute))
  const hour = Math.floor(clampMinute / 60)
  const minutePart = clampMinute % 60
  return `${String(hour).padStart(2, '0')}:${String(minutePart).padStart(2, '0')}`
}

function timeToMinute(timeStr) {
  if (!timeStr || typeof timeStr !== 'string' || timeStr.length < 5) {
    return null
  }
  const timeParts = timeStr.split(':')
  if (timeParts.length !== 2) {
    return null
  }
  const hour = Number(timeParts[0])
  const minute = Number(timeParts[1])
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null
  }
  if (hour < 0 || hour > 24 || minute < 0 || minute > 59) {
    return null
  }
  if (hour === 24 && minute > 0) {
    return null
  }
  return hour * 60 + minute
}

function clearScheduleParam() {
  for (const dayOfWeek of dayOfWeekList) {
    upsertScheduleMap[dayOfWeek] = []
  }
}

function addScheduleRange(dayOfWeek) {
  if (!dayOfWeekList.includes(dayOfWeek)) {
    return
  }
  upsertScheduleMap[dayOfWeek].push({
    startTime: '09:00',
    endTime: '18:00',
  })
}

function removeScheduleRange(dayOfWeek, rangeIndex) {
  if (!dayOfWeekList.includes(dayOfWeek)) {
    return
  }
  upsertScheduleMap[dayOfWeek].splice(rangeIndex, 1)
}

function initScheduleParam(scheduleList) {
  clearScheduleParam()
  if (!scheduleList || !Array.isArray(scheduleList)) {
    return
  }
  for (const schedule of scheduleList) {
    const dayOfWeek = Number(schedule.dayOfWeek)
    if (!dayOfWeekList.includes(dayOfWeek)) {
      continue
    }
    const startTime = minuteToTime(schedule.startMinute)
    const endTime = minuteToTime(schedule.endMinute)
    if (!startTime || !endTime) {
      continue
    }
    upsertScheduleMap[dayOfWeek].push({
      startTime: startTime,
      endTime: endTime,
    })
  }
}

function buildScheduleListForSubmit() {
  const scheduleList = []
  for (const dayOfWeek of dayOfWeekList) {
    for (const range of upsertScheduleMap[dayOfWeek]) {
      const startMinute = timeToMinute(range.startTime)
      const endMinute = timeToMinute(range.endTime)
      if (startMinute === null || endMinute === null) {
        notifyTopWarning(t('staff.schedule.notify.invalid_time'))
        return null
      }
      if (startMinute >= endMinute) {
        notifyTopWarning(t('staff.schedule.notify.invalid_range'))
        return null
      }
      scheduleList.push({
        dayOfWeek: dayOfWeek,
        startMinute: startMinute,
        endMinute: endMinute,
      })
    }
  }
  return scheduleList
}

// assign skill
const showStaffSkill = ref(false)
const allSkillList = ref([])
const staffSkillMap = reactive({})

// display priority（预约日历日视图的雇员列顺序），列表顺序即优先级
const showDisplayPriority = ref(false)
const priorityStaffList = ref([])
const priorityDragIndex = ref(-1)

function openDisplayPriority() {
  priorityStaffList.value = []
  priorityDragIndex.value = -1
  showDisplayPriority.value = true
  staffListSimple().then(res => {
    if (!res || !res.data || !res.data.data) {
      return
    }
    priorityStaffList.value = res.data.data.map(s => ({id: s.id, name: s.name, phone: s.phone}))
  })
}

function onPriorityDragStart(index, event) {
  priorityDragIndex.value = index
  // Firefox 需要 setData 才会触发拖拽
  if (event && event.dataTransfer) {
    event.dataTransfer.setData('text/plain', '')
    event.dataTransfer.effectAllowed = 'move'
  }
}

// 拖动经过其他行时实时交换位置，松手即为最终顺序
function onPriorityDragOver(index) {
  const from = priorityDragIndex.value
  if (from === -1 || from === index) {
    return
  }
  const moved = priorityStaffList.value.splice(from, 1)[0]
  priorityStaffList.value.splice(index, 0, moved)
  priorityDragIndex.value = index
}

function onPriorityDragEnd() {
  priorityDragIndex.value = -1
}

function updateDisplayPriority() {
  if (priorityStaffList.value.length === 0) {
    showDisplayPriority.value = false
    return
  }
  const body = {
    staffIdList: priorityStaffList.value.map(s => s.id)
  }
  staffUpdateDisplayPriority(body).then(res => {
    if (!res || !res.data) {
      return
    }
    showDisplayPriority.value = false
    notifyTopPositive(t('staff.notify.display_priority_success'))
  })
}

// op
const showOperation = ref(false)
const toOpId = ref("")
const toOpTitle = ref("")
const toOpDesc = ref("")
const toOpFunc = ref(null)

const tableData = ref([])
const tableDynamicData = ref(
    {
      inLoading: true,
      pageNo: 1,
      pageSize: 10,
      dataSum: 0,
    }
)

function upsertData() {
  if (!upsertName.value) {
    notifyTopWarning(t('validation.insufficient_parameters'))
    return;
  }

  if (!updateId.value && !isNew.value) {
    notifyTopWarning(t('validation.insufficient_parameters'))
    return;
  }

  const scheduleList = buildScheduleListForSubmit()
  if (scheduleList === null) {
    return;
  }

  const body = {
    name: upsertName.value,
    externalName: upsertExternalName.value,
    phone: upsertPhone.value,
    mail: upsertMail.value,
    // 空串=清空（后端 MP NOT_NULL 更新语义，同 externalName/mail）
    googleCalendarId: upsertGoogleCalendarId.value,
    priority: 1,
    scheduleList: scheduleList,
  }

  if (isNew.value) {
    staffCreate(body).then(res => {
      if (!res || !res.data) {
        return
      }
      clearUpsertParam()
      showUpsert.value = false
      selectData(true)
    })
  } else {
    staffUpdate(updateId.value, body).then(res => {
      if (!res || !res.data) {
        return
      }
      clearUpsertParam()
      showUpsert.value = false
      notifyTopPositive(t('staff.notify.update_success'))
      selectData(true)
    })
  }
}


function clearStaffSkill() {
  for (const key in staffSkillMap) {
    staffSkillMap[key] = false
  }
}

function updateStaffSkill() {
  if (!updateId.value) {
    notifyTopWarning(t('validation.insufficient_parameters'))
    return;
  }

  const body = {
    skillIdList: []
  }

  for (const key in staffSkillMap) {
    if (staffSkillMap[key]) {
      body.skillIdList.push(key)
    }
  }

  staffUpdateSkill(updateId.value, body).then(res => {
    if (!res || !res.data) {
      return
    }
    showStaffSkill.value = false
    notifyTopPositive(t('staff.notify.skill_assign_success'))
    selectData(true)
  })

}

function deleteData() {
  if (!toOpId.value) {
    notifyTopWarning(t('validation.insufficient_parameters'))
  }
  staffDelete(toOpId.value).then(res => {
    if (!res || !res.data) {
      return
    }
    notifyTopPositive(t('notify.delete_success'))
    selectData(true)
  })
}

// 默认从第一页开始查询；翻页、行操作后刷新时传 keepPage = true 保持当前页
function selectData(keepPage = false) {
  if (!keepPage) {
    tableDynamicData.value.pageNo = 1
  }
  tableDynamicData.value.inLoading = true
  const param = {
    id: selectId.value, name: selectName.value, phone: selectPhone.value,
    pageNo: tableDynamicData.value.pageNo, pageSize: tableDynamicData.value.pageSize,
  }

  staffList(param).then(res => {
    if (!res || !res.data || !res.data.data) {
      tableDynamicData.value.inLoading = false
      return
    }
    const thisData = res.data.data.records
    tableDynamicData.value.dataSum = res.data.data.total
    thisData.forEach(data => {
      data.createUserName = data.createUserName || data.createUserId
      data.deleteOp = true
      data.updateOp = true
      // show skill op
      data.skillOp = true
      data.skillDtoList = data.skillDtoList || []
      data.skills = ""
      if (data.skillDtoList && data.skillDtoList.length > 0) {
        data.simpleSkillList = data.skillDtoList.map(item => item.id)
        for (const thisSkill of data.skillDtoList) {
          data.skills += thisSkill.name + ","
        }
        data.skills = data.skills.slice(0, -1)
      } else {
        data.simpleSkillList = []
      }
    });
    tableData.value = thisData
    tableDynamicData.value.inLoading = false
  })
}

function getAllSkills() {
  // fetch a large page to get all skills for assigning
  staffSkillListSimple().then(res => {
    if (!res || !res.data || !res.data.data) {
      return
    }
    res.data.data.forEach(skill => {
      staffSkillMap[skill.id] = false
    })
    allSkillList.value = res.data.data
  })
}

onMounted(() => {
  selectData()
  getAllSkills()
})
</script>

<style scoped lang="scss">

// 与预约日历 CaskStoreBlockDialog 的 .store-block-item 同款
.staff-block-item {
  padding: .5rem .75rem;
  margin-bottom: .5rem;
  border: 2px solid rgba(var(--text-color));
  border-radius: 4px;
}

.priority-drag-item {
  padding: .5rem .75rem;
  margin-bottom: .5rem;
  border: 2px solid rgba(var(--text-color));
  border-radius: 4px;
  cursor: grab;
  transition: border-color .2s ease;

  &:hover {
    border-color: rgb(var(--text-color));
  }

  &.priority-drag-item-active {
    border-style: dashed;
    border-color: rgb(var(--text-color));
    cursor: grabbing;
  }
}

.priority-drag-index {
  min-width: 1.5rem;
  text-align: center;
  font-size: .85rem;
  font-weight: 600;
}

</style>