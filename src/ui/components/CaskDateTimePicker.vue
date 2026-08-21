<template>
  <div>
    <q-input v-model="pickDatetime" tabindex="0" dense outlined
             :class="inputClass" :placeholder="placeholder"
             no-error-icon mask="####-##-## ##:##" @update:modelValue="updateUiInput"
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
                <q-date class="q-mx-sm" v-model="dateUiInput" mask="YYYY-MM-DD"
                        @update:modelValue="syncDateFromPicker"/>
                <cask-time v-model="timeUiInput" @update:modelValue="syncTimeFromPicker"/>
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

// 输入框为空时时间部分的起始值：需求约定统一为 00:00
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
    default: '1970-01-01 00:00'
  },
  inputClass: {
    type: String,
    required: false,
    default: 'component-outline-input-std'
  }
})

const pickDatetime = ref(props.modelValue)
const dateUiInput = ref("")
const timeUiInput = ref(DEFAULT_TIME)
// 选择器是否展开：展开期间挂遮罩，禁止直接操作其他组件
const inPicking = ref(false)

watch(() => props.modelValue, () => {
  pickDatetime.value = props.modelValue
  syncUiFromInput()
})

// 选择器取值始终跟随输入框：输入框为空时日期不预选（日历停留在当月）、时间回落到 00:00
function syncUiFromInput() {
  if (pickDatetime.value && pickDatetime.value.length >= 16) {
    dateUiInput.value = pickDatetime.value.substring(0, 10)
    timeUiInput.value = pickDatetime.value.substring(11, 16)
    return
  }
  dateUiInput.value = ""
  timeUiInput.value = DEFAULT_TIME
}

function updateUiInput() {
  if (pickDatetime.value && pickDatetime.value.length >= 16) {
    const thisDate = date.extractDate(pickDatetime.value, 'YYYY-MM-DD HH:mm')
    //这里的thisDate不一定对，需要自动矫正
    pickDatetime.value = date.formatDate(thisDate, 'YYYY-MM-DD HH:mm')
  }
  syncUiFromInput()
  emit("update:modelValue", pickDatetime.value)
}

// 选择器上的每次改动都即刻回存，不再依赖关闭选择器这一步，
// 避免关闭过程中数据来不及回写；日期未选时无法拼出完整值，等选完日期再回存
function syncDateFromPicker(val) {
  dateUiInput.value = val
  emitPicked()
}

function syncTimeFromPicker(val) {
  timeUiInput.value = val
  emitPicked()
}

function emitPicked() {
  if (!dateUiInput.value || !timeUiInput.value) {
    return
  }
  const datetimeStr = dateUiInput.value + " " + timeUiInput.value
  if (datetimeStr !== pickDatetime.value) {
    pickDatetime.value = datetimeStr
    emit("update:modelValue", datetimeStr)
  }
}

// 关闭选择器时兜底回存一次
function saveTime() {
  emitPicked()
}

onMounted(() => {
  updateUiInput()
})

</script>

<style lang="scss">
@import "@/styles/independence-components";
@import "@/styles/override-components";


</style>
