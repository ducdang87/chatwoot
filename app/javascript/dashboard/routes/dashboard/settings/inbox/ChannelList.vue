<template>
  <div
    class="border border-slate-25 dark:border-slate-800/60 bg-white dark:bg-slate-900 h-full p-6 w-full max-w-full md:w-3/4 md:max-w-[75%] flex-shrink-0 flex-grow-0"
  >
    <page-header
      class="max-w-4xl"
      :header-title="$t('INBOX_MGMT.ADD.AUTH.TITLE')"
      :header-content="
        useInstallationName(
          $t('INBOX_MGMT.ADD.AUTH.DESC'),
          globalConfig.installationName
        )
      "
    />
    <div class="flex flex-wrap justify-between gap-4 mt-6 max-w-4xl">
      <channel-item
        v-for="channel in channelList"
        :key="channel.key"
        :channel="channel"
        :enabled-features="enabledFeatures"
        @channel-item-click="initChannelAuth"
      />
    </div>
  </div>
</template>

<script>
import ChannelItem from 'dashboard/components/widgets/ChannelItem.vue';
import router from '../../../index';
import PageHeader from '../SettingsSubPageHeader.vue';
import { mapGetters } from 'vuex';
import globalConfigMixin from 'shared/mixins/globalConfigMixin';

export default {
  components: {
    ChannelItem,
    PageHeader,
  },
  mixins: [globalConfigMixin],
  data() {
    return {
      enabledFeatures: {},
    };
  },
  computed: {
    account() {
      return this.$store.getters['accounts/getAccount'](this.accountId);
    },
    channelList() {
      // SX_TODO: Add more marketplace channels

      // const { apiChannelName, apiChannelThumbnail } = this.globalConfig;
      return [
        // { key: 'website', name: 'Website' },
        { key: 'facebook', name: 'Facebook' },
        // { key: 'whatsapp', name: 'WhatsApp' },
        // { key: 'sms', name: 'SMS' },
        // { key: 'email', name: 'Email' },
        // {
        //   key: 'api',
        //   name: apiChannelName || 'API',
        //   thumbnail: apiChannelThumbnail,
        // },
        // { key: 'telegram', name: 'Telegram' },
        // { key: 'line', name: 'Line' },
        {
          key: 'shopee',
          name: 'Shopee',
        },
        {
          key: 'lazada',
          name: 'Lazada',
        },
        {
          key: 'tiktokshop',
          name: 'Tiktok Shop',
        },
      ];
    },
    ...mapGetters({
      accountId: 'getCurrentAccountId',
      globalConfig: 'globalConfig/get',
    }),
  },
  mounted() {
    this.initializeEnabledFeatures();
  },
  methods: {
    async initializeEnabledFeatures() {
      this.enabledFeatures = this.account.features;
    },
    initChannelAuth(channel) {
      const params = {
        page: 'new',
        sub_page: channel,
      };
      router.push({ name: 'settings_inboxes_page_channel', params });
    },
  },
};
</script>
