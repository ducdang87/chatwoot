<script setup>
import { computed } from 'vue';
import { useMessageContext } from '../provider';
import BaseBubble from './Base.vue';
import Button from 'next/button/Button.vue';
const { contentAttributes, content } = useMessageContext();

const getItem = computed(() => {
  const items =
    contentAttributes.value?.items?.filter(x =>
      x.title?.includes('###Item:')
    ) || [];
  const item = items[0];
  const linkAction = item.actions?.find(x => x.type === 'link');
  const message =
    content.value?.replace(/^###Item:\s*\d+.*(?:\r?\n)?/m, '') || null;

  return {
    ...item,
    link: linkAction?.uri,
    message,
  };
});
</script>

<template>
  <BaseBubble class="px-3 py-3" data-bubble-name="card-item">
    <div class="flex flex-col gap-2 max-w-72">
      <div class="rounded-base shadow-xs flex gap-2">
        <img class="rounded-md w-20 h-20" :src="getItem.mediaUrl" alt="" />
        <div class="flex flex-col gap-3">
          <span
            class="line-clamp-2 text-n-slate-11"
            :title="getItem.description"
            >{{ $t(getItem.description) }}</span
          >
          <Button size="small" icon="i-lucide-external-link">
            <a :href="getItem.link" target="_blank" rel="noopener noreferrer">
              {{ $t('Xem ngay') }}</a
            >
          </Button>
        </div>
      </div>
      <span v-if="getItem.message" class="text-base">{{
        getItem.message
      }}</span>
    </div>
  </BaseBubble>
</template>
