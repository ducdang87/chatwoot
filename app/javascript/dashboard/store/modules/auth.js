import types from '../mutation-types';
import shipxanhAuthAPI from '../../api/shipxanhAuth';
import authAPI from '../../api/auth';

import { setUser, clearCookiesOnLogout } from '../utils/api';
import SessionStorage from 'shared/helpers/sessionStorage';
import { SESSION_STORAGE_KEYS } from 'dashboard/constants/sessionStorage';
import shipxanhTokenScheduler from 'dashboard/helper/shipxanhTokenScheduler';

const initialState = {
  currentUser: {
    id: null,
    account_id: null,
    accounts: [],
    email: null,
    name: null,
  },
  uiFlags: {
    isFetching: true,
  },
};

// getters
export const getters = {
  isLoggedIn($state) {
    return !!$state.currentUser.id;
  },

  getCurrentUserID($state) {
    return $state.currentUser.id;
  },

  getUISettings($state) {
    return $state.currentUser.ui_settings || {};
  },

  getAuthUIFlags($state) {
    return $state.uiFlags;
  },

  getCurrentUserAvailability($state, $getters) {
    const { accounts = [] } = $state.currentUser;
    const [currentAccount = {}] = accounts.filter(
      account => account.id === $getters.getCurrentAccountId
    );
    return currentAccount.availability;
  },

  getCurrentUserAutoOffline($state, $getters) {
    const { accounts = [] } = $state.currentUser;
    const [currentAccount = {}] = accounts.filter(
      account => account.id === $getters.getCurrentAccountId
    );
    return currentAccount.auto_offline;
  },

  getCurrentAccountId(_, __, rootState) {
    if (rootState.route.params && rootState.route.params.accountId) {
      return Number(rootState.route.params.accountId);
    }
    return null;
  },

  getCurrentRole($state, $getters) {
    const { accounts = [] } = $state.currentUser;
    const [currentAccount = {}] = accounts.filter(
      account => account.id === $getters.getCurrentAccountId
    );
    return currentAccount.role;
  },

  getCurrentCustomRoleId($state, $getters) {
    const { accounts = [] } = $state.currentUser;
    const [currentAccount = {}] = accounts.filter(
      account => account.id === $getters.getCurrentAccountId
    );
    return currentAccount.custom_role_id;
  },

  getCurrentUser($state) {
    return $state.currentUser;
  },

  getMessageSignature($state) {
    const { message_signature: messageSignature } = $state.currentUser;

    return messageSignature || '';
  },

  getCurrentAccount($state, $getters) {
    const { accounts = [] } = $state.currentUser;
    const [currentAccount = {}] = accounts.filter(
      account => account.id === $getters.getCurrentAccountId
    );
    return currentAccount || {};
  },

  getUserAccounts($state) {
    const { accounts = [] } = $state.currentUser;
    return accounts;
  },
};

