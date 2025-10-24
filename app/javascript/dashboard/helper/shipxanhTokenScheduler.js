import shipxanhAuthAPI from '../api/shipxanhAuth';

class ShipXanhTokenScheduler {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
    this.shipxanhUserId = null;
    this.captchaToken = '';
  }

  // Bắt đầu scheduler
  start(shipxanhUserId, captchaToken = '') {
    if (this.isRunning) {
      // Nếu đã chạy, chỉ update credentials
      this.shipxanhUserId = shipxanhUserId;
      this.captchaToken = captchaToken;
      return;
    }

    this.shipxanhUserId = shipxanhUserId;
    this.captchaToken = captchaToken;
    this.isRunning = true;

    // Gọi API ngay lập tức
    this.getToken();

    // Set interval mỗi 15 phút
    this.intervalId = setInterval(
      () => {
        this.getToken();
      },
      15 * 60 * 1000
    );
  }

  // Gọi API lấy token
  async getToken() {
    try {
      await shipxanhAuthAPI.getCustomToken(
        this.shipxanhUserId,
        this.captchaToken
      );
    } catch (error) {
      // Ignore error, sẽ retry ở lần tiếp theo
    }
  }

  // Dừng scheduler
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    shipxanhAuthAPI.clearToken();
  }
}

export default new ShipXanhTokenScheduler();
