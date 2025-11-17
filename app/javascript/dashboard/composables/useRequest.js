// useRequest.js
import { ref } from 'vue';

export function useRequest(requestFn, options = {}) {
  const data = ref(null);
  const error = ref(null);
  const isLoading = ref(false);

  const execute = async (...args) => {
    isLoading.value = true;
    error.value = null;
    try {
      const result = await requestFn(...args); // <-- async/await ở đây
      data.value = result;
      return result;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // tự động chạy nếu options.immediate = true
  if (options.immediate) {
    execute();
  }

  return { data, error, isLoading, execute };
}
