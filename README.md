# My Website
已于2025/9/25 14：35暂时关闭服务器
这是一个全栈Web应用程序，包含以下功能：
- 用户注册/登录系统
- 数据管理（创建、读取、更新、删除）
- 实时通信功能
- 文件上传/下载
- 任务管理/待办事项

## 技术栈

### 前端
- React.js
- Socket.IO Client

### 后端
- Node.js
- Express.js
- MongoDB (Mongoose)
- Socket.IO
- JWT for authentication
- Multer for file uploads

## 安装和运行

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
## 功能说明

### 用户系统
- 用户可以注册账户
- 用户可以登录系统
- 使用 JWT 进行身份验证

### 任务管理
- 创建新任务
- 查看所有任务
- 更新任务状态
- 删除任务

### 文件上传
- 上传文件到服务器
- 文件存储在服务器的 uploads 目录中

### 实时通信
- 简单的聊天功能
- 使用 Socket.IO 实现实时消息传递

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
