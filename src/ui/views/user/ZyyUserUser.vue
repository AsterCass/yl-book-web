<template>
  <div class="full-width">
    <div class="row items-center">

      <div class="q-ml-md">
        <h6>
          {{ $t('user_user.label.id') }}&nbsp;:
        </h6>
      </div>
      <q-input v-model="selectId" class="q-ma-md component-outline-input-std" dense outlined
               :placeholder="t('user_user.placeholder.id')"
               tabindex="0">
      </q-input>

      <div class="q-ml-md">
        <h6>
          {{ $t('user_user.label.nick') }}&nbsp;:
        </h6>
      </div>
      <q-input v-model="nickName" class="q-ma-md component-outline-input-std" dense outlined
               :placeholder="t('user_user.placeholder.nick')"
               tabindex="0">
      </q-input>

      <div class="q-ml-md">
        <h6>
          {{ $t('user_user.label.mail') }}&nbsp;:
        </h6>
      </div>
      <q-input v-model="mail" class="q-ma-md component-outline-input-std" dense outlined
               :placeholder="t('user_user.placeholder.mail')"
               tabindex="0">
      </q-input>

      <div class="q-ml-md">
        <h6>
          {{ $t('user_user.label.phone') }}&nbsp;:
        </h6>
      </div>
      <q-input v-model="phone" class="q-ma-md component-outline-input-std" dense outlined
               :placeholder="t('user_user.placeholder.phone')"
               tabindex="0">
      </q-input>

      <div class="q-ml-md">
        <h6>
          {{ $t('user_user.label.status') }}&nbsp;:
        </h6>
      </div>
      <q-select v-model="selectStatus" :menu-offset="[0, 5]" :options="statusOptions"
                class="q-ma-md component-outline-input-grow"
                clear-icon="fa-solid fa-xmark"
                clearable
                dropdown-icon="fa-solid fa-caret-down" menu-anchor="bottom start"
                outlined popup-content-class="component-extra-card-std">
      </q-select>

    </div>

    <div class="row">
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push unelevated @click="selectData()">
        {{ $t('user_user.button.query') }}
      </q-btn>
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push
             unelevated
             @click="clearUpsertParam(); isNew = true; showUpsert = true">
        {{ $t('user_user.button.add') }}
      </q-btn>
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push
             unelevated @click="()=> {clearSearch(); selectData();}">
        {{ $t('user_user.button.clear') }}
      </q-btn>
    </div>

    <cask-complex-table :custom-table-operation="tableUserOperation" :table-base-info="tableUser"
                        :table-data="tableData"
                        :table-dynamic-data="tableDynamicData"
                        class="full-width"
                        style="padding: 2rem 5rem 0 0.5rem"
                        @operationClick="(name, row) => {
                            if(name === 'update') {
                              clearUpsertParam();
                              updateId = row.id
                              upsertNickName = row.nickName
                              upsertGender = GenderOptEnum.fromCodeToSelectFrom(row.gender)
                              upsertPhone = row.phone
                              upsertMail = row.mail
                              upsertBirth = row.birth
                              isNew = false;
                              showUpsert = true
                            }
                            if (name === 'updateRole') {
                              updateId = row.id
                              clearUserRole()
                              for(const role of  row.simpleRoleList) {
                                if (role in userRoleMap) {
                                  userRoleMap[role] = true
                                }
                              }
                              showUserRole = true
                            }
                            if(name === 'delete') {
                              toOpId = row.id
                              toOpTitle = $t('user_user.dialog.delete.title')
                              toOpDesc = $t('user_user.dialog.delete.content', { name: row.nickName })
                              toOpFunc = deleteData
                              showOperation = true
                            }
                            if (name === 'disable') {
                              toOpId = row.id
                              toOpTitle = $t('user_user.dialog.disable.title')
                              toOpDesc = $t('user_user.dialog.disable.content', { name: row.nickName })
                              toOpFunc = disableData
                              showOperation = true
                            }
                            if (name === 'enable') {
                              toOpId = row.id
                              toOpTitle = $t('user_user.dialog.enable.title')
                              toOpDesc = $t('user_user.dialog.enable.content', { name: row.nickName })
                              toOpFunc = enableData
                              showOperation = true
                            }
                            if (name === 'unlock') {
                              toOpId = row.id
                              toOpTitle = $t('user_user.dialog.unlock.title')
                              toOpDesc = $t('user_user.dialog.unlock.content', { name: row.nickName })
                              toOpFunc = unlockData
                              showOperation = true
                            }
                          }"
                        @toNewPage="(pageObj) => {
                            tableDynamicData.pageNo = pageObj.pageNo
                            tableDynamicData.pageSize = pageObj.pageSize
                            selectData(true)
                          }"
    />

    <q-dialog :model-value="showUpsert" transition-hide="fade" no-backdrop-dismiss no-shake
              transition-show="fade" @hide="showUpsert = false">
      <q-card class="component-cask-dialog-judgement-std" style="max-width: 2000px !important">
        <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
          {{ isNew ? $t('user_user.upsert.title_add') : $t('user_user.upsert.title_update') }}
        </h5>

        <div class="q-mx-sm" style="opacity: 0.5; width: 25rem; font-size: 0.85rem">
          <div v-if="isNew">
            {{ $t('user_user.upsert.default_password_note') }}
          </div>
        </div>

        <q-separator class="component-separator-base" inset spaced="1rem"/>

        <div style="padding-top: .1rem">

        </div>

        <div class="q-ma-md"
             style="display: grid; grid-template-columns: max-content 1fr; gap: 1.2rem; align-items: center;">

          <h6 class="cask-litter-title-asterisk" style="white-space: nowrap;">{{ $t('user_user.upsert.field.nick') }}&nbsp;:</h6>
          <q-input v-model="upsertNickName" class="component-outline-input-grow" dense outlined
                   :placeholder="t('user_user.placeholder.nick')"/>

          <h6 class="cask-litter-title-asterisk" style="white-space: nowrap;">{{ $t('user_user.upsert.field.mail') }}&nbsp;:</h6>
          <q-input v-model="upsertMail" class="component-outline-input-grow" dense outlined
                   :placeholder="t('user_user.placeholder.mail')"/>

          <h6 style="white-space: nowrap; margin-left: 12px!important;">{{
              $t('user_user.upsert.field.phone')
            }}&nbsp;:</h6>
          <q-input v-model="upsertPhone" class="component-outline-input-grow" dense outlined
                   :placeholder="t('user_user.placeholder.phone')"/>

          <h6 style="white-space: nowrap; margin-left: 12px!important;">{{
              $t('user_user.upsert.field.gender')
            }}&nbsp;:</h6>
          <q-select outlined clearable class="component-outline-input-grow"
                    dropdown-icon="fa-solid fa-caret-down"
                    popup-content-class="component-extra-card-std"
                    clear-icon="fa-solid fa-xmark"
                    menu-anchor="bottom start" :menu-offset="[0, 5]"
                    v-model="upsertGender" :options="genderOptions">
          </q-select>

          <h6 style="white-space: nowrap; margin-left: 12px!important;">{{
              $t('user_user.upsert.field.birth')
            }}&nbsp;:</h6>
          <cask-date-picker v-model="upsertBirth"/>


        </div>

        <div class="row q-mt-xl q-mb-md justify-evenly">
          <q-btn class="shadow-1 component-full-btn-grow" no-caps unelevated @click="upsertData">
            {{ isNew ? $t('user_user.upsert.save_add') : $t('user_user.upsert.save_update') }}
          </q-btn>

          <q-btn class="shadow-1 component-outline-btn-grow" no-caps unelevated @click="showUpsert = false">
            {{ $t('main_setting_cancel') }}
          </q-btn>

        </div>
      </q-card>
    </q-dialog>

    <q-dialog :model-value="showUserRole" @hide="showUserRole = false"
              transition-show="fade" transition-hide="fade">
      <q-card class="component-cask-dialog-judgement-std" style="max-width: 2000px !important">
        <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
          {{ $t('user_user.role_assign.title') }}
        </h5>

        <q-separator class="component-separator-base" inset spaced="1rem"/>

        <div class="row q-px-sm" style="padding-top: .1rem; width: 25rem">
          <div v-for="roleItem in allRoleList" :key="roleItem.id">
            <q-checkbox class="q-ma-xs" color="grey-10" size="37px" v-model="userRoleMap[roleItem.id]"
                        :label="roleItem.name"/>
          </div>

        </div>

        <div class="row q-mt-xl q-mb-md justify-center">
          <q-btn no-caps unelevated class="shadow-1 component-full-btn-grow" @click="updateUserRole">
            {{ $t('user_user.button.save') }}
          </q-btn>
        </div>
      </q-card>
    </q-dialog>


    <cask-dialog-judgment v-model="showOperation"
                          :callback-method="isTrue => { showOperation = false; if (isTrue) toOpFunc() }"
                          :dialog-judgment-data="{ title: toOpTitle, content: toOpDesc, falseLabel: $t('user_user.dialog.common.cancel'), trueLabel: $t('user_user.dialog.common.confirm') }"
    />

  </div>
