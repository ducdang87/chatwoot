<script setup>
import { h, isVNode } from 'vue';
import { Icon as IconifyIcon } from '@iconify/vue';

const props = defineProps({
  icon: { type: [String, Object, Function], required: true },
});

const renderIcon = () => {
  let icon = props.icon;
  if (!icon) return null;

  if (icon.includes('tiktok')) {
    icon = 'i-woot-tiktokshop';
  }

  // Handle function or VNode icons
  if (typeof icon === 'function' || isVNode(icon)) {
    return icon;
  }

  // Handle Iconify icons (format: "prefix:icon-name")
  if (typeof icon === 'string' && icon.includes(':')) {
    return h(IconifyIcon, { icon: icon });
  }

  // Handle CSS class icons (existing behavior)
  return h('span', { class: icon });
};
</script>

<template>
  <component :is="renderIcon" />
</template>
