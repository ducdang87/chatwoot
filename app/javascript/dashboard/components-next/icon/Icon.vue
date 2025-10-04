<script setup>
import { h, isVNode } from 'vue';
import { Icon as IconifyIcon } from '@iconify/vue';

const props = defineProps({
  icon: { type: [String, Object, Function], required: true },
});

const renderIcon = () => {
  if (!props.icon) return null;

  // Handle function or VNode icons
  if (typeof props.icon === 'function' || isVNode(props.icon)) {
    return props.icon;
  }

  // Handle Iconify icons (format: "prefix:icon-name")
  if (typeof props.icon === 'string' && props.icon.includes(':')) {
    return h(IconifyIcon, { icon: props.icon });
  }

  // Handle CSS class icons (existing behavior)
  return h('span', { class: props.icon });
};
</script>

<template>
  <component :is="renderIcon" />
</template>
