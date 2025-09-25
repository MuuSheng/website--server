// 获取API基础URL
// 在生产环境中，这将通过环境变量设置
const getApiBaseUrl = () => {
  // 检查是否有环境变量设置
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // 在浏览器环境中根据当前域名确定API地址
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // 如果是本地开发环境
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8765';
    }
    // 生产环境中，使用Render部署的后端URL
    return 'https://website-api-louy.onrender.com';
  }
  
  // 默认返回本地地址
  return 'http://localhost:8765';
};

export const API_BASE_URL = getApiBaseUrl();

// 获取Socket.IO服务器地址
// 在生产环境中，这通常与API服务器相同
export const SOCKET_IO_URL = API_BASE_URL || window.location.origin;

// 创建一个带错误处理的fetch包装函数
export const apiFetch = async (url, options = {}) => {
  const fullUrl = `${API_BASE_URL}${url}`;
  
  // 设置默认选项
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };
  
  try {
    const response = await fetch(fullUrl, defaultOptions);
    return response;
  } catch (error) {
    // 如果是HTTPS连接失败，尝试HTTP（仅在开发环境中）
    if (error.name === 'TypeError' && fullUrl.startsWith('https://') && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      try {
        const httpUrl = fullUrl.replace('https://', 'http://');
        const response = await fetch(httpUrl, defaultOptions);
        console.warn('HTTPS connection failed, fell back to HTTP:', fullUrl);
        return response;
      } catch (httpError) {
        throw new Error(`Network error: ${error.message} (Also tried HTTP fallback)`);
      }
    }
    throw error;
  }
};