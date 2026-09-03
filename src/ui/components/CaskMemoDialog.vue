<template>
  <!-- 便签墙：近全屏弹窗。关闭一律走 close()，好让便签先播完收起动画再真正关掉 -->
  <q-dialog :model-value="modelValue" transition-show="fade" transition-hide="fade"
            @update:model-value="val => { if (!val) { close() } }">
    <q-card class="component-cask-dialog-judgement-std column memo-dialog-card">

      <!-- 左上角：新建 + 检索 -->
      <div class="row items-center no-wrap memo-toolbar">
        <q-btn no-caps unelevated class="component-full-btn-mini-grow shadow-2" @click="openCreate">
          <q-icon name="fa-solid fa-plus" size=".8rem" class="q-mr-sm"/>
          {{ $t('memo.create') }}
        </q-btn>
        <q-input v-model="keyword" dense outlined clearable tabindex="0"
                 class="q-ml-lg component-outline-input-mini-grow" style="opacity: .92"
                 clear-icon="fa-solid fa-xmark"
                 :placeholder="$t('memo.search_placeholder')">
          <template v-slot:prepend>
            <q-icon name="fa-solid fa-magnifying-glass" size=".85rem"/>
          </template>
        </q-input>
        <q-space/>
        <div class="memo-count">
          {{ keywordText
            ? $t('memo.count_filtered', {shown: matchedCount, total: memos.length})
            : $t('memo.count', {total: memos.length}) }}
        </div>
      </div>

      <!-- 墙面：便签绝对定位在这里，拖动范围也限定在它内部 -->
      <div ref="wallRef" class="col memo-wall">
        <div v-if="memos.length === 0" class="memo-placeholder">{{ $t('memo.empty') }}</div>
        <div v-else-if="matchedCount === 0" class="memo-placeholder">{{ $t('memo.no_match') }}</div>

        <!-- 未命中检索的便签只是隐形（不是 v-if / v-show）：元素留在原地、也不切 display，
             才不会每敲一个字就把落下动画重播一遍 -->
        <div v-for="(memo, index) in memos" :key="memo.id"
             class="memo-note"
             :class="{ 'memo-note-leaving': leaving, 'memo-note-hidden': !isMatch(memo) }"
             :data-id="memo.id" :style="noteStyle(memo, index)">
          <div class="memo-note-tape"/>
          <div class="row items-start no-wrap memo-note-head">
            <div class="memo-note-title">{{ memo.title }}</div>
            <q-space/>
            <!-- 操作区不参与拖动（interact 的 ignoreFrom 指向它） -->
            <div class="memo-note-ops">
              <q-icon name="fa-solid fa-pen" size=".75rem" @click.stop="openEdit(memo)"/>
              <q-icon name="fa-solid fa-trash" size=".75rem" class="q-ml-sm"
                      @click.stop="openDelete(memo)"/>
            </div>
          </div>
          <div class="memo-note-content">{{ memo.content }}</div>
          <div class="memo-note-time">{{ memo.updateTime }}</div>
        </div>
      </div>

      <!-- 底部居中：关闭 -->
      <div class="row justify-center memo-footer">
        <q-btn no-caps unelevated class="component-full-btn-mini-grow shadow-2" @click="close">
          {{ $t('memo.close') }}
        </q-btn>
      </div>

    </q-card>
  </q-dialog>

  <!-- 新建 / 编辑 -->
  <q-dialog v-model="showEdit" transition-show="fade" transition-hide="fade">
    <q-card class="component-cask-dialog-judgement-std column memo-edit-card">
      <h6 style="margin: 0 0 .75rem 0 !important">
        {{ editIsNew ? $t('memo.create') : $t('memo.edit') }}
      </h6>

      <div class="memo-edit-label">{{ $t('memo.field.title') }}</div>
      <q-input v-model="editForm.title" dense outlined tabindex="0" maxlength="100"
               class="component-outline-input-grow" style="opacity: .92"/>

      <div class="memo-edit-label">{{ $t('memo.field.color') }}</div>
      <div class="row items-center memo-color-list">
        <div v-for="color in MemoColorList" :key="color.key" class="memo-color-chip"
             :class="{ 'memo-color-chip-on': editForm.bgColor === color.bg }"
             :style="{ background: color.bg, color: color.text }"
             @click="editForm.bgColor = color.bg; editForm.textColor = color.text">
          A
        </div>
      </div>

      <div class="memo-edit-label">{{ $t('memo.field.content') }}</div>
      <cask-long-text-input-simple v-model:value="editForm.content" input-height="8rem"/>

      <div class="row justify-evenly q-mt-lg">
        <q-btn no-caps unelevated class="component-full-btn-mini-grow shadow-2"
               :loading="saving" :disable="saving" @click="saveMemo">
          {{ $t('main_setting_save') }}
        </q-btn>
        <q-btn no-caps unelevated class="component-full-btn-mini-grow shadow-2"
               @click="showEdit = false">
          {{ $t('main_setting_cancel') }}
        </q-btn>
      </div>
    </q-card>
  </q-dialog>

  <cask-dialog-judgment v-model="showDelete"
                        :callback-method="isTrue => { showDelete = false; if (isTrue) deleteMemo() }"
                        :dialog-judgment-data="{ title: $t('memo.delete_title'), content: $t('memo.delete_content', { title: deleteTarget ? deleteTarget.title : '' }), falseLabel: $t('book_booking.dialog.common.cancel'), trueLabel: $t('book_booking.dialog.common.confirm') }"
  />
