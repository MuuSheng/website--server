const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss');
const validator = require('./validation');
const fs = require('fs');

// 初始化 Express 应用
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : "*",
    methods: ["GET", "POST"]
  }
});

// 设置安全头部，但对图片请求放宽限制
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "https:", "http:"], // 允许图片从任何源加载
    },
    useDefaults: true,
  },
}));

// 在静态文件服务之前添加一个简单的日志中间件，记录所有请求
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// 提供上传文件的静态访问
const uploadsPath = path.join(__dirname, 'uploads');
console.log('Setting up static file serving for uploads directory:', uploadsPath);

// 确保uploads目录存在
if (!fs.existsSync(uploadsPath)) {
  console.log('Uploads directory does not exist, creating it...');
  fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use('/uploads', express.static(uploadsPath, {
  maxAge: '1d', // 设置缓存时间
  etag: true,   // 启用ETag
  lastModified: true, // 启用Last-Modified头
  cacheControl: true, // 启用Cache-Control头
  dotfiles: 'ignore', // 忽略点文件
  index: false,       // 禁用目录索引
  redirect: false     // 禁用重定向
}));

// 添加一个简单的路由来测试uploads目录是否可访问
app.get('/uploads-test', (req, res) => {
  try {
    if (!fs.existsSync(uploadsPath)) {
      return res.json({ status: 'error', message: 'Uploads directory does not exist' });
    }
    
    const files = fs.readdirSync(uploadsPath);
    res.json({ 
      status: 'success', 
      message: 'Uploads directory is accessible', 
      files: files,
      path: uploadsPath
    });
  } catch (error) {
    res.json({ status: 'error', message: error.message });
  }
});

// 速率限制 - 登录/注册限制（更严格）
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 限制每个IP在窗口期内最多5次登录/注册尝试
  message: '登录/注册尝试次数过多，请稍后再试',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// 应用到认证路由
app.use('/api/register', authLimiter);
app.use('/api/login', authLimiter);

// 中间件
app.use(express.json());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : true,
  credentials: true
}));

// 输入清理中间件
app.use((req, res, next) => {
  // 清理请求体中的字符串字段
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    }
  }
  
  // 清理查询参数中的字符串字段
  if (req.query && typeof req.query === 'object') {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = xss(req.query[key]);
      }
    }
  }
  
  next();
});

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    // 确保上传目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('Created uploads directory at:', uploadDir);
    }
    console.log('Saving file to directory:', uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const filename = Date.now() + path.extname(file.originalname);
    console.log('Saving file with name:', filename);
    cb(null, filename);
  }
});
const upload = multer({ storage });

// 提供上传文件的静态访问
// 使用之前已声明的uploadsPath变量
console.log('Setting up static file serving for uploads directory:', uploadsPath);

