<script setup>
import { computed } from 'vue';
import { useMessageContext } from '../provider';
import BaseBubble from './Base.vue';
import Button from 'next/button/Button.vue';
const { contentAttributes } = useMessageContext();

const getItem = computed(() => {
  const items =
    contentAttributes.value?.items?.filter(x =>
      x.title?.includes('###Item:')
    ) || [];
  const item = items[0];
  const linkAction = item.actions.find(x => x.type === 'link');

  return {
    ...item,
    link: linkAction.uri,
  };
});
</script>

<template>
  <BaseBubble class="px-4 py-3" data-bubble-name="csat">
    <div class="max-w-60 rounded-base shadow-xs flex flex-col gap-2">
      <img class="rounded-md" :src="getItem.mediaUrl" alt="" />
      <span class="text-base">{{ $t(getItem.description) }}</span>

      <Button icon="i-lucide-external-link">
        <a :href="getItem.link" target="_blank" rel="noopener noreferrer">
          {{ $t('Xem ngay') }}</a
        >
      </Button>
    </div>
  </BaseBubble>
</template>
