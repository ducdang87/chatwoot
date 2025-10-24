# Google reCAPTCHA Invisible Setup Guide

## 1. Cấu hình reCAPTCHA

### Bước 1: Lấy Site Key từ Google reCAPTCHA Console
1. Truy cập: https://www.google.com/recaptcha/admin
2. Tạo site mới với reCAPTCHA v2 Invisible hoặc v3
3. Lấy Site Key

### Bước 2: Thêm Site Key vào ứng dụng
Thêm vào file config hoặc environment variables:
```javascript
// Trong file config hoặc .env
window.RECAPTCHA_SITE_KEY = 'your-site-key-here';
```

### Bước 3: Load Google reCAPTCHA Script
Thêm vào HTML layout (thường trong `app/views/layouts/application.html.erb`):

```html
<!-- Cho reCAPTCHA v2 Invisible -->
<script src="https://www.google.com/recaptcha/api.js" async defer></script>

<!-- Hoặc cho reCAPTCHA v3 -->
<script src="https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY" async defer></script>
```

## 2. Cách hoạt động

### Flow tự động:
1. User login thành công
2. `setUser` action được gọi
3. `autoStartShipXanhAuth` được dispatch
4. `getCaptchaToken` được gọi để lấy reCAPTCHA token
5. Token được truyền vào `shipxanhTokenScheduler.start()`

### Xử lý lỗi:
- Nếu reCAPTCHA fail → fallback về empty token
- Nếu reCAPTCHA chưa load → log warning và continue
- Không block user experience

## 3. Tùy chỉnh

### Thay đổi action name:
```javascript
// Trong getCaptchaToken action
action: 'your_custom_action_name'
```

### Thay đổi site key source:
```javascript
// Thay vì window.RECAPTCHA_SITE_KEY
process.env.VUE_APP_RECAPTCHA_SITE_KEY
// hoặc
import.meta.env.VITE_RECAPTCHA_SITE_KEY
```

## 4. Testing

### Development:
- Dùng test site key của Google: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`
- Test key sẽ luôn pass validation

### Production:
- Dùng real site key
- Verify token ở backend

## 5. Backend Integration

Backend cần verify reCAPTCHA token:
```ruby
# Trong controller hoặc service
def verify_recaptcha_token(token)
  uri = URI('https://www.google.com/recaptcha/api/siteverify')
  response = Net::HTTP.post_form(uri, {
    'secret' => ENV['RECAPTCHA_SECRET_KEY'],
    'response' => token
  })
  
  result = JSON.parse(response.body)
  result['success']
end
```

## 6. Troubleshooting

### reCAPTCHA không load:
- Kiểm tra network requests
- Verify site key đúng
- Kiểm tra domain whitelist

### Token empty:
- Kiểm tra console errors
- Verify grecaptcha.ready() được gọi
- Kiểm tra site key configuration
