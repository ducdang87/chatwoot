# 🚀 Quick reCAPTCHA Setup Guide

## ✅ Đã hoàn thành:

### 1. ✅ Code Integration
- `autoStartShipXanhAuth` đã được cập nhật để gọi reCAPTCHA
- `getCaptchaToken` action đã được thêm vào auth store
- Fallback handling khi reCAPTCHA fail

### 2. ✅ Environment Configuration
- Đã thêm `RECAPTCHA_SITE_KEY` và `RECAPTCHA_SECRET_KEY` vào `.env.example`
- Layout đã được cập nhật để load reCAPTCHA script và site key

## 🔧 Cần làm để hoàn thành:

### Bước 1: Lấy reCAPTCHA Keys
1. Truy cập: https://www.google.com/recaptcha/admin
2. Tạo site mới với **reCAPTCHA v3**
3. Domain: `localhost` (dev) và domain production của bạn
4. Copy Site Key và Secret Key

### Bước 2: Cấu hình Environment
Tạo file `.env` (hoặc cập nhật existing) với:
```bash
# Google reCAPTCHA v3
RECAPTCHA_SITE_KEY=your-actual-site-key-here
RECAPTCHA_SECRET_KEY=your-actual-secret-key-here
```

### Bước 3: Test
1. Restart server: `pnpm dev` hoặc `overmind start -f Procfile.dev`
2. Login vào dashboard
3. Check browser console - sẽ thấy reCAPTCHA token được generate
4. Check network tab - token sẽ được pass vào ShipXanh auth

## 🎯 Test với Development Keys
Để test ngay, dùng Google test keys:
```bash
# Test keys - luôn pass validation
RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

## 🔍 Debugging
- Console sẽ log warning nếu reCAPTCHA fail
- App vẫn hoạt động bình thường nếu không có reCAPTCHA
- Token được pass vào `shipxanhTokenScheduler.start(userId, token)`

## 🚀 Production Notes
- Đảm bảo domain được whitelist trong reCAPTCHA console
- Monitor reCAPTCHA score (v3) để adjust security level
- Backend có thể verify token nếu cần thêm security layer
