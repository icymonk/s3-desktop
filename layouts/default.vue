<template>
  <NLayout has-sider>
    <NLayoutSider
      :collapsed="sideCollapsed"
      :width="200"
      collapse-mode="width"
      bordered
      show-trigger
      @expand="sideCollapsed = false"
      @collapse="sideCollapsed = true"
    >
      <AppSidebar
        @click:add="onClickAddWorkspace"
        @click:setting="onClickEditWorkspace"
      ></AppSidebar>
    </NLayoutSider>

    <NLayout>
      <NLayoutHeader>
        <AppHeader :elRef="elRef" @click:menu="onClickMenu"></AppHeader>
      </NLayoutHeader>

      <div ref="elRef"></div>

      <NLayoutContent>
        <slot></slot>
      </NLayoutContent>
    </NLayout>
  </NLayout>

  <NModal v-model:show="addWorkspaceShow">
    <AddWorkspace @close="onCloseAddWorkspace"></AddWorkspace>
  </NModal>

  <NModal v-model:show="editWorkspaceShow">
    <EditWorkspace @close="onCloseEditWorkspace"></EditWorkspace>
  </NModal>
</template>

<script lang="ts" setup>
import {
  NModal,
  NLayout,
  NLayoutSider,
  NLayoutContent,
  NLayoutHeader,
} from 'naive-ui'
import AddWorkspace from '~/containers/AddWorkspace.vue'
import AppHeader from '~/containers/AppHeader.vue'
import AppSidebar from '~/containers/AppSidebar.vue'
import EditWorkspace from '~/containers/EditWorkspace.vue'

const sideCollapsed = ref(true)
const elRef = ref()

function onClickMenu() {
  sideCollapsed.value = !sideCollapsed.value
}

const addWorkspaceShow = ref(false)
function onClickAddWorkspace() {
  addWorkspaceShow.value = true
}

function onCloseAddWorkspace() {
  addWorkspaceShow.value = false
}

const editWorkspaceShow = ref(false)
function onClickEditWorkspace() {
  editWorkspaceShow.value = true
}

function onCloseEditWorkspace() {
  editWorkspaceShow.value = false
}
</script>
