// @ts-ignore
import Facebook from './channels/Facebook';
// @ts-ignore
import Website from './channels/Website';
// @ts-ignore
import Twitter from './channels/Twitter';
// @ts-ignore
import Api from './channels/Api';
// @ts-ignore
import Email from './channels/Email';
// @ts-ignore
import Sms from './channels/Sms';
// @ts-ignore
import Whatsapp from './channels/Whatsapp';
// @ts-ignore
import Line from './channels/Line';
// @ts-ignore
import Telegram from './channels/Telegram';
// @ts-ignore
import Shopee from './channels/Shopee';
// @ts-ignore
import Lazada from './channels/Lazada';
// @ts-ignore
import TiktokShop from './channels/TiktokShop';

const channelViewList = {
  facebook: Facebook,
  website: Website,
  twitter: Twitter,
  api: Api,
  email: Email,
  sms: Sms,
  whatsapp: Whatsapp,
  line: Line,
  telegram: Telegram,
  shopee: Shopee,
  lazada: Lazada,
  tiktokshop: TiktokShop,
};

export default {
  create() {
    return {
      props: {
        channel_name: {
          type: String,
          required: true,
        },
      },
      name: 'new-channel-view',
      render(h) {
        return h(channelViewList[this.channel_name] || null);
      },
    };
  },
};
