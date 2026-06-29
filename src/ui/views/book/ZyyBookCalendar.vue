<template>
  <div class="full-width">
    <div class="row items-center">

      <div class="q-ml-md">
        <h6>
          {{ $t('book_calendar.date_start') }}&nbsp;:
        </h6>
      </div>
      <q-input v-model="dateStart" class="q-ma-md component-outline-input-std" dense outlined
               type="date"
               tabindex="0">
      </q-input>

      <div class="q-ml-md">
        <h6>
          {{ $t('book_calendar.date_end') }}&nbsp;:
        </h6>
      </div>
      <q-input v-model="dateEnd" class="q-ma-md component-outline-input-std" dense outlined
               type="date"
               tabindex="0">
      </q-input>

    </div>

    <div class="row">
      <q-btn class="q-ma-md shadow-2 component-full-btn-grow" no-caps push unelevated
             :loading="inLoading"
             @click="selectData">
        {{ $t('book_calendar.button.query') }}
      </q-btn>
    </div>

    <!-- Loading state -->
    <div v-if="inLoading" class="text-center q-pa-xl">
      <q-spinner size="3rem"/>
    </div>

    <!-- Empty state -->
    <div v-else-if="groupedBookings.length === 0" class="text-center q-pa-xl" style="opacity: 0.5">
      {{ $t('book_calendar.no_data') }}
    </div>

    <!-- Grouped results -->
    <div v-else v-for="group in groupedBookings" :key="group.date" class="q-mx-md q-mb-lg"
         style="padding: 0 5rem 0 0.5rem">
      <h6 class="q-mb-sm" style="font-weight: 600;">{{ group.date }}</h6>
      <q-card v-for="booking in group.bookings" :key="booking.id"
              class="q-mb-sm component-extra-card-std">
        <q-card-section class="row items-center">
          <div
              :style="{ width: '10px', height: '10px', borderRadius: '50%', background: booking.statusColor, flexShrink: 0 }"
              class="q-mr-md"></div>
          <div class="col">
            <div class="row items-center" style="gap: 1rem;">
              <strong>{{ booking.name }}</strong>
              <span style="opacity: 0.6; font-size: 0.85rem;">{{ booking.bookingTime }}</span>
            </div>
            <div v-if="booking.staffName" class="q-mt-xs" style="font-size: 0.85rem; opacity: 0.7;">
              服务人员: {{ booking.staffName }} {{ booking.staffPhone ? '(' + booking.staffPhone + ')' : '' }}
            </div>
            <div v-if="booking.bookProjectNameDisplay" class="q-mt-xs" style="font-size: 0.85rem; opacity: 0.7;">
              预约项目: {{ booking.bookProjectNameDisplay }}
            </div>
          </div>
          <div class="q-ml-md">
            <q-badge :style="{ background: booking.statusColor }" style="color: white; padding: 4px 8px;">
              {{ booking.statusName }}
            </q-badge>
          </div>
        </q-card-section>
      </q-card>
    </div>

  </div>
</template>

<script setup>
import {onMounted, ref, computed} from "vue";
import {useI18n} from 'vue-i18n'
import {notifyTopWarning} from "@/utils/notification-tools.js";
import {bookList} from "@/api/book.js";
import {BookStatusEnum} from "@/constants/enums/book.js";

const {t} = useI18n()
const dateStart = ref("")
const dateEnd = ref("")
const inLoading = ref(false)
const allBookings = ref([])

function setDefaultDateRange() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  dateStart.value = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const lastDay = new Date(year, month + 1, 0).getDate()
  dateEnd.value = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
}

const groupedBookings = computed(() => {
  const groups = {}
  for (const booking of allBookings.value) {
    const dateKey = booking.bookingTime ? booking.bookingTime.substring(0, 10) : 'unknown'
    if (!groups[dateKey]) groups[dateKey] = []
    const statusEnum = BookStatusEnum.fromCode(booking.status)
    booking.statusName = statusEnum ? statusEnum.name : '未知'
    booking.statusColor = statusEnum ? statusEnum.color : 'rgb(128, 128, 128)'
    if (booking.bookProjectName && Array.isArray(booking.bookProjectName)) {
      booking.bookProjectNameDisplay = booking.bookProjectName.join(',')
    }
    groups[dateKey].push(booking)
  }
  return Object.keys(groups).sort().map(date => ({
    date,
    bookings: groups[date]
  }))
})

function selectData() {
  if (!dateStart.value || !dateEnd.value) {
    notifyTopWarning(t('validation.insufficient_parameters'))
    return
  }
  inLoading.value = true
  bookList({
    bookingTimeStartStr: dateStart.value,
    bookingTimeEndStr: dateEnd.value,
    pageNo: 1,
    pageSize: 9999,
  }).then(res => {
    if (!res || !res.data || !res.data.data) {
      allBookings.value = []
      inLoading.value = false
      return
    }
    allBookings.value = res.data.data.records || []
    inLoading.value = false
  })
}

onMounted(() => {
  setDefaultDateRange()
  selectData()
})
</script>

<style scoped lang="scss">

</style>
