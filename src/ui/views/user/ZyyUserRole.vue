<template>

  <div>
    <div class="  bg-red" style="height: 300px; width: 500px">
      fdsafdsa
    </div>
    <div class="  bg-blue" style="height: 300px; width: 500px">
      fdsafdsa
    </div>
    <div class="  bg-red" style="height: 300px; width: 500px">
      fdsafdsa
    </div>
    <div class="  bg-blue" style="height: 300px; width: 500px">
      fdsafdsa
    </div>
    <div class="  bg-red" style="height: 300px; width: 500px">
      fdsafdsa
    </div>
    <div class="  bg-blue" style="height: 300px; width: 500px">
      fdsafdsa
    </div>
  </div>


</template>

<script setup>
import {roleList} from "@/api/role.js";
import {CommonStatusEnum} from "@/constants/enums/common.js";
import {onMounted, ref} from "vue";


const tableData = ref([])
const tableDynamicData = ref(
    {
      inLoading: true,
      pageNo: 1,
      pageSize: 10,
      dataSum: 0,
    }
)

function selectRole() {
  tableDynamicData.value.inLoading = true
  const param = {}

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

onMounted(() => {
  selectRole();
})
</script>

<style scoped lang="scss">

</style>