</template>

<script setup>
import {computed, defineEmits, defineProps, nextTick, onBeforeUnmount, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import interact from 'interactjs'
import CaskLongTextInputSimple from "@/ui/components/CaskLongTextInputSimple.vue";
import CaskDialogJudgment from "@/ui/components/CaskDialogJudgment.vue";
import {notifyTopPositive, notifyTopWarning} from "@/utils/notification-tools.js";
import {memoCreate, memoDelete, memoList, memoPosition, memoUpdate} from "@/api/memo.js";
import {MemoColorList, randomMemoColor} from "@/constants/enums/memo.js";

const {t} = useI18n()

const emit = defineEmits(['update:modelValue', 'changed'])
const props = defineProps({
  modelValue: {type: Boolean, required: true, default: false},
})

// 便签尺寸（与样式里的 .memo-note 一致）：新建时按它排一个不重叠的网格位
const NOTE_WIDTH = 240
const NOTE_HEIGHT = 176
const NOTE_GAP = 20
// 收起动画时长，与 .memo-note-leaving 的 animation 对齐（含最后一张的错开延迟）
const LEAVE_DURATION = 520

const memos = ref([])
const keyword = ref('')
const wallRef = ref(null)
// 墙的当前尺寸：便签存的是百分比，渲染要按它换算成像素；窗口缩放/全屏切换后要跟着重算
const wallSize = ref({width: 0, height: 0})
// 收起中：便签先播完向上飞走的动画，再真正关闭弹窗
const leaving = ref(false)
let leaveTimer = null
let interactable = null
let wallObserver = null

// 归一化后的关键字：q-input 的 clearable 点 × 会把 v-model 置成 null
// （Quasar 的 clearValue 写死 emit(null)，没有可配的清空值），直接 .trim() 会抛错、
// 渲染一中断就看着像 × 没反应。统一从这里取，别再直接读 keyword
// 可放置范围 = 墙尺寸 − 便签尺寸。百分比按这个范围取，100% 时便签的右/下边缘刚好贴住墙边，
// 换任何分辨率打开都完整可见（若按墙本身算，100% 会把便签整个推出视野）
const placeArea = computed(() => ({
  width: Math.max(1, wallSize.value.width - NOTE_WIDTH),
  height: Math.max(1, wallSize.value.height - NOTE_HEIGHT),
}))

function percentToPx(percent, range) {
  return Math.round((percent || 0) / 100 * range)
}

// 存两位小数即可：1000px 的墙上 0.01% ≈ 0.1px，再细没有意义
function pxToPercent(px, range) {
  return Math.round(Math.min(100, Math.max(0, px / range * 100)) * 100) / 100
}

const keywordText = computed(() => (keyword.value || '').trim().toLowerCase())

const matchedCount = computed(() => memos.value.filter(isMatch).length)

// 动态模糊检索：标题或正文命中即可，不命中的便签直接隐藏
function isMatch(memo) {
  const kw = keywordText.value
  if (!kw) {
    return true
  }
  return (memo.title || '').toLowerCase().includes(kw)
      || (memo.content || '').toLowerCase().includes(kw)
}

// 便签的随手贴倾角：按 id 算，保证刷新后不会乱跳
function rotationOf(id) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % 100000
  }
  return `${(hash % 61) / 10 - 3}deg`
}

