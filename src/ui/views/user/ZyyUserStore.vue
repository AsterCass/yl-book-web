<template>

  <div class="full-width">
    <div class="row items-center">

      <div class="q-ml-md">
        <h6>
          {{ $t('user_store.label.id') }}&nbsp;:
        </h6>
      </div>
      <q-input v-model="selectId" class="q-ma-md component-outline-input-std" dense outlined
               :placeholder="t('user_store.placeholder.id')"
               tabindex="0">
      </q-input>

      <div class="q-ml-md">
        <h6>
          {{ $t('user_store.label.name') }}&nbsp;:
        </h6>
      </div>
      <q-input v-model="selectName" class="q-ma-md component-outline-input-std" dense outlined
               :placeholder="t('user_store.placeholder.name')"
               tabindex="0">
      </q-input>

      <div class="q-ml-md">
        <h6>
          {{ $t('user_store.label.phone') }}&nbsp;:
        </h6>
      </div>
      <q-input v-model="selectPhone" class="q-ma-md component-outline-input-std" dense outlined
               :placeholder="t('user_store.placeholder.phone')"
               tabindex="0">
      </q-input>

    </div>

    <div class="row">
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push unelevated
             @click="selectData()">
        {{ $t('user_store.button.query') }}
      </q-btn>
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push
             unelevated
             @click="clearUpsertParam(); isNew = true; showUpsert = true">
        {{ $t('user_store.button.add') }}
      </q-btn>
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push
             unelevated @click="()=> {clearSearch(); selectData();}">
        {{ $t('user_store.button.clear') }}
      </q-btn>
    </div>

    <cask-complex-table :custom-table-operation="tableStoreOperation" :table-base-info="tableStore"
                        :table-data="tableData"
                        :table-dynamic-data="tableDynamicData"
                        class="full-width"
                        style="padding: 2rem 5rem 0 0.5rem"
                        @operationClick="(name, row) => {
                            if(name === 'update') {
                              clearUpsertParam();
                              updateId = row.id
                              upsertName = row.name
                              upsertExternalName = row.externalName
                              upsertExternalNameZh = row.externalNameZh
                              upsertAddress = row.address
                              upsertAddressZh = row.addressZh
                              upsertPhone = row.phone
                              upsertAiPhone = row.aiPhone
                              upsertOutboundPhone = row.outboundPhone
                              upsertDesc = row.description
                              upsertGoogleCalendarIdList = row.googleCalendarIdList || []
                              loadStoreResources(row.id)
                              isNew = false;
                              showUpsert = true
                            }
                            if(name === 'remark') {
                              openRemark()
                            }
                          }"
                        @enterSearch="selectData()"
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
          {{ isNew ? $t('user_store.upsert.title_add') : $t('user_store.upsert.title_update') }}
        </h5>

        <div class="q-mx-sm" style="opacity: 0.5; width: 25rem; font-size: 0.85rem">
          <div v-if="isNew">
            {{ $t('user_store.upsert.admin_note') }}
          </div>
        </div>

        <q-separator class="component-separator-base" inset spaced="1rem"/>

        <div style="padding-top: .1rem">

        </div>

        <!-- 两列布局（同雇员编辑卡片）：左=门店基础信息（新建时含初始管理员），
             右=谷歌日历 id / 共享资源位两块可增删列表——行数多，塞在单列里会把弹窗拉得很长。
             右列仅编辑态存在，新建时自然退化为单列。no-wrap 强制并排，宽度由内容撑开 -->
        <div class="q-ma-md row no-wrap items-start" style="gap: 2rem;">

        <div style="flex: 1 1 auto; min-width: 24rem;">
        <div style="display: grid; grid-template-columns: max-content 1fr; gap: 1.2rem; align-items: center;">

          <h6 class="cask-litter-title-asterisk" style="white-space: nowrap;">{{ $t('user_store.upsert.field.name') }}&nbsp;:</h6>
          <q-input v-model="upsertName" class="component-outline-input-grow" dense outlined
                   :placeholder="t('user_store.placeholder.name')"/>

          <h6 style="white-space: nowrap; margin-left: 12px!important;">{{
              $t('user_store.upsert.field.external_name')
            }}&nbsp;:</h6>
          <q-input v-model="upsertExternalName" class="component-outline-input-grow" dense outlined
                   :placeholder="t('user_store.placeholder.optional')"/>

          <h6 style="white-space: nowrap; margin-left: 12px!important;">{{
              $t('user_store.upsert.field.external_name_zh')
            }}&nbsp;:</h6>
          <q-input v-model="upsertExternalNameZh" class="component-outline-input-grow" dense outlined
                   :placeholder="t('user_store.placeholder.optional_zh')"/>

          <h6 v-if="!isNew" style="white-space: nowrap; margin-left: 12px!important;">{{
              $t('user_store.upsert.field.address')
            }}&nbsp;:</h6>
          <q-input v-if="!isNew" v-model="upsertAddress" class="component-outline-input-grow" dense outlined
                   :placeholder="t('user_store.placeholder.optional')"/>

          <h6 v-if="!isNew" style="white-space: nowrap; margin-left: 12px!important;">{{
              $t('user_store.upsert.field.address_zh')
            }}&nbsp;:</h6>
          <q-input v-if="!isNew" v-model="upsertAddressZh" class="component-outline-input-grow" dense outlined
                   :placeholder="t('user_store.placeholder.optional_zh')"/>

          <h6 v-if="!isNew" style="white-space: nowrap; margin-left: 12px!important;">{{
              $t('user_store.upsert.field.phone')
            }}&nbsp;:</h6>
          <q-input v-if="!isNew" v-model="upsertPhone" class="component-outline-input-grow" dense outlined
                   :placeholder="t('user_store.placeholder.optional')"/>

          <!-- AI 电话：对客公布的 AI 接听号码；客户端展示门店电话时优先用它，空则回退上面的门店电话 -->
          <h6 v-if="!isNew" style="white-space: nowrap; margin-left: 12px!important; align-self: flex-start;">{{
              $t('user_store.upsert.field.ai_phone')
            }}&nbsp;:</h6>
          <div v-if="!isNew">
            <q-input v-model="upsertAiPhone" class="component-outline-input-grow" dense outlined
                     :placeholder="t('user_store.placeholder.optional')"/>
            <div class="q-mt-xs" style="opacity: 0.5; font-size: 0.85rem; max-width: 24rem">
              {{ $t('user_store.upsert.ai_phone_hint') }}
            </div>
          </div>

          <!-- 呼出电话：本店已购的 Twilio 号码，回访客户时作为主叫显示（先呼上面的门店电话、
               店员接起后桥接客户，两端看到的来电显示都是它）；空=本店不能发起回访 -->
          <h6 v-if="!isNew" style="white-space: nowrap; margin-left: 12px!important; align-self: flex-start;">{{
              $t('user_store.upsert.field.outbound_phone')
            }}&nbsp;:</h6>
          <div v-if="!isNew">
            <q-input v-model="upsertOutboundPhone" class="component-outline-input-grow" dense outlined
                     :placeholder="t('user_store.placeholder.optional')"/>
            <div class="q-mt-xs" style="opacity: 0.5; font-size: 0.85rem; max-width: 24rem">
              {{ $t('user_store.upsert.outbound_phone_hint') }}
            </div>
          </div>

          <h6 v-if="!isNew" style="white-space: nowrap; margin-left: 12px!important;">{{
              $t('user_store.upsert.field.desc')
            }}&nbsp;:</h6>
          <q-input v-if="!isNew" v-model="upsertDesc" class="component-outline-input-grow" dense outlined
                   :placeholder="t('user_store.placeholder.optional')"/>


          <!-- 新建专属：时区与初始管理员。留在左列同一个 grid 里，
               标签列宽才与上面的基础字段一致（各自独立 grid 会各算各的 max-content） -->
          <template v-if="isNew">
            <h6 style="white-space: nowrap; margin-left: 12px!important;">{{
                $t('user_store.upsert.field.timezone')
              }}&nbsp;:</h6>
            <q-select outlined clearable class="component-outline-input-grow"
                      dropdown-icon="fa-solid fa-caret-down"
                      popup-content-class="component-extra-card-std-limit"
                      clear-icon="fa-solid fa-xmark"
                      menu-anchor="bottom start" :menu-offset="[0, 5]"
                      v-model="upsertTimezone" :options="timezoneOptions">
            </q-select>

            <h6 class="cask-litter-title-asterisk" style="white-space: nowrap;">
              {{ $t('user_store.upsert.field.admin_mail') }}&nbsp;:</h6>
            <q-input v-model="upsertAdminMail" class="component-outline-input-grow" dense outlined
                     :placeholder="t('user_store.placeholder.admin_mail')"/>

            <h6 style="white-space: nowrap; margin-left: 12px!important;">{{
                $t('user_store.upsert.field.admin_nick')
              }}&nbsp;:</h6>
            <q-input v-model="upsertAdminNickName" class="component-outline-input-grow" dense outlined
                     :placeholder="t('user_store.placeholder.admin_nick')"/>

            <h6 class="cask-litter-title-asterisk" style="white-space: nowrap;">
              {{ $t('user_store.upsert.field.admin_role_name') }}&nbsp;:</h6>
            <q-input v-model="upsertAdminRoleName" class="component-outline-input-grow" dense outlined
                     :placeholder="t('user_store.placeholder.admin_role_name')"/>

            <h6 class="cask-litter-title-asterisk" style="white-space: nowrap;">
              {{ $t('user_store.upsert.field.admin_role_code') }}&nbsp;:</h6>
            <q-input v-model="upsertAdminRoleCode" class="component-outline-input-grow" dense outlined
                     :placeholder="t('user_store.placeholder.admin_role_code')"/>
          </template>

        </div>
        </div>

        <!-- 右列：仅编辑态。两块都是可增删的多行列表，放右侧避免把弹窗纵向拉长 -->
        <div v-if="!isNew" style="flex: 1 1 auto; min-width: 26rem;">
        <div style="display: grid; grid-template-columns: max-content 1fr; gap: 1.2rem; align-items: start;">

          <!-- 门店自身谷歌日历列表：逐条添加/删除，样式同技能别名维护；
               门店 block 时除各雇员日历外同时屏蔽这些日历 -->
          <h6 style="white-space: nowrap; margin-left: 12px!important; align-self: flex-start;">{{
              $t('user_store.upsert.field.google_calendar_ids')
            }}&nbsp;:</h6>
          <div>
            <div class="q-mb-xs" style="opacity: 0.5; font-size: 0.85rem">
              {{ $t('user_store.upsert.google_calendar_ids_hint') }}
            </div>
            <q-btn no-caps unelevated class="component-none-btn-mini-grow"
                   @click="addCalendarIdItem">
              <div class="row items-center justify-center">
                <q-icon name="fa-solid fa-plus" size="0.9rem"/>
                <div class="q-ml-xs" style="font-size: 0.85rem">
                  {{ $t('user_store.upsert.google_calendar_ids_add') }}
                </div>
              </div>
            </q-btn>

            <div v-if="upsertGoogleCalendarIdList.length === 0" class="q-mt-xs"
                 style="opacity: .5; font-size: .75rem;">
              {{ $t('user_store.upsert.google_calendar_ids_empty') }}
            </div>

            <div v-for="(calValue, calIndex) in upsertGoogleCalendarIdList" :key="calIndex"
                 class="row items-center q-mt-xs" style="gap: .5rem;">
              <q-input v-model="upsertGoogleCalendarIdList[calIndex]" class="component-outline-input-long-grow"
                       dense outlined :placeholder="t('user_store.placeholder.google_calendar_ids')"/>
              <q-btn no-caps unelevated class="component-none-btn-grow" @click="removeCalendarIdItem(calIndex)">
                <div class="row items-center">
                  <q-icon name="fa-solid fa-trash" size="1rem"/>
                </div>
              </q-btn>
            </div>
          </div>

          <!-- 门店共享资源位：名称由用户自定义，数量为全店并发容量 -->
          <h6 style="white-space: nowrap; margin-left: 12px!important; align-self: flex-start;">
            {{ $t('user_store.resource.field') }}&nbsp;:</h6>
          <div>
            <div class="q-mb-xs" style="opacity: 0.5; font-size: 0.85rem; max-width: 28rem">
              {{ $t('user_store.resource.note') }}
            </div>
            <q-btn no-caps unelevated class="component-none-btn-mini-grow" @click="addResourceItem">
              <div class="row items-center justify-center">
                <q-icon name="fa-solid fa-plus" size="0.9rem"/>
                <div class="q-ml-xs" style="font-size: 0.85rem">
                  {{ $t('user_store.resource.add') }}
                </div>
              </div>
            </q-btn>

            <div v-if="upsertResourceList.length === 0" class="q-mt-xs"
                 style="opacity: .5; font-size: .75rem;">
              {{ $t('user_store.resource.empty') }}
            </div>

            <div v-for="(resourceItem, resourceIndex) in upsertResourceList"
                 :key="resourceItem.id || `new-${resourceIndex}`"
                 class="row items-center q-mt-xs" style="gap: .5rem;">
              <q-input v-model="resourceItem.resourceName" class="component-outline-input-grow" dense outlined
                       :placeholder="t('user_store.resource.name_placeholder')"/>
              <q-input v-model.number="resourceItem.capacity" mask="###"  min="0"
                       class="component-outline-input-std" dense outlined
                       :placeholder="t('user_store.resource.capacity_placeholder')"/>
              <q-btn no-caps unelevated class="component-none-btn-grow"
                     @click="requestRemoveResource(resourceIndex)">
                <q-icon name="fa-solid fa-trash" size="1rem"/>
              </q-btn>
            </div>
          </div>

        </div>
        </div>

        </div>


        <div class="row q-mt-xl q-mb-md justify-evenly">
          <q-btn class="shadow-1 component-full-btn-grow" no-caps unelevated @click="upsertData">
            {{ isNew ? $t('user_store.upsert.save_add') : $t('user_store.upsert.save_update') }}
          </q-btn>

          <q-btn class="shadow-1 component-outline-btn-grow" no-caps unelevated @click="showUpsert = false">
            {{ $t('main_setting_cancel') }}
          </q-btn>

        </div>
      </q-card>
    </q-dialog>

    <cask-dialog-judgment v-model="showResourceDeleteConfirm"
                          :callback-method="confirmResourceDelete"
                          :dialog-judgment-data="{
                            title: $t('user_store.resource.delete_title'),
                            content: $t('user_store.resource.delete_warning', {name: resourceDeleteName}),
                            falseLabel: $t('user_store.resource.cancel'),
                            trueLabel: $t('user_store.resource.confirm')
                          }"/>

    <!-- 特殊备注配置：整体重建（保存覆盖旧配置，清空列表保存即全部删除） -->
    <q-dialog :model-value="showRemark" transition-hide="fade" no-backdrop-dismiss no-shake
              transition-show="fade" @hide="showRemark = false">
      <q-card class="component-cask-dialog-judgement-std" style="max-width: 2000px !important">
        <h5 style="font-weight: 600!important; margin-left: .5rem !important;">
          {{ $t('user_store.special_remark.title') }}
        </h5>

        <div class="q-mx-sm" style="opacity: 0.5; width: 25rem; font-size: 0.85rem">
          {{ $t('user_store.special_remark.note') }}
        </div>

        <q-separator class="component-separator-base" inset spaced="1rem"/>

        <div class="q-ma-md" style="min-width: 25rem">
          <q-btn no-caps unelevated class="component-none-btn-mini-grow"
                 @click="addRemarkItem">
            <div class="row items-center justify-center">
              <q-icon name="fa-solid fa-plus" size="0.9rem"/>
              <div class="q-ml-xs" style="font-size: 0.85rem">
                {{ $t('user_store.special_remark.add') }}
              </div>
            </div>
          </q-btn>

          <div v-if="remarkList.length === 0" class="q-mt-xs" style="opacity: .5; font-size: .75rem;">
            {{ $t('user_store.special_remark.empty') }}
          </div>

          <div v-for="(remarkValue, remarkIndex) in remarkList" :key="remarkIndex"
               class="row items-center q-mt-xs" style="gap: .5rem;">
            <q-input v-model="remarkList[remarkIndex]" class="component-outline-input-grow" dense outlined
                     :placeholder="t('user_store.special_remark.placeholder')"/>
            <q-btn no-caps unelevated class="component-none-btn-grow" @click="removeRemarkItem(remarkIndex)">
              <div class="row items-center">
                <q-icon name="fa-solid fa-trash" size="1rem"/>
              </div>
            </q-btn>
          </div>
        </div>

        <div class="row q-mt-xl q-mb-md justify-evenly">
          <q-btn class="shadow-1 component-full-btn-grow" no-caps unelevated @click="saveRemark">
            {{ $t('user_store.button.save') }}
          </q-btn>

          <q-btn class="shadow-1 component-outline-btn-grow" no-caps unelevated @click="showRemark = false">
            {{ $t('main_setting_cancel') }}
          </q-btn>
        </div>
      </q-card>
    </q-dialog>

  </div>
