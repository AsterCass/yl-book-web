<template>
  <div class="full-width">
    <div class="row items-center">

      <div class="q-ml-md">
        <h6>
          权限ID&nbsp;:
        </h6>
      </div>
      <q-input v-model="perId" tabindex="0" dense outlined placeholder="例如：YLP001"
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
      <q-btn no-caps unelevated class="q-ma-md shadow-2 component-full-btn-grow" @click="selectPermission" push>
        查询
      </q-btn>
      <q-btn no-caps unelevated class="q-ma-md shadow-2 component-full-btn-grow"
             @click="clearUpsertParam(); isNew = true; showUpsertPermission = true"
             push>
        添加权限
      </q-btn>
      <q-btn no-caps unelevated class="q-ma-md shadow-2 component-full-btn-grow"
             @click="notifyTopWarning($t('in_develop'))" push>
        导出权限
      </q-btn>
      <q-btn no-caps unelevated class="q-ma-md shadow-2 component-full-btn-grow"
             @click="()=> {clearSearch(); selectPermission();}" push>
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
                            selectPermission()
                          }"
                        @operationClick="(name, row) => {
                            if(name === 'update') {
                              clearUpsertParam();
                              updatePerId = row.id
                              perCode = row.code
                              perName = row.name
                              perDesc = row.desc
                              perParentId = row.parentId
                              perType =  PermissionTypeEnum.fromCodeToSelectFrom(row.type)
                              isNew = false;
                              showUpsertPermission = true
                            }
                            if(name === 'delete') {
                              toDeletePerId = row.id
                              toDeletePerName = row.name
                              showDeletePermission = true
                            }
                          }"
    />

    <q-dialog :model-value="showUpsertPermission" @hide="showUpsertPermission = false"
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
          <q-input v-model="perName" dense outlined placeholder="例如：添加用户"
                   class="component-outline-input-std"/>

          <h6 style="white-space: nowrap;">权限码&nbsp;:</h6>
          <q-input v-model="perCode" dense outlined placeholder="例如：user:add"
                   class="component-outline-input-std"/>

          <h6 style="white-space: nowrap;">权限类型&nbsp;:</h6>
          <q-select outlined clearable class="component-outline-input-grow"
                    dropdown-icon="fa-solid fa-caret-down"
                    popup-content-class="component-extra-card-std"
                    clear-icon="fa-solid fa-xmark"
                    menu-anchor="bottom start" :menu-offset="[0, 5]"
                    v-model="perType" :options="typeOptions">
          </q-select>

          <h6 style="white-space: nowrap;">权限描述&nbsp;:</h6>
          <q-input v-model="perDesc" dense outlined placeholder="可为空"
                   class="component-outline-input-std"/>

          <h6 style="white-space: nowrap;">父权限ID&nbsp;:</h6>
          <q-input v-model="perParentId" dense outlined placeholder="可为空"
                   class="component-outline-input-std"/>
        </div>

        <div class="row q-mt-xl q-mb-md justify-center">
          <q-btn no-caps unelevated class="shadow-1 component-full-btn-grow" @click="upsertPer">
            {{ isNew ? "添加" : "更新" }}
          </q-btn>
        </div>
      </q-card>
    </q-dialog>

    <cask-dialog-judgment :dialog-judgment-data="{title: '删除权限', content:`是否删除【${toDeletePerName}】权限`,
                                                falseLabel: '取消', trueLabel: '确认'}"
                          :callback-method="isTrue => { showDeletePermission = false; if (isTrue) deletePer() }"
                          v-model="showDeletePermission"
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

const perId = ref("")
const keyword = ref("")
const parentId = ref("")
const selectType = ref(null)
const selectStatus = ref(null)
const typeOptions = ref(PermissionTypeEnum.toSelectForm())
const statusOptions = ref(CommonStatusEnum.toSelectForm())

// create/update permission
const showUpsertPermission = ref(false)
const isNew = ref(false)
const perName = ref("")
const perCode = ref("")
const perDesc = ref("")
const perParentId = ref("")
const perType = ref({label: '页面', value: 1})

const updatePerId = ref("")

// delete permission
const showDeletePermission = ref(false)
const toDeletePerId = ref("")
const toDeletePerName = ref("")

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
  perId.value = ""
  keyword.value = ""
  parentId.value = ""
  selectType.value = null
  selectStatus.value = null
}

function clearUpsertParam() {
  perName.value = ""
  perCode.value = ""
  perDesc.value = ""
  perParentId.value = ""
  perType.value = {label: '页面', value: 1}
}

function upsertPer() {
  if (!perName.value || !perCode.value || !perType.value || !perType.value.value) {
    notifyTopWarning("提供参数不足")
    return;
  }

  if (!updatePerId.value && !isNew.value) {
    notifyTopWarning("提供参数不足")
    return;
  }

  const body = {
    parentId: perParentId.value,
    name: perName.value,
    type: perType.value.value,
    desc: perDesc.value,
    code: perCode.value,
  }

  if (isNew.value) {
    perCreate(body).then(res => {
      if (!res || !res.data) {
        return
      }
      clearUpsertParam()
      showUpsertPermission.value = false
      selectPermission()
    })
  } else {
    perUpdate(updatePerId.value, body).then(res => {
      if (!res || !res.data) {
        return
      }
      clearUpsertParam()
      showUpsertPermission.value = false
      selectPermission()
    })
  }

}

function deletePer() {
  if (!toDeletePerId.value) {
    notifyTopWarning("提供参数不足")
  }
  perDelete(toDeletePerId.value).then(res => {
    if (!res || !res.data) {
      return
    }
    notifyTopPositive("删除成功")
    selectPermission()
  })
}


function selectPermission() {
  tableDynamicData.value.inLoading = true
  const param = {
    id: perId.value, keyword: keyword.value, parentId: parentId.value,
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
      const thisPer = PermissionTypeEnum.fromCode(data.type)
      const thisStatus = CommonStatusEnum.fromCode(data.status)
      data.typeName = thisPer.name;
      data.statusName = thisStatus.name;
      data.perDeleteOp = true
      data.perUpdateOp = true
      if (data.meta) {
        data.desc = JSON.parse(data.meta).desc
      }
      data.statusNameWebColorName = thisStatus.color
      data.typeNameWebColorName = thisPer.color
    });
    tableData.value = thisData
    tableDynamicData.value.inLoading = false
  })

}

onMounted(()=> {
  selectPermission();
})
</script>

<style scoped lang="scss">

</style>