function noteStyle(memo, index) {
  const area = placeArea.value
  const top = percentToPx(memo.posTopPercent, area.height)
  return {
    left: percentToPx(memo.posLeftPercent, area.width) + 'px',
    top: top + 'px',
    zIndex: memo.layerNo,
    background: memo.bgColor,
    color: memo.textColor,
    '--memo-rot': rotationOf(memo.id),
    // 起落点：正好在墙的上边缘之外。用固定距离的话，靠上的便签大半程都被墙裁掉、
    // 看着像凭空出现；按各自的落点算，每张都是「从墙顶掉到自己的位置」
    '--memo-drop': `-${top + NOTE_HEIGHT + 24}px`,
    // 落下按顺序错开，像一张张贴上去，而不是整面墙一起砸下来
    '--memo-i': index,
  }
}

function reload() {
  return memoList().then(res => {
    if (!res || !res.data || !res.data.data) {
      return
    }
    memos.value = res.data.data
  })
}

watch(() => props.modelValue, (val) => {
  if (!val) {
    teardownDrag()
    stopObserveWall()
    return
  }
  keyword.value = ''
  leaving.value = false
  reload().then(() => nextTick(() => {
    observeWall()
    setupDrag()
  }))
})

function measureWall() {
  if (!wallRef.value) {
    return
  }
  wallSize.value = {width: wallRef.value.clientWidth, height: wallRef.value.clientHeight}
}

// 墙的尺寸随窗口变，百分比换算的分母也跟着变——挂个 ResizeObserver 让便签位置自动跟上
function observeWall() {
  stopObserveWall()
  if (!wallRef.value) {
    return
  }
  measureWall()
  wallObserver = new ResizeObserver(measureWall)
  wallObserver.observe(wallRef.value)
}

function stopObserveWall() {
  if (wallObserver) {
    wallObserver.disconnect()
    wallObserver = null
  }
}

// ===== 拖动（interact.js）=====
// 位置走 left/top 而不是 transform——transform 留给便签的倾角与落下动画，两边不打架
function setupDrag() {
  teardownDrag()
  if (!wallRef.value) {
    return
  }
  interactable = interact('.memo-note', {context: wallRef.value})
      .draggable({
        // 编辑/删除按钮不触发拖动
        ignoreFrom: '.memo-note-ops',
        modifiers: [
          interact.modifiers.restrictRect({restriction: 'parent'}),
        ],
        listeners: {
          start: onDragStart,
          move: onDragMove,
          end: onDragEnd,
        },
      })
}

function teardownDrag() {
  if (interactable) {
    interactable.unset()
    interactable = null
  }
}

function memoOf(event) {
  const id = event.target ? event.target.dataset.id : null
  return id ? memos.value.find(memo => memo.id === id) : null
}

// 拖起来的便签浮到最上面（层级随位置一起回存，刷新后保持这个前后关系）
function onDragStart(event) {
  const memo = memoOf(event)
  if (!memo) {
    return
  }
  const maxLayer = memos.value.reduce((max, item) => Math.max(max, item.layerNo || 0), 0)
  if (memo.layerNo !== maxLayer) {
    memo.layerNo = maxLayer + 1
  }
}

function onDragMove(event) {
  const memo = memoOf(event)
  if (!memo) {
    return
  }
  // interact 给的是像素增量，落到状态里要换回百分比（存的就是百分比）
  const area = placeArea.value
  memo.posLeftPercent = pxToPercent(
      percentToPx(memo.posLeftPercent, area.width) + event.dx, area.width)
  memo.posTopPercent = pxToPercent(
      percentToPx(memo.posTopPercent, area.height) + event.dy, area.height)
}

function onDragEnd(event) {
  const memo = memoOf(event)
  if (!memo) {
    return
  }
  memoPosition(memo.id, {
    posLeftPercent: memo.posLeftPercent,
    posTopPercent: memo.posTopPercent,
    layerNo: memo.layerNo,
  })
}

// ===== 新建 / 编辑 =====
const showEdit = ref(false)
const editIsNew = ref(false)
const editId = ref('')
const saving = ref(false)
const editForm = ref({title: '', content: '', bgColor: '', textColor: ''})

function openCreate() {
  const color = randomMemoColor()
  editForm.value = {title: '', content: '', bgColor: color.bg, textColor: color.text}
  editId.value = ''
  editIsNew.value = true
  showEdit.value = true
}