</template>


<script setup>
import {onMounted, ref} from "vue";
import {notifyTopPositive, notifyTopWarning} from "@/utils/notification-tools.js";
import {useI18n} from 'vue-i18n'
import CaskComplexTable from "@/ui/components/CaskComplexTable.vue";
import CaskDialogJudgment from "@/ui/components/CaskDialogJudgment.vue";
import {tableStore, tableStoreOperation} from "@/tables/store.js";
import {storeCreate, storeList, storeUpdate} from "@/api/store.js";
import {bookSpecialRemarkCreate, bookSpecialRemarkListSimple} from "@/api/book.js";
import {storeResourceDelete, storeResourceList, storeResourceSave} from "@/api/store-resource.js";
import {CommonStatusEnum, TimezoneOptEnum} from "@/constants/enums/common.js";


const {t} = useI18n()
const selectId = ref("")
const selectName = ref("")
const selectPhone = ref("")

function clearSearch() {
  selectId.value = ""
  selectName.value = ""
  selectPhone.value = ""
}

// create/update
const showUpsert = ref(false)
const isNew = ref(false)
const upsertName = ref("")
const upsertExternalName = ref("")
const upsertExternalNameZh = ref("")
const upsertAddress = ref("")
const upsertAddressZh = ref("")
const upsertPhone = ref("")
// 呼出电话：回访客户时先拨通的本店号码（电话需求页「拨打电话」用）
const upsertAiPhone = ref("")
const upsertOutboundPhone = ref("")
const upsertDesc = ref("")
// 门店自身谷歌日历 id 列表（门店 block 时一并屏蔽）；仅编辑时可维护，创建不提供该字段
const upsertGoogleCalendarIdList = ref([])
const upsertResourceList = ref([])
const loadedResourceSignature = ref('[]')
const showResourceDeleteConfirm = ref(false)
const resourceDeleteIndex = ref(-1)
const resourceDeleteName = ref('')