</template>

<script setup>
import {CommonStatusEnum, GenderOptEnum} from "@/constants/enums/common.js";
import {onMounted, reactive, ref} from "vue";
import {notifyTopPositive, notifyTopWarning} from "@/utils/notification-tools.js";
import {useI18n} from 'vue-i18n'
import CaskComplexTable from "@/ui/components/CaskComplexTable.vue";
import CaskDialogJudgment from "@/ui/components/CaskDialogJudgment.vue";
import {tableUser, tableUserOperation} from "@/tables/user.js";
import {
  userCreate,
  userDelete,
  userList,
  userUpdate,
  userUpdateDisable,
  userUpdateLock,
  userUpdateRole
} from "@/api/user.js";
import CaskDatePicker from "@/ui/components/CaskDatePicker.vue";
import {roleListSimple} from "@/api/role.js";


const selectId = ref("")
const nickName = ref("")
const phone = ref("")
const mail = ref("")
const selectStatus = ref(null)
const statusOptions = ref(CommonStatusEnum.toSelectForm())
const genderOptions = ref(GenderOptEnum.toSelectForm())
const {t} = useI18n()

function clearSearch() {
  selectId.value = ""
  nickName.value = ""
  phone.value = ""
  mail.value = ""
  selectStatus.value = null
}