function openEdit(memo) {
  editForm.value = {
    title: memo.title || '',
    content: memo.content || '',
    bgColor: memo.bgColor,
    textColor: memo.textColor,
  }
  editId.value = memo.id
  editIsNew.value = false
  showEdit.value = true
}

// 新便签落在下一个网格位：一行排满换下一行，不跟已有便签叠在一起
function nextPosition() {
  const area = placeArea.value
  const cols = Math.max(1, Math.floor((wallSize.value.width - NOTE_GAP) / (NOTE_WIDTH + NOTE_GAP)))
  const index = memos.value.length
  return {
    posLeftPercent: pxToPercent(NOTE_GAP + (index % cols) * (NOTE_WIDTH + NOTE_GAP), area.width),
    posTopPercent: pxToPercent(
        NOTE_GAP + Math.floor(index / cols) * (NOTE_HEIGHT + NOTE_GAP), area.height),
  }
}

function saveMemo() {
  const form = editForm.value
  if (!form.title || !form.title.trim()) {
    notifyTopWarning(t('memo.title_required'))
    return
  }
  const body = {
    title: form.title.trim(),
    content: form.content || '',
    bgColor: form.bgColor,
    textColor: form.textColor,
  }
  const isNew = editIsNew.value
  if (isNew) {
    Object.assign(body, nextPosition())
  }
  saving.value = true
  const request = isNew ? memoCreate(body) : memoUpdate(editId.value, body)
  request.then(res => {
    if (!res || !res.data) {
      return
    }
    notifyTopPositive(t(isNew ? 'memo.create_success' : 'memo.update_success'))
    showEdit.value = false
    afterChanged()
  }).finally(() => {
    saving.value = false
  })
}

// ===== 删除 =====
const showDelete = ref(false)
const deleteTarget = ref(null)

function openDelete(memo) {
  deleteTarget.value = memo
  showDelete.value = true
}

function deleteMemo() {
  if (!deleteTarget.value) {
    return
  }
  memoDelete(deleteTarget.value.id).then(res => {
    if (!res || !res.data) {
      return
    }
    notifyTopPositive(t('memo.delete_success'))
    afterChanged()
  })
}

// 增删改后重新拉一遍并重挂拖动（新便签也要能拖），顺便通知外层刷新角标数量
function afterChanged() {
  reload().then(() => nextTick(setupDrag))
  emit('changed')
}

// ===== 关闭 =====
// 先让便签播完向上飞走的动画，再真正关掉弹窗；Esc / 点遮罩关闭也走这里
function close() {
  if (leaving.value) {
    return
  }
  leaving.value = true
  leaveTimer = setTimeout(() => {
    leaving.value = false
    leaveTimer = null
    emit('update:modelValue', false)
  }, LEAVE_DURATION)
}

onBeforeUnmount(() => {
  teardownDrag()
  stopObserveWall()
  if (leaveTimer) {
    clearTimeout(leaveTimer)
    leaveTimer = null
  }
})
</script>

<style scoped lang="scss">

// 近全屏：便签墙需要地方铺开
.memo-dialog-card {
  width: 90vw;
  max-width: 90vw !important;
  height: 90vh;
  padding: 1.25rem 1.5rem;

  .memo-toolbar {
    flex: 0 0 auto;

    .memo-count {
      font-size: .8rem;
      opacity: .55;
    }
  }

  .memo-footer {
    flex: 0 0 auto;
    padding-top: 1rem;
  }
}

// 墙面：便签绝对定位于此；overflow 隐藏，便签才是从上边缘落进来的
.memo-wall {
  position: relative;
  margin-top: 1rem;
  border-radius: 8px;
  border: 1px dashed rgba(128, 128, 128, .3);
  background: rgba(128, 128, 128, .05);
  overflow: hidden;

  .memo-placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: .85rem;
    opacity: .45;
    pointer-events: none;
  }
}

