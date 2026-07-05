<template>

  <div class="full-width">
    <div class="row items-center">

      <div class="q-ml-md">
        <h6>
          {{ $t('user_role.label.id') }}&nbsp;:
        </h6>
      </div>
      <q-input v-model="selectId" class="q-ma-md component-outline-input-std" dense outlined
               :placeholder="t('user_role.placeholder.id')"
               tabindex="0">
      </q-input>

      <div class="q-ml-md">
        <h6>
          {{ $t('user_role.label.name') }}&nbsp;:
        </h6>
      </div>
      <q-input v-model="keyword" class="q-ma-md component-outline-input-std" dense outlined
               :placeholder="t('user_role.placeholder.name')"
               tabindex="0">
      </q-input>

    </div>

    <div class="row">
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push unelevated @click="selectData()">
        {{ $t('user_role.button.query') }}
      </q-btn>
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push
             unelevated
             @click="clearUpsertParam(); isNew = true; showUpsert = true">
        {{ $t('user_role.button.add') }}
      </q-btn>
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push
             unelevated @click="()=> {clearSearch(); selectData();}">
        {{ $t('user_role.button.clear') }}
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
                            selectData(true)
                          }"
    />

    <q-dialog :model-value="showUpsert" transition-hide="fade" no-backdrop-dismiss no-shake
              transition-show="fade" @hide="showUpsert = false">
      <q-card class="component-cask-dialog-judgement-std" style="max-width: 2000px !important">
        <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
          {{ isNew ? $t('user_role.upsert.title_add') : $t('user_role.upsert.title_update') }}
        </h5>

        <q-separator class="component-separator-base" inset spaced="1rem"/>

        <div style="padding-top: .1rem">

        </div>

        <div class="q-ma-md"
             style="display: grid; grid-template-columns: max-content 1fr; gap: 1.2rem; align-items: center;">

          <h6 class="cask-litter-title-asterisk" style="white-space: nowrap;">{{ $t('user_role.upsert.field.name') }}&nbsp;:</h6>
          <q-input v-model="upsertName" class="component-outline-input-std" dense outlined
                   :placeholder="t('user_role.placeholder.name')"/>

          <h6 class="cask-litter-title-asterisk" style="white-space: nowrap;">{{ $t('user_role.upsert.field.code') }}&nbsp;:</h6>
          <q-input v-model="upsertCode" class="component-outline-input-std" dense outlined
                   :placeholder="t('user_role.placeholder.code')"/>

          <h6 style="white-space: nowrap; margin-left: 12px!important;">{{
              $t('user_role.upsert.field.desc')
            }}&nbsp;:</h6>
          <q-input v-model="upsertDesc" class="component-outline-input-std" dense outlined
                   :placeholder="t('user_role.placeholder.optional')"/>

        </div>

        <div class="row q-mt-xl q-mb-md justify-evenly">
          <q-btn class="shadow-1 component-full-btn-grow" no-caps unelevated @click="upsertData">
            {{ isNew ? $t('user_role.upsert.save_add') : $t('user_role.upsert.save_update') }}
          </q-btn>

          <q-btn class="shadow-1 component-outline-btn-grow" no-caps unelevated @click="showUpsert = false">
            {{ $t('main_setting_cancel') }}
          </q-btn>

        </div>
      </q-card>
    </q-dialog>

    <q-dialog :model-value="showRolePer" @hide="showRolePer = false"
              transition-show="fade" transition-hide="fade">
      <q-card class="component-cask-dialog-judgement-std" style="max-width: 2000px !important">
        <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
          {{ $t('user_role.role_assign.title') }}
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
            nodeKey="id"
            v-model:ticked="ticked"
        />

        <div v-if="isUpdatePer" class="row q-mt-xl q-mb-md justify-center">
          <q-btn no-caps unelevated class="shadow-1 component-full-btn-grow" @click="updateDataPer">
            {{ $t('user_role.button.save') }}
          </q-btn>
        </div>
        <div v-else style="height: 2rem">
        </div>
      </q-card>
    </q-dialog>

    <cask-dialog-judgment v-model="showDelete"
                          :callback-method="isTrue => { showDelete = false; if (isTrue) deleteData() }"
                          :dialog-judgment-data="{ title: $t('user_role.dialog.delete.title'), content: $t('user_role.dialog.delete.content', { name: toDeleteName }), falseLabel: $t('user_role.dialog.delete.cancel'), trueLabel: $t('user_role.dialog.delete.confirm') }"
    />

  </div>

</template>

<script setup>
import {roleCreate, roleDelete, roleList, roleUpdate, roleUpdatePer} from "@/api/role.js";
import {onMounted, ref} from "vue";
import {notifyTopPositive, notifyTopWarning} from "@/utils/notification-tools.js";
import {useI18n} from 'vue-i18n'
import CaskComplexTable from "@/ui/components/CaskComplexTable.vue";
import CaskDialogJudgment from "@/ui/components/CaskDialogJudgment.vue";
import {tableRole, tableRoleOperation} from "@/tables/role.js";
import {perListSimple} from "@/api/permission.js";


const {t} = useI18n()
const selectId = ref("")
const keyword = ref("")

function clearSearch() {
  selectId.value = ""
  keyword.value = ""
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
    notifyTopWarning(t('validation.insufficient_parameters'))
    return;
  }

  if (!updateId.value && !isNew.value) {
    notifyTopWarning(t('validation.insufficient_parameters'))
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
      selectData(true)
    })
  } else {
    roleUpdate(updateId.value, body).then(res => {
      if (!res || !res.data) {
        return
      }
      clearUpsertParam()
      showUpsert.value = false
      notifyTopPositive(t('user_role.notify.update_success'))
      selectData(true)
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
    notifyTopWarning(t('validation.insufficient_parameters'))
    return;
  }

  // 将父权限同样标记允许
  tickedSet.value.clear()
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
    notifyTopPositive(t('user_role.notify.per_update_success'))
    selectData(true)
  })

}

function deleteData() {
  if (!toDeleteId.value) {
    notifyTopWarning(t('validation.insufficient_parameters'))
  }
  roleDelete(toDeleteId.value).then(res => {
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
    id: selectId.value, keyword: keyword.value,
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