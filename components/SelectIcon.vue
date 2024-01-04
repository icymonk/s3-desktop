<template>
  <NPopover ref="popoverRef" placement="bottom" trigger="click">
    <template #trigger>
      <slot name="trigger">
        <NButton text circle>
          <component
            :is="icons[value as keyof typeof icons]"
            class="select-icons__icon"
          ></component>
        </NButton>
      </slot>
    </template>

    <NCard :style="cardStyle" :content-style="contentStyle">
      <template #header>
        <NInput v-model:value="searchText" autofocus></NInput>
      </template>

      <NTooltip
        v-for="item in filtered"
        :key="item"
        trigger="hover"
        placement="top"
      >
        <template #trigger>
          <NButton text circle @click="onClickItem(item)">
            <component
              :is="icons[item as keyof typeof icons]"
              class="select-icons__icon"
            ></component>
          </NButton>
        </template>

        <div>{{ item }}</div>
      </NTooltip>
    </NCard>
  </NPopover>
</template>

<script lang="ts" setup>
import * as icons from '@vicons/ionicons5'
import { NInput, NTooltip, NPopover, NCard, NButton } from 'naive-ui'
import type { CSSProperties } from 'vue'
import { ICON_NAMES } from '~/configs/icon'

export type SelectIconProps = {
  icons?: string[]
  value?: string
  width?: number
  height?: number
}

const emit = defineEmits(['update:value'])
const props = withDefaults(defineProps<SelectIconProps>(), {
  icons: () => ICON_NAMES,
  value: '',
  width: 400,
  height: 400,
})

const popoverRef = ref()

const cardStyle = computed(() => ({
  width: props.width + 'px',
  minHeight: props.height + 'px',
  maxHeight: props.height + 'px',
  overflow: 'auto',
}))

const contentStyle = computed<CSSProperties>(() => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '4px',
  flex: 'unset',
  height: props.height + 'px',
  overflow: 'auto',
}))

const searchText = ref('')

const filtered = computed(() =>
  props.icons.filter((item) =>
    item.toLowerCase().includes(searchText.value.toLowerCase()),
  ),
)

function onClickItem(item: any) {
  console.log('onClickItem', item)
  emit('update:value', item)
  popoverRef.value?.setShow(false)
}
</script>

<style lang="scss" scoped>
.select-icons__icon {
  width: 20px;
  height: 20px;
}
</style>
