<template>
  <div class="full-width">
    <div class="row items-center">

      <div class="q-ml-md">
        <h6>
          用户编号&nbsp;:
        </h6>
      </div>
      <q-input v-model="selectId" class="q-ma-md component-outline-input-std" dense outlined placeholder="例如：YLU001"
               tabindex="0">
      </q-input>

      <div class="q-ml-md">
        <h6>
          用户昵称&nbsp;:
        </h6>
      </div>
      <q-input v-model="nickName" class="q-ma-md component-outline-input-std" dense outlined placeholder="例如：张三"
               tabindex="0">
      </q-input>

      <div class="q-ml-md">
        <h6>
          用户邮箱&nbsp;:
        </h6>
      </div>
      <q-input v-model="mail" class="q-ma-md component-outline-input-std" dense outlined placeholder="例如：zs01@gmail.com"
               tabindex="0">
      </q-input>

      <div class="q-ml-md">
        <h6>
          用户手机号&nbsp;:
        </h6>
      </div>
      <q-input v-model="phone" class="q-ma-md component-outline-input-std" dense outlined placeholder="例如：13811012138"
               tabindex="0">
      </q-input>

      <div class="q-ml-md">
        <h6>
          用户状态&nbsp;:
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
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push unelevated @click="selectData">
        查询
      </q-btn>
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push
             unelevated
             @click="clearUpsertParam(); isNew = true; showUpsert = true">
        添加用户
      </q-btn>
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push
             unelevated @click="()=> {clearSearch(); selectData();}">
        清空条件
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
                            if(name === 'delete') {
                              toDeleteId = row.id
                              toDeleteName = row.nickName
                              showDelete = true
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
                          }"
                        @toNewPage="(pageObj) => {
                            tableDynamicData.pageNo = pageObj.pageNo
                            tableDynamicData.pageSize = pageObj.pageSize
                            selectData()
                          }"
    />

    <q-dialog :model-value="showUpsert" transition-hide="fade" no-backdrop-dismiss no-shake
              transition-show="fade" @hide="showUpsert = false">
      <q-card class="component-cask-dialog-judgement-std" style="max-width: 2000px !important">
        <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
          {{ isNew ? "添加用户" : "更新用户" }}
        </h5>

        <div class="q-mx-sm" style="opacity: 0.5; width: 25rem">
          <div v-if="isNew">
            默认密码和邮箱相同，创建后用户需要在15日内修改密码，否则账号会被锁定，无法登录
          </div>
        </div>

        <q-separator class="component-separator-base" inset spaced="1rem"/>

        <div style="padding-top: .1rem">

        </div>

        <div class="q-ma-md"
             style="display: grid; grid-template-columns: max-content 1fr; gap: 1.2rem; align-items: center;">

          <h6 class="cask-litter-title-asterisk" style="white-space: nowrap;">用户昵称&nbsp;:</h6>
          <q-input v-model="upsertNickName" class="component-outline-input-grow" dense outlined
                   placeholder="例如：张三"/>

          <h6 class="cask-litter-title-asterisk" style="white-space: nowrap;">用户邮箱&nbsp;:</h6>
          <q-input v-model="upsertMail" class="component-outline-input-grow" dense outlined
                   placeholder="例如：zs01@gmail.com"/>

          <h6 style="white-space: nowrap; margin-left: 12px!important;">用户手机号&nbsp;:</h6>
          <q-input v-model="upsertPhone" class="component-outline-input-grow" dense outlined
                   placeholder="例如：13811012138"/>

          <h6 style="white-space: nowrap; margin-left: 12px!important;">用户性别&nbsp;:</h6>
          <q-select outlined clearable class="component-outline-input-grow"
                    dropdown-icon="fa-solid fa-caret-down"
                    popup-content-class="component-extra-card-std"
                    clear-icon="fa-solid fa-xmark"
                    menu-anchor="bottom start" :menu-offset="[0, 5]"
                    v-model="upsertGender" :options="genderOptions">
          </q-select>

          <h6 style="white-space: nowrap; margin-left: 12px!important;">用户生日&nbsp;:</h6>
          <cask-date-picker v-model="upsertBirth"/>


        </div>

        <div class="row q-mt-xl q-mb-md justify-evenly">
          <q-btn class="shadow-1 component-full-btn-grow" no-caps unelevated @click="upsertData">
            {{ isNew ? "添加" : "更新" }}
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
          角色分配
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
            保存
          </q-btn>
        </div>
      </q-card>
    </q-dialog>


    <cask-dialog-judgment v-model="showDelete"
                          :callback-method="isTrue => { showDelete = false; if (isTrue) deleteData() }"
                          :dialog-judgment-data="{title: '删除用户', content:`是否删除【${toDeleteName}】用户`,
                                                falseLabel: '取消', trueLabel: '确认'}"
    />

  </div>
</template>

<script setup>
import {CommonStatusEnum, GenderOptEnum} from "@/constants/enums/common.js";
import {onMounted, reactive, ref} from "vue";
import {notifyTopPositive, notifyTopWarning} from "@/utils/notification-tools.js";
import CaskComplexTable from "@/ui/components/CaskComplexTable.vue";
import CaskDialogJudgment from "@/ui/components/CaskDialogJudgment.vue";
import {tableUser, tableUserOperation} from "@/tables/user.js";
import {userCreate, userDelete, userList, userUpdate, userUpdateRole} from "@/api/user.js";
import CaskDatePicker from "@/ui/components/CaskDatePicker.vue";
import {roleListSimple} from "@/api/role.js";


const selectId = ref("")
const nickName = ref("")
const phone = ref("")
const mail = ref("")
const selectStatus = ref(null)
const statusOptions = ref(CommonStatusEnum.toSelectForm())
const genderOptions = ref(GenderOptEnum.toSelectForm())

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

// delete
const showDelete = ref(false)
const toDeleteId = ref("")
const toDeleteName = ref("")

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
    notifyTopWarning("提供参数不足")
    return;
  }

  if (!updateId.value && !isNew.value) {
    notifyTopWarning("提供参数不足")
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
      selectData()
    })
  } else {
    userUpdate(updateId.value, body).then(res => {
      if (!res || !res.data) {
        return
      }
      clearUpsertParam()
      showUpsert.value = false
      notifyTopPositive("更新用户成功")
      selectData()
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
    notifyTopWarning("提供参数不足")
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
    notifyTopPositive("配置角色成功")
    selectData()
  })

}

function deleteData() {
  if (!toDeleteId.value) {
    notifyTopWarning("提供参数不足")
  }
  userDelete(toDeleteId.value).then(res => {
    if (!res || !res.data) {
      return
    }
    notifyTopPositive("删除成功")
    selectData()
  })
}

function selectData() {
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