// create/update
const showUpsert = ref(false)
const isNew = ref(false)
const upsertNickName = ref("")
const upsertMail = ref("")
const upsertPhone = ref("")
const upsertGender = ref(null)
const upsertBirth = ref("")

const updateId = ref("")

function clearUpsertParam() {
  upsertNickName.value = ""
  upsertMail.value = ""
  upsertPhone.value = ""
  upsertGender.value = null
  upsertBirth.value = ""
}

// assign role
const showUserRole = ref(false)
const allRoleList = ref([])
const userRoleMap = reactive({})

// op
const showOperation = ref(false)
const toOpId = ref("")
const toOpTitle = ref("")
const toOpDesc = ref("")
const toOpFunc = ref(null)

const tableData = ref([])
const tableDynamicData = ref(
    {
      inLoading: true,
      pageNo: 1,
      pageSize: 10,
      dataSum: 0,
    }
)

function upsertData() {
  if (!upsertNickName.value || !upsertMail.value) {
    notifyTopWarning(t('validation.insufficient_parameters'))
    return;
  }

  if (!updateId.value && !isNew.value) {
    notifyTopWarning(t('validation.insufficient_parameters'))
    return;
  }

  const body = {
    mail: upsertMail.value,
    nickName: upsertNickName.value,
    phone: upsertPhone.value,
    gender: upsertGender.value ? upsertGender.value.value : null,
    birth: upsertBirth.value ? upsertBirth.value : null,
  }

  if (isNew.value) {
    userCreate(body).then(res => {
      if (!res || !res.data) {
        return
      }
      clearUpsertParam()
      showUpsert.value = false
      selectData(true)
    })
  } else {
    userUpdate(updateId.value, body).then(res => {
      if (!res || !res.data) {
        return
      }
      clearUpsertParam()
      showUpsert.value = false
      notifyTopPositive(t('user_user.notify.update_success'))
      selectData(true)
    })
  }
}

function clearUserRole() {
  for (const key in userRoleMap) {
    userRoleMap[key] = false
  }
}

