<template>
  <div class="full-width">
    <div class="row items-center">

      <div class="q-ml-md">
        <h6>
          用户编号&nbsp;:
        </h6>
      </div>
      <q-input v-model="selectId" class="q-ma-md component-outline-input-std" dense outlined placeholder="例如：YLP001"
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
             unelevated @click="notifyTopWarning($t('in_develop'))">
        导出用户
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
                              upsertName = row.name
                              isNew = false;
                              showUpsert = true
                            }
                            if(name === 'delete') {
                              toDeleteId = row.id
                              toDeleteName = row.name
                              showDelete = true
                            }
                          }"
                        @toNewPage="(pageObj) => {
                            tableDynamicData.pageNo = pageObj.pageNo
                            tableDynamicData.pageSize = pageObj.pageSize
                            selectData()
                          }"
    />

    <q-dialog :model-value="showUpsert" transition-hide="fade"
              transition-show="fade" @hide="showUpsert = false">
      <q-card class="component-cask-dialog-judgement-std" style="max-width: 2000px !important">
        <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
          {{ isNew ? "添加用户" : "更新用户" }}
        </h5>

        <q-separator class="component-separator-base" inset spaced="1rem"/>

        <div style="padding-top: .1rem">

        </div>

        <div class="q-ma-md"
             style="display: grid; grid-template-columns: max-content 1fr; gap: 1.2rem; align-items: center;">

          <h6 style="white-space: nowrap;">用户名称&nbsp;:</h6>
          <q-input v-model="upsertName" class="component-outline-input-std" dense outlined
                   placeholder="例如：添加用户"/>

        </div>

        <div class="row q-mt-xl q-mb-md justify-center">
          <q-btn class="shadow-1 component-full-btn-grow" no-caps unelevated @click="upsertData">
            {{ isNew ? "添加" : "更新" }}
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
import {onMounted, ref} from "vue";
import {notifyTopPositive, notifyTopWarning} from "@/utils/notification-tools.js";
import CaskComplexTable from "@/ui/components/CaskComplexTable.vue";
import CaskDialogJudgment from "@/ui/components/CaskDialogJudgment.vue";
import {tableUser, tableUserOperation} from "@/tables/user.js";
import {userCreate, userDelete, userList, userUpdate} from "@/api/user.js";


const selectId = ref("")
const nickName = ref("")
const phone = ref("")
const mail = ref("")
const selectStatus = ref(null)
const statusOptions = ref(CommonStatusEnum.toSelectForm())

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
const upsertName = ref("")

const updateId = ref("")

function clearUpsertParam() {
  upsertName.value = ""
}

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
  if (!upsertName.value) {
    notifyTopWarning("提供参数不足")
    return;
  }

  if (!updateId.value && !isNew.value) {
    notifyTopWarning("提供参数不足")
    return;
  }

  const body = {}

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
      data.statusNameWebColorName = statusEnum.color
    });
    tableData.value = thisData
    tableDynamicData.value.inLoading = false
  })

}

onMounted(() => {
  selectData()
})
</script>

<style scoped lang="scss">


</style>