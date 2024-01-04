<template>
  <div class="index">
    <NResult status="info" :title="$t('selectWorkspace')"></NResult>
  </div>
</template>

<script lang="ts" setup>
import { NResult } from 'naive-ui'
import { useAuthStore } from '~/store/auth'
import IntroJs from 'intro.js'
import 'intro.js/introjs.css'

const auth$ = useAuthStore()
const localePath = useLocalePath()

if (auth$.currentWorkspace) {
  navigateTo(localePath('/b'))
}

if (!auth$.workspaces.length) {
  onMounted(async () => {
    const intro = await IntroJs().start()
    console.log('intro', intro)
  })
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