// actions
export const actions = {
  async validityCheck(context) {
    try {
      const response = await authAPI.validityCheck();
      const currentUser = response.data.payload.data;
      setUser(currentUser);
      context.commit(types.SET_CURRENT_USER, currentUser);

      // Tự động start ShipXanh auth khi user đã login (cho trường hợp refresh page)
      context.dispatch('autoStartShipXanhAuth');
    } catch (error) {
      if (error?.response?.status === 401) {
        clearCookiesOnLogout();
      }
    }
  },
  async setUser({ commit, dispatch }) {
    if (authAPI.hasAuthCookie()) {
      await dispatch('validityCheck');
      // Khởi động ShipXanh auth khi user đã login
      dispatch('autoStartShipXanhAuth');
    } else {
      commit(types.CLEAR_USER);
    }
    commit(types.SET_CURRENT_USER_UI_FLAGS, { isFetching: false });
  },
  logout({ commit, dispatch }) {
    dispatch('stopShipXanhAuth');
    commit(types.CLEAR_USER);
  },

  clearCustomToken: () => {
    shipxanhAuthAPI.clearToken();
  },

  startShipXanhAuth: ({ shipxanhUserId, captchaToken = '' }) => {
    shipxanhTokenScheduler.start(shipxanhUserId, captchaToken);
  },

  stopShipXanhAuth: () => {
    shipxanhTokenScheduler.stop();
  },

  getShipXanhToken: () => {
    return shipxanhAuthAPI.getToken();
  },

  // Tự động start ShipXanh auth khi login
  autoStartShipXanhAuth: async ({ getters: storeGetters, dispatch }) => {
    // Lấy shipxanhUserId từ custom_attributes của current user
    const currentUser = storeGetters.getCurrentUser;

    const shipxanhUserId =
      currentUser.custom_attributes?.shipxanhUserId ||
      currentUser.id ||
      currentUser.email ||
      'default';

    // eslint-disable-next-line no-console
    console.log('autoStartShipXanhAuth: Starting for user:', shipxanhUserId);

    try {
      // Đợi reCAPTCHA script load xong với retry mechanism
      const captchaToken = await dispatch('getCaptchaTokenWithRetry');
      // eslint-disable-next-line no-console
      console.log('autoStartShipXanhAuth: Got token:', captchaToken ? 'SUCCESS' : 'EMPTY');

      shipxanhTokenScheduler.start(shipxanhUserId.toString(), captchaToken);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('autoStartShipXanhAuth: reCAPTCHA failed, starting without token:', error.message);
      // Fallback: start without captcha token
      shipxanhTokenScheduler.start(shipxanhUserId.toString(), '');
    }
  },

  // Lấy Google reCAPTCHA v2 token (invisible)
  getCaptchaToken: () => {
    return new Promise((resolve, reject) => {
      // Kiểm tra xem grecaptcha có sẵn không
      if (typeof window.grecaptcha === 'undefined') {
        reject(new Error('Google reCAPTCHA not loaded'));
        return;
      }

      // Kiểm tra xem grecaptcha đã ready chưa
      window.grecaptcha.ready(() => {
        try {
          // eslint-disable-next-line no-console
          console.log('reCAPTCHA v2 ready', window.RECAPTCHA_SITE_KEY);
          
          // Tạo callback function cho lần này
          const callbackName = `recaptchaCallback_${Date.now()}`;
          window[callbackName] = (token) => {
            if (token) {
              // eslint-disable-next-line no-console
              console.log('reCAPTCHA v2 token received');
              // Cleanup callback
              delete window[callbackName];
              resolve(token);
            } else {
              delete window[callbackName];
              reject(new Error('Failed to get reCAPTCHA token'));
            }
          };

          // Kiểm tra xem widget đã tồn tại chưa
          if (window.recaptchaWidgetId !== undefined) {
            try {
              // Reset widget cũ và execute lại
              window.grecaptcha.reset(window.recaptchaWidgetId);
              // Update callback cho widget hiện tại - không thể thay đổi callback sau khi render
              // Nên ta sẽ sử dụng global callback
              window.currentRecaptchaResolve = resolve;
              window.currentRecaptchaReject = reject;
              window.grecaptcha.execute(window.recaptchaWidgetId);
              return;
            } catch (resetError) {
              // eslint-disable-next-line no-console
              console.log('Reset failed, recreating widget:', resetError);
              // Clear container và tạo lại
              const container = document.getElementById('recaptcha-container');
              if (container) {
                container.innerHTML = '';
              }
              window.recaptchaWidgetId = undefined;
            }
          }
          
          // Tạo invisible reCAPTCHA widget mới
          const container = document.getElementById('recaptcha-container');
          if (!container) {
            reject(new Error('reCAPTCHA container not found'));
            return;
          }

          // Clear container trước khi render
          container.innerHTML = '';
          
          window.recaptchaWidgetId = window.grecaptcha.render(container, {
            sitekey: window.RECAPTCHA_SITE_KEY || '',
            size: 'invisible',
            callback: (token) => {
              if (token) {
                // eslint-disable-next-line no-console
                console.log('reCAPTCHA v2 token received');
                // Sử dụng current resolve nếu có, fallback về callback name
                if (window.currentRecaptchaResolve) {
                  window.currentRecaptchaResolve(token);
                  window.currentRecaptchaResolve = null;
                  window.currentRecaptchaReject = null;
                } else if (window[callbackName]) {
                  window[callbackName](token);
                }
              } else {
                const errorMsg = 'Failed to get reCAPTCHA token';
                if (window.currentRecaptchaReject) {
                  window.currentRecaptchaReject(new Error(errorMsg));
                  window.currentRecaptchaResolve = null;
                  window.currentRecaptchaReject = null;
                } else if (window[callbackName]) {
                  delete window[callbackName];
                  reject(new Error(errorMsg));
                }
              }
            },
            'error-callback': () => {
              // eslint-disable-next-line no-console
              console.log('reCAPTCHA v2 error occurred');
              const errorMsg = 'reCAPTCHA error occurred';
              if (window.currentRecaptchaReject) {
                window.currentRecaptchaReject(new Error(errorMsg));
                window.currentRecaptchaResolve = null;
                window.currentRecaptchaReject = null;
              } else {
                delete window[callbackName];
                reject(new Error(errorMsg));
              }
            }
          });

          // Thực hiện reCAPTCHA invisible
          window.grecaptcha.execute(window.recaptchaWidgetId);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log('Failed to setup reCAPTCHA v2', error);
          reject(error);
        }
      });
    });
  },

  // Lấy reCAPTCHA token với retry mechanism để xử lý timing issue
  getCaptchaTokenWithRetry: async ({ dispatch }) => {
    const maxRetries = 5;
    const baseDelay = 1000; // 1 giây

    // eslint-disable-next-line no-plusplus
    for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
      try {
        // eslint-disable-next-line no-console
        console.log(`getCaptchaTokenWithRetry: Attempt ${attempt}/${maxRetries}`);
        
        // Kiểm tra xem reCAPTCHA có sẵn sàng không
        if (typeof window.grecaptcha === 'undefined' || !window.RECAPTCHA_SITE_KEY) {
          throw new Error('reCAPTCHA not ready');
        }

        // eslint-disable-next-line no-await-in-loop
        const token = await dispatch('getCaptchaToken');
        if (token) {
          // eslint-disable-next-line no-console
          console.log(`getCaptchaTokenWithRetry: Success on attempt ${attempt}`);
          return token;
        }
        throw new Error('Empty token received');
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(`getCaptchaTokenWithRetry: Attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          throw new Error(`reCAPTCHA failed after ${maxRetries} attempts: ${error.message}`);
        }
        
        // Exponential backoff: 1s, 2s, 4s, 8s
        const delay = baseDelay * (2 ** (attempt - 1));
        // eslint-disable-next-line no-console
        console.log(`getCaptchaTokenWithRetry: Waiting ${delay}ms before retry...`);
        // eslint-disable-next-line no-await-in-loop
        await new Promise(resolve => {
          setTimeout(resolve, delay);
        });
      }
    }
    
    // Fallback return nếu không có attempt nào thành công
    throw new Error('reCAPTCHA retry mechanism exhausted');
  },

  updateProfile: async ({ commit }, params) => {
    // eslint-disable-next-line no-useless-catch
    try {
      // eslint-disable-next-line no-console
      console.log('Updating profile:', params);
      const response = await authAPI.profileUpdate(params);
      commit(types.SET_CURRENT_USER, response.data);
    } catch (error) {
      throw error;
    }
  },

  updatePassword: async ({ commit }, params) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await authAPI.profilePasswordUpdate(params);
      commit(types.SET_CURRENT_USER, response.data);
    } catch (error) {
      throw error;
    }
  },

  deleteAvatar: async ({ commit }) => {
    try {
      const response = await authAPI.deleteAvatar();
      commit(types.SET_CURRENT_USER, response.data);
    } catch (error) {
      // Ignore error
    }
  },

  updateUISettings: async ({ commit }, params) => {
    try {
      commit(types.SET_CURRENT_USER_UI_SETTINGS, params);

      const isImpersonating = SessionStorage.get(
        SESSION_STORAGE_KEYS.IMPERSONATION_USER
      );

      if (!isImpersonating) {
        const response = await authAPI.updateUISettings(params);
        commit(types.SET_CURRENT_USER, response.data);
      }
    } catch (error) {
      // Ignore error
    }
  },

  updateAvailability: async (
    { commit, dispatch, getters: _getters },
    params
  ) => {
    const previousStatus = _getters.getCurrentUserAvailability;

    try {
      // optimisticly update current status
      commit(types.SET_CURRENT_USER_AVAILABILITY, params.availability);
      const response = await authAPI.updateAvailability(params);
      const userData = response.data;
      const { id } = userData;
      commit(types.SET_CURRENT_USER, response.data);
      dispatch('agents/updateSingleAgentPresence', {
        id,
        availabilityStatus: params.availability,
      });
    } catch (error) {
      // revert back to previous status if update fails
      commit(types.SET_CURRENT_USER_AVAILABILITY, previousStatus);
    }
  },

  updateAutoOffline: async (
    { commit, getters: _getters },
    { accountId, autoOffline }
  ) => {
    const previousAutoOffline = _getters.getCurrentUserAutoOffline;

    try {
      commit(types.SET_CURRENT_USER_AUTO_OFFLINE, autoOffline);
      const response = await authAPI.updateAutoOffline(accountId, autoOffline);
      commit(types.SET_CURRENT_USER, response.data);
    } catch (error) {
      commit(types.SET_CURRENT_USER_AUTO_OFFLINE, previousAutoOffline);
    }
  },

  setCurrentUserAvailability({ commit, state: $state }, data) {
    if (data[$state.currentUser.id]) {
      commit(types.SET_CURRENT_USER_AVAILABILITY, data[$state.currentUser.id]);
    }
  },

  setActiveAccount: async (_, { accountId }) => {
    try {
      await authAPI.setActiveAccount({ accountId });
    } catch (error) {
      // Ignore error
    }
  },

  resetAccessToken: async ({ commit }) => {
    try {
      const response = await authAPI.resetAccessToken();
      commit(types.SET_CURRENT_USER, response.data);
      return true;
    } catch (error) {
      return false;
    }
  },

  resendConfirmation: async () => {
    try {
      await authAPI.resendConfirmation();
    } catch (error) {
      // Ignore error
    }
  },
};

// mutations
export const mutations = {
  [types.SET_CURRENT_USER_AVAILABILITY](_state, availability) {
    const accounts = _state.currentUser.accounts.map(account => {
      if (account.id === _state.currentUser.account_id) {
        return { ...account, availability, availability_status: availability };
      }
      return account;
    });
    _state.currentUser = {
      ..._state.currentUser,
      accounts,
    };
  },
  [types.SET_CURRENT_USER_AUTO_OFFLINE](_state, autoOffline) {
    const accounts = _state.currentUser.accounts.map(account => {
      if (account.id === _state.currentUser.account_id) {
        return { ...account, autoOffline: autoOffline };
      }
      return account;
    });

    _state.currentUser = {
      ..._state.currentUser,
      accounts,
    };
  },
  [types.CLEAR_USER](_state) {
    _state.currentUser = initialState.currentUser;
  },
  [types.SET_CURRENT_USER](_state, currentUser) {
    _state.currentUser = currentUser;
  },
  [types.SET_CURRENT_USER_UI_SETTINGS](_state, { uiSettings }) {
    _state.currentUser = {
      ..._state.currentUser,
      ui_settings: {
        ..._state.currentUser.ui_settings,
        ...uiSettings,
      },
    };
  },

  [types.SET_CURRENT_USER_UI_FLAGS](_state, { isFetching }) {
    _state.uiFlags = { isFetching };
  },
};

export default {
  state: initialState,
  getters,
  actions,
  mutations,
};
