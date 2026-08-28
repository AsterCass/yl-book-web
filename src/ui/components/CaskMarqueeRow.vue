<template>
  <div ref="viewportRef" class="cask-marquee"
       :class="enabled ? 'cask-marquee-natural' : 'cask-marquee-plain'">
    <div class="cask-marquee-track" :class="{ 'cask-marquee-running': running }"
         :style="running ? { animationDuration: `${cycleSeconds}s` } : null">
      <div ref="contentRef" class="cask-marquee-item"><slot/></div>
      <!-- 运行时再复制一份接在后面：位移 -50% 恰好等于「一份内容 + 分隔留白」的宽度，首尾相接无缝循环 -->
      <div v-if="running" class="cask-marquee-item" aria-hidden="true"><slot/></div>
    </div>
  </div>
</template>

<script setup>
import {computed, onBeforeUnmount, onMounted, ref, watch} from "vue";

/**
 * 一行内容放不下时横向<b>匀速连续</b>循环滚动（不停顿、不回弹）；放得下则完全静止。
 *
 * enabled=false 时退化为普通可压缩 flex 行，子元素各自的省略号照常生效（不测量、不动画）。
 * enabled=true 时子元素按自然宽度排布、不再省略——要么整行放得下，要么滚动，两种都能看全，
 * 所以这一模式下不需要省略号。也正因如此才能可靠测量：省略号模式下子元素自行裁剪，
 * 父元素 scrollWidth 量不出真实溢出。
 */
const props = defineProps({
  enabled: {type: Boolean, default: true},
  /** 滚动速度（像素/秒） */
  speed: {type: Number, default: 36},
})

// 复制份之间的留白，须与样式里 .cask-marquee-item 的 padding-right 一致
const SEPARATOR_PX = 32

const viewportRef = ref(null)
const contentRef = ref(null)
const overflowPx = ref(0)

const running = computed(() => props.enabled && overflowPx.value > 1)
// 匀速连续滚动，不设停顿：一轮位移正好是一整份 item（内容 + 分隔留白），
// 走完时第二份恰好落在第一份的起点上，回到 0% 视觉上无跳变，看起来就是一直在转。
// offsetWidth 已含 padding，不要再加一次；这里不取整、也不设时长下限——
// 任何对时长的“修正”都会让实际速度偏离 speed，短内容会显得忽快忽慢
const cycleSeconds = computed(() => {
  const distance = contentRef.value ? contentRef.value.offsetWidth : 0
  return Math.max(0.1, distance / Math.max(props.speed, 1))
})

let observer = null

function measure() {
  if (!props.enabled) {
    overflowPx.value = 0
    return
  }
  const viewport = viewportRef.value
  const content = contentRef.value
  if (!viewport || !content) {
    return
  }
  // content 处于 max-content 宽度，offsetWidth = 内容 + 分隔留白；判断「放不放得下」只看内容本身，
  // 否则内容明明放得下、只因末尾那 32px 留白就误判成溢出而空转。
  // running 与否都不改变这两个量，故不会出现「一滚动就改变测量结果」的反馈抖动
  overflowPx.value = Math.max(0, content.offsetWidth - SEPARATOR_PX - viewport.clientWidth)
}

onMounted(() => {
  measure()
  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(measure)
    if (viewportRef.value) observer.observe(viewportRef.value)
    if (contentRef.value) observer.observe(contentRef.value)
  }
})

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})

watch(() => props.enabled, measure)
</script>

<style scoped lang="scss">
.cask-marquee {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
}

.cask-marquee-track {
  display: flex;
  align-items: center;
}

.cask-marquee-item {
  display: flex;
  align-items: center;
  gap: .3rem;
}

// 滚动模式：内容按自然宽度铺开，压缩与省略号一律让位给滚动
.cask-marquee-natural {
  // 关键：轨道必须自己撑到「两份 item」的宽度。
  // 轨道是块级元素，不写 width 时它只有容器（可视区）那么宽，两份 item 只是溢出在外；
  // 而 translateX(-50%) 的百分比是按**元素自身宽度**算的——那样一轮只走半个可视区宽度就跳回，
  // 看起来就是「滚一点点然后重置」。撑成 max-content 后，-50% 恰好等于一整份 item，首尾才对得上。
  .cask-marquee-track {
    width: max-content;
  }

  .cask-marquee-item {
    flex: 0 0 auto;
    width: max-content;
    // 复制份之间的留白，宽度须与 SEPARATOR_PX 一致
    padding-right: 32px;
  }

  // 注意：插槽子元素若自带 flex-shrink / ellipsis，需由**使用方**在自己的作用域里覆盖成
  // 自然宽度（见 ZyyBookCalendar 的 .cal-event-title :deep(.cask-marquee-natural) 规则）。
  // 本组件不越权去改插槽内容的样式——使用方的选择器往往嵌套更深、特异性更高，
  // 在这里写覆盖既容易被压过，也只能靠 !important 硬拼。
}

// 静止模式：还原成普通可压缩 flex 行，子元素自带的 ellipsis 继续生效
.cask-marquee-plain {
  .cask-marquee-track {
    flex: 1 1 auto;
    min-width: 0;
  }

  .cask-marquee-item {
    flex: 1 1 auto;
    min-width: 0;
  }
}

.cask-marquee-running {
  animation-name: cask-marquee-scroll;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

// 匀速直连，无停顿、无回弹：配合 linear 与「复制一份 + 位移 -50%」，每轮首尾严丝合缝
@keyframes cask-marquee-scroll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

// 用户要求减少动效时不滚动：退回静态裁剪（悬停卡片仍可看全）
@media (prefers-reduced-motion: reduce) {
  .cask-marquee-running {
    animation: none;
  }
}
</style>
