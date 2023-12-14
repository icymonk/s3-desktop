<template>
  <NMessageProvider>
    <NuxtLayout>
      <NuxtPage></NuxtPage>
    </NuxtLayout>
  </NMessageProvider>
</template>

<script lang="ts" setup>
import { NMessageProvider } from 'naive-ui'
import { useAuthStore } from './store/auth'
import { useS3Store } from './store/s3'

const auth$ = useAuthStore()
const s3$ = useS3Store()

await auth$.loadWorkspace()
// await auth$.saveWorkspace()

s3$.initWorkspace(auth$.currentWorkspace)
const pinia = usePinia()

watch(
  pinia.state,
  (state) => {
    // persist the whole state to the local storage whenever it changes
    localStorage.setItem('piniaState', JSON.stringify(state))
  },
  { deep: true },
)
</script>
