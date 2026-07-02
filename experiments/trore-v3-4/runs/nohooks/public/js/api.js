const API_BASE = '/api';

class TroreAPI {
  static async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    
    // Ensure headers object exists
    options.headers = options.headers || {};
    
    // Automatically attach the X-Trore-Auth header
    options.headers['X-Trore-Auth'] = 'v3-4-case-study';
    
    // Default Content-Type if body is provided and is an object
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      options.body = JSON.stringify(options.body);
      options.headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, options);
      
      let responseData;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = { message: await response.text() };
      }

      if (!response.ok) {
        const error = new Error(responseData.message || responseData.error || 'API request failed');
        error.status = response.status;
        error.details = responseData;
        throw error;
      }
      
      return responseData;
    } catch (err) {
      console.error(`API Error on ${url}:`, err);
      throw err;
    }
  }

  static get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  static post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  static put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  static delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

// Export for ES modules, or bind to window for standard scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TroreAPI;
} else {
  window.TroreAPI = TroreAPI;
}