function updateUserRole() {
  if (!updateId.value) {
    notifyTopWarning(t('validation.insufficient_parameters'))
    return;
  }

  const body = {
    roleIdList: []
  }

  for (const key in userRoleMap) {
    if (userRoleMap[key]) {
      body.roleIdList.push(key)
    }
  }

  userUpdateRole(updateId.value, body).then(res => {
    if (!res || !res.data) {
      return
    }
    showUserRole.value = false
    notifyTopPositive(t('user_user.notify.role_assign_success'))
    selectData(true)
  })

}

function enableData() {
  if (!toOpId.value) {
    notifyTopWarning(t('validation.insufficient_parameters'))
  }
  userUpdateDisable(toOpId.value, {isDisable: false}).then(res => {
    if (!res || !res.data) {
      return
    }
    notifyTopPositive(t('user_user.notify.enable_success'))
    selectData(true)
  })
}

function disableData() {
  if (!toOpId.value) {
    notifyTopWarning(t('validation.insufficient_parameters'))
  }
  userUpdateDisable(toOpId.value, {isDisable: true}).then(res => {
    if (!res || !res.data) {
      return
    }
    notifyTopPositive(t('user_user.notify.disable_success'))
    selectData(true)
  })
}

function unlockData() {
  if (!toOpId.value) {
    notifyTopWarning(t('validation.insufficient_parameters'))
  }
  userUpdateLock(toOpId.value, {isLock: false}).then(res => {
    if (!res || !res.data) {
      return
    }
    notifyTopPositive(t('user_user.notify.unlock_success'))
    selectData(true)
  })
}

function deleteData() {
  if (!toOpId.value) {
    notifyTopWarning(t('validation.insufficient_parameters'))
  }
  userDelete(toOpId.value).then(res => {
    if (!res || !res.data) {
      return
    }
    notifyTopPositive(t('notify.delete_success'))
    selectData(true)
  })
}

// 默认从第一页开始查询；翻页、行操作后刷新时传 keepPage = true 保持当前页
function selectData(keepPage = false) {
  if (!keepPage) {
    tableDynamicData.value.pageNo = 1
  }
  tableDynamicData.value.inLoading = true
  const param = {
    id: selectId.value, nickName: nickName.value, phone: phone.value, mail: mail.value,
    status: selectStatus.value ? selectStatus.value.value : null,
    pageNo: tableDynamicData.value.pageNo, pageSize: tableDynamicData.value.pageSize,
  }

  userList(param).then(res => {
    if (!res || !res.data || !res.data.data) {
      tableDynamicData.value.inLoading = false
      return
    }
    const thisData = res.data.data.records
    tableDynamicData.value.dataSum = res.data.data.total
    thisData.forEach(data => {
      const statusEnum = CommonStatusEnum.fromCode(data.status)
      const genderEnum = GenderOptEnum.fromCode(data.gender)
      data.statusName = statusEnum.name;
      data.genderName = genderEnum.name;
      data.createUserName = data.createUserName || data.createUserId
      data.deleteOp = true
      data.updateOp = true
      data.getRoleOp = true
      data.updateRoleOp = true
      if (data.status === CommonStatusEnum.NORMAL.code) {
        data.disableOp = true
      } else if (data.status === CommonStatusEnum.DISABLE.code) {
        data.enableOp = true
      } else if (data.status === CommonStatusEnum.LOCKED.code) {
        data.unlockOp = true
      }
      data.roles = ""
      if (data.roleDtoList && data.roleDtoList.length > 0) {
        data.simpleRoleList = data.roleDtoList.map(item => item.id)
        for (const thisRole of data.roleDtoList) {
          data.roles += thisRole.name + ","
        }
        data.roles = data.roles.slice(0, -1)
      } else {
        data.simpleRoleList = []
      }
      data.statusNameWebColorName = statusEnum.color
    });
    tableData.value = thisData
    tableDynamicData.value.inLoading = false
  })
}

function getAllRoles() {
  roleListSimple().then(res => {
    if (!res || !res.data || !res.data.data) {
      return
    }
    res.data.data.forEach(role => {
      userRoleMap[role.id] = false
    })
    allRoleList.value = res.data.data
  })
}

onMounted(() => {
  selectData()
  getAllRoles()
})
</script>

<style scoped lang="scss">


</style>