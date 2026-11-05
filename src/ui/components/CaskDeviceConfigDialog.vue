<template>
  <q-dialog :model-value="modelValue" transition-show="fade" transition-hide="fade" no-backdrop-dismiss no-shake
            @update:model-value="val => emit('update:modelValue', val)">
    <q-card class="component-cask-dialog-judgement-std" style="max-width: 2000px !important">
      <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
        {{ $t('staff_device.config.title_device', {name: device ? device.name : ''}) }}
      </h5>
      <div class="q-mx-sm" style="opacity: .5; font-size: .85rem; max-width: 40rem">
        {{ $t('staff_device.config.note_device') }}
      </div>

      <q-separator class="component-separator-base" inset spaced="1rem"/>

      <div v-if="loading" class="row justify-center q-pa-xl">
        <q-spinner size="2rem"/>
      </div>
      <!-- 表单按后端白名单生成，两列（同门店编辑弹窗）：左列大模型 / 语音合成 / 一体机，右列预约 / 人声检测，每列一个 grid
           （标签列宽各列自己对齐），组名横跨整行。名称在左（悬停看配置项 key），输入框在右。留空 = 不设置，灰字是示例
           （数字项是默认值和范围）；密钥只能改不能看：留空不动，填了就是新值；开关项（BOOLEAN）是拨动开关，没设时按默认值显示 -->
      <div v-else class="q-ma-md row no-wrap items-start device-config-columns">
        <div v-for="(column, ci) in columns" :key="ci" class="device-config-grid">
          <template v-for="group in column" :key="group.id">
            <div class="device-config-group">{{ groupLabel(group.id) }}</div>
            <template v-for="meta in group.keys" :key="meta.key">
              <h6 style="white-space: nowrap; margin-left: 12px!important;">
                {{ keyLabel(meta) }}&nbsp;:
                <q-tooltip>{{ meta.key }}</q-tooltip>
              </h6>
              <div v-if="meta.type === 'BOOLEAN'" class="row items-center no-wrap">
                <q-toggle :model-value="toggleValue(meta)" color="primary"
                          @update:model-value="val => drafts[meta.key] = val ? 'true' : 'false'"/>
                <span style="opacity: .5; font-size: .85rem">{{ keyHint(meta) }}</span>
              </div>
              <q-input v-else v-model="drafts[meta.key]" class="component-outline-input-grow" dense outlined clearable
                       :type="meta.secret ? 'password' : 'text'" :autocomplete="meta.secret ? 'new-password' : 'off'"
                       :mask="inputMask(meta)" :maxlength="meta.maxLength"
                       :placeholder="placeholder(meta, items[meta.key])"/>
            </template>
          </template>
        </div>
      </div>

      <div class="row q-mt-lg q-mb-md justify-evenly">
        <!-- 提交中禁用并转 loading，防连点 -->
        <q-btn class="shadow-1 component-full-btn-grow" no-caps unelevated :loading="saving" :disable="loading"
               @click="save">
          {{ $t('staff_device.config.save') }}
        </q-btn>
        <q-btn class="shadow-1 component-outline-btn-grow" no-caps unelevated
               @click="emit('update:modelValue', false)">
          {{ $t('staff_device.config.close') }}
        </q-btn>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import {computed, defineEmits, defineProps, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {notifyTopPositive, notifyTopWarning} from "@/utils/notification-tools.js";
import {staffDeviceConfig, staffDeviceConfigKeys, staffDeviceConfigUpdate} from "@/api/staff-device.js";

const {t, te} = useI18n()

const emit = defineEmits(['update:modelValue', 'saved']);
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  },
  // 要配置的设备 {id, name}
  device: {
    type: Object,
    required: false,
    default: null
  },
})

// 白名单元数据：[{key, type, secret, desc, maxLength, min, max, defaultValue}]（min / max 只有 NUMBER 有，
// defaultValue 只有后端自己用的预约项有），取一次后缓存
const keyList = ref([])

// 分组与分列（按 key 的前缀，后端加的新 key 没归到哪一组就放左列最后的「其他」）：左列 0、右列 1，组内按白名单顺序
const GROUPS = [
  {id: 'ai', column: 0, match: key => key.startsWith('upstream.') || key.startsWith('tts.')},
  {id: 'kiosk', column: 0, match: key => key === 'kiosk.maintenance-pin' || key === 'kiosk.update.version'},
  {id: 'booking', column: 1, match: key => key.startsWith('booking.')},
  {id: 'vad', column: 1, match: key => key.startsWith('kiosk.vad.')},
]
const OTHER_GROUP = {id: 'other', column: 0}
// key -> {key, value}（后端 itemList 按 key 展开）；密钥的 value：设了为 null，没设为空串
const items = ref({})
// key -> 输入框里的值；密钥的输入框一开始总是空的
const drafts = ref({})
const loading = ref(false)
const saving = ref(false)

