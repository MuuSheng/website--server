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
      return 'http://localhost:26314';
    }
    // 局域网访问时，使用当前主机名和端口
    return `http://${hostname}:26314`;
  }
  
  // 默认返回本地地址
  return 'http://localhost:26314';
};

export const API_BASE_URL = getApiBaseUrl();

// 获取Socket.IO服务器地址
// 在生产环境中，这通常与API服务器相同
export const SOCKET_IO_URL = API_BASE_URL || window.location.origin;