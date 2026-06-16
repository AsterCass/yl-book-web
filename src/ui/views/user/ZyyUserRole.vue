<template>

  <div class="full-width">
    <div class="row items-center">

      <div class="q-ml-md">
        <h6>
          角色ID&nbsp;:
        </h6>
      </div>
      <q-input v-model="selectId" class="q-ma-md component-outline-input-std" dense outlined placeholder="例如：YLP001"
               tabindex="0">
      </q-input>

      <div class="q-ml-md">
        <h6>
          角色名称/角色码&nbsp;:
        </h6>
      </div>
      <q-input v-model="keyword" class="q-ma-md component-outline-input-std" dense outlined placeholder="例如：添加用户"
               tabindex="0">
      </q-input>

      <div class="q-ml-md">
        <h6>
          角色状态&nbsp;:
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
        添加角色
      </q-btn>
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push
             unelevated @click="notifyTopWarning($t('in_develop'))">
        导出角色
      </q-btn>
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push
             unelevated @click="()=> {clearSearch(); selectData();}">
        清空条件
      </q-btn>
    </div>

    <cask-complex-table :custom-table-operation="tableRoleOperation" :table-base-info="tableRole"
                        :table-data="tableData"
                        :table-dynamic-data="tableDynamicData"
                        class="full-width"
                        style="padding: 2rem 5rem 0 0.5rem"
                        @operationClick="(name, row) => {
                            if(name === 'update') {
                              clearUpsertParam();
                              upsertId = row.id
                              upsertCode = row.code
                              upsertName = row.name
                              upsertDesc = row.desc
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
          {{ isNew ? "添加角色" : "更新角色" }}
        </h5>

        <q-separator class="component-separator-base" inset spaced="1rem"/>

        <div style="padding-top: .1rem">

        </div>

        <div class="q-ma-md"
             style="display: grid; grid-template-columns: max-content 1fr; gap: 1.2rem; align-items: center;">

          <h6 style="white-space: nowrap;">角色名称&nbsp;:</h6>
          <q-input v-model="upsertName" class="component-outline-input-std" dense outlined
                   placeholder="例如：添加用户"/>

          <h6 style="white-space: nowrap;">角色码&nbsp;:</h6>
          <q-input v-model="upsertCode" class="component-outline-input-std" dense outlined
                   placeholder="例如：user:add"/>

          <h6 style="white-space: nowrap;">角色描述&nbsp;:</h6>
          <q-input v-model="upsertDesc" class="component-outline-input-std" dense outlined
                   placeholder="可为空"/>

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
                          :dialog-judgment-data="{title: '删除角色', content:`是否删除【${toDeleteName}】角色`,
                                                falseLabel: '取消', trueLabel: '确认'}"
    />

  </div>

</template>

<script setup>
import {roleCreate, roleDelete, roleList, roleUpdate} from "@/api/role.js";
import {CommonStatusEnum} from "@/constants/enums/common.js";
import {onMounted, ref} from "vue";
import {notifyTopPositive, notifyTopWarning} from "@/utils/notification-tools.js";
import CaskComplexTable from "@/ui/components/CaskComplexTable.vue";
import CaskDialogJudgment from "@/ui/components/CaskDialogJudgment.vue";
import {tableRole, tableRoleOperation} from "@/tables/role.js";


const selectId = ref("")
const keyword = ref("")
const selectStatus = ref(null)
const statusOptions = ref(CommonStatusEnum.toSelectForm())

function clearSearch() {
  selectId.value = ""
  keyword.value = ""
  selectStatus.value = null
}

// create/update
const showUpsert = ref(false)
const isNew = ref(false)
const upsertName = ref("")
const upsertCode = ref("")
const upsertDesc = ref("")

const upsertId = ref("")

function clearUpsertParam() {
  upsertName.value = ""
  upsertCode.value = ""
  upsertDesc.value = ""
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
  if (!upsertName.value || !upsertCode.value) {
    notifyTopWarning("提供参数不足")
    return;
  }

  if (!upsertId.value && !isNew.value) {
    notifyTopWarning("提供参数不足")
    return;
  }

  const body = {
    name: upsertName.value,
    desc: upsertDesc.value,
    code: upsertCode.value,
  }

  if (isNew.value) {
    roleCreate(body).then(res => {
      if (!res || !res.data) {
        return
      }
      clearUpsertParam()
      showUpsert.value = false
      selectData()
    })
  } else {
    roleUpdate(upsertId.value, body).then(res => {
      if (!res || !res.data) {
        return
      }
      clearUpsertParam()
      showUpsert.value = false
      selectData()
    })
  }
}

function deleteData() {
  if (!toDeleteId.value) {
    notifyTopWarning("提供参数不足")
  }
  roleDelete(toDeleteId.value).then(res => {
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
    id: selectId.value, keyword: keyword.value,
    status: selectStatus.value ? selectStatus.value.value : null,
  }

  roleList(param).then(res => {
    if (!res || !res.data || !res.data.data) {
      tableDynamicData.value.inLoading = false
      return
    }
    const thisData = res.data.data.records
    tableDynamicData.value.dataSum = res.data.data.total
    thisData.forEach(data => {
      const thisStatus = CommonStatusEnum.fromCode(data.status)
      data.statusName = thisStatus.name;
      data.deleteOp = true
      data.updateOp = true
      if (data.meta) {
        data.desc = JSON.parse(data.meta).desc
      }
      data.statusNameWebColorName = thisStatus.color
    });
    tableData.value = thisData
    tableDynamicData.value.inLoading = false
  })

}

onMounted(() => {
  selectData();
})
</script>

<style scoped lang="scss">

</style>