// [[{id, keys}...], [{id, keys}...]]：两列各自的组，空组不出
const columns = computed(() => {
  const byGroup = new Map()
  for (const meta of keyList.value) {
    if (!items.value[meta.key]) {
      continue
    }
    const group = GROUPS.find(g => g.match(meta.key)) || OTHER_GROUP
    if (!byGroup.has(group)) {
      byGroup.set(group, [])
    }
    byGroup.get(group).push(meta)
  }
  const result = [[], []]
  for (const group of [...GROUPS, OTHER_GROUP]) {
    if (byGroup.has(group)) {
      result[group.column].push({id: group.id, keys: byGroup.get(group)})
    }
  }
  return result.filter(column => column.length > 0)
})

watch(() => props.modelValue, (val) => {
  if (val && props.device) {
    load()
  }
})

async function load() {
  loading.value = true
  items.value = {}
  drafts.value = {}
  try {
    if (keyList.value.length === 0) {
      const res = await staffDeviceConfigKeys()
      if (!res || !res.data || !res.data.data) {
        return
      }
      keyList.value = res.data.data
    }
    const res = await staffDeviceConfig(props.device.id)
    if (res && res.data && res.data.data) {
      apply(res.data.data)
    }
  } finally {
    loading.value = false
  }
}

function apply(dto) {
  const secretKeys = new Set(keyList.value.filter(meta => meta.secret).map(meta => meta.key))
  const itemMap = {}
  const draftMap = {}
  for (const item of dto.itemList || []) {
    itemMap[item.key] = item
    draftMap[item.key] = secretKeys.has(item.key) ? '' : (item.value || '')
  }
  items.value = itemMap
  drafts.value = draftMap
}

// 要提交的修改：{key: 新值 | null}。普通项清空 = null（删掉这一项）；密钥只能改：填了就是新值，空着不动
function changes() {
  const values = {}
  for (const meta of keyList.value) {
    if (!items.value[meta.key]) {
      continue
    }
    const raw = drafts.value[meta.key]
    const cur = (raw == null ? '' : String(raw)).trim()
    if (meta.secret) {
      if (cur !== '') {
        values[meta.key] = cur
      }
    } else if (cur !== (items.value[meta.key].value || '')) {
      values[meta.key] = cur === '' ? null : cur
    }
  }
  return values
}

function save() {
  if (saving.value) {
    return
  }
  const values = changes()
  if (Object.keys(values).length === 0) {
    notifyTopWarning(t('staff_device.config.notify.no_change'))
    return
  }
  saving.value = true
  staffDeviceConfigUpdate(props.device.id, values).then(res => {
    saving.value = false
    if (!res || !res.data || !res.data.data) {
      return
    }
    apply(res.data.data)
    notifyTopPositive(t('staff_device.config.notify.save_success'))
    emit('saved')
  })
}

// 配置项的 i18n 键：upstream.base-url -> staff_device.config.key.upstream_base_url；没翻译的新 key 直接显示 key
function keyI18n(meta, field) {
  return `staff_device.config.key.${meta.key.replace(/[.-]/g, '_')}.${field}`
}

function keyLabel(meta) {
  return te(keyI18n(meta, 'label')) ? t(keyI18n(meta, 'label')) : meta.key
}

function keyHint(meta) {
  return te(keyI18n(meta, 'hint')) ? t(keyI18n(meta, 'hint')) : ''
}

function groupLabel(id) {
  const k = `staff_device.config.group.${id}`
  return te(k) ? t(k) : id
}

// 开关项的当前显示：输入框里的值（'true' / 'false'），没设（空串）按后端给的默认值
function toggleValue(meta) {
  const raw = drafts.value[meta.key]
  const cur = raw === '' || raw == null ? (meta.defaultValue || 'false') : String(raw)
  return cur === 'true'
}

// 数字项用 mask 只放数字进来（宽松，不管范围，范围由后端校验）：范围带小数的（概率）是 #.##，整数的（毫秒）按上限的位数
function inputMask(meta) {
  if (meta.type !== 'NUMBER') {
    return undefined
  }
  return `${meta.min}${meta.max}`.includes('.') ? '#.##' : '#'.repeat(String(meta.max).length)
}

// 灰字：普通项给示例，数字项后面再带上范围；密钥只说设没设
function placeholder(meta, item) {
  const hint = te(keyI18n(meta, 'hint')) ? t(keyI18n(meta, 'hint')) : ''
  if (meta.secret) {
    return item.value === null ? t('staff_device.config.ph.secret_set') : (hint || t('staff_device.config.ph.secret_unset'))
  }
  if (meta.type === 'NUMBER') {
    return t('staff_device.config.ph.number', {hint, min: meta.min, max: meta.max})
  }
  return hint
}
</script>

<style scoped lang="scss">

.device-config-columns {
  gap: 2rem;
  max-height: 65vh;
  overflow-y: auto;
  padding-right: .5rem;
}

.device-config-grid {
  flex: 1 1 auto;
  min-width: 26rem;
  display: grid;
  grid-template-columns: max-content minmax(16rem, 1fr);
  gap: 1rem 1.2rem;
  align-items: center;
}

/* 组名横跨标签列与输入列 */
.device-config-group {
  grid-column: 1 / -1;
  font-weight: 600;
  opacity: .7;
  font-size: .9rem;
  margin-top: .4rem;
  border-bottom: 1px solid rgba(0, 0, 0, .08);
  padding-bottom: .2rem;
}

</style>