function addCalendarIdItem() {
  upsertGoogleCalendarIdList.value.push('')
}

function removeCalendarIdItem(calIndex) {
  upsertGoogleCalendarIdList.value.splice(calIndex, 1)
}

// 资源位与门店字段是两个独立接口：用签名比对，无改动就不发资源保存请求，
// 避免「只改了门店电话」也去写资源表、以及门店保存失败时留下多余的部分写入
function resourceSignature(list) {
  return JSON.stringify((list || []).map(item =>
      [item.id || '', (item.resourceName || '').trim(), item.capacity]))
}

function loadStoreResources(storeId) {
  upsertResourceList.value = []
  loadedResourceSignature.value = resourceSignature([])
  storeResourceList(storeId).then(res => {
    if (!res || !res.data) {
      return
    }
    upsertResourceList.value = (res.data.data || []).map(item => ({...item}))
    loadedResourceSignature.value = resourceSignature(upsertResourceList.value)
  })
}

function addResourceItem() {
  upsertResourceList.value.push({id: null, resourceName: '', capacity: 1})
}

function requestRemoveResource(index) {
  const item = upsertResourceList.value[index]
  if (!item || !item.id) {
    upsertResourceList.value.splice(index, 1)
    return
  }
  resourceDeleteIndex.value = index
  resourceDeleteName.value = item.resourceName || ''
  showResourceDeleteConfirm.value = true
}

