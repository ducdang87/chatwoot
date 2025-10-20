<script setup>
import { TabsRoot, useForwardPropsEmits } from 'reka-ui';

const props = defineProps({
  defaultValue: { type: null, required: false },
  orientation: { type: String, required: false },
  dir: { type: String, required: false },
  activationMode: { type: String, required: false },
  modelValue: { type: null, required: false },
  unmountOnHide: { type: Boolean, required: false },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
});
const emit = defineEmits(['update:modelValue']);

const forwarded = useForwardPropsEmits(props, emit);
</script>

<template>
  <TabsRoot v-bind="forwarded">
    <slot />
  </TabsRoot>
</template>
