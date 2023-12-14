<template>
  <NSpace class="app-header" justify="space-between" align="center">
    <NSpace>
      <NButton text circle @click="onClickMenu">
        <template #icon>
          <NIcon>
            <MenuOutline></MenuOutline>
          </NIcon>
        </template>
      </NButton>

      <NBreadcrumb>
        <NBreadcrumbItem @click="onClickHome">
          <NDropdown
            :options="workspaceItems.length > 1 ? workspaceItems : []"
            @select="onSelectWorkspace"
          >
            <NButton
              type="info"
              text
              @click="onSelectWorkspace(auth$.currentWorkspace?.name)"
            >
              {{ auth$.currentWorkspace?.name }}
            </NButton>
          </NDropdown>
        </NBreadcrumbItem>

        <NBreadcrumbItem>
          <NDropdown
            :options="bucketItems.length > 1 ? bucketItems : []"
            @select="onSelectBucket"
          >
            <NButton
              type="info"
              text
              @click="onSelectBucket($route.params.bucket)"
            >
              {{ $route.params.bucket }}
            </NButton>
          </NDropdown>
        </NBreadcrumbItem>

        <NBreadcrumbItem v-for="(item, index) in breadcrumbItems">
          <NButton text @click="onClickBreadcrumb(item, index)">
            {{ item }}
          </NButton>
        </NBreadcrumbItem>
      </NBreadcrumb>
    </NSpace>
  </NSpace>
</template>

<script lang="ts" setup>
import { MenuOutline, SettingsOutline } from '@vicons/ionicons5'
import {
  NButton,
  NSpace,
  NBreadcrumb,
  NBreadcrumbItem,
  NDropdown,
  NIcon,
} from 'naive-ui'
import { useAuthStore } from '~/store/auth'
import { useS3Store } from '~/store/s3'

const emit = defineEmits(['click:menu'])

const route = useRoute()

const auth$ = useAuthStore()
const s3$ = useS3Store()

const workspaceItems = computed(() =>
  auth$.workspaces.map((item) => ({ label: item.name, key: item.name })),
)

const bucketItems = computed(() =>
  s3$.buckets.map((item) => ({ label: item.Name, key: item.Name })),
)
const breadcrumbItems = computed(() => route.path.split('/').slice(3))

function onClickMenu() {
  console.log('onClickMenu')
  emit('click:menu')
}

function onClickHome() {
  navigateTo('/')
}

function onSelectBucket(bucket: any) {
  console.log('onSelectBucket')

  navigateTo(`/b/${bucket}`)
}

function onSelectWorkspace(workspace: any) {
  console.log('onSelectWorkspace!', workspace)

  auth$.currentKey = workspace
}

function onClickBreadcrumb(item: any, index: number) {
  if (breadcrumbItems.value.length === index + 1) return

  console.log('onClickBreadcrumb', item)
  const _path = route.path.split('/')
  const path = ['', 'b', ..._path.slice(2 + index, _path.length - index - 1)]
  console.log(path.join('/'))

  navigateTo(path.join('/'))
}
</script>

<style lang="scss" scoped>
.app-header {
  padding: 16px;
}
</style>
