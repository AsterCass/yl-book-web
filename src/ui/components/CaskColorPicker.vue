<template>
  <div>
    <!-- 触发区就是色块本身（Pickr 以 useAsButton 挂在它上面，不生成自己那个圆按钮）：
         底衬棋盘格，半透明颜色也看得出实际深浅 -->
    <div ref="swatchRef" class="cask-color-picker"
         :class="{ 'cask-color-picker-disabled': disabled }"
         :style="{ width, height }">
      <div class="cask-color-picker-fill" :style="{ background: modelValue || placeholderColor }"/>
    </div>

    <!-- 展开期间铺满视口：挡住其它色块与页面按钮，逼着走「保存」收尾（复用日期选择器那套遮罩）。
         pass-release：Pickr 的滑块/调色区靠 document 上的 mouseup 结束拖拽，
         被遮罩吞掉的话在面板外松手就停不下来 -->
    <cask-picker-mask :model-value="opening" pass-release/>
  </div>
</template>

<script setup>
import {defineEmits, defineProps, onBeforeUnmount, onMounted, watch, ref} from "vue";
import {useI18n} from "vue-i18n";
import Pickr from '@simonwep/pickr'
import '@simonwep/pickr/dist/themes/nano.min.css'
import CaskPickerMask from "@/ui/components/CaskPickerMask.vue";

const {t} = useI18n()

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  // 当前颜色（CSS 颜色串）。空串 = 未设置：色块显示 placeholderColor，「未设置」的含义由使用方定义
  modelValue: {type: String, required: false, default: ''},
  // 未设置时色块显示、且打开取色器时预选的颜色（通常是使用方的默认色）
  placeholderColor: {type: String, required: false, default: 'rgb(128, 128, 128)'},
  disabled: {type: Boolean, required: false, default: false},
  width: {type: String, required: false, default: '3rem'},
  height: {type: String, required: false, default: '1.4rem'},
})

const swatchRef = ref(null)
// 面板是否展开：驱动遮罩
const opening = ref(false)
let pickr = null
// 真正的关闭动作（Pickr 自带的 hide 被换掉了，见 onMounted）
let closePanel = null
// 自己刚发出去的值：props 回流时据此判重，别把用户正在拖的选择又 setColor 回去
let lastEmitted = null
// 正在往 Pickr 里回灌值：期间来的事件一律忽略（setColor 是同步的，这个标记可靠）
let syncing = false

