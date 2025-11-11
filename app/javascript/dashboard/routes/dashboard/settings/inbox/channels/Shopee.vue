<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Button from 'next/button/Button.vue';

const countdown = ref(3);
const isRedirecting = ref(true);
let timer = null;

const redirect = () => {
  window.open(
    'https://app.shipxanh.com/dashboard/omnichannel/chat-shops',
    '_self'
  );
};

const startCountdown = () => {
  timer = setInterval(() => {
    countdown.value -= 1;
    if (countdown.value <= 0) {
      clearInterval(timer);
      if (isRedirecting.value) {
        redirect();
      }
    }
  }, 1000);
};

const stopRedirect = () => {
  isRedirecting.value = false;
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

const startRedirect = () => {
  isRedirecting.value = true;
  countdown.value = 3;
  startCountdown();
};

onMounted(() => {
  startCountdown();
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full space-y-6">
    <div class="text-center">
      <h2 class="text-2xl font-bold text-n-slate-12 mb-2">
        {{ $t('INBOX_MGMT.REDIRECTING_TO_SHIPXANH') }}
      </h2>
      <p class="text-lg text-n-slate-11">
        {{ $t('INBOX_MGMT.REDIRECTING_IN') }}
        <span class="font-bold text-blue-600 text-xl">{{ countdown }}</span>
        {{ $t('S') }}
      </p>
    </div>

    <div class="flex space-x-4">
      <Button
        v-if="isRedirecting"
        variant="outline"
        class="px-6 py-2"
        @click="stopRedirect"
      >
        {{ $t('INBOX_MGMT.STOP_REDIRECT') }}
      </Button>

      <Button v-else variant="default" class="px-6 py-2" @click="startRedirect">
        {{ $t('INBOX_MGMT.START_REDIRECT') }}
      </Button>
    </div>
  </div>
</template>
