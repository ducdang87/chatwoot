<script setup>
import shipxanhAPI from 'dashboard/api/shipxanhAPI';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from 'dashboard/components-shadcn/components/ui/empty';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from 'dashboard/components-shadcn/components/ui/item';
import { useRequest } from 'dashboard/composables/useRequest';
import { minBy, maxBy, sumBy } from 'lodash';
import Button from 'next/button/Button.vue';
import Icon from 'next/icon/Icon.vue';
import { ref, watch } from 'vue';

const props = defineProps({
  currentContact: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['send-item-id']);
const searchQuery = ref('');
let timeout = null;
const isInputFocused = ref(false);
const tab = ref('shop');

const onFocus = () => {
  isInputFocused.value = true;
};

const onBlur = () => {
  isInputFocused.value = false;
};

const onInput = e => {
  searchQuery.value = e.target.value;
};

const { data, isLoading, execute } = useRequest(async query => {
  const { shopId, shopType } = props.currentContact.custom_attributes || {};

  const res = await shipxanhAPI.get(
    tab.value === 'shop'
      ? `shops/items/${shopType}/${shopId}?searchTerm=${query}&page=0&forceRefresh=false&sortBy=UPDATE_TIME_DESC&size=20`
      : `products?searchTerm=${query}&page=0&size=20&isVirtual=false`
  );
  return (res.items || []).map(x => {
    const minPrice = minBy(x.models, 'price').price;
    const maxPrice = maxBy(x.models, 'price').price;
    return {
      name: x.name,
      id: x.id,
      image: x.images?.[0]?.publicUrl?.replace('_tn', ''),
      stock: sumBy(x.models, 'sellableStock').toLocaleString(),
      price:
        maxPrice === minPrice
          ? `${maxPrice.toLocaleString()}`
          : `${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}`,
    };
  });
});

watch(
  [tab, searchQuery],
  // eslint-disable-next-line no-unused-vars
  ([_, newQuery]) => {
    if (timeout) clearTimeout(timeout);
    if (!newQuery) {
      execute(newQuery);
    } else {
      timeout = setTimeout(() => {
        execute(newQuery);
      }, 300);
    }
  },
  {
    immediate: true,
  }
);

const sendItemId = itemId => {
  emit('send-item-id', {
    content_attributes: {
      itemId,
    },
  });
};
const openLinkShop = () => {
  window.open('https://app.shipxanh.com/dashboard/connect/shops', '_self');
};
</script>

<template>
  <div>
    <woot-modal-header />

    <div class="flex flex-col gap-2 px-2 mt-6 mb-2">
      <div
        class="input-container rounded-xl transition-[border-bottom] duration-[0.2s] ease-[ease-in-out] relative flex items-center py-2 px-4 h-14 gap-2 border border-solid bg-n-alpha-black2"
        :class="{
          'border-n-brand': isInputFocused,
          'border-n-weak': !isInputFocused,
        }"
      >
        <div class="flex items-center">
          <Icon
            v-if="isLoading"
            icon="i-lucide-loader-circle"
            class="animate-spin"
          />
          <fluent-icon
            v-else
            icon="search"
            class="icon"
            aria-hidden="true"
            :class="{
              'text-n-blue-text': isInputFocused,
              'text-n-slate-10': !isInputFocused,
            }"
          />
        </div>
        <input
          type="search"
          class="reset-base outline-none w-full m-0 bg-transparent border-transparent shadow-none text-n-slate-12 dark:text-n-slate-12 active:border-transparent active:shadow-none hover:border-transparent hover:shadow-none focus:border-transparent focus:shadow-none"
          :placeholder="$t('SEARCH.INPUT_PLACEHOLDER')"
          :value="searchQuery"
          @focus="onFocus"
          @blur="onBlur"
          @input="onInput"
        />
      </div>

      <div
        v-if="data?.length > 0"
        class="flex flex-col gap-2 overflow-y-auto max-h-[600px]"
      >
        <div v-for="item in data" :key="item.id">
          <Item variant="muted" class="bg-n-slate-2">
            <ItemMedia>
              <img
                :src="item.image"
                :alt="item.name"
                width="80"
                height="80"
                class="object-cover rounded-sm"
              />
            </ItemMedia>
            <ItemContent>
              <ItemTitle class="line-clamp-2">{{ item.name }}</ItemTitle>
              <ItemDescription>
                <span class="text-sm text-green-600">{{ item.price }}</span
                ><br />
                <span class="text-sm">{{ $t('Tồn:') }} {{ item.stock }}</span>
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button
                size="small"
                label="Gửi"
                icon="i-lucide-send"
                @click="sendItemId(item.itemId)"
              />
            </ItemActions>
          </Item>
        </div>
      </div>
      <div v-else-if="!isLoading">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{{ $t('Không tìm thấy') }}</EmptyTitle>
            <EmptyDescription>
              {{ $t('Hãy thử liên kết Shop để tìm kiếm sản phẩm') }}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button icon="i-lucide-link" @click="openLinkShop">
              {{ $t('Liên kết shop') }}
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    </div>
  </div>
</template>
