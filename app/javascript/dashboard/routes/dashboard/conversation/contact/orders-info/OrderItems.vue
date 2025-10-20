<script>
import Icon from 'next/icon/Icon.vue';

export default {
  name: 'OrderItems',
  components: {
    Icon,
  },
  props: {
    items: {
      type: Array,
      required: false,
      default: () => [],
      validator: items => {
        return items.every(
          item =>
            typeof item === 'object' &&
            Object.prototype.hasOwnProperty.call(item, 'id') &&
            Object.prototype.hasOwnProperty.call(item, 'itemName') &&
            Object.prototype.hasOwnProperty.call(item, 'modelQuantityPurchased')
        );
      },
    },
  },
  computed: {
    totalQuantity() {
      return this.items.reduce(
        (sum, item) => sum + item.modelQuantityPurchased,
        0
      );
    },
    totalValue() {
      return this.items.reduce(
        (sum, item) =>
          sum + item.modelDiscountedPrice * item.modelQuantityPurchased,
        0
      );
    },
  },
  methods: {
    formatCurrency(amount) {
      if (!amount) return 'N/A';
      return amount.toLocaleString();
    },
    formatDiscount(originalPrice, discountedPrice) {
      if (!originalPrice || !discountedPrice) return 0;
      const discount =
        ((originalPrice - discountedPrice) / originalPrice) * 100;
      return Math.round(discount);
    },
  },
};
</script>

<template>
  <div class="space-y-4">
    <div class="space-y-3">
      <div
        v-for="item in items"
        :key="item.id"
        class="flex gap-2 p-2 rounded-sm bg-n-slate-2"
      >
        <!-- Ảnh sản phẩm -->
        <img
          :src="item.imageUrl"
          alt="product"
          class="w-14 h-14 object-contain rounded-sm border border-solid border-n-weak"
        />

        <!-- Thông tin sản phẩm -->
        <div class="flex-1 min-w-0">
          <!-- Dòng 1: Model Name (chữ đậm) -->
          <div class="text-sm">
            {{ item.modelName }}
          </div>

          <!-- Dòng 2: Item Name (chữ nhạt, ellipsis 2 dòng) -->
          <div
            class="text-sm text-n-slate-10 line-clamp-2"
            :title="item.itemName"
          >
            {{ item.itemName }}
          </div>

          <!-- Dòng 3: Giá + Số lượng -->
          <div
            class="text-sm text-gray-900 flex justify-end items-center gap-2"
          >
            <span class="text-green-600">
              {{ formatCurrency(item.modelDiscountedPrice) }}
            </span>
            <Icon icon="i-lucide-x" />
            <span class="text-lg font-mono">
              {{ item.modelQuantityPurchased }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
