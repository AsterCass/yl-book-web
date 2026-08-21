<template>
  <div class="component-cask-time q-mx-sm">
    <div class="component-cask-time-header flex flex-center no-wrap">
      <div class="component-cask-time-header-label row items-center no-wrap">
        <div>
          {{ hourInputStr }}
        </div>
        <div class="q-mx-xs">
          :
        </div>
        <div>
          {{ minuteInputStr }}
        </div>
      </div>
    </div>
    <div class="component-cask-time-main col column" tabindex="-1">
      <div class="col relative-position">
        <div class="component-cask-time-view">

          <div class="row justify-between">
            <h5>
              {{ $t('cask_time_hour') }}
            </h5>
            <h5 class="component-cask-time-selected text-center">
              {{ hourInputStr }}
            </h5>
          </div>

          <q-slider v-model="hourInput" :min="0" :max="23" @update:modelValue="syncHourStr" marker-labels>
            <template v-slot:marker-label-group="{ markerList }">
              <div
                  v-for="val in [0, 12, 23]"
                  :key="val"
                  class="cursor-pointer"
                  :class="markerList[val].classes"
                  :style="markerList[val].style"
                  @click="()=>{
                    hourInput = val
                    syncHourStr(val)
                  }"
              >{{ val }}
              </div>
            </template>
          </q-slider>

          <q-separator class="component-separator-base" spaced="1.5rem"/>

          <div class="row justify-between">
            <h5>
              {{ $t('cask_time_minute') }}
            </h5>
            <h5 class="component-cask-time-selected text-center">
              {{ minuteInputStr }}
            </h5>
          </div>

          <q-slider v-model="minuteInput" :min="0" :max="59" @update:modelValue="syncMinuteStr" marker-labels>
            <template v-slot:marker-label-group="{ markerList }">
              <div
                  v-for="val in [0, 30, 59]"
                  :key="val"
                  class="cursor-pointer"
                  :class="markerList[val].classes"
                  :style="markerList[val].style"
                  @click="()=>{
                    minuteInput = val
                    syncMinuteStr(val)
                  }"
              >{{ val }}
              </div>
            </template>
          </q-slider>


        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import {defineEmits, defineProps, ref, watch} from "vue";

const emit = defineEmits(['update:modelValue']);
const props = defineProps({
  modelValue: {
    type: String,
    required: false,
    default: ''
  },
})

// 传入值为空（或不是 HH:mm）时统一按 00:00 起步，避免出现「--:--」这种
// 拖动一个滑条也凑不出完整时间、因而永远不回存的中间态
function parseTime(val) {
  const colonIndex = typeof val === 'string' ? val.indexOf(":") : -1
  if (colonIndex === -1) {
    return {hour: 0, minute: 0}
  }
  const hour = Number(val.substring(0, colonIndex))
  const minute = Number(val.substring(colonIndex + 1))
  return {
    hour: Number.isFinite(hour) ? Math.min(Math.max(hour, 0), 23) : 0,
    minute: Number.isFinite(minute) ? Math.min(Math.max(minute, 0), 59) : 0,
  }
}

const initTime = parseTime(props.modelValue)

const hourInput = ref(initTime.hour)
const hourInputStr = ref(String(initTime.hour).padStart(2, '0'))
const minuteInput = ref(initTime.minute)
const minuteInputStr = ref(String(initTime.minute).padStart(2, '0'))

// 外部改值（如切换到另一条记录、输入框里手输时间）时同步滑条，
// 只改本地状态不回抛，不会和下面的 emit 形成回环
watch(() => props.modelValue, (val) => {
  const thisTime = parseTime(val)
  hourInput.value = thisTime.hour
  hourInputStr.value = String(thisTime.hour).padStart(2, '0')
  minuteInput.value = thisTime.minute
  minuteInputStr.value = String(thisTime.minute).padStart(2, '0')
})

const syncHourStr = ((hour) => {
  hourInputStr.value = String(hour).padStart(2, '0')
  emit('update:modelValue', hourInputStr.value + ":" + minuteInputStr.value);
})

const syncMinuteStr = ((minute) => {
  minuteInputStr.value = String(minute).padStart(2, '0')
  emit('update:modelValue', hourInputStr.value + ":" + minuteInputStr.value);
})

</script>

<style lang="scss">
@import "@/styles/independence-components";

</style>