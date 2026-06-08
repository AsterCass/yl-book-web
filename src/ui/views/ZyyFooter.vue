<template>
  <div v-if="simple" class="bottom-footer-base-simple row items-center justify-center">

    <div class="q-mx-md">
      &copy; 2007-{{ curYear }}&nbsp;&nbsp;&nbsp;远元健康科技集团有限公司
    </div>

    <div class="q-mx-md">
      开发者邮箱:&nbsp;&nbsp;&nbsp;astercass@qq.com
    </div>

  </div>

  <div v-else>
    todo
  </div>
</template>

<script setup>

import {useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import {date} from "quasar";

const thisRouter = useRouter()

const curYear = ref("2020")

const props = defineProps({
  simple: {
    type: Boolean,
    required: false,
    default: true,
  },
});


onMounted(() => {
  const timeStamp = new Date()
  curYear.value = date.formatDate(timeStamp, 'YYYY')
})


</script>

<style scoped lang="scss">


.bottom-footer-base-simple {
  padding: 0.5rem 2rem 0.6rem 2rem;
  color: rgb(var(--text-color));
  background-color: rgb(var(--container-background-color));
  backdrop-filter: blur(30px);
  min-height: 3rem;

  a {
    color: rgb(var(--text-color));
  }
}

</style>