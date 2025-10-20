/* global axios */

import { LocalStorage } from 'shared/helpers/localStorage';
import store from '../store';

const SHIPXANH_API_URL = 'https://chat-api.shipxanh.com/chat/sxauth/login_sx';
const STORAGE_KEY = 'shipxanh_custom_token';

export default {
  // Gọi API ShipXanh để lấy custom token
  async getCustomToken(shipxanhUserId, captchaToken = '') {
    // Lấy currentUser từ store (chứa access_token từ /profile response)
    const currentUser = store.getters.getCurrentUser;

    if (!currentUser || !currentUser.access_token) return null;

    const chatAccessToken = currentUser.access_token;
    const chatAccountId = this.getCurrentAccountId();

    const payload = {
      chatAccessToken,
      chatAccountId: chatAccountId.toString(),
      shipxanhUserId,
      captchaToken,
    };

    // eslint-disable-next-line no-console
    console.log(payload);

    // eslint-disable-next-line no-unreachable
    const response = await axios.post(SHIPXANH_API_URL, payload, {
      headers: {
        accept: '*/*',
        'Content-Type': 'application/json',
        method: 'POST',
      },
    });

    const customToken = response.data.data;
    if (!customToken) {
      // eslint-disable-next-line no-alert
      alert(response.data?.message || 'Failed to get custom token');
      return null;
    }

    // Đảm bảo token có đúng format {token: string, organizationId: number}
    const tokenData = {
      token: customToken.token || customToken,
      organizationId: customToken.organizationId || parseInt(chatAccountId, 10),
    };

    // Lưu vào localStorage
    LocalStorage.set(STORAGE_KEY, tokenData);

    return customToken;
  },

  // Lấy account ID từ URL
  getCurrentAccountId() {
    if (import.meta.env.DEV) {
      return 1428; // nếu dev thì trả về account id live của acc lihkooll@gmail.com
    }
    const pathParts = window.location.pathname.split('/');
    const accountIndex = pathParts.indexOf('accounts');
    if (accountIndex !== -1 && pathParts[accountIndex + 1]) {
      return pathParts[accountIndex + 1];
    }
    return '1';
  },

  // Lấy token từ localStorage
  getToken() {
    return LocalStorage.get(STORAGE_KEY);
  },

  // Clear token
  clearToken() {
    LocalStorage.remove(STORAGE_KEY);
  },
};
