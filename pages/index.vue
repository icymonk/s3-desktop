<template>
  <div class="index">
    <NResult status="info" :title="$t('selectWorkspace')"></NResult>
  </div>
</template>

<script lang="ts" setup>
import { NResult } from 'naive-ui'
import { useAuthStore } from '~/store/auth'

const auth$ = useAuthStore()
const localePath = useLocalePath()

if (auth$.currentWorkspace) {
  navigateTo(localePath('/b'))
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