// 确保uploads目录存在
if (!fs.existsSync(uploadsPath)) {
  console.log('Uploads directory does not exist, creating it...');
  fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use('/uploads', express.static(uploadsPath, {
  maxAge: '1d', // 设置缓存时间
  etag: true,   // 启用ETag
  lastModified: true, // 启用Last-Modified头
  cacheControl: true, // 启用Cache-Control头
  dotfiles: 'ignore', // 忽略点文件
  index: false,       // 禁用目录索引
  redirect: false     // 禁用重定向
}));

// 添加一个简单的路由来测试uploads目录是否可访问
app.get('/uploads-test', (req, res) => {
  try {
    if (!fs.existsSync(uploadsPath)) {
      return res.json({ status: 'error', message: 'Uploads directory does not exist' });
    }
    
    const files = fs.readdirSync(uploadsPath);
    res.json({ 
      status: 'success', 
      message: 'Uploads directory is accessible', 
      files: files,
      path: uploadsPath
    });
  } catch (error) {
    res.json({ status: 'error', message: error.message });
  }
});

// MongoDB 连接
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mywebsite';
mongoose.connect(MONGODB_URI, {
  // 新版本的MongoDB驱动不再需要这些选项
}).then(() => {
  console.log('Connected to MongoDB');
  
  // 确保uploads目录存在并设置正确的权限
  const fs = require('fs');
  
  // 使用同步方法确保目录存在
  if (!fs.existsSync(uploadsPath)) {
    try {
      fs.mkdirSync(uploadsPath, { recursive: true });
      console.log('Created uploads directory at:', uploadsPath);
      
      // 在非Windows系统上设置目录权限
      if (process.platform !== 'win32') {
        fs.chmodSync(uploadsPath, 0o755);
        console.log('Set permissions for uploads directory');
      }
    } catch (err) {
      console.error('Failed to create uploads directory:', err);
    }
  } else {
    console.log('Uploads directory already exists at:', uploadsPath);
    
    // 检查目录权限
    try {
      const stats = fs.statSync(uploadsPath);
      console.log('Uploads directory permissions:', stats.mode);
    } catch (err) {
      console.error('Failed to check uploads directory permissions:', err);
    }
  }
  
  // 启动服务器（只在这里启动一次）
  const PORT = process.env.PORT || 8765;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Uploads directory path:', uploadsPath);
    
    // 验证uploads目录中是否有文件
    try {
      const files = fs.readdirSync(uploadsPath);
      console.log('Files in uploads directory:', files);
    } catch (err) {
      console.error('Failed to read uploads directory:', err);
    }
  });
}).catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

// 用户模型
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});
const User = mongoose.model('User', userSchema);

// 任务模型
const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  completed: Boolean
});
const Task = mongoose.model('Task', taskSchema);

// JWT 密钥
const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey';

// 注册路由
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Register request:', { username, password });
    
    // 验证用户名
    const usernameValidation = validator.validateUsername(username);
    if (!usernameValidation.isValid) {
      return res.status(400).send(usernameValidation.message);
    }
    
    // 验证密码
    const passwordValidation = validator.validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).send(passwordValidation.message);
    }
    
    // 检查用户是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send('用户名已存在');
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    console.log('User registered successfully:', username);
    res.status(201).send('用户注册成功');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('注册用户时出错: ' + error.message);
  }
});

// 登录路由
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 验证输入
    if (!username || !password) {
      return res.status(400).send('用户名和密码不能为空');
    }
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).send('无效的凭据');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send('无效的凭据');
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.json({ token });
  } catch (error) {
    res.status(500).send('登录时出错');
  }
});

// 文件上传路由
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  res.json({ filePath: req.file.path });
});

// 文件列表路由（支持搜索）
app.get('/api/files', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const uploadDir = path.join(__dirname, 'uploads');
  const search = req.query.search || '';

  try {
    // 检查目录是否存在
    if (!fs.existsSync(uploadDir)) {
      console.log('Uploads directory does not exist, creating it...');
      fs.mkdirSync(uploadDir, { recursive: true });
      return res.json({ files: [] });
    }

    const files = fs.readdirSync(uploadDir);
    const fileDetails = [];

    files.forEach(file => {
      try {
        // 如果有搜索词，检查文件名是否匹配
        if (search && !file.toLowerCase().includes(search.toLowerCase())) {
          return; // 不匹配搜索词，跳过
        }
        
        const filePath = path.join(uploadDir, file);
        const stats = fs.statSync(filePath);
        if (!stats.isDirectory()) {
          fileDetails.push({
            name: file,
            size: stats.size,
            uploadDate: stats.birthtime,
            type: 'file'
          });
        }
      } catch (err) {
        console.error(`Error reading file ${file}:`, err);
      }
    });

    res.json({ files: fileDetails });
  } catch (error) {
    console.error('Error reading uploads directory:', error);
    // 即使出错也返回空数组而不是500错误
    res.json({ files: [] });
  }
});

