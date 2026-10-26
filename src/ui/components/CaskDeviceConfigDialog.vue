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
      <!-- 表单按后端白名单生成：名称在左（悬停看配置项 key），输入框在右。留空 = 不设置（一体机用本地配置），灰字是示例；
           密钥只能改不能看：留空不动，填了就是新值 -->
      <div v-else class="q-ma-md device-config-grid">
        <template v-for="meta in keyList" :key="meta.key">
          <template v-if="items[meta.key]">
            <h6 style="white-space: nowrap; margin-left: 12px!important;">
              {{ keyLabel(meta) }}&nbsp;:
              <q-tooltip>{{ meta.key }}</q-tooltip>
            </h6>
            <q-input v-model="drafts[meta.key]" class="component-outline-input-grow" dense outlined clearable
                     :type="meta.secret ? 'password' : 'text'" :autocomplete="meta.secret ? 'new-password' : 'off'"
                     :maxlength="meta.maxLength" :placeholder="placeholder(meta, items[meta.key])"/>
          </template>
        </template>
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
import {defineEmits, defineProps, ref, watch} from "vue";
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

// 白名单元数据：[{key, type, secret, desc, maxLength}]，取一次后缓存
const keyList = ref([])
// key -> {key, value}（后端 itemList 按 key 展开）；密钥的 value：设了为 null，没设为空串
const items = ref({})
// key -> 输入框里的值；密钥的输入框一开始总是空的
const drafts = ref({})
const loading = ref(false)
const saving = ref(false)

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

// 灰字：普通项给示例；密钥只说设没设
function placeholder(meta, item) {
  const hint = te(keyI18n(meta, 'hint')) ? t(keyI18n(meta, 'hint')) : ''
  if (meta.secret) {
    return item.value === null ? t('staff_device.config.ph.secret_set') : (hint || t('staff_device.config.ph.secret_unset'))
  }
  return hint
}
</script>

<style scoped lang="scss">

.device-config-grid {
  display: grid;
  grid-template-columns: max-content minmax(26rem, 1fr);
  gap: 1rem 1.2rem;
  align-items: center;
  max-height: 60vh;
  overflow-y: auto;
  padding-right: .5rem;
}

</style>
