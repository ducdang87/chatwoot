<template>
  <div class="flex-1 overflow-auto p-4">
    <div class="flex flex-row gap-4">
      <div class="w-full lg:w-3/5">
        <woot-loading-state
          v-if="uiFlags.isFetching"
          :message="$t('AGENT_BOTS.LIST.LOADING')"
        />
        <table v-else-if="agentBots.length" class="woot-table">
          <tbody>
            <agent-bot-row
              v-for="(agentBot, index) in agentBots"
              :key="agentBot.id"
              :agent-bot="agentBot"
              :index="index"
              @delete="onDeleteAgentBot"
              @edit="onEditAgentBot"
            />
          </tbody>
        </table>
        <p v-else class="flex h-full items-center flex-col justify-center">
          {{ $t('AGENT_BOTS.LIST.404') }}
        </p>
      </div>

      <div class="hidden lg:block w-1/3">
        <p v-html="$t('AGENT_BOTS.SIDEBAR_TXT')" />
      </div>
    </div>
    <woot-button
      color-scheme="success"
      class-names="button--fixed-top"
      icon="add"
    >
      <router-link :to="newAgentBotsURL" class="white-text">
        {{ $t('AGENT_BOTS.ADD.TITLE') }}
      </router-link>
    </woot-button>
    <woot-confirm-modal
      ref="confirmDialog"
      :title="$t('AGENT_BOTS.DELETE.TITLE')"
      :description="$t('AGENT_BOTS.DELETE.DESCRIPTION')"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { frontendURL } from '../../../../helper/URLHelper';
import AgentBotRow from './components/AgentBotRow.vue';
import alertMixin from 'shared/mixins/alertMixin';

export default {
  components: { AgentBotRow },
  mixins: [alertMixin],
  computed: {
    ...mapGetters({
      accountId: 'getCurrentAccountId',
      agentBots: 'agentBots/getBots',
      uiFlags: 'agentBots/getUIFlags',
    }),
    newAgentBotsURL() {
      return frontendURL(
        `accounts/${this.accountId}/settings/agent-bots/csml/new`
      );
    },
  },
  mounted() {
    this.$store.dispatch('agentBots/get');
  },
  methods: {
    async onDeleteAgentBot(bot) {
      const ok = await this.$refs.confirmDialog.showConfirmation();
      if (ok) {
        try {
          await this.$store.dispatch('agentBots/delete', bot.id);
          this.showAlert(this.$t('AGENT_BOTS.DELETE.API.SUCCESS_MESSAGE'));
        } catch (error) {
          this.showAlert(this.$t('AGENT_BOTS.DELETE.API.ERROR_MESSAGE'));
        }
      }
    },
    onEditAgentBot(bot) {
      this.$router.push(
        frontendURL(
          `accounts/${this.accountId}/settings/agent-bots/csml/${bot.id}`
        )
      );
    },
  },
};
</script>
<style scoped>
.bots-list {
  list-style: none;
}

.nowrap {
  white-space: nowrap;
}

.white-text {
  color: white;
}
</style>
