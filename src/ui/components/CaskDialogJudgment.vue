<template>
  <div>
    <q-dialog :model-value="showDialogJudgment" @hide="closeDialogJudgment"
              :persistent="loading"
              transition-show="fade" transition-hide="fade">
      <q-card class="component-cask-dialog-judgement-std">

        <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
          {{ dialogJudgmentData.title }}
        </h5>

        <q-separator class="component-separator-base" inset spaced="1rem"/>

        <div class="q-mx-lg q-mt-lg q-mb-xs">

          <div class="text-center">
            {{ dialogJudgmentData.content }}
          </div>

          <div class="row q-mt-xl q-mb-md justify-center">
            <div class="q-mx-md">

              <q-btn no-caps unelevated class=" shadow-1 component-outline-btn-grow"
                     :disable="loading"
                     @click="callbackMethod(false)" :label="dialogJudgmentData.falseLabel"/>

            </div>
            <div class="q-mx-md">
              <q-btn no-caps unelevated class=" shadow-1 component-full-btn-grow"
                     :loading="loading" :disable="loading"
                     @click="callbackMethod(true)" :label="dialogJudgmentData.trueLabel"/>
            </div>
          </div>


        </div>

      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import {defineEmits, defineProps, ref, watch} from "vue";

const emit = defineEmits(['update:modelValue']);
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  },
  dialogJudgmentData: {
    type: Object,
    required: true,
    default: () => {
      return {title: "", content: "", falseLabel: "", trueLabel: ""}
    },
  },
  callbackMethod: {
    type: Function,
    required: true,
  },
  /**
   * 执行中：确认键转圈、两个按钮锁住、弹窗改为 persistent（点外部/ESC 关不掉）。
   * 调用方在 callbackMethod 里置 true，请求收尾时置 false 并关闭弹窗——
   * 不传则维持原行为（回调里立刻关窗），既有调用点不受影响。
   */
  loading: {
    type: Boolean,
    required: false,
    default: false
  },
})

let showDialogJudgment = ref(props.modelValue);
watch(() => props.modelValue, () => {
  if (props.modelValue) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.body.style.overflow = 'hidden';
  }
  showDialogJudgment.value = props.modelValue
})

function closeDialogJudgment() {
  document.body.style.overflow = 'auto';
  document.body.style.paddingRight = '';
  showDialogJudgment.value = false
  emit('update:modelValue', false);
}


</script>


<style lang="scss">
@import "@/styles/independence-components";


</style>