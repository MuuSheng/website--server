# 项目概述

这是一个全栈Web应用程序，包含用户注册/登录系统、任务管理、文件上传/下载、实时通信等功能。

## 技术栈

### 前端
- React.js (v19.1.1)
- Vite (v7.1.7)
- Socket.IO Client (v4.8.1)

### 后端
- Node.js
- Express.js (v4.18.2)
- MongoDB (通过 Mongoose v7.5.0)
- Socket.IO (v4.7.2)
- JWT for authentication
- Multer for file uploads

## 项目结构

```
my-website/
├── client/                 # 前端 React 应用
│   ├── src/
│   │   ├── components/     # React 组件
│   │   └── App.js          # 主应用组件
│   └── package.json        # 客户端依赖
├── server/                 # 后端 Node.js 应用
│   ├── uploads/            # 上传文件存储目录
│   ├── server.js           # 服务端入口文件
│   └── package.json        # 服务端依赖
└── README.md               # 项目说明文档
```

## 构建和运行

### 前提条件
- Node.js (v14 或更高版本)
- MongoDB 数据库

### 安装步骤

1. 克隆仓库或复制项目文件到本地目录

2. 安装服务端依赖：
   ```bash
   cd server
   npm install
   ```

3. 安装客户端依赖：
   ```bash
   cd client
   npm install
   ```

### 运行应用

1. 确保 MongoDB 数据库正在运行

2. 启动服务端：
   ```bash
   cd server
   npm run dev
   ```

3. 启动客户端：
   ```bash
   cd client
   npm run dev
   ```

### 测试

- 后端测试：在 `server` 目录下运行 `npm test`
- 前端测试：在 `client` 目录下运行 `npm test`

## 开发约定

### 后端开发约定
- 使用 Express.js 框架
- 使用 Mongoose 进行 MongoDB 数据建模
- 使用 JWT 进行用户身份验证
- 使用 Multer 处理文件上传
- 实现了基本的安全措施，如 Helmet、CORS、速率限制和 XSS 防护
- 使用自定义验证函数验证用户输入

### 前端开发约定
- 使用 React.js (v19.1.1) 和 Vite (v7.1.7)
- 使用函数组件和 Hooks
- 使用 Socket.IO Client 实现实时通信
- 使用 ErrorBoundary 处理组件错误
- 使用 Context API 管理主题状态
- 组件化开发，将功能拆分为独立的组件

### 代码质量
- 后端使用 ESLint 进行代码检查
- 前端使用 ESLint 和 Prettier 进行代码检查和格式化