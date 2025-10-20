<script>
import Icon from 'next/icon/Icon.vue';
import OrderItems from './OrderItems.vue';
import shipxanhAPI from 'dashboard/api/shipxanhAPI';

export default {
  name: 'OrderInfo',
  components: {
    Icon,
    OrderItems,
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
      <span class="text-sm text-n-slate-11">{{ $t('Mã đơn') }}</span>
      <span class="text-sm">{{ orderInfo?.orderSn }}</span>
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

    <OrderItems :items="orderInfo?.itemList" />
  </div>
</template>