// 图片文件列表路由
app.get('/api/images', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const uploadDir = path.join(__dirname, 'uploads');

  try {
    // 检查目录是否存在
    if (!fs.existsSync(uploadDir)) {
      console.log('Uploads directory does not exist, creating it...');
      fs.mkdirSync(uploadDir, { recursive: true });
      return res.json({ images: [] });
    }

    const files = fs.readdirSync(uploadDir);
    const imageFiles = [];

    files.forEach(file => {
      try {
        const filePath = path.join(uploadDir, file);
        const stats = fs.statSync(filePath);
        // 检查文件是否为图片
        const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file);
        if (isImage && !stats.isDirectory()) {
          imageFiles.push({
            name: file,
            size: stats.size,
            uploadDate: stats.birthtime
          });
        }
      } catch (err) {
        console.error(`Error reading file ${file}:`, err);
      }
    });

    res.json({ images: imageFiles });
  } catch (error) {
    console.error('Error reading uploads directory:', error);
    // 即使出错也返回空数组而不是500错误
    res.json({ images: [] });
  }
});

// 任务管理路由
// 创建任务
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description } = req.body;
    
    // 验证任务标题
    const titleValidation = validator.validateTaskTitle(title);
    if (!titleValidation.isValid) {
      return res.status(400).send(titleValidation.message);
    }
    
    // 验证任务描述
    const descriptionValidation = validator.validateTaskDescription(description);
    if (!descriptionValidation.isValid) {
      return res.status(400).send(descriptionValidation.message);
    }
    
    const task = new Task({ title, description, completed: false });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).send('创建任务时出错');
  }
});

// 获取所有任务（支持分页和搜索）
app.get('/api/tasks', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;
    
    // 构建搜索条件
    const searchFilter = search 
      ? { 
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ]
        } 
      : {};
    
    const tasks = await Task.find(searchFilter).skip(skip).limit(limit);
    const totalTasks = await Task.countDocuments(searchFilter);
    
    res.json({
      tasks,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalTasks / limit),
        totalTasks,
        hasNextPage: page < Math.ceil(totalTasks / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).send('获取任务时出错');
  }
});

// 更新任务
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;
    
    // 如果提供了标题，则验证它
    if (title !== undefined) {
      const titleValidation = validator.validateTaskTitle(title);
      if (!titleValidation.isValid) {
        return res.status(400).send(titleValidation.message);
      }
    }
    
    // 如果提供了描述，则验证它
    if (description !== undefined) {
      const descriptionValidation = validator.validateTaskDescription(description);
      if (!descriptionValidation.isValid) {
        return res.status(400).send(descriptionValidation.message);
      }
    }
    
    // 验证completed字段（如果提供）
    if (completed !== undefined && typeof completed !== 'boolean') {
      return res.status(400).send('completed字段必须是布尔值');
    }
    
    const task = await Task.findByIdAndUpdate(id, { title, description, completed }, { new: true });
    if (!task) {
      return res.status(404).send('任务未找到');
    }
    res.json(task);
  } catch (error) {
    res.status(500).send('更新任务时出错');
  }
});

// 删除任务
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Task.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).send('Error deleting task');
  }
});

// 实时通信
io.on('connection', (socket) => {
  console.log('User connected');
  
  // 监听用户加入聊天
  socket.on('join', (username) => {
    socket.username = username;
    console.log(`${username} joined the chat`);
  });
  
  // 监听客户端发送的消息
  socket.on('message', (msg) => {
    console.log('Message received:', msg);
    // 将消息和用户名广播给所有连接的客户端
    io.emit('message', {
      username: socket.username || 'Anonymous',
      text: msg,
      timestamp: new Date()
    });
  });
  
  socket.on('disconnect', () => {
    console.log(`${socket.username || 'User'} disconnected`);
  });
});

// 启动服务器（已移至此处避免重复启动）
const PORT = process.env.PORT || 8765;
// server.listen(PORT, '0.0.0.0', () => {
//   console.log(`Server is running on port ${PORT}`);
//   console.log('Uploads directory path:', uploadsPath);
//   
//   // 验证uploads目录中是否有文件
//   try {
//     const files = fs.readdirSync(uploadsPath);
//     console.log('Files in uploads directory:', files);
//   } catch (err) {
//     console.error('Failed to read uploads directory:', err);
//   }
// });