# 混合部署方案：使网站在中国大陆可访问

## 项目架构分析

当前项目采用前后端分离架构：
- 前端：React.js 应用，通过 Vite 构建
- 后端：Node.js + Express.js API 服务，包含 WebSocket 实时通信功能
- 数据库：MongoDB

## 部署组件划分

为了在中国大陆访问，建议采用以下混合部署方案：

### 部署到中国大陆服务器的组件：
1. **后端 API 服务** (`server/`)
   - 包含所有 REST API 接口
   - 用户认证 (JWT)
   - 任务管理功能
   - 文件上传/下载功能
   - MongoDB 连接

2. **WebSocket 实时通信服务**
   - 集成在后端服务中
   - 聊天功能支持

### 保留在海外服务器的组件：
1. **前端静态资源**
   - React 构建后的静态文件
   - 可继续使用现有的部署方式 (如 Vercel, Netlify)

## 实施步骤

### 1. 准备中国大陆服务器环境
```bash
# 安装 Node.js (推荐使用 v16 或更高版本)
# 安装 MongoDB 或使用云数据库服务 (如阿里云 MongoDB)

# 设置环境变量
export MONGODB_URI="mongodb://localhost:27017/mywebsite"
export JWT_SECRET="your-secret-key"
export PORT=8765
```

### 2. 部署后端服务
```bash
# 复制 server 目录到中国大陆服务器
# 安装依赖
cd server
npm install --production

# 启动服务
npm start
# 或使用 PM2 进行进程管理
# npm install -g pm2
# pm2 start server.js
```

### 3. 配置域名和SSL证书
- 为后端服务申请中国大陆可访问的域名 (如 api.yourdomain.cn)
- 配置 SSL 证书 (推荐使用 Let's Encrypt)
- 配置反向代理 (如 Nginx) 处理 HTTPS 终止

### 4. 修改前端配置
修改 `client/src/utils/api.js` 文件以使用新的后端地址：

```javascript
// 获取API基础URL
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
    // 生产环境中，使用中国大陆部署的后端URL
    return 'https://api.yourdomain.cn';  // 修改为您的中国大陆域名
  }
  
  // 默认返回本地地址
  return 'http://localhost:8765';
};
```

### 5. 处理跨域问题
在后端 `server.js` 中确保 CORS 配置正确：

```javascript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : true,
  credentials: true
}));
```

### 6. 文件上传路径处理
确保文件上传路径在中国大陆服务器上正确处理：

```javascript
// 提供上传文件的静态访问
app.use('/uploads', express.static('uploads'));
```

### 7. 部署前端静态资源
前端可以继续部署在海外服务器，只需确保 API 请求指向中国大陆的后端服务。

## 注意事项

1. **ICP备案**：如果使用中国大陆的服务器和域名，需要完成 ICP 备案
2. **网络延迟**：前端和后端分离部署可能产生跨地域网络延迟
3. **安全性**：确保所有 API 接口都有适当的身份验证和授权检查
4. **监控和日志**：在中国大陆部署的服务需要适当的监控和日志记录