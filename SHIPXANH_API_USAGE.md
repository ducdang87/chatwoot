# 🚀 ShipXanh API Service Usage Guide

## 📋 **Service đã tạo:**

### File: `app/javascript/dashboard/api/shipxanhAPI.js`

## 🔧 **Cách sử dụng:**

### 1. **Import service**
```javascript
import shipxanhAPI from 'dashboard/api/shipxanhAPI';
```

### 2. **Lấy thông tin order**
```javascript
// Lấy order theo ID
async function getOrderDetails(orderId) {
  try {
    const orderData = await shipxanhAPI.getOrderInfo(orderId);
    console.log('Order data:', orderData);
    return orderData;
  } catch (error) {
    console.error('Failed to get order:', error.message);
  }
}

// Sử dụng
getOrderDetails('12345');
```

### 3. **Lấy danh sách orders**
```javascript
// Lấy tất cả orders
const orders = await shipxanhAPI.getOrders();

// Lấy orders với filter
const filteredOrders = await shipxanhAPI.getOrders({
  status: 'pending',
  limit: 10,
  page: 1
});
```

### 4. **Generic API calls**
```javascript
// GET request
const data = await shipxanhAPI.get('/inventory/products');

// POST request
const newOrder = await shipxanhAPI.post('/inventory/orders', {
  customerId: '123',
  items: [...]
});

// PUT request
const updatedOrder = await shipxanhAPI.put('/inventory/orders/123', {
  status: 'completed'
});

// DELETE request
await shipxanhAPI.delete('/inventory/orders/123');
```

### 5. **Kiểm tra token hợp lệ**
```javascript
const isValid = await shipxanhAPI.validateToken();
if (!isValid) {
  // Redirect to re-authenticate
  console.log('Token expired, need to re-authenticate');
}
```

## 🔐 **Token Management:**

### **Format token trong localStorage:**
```javascript
{
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  organizationId: 1428
}
```

### **Headers được gửi tự động:**
```javascript
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json",
  "X-Organization-Id": "1428"
}
```

## 🛠️ **Error Handling:**

### **Authentication Error (401):**
```javascript
try {
  const data = await shipxanhAPI.get('/some-endpoint');
} catch (error) {
  if (error.message.includes('Authentication failed')) {
    // Token expired, cần authenticate lại
    // Có thể dispatch action để re-authenticate
  }
}
```

### **Network/Other Errors:**
```javascript
try {
  const data = await shipxanhAPI.get('/some-endpoint');
} catch (error) {
  console.error('API Error:', error);
  // Handle error appropriately
}
```

## 📝 **Ví dụ trong Vue Component:**

```vue
<template>
  <div>
    <div v-if="loading">Loading order...</div>
    <div v-else-if="orderData">
      <h3>Order #{{ orderData.id }}</h3>
      <p>Status: {{ orderData.status }}</p>
      <!-- Display order details -->
    </div>
    <div v-else-if="error">
      Error: {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import shipxanhAPI from 'dashboard/api/shipxanhAPI';

const orderData = ref(null);
const loading = ref(false);
const error = ref(null);

const fetchOrder = async (orderId) => {
  loading.value = true;
  error.value = null;
  
  try {
    orderData.value = await shipxanhAPI.getOrderInfo(orderId);
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  const orderId = '12345'; // Get from props or route
  fetchOrder(orderId);
});
</script>
```

## 🚨 **Lưu ý quan trọng:**

1. **Token tự động:** Service tự động lấy token từ localStorage
2. **Error handling:** Luôn wrap trong try-catch
3. **Authentication:** Nếu 401 error, cần re-authenticate
4. **Base URL:** Hiện tại point tới `https://prod-api.shipxanh.com`
5. **Organization ID:** Tự động thêm vào header từ token data

## 🔄 **Integration với Auth Flow:**

Token được tự động lưu khi `shipxanhTokenScheduler` chạy thành công. Service này sẽ tự động sử dụng token đó cho các API calls.
