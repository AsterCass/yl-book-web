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
        <q-badge class="q-mx-xs" style="font-size: 11px; padding: 2px 6px 3px 6px;"
                 :color="GenderOptEnum.fromCode(userInfo.userGender).color"
                 :label="GenderOptEnum.fromCode(userInfo.userGender).name">
        </q-badge>
        <q-badge v-for="(role, index) in userInfo.userRoleList" :key="index" class="q-mx-xs"
                 style="font-size: 11px; padding: 2px 6px 3px 6px;"
                 :label="role.name ? role.name : '神秘角色'">
        </q-badge>
      </div>

      <div class="row q-mx-sm q-mt-lg q-mb-sm">
        <q-btn no-caps unelevated class="shadow-2 component-full-btn-full"
               @click="toSpecifyPageWithQuery(
                  thisRouter, 'space', {id: userInfo.userId})">
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

import {defineProps, onBeforeUnmount, onMounted, ref} from "vue";
import {delay} from "@/utils/base-tools";
import {backToLogin, toSpecifyPageWithQuery} from "@/router";
import {useRouter} from "vue-router";
import {notifyTopPositive} from "@/utils/notification-tools";
import {useI18n} from "vue-i18n";
import {userLogout} from "@/api/user";
import {deleteCookie} from "@/utils/common.js";
import {GenderOptEnum} from "@/constants/enums/common.js";
import {useGlobalStateStore} from "@/utils/global-state.js";

const props = defineProps({
  userInfo: {
    type: Object,
    required: false,
    default: () => {
      return {
        userId: "",
        userMotto: "",
        userAvatar: "",
        userNickname: "",
        userGender: 0,
        userRoleList: []
      };
    },
  },
})

const thisRouter = useRouter()
const {t} = useI18n()
const globalState = useGlobalStateStore();

const userToolTipRef = ref(null)
const showTooltip = ref(false)
let parentElement = null;
const prepareToHide = ref(false)
const prepareToShow = ref(false)


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