<script setup>
import { ref } from 'vue';
import NextButton from 'dashboard/components-next/button/Button.vue';
import MarketplaceItemSearchModal from './MarketplaceItemSearchModal.vue';

const props = defineProps({
  currentContact: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['send-marketplace-item']);

const showMarketplaceItemSearchModal = ref(false);
const sendItemId = itemId => {
  emit('send-marketplace-item', itemId);
  showMarketplaceItemSearchModal.value = false;
};
</script>

<template>
  <NextButton
    v-tooltip.top-end="$t('CONVERSATION.FOOTER.INSERT_PRODUCT')"
    icon="i-lucide-shopping-bag"
    slate
    faded
    sm
    @click="showMarketplaceItemSearchModal = true"
  />
  <div>
    <woot-modal
      v-model:show="showMarketplaceItemSearchModal"
      :on-close="() => (showMarketplaceItemSearchModal = false)"
    >
      <MarketplaceItemSearchModal
        :current-contact="props.currentContact"
        @send-item-id="sendItemId"
      />
    </woot-modal>
  </div>
</template>