.memo-note {
  position: absolute;
  width: 240px;
  height: 176px;
  padding: 1rem .85rem .85rem;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  cursor: grab;
  touch-action: none;
  user-select: none;
  // 纸感：贴地的实影 + 一层扩散影，像翘着一角贴在墙上
  box-shadow: 0 1px 2px rgba(0, 0, 0, .16), 0 6px 14px -6px rgba(0, 0, 0, .35);
  transform: rotate(var(--memo-rot));
  // 落下 + 末尾弹两下；backwards 让它在自己的延迟到点前先待在画面外
  animation: memo-drop-in .78s backwards;
  animation-delay: calc(var(--memo-i) * 55ms);

  &:active {
    cursor: grabbing;
  }

  // 检索未命中：隐形且不参与命中（不用 display:none——切 display 会让落下动画重播）
  &.memo-note-hidden {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity .15s ease;
  }

  // 顶部胶带
  .memo-note-tape {
    position: absolute;
    top: -.5rem;
    left: 50%;
    width: 3.6rem;
    height: 1.1rem;
    transform: translateX(-50%) rotate(-1.5deg);
    background: rgba(255, 255, 255, .45);
    box-shadow: 0 1px 2px rgba(0, 0, 0, .12);
  }

  .memo-note-head {
    flex: 0 0 auto;
  }

  .memo-note-title {
    font-size: .9rem;
    font-weight: 600;
    line-height: 1.3;
    // 标题最多两行：便签是提要，长内容该写正文
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-word;
  }

  // 操作按钮：悬停才露出来，平时便签保持干净
  .memo-note-ops {
    flex: 0 0 auto;
    margin-left: .4rem;
    opacity: 0;
    transition: opacity .15s ease;
    cursor: pointer;
  }

  &:hover .memo-note-ops {
    opacity: .65;
  }

  .memo-note-ops .q-icon:hover {
    opacity: 1;
  }

  .memo-note-content {
    flex: 1 1 auto;
    margin-top: .45rem;
    font-size: .78rem;
    line-height: 1.45;
    white-space: pre-wrap;
    word-break: break-word;
    overflow-y: auto;
    opacity: .85;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, .2);
      border-radius: 2px;
    }
  }

  .memo-note-time {
    flex: 0 0 auto;
    margin-top: .35rem;
    font-size: .65rem;
    opacity: .5;
  }

  // 收起：先下沉蓄一下力，再整张飞出上边缘
  &.memo-note-leaving {
    animation: memo-drop-out .42s forwards;
    animation-delay: calc(var(--memo-i) * 30ms);
  }
}

// 从画面上方掉下来，落定后弹两下。分段 timing-function：下落加速、触底回弹减速
@keyframes memo-drop-in {
  0% {
    opacity: 0;
    transform: translateY(var(--memo-drop)) rotate(var(--memo-rot));
    animation-timing-function: cubic-bezier(.5, 0, .9, .4);
  }
  10% {
    opacity: 1;
  }
  52% {
    transform: translateY(0) rotate(var(--memo-rot));
    animation-timing-function: cubic-bezier(.2, .7, .4, 1);
  }
  66% {
    transform: translateY(-15%) rotate(var(--memo-rot));
    animation-timing-function: cubic-bezier(.5, 0, .9, .4);
  }
  79% {
    transform: translateY(0) rotate(var(--memo-rot));
    animation-timing-function: cubic-bezier(.2, .7, .4, 1);
  }
  89% {
    transform: translateY(-5.5%) rotate(var(--memo-rot));
    animation-timing-function: cubic-bezier(.5, 0, .9, .4);
  }
  100% {
    transform: translateY(0) rotate(var(--memo-rot));
  }
}

@keyframes memo-drop-out {
  0% {
    opacity: 1;
    transform: translateY(0) rotate(var(--memo-rot));
    animation-timing-function: cubic-bezier(.3, 0, .7, .5);
  }
  22% {
    transform: translateY(8%) rotate(var(--memo-rot));
    animation-timing-function: cubic-bezier(.4, 0, .8, .5);
  }
  100% {
    opacity: 0;
    transform: translateY(var(--memo-drop)) rotate(var(--memo-rot));
  }
}

// 新建/编辑弹窗
.memo-edit-card {
  min-width: 30rem;
  padding: 1.25rem 1.5rem;

  .memo-edit-label {
    font-size: .82rem;
    opacity: .6;
    margin: 1rem 0 .4rem;

    &:first-of-type {
      margin-top: 0;
    }
  }

  // 配色不给取色器：只给内置的几组低饱和搭配，色块本身就是效果预览
  .memo-color-list {
    gap: .5rem;
    flex-wrap: wrap;
  }

  .memo-color-chip {
    width: 2.6rem;
    height: 1.9rem;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: .8rem;
    font-weight: 600;
    cursor: pointer;
    border: 2px solid transparent;
    box-shadow: 0 1px 3px rgba(0, 0, 0, .18);
    transition: transform .12s ease;

    &:hover {
      transform: translateY(-2px);
    }

    &.memo-color-chip-on {
      border-color: rgb(var(--text-color));
    }
  }
}

</style>
