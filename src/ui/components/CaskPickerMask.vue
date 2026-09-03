<template>
  <!-- 选择器遮罩：日期/时间选择器弹出期间铺满视口，把所有指针事件挡在选择器之外。
       点击其他区域时事件只落在遮罩上，Quasar 的「点击浮层外部」逻辑照常关闭选择器并回存数据，
       被点击的组件不会同时被触发，用户需要在选择器关闭后再点一次 -->
  <teleport to="body">
    <div v-if="modelValue" class="component-cask-picker-mask"
         @mousedown.stop.prevent @touchstart.stop.prevent
         @mouseup="onRelease" @click.stop.prevent @contextmenu.stop.prevent/>
  </teleport>
</template>

<script setup>
import {defineProps} from "vue";

const props = defineProps({
  // 遮罩显隐：由选择器的 q-popup-proxy @show / @hide 驱动，
  // @hide 在关闭动画结束后才触发，因此同一次点击的 mouseup / click 也会被遮罩吞掉
  modelValue: {
    type: Boolean,
    required: false,
    default: false
  },
  // 是否放行「松开」（mouseup）。默认吞掉；但拖拽型选择器（如 Pickr 取色器）是在
  // document 上监听 mouseup 来结束拖拽的，吞掉会让它在遮罩上松手后一直以为还在拖，
  // 这类场景要传 true。click 仍然拦着，底下的组件不会被误触发
  passRelease: {
    type: Boolean,
    required: false,
    default: false
  }
})

function onRelease(e) {
  if (props.passRelease) {
    return
  }
  e.stopPropagation()
  e.preventDefault()
}

</script>

<style lang="scss">
@import "@/styles/independence-components";


</style>
