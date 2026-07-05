<template>
  <div class="row items-center no-wrap q-ml-sm">

    <q-btn v-if="todos.length > 0" round flat dense size="11px" :style="`color: rgb(var(--negative))`"
           class="cask-todo-blink" icon="fa-solid fa-bell">
      <q-badge floating rounded :style="`background-color: rgb(var(--negative))`" :label="todos.length"
               style="font-size: .85rem;"/>
      <q-menu anchor="bottom left" self="top left" :offset="[25, 25]"
              transition-show="jump-down" transition-hide="jump-up"
              class="component-extra-card-std">
        <q-list style="min-width: 18rem; max-width: 26rem">
          <q-item v-for="(todo, index) in todos" :key="index" class="column items-start q-py-sm">
            <div class="row items-center no-wrap full-width q-mb-xs">
              <q-badge class="q-mr-sm" :style="{ backgroundColor: levelColor(todo.level) }"
                       :label="levelName(todo.level)" style="font-size: 0.85rem; padding: 3px 6px;"/>
              <div style="font-weight: 600;">{{ todo.title }}</div>
            </div>
            <div style="font-size: .8rem; opacity: .7; white-space: normal;">
              {{ todo.content }}
            </div>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>

    <div v-else class="row items-center q-mx-sm" style="font-size: .85rem;">
      <q-icon class="q-mr-xs" name="fa-regular fa-bell"/>
      {{ $t('main_header_todo.empty') }}
    </div>

  </div>
</template>

<script setup>

import {onMounted, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {todoList} from "@/api/admin.js";
import {TodoLevelEnum} from "@/constants/enums/common.js";
import {useGlobalStateStore} from "@/utils/global-state.js";

const {t} = useI18n()
const globalState = useGlobalStateStore()

const todos = ref([])

function levelName(level) {
  const levelEnum = TodoLevelEnum.fromCode(level)
  return levelEnum ? t('main_header_todo.level.' + level) : ''
}

function levelColor(level) {
  const levelEnum = TodoLevelEnum.fromCode(level)
  return levelEnum ? levelEnum.color : 'rgb(120, 120, 120)'
}

function loadTodo() {
  todoList().then(res => {
    if (!res || !res.data || !res.data.data) {
      todos.value = []
      return
    }
    todos.value = res.data.data
  })
}

// 切换租户/门店后待办范围变化，重新拉取（租户级/门店级待办依赖当前上下文）
watch(() => [
  globalState.userData ? globalState.userData.tenantId : null,
  globalState.userData ? globalState.userData.storeId : null,
], () => {
  loadTodo()
})

onMounted(() => {
  loadTodo()
})

</script>

<style scoped lang="scss">

.cask-todo-blink {
  animation: cask-todo-blink-anim 1s ease-in-out infinite;
}

@keyframes cask-todo-blink-anim {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: .35;
    transform: scale(.85);
  }
}

</style>
