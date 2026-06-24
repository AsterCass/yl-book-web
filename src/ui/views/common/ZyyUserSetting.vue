<template>
  <div>
    <q-dialog :model-value="showUserSetting" @hide="showUserSetting = false"
              transition-show="fade" transition-hide="fade">
      <q-card class="component-cask-dialog-judgement-std row" style="max-width: 2000px !important">
        <cask-tabs-vertical :tabs="tabs" v-model="tab" width="12rem" text-width="10rem"
                            force-text-color="rgb(var(--text-color))"/>
        <div class="col row" style="min-height: 35rem;">
          <q-separator class="component-separator-base q-mx-lg" vertical/>
          <q-tab-panels v-model="tab" animated class="bg-transparent col" transition-duration="500"
                        transition-prev="jump-down" transition-next="jump-up">
            <q-tab-panel name="base" style="min-width: 30rem; padding: 1rem 0 1rem 0">


              <div class="column full-height">
                <div class="row">
                  <div class="col">
                    <h6>
                      {{ $t('main_space_setting_account_mail') }}
                    </h6>
                    <div>
                      {{ userSettingData.mail }}
                    </div>
                    <h6 style="margin-top: 1rem !important">
                      {{ $t('main_space_setting_account_nickname') }}
                    </h6>
                    <q-input v-model="userSettingData.nickName" tabindex="0" dense outlined
                             class="component-outline-input-mini-grow q-mr-xl" style="opacity: .92">
                    </q-input>
                    <h6 style="margin-top: 1rem !important">
                      {{ $t('main_space_setting_account_gender') }}
                    </h6>
                    <q-select outlined clearable class="component-outline-input-mini-grow q-mr-xl" style="opacity: .92"
                              dropdown-icon="fa-solid fa-caret-down"
                              popup-content-class="component-extra-card-std shadow-0"
                              clear-icon="fa-solid fa-xmark"
                              menu-anchor="bottom start" :menu-offset="[0, 5]"
                              v-model="userSettingData.genderObj" :options="genderOptions">
                    </q-select>
                    <h6 style="margin-top: 1rem !important">
                      {{ $t('main_space_setting_account_birth') }}
                    </h6>
                    <cask-date-picker class="q-mr-xl" v-model="userSettingData.birth" style="opacity: .92"/>


                  </div>

                  <div style="width: 200px;" class="column items-center justify-center">
                    <div class="relative-position" style="width: 140px; height: 140px">
                      <q-avatar size="120px" style=" position: absolute; left: 5px; top: 5px">
                        <q-img src="/favicon.svg"/>
                      </q-avatar>
                    </div>
                    <q-btn no-caps unelevated push class="component-full-btn-mini-mini-grow shadow-2 q-mt-sm"
                           style="font-size: 0.75rem !important" @click="notifyTopWarning($t('in_develop'))">
                      {{ $t('main_space_setting_account_avatar_change') }}
                    </q-btn>
                    <div style="font-size: 0.7rem; opacity: .75;" class="q-mt-sm text-center">
                      {{ $t('main_space_setting_account_avatar_tips') }}
                    </div>
                  </div>

                </div>
                <h6 style="margin-top: 1rem !important">
                  {{ $t('main_space_setting_account_motto') }}
                </h6>
                <cask-long-text-input-simple v-model:value="userSettingData.motto"
                                             input-height="5rem"/>


                <div class="col column justify-end">
                  <div class="row justify-evenly">
                    <q-btn no-caps unelevated class="component-full-btn-mini-grow shadow-2"
                           @click="saveUserData">
                      <div class="row items-center">
                        <div class="q-mx-sm">
                          {{ $t('main_setting_save') }}
                        </div>
                      </div>
                    </q-btn>
                    <q-btn no-caps unelevated class="component-full-btn-mini-grow shadow-2"
                           @click="showUserSetting = false">
                      {{ $t('main_setting_cancel') }}
                    </q-btn>
                  </div>
                </div>
              </div>
            </q-tab-panel>
            <q-tab-panel name="pro" style="min-width: 30rem; padding: 0">
              <div class="row justify-center items-center full-height">
                {{ $t('in_develop') }}
              </div>
            </q-tab-panel>
            <q-tab-panel name="passwd" style="min-width: 30rem; padding: 1rem 0 1rem 0">
              <div class="column full-height">
                <h6>
                  原密码：
                </h6>
                <q-input v-model="userPasswdData.origin" tabindex="0" dense outlined
                         :type="userPasswdData.show ? 'text' : 'password'"
                         class="q-mr-xl component-outline-input-grow-on-semi-trans">
                  <template v-slot:prepend>
                    <div class="row items-center justify-between">
                      <q-icon class="q-mr-sm" name="fa-solid fa-unlock-keyhole" size="1rem"/>
                    </div>
                  </template>
                </q-input>
                <h6 style="margin-top: 1rem !important">
                  新密码：
                </h6>
                <q-input v-model="userPasswdData.new" tabindex="0" dense outlined
                         :type="userPasswdData.show ? 'text' : 'password'"
                         class="q-mr-xl component-outline-input-grow-on-semi-trans">
                  <template v-slot:prepend>
                    <div class="row items-center justify-between">
                      <q-icon class="q-mr-sm" name="fa-solid fa-unlock-keyhole" size="1rem"/>
                    </div>
                  </template>
                </q-input>
                <h6 style="margin-top: 1rem !important">
                  重复密码：
                </h6>
                <q-input v-model="userPasswdData.repeat" tabindex="0" dense outlined
                         :type="userPasswdData.show ? 'text' : 'password'"
                         class="q-mr-xl component-outline-input-grow-on-semi-trans">
                  <template v-slot:prepend>
                    <div class="row items-center justify-between">
                      <q-icon class="q-mr-sm" name="fa-solid fa-unlock-keyhole" size="1rem"/>
                    </div>
                  </template>
                </q-input>
                <div class="q-ml-xs" style="width: 28rem; margin-top: 1rem; opacity: .5; font-size: .75rem">
                  {{ $t('main_login_passwd_tips') }}
                </div>

                <div v-if="userPasswdData.show" class="q-ml-xs cask-jump-link-in-text" style="margin-top: 1rem;"
                     @click="userPasswdData.show = false">
                  {{ $t('main_register_hide_passwd') }}
                </div>
                <div v-else class="q-ml-xs cask-jump-link-in-text" style="margin-top: 1rem; "
                     @click="userPasswdData.show = true">
                  {{ $t('main_register_show_passwd') }}
                </div>


                <div class="col column justify-end">
                  <div class="row justify-evenly">
                    <q-btn no-caps unelevated class="component-full-btn-mini-grow shadow-2"
                           @click="saveNewPasswd">
                      <div class="row items-center">
                        <div class="q-mx-sm">
                          {{ $t('main_setting_save') }}
                        </div>
                      </div>
                    </q-btn>
                    <q-btn no-caps unelevated class="component-full-btn-mini-grow shadow-2"
                           @click="showUserSetting = false">
                      {{ $t('main_setting_cancel') }}
                    </q-btn>
                  </div>
                </div>
              </div>
            </q-tab-panel>
            <q-tab-panel name="sec" style="min-width: 30rem; padding: 0">
              <div class="row justify-center items-center full-height">
                {{ $t('in_develop') }}
              </div>
            </q-tab-panel>
            <q-tab-panel name="account" style="min-width: 30rem; padding: 0">
              <div class="row justify-center items-center full-height">
                {{ $t('in_develop') }}
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>

