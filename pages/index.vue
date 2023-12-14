<template>
  <div class="index">
    <NResult status="info" title="워크스페이스를 선택해주세요."></NResult>
  </div>
</template>

<script lang="ts" setup>
import { NResult } from 'naive-ui'
import { useAuthStore } from '~/store/auth'

const auth$ = useAuthStore()

if (auth$.currentWorkspace) {
  navigateTo('/b')
}
</script>

<style lang="scss" scoped>
.index {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
}
</style>
