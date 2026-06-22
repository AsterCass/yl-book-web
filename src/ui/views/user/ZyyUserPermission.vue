<template>
  <div class="full-width">
    <div class="row items-center">

      <div class="q-ml-md">
        <h6>
          权限编号&nbsp;:
        </h6>
      </div>
      <q-input v-model="selectId" tabindex="0" dense outlined placeholder="例如：YLP001"
               class="q-ma-md component-outline-input-std">
      </q-input>

      <div class="q-ml-md">
        <h6>
          权限名称/权限码&nbsp;:
        </h6>
      </div>
      <q-input v-model="keyword" tabindex="0" dense outlined placeholder="例如：添加用户"
               class="q-ma-md component-outline-input-std">
      </q-input>

      <div class="q-ml-md">
        <h6>
          父权限ID&nbsp;:
        </h6>
      </div>
      <q-input v-model="parentId" tabindex="0" dense outlined placeholder="例如：YLP001"
               class="q-ma-md component-outline-input-std">
      </q-input>

      <div class="q-ml-md">
        <h6>
          权限类型&nbsp;:
        </h6>
      </div>
      <q-select outlined clearable class="q-ma-md component-outline-input-grow"
                dropdown-icon="fa-solid fa-caret-down"
                popup-content-class="component-extra-card-std"
                clear-icon="fa-solid fa-xmark"
                menu-anchor="bottom start" :menu-offset="[0, 5]"
                v-model="selectType" :options="typeOptions">
      </q-select>

      <div class="q-ml-md">
        <h6>
          权限状态&nbsp;:
        </h6>
      </div>
      <q-select outlined clearable class="q-ma-md component-outline-input-grow"
                dropdown-icon="fa-solid fa-caret-down"
                popup-content-class="component-extra-card-std"
                clear-icon="fa-solid fa-xmark"
                menu-anchor="bottom start" :menu-offset="[0, 5]"
                v-model="selectStatus" :options="statusOptions">
      </q-select>

    </div>

    <div class="row">
      <q-btn no-caps unelevated class="q-ma-md shadow-2 component-full-btn-grow" @click="selectData" push>
        查询
      </q-btn>
      <q-btn no-caps unelevated class="q-ma-md shadow-2 component-full-btn-grow"
             @click="clearUpsertParam(); isNew = true; showUpsert = true"
             push>
        添加权限
      </q-btn>
      <q-btn no-caps unelevated class="q-ma-md shadow-2 component-full-btn-grow"
             @click="()=> {clearSearch(); selectData();}" push>
        清空条件
      </q-btn>
    </div>

    <cask-complex-table class="full-width" style="padding: 2rem 5rem 0 0.5rem" :table-base-info="tablePermission"
                        :table-data="tableData"
                        :custom-table-operation="tablePermissionOperation"
                        :table-dynamic-data="tableDynamicData"
                        @toNewPage="(pageObj) => {
                            tableDynamicData.pageNo = pageObj.pageNo
                            tableDynamicData.pageSize = pageObj.pageSize
                            selectData()
                          }"
                        @operationClick="(name, row) => {
                            if(name === 'update') {
                              clearUpsertParam();
                              updateId = row.id
                              upsertCode = row.code
                              upsertName = row.name
                              upsertDesc = row.desc
                              upsertParentId = row.parentId
                              upsertType =  PermissionTypeEnum.fromCodeToSelectFrom(row.type)
                              isNew = false;
                              showUpsert = true
                            }
                            if(name === 'delete') {
                              toDeleteId = row.id
                              toDeleteName = row.name
                              showDelete = true
                            }
                          }"
    />

    <q-dialog :model-value="showUpsert" @hide="showUpsert = false"
              transition-show="fade" transition-hide="fade">
      <q-card class="component-cask-dialog-judgement-std" style="max-width: 2000px !important">
        <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
          {{ isNew ? "添加权限" : "更新权限" }}
        </h5>

        <q-separator class="component-separator-base" inset spaced="1rem"/>

        <div style="padding-top: .1rem">

        </div>

        <div class="q-ma-md"
             style="display: grid; grid-template-columns: max-content 1fr; gap: 1.2rem; align-items: center;">

          <h6 style="white-space: nowrap;">权限名称&nbsp;:</h6>
          <q-input v-model="upsertName" dense outlined placeholder="例如：添加用户"
                   class="component-outline-input-std"/>

          <h6 style="white-space: nowrap;">权限码&nbsp;:</h6>
          <q-input v-model="upsertCode" dense outlined placeholder="例如：user:add"
                   class="component-outline-input-std"/>

          <h6 style="white-space: nowrap;">权限类型&nbsp;:</h6>
          <q-select outlined clearable class="component-outline-input-grow"
                    dropdown-icon="fa-solid fa-caret-down"
                    popup-content-class="component-extra-card-std"
                    clear-icon="fa-solid fa-xmark"
                    menu-anchor="bottom start" :menu-offset="[0, 5]"
                    v-model="upsertType" :options="typeOptions">
          </q-select>

          <h6 style="white-space: nowrap;">权限描述&nbsp;:</h6>
          <q-input v-model="upsertDesc" dense outlined placeholder="可为空"
                   class="component-outline-input-std"/>

          <h6 style="white-space: nowrap;">父权限ID&nbsp;:</h6>
          <q-input v-model="upsertParentId" dense outlined placeholder="可为空"
                   class="component-outline-input-std"/>
        </div>

        <div class="row q-mt-xl q-mb-md justify-center">
          <q-btn no-caps unelevated class="shadow-1 component-full-btn-grow" @click="upsertData">
            {{ isNew ? "添加" : "更新" }}
          </q-btn>
        </div>
      </q-card>
    </q-dialog>

    <cask-dialog-judgment :dialog-judgment-data="{title: '删除权限', content:`是否删除【${toDeleteName}】权限`,
                                                falseLabel: '取消', trueLabel: '确认'}"
                          :callback-method="isTrue => { showDelete = false; if (isTrue) deleteData() }"
                          v-model="showDelete"
    />

  </div>
