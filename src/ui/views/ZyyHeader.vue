<template>
  <q-header class="top-semi-trans-header-base-mini">

    <div class="top-semi-trans-header-base-content row justify-between items-center top-semi-trans-header-base-no-top">

      <div class="row items-center justify-start col-3">
        <q-btn no-caps unelevated class="component-none-btn-grow q-mx-xs" @click="switchLanguage()">
          <div class="row items-center q-ma-xs">
            <q-icon name="fa-solid fa-language" size="1.75rem"/>
          </div>
        </q-btn>
      </div>

      <div class="row items-center justify-center col-6" style="font-size: 1.15rem; font-weight: 500">
        {{ $t(thisRouter.currentRoute.value.meta.header)}}
      </div>

      <div class="row items-center justify-end col-3">
        <q-btn no-caps unelevated class="shadow-2 component-full-btn-mini-grow" @click="logoutMethod">
          <div class="row items-center">
            <div class="q-mx-xs">
              {{ $t('main_logout') }}
            </div>
          </div>
        </q-btn>


      </div>
    </div>


  </q-header>
</template>

<script setup>

import {onMounted} from "vue";
import {checkLoginFromCookie} from "@/utils/common.js";
import {backToLogin} from "@/router/index.js";
import {useRouter} from "vue-router";
import {userLogout} from "@/api/user.js";
import {notifyTopPositive} from "@/utils/notification-tools.js";
import {useGlobalStateStore} from "@/utils/global-state.js";
import {i18n} from "@/i18n/index.js";
import {switchLanguage} from "@/utils/global-tools.js";

const t = i18n.global.t
const thisRouter = useRouter()
const globalState = useGlobalStateStore();

function checkLogin() {
  const isLogin = checkLoginFromCookie()
  if (!isLogin) {
    backToLogin(thisRouter)
  }
}

function logoutMethod() {
  userLogout().then(res => {
    if (!res || !res.data) {
      return
    }
    globalState.updateToken(null)
    notifyTopPositive(t('main_login_success_logout'))
    backToLogin(thisRouter)
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