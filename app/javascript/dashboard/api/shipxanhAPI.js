import axios from 'axios';
import { LocalStorage } from 'shared/helpers/localStorage';

const SHIPXANH_BASE_URL = 'https://prod-api.shipxanh.com/inventory/';
const STORAGE_KEY = 'shipxanh_custom_token';

// Tạo axios instance riêng để tránh bị intercept bởi Chatwoot APIHelper
const shipxanhAxios = axios.create({
  baseURL: SHIPXANH_BASE_URL,
  timeout: 30000,
});

class ShipXanhAPIService {
  constructor() {
    // baseURL đã được set trong shipxanhAxios instance
  }

  // Lấy custom token từ localStorage
  getCustomToken() {
    const tokenData = LocalStorage.get(STORAGE_KEY);
    if (!tokenData) {
      // eslint-disable-next-line no-console
      console.warn('ShipXanh token not found in:', this.constructor.name);
      throw new Error(
        'ShipXanh custom token not found. Please authenticate first.'
      );
    }
    return tokenData;
  }

  // Tạo headers với custom token
  getAuthHeaders() {
    const tokenData = this.getCustomToken();

    return {
      Authorization: `Bearer ${tokenData.token}`,
      'Content-Type': 'application/json',
      organization: tokenData.organizationId.toString(),
      'Auth-Version': '2.0',
      Accept: 'application/json',
    };
  }

  // Generic method để gọi API
  async request(method, endpoint, data = null, customHeaders = {}) {
    try {
      const headers = {
        ...this.getAuthHeaders(),
        ...customHeaders,
      };

      const config = {
        method,
        url: endpoint, // Chỉ cần endpoint vì baseURL đã set trong shipxanhAxios
        headers,
      };

      if (
        data &&
        (method === 'POST' || method === 'PUT' || method === 'PATCH')
      ) {
        config.data = data;
      }

      // Debug logging
      // eslint-disable-next-line no-console
      console.log('ShipXanh API Request:', {
        method,
        url: `${SHIPXANH_BASE_URL}${endpoint}`,
        headers,
        data,
      });

      // Sử dụng shipxanhAxios thay vì global axios để tránh interceptors của Chatwoot
      const response = await shipxanhAxios(config);
      return response.data?.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('ShipXanh API Error:', error);

      if (error.response?.status === 401) {
        throw new Error(
          'Authentication failed. Please re-authenticate with ShipXanh.'
        );
      }

      throw error;
    }
  }

  // GET request
  async get(endpoint, customHeaders = {}) {
    return this.request('GET', endpoint, null, customHeaders);
  }

  // POST request
  async post(endpoint, data, customHeaders = {}) {
    return this.request('POST', endpoint, data, customHeaders);
  }

  // PUT request
  async put(endpoint, data, customHeaders = {}) {
    return this.request('PUT', endpoint, data, customHeaders);
  }

  // DELETE request
  async delete(endpoint, customHeaders = {}) {
    return this.request('DELETE', endpoint, null, customHeaders);
  }

  // PATCH request
  async patch(endpoint, data, customHeaders = {}) {
    return this.request('PATCH', endpoint, data, customHeaders);
  }

  // Method để kiểm tra token có hợp lệ không
  async validateToken() {
    try {
      // Gọi một endpoint đơn giản để test token
      await this.get('/auth/me');
      return true;
    } catch (error) {
      return false;
    }
  }

  // Method để clear token khi logout
  static clearToken() {
    LocalStorage.remove(STORAGE_KEY);
  }
}

// Export singleton instance
export default new ShipXanhAPIService();