function confirmResourceDelete(confirmed) {
  showResourceDeleteConfirm.value = false
  if (!confirmed || resourceDeleteIndex.value < 0) {
    return
  }
  const item = upsertResourceList.value[resourceDeleteIndex.value]
  if (!item || !item.id) {
    return
  }
  storeResourceDelete(item.id, updateId.value).then(res => {
    if (!res || !res.data) {
      return
    }
    upsertResourceList.value.splice(resourceDeleteIndex.value, 1)
    // 删除已即时落库，同步基线签名，否则之后保存会把未改动的资源再写一遍
    loadedResourceSignature.value = resourceSignature(upsertResourceList.value)
    resourceDeleteIndex.value = -1
    notifyTopPositive(t('user_store.resource.delete_success'))
  })
}
const upsertTimezone = ref(null)
const upsertAdminMail = ref("")
const upsertAdminNickName = ref("")
const upsertAdminRoleName = ref("")
const upsertAdminRoleCode = ref("")
const timezoneOptions = ref(TimezoneOptEnum.toSelectForm())

const updateId = ref("")

function clearUpsertParam() {
  upsertName.value = ""
  upsertExternalName.value = ""
  upsertExternalNameZh.value = ""
  upsertAddress.value = ""
  upsertAddressZh.value = ""
  upsertPhone.value = ""
  upsertAiPhone.value = ""
  upsertOutboundPhone.value = ""
  upsertDesc.value = ""
  upsertGoogleCalendarIdList.value = []
  upsertResourceList.value = []
  loadedResourceSignature.value = '[]'
  upsertTimezone.value = null
  upsertAdminMail.value = ""
  upsertAdminNickName.value = ""
  upsertAdminRoleName.value = ""
  upsertAdminRoleCode.value = ""
}

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
    notifyTopWarning(t('validation.insufficient_parameters'))
    return;
  }

  if (isNew.value) {
    if (!upsertAdminMail.value || !upsertAdminRoleName.value || !upsertAdminRoleCode.value) {
      notifyTopWarning(t('validation.insufficient_parameters'))
      return;
    }
    const body = {
      name: upsertName.value,
      externalName: upsertExternalName.value,
      externalNameZh: upsertExternalNameZh.value,
      address: upsertAddress.value,
      addressZh: upsertAddressZh.value,
      phone: upsertPhone.value,
      aiPhone: upsertAiPhone.value,
      outboundPhone: upsertOutboundPhone.value,
      description: upsertDesc.value,
      timezone: upsertTimezone.value ? upsertTimezone.value.value : null,
      adminMail: upsertAdminMail.value,
      adminNickName: upsertAdminNickName.value,
      adminRoleName: upsertAdminRoleName.value,
      adminRoleCode: upsertAdminRoleCode.value,
    }
    storeCreate(body).then(res => {
      if (!res || !res.data) {
        return
      }
      clearUpsertParam()
      showUpsert.value = false
      notifyTopPositive(t('user_store.notify.create_success'))
      selectData(true)
    })
  } else {
    if (!updateId.value) {
      notifyTopWarning(t('validation.insufficient_parameters'))
      return;
    }
    const body = {
      name: upsertName.value,
      externalName: upsertExternalName.value,
      externalNameZh: upsertExternalNameZh.value,
      address: upsertAddress.value,
      addressZh: upsertAddressZh.value,
      phone: upsertPhone.value,
      aiPhone: upsertAiPhone.value,
      outboundPhone: upsertOutboundPhone.value,
      description: upsertDesc.value,
      // 始终传数组=整体覆盖：空数组即清空（后端 null 才视为不修改）
      googleCalendarIdList: upsertGoogleCalendarIdList.value,
    }
    const normalizedResources = upsertResourceList.value.map(item => ({
      id: item.id || null,
      resourceName: (item.resourceName || '').trim(),
      // 清空数量输入框拿到的是空串，Number('') === 0 会被静默存成「停用该资源」，这里必须先挡掉
      capacity: (item.capacity === '' || item.capacity === null || item.capacity === undefined)
          ? null : Number(item.capacity),
    }))
    const resourceNames = normalizedResources.map(item => item.resourceName.toLowerCase())
    if (normalizedResources.some(item => !item.resourceName || !Number.isInteger(item.capacity) || item.capacity < 0)
        || new Set(resourceNames).size !== resourceNames.length) {
      notifyTopWarning(t('user_store.resource.invalid'))
      return
    }
    // 资源位先在后端事务内校验并保存（删除不走此接口，必须逐项二次确认）；无改动则整个跳过。
    const resourcesChanged = resourceSignature(normalizedResources) !== loadedResourceSignature.value
    const savedResources = resourcesChanged
        ? storeResourceSave({resourceList: normalizedResources}, updateId.value)
        : Promise.resolve(true)
    savedResources.then(resourceRes => {
      if (!resourceRes || (resourcesChanged && !resourceRes.data)) {
        return null
      }
      if (resourcesChanged) {
        loadedResourceSignature.value = resourceSignature(normalizedResources)
      }
      return storeUpdate(updateId.value, body)
    }).then(res => {
      if (!res || !res.data) {
        return
      }
      clearUpsertParam()
      showUpsert.value = false
      notifyTopPositive(t('user_store.notify.update_success'))
      selectData(true)
    })
  }
}

