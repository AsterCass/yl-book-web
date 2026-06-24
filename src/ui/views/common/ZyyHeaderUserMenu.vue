<template>
  <div ref="userToolTipRef">
    <q-menu class="userToolTipFrame shadow-1" no-parent-event self="center middle"
            :offset="[20, 200]"
            v-model="showTooltip"
            @pointerenter="handleMouseEnter"
            @pointerleave="handleMouseLeave"
            transition-show="scale"
            transition-hide="scale"
            transition-duration="300"
    >
      <div class="row justify-center">
        <q-avatar size="8rem">
          <q-img :src="userInfo.userAvatar"/>
        </q-avatar>
      </div>

      <div class="row justify-center items-center q-mt-sm">
        <div class="row justify-center text-center items-center" style="font-size:.95rem;">
          {{ userInfo.userNickname }}
        </div>
      </div>

      <div class="q-mt-sm row justify-center">
        <q-badge class="q-mx-xs" style="font-size: 11px; padding: 3px 6px;"
                 :color="GenderOptEnum.fromCode(userInfo.userGender).color"
                 :label="GenderOptEnum.fromCode(userInfo.userGender).name">
        </q-badge>
        <q-badge color="grey-10" v-for="(role, index) in userInfo.userRoleList" :key="index" class="q-mx-xs"
                 style="font-size: 11px; padding: 3px 6px;"
                 :label="role.name ? role.name : '神秘角色'">
        </q-badge>
      </div>

      <div class="row q-mx-sm q-mt-lg q-mb-sm">
        <q-btn no-caps unelevated class="shadow-2 component-full-btn-full"
               @click="emitter.emit('showUserSettingEvent')">
          <div class="q-mx-xs">
            {{ $t('main_user_detail_detail') }}
          </div>
        </q-btn>
      </div>
      <div class="row q-ma-sm">
        <q-btn no-caps unelevated class="shadow-2 component-full-btn-error-full"
               @click="logoutMethod">
          <div class="q-mx-xs">
            {{ $t('main_logout') }}
          </div>
        </q-btn>
      </div>


    </q-menu>
  </div>

</template>

<script setup>

import {onBeforeUnmount, onMounted, ref, watch} from "vue";
import {delay} from "@/utils/base-tools";
import {backToLogin} from "@/router";
import {useRouter} from "vue-router";
import {notifyTopPositive} from "@/utils/notification-tools";
import {useI18n} from "vue-i18n";
import {userLogout} from "@/api/myu";
import {deleteCookie} from "@/utils/common.js";
import {GenderOptEnum} from "@/constants/enums/common.js";
import {useGlobalStateStore} from "@/utils/global-state.js";
import emitter from "@/utils/bus";


const thisRouter = useRouter()
const {t} = useI18n()
const globalState = useGlobalStateStore();

const userInfo = ref({})
const userToolTipRef = ref(null)
const showTooltip = ref(false)
let parentElement = null;
const prepareToHide = ref(false)
const prepareToShow = ref(false)

watch(() => globalState.userData, () => {
  reloadData()
})

function reloadData() {
  userInfo.value = {
    userId: globalState.userData ? globalState.userData.id : "",
    userMotto: globalState.userData ? globalState.userData.motto : "",
    userAvatar: '/favicon.svg',
    userNickname: globalState.userData ? globalState.userData.nickName : "",
    userGender: globalState.userData ? globalState.userData.gender : 0,
    userRoleList: globalState.userData ? globalState.userData.roleDtoList : [],
  }
}

const handleMouseEnter = () => {
  prepareToShow.value = true;
  prepareToHide.value = false;
  delay(100).then(() => {
    if (prepareToShow.value) {
      showTooltip.value = true;
      prepareToHide.value = false;
      prepareToShow.value = false;
    }
  })
};

const handleMouseLeave = () => {
  prepareToShow.value = false;
  prepareToHide.value = true;
  delay(750).then(() => {
    if (prepareToHide.value) {
      showTooltip.value = false;
      prepareToHide.value = false;
      prepareToShow.value = false;
    }
  })
};

function logoutMethod() {
  userLogout().then(res => {
    if (!res || !res.data) {
      return
    }
    deleteCookie()
    globalState.updateUserData(null)
    notifyTopPositive(t('main_login_success_logout'))
    backToLogin(thisRouter)
  })
}


onMounted(() => {
  parentElement = userToolTipRef.value.parentElement;
  if (parentElement) {
    parentElement.addEventListener('mouseenter', handleMouseEnter);
    parentElement.addEventListener('mouseleave', handleMouseLeave);
  }
  reloadData()
});


onBeforeUnmount(() => {
  if (parentElement) {
    parentElement.removeEventListener('mouseenter', handleMouseEnter);
    parentElement.removeEventListener('mouseleave', handleMouseLeave);
  }
});


</script>

<style lang="scss">

.userToolTipFrame {
  width: 15rem;

  color: rgb(var(--text-color)) !important;
  border-radius: 8px;
  background-color: rgb(var(--container-background-color)) !important;
  backdrop-filter: blur(30px);
  padding: 15px 10px !important;
}

</style>