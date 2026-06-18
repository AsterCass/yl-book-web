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
                              updateId = row.id
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
                            if (name === 'getPer') {
                              toggleDisablePerTree(perTree, false)
                              ticked = row.simplePerList
                              isUpdatePer = false
                              showRolePer = true
                            }
                            if (name === 'updatePer') {
                              toggleDisablePerTree(perTree, true)
                              updateId = row.id
                              ticked = row.simplePerList
                              isUpdatePer = true
                              showRolePer = true
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

    <q-dialog :model-value="showRolePer" @hide="showRolePer = false"
              transition-show="fade" transition-hide="fade">
      <q-card class="component-cask-dialog-judgement-std" style="max-width: 2000px !important">
        <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
          权限分配
        </h5>

        <q-separator class="component-separator-base" inset spaced="1rem"/>

        <div style="padding-top: .1rem">

        </div>

        <q-tree
            class="q-ml-md"
            color="grey-10"
            :nodes="perTree"
            node-key="label"
            tick-strategy="leaf"
            no-connectors
            accordion
            default-expand-all
            nodeKey="id"
            v-model:ticked="ticked"
        />

        <div v-if="isUpdatePer" class="row q-mt-xl q-mb-md justify-center">
          <q-btn no-caps unelevated class="shadow-1 component-full-btn-grow" @click="updateDataPer">
            保存
          </q-btn>
        </div>
        <div v-else style="height: 2rem">
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
import {roleCreate, roleDelete, roleList, roleUpdate, roleUpdatePer} from "@/api/role.js";
import {CommonStatusEnum} from "@/constants/enums/common.js";
import {onMounted, ref} from "vue";
import {notifyTopPositive, notifyTopWarning} from "@/utils/notification-tools.js";
import CaskComplexTable from "@/ui/components/CaskComplexTable.vue";
import CaskDialogJudgment from "@/ui/components/CaskDialogJudgment.vue";
import {tableRole, tableRoleOperation} from "@/tables/role.js";
import {perListSimple} from "@/api/permission.js";


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

const updateId = ref("")

function clearUpsertParam() {
  upsertName.value = ""
  upsertCode.value = ""
  upsertDesc.value = ""
}

// get/update permission
const showRolePer = ref(false)
const isUpdatePer = ref(false)
const ticked = ref([])
const tickedSet = ref(new Set())
const perMap = ref(new Map())
const perTree = ref([])

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

  if (!updateId.value && !isNew.value) {
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
    roleUpdate(updateId.value, body).then(res => {
      if (!res || !res.data) {
        return
      }
      clearUpsertParam()
      showUpsert.value = false
      notifyTopPositive("更新角色成功")
      selectData()
    })
  }
}

function addSelfAndParentPer(currentPer) {
  tickedSet.value.add(currentPer)
  if (perMap.value.has(currentPer) && perMap.value.get(currentPer).parentId) {
    addSelfAndParentPer(perMap.value.get(currentPer).parentId)
  }
}

function updateDataPer() {
  if (!updateId.value) {
    notifyTopWarning("提供参数不足")
    return;
  }

  // 将父权限同样标记允许
  for (const tickedPer of ticked.value) {
    addSelfAndParentPer(tickedPer)
  }
  const body = {
    permissionIdList: [...tickedSet.value]
  }

  roleUpdatePer(updateId.value, body).then(res => {
    if (!res || !res.data) {
      return
    }
    showRolePer.value = false
    notifyTopPositive("配置权限成功")
    selectData()
  })

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
    pageNo: tableDynamicData.value.pageNo, pageSize: tableDynamicData.value.pageSize,
  }

  roleList(param).then(res => {
    if (!res || !res.data || !res.data.data) {
      tableDynamicData.value.inLoading = false
      return
    }
    const thisData = res.data.data.records
    tableDynamicData.value.dataSum = res.data.data.total
    thisData.forEach(data => {
      const statusEnum = CommonStatusEnum.fromCode(data.status)
      data.statusName = statusEnum.name;
      data.deleteOp = true
      data.updateOp = true
      data.getPerOp = true
      data.updatePerOp = true
      if (data.permissionDtoList && data.permissionDtoList.length > 0) {
        data.simplePerList = data.permissionDtoList.map(item => item.id)
      } else {
        data.simplePerList = []
      }
      if (data.meta) {
        data.desc = JSON.parse(data.meta).desc
      }
      data.statusNameWebColorName = statusEnum.color
    });
    tableData.value = thisData
    tableDynamicData.value.inLoading = false
  })

}


function toggleDisablePerTree(nodes, enable = true, depth = 0) {
  for (const node of nodes) {
    node.tickable = enable
    if (node.children?.length) {
      toggleDisablePerTree(node.children, enable, depth + 1);
    }
  }
}


function buildPerTree(list) {
  const roots = [];

  // 先建立 id -> node 映射
  for (const item of list) {
    perMap.value.set(item.id, {
      label: item.name, _id: item.id, _parentId: item.parentId,
      id: item.id, parentId: item.parentId
    });
  }

  // 再建立父子关系
  for (const node of perMap.value.values()) {
    if (node._parentId && perMap.value.has(node._parentId)) {
      const parent = perMap.value.get(node._parentId);
      if (!parent.children) parent.children = [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // 清理内部字段
  function clean(node) {
    delete node._id;
    delete node._parentId;
    if (node.children) node.children.forEach(clean);
    return node;
  }

  return roots.map(clean);
}

function getAllPermissions() {
  perListSimple().then(res => {
    if (!res || !res.data || !res.data.data) {
      return
    }
    const thisData = res.data.data
    perTree.value = buildPerTree(thisData)
  })
}

onMounted(() => {
  selectData()
  getAllPermissions()
})
</script>

<style scoped lang="scss">

</style>