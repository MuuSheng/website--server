# 使用官方 Node.js 运行时作为父镜像
FROM node:18

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制应用的其余源代码
COPY . .

# 创建 uploads 目录
RUN mkdir -p uploads

# 应用的端口在 Dockerfile 中暴露
EXPOSE 26314

# 定义运行时的环境变量（可被 Railway 覆盖）
ENV PORT=26314

# 启动应用
CMD ["npm", "start"]