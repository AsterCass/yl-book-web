<template>
  <div>
    dashboard
  </div>
</template>


<script setup>


import {onMounted} from "vue";
import {checkLoginFromCookie} from "@/utils/common.js";
import {backToLogin} from "@/router/index.js";
import {useRouter} from "vue-router";

const thisRouter = useRouter()

function checkLogin() {
  const isLogin = checkLoginFromCookie()
  if (!isLogin) {
    backToLogin(thisRouter)
  }
}

onMounted(() => {
  checkLogin()
})



</script>


<style scoped>

</style>