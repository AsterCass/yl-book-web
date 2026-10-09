<template>
  <q-header class="top-semi-trans-header-base-mini">

    <div class="top-semi-trans-header-base-content row justify-between items-center top-semi-trans-header-base-no-top">

      <div class="row items-center justify-start col">
        <q-btn no-caps unelevated class="component-none-btn-grow q-mx-xs"
               @click="upOneLevel">
          <div class="row items-center">
            <div class="q-ma-xs">
              {{ $t('main_header_back_pre') }}
            </div>
          </div>
        </q-btn>

        <zyy-header-todo/>
        <zyy-header-memo/>

        <!-- 系统文档：新标签页打开系统使用文档（地址取 VITE_SYSTEM_DOC_URL，未配置则不显示）。样式同左侧备忘入口 -->
        <q-btn v-if="SYSTEM_DOC_URL" no-caps unelevated class="component-outline-btn-mini-grow q-ml-md"
               :href="SYSTEM_DOC_URL" target="_blank" rel="noopener noreferrer">
          <div class="row items-center no-wrap">
            <q-icon class="q-mr-xs" name="fa-regular fa-file-lines" size=".9rem"/>
            {{ $t('main_header_system_doc') }}
          </div>
        </q-btn>
      </div>

      <div class="row items-center justify-center " style="font-size: 1.15rem; font-weight: 500">
        {{ $t(thisRouter.currentRoute.value.meta.header)}}
      </div>

      <div class="row items-center justify-end col">

        <zyy-header-tenant-store/>

        <q-btn round style="margin: 0 1.5rem 0 1.5rem" color="transparent" size="11px" flat
               @click="emitter.emit('showUserSettingEvent')">
          <q-avatar size="33px">
            <q-img src="/favicon.svg"/>
          </q-avatar>
          <zyy-header-user-menu/>
        </q-btn>

        <q-btn no-caps unelevated class="component-none-btn-grow q-mx-xs" @click="switchLanguage()">
          <div class="row items-center q-ma-xs">
            <q-icon name="fa-solid fa-language" size="1.75rem"/>
          </div>
        </q-btn>

        <q-btn no-caps unelevated class="q-mx-xs" dense round @click="notifyTopWarning($t('in_develop'))">
          <div class="row items-center q-ma-xs">
            <q-icon name="fa-solid fa-gear" size="1.25rem"/>
          </div>
        </q-btn>


      </div>
    </div>


  </q-header>
</template>

<script setup>

import {onMounted} from "vue";
import {backToLogin, toParentPage} from "@/router/index.js";
import {useRouter} from "vue-router";
import {notifyTopWarning} from "@/utils/notification-tools.js";
import {useGlobalStateStore} from "@/utils/global-state.js";
import {i18n} from "@/i18n/index.js";
import {switchLanguage} from "@/utils/global-tools.js";
import ZyyHeaderUserMenu from "@/ui/views/common/ZyyHeaderUserMenu.vue";
import ZyyHeaderTenantStore from "@/ui/views/common/ZyyHeaderTenantStore.vue";
import ZyyHeaderTodo from "@/ui/views/common/ZyyHeaderTodo.vue";
import ZyyHeaderMemo from "@/ui/views/common/ZyyHeaderMemo.vue";
import emitter from "@/utils/bus.js";
import {userIsLogin} from "@/api/myu.js";

const t = i18n.global.t
const thisRouter = useRouter()
const globalState = useGlobalStateStore();

// 系统使用文档地址（如 https://xxx.com/manual.pdf），构建时注入；为空则顶栏不显示「系统文档」按钮
const SYSTEM_DOC_URL = (import.meta.env.VITE_SYSTEM_DOC_URL || '').trim()

function upOneLevel() {
  toParentPage(thisRouter)
}

function checkLogin() {
  // const isLogin = checkLoginFromCookie()
  // if (!isLogin) {
  //   backToLogin(thisRouter)
  // }
  userIsLogin().then(res => {
    if (!res || !res.data || !res.data.data) {
      backToLogin(thisRouter)
    }
  })
}

onMounted(() => {
  checkLogin()
})


</script>


<style scoped lang="scss">


.top-semi-trans-header-base-mini {
  background-color: transparent;
  left: 0;
  right: 0;
  margin: 1rem 4rem;
  min-height: 4rem;
  position: fixed;

  .top-semi-trans-header-base-content {
    min-height: 4rem;
    padding: 0 1rem;
    border-radius: 8px;
    transition: background-color 1s ease, box-shadow 1s ease;
  }
}

.top-semi-trans-header-base-no-top {
  color: rgb(var(--text-color));
  background-color: rgb(var(--container-background-color));
  box-shadow: inset 0 0 1px 1px rgb(var(--background-color));
  backdrop-filter: saturate(200%) blur(30px);
}


</style>


<style lang="scss">


.top-semi-trans-header-base-mini {
  .q-btn {
    font-size: 1rem;
  }
}
</style>