<script>
import Icon from 'next/icon/Icon.vue';
import OrderItems from './OrderItems.vue';
import shipxanhAPI from 'dashboard/api/shipxanhAPI';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from 'dashboard/components-shadcn/components/ui/tabs';

export default {
  name: 'OrderInfo',
  components: {
    Icon,
    OrderItems,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  },
  data() {
    return {
      orderInfo: null,
      loading: false,
      error: null,
    };
  },
  async mounted() {
    await this.fetchOrderInfo();
  },
  methods: {
    async fetchOrderInfo() {
      this.loading = true;
      this.error = null;

      try {
        // Gọi API lấy order info với ID 74257508
        const res = await shipxanhAPI.getOrderInfo('74257508');
        this.orderInfo = res.data;
        // eslint-disable-next-line no-console
      } catch (error) {
        this.error = error.message;
        // eslint-disable-next-line no-console
        console.error('Failed to load order info:', error);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<template>
  <!-- Loading state -->
  <div v-if="loading" class="flex items-center justify-center py-4">
    <div class="text-sm text-n-slate-11">{{ $t('LOADING') }}</div>
  </div>

  <!-- Error state -->
  <div v-else-if="error" class="flex items-center justify-center py-4">
    <div class="text-sm text-red-600">{{ $t('ERROR') }} {{ error }}</div>
  </div>

  <!-- Order info content -->
  <div v-else-if="orderInfo" class="space-y-3">
    <div class="flex justify-between items-center">
      <span class="text-sm text-n-slate-11">{{ $t('ORDER.ORDER_ID') }}</span>
      <a
        :href="`https://app.shipxanh.com/dashboard/orders-sell/order-detail/${orderInfo?.id}`"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span class="text-sm text-blue-600 underline">{{
          orderInfo?.orderSn
        }}</span>
      </a>
    </div>

    <div class="flex justify-between items-center">
      <span class="text-sm text-n-slate-11">{{ $t('Shop') }}</span>
      <div class="flex items-center gap-1">
        <span class="text-sm">{{ orderInfo?.shopName }}</span>
        <Icon
          :icon="
            orderInfo?.shopType === 'tiktok'
              ? 'i-woot-tiktokshop'
              : `i-woot-${orderInfo?.shopType}`
          "
        />
      </div>
    </div>

    <div class="flex justify-between items-center">
      <span class="text-sm text-n-slate-11">{{ $t('Trạng thái') }}</span>
      <span class="text-sm">{{ orderInfo?.orderStatus }}</span>
    </div>
    <Tabs default-value="items">
      <TabsList class="w-full justify-between bg-n-slate-3">
        <TabsTrigger value="items" class="flex-1">{{ $t('Hàng') }}</TabsTrigger>
        <TabsTrigger value="payment">{{ $t('Thanh toán') }}</TabsTrigger>
        <TabsTrigger value="logistics">{{ $t('Vận chuyển') }}</TabsTrigger>
      </TabsList>
      <TabsContent value="items">
        <OrderItems :items="orderInfo?.itemList" />
      </TabsContent>
      <TabsContent value="payment" />
      <TabsContent value="logistics" />
    </Tabs>
  </div>
</template>
