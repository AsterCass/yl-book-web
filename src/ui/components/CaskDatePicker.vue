<template>
  <div>
    <q-input v-model="pickDate" tabindex="0" dense outlined
             :class="inputClass" :placeholder="placeholder"
             no-error-icon mask="####-##-##" @update:modelValue="updateUiInput"
    >
      <template v-slot:append>
        <q-icon name="fa-regular fa-calendar" size="1rem" class="cursor-pointer">
          <!-- z-index 抬到 6001：压过同为 6000 的遮罩（遮罩需要盖住对话框内容） -->
          <q-popup-proxy cover transition-show="scale" transition-hide="scale"
                         style="background-color:transparent; border:0; padding:1rem;
                                   box-shadow: none; backdrop-filter: none; z-index: 6001"
                         @show="inPicking = true"
                         @hide="inPicking = false; saveDate()"
          >
            <div>
              <div class="row">
                <q-date class="q-mx-sm" v-model="dateUiInput" mask="YYYY-MM-DD"
                        @update:modelValue="syncFromPicker">
                </q-date>
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
import CaskPickerMask from "@/ui/components/CaskPickerMask.vue";
import {date} from "quasar";

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
    default: '1970-01-01'
  },
  inputClass: {
    type: String,
    required: false,
    default: 'component-outline-input-mini'
  }
})

const pickDate = ref(props.modelValue)
// 选择器是否展开：展开期间挂遮罩，禁止直接操作其他组件
const inPicking = ref(false)

watch(() => props.modelValue, () => {
  pickDate.value = props.modelValue
  syncUiFromInput()
})

let dateUiInput = ref("")

// 选择器取值始终跟随输入框；输入框为空时不预选日期，日历停留在当月
function syncUiFromInput() {
  dateUiInput.value = pickDate.value && pickDate.value.length >= 10 ? pickDate.value : ""
}

function updateUiInput() {
  if (pickDate.value && pickDate.value.length >= 10) {
    const thisDate = date.extractDate(pickDate.value, 'YYYY-MM-DD')
    //这里的thisDate不一定对，需要自动矫正
    pickDate.value = date.formatDate(thisDate, 'YYYY-MM-DD')
  }
  syncUiFromInput()
  emit('update:modelValue', pickDate.value);
}

// 点选日期即刻回存，不再依赖关闭选择器这一步，避免关闭过程中数据来不及回写。
// q-date 已按 mask 输出 YYYY-MM-DD，直接使用，不再经 new Date() 中转（那会按 UTC 解析而差一天）
function syncFromPicker(val) {
  dateUiInput.value = val
  if (!val || val === pickDate.value) {
    return
  }
  pickDate.value = val
  emit('update:modelValue', val);
}

// 关闭选择器时兜底回存一次
function saveDate() {
  if (dateUiInput.value && dateUiInput.value !== pickDate.value) {
    pickDate.value = dateUiInput.value
    emit('update:modelValue', dateUiInput.value);
  }
}

onMounted(() => {
  updateUiInput()
})

</script>

<style lang="scss">
@import "@/styles/independence-components";
@import "@/styles/override-components";


</style>