// 特殊备注配置（按行门店整体重建：打开时拉取现有备注，保存时全量覆盖）
const showRemark = ref(false)
const remarkList = ref([])

function openRemark() {
  bookSpecialRemarkListSimple().then(res => {
    if (!res || !res.data) {
      return
    }
    remarkList.value = res.data.data || []
    showRemark.value = true
  })
}

function addRemarkItem() {
  remarkList.value.push('')
}

function removeRemarkItem(remarkIndex) {
  remarkList.value.splice(remarkIndex, 1)
}

function saveRemark() {
  bookSpecialRemarkCreate({contents: remarkList.value}).then(res => {
    if (!res || !res.data) {
      return
    }
    showRemark.value = false
    notifyTopPositive(t('user_store.special_remark.notify_success'))
  })
}

// 默认从第一页开始查询；行操作后刷新时传 keepPage = true 保持当前页
function selectData(keepPage = false) {
  if (!keepPage) {
    tableDynamicData.value.pageNo = 1
  }
  tableDynamicData.value.inLoading = true
  const param = {
    id: selectId.value,
    name: selectName.value,
    phone: selectPhone.value,
    pageNo: tableDynamicData.value.pageNo, pageSize: tableDynamicData.value.pageSize,
  }
  storeList(param).then(res => {
    if (!res || !res.data || !res.data.data) {
      tableDynamicData.value.inLoading = false
      return
    }
    const thisData = res.data.data.records
    tableDynamicData.value.dataSum = res.data.data.total
    thisData.forEach(data => {
      const statusEnum = CommonStatusEnum.fromCode(data.status)
      data.statusName = statusEnum.name
      data.statusNameWebColorName = statusEnum.color
      // 未匹配到预设时区时直接展示原始值
      const timezoneEnum = TimezoneOptEnum.fromCode(data.timezone)
      data.timezoneName = timezoneEnum ? timezoneEnum.name : (data.timezone || '')
      data.updateOp = true
      data.remarkOp = true
    })
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
