<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

import { Button } from 'dashboard/components-shadcn/components/ui/button';
import {
  Stepper,
  StepperDescription,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from 'dashboard/components-shadcn/components/ui/stepper';
import shipxanhAPI from 'dashboard/api/shipxanhAPI';
import Icon from 'next/icon/Icon.vue';
import { messageTimestamp } from 'helpers/timeHelper';

// Props definition
const props = defineProps({
  orderId: {
    type: [String, Number],
    required: true,
  },
});

// Reactive data
const logisticsData = ref(null);
const loading = ref(false);
const error = ref(null);
// Computed properties
const steps = computed(() => {
  if (!logisticsData.value) return [];

  // Transform API data to steps format
  return logisticsData.value.map((item, index) => {
    return {
      step: index + 1,
      title: item.description,
      description: messageTimestamp(item.updateTime),
      timestamp: item.updateTime,
    };
  });
});

const fetchLogisticsData = async () => {
  if (!props.orderId) return;

  loading.value = true;
  error.value = null;

  try {
    const res = await shipxanhAPI.get(
      `orders/${props.orderId}/refresh_tracking_info`
    );
    const packageData = res.packageList[0];
    logisticsData.value = packageData.trackingInfoList || [];
  } catch (err) {
    error.value = err.message || 'Không thể tải thông tin vận chuyển';
    // eslint-disable-next-line no-console
    console.error('Error fetching logistics data:', err);
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  fetchLogisticsData();
});
</script>

<template>
  <div class="w-full max-h-[400px] overflow-y-auto">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center p-8">
      <div class="flex items-center gap-2 text-n-slate-11">
        <Icon icon="i-lucide-loader-circle" class="size-4 animate-spin" />
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="p-4 bg-red-50 border border-red-200 rounded-md"
    >
      <div class="flex items-center gap-2 text-red-700">
        <span class="text-sm">{{ error }}</span>
      </div>
    </div>

    <!-- Logistics Steps -->
    <Stepper
      v-else
      :default-value="1"
      :value="1"
      orientation="vertical"
      class="flex w-full flex-col justify-start gap-4 bg-n-slate-2 p-3 rounded-md"
    >
      <StepperItem
        v-for="step in steps"
        :key="step.step"
        v-slot="{ state }"
        class="relative flex w-full items-start gap-4"
        :step="step.step"
      >
        <StepperSeparator
          v-if="step.step !== steps[steps.length - 1].step"
          class="absolute left-[9px] top-[16px] block h-[calc(100%+8px)] w-0.5 shrink-0 rounded-full bg-n-slate-6 group-data-[state=completed]:bg-n-slate-8"
        />

        <StepperTrigger as-child>
          <Button
            variant="outline"
            size="icon"
            class="z-10 rounded-full shrink-0 size-5 p-0"
            :class="[
              state === 'active' &&
                'ring-2 ring-ring ring-offset-2 ring-offset-background',
            ]"
          >
            <Icon
              v-if="state === 'inactive'"
              class="size-3"
              icon="i-lucide-check"
            />
            <Icon v-else class="size-3" icon="i-lucide-circle-dot" />
          </Button>
        </StepperTrigger>

        <div class="flex flex-col gap-1 pb-4">
          <StepperTitle
            :class="[state === 'active' && 'text-n-slate-12']"
            class="text-sm font-semibold transition text-n-slate-11"
          >
            {{ step.title }}
          </StepperTitle>
          <StepperDescription
            :class="[state === 'active' && 'text-n-slate-11']"
            class="text-xs text-n-slate-10 transition"
          >
            {{ step.description }}
          </StepperDescription>
        </div>
      </StepperItem>
    </Stepper>
  </div>
</template>
