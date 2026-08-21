<template>
  <div>
    <q-input v-model="pickTime" tabindex="0" dense outlined
             class="component-outline-input-mini" :placeholder="placeholder"
             no-error-icon mask="time" @update:modelValue="updateUiInput"
    >
      <template v-slot:append>
        <q-icon name="fa-regular fa-clock" size="1.1rem" class="cursor-pointer">
          <!-- z-index 抬到 6001：压过同为 6000 的遮罩（遮罩需要盖住对话框内容） -->
          <q-popup-proxy cover transition-show="scale" transition-hide="scale"
                         style="background-color:transparent; border:0; padding:1rem;
                                   box-shadow: none; backdrop-filter: none; z-index: 6001"
                         @show="inPicking = true"
                         @hide="inPicking = false; saveTime()"
          >
            <div>
              <div class="row">
                <cask-time v-model="timeUiInput" @update:modelValue="syncFromPicker"/>
              </div>
            </div>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>

    <cask-picker-mask :model-value="inPicking"/>
  </div>

</template>

<script setup>
import {defineEmits, defineProps, onMounted, ref, watch} from "vue";
import CaskTime from "@/ui/components/CaskTime.vue";
import CaskPickerMask from "@/ui/components/CaskPickerMask.vue";
import {date} from "quasar";

// 输入框为空时选择器起始值：需求约定统一为 00:00
const DEFAULT_TIME = "00:00"

const emit = defineEmits(['update:modelValue']);
const props = defineProps({
  modelValue: {
    type: String,
    required: true,
    default: ''
  },
  placeholder: {
    type: String,
    required: false,
    default: '00:00'
  },
})

const pickTime = ref(props.modelValue)
const timeUiInput = ref(DEFAULT_TIME)
// 选择器是否展开：展开期间挂遮罩，禁止直接操作其他组件
const inPicking = ref(false)

watch(() => props.modelValue, () => {
  pickTime.value = props.modelValue
  syncUiFromInput()
})

// 选择器取值始终跟随输入框；输入框为空/不完整时回落到 00:00
function syncUiFromInput() {
  timeUiInput.value = pickTime.value && pickTime.value.length >= 5 ? pickTime.value : DEFAULT_TIME
}

function updateUiInput() {
  if (pickTime.value && pickTime.value.length >= 5) {
    const thisDate = date.extractDate(pickTime.value, 'HH:mm')
    //这里的thisDate不一定对，需要自动矫正
    pickTime.value = date.formatDate(thisDate, 'HH:mm')
  }
  syncUiFromInput()
  // 直接回抛输入框内容：清空输入框即清空取值，不能回抛选择器里的旧值
  emit("update:modelValue", pickTime.value)
}

// 拖动滑条即刻回存，不再依赖关闭选择器这一步，避免关闭过程中数据来不及回写
function syncFromPicker(val) {
  timeUiInput.value = val
  pickTime.value = val
  emit("update:modelValue", val)
}

// 关闭选择器时兜底回存一次
function saveTime() {
  if (timeUiInput.value && timeUiInput.value !== pickTime.value) {
    pickTime.value = timeUiInput.value
    emit("update:modelValue", timeUiInput.value)
  }
}

onMounted(() => {
  updateUiInput()
})

</script>

<style lang="scss">
@import "@/styles/independence-components";


</style>
