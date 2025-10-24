<script setup>
import { ref, onMounted } from 'vue';
import Icon from 'next/icon/Icon.vue';
import OrderItems from './OrderItems.vue';
import shipxanhAPI from 'dashboard/api/shipxanhAPI';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from 'dashboard/components-shadcn/components/ui/tabs';
import LogisticsHistory from './LogisticsHistory.vue';

const props = defineProps({
  shopBuyerId: {
    type: String,
    default: '',
  },
});

const ordersInfo = ref([]);
const loading = ref(false);
const error = ref(null);

const fetchOrderInfo = async () => {
  loading.value = true;
  error.value = null;
  if (!props.shopBuyerId) return;
  try {
    const res = await shipxanhAPI.get(
      `orders?page=0&size=50&platformBuyerUserId=${props.shopBuyerId}`
    );

    // Fetch payment info for all orders concurrently
    const orders = await Promise.all(
      res.items.map(async order => {
        const resPayment = await shipxanhAPI.get(`order_finance/${order.id}`);
        return {
          ...order,
          paymentInfo: resPayment,
        };
      })
    );

    ordersInfo.value = orders;
    // eslint-disable-next-line no-console
  } catch (err) {
    error.value = err.message;
    // eslint-disable-next-line no-console
    console.error('Failed to load order info:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchOrderInfo();
});
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
  <div v-else-if="ordersInfo?.length" class="space-y-3">
    <div
      v-for="(orderInfo, index) in ordersInfo"
      :key="index"
      class="space-y-2"
    >
      <div v-if="index > 0" class="border-t border-n-slate-3 my-2" />
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
          <Icon :icon="`i-woot-${orderInfo?.shopType}`" />
        </div>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-sm text-n-slate-11">{{ $t('Tạo lúc') }}</span>
        <span class="text-sm">{{ orderInfo?.createTime }}</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-sm text-n-slate-11">{{ $t('Trạng thái') }}</span>
        <span
          class="text-base font-semibold uppercase"
          :class="{
            'text-red-500': ['CANCELLED', 'IN_CANCEL'].includes(
              orderInfo.orderStatus
            ),
          }"
        >
          {{
            // eslint-disable-next-line @intlify/vue-i18n/no-dynamic-keys
            $t(`ORDER.STATUS.${orderInfo.orderStatus}`)
          }}
        </span>
      </div>

      <div class="flex justify-between items-center">
        <span class="text-sm text-n-slate-11">{{
          $t('Người mua thanh toán')
        }}</span>
        <span class="text-sm text-green-600">{{
          (orderInfo?.paymentInfo?.totalCustomerPaid || 0).toLocaleString()
        }}</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-sm text-n-slate-11">{{ $t('Tiền hàng') }}</span>
        <span class="text-sm">{{
          (orderInfo?.paymentInfo?.originalOrderValue || 0).toLocaleString()
        }}</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-sm text-n-slate-11">{{ $t('Thực nhận') }}</span>
        <span class="text-sm">{{
          (orderInfo?.paymentInfo?.totalRevenue || 0).toLocaleString()
        }}</span>
      </div>
      <Tabs default-value="items">
        <TabsList class="w-full justify-between bg-n-slate-2">
          <TabsTrigger value="items" class="flex-1">
            {{ $t('Mặt hàng') }}
          </TabsTrigger>
          <TabsTrigger value="logistics">
            {{ $t('Hành trình đơn') }}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="items">
          <OrderItems :items="orderInfo?.itemList" />
        </TabsContent>

        <TabsContent value="logistics">
          <LogisticsHistory :order-id="orderInfo?.id" />
        </TabsContent>
      </Tabs>
    </div>
  </div>
</template>
