<template>
  <div class="full-width">


    <div class="row items-center">

      <div class="q-ml-md">
        <h6>
          权限名称/权限码&nbsp;:
        </h6>
      </div>
      <q-input v-model="keyword" tabindex="0" dense outlined placeholder="例如：预约管理"
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
      <q-btn no-caps unelevated class="q-ma-md shadow-2 component-full-btn-grow" @click="" push>
        查询
      </q-btn>
      <q-btn no-caps unelevated class="q-ma-md shadow-2 component-full-btn-grow" @click="" push>
        添加权限
      </q-btn>
      <q-btn no-caps unelevated class="q-ma-md shadow-2 component-full-btn-grow" @click="" push>
        导出权限
      </q-btn>
    </div>


    <cask-complex-table class="full-width" style="padding: 2rem 5rem 0 0.5rem" :table-base-info="tablePermission"
                        :table-data="tableData"
                        :custom-table-operation="tablePermissionOperation"
                        :table-dynamic-data="tableDynamicData"
                        @toNewPage="(pageObj) => {
                            tableDynamicData.inLoading = true
                            tableDynamicData.pageNo = pageObj.pageNo
                            tableDynamicData.pageSize = pageObj.pageSize
                            const start = (tableDynamicData.pageNo - 1) * tableDynamicData.pageSize;
                            const end = start + tableDynamicData.pageSize;

                            delay(500).then(() => {
                              tableDynamicData.inLoading = false
                            })
                          }"
                        @operationClick="(name, row) => {
                            if(name === 'detail') {
                              console.log(name, row)
                            }
                            if(name === 'delete') {
                              console.log(name, row)
                            }
                          }"
    />

  </div>
</template>

<script setup>
import {onMounted, ref} from "vue";
import CaskComplexTable from "@/ui/components/CaskComplexTable.vue";
import {delay} from "@/utils/base-tools.js";
import {tablePermission, tablePermissionOperation} from "@/tables/permission.js";
import {perList} from "@/api/permission.js";
import {CommonStatusEnum, PermissionTypeEnum} from "@/constants/enums/common.js";

const keyword = ref("")
const parentId = ref("")
const selectType = ref(null)
const selectStatus = ref(null)
const typeOptions = ref(PermissionTypeEnum.toSelectForm())
const statusOptions = ref(CommonStatusEnum.toSelectForm())

const tableData = ref([])
const tableDynamicData = ref(
    {
      inLoading: true,
      pageNo: 1,
      pageSize: 10,
      dataSum: 0,
    }
)

function selectPermission() {
  tableDynamicData.value.inLoading = true
  const param = {
    keyword: keyword.value, parentId: parentId.value,
    type: selectType.value ? selectType.value.value : null,
    status: selectStatus.value ? selectStatus.value.value : null,
  }

  perList(param).then(res => {
    if (!res || !res.data || !res.data.data) {
      tableDynamicData.value.inLoading = false
      return
    }
    const thisData = res.data.data
    thisData.forEach(data => {
      data.typeName = PermissionTypeEnum.fromCode(data.type).name;
      data.statusName = CommonStatusEnum.fromCode(data.status).name;
    });
    tableData.value = thisData
    tableDynamicData.value.dataSum = thisData.length
    tableDynamicData.value.inLoading = false
  })

}

onMounted(()=> {
  selectPermission();
})
</script>

<style scoped lang="scss">

</style>