</template>

<script setup>
import {onMounted, ref} from "vue";
import CaskComplexTable from "@/ui/components/CaskComplexTable.vue";
import {tablePermission, tablePermissionOperation} from "@/tables/permission.js";
import {perCreate, perDelete, perList, perUpdate} from "@/api/permission.js";
import {CommonStatusEnum, PermissionTypeEnum} from "@/constants/enums/common.js";
import {notifyTopPositive, notifyTopWarning} from "@/utils/notification-tools.js";
import CaskDialogJudgment from "@/ui/components/CaskDialogJudgment.vue";

const selectId = ref("")
const keyword = ref("")
const parentId = ref("")
const selectType = ref(null)
const selectStatus = ref(null)
const typeOptions = ref(PermissionTypeEnum.toSelectForm())
const statusOptions = ref(CommonStatusEnum.toSelectForm())

// create/update 
const showUpsert = ref(false)
const isNew = ref(false)
const upsertName = ref("")
const upsertCode = ref("")
const upsertDesc = ref("")
const upsertParentId = ref("")
const upsertType = ref({label: '页面', value: 1})

const updateId = ref("")

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

function clearSearch() {
  selectId.value = ""
  keyword.value = ""
  parentId.value = ""
  selectType.value = null
  selectStatus.value = null
}

function clearUpsertParam() {
  upsertName.value = ""
  upsertCode.value = ""
  upsertDesc.value = ""
  upsertParentId.value = ""
  upsertType.value = {label: '页面', value: 1}
}

function upsertData() {
  if (!upsertName.value || !upsertCode.value || !upsertType.value || !upsertType.value.value) {
    notifyTopWarning("提供参数不足")
    return;
  }

  if (!updateId.value && !isNew.value) {
    notifyTopWarning("提供参数不足")
    return;
  }

  const body = {
    parentId: upsertParentId.value,
    name: upsertName.value,
    type: upsertType.value.value,
    desc: upsertDesc.value,
    code: upsertCode.value,
  }

  if (isNew.value) {
    perCreate(body).then(res => {
      if (!res || !res.data) {
        return
      }
      clearUpsertParam()
      showUpsert.value = false
      selectData()
    })
  } else {
    perUpdate(updateId.value, body).then(res => {
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
  perDelete(toDeleteId.value).then(res => {
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
    id: selectId.value, keyword: keyword.value, parentId: parentId.value,
    type: selectType.value ? selectType.value.value : null,
    status: selectStatus.value ? selectStatus.value.value : null,
    pageNo: tableDynamicData.value.pageNo, pageSize: tableDynamicData.value.pageSize,
  }

  perList(param).then(res => {
    if (!res || !res.data || !res.data.data) {
      tableDynamicData.value.inLoading = false
      return
    }
    const thisData = res.data.data.records
    tableDynamicData.value.dataSum = res.data.data.total
    thisData.forEach(data => {
      const typeEnum = PermissionTypeEnum.fromCode(data.type)
      const statusEnum = CommonStatusEnum.fromCode(data.status)
      data.typeName = typeEnum.name;
      data.statusName = statusEnum.name;
      data.deleteOp = true
      data.updateOp = true
      if (data.meta) {
        data.desc = JSON.parse(data.meta).desc
      }
      data.statusNameWebColorName = statusEnum.color
      data.typeNameWebColorName = typeEnum.color
    });
    tableData.value = thisData
    tableDynamicData.value.inLoading = false
  })

}

onMounted(()=> {
  selectData();
})
</script>

<style scoped lang="scss">

</style>