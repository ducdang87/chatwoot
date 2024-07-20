<template>
  <div
    class="border border-slate-25 dark:border-slate-800/60 bg-white dark:bg-slate-900 h-full p-6 w-full max-w-full md:w-3/4 md:max-w-[75%] flex-shrink-0 flex-grow-0"
  >
    <div class="flex flex-col items-center justify-center h-1/2">
      <div class="text-5xl font-bold mb-4">{{ countdown }}</div>
      <div>
        <woot-button
          :color-scheme="'alert'"
          :icon="'dismiss'"
          :variant="'smooth'"
          @click="stopCountdown"
        >
          STOP
        </woot-button>
        <woot-button :icon="'link'" @click="openAppShipxanh">
          START
        </woot-button>
      </div>
    </div>
  </div>
</template>

<script>
import WootButton from '../../../../../components/ui/WootButton.vue';
export default {
  name: 'Shopee',
  components: { WootButton },
  data() {
    return {
      countdown: 5,
      timer: null,
    };
  },
  mounted() {
    this.startCountdown();
  },
  beforeDestroy() {
    this.stopCountdown();
  },
  methods: {
    startCountdown() {
      if (this.timer) return; // Ngăn không cho tạo nhiều timer

      this.timer = setInterval(() => {
        if (this.countdown > 0) {
          // eslint-disable-next-line no-plusplus
          this.countdown -= 1;
        } else {
          this.stopCountdown();
          this.openAppShipxanh();
        }
      }, 1000);
    },
    stopCountdown() {
      clearInterval(this.timer);
      this.timer = null;
    },
    openAppShipxanh() {
      window.open(
        'https://app.shipxanh.com/dashboard/connect/shops?add-chat=true&marketplace=shopee',
        '_self'
      );
    },
  },
};
</script>

<style scoped>
button {
  margin: 5px;
}
</style>