import {useGlobalStateStore} from "@/utils/global-state";
import {useI18n} from "vue-i18n";
import {onMounted, ref, watch} from "vue";
import CaskTabsVertical from "@/ui/components/CaskTabsVertical.vue";
import CaskDatePicker from "@/ui/components/CaskDatePicker.vue";
import CaskLongTextInputSimple from "@/ui/components/CaskLongTextInputSimple.vue";
import {notifyTopPositive, notifyTopWarning} from "@/utils/notification-tools";
import {GenderOptEnum} from "@/constants/enums/common.js";
import emitter from "@/utils/bus";
import {mDetail, mUpdate} from "@/api/myu.js";

const {t} = useI18n()
const globalState = useGlobalStateStore();

const showUserSetting = ref(false);
// data
const genderOptions = ref(GenderOptEnum.toSelectForm())
const userSettingData = ref({
  nickName: "",
  gender: 0,
  genderObj: {},
  birth: "",
  motto: "",
})
const userPasswdData = ref({
  origin: "",
  new: "",
  repeat: "",
  show: false,
})

watch(() => globalState.userData, () => {
  reloadData();
})

watch(() => showUserSetting.value, () => {
  reloadData()
})

const tabs = ref([
  {
    value: 'base',
    label: 'main_space_setting_profile',
    color: 'rgb(var(--full-container-background-color))'
  },
  {
    value: 'pro',
    label: 'main_space_setting_developer',
    color: 'rgb(var(--full-container-background-color))'
  },
  {
    value: 'passwd',
    label: 'main_space_setting_passwd',
    color: 'rgb(var(--full-container-background-color))'
  },
  {
    value: 'sec',
    label: 'main_space_setting_privacy',
    color: 'rgb(var(--full-container-background-color))'
  },
  {
    value: 'stretch',
    isStretch: true,
  },
  {
    value: 'account',
    label: 'main_space_setting_account',
    color: 'rgb(var(--full-container-background-color))'
  },
])
const tab = ref("base");

function saveUserData() {
  const updateUserData = {
    nickName: userSettingData.value.nickName,
    gender: userSettingData.value.genderObj ? userSettingData.value.genderObj.value : 0,
    birth: userSettingData.value.birth,
    motto: userSettingData.value.motto,
  }

  mUpdate(updateUserData).then(res => {
    if (!res || !res.data) {
      return
    }
    notifyTopPositive(t('main_space_setting_account_data_suc'))
    showUserSetting.value = false
    mDetail().then(res => {
      if (!res || !res.data || !res.data.data) {
        return
      }
      globalState.updateUserData(res.data.data)
      reloadData()
    })
  })
}

function saveNewPasswd() {

}

function reloadData() {
  // base
  if (globalState.userData && globalState.userData.id) {
    userSettingData.value = JSON.parse(JSON.stringify(globalState.userData))
    userSettingData.value.genderObj = GenderOptEnum.fromCodeToSelectFrom(globalState.userData.gender)
    if (!userSettingData.value.motto) {
      userSettingData.value.motto = ""
    }
  }
  // passwd
  userPasswdData.value = {
    origin: "",
    new: "",
    repeat: "",
    show: false,
  }
}

onMounted(() => {
  reloadData()
  emitter.on("showUserSettingEvent", () => {
    showUserSetting.value = true
  })
})

</script>

<style scoped lang="scss">


</style>