// Pickr 的 HSVaColor -> 与日历配色同款的 rgba() 串（整数通道 + 两位小数透明度）。
// 不用它自带的 toString()：那个的 alpha 用的是未取整原值，会写出 0.5137254901960784 这种
function toRgba(color) {
  if (!color) {
    return ''
  }
  const [r, g, b, a] = color.toRGBA()
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${Number(a.toFixed(2))})`
}

// change（拖动中）与 save（comparison:false 下每次落定都会发）共用；判重后才发
function onPickrColor(color) {
  if (syncing) {
    return
  }
  const next = toRgba(color)
  if (next === props.modelValue) {
    return
  }
  lastEmitted = next
  emit('update:modelValue', next)
}

function syncPickr(value) {
  if (!pickr) {
    return
  }
  syncing = true
  pickr.setColor(value || props.placeholderColor, true)
  syncing = false
}

watch(() => props.modelValue, (val) => {
  if (val === lastEmitted) {
    return
  }
  syncPickr(val)
})

watch(() => props.disabled, (val) => {
  if (!pickr) {
    return
  }
  if (val) {
    pickr.disable()
  } else {
    pickr.enable()
  }
})

onMounted(() => {
  pickr = Pickr.create({
    el: swatchRef.value,
    // 触发器用我们自己的色块；弹层挂到 body，不受弹窗内滚动容器裁剪
    useAsButton: true,
    container: document.body,
    theme: 'nano',
    // 样式覆写靠这个类圈定作用域，见下方全局样式块
    appClass: 'cask-pickr-app',
    // 拖动即生效，颜色实时回传
    comparison: false,
    default: props.modelValue || props.placeholderColor,
    defaultRepresentation: 'RGBA',
    position: 'bottom-middle',
    disabled: props.disabled,
    components: {
      palette: true,
      preview: true,
      opacity: true,
      hue: true,
      // 只留「保存」：色值输入框与 HEX/RGBA 切换对非技术用户只是困惑，不给
      interaction: {save: true},
    },
    i18n: {'btn:save': t('color_picker.save')},
  })
  pickr.on('change', onPickrColor)
  pickr.on('save', onPickrColor)
  // 展开后只允许「保存」关闭：把 Pickr 自带的 hide 换成空操作，
  // 点面板外 / Esc / 滚动一律关不掉（配色本来就是实时生效的，这个按钮本质就是「收工」）
  closePanel = pickr.hide.bind(pickr)
  pickr.hide = () => pickr
  pickr.on('show', () => {
    opening.value = true
  })
  pickr.getRoot().interaction.save.addEventListener('click', () => {
    closePanel()
    opening.value = false
  })
})

onBeforeUnmount(() => {
  if (!pickr) {
    return
  }
  // useAsButton 下 _root.root 是游离节点、被移除的只有 body 上的 .pcr-app，
  // 我们自己的色块由 Vue 管，不会被它摘走
  pickr.destroyAndRemove()
  pickr = null
  closePanel = null
  opening.value = false
})
</script>

<style scoped lang="scss">

.cask-color-picker {
  position: relative;
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
  border: 2px solid rgb(var(--full-container-background-color));
  // 棋盘格底：半透明颜色也能看出实际深浅
  background-image:
      linear-gradient(45deg, rgba(128, 128, 128, .35) 25%, transparent 25%),
      linear-gradient(-45deg, rgba(128, 128, 128, .35) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, rgba(128, 128, 128, .35) 75%),
      linear-gradient(-45deg, transparent 75%, rgba(128, 128, 128, .35) 75%);
  background-size: 8px 8px;
  background-position: 0 0, 0 4px, 4px -4px, -4px 0;

  &:hover {
    filter: brightness(1.08);
  }

  &.cask-color-picker-disabled {
    cursor: not-allowed;
    opacity: .5;
  }

  .cask-color-picker-fill {
    position: absolute;
    inset: 0;
  }
}

</style>

<!-- Pickr 的弹层挂在 body 上，scoped 够不着，只能写全局；靠 appClass 圈定作用域，
     不会波及别处可能用到的 Pickr。目标：按钮/输入框与项目的 component-outline-* / component-full-* 同款 -->
<style lang="scss">

.pcr-app.cask-pickr-app {
  // 描边色：与项目输入框/按钮同一根主题色
  --cask-pcr-frame: rgb(var(--full-container-background-color));

  // nano 主题内部尺寸全是 em，基准字号是整体缩放的总开关（默认继承 body 的 14px，偏挤）
  font-size: 1rem;
  width: 20em;
  // 只补一点上边距：nano 主题内部各块自带左右内边距，面板再加会双重留白
  padding:  0;
  border-radius: 6px;
  font-family: inherit;
  color: rgb(var(--text-color));
  // 面板必须不透明：取色器叠在同样半透明的弹窗上会互相透，颜色就看不准了
  background: rgb(var(--background-color));
  box-shadow: inset 0 0 0 1px rgba(128, 128, 128, .3), 0 6px 22px rgba(0, 0, 0, .28);

  // 调色区加高，方便精细取色
  .pcr-selection {
    height: 15em;
    padding: 0.75rem;
  }

  .pcr-interaction {
    padding: 0 .85em .85em;

    // 只剩「保存」一个按钮：满宽实心，同项目 component-full-btn 的样子
    .pcr-save {
      flex: 1 1 100%;
      color: rgb(var(--full-container-text-color)) !important;
      background: var(--cask-pcr-frame);
      border: 2px solid var(--cask-pcr-frame) !important;
      border-radius: 4px;
      font-size: .8em;
      letter-spacing: 0;
      padding: .55em .6em;
      margin-top: .1rem !important;
      cursor: pointer;
      transition: filter .15s ease;

      &:hover {
        filter: brightness(1.12);
      }

      // Pickr 默认的聚焦光环是蓝色双层描边，与项目不搭
      &:focus,
      &.pcr-active {
        box-shadow: none;
      }
    }
  }

  // 取色圈：外描一圈页面底色，浅底深底都看得见
  .pcr-selection .pcr-picker {
    border-color: rgb(var(--background-color));
    box-shadow: 0 0 0 1px rgba(0, 0, 0, .45);
  }

  .pcr-selection .pcr-color-preview .pcr-current-color {
    box-shadow: 0 0 0 1px rgba(128, 128, 128, .5);
  }
}

</style>
