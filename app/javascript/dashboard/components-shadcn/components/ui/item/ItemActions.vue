<script setup>
import { cn } from 'dashboard/lib/utils';

const props = defineProps({
  class: { type: null, required: false },
});
</script>

<template>
  <div
    data-slot="item-actions"
    :class="cn('flex items-center gap-2', props.class)"
  >
    <slot />
  </div